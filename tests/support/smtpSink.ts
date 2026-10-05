import { generateKeyPairSync, randomBytes, sign } from 'node:crypto';
import type { Socket } from 'node:net';
import type { AddressInfo } from 'node:net';
import { SMTPServer, type SMTPServerSession } from 'smtp-server';

/*
 * A loopback SMTP sink for the delivery tests (WP3-T09). It listens on 127.0.0.1 only, on an
 * ephemeral port, with STARTTLS (or implicit TLS) and a throwaway self-signed certificate made
 * in memory for this process: nothing is read from or written to disk and no real mail can
 * leave the machine. A behaviour switch injects each failure point of the docs/05 table:
 * explicit temporary/permanent rejections, a connection lost before DATA, a connection lost
 * after the whole message was transferred (no reply), or a reply that never comes.
 */

export type SinkBehaviour =
  | 'accept'
  | 'reject_rcpt_temporary'
  | 'reject_rcpt_permanent'
  | 'reject_data_temporary'
  | 'reject_data_permanent'
  | 'drop_before_data'
  | 'drop_after_data'
  | 'hang_after_data';

export interface SinkMessage {
  from: string;
  to: string[];
  raw: Buffer;
}

export interface SmtpSink {
  port: number;
  /** PEM of the in-memory certificate, to be trusted by the client under test. */
  ca: string;
  /** Messages fully received (whatever the reply was). */
  messages: SinkMessage[];
  /** MAIL FROM commands seen: every transaction attempt, accepted or not. */
  transactions: number;
  /** Successful AUTH logins. */
  logins: number;
  setBehaviour(behaviour: SinkBehaviour): void;
  /** Resolves when the next message has been fully received by the sink. */
  nextMessage(): Promise<SinkMessage>;
  close(): Promise<void>;
}

export interface SinkOptions {
  behaviour?: SinkBehaviour;
  /** Required credentials; AUTH is optional when omitted. */
  auth?: { user: string; pass: string };
  /** Implicit TLS instead of STARTTLS. */
  implicitTls?: boolean;
}

// ---------------------------------------------------------------- certificate (DER) ----

function derLength(length: number): Buffer {
  if (length < 0x80) return Buffer.from([length]);
  const bytes: number[] = [];
  for (let rest = length; rest > 0; rest >>= 8) bytes.unshift(rest & 0xff);
  return Buffer.from([0x80 | bytes.length, ...bytes]);
}

const tlv = (tag: number, ...content: Buffer[]): Buffer => {
  const body = Buffer.concat(content);
  return Buffer.concat([Buffer.from([tag]), derLength(body.length), body]);
};
const seq = (...items: Buffer[]) => tlv(0x30, ...items);
const oid = (hex: string) => tlv(0x06, Buffer.from(hex, 'hex'));
const ECDSA_SHA256 = oid('2a8648ce3d040302'); // 1.2.840.10045.4.3.2
const COMMON_NAME = oid('550403'); // 2.5.4.3

function utcTime(date: Date): Buffer {
  const text = date.toISOString().replace(/[-:T]/g, '').slice(2, 14) + 'Z';
  return tlv(0x17, Buffer.from(text, 'ascii'));
}

/** A self-signed P-256 certificate for localhost and 127.0.0.1, valid around the real current time. */
function makeCertificate(): { key: string; cert: string } {
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const name = seq(tlv(0x31, seq(COMMON_NAME, tlv(0x0c, Buffer.from('localhost')))));
  const serial = randomBytes(8);
  serial[0] = ((serial[0] ?? 0) & 0x7f) | 0x01; // positive, non-zero
  const now = Date.now();
  const subjectAltName = seq(tlv(0x82, Buffer.from('localhost')), tlv(0x87, Buffer.from([127, 0, 0, 1])));
  const extensions = tlv(
    0xa3,
    seq(
      seq(oid('551d11'), tlv(0x04, subjectAltName)),
      seq(oid('551d13'), tlv(0x01, Buffer.from([0xff])), tlv(0x04, seq(tlv(0x01, Buffer.from([0xff]))))),
    ),
  );
  const tbs = seq(
    tlv(0xa0, tlv(0x02, Buffer.from([2]))),
    tlv(0x02, serial),
    seq(ECDSA_SHA256),
    name,
    seq(utcTime(new Date(now - 3_600_000)), utcTime(new Date(now + 86_400_000))),
    name,
    publicKey.export({ type: 'spki', format: 'der' }),
    extensions,
  );
  const signature = sign('sha256', tbs, privateKey);
  const der = seq(tbs, seq(ECDSA_SHA256), tlv(0x03, Buffer.from([0]), signature));
  const base64 = der.toString('base64').replace(/(.{64})/g, '$1\n').replace(/\n$/, '');
  return {
    key: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    cert: `-----BEGIN CERTIFICATE-----\n${base64}\n-----END CERTIFICATE-----\n`,
  };
}

// ---------------------------------------------------------------------------- sink ----

function smtpError(code: number, message: string): Error & { responseCode: number } {
  return Object.assign(new Error(message), { responseCode: code });
}

export async function startSmtpSink(options: SinkOptions = {}): Promise<SmtpSink> {
  const { key, cert } = makeCertificate();
  let behaviour: SinkBehaviour = options.behaviour ?? 'accept';
  const sockets = new Set<Socket>();
  const waiters: Array<(message: SinkMessage) => void> = [];
  let queued = 0;

  const dropConnection = (session: SMTPServerSession): void => {
    for (const socket of sockets) if (socket.remotePort === session.remotePort) socket.destroy();
  };

  const state = { messages: [] as SinkMessage[], transactions: 0, logins: 0 };
  const server = new SMTPServer({
    key,
    cert,
    minVersion: 'TLSv1.2',
    secure: options.implicitTls ?? false,
    logger: false,
    banner: 'loopback test sink',
    authMethods: ['PLAIN', 'LOGIN'],
    authOptional: options.auth === undefined,
    disabledCommands: options.auth === undefined ? ['AUTH'] : [],
    onAuth(auth, _session, callback) {
      if (options.auth !== undefined && auth.username === options.auth.user && auth.password === options.auth.pass) {
        state.logins += 1;
        callback(null, { user: 'sink-user' });
        return;
      }
      callback(smtpError(535, 'Authentication failed'));
    },
    onMailFrom(_address, session, callback) {
      state.transactions += 1;
      if (behaviour === 'drop_before_data') {
        dropConnection(session);
        return;
      }
      callback();
    },
    onRcptTo(_address, _session, callback) {
      if (behaviour === 'reject_rcpt_temporary') return callback(smtpError(451, 'Try again later'));
      if (behaviour === 'reject_rcpt_permanent') return callback(smtpError(550, 'No such user here'));
      return callback();
    },
    onData(stream, session, callback) {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => {
        const envelope = session.envelope;
        const message: SinkMessage = {
          from: envelope.mailFrom === false ? '' : envelope.mailFrom.address,
          to: envelope.rcptTo.map((item) => item.address),
          raw: Buffer.concat(chunks),
        };
        state.messages.push(message);
        for (const waiter of waiters.splice(0)) waiter(message);
        if (behaviour === 'drop_after_data') return dropConnection(session);
        if (behaviour === 'hang_after_data') return undefined;
        if (behaviour === 'reject_data_temporary') return callback(smtpError(451, 'Local error in processing'));
        if (behaviour === 'reject_data_permanent') return callback(smtpError(554, 'Transaction failed'));
        queued += 1;
        return callback(null, `OK: queued as SINK${String(queued).padStart(4, '0')}`);
      });
    },
  });
  server.server.on('connection', (socket: Socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });
  server.on('error', () => undefined); // dropped test connections are expected
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.server.address() as AddressInfo).port;

  return {
    port,
    ca: cert,
    get messages() {
      return state.messages;
    },
    get transactions() {
      return state.transactions;
    },
    get logins() {
      return state.logins;
    },
    setBehaviour(next) {
      behaviour = next;
    },
    nextMessage() {
      return new Promise((resolve) => waiters.push(resolve));
    },
    close() {
      for (const socket of sockets) socket.destroy();
      return new Promise((resolve) => server.close(() => resolve()));
    },
  };
}
