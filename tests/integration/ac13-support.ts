import { type ChildProcess, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { captureFolder } from '../../src/server/mail/captureAdapter.ts';

/*
 * Support for the AC-13 integrated two-week scenario (ac13-two-week.test.ts): the crash runner for the
 * restart around the send, the reader of captured messages and the h:mm formatter. Everything is synthetic;
 * nothing here reads the wall clock, a network port or a user profile.
 */

/** Exit code the crash runner ends with once `sending` is committed, so the test can tell the crash point apart. */
export const CRASH_EXIT_CODE = 86;

/** h:mm of whole minutes, as the review, the e-mail and the PDF write an OT total. */
export function hm(minutes: number): string {
  return `${Math.trunc(minutes / 60)}:${String(Math.abs(minutes % 60)).padStart(2, '0')}`;
}

export const sha256Hex = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

export interface CapturedMessage {
  /** The capture folder name: the delivery attempt id (a submission) or the job id (a notice). */
  id: string;
  metadata: { message_id: string; envelope: { from: string; to: string[] }; pdf_sha256?: string };
  eml: string;
  /** The captured attachment bytes; null for a notice. */
  pdf: Buffer | null;
}

/** Every capture folder of the private data directory, in name order (folders still being written are ignored). */
export function listCaptured(dataDir: string): CapturedMessage[] {
  const root = join(dataDir, 'mail-capture');
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.tmp-'))
    .map((entry) => entry.name)
    .sort()
    .map((id) => {
      const folder = captureFolder(dataDir, id);
      return {
        id,
        metadata: JSON.parse(readFileSync(join(folder, 'metadata.json'), 'utf8')) as CapturedMessage['metadata'],
        eml: readFileSync(join(folder, 'message.eml'), 'utf8'),
        pdf: existsSync(join(folder, 'attachment.pdf')) ? readFileSync(join(folder, 'attachment.pdf')) : null,
      };
    });
}

/** The folder names of the capture directory only (cheap before/after comparison). */
export function capturedIds(dataDir: string): string[] {
  return listCaptured(dataDir).map((message) => message.id);
}

/**
 * A runner process that claims the send job, commits `sending` and ends the whole process before the adapter is called
 * (the crash window of docs/05 "Durable delivery"). It is a file run by path, with an explicit configuration object, an
 * injected clock and the same TypeScript sources as the tests; it ends with CRASH_EXIT_CODE from inside the test hook.
 */
const CRASH_RUNNER = String.raw`
const src = process.env.T_SRC;
const { openDatabase } = await import(new URL('db/database.ts', src).href);
const { FileStore } = await import(new URL('files/fileStore.ts', src).href);
const { runJobsOnce } = await import(new URL('jobs/runner.ts', src).href);
const { createSendJobHandler } = await import(new URL('jobs/sendJob.ts', src).href);
const { createOutboundAdapter } = await import(new URL('mail/outbound.ts', src).href);
const { loadDeliveryConfig } = await import(new URL('config.ts', src).href);
const db = openDatabase(process.env.T_DB);
const clock = { now: () => new Date(process.env.T_NOW) };
const files = new FileStore(process.env.T_DATA);
const delivery = loadDeliveryConfig({ MAIL_FROM: process.env.T_SENDER, DATA_DIR: process.env.T_DATA }, { databasePath: process.env.T_DB, port: 3000, production: false });
const outbound = createOutboundAdapter(delivery.outbound, { dataDir: process.env.T_DATA });
const hooks = { beforeSend: () => process.exit(Number(process.env.T_CRASH_CODE)) };
const handler = createSendJobHandler({ db, clock, files, outbound, senderAddress: delivery.senderAddress, hooks });
const summary = await runJobsOnce({ db, clock, owner: process.env.T_OWNER, leaseSeconds: 60, handlers: { send_email: handler } });
db.close();
process.stdout.write(JSON.stringify(summary));
`;

export interface CrashRunResult {
  code: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
}

/**
 * Runs the crash runner once at the injected instant and resolves when the process has exited. The script file is
 * written next to the test database, so nothing is created outside the test's own temporary folder.
 */
export function runCrashRunner(options: { folder: string; databasePath: string; dataDir: string; sender: string; owner: string; nowIso: string }): Promise<CrashRunResult> {
  const script = join(options.folder, 'ac13-crash-runner.mjs');
  writeFileSync(script, CRASH_RUNNER);
  const src = new URL('../../src/server/', import.meta.url).href;
  const env: Record<string, string | undefined> = {
    ...process.env,
    T_SRC: src,
    T_DB: options.databasePath,
    T_DATA: options.dataDir,
    T_SENDER: options.sender,
    T_OWNER: options.owner,
    T_NOW: options.nowIso,
    T_CRASH_CODE: String(CRASH_EXIT_CODE),
  };
  const child: ChildProcess = spawn(process.execPath, [script], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  child.stdout?.setEncoding('utf8').on('data', (chunk: string) => (stdout += chunk));
  child.stderr?.setEncoding('utf8').on('data', (chunk: string) => (stderr += chunk));
  return new Promise<CrashRunResult>((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code, signal) => resolve({ code, signal, stdout, stderr }));
  });
}
