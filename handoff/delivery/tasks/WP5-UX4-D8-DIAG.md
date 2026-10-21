# WP5-UX4-D8-DIAG dispatch brief (how a TLS certificate failure is classified)

- **Task.** Mission timesheet-software-readiness, auxiliary read-only lookup
  WP5-UX4-D8-DIAG, package WP5.
- **Profile and routing.** timesheet-planner (effort high, fixed by the profile); requested
  model sonnet; no override. docs/08 row "Plan/diagnose a bounded issue".
- **Base.** HEAD = origin/main = 82d1ab4d8300de139db88dbaa9f7b2d56d2650b0. The working tree
  also holds WP5-UX4-T06's uncommitted docs edits (digest 32432deb…).
- **Do not change** any source, test, doc, script, dependency or board file. Your only
  writes are:
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX4-D8-DIAG/`;
  - scratch files in your task folder.

## Question

The owner answered D-8 a (2026-10-20): keep the current handling of a TLS certificate
failure on real SMTP, and document it.

The original question (board `pending_owner_question`, D-8) was: "[b] treat as a permanent
configuration fault shown at once (subject to the assessment), else keep a and document."

WP5-UX4-T06 documented D-8 a as "a certificate failure is retried as a temporary failure,
then needs intervention". But `src/server/mail/smtpAdapter.ts:46` classes `ETLS` and
`EREQUIRETLS` as permanent (`smtp_tls_failed`). The doc claim holds only if a certificate
verification failure reaches the adapter under another code.

Establish, with evidence, what the code at HEAD actually does with a certificate failure in
each supported security mode:
- implicit TLS (port 465 style);
- STARTTLS (587 style);
- any `requireTLS` setting the config allows.

Cover these failure cases:
- an untrusted or self-signed certificate;
- an expired certificate, if you can produce one cheaply;
- a hostname mismatch.

## Method

1. Read `smtpAdapter.ts`, the config that selects the security mode (`config.ts`), the
   delivery or retry classification (temporary versus permanent, the attempt limits, what
   the owner sees), and the existing tests that touch these codes.
2. **Observe it directly.** In your task folder, write a small Node script that does all of
   the following:
   - start a local TLS or STARTTLS SMTP listener on 127.0.0.1, with a throwaway
     self-signed certificate generated in the task folder (use Node's own crypto, or an
     existing dev dependency; install nothing);
   - call the adapter's send path, or the same nodemailer transport options the adapter
     builds, for each mode and failure case;
   - record the raw error `code`, `command` and message, and the classification the
     adapter returns.

   Use ports 49450-49469. Run the script with Node 24 by its full path. **Run it as a file;
   NO STDIN TO NODE.** Make every server close itself.

   If a direct run is impossible without changing the repository, say so and fall back to
   reading the installed nodemailer source under `node_modules/nodemailer`. Name the exact
   file and line where each code is set.
3. Read the current documentation of D-8, as it stands in the working tree, in these
   files: docs/05, docs/11 §13, docs/12 (around line 60 and the known limits), the pilot
   packet §8, and docs/10's 2026-10-20 entry. For each statement, say whether it is true,
   partly true or false for each mode.

## Results

Write the Results section with:
- a table of mode × failure case, showing the raw code, the adapter classification, and
  what happens next (retry count and timing, or immediate failure; what the owner sees),
  with the source file:line for each;
- per-document verdicts;
- the minimal correct wording for D-8 a "kept and documented", one or two sentences that
  are true for every mode;
- whether a small synthetic test could pin the behaviour without real SMTP. If so, name the
  file, the approach and the expected assertions. Do not write it;
- whether the facts change the premise of the owner's choice. In particular: if
  certificate failures under STARTTLS are already permanent, then a is not "temporary"
  there. If the premise changes, write one neutral question for the owner, with a and b
  restated accurately.

Evidence goes in `handoff/delivery/evidence/WP5-UX4-D8-DIAG/`, `.txt` files only:
- the script output, with no certificate or key material;
- a short listing.

Delete nothing in the repository. Certificates and keys stay in the task folder only.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX4-D8-DIAG`.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
  `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stderr` OR `nul`, NO `rm -r`, NO PID
  KILLS, NO INTERACTIVE SHELLS.**
  - Write scripts with the Write tool.
  - Redirect output to files and read them with Read.
- Node 24 by full path:
  `"$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin/node.exe"`.
- Never touch the data in `%LOCALAPPDATA%\timesheet-dev`. Install nothing.
- Before returning, confirm that no listener or background task is still running.
- If a permission check denies a call, stop and report.

## Return

At most 150 words, beginning 'Self-reported model: ...'. Include:
- the mode × case result in short;
- the doc verdicts;
- the proposed wording;
- the test option;
- whether an owner question is needed.

## Results

Executed by timesheet-planner (model claude-sonnet-5-5). Base 82d1ab4 plus the uncommitted T06 docs.
Nothing in the repository was changed. No deprecation warning appeared in any run.

### What was run

- Probe: `D:\.claude-tmp\timesheet\WP5-UX4-D8-DIAG\probe.mjs` (copy: `evidence/probe-script.txt`), Node
  v24.21.0 by full path, nodemailer 10.0.14, smtp-server 3.19.17. It imports the real
  `createSmtpAdapter` and `classifySmtpFailure` from `src/server/mail/smtpAdapter.ts` (Node type
  stripping), starts a loopback `SMTPServer` with throwaway in-memory certificates on 127.0.0.1:49450-49460, and
  records (1) what Node's bare `tls.connect` reports, (2) a raw `SMTPConnection` built with the
  adapter's exact options (smtpAdapter.ts:79-92), (3) the adapter's returned outcome.
- Driver: `run-all.sh`, one process per scenario. Eleven scenarios, each exit 0; output in
  `evidence/probe-output.txt`. An earlier all-in-one run crashed Node with exit 139 (segmentation
  fault) at the third scenario; the output is kept as `evidence/probe-first-run-segfault-output.txt`.
  The cause was not investigated; each scenario then ran cleanly alone.
- After the runs, `evidence/port-check.txt`: no socket on 49450-49469 is LISTENING (TIME_WAIT only). The probe
  process had exited. The other `node.exe` processes in the task list belong to other sessions.
- Process-rule note: one earlier shell call of mine used `| cat > /dev/null` (a rule breach with no effect
  on the repository); nothing else.

### Table: mode x failure case (observed)

Mode names follow config.ts:164-165: `SMTP_SECURITY` is `starttls` (default) or `tls`; nothing else.
The adapter sets `secure: security === 'tls'` (smtpAdapter.ts:82) and `requireTLS: security === 'starttls'`
(smtpAdapter.ts:83). `requireTLS` is not a separate setting; it is what STARTTLS mode means. The
untrusted case uses the system store (no `trustedCa`); expired and mismatch trust the probe certificate
(`trustedCa`), so only the named defect fails.

| Mode | Case | Node TLS error | Code reaching the adapter (command) | Adapter outcome | Time to outcome |
|---|---|---|---|---|---|
| tls | control: valid, trusted | none | none | accepted `250` | 110 ms |
| tls | untrusted / self-signed | `DEPTH_ZERO_SELF_SIGNED_CERT` | `ESOCKET` (CONN) | failed_temporary `smtp_unavailable` | 5 ms |
| tls | expired | `CERT_HAS_EXPIRED` | `ESOCKET` (CONN) | failed_temporary `smtp_unavailable` | 5 ms |
| tls | hostname mismatch | `ERR_TLS_CERT_ALTNAME_INVALID` | `ESOCKET` (CONN) | failed_temporary `smtp_unavailable` | 4 ms |
| starttls | control | none | none | accepted `250` | 111 ms |
| starttls | untrusted / self-signed | `DEPTH_ZERO_SELF_SIGNED_CERT` | `ESOCKET` (CONN) | failed_temporary `smtp_unavailable` | 107 ms |
| starttls | expired | `CERT_HAS_EXPIRED` | `ESOCKET` (CONN) | failed_temporary `smtp_unavailable` | 107 ms |
| starttls | hostname mismatch | `ERR_TLS_CERT_ALTNAME_INVALID` | `ESOCKET` (CONN) | failed_temporary `smtp_unavailable` | 106 ms |
| starttls | server answers STARTTLS with 502 (not a certificate) | none | `ETLS` (STARTTLS, reply 502) | failed_permanent `smtp_tls_failed`, response `502 5.5.1` | 4 ms |
| starttls | server drops the socket during the upgrade (not a certificate) | none | `ESOCKET` (CONN) | failed_temporary `smtp_unavailable` | 55 ms |
| tls | plain-text server on the TLS port (not a certificate) | `wrong version number` | `ESOCKET` (CONN) | failed_temporary `smtp_unavailable` | 2 ms |

Why the code is `ESOCKET`, with source lines:

- The `tls.connect` handshake error is emitted as a socket 'error' event. Implicit TLS: `_connectToHost` creates the
  socket (`node_modules/nodemailer/dist/esm/smtp-connection/index.js:288-300`), `_setupConnectionHandlers` attaches
  `_onConnectionSocketError` (line 315), which is `_onConnectionError(err, 'ESOCKET')` (line 150) and then
  `_onError(err, 'ESOCKET', false, 'CONN')` (line 330; no fallback address for 127.0.0.1).
- STARTTLS: `_upgradeConnection` attaches `_onSocketError = _onError(error, 'ESOCKET', false, 'CONN')` (lines 146, 986). The
  handshake callback (line 974) never runs on a certificate error, so the `ETLS` branch at lines 1425-1428 is not reached.
- `_formatError` then overwrites the Node error code with the type (lines 831-833: `err.code = type`), so
  `DEPTH_ZERO_SELF_SIGNED_CERT` and the other Node codes never reach the adapter.
- `smtpAdapter.ts:46-62`: `ESOCKET` is in `LOST` (line 37) but the stage is `connect`, so the line 57 branch is skipped;
  it falls to line 61 and returns `failed_temporary`, `smtp_unavailable`, with no provider response.
- `ETLS` is set only where nodemailer itself decides TLS failed: the STARTTLS reply is not 2xx (index.js:1422), a
  synchronous `tls.connect` throw (lines 188, 212, 1427), or the socket closing while `upgrading` (line 870; the probe
  produced `ESOCKET` instead because the socket error came first). None is a certificate verification failure.
- `EREQUIRETLS` (index.js:1115, 1118) is the RFC 8689 REQUIRETLS extension. It is raised only when
  `envelope.requireTLSExtensionEnabled` is set (line 1113). The adapter's envelope is `{ from, to }`, so this code
  is unreachable; it is unrelated to the `requireTLS` option.
- Classifier table run (`probe-output.txt`, last block): `ETLS` and `EREQUIRETLS` become permanent
  `smtp_tls_failed`; `ESOCKET`, `ECONNECTION` and `EPROTOCOL` become temporary `smtp_unavailable`.

What happens next (same for every certificate case, both modes):

- `sendJob.ts:196` turns `failed_temporary` into a non-permanent `JobError`. `failJob` (jobStore.ts:284-307) requeues it.
  `RETRY_DELAYS_MINUTES` is `[1, 5, 15, 60]` and `MAX_ATTEMPTS` is 5 (jobStore.ts:28-30). That is five attempts, retries
  after 1, 5, 15 and 60 minutes, and intervention when the fifth attempt fails, about 81 minutes after the first, if the
  certificate is still bad. A permanent failure goes to intervention at once (jobStore.ts:294).
- Each attempt is recorded `failed_temporary` with provider_response `smtp_unavailable` (sendJob.ts:189-195), and
  `jobs.last_error` is `smtp_unavailable` (the existing test at delivery.test.ts:434-445 shows this for a temporary failure).
  The owner sees `smtp_unavailable`, the same code as an unreachable host, and never `smtp_tls_failed`, and nothing mentions a certificate.

### Per-document verdicts (working tree, including uncommitted T06)

| Document | Statement | Verdict |
|---|---|---|
| docs/05 | No D-8 or certificate statement (T06 added only D-7; line 51 is the generic table "Explicit rejection"). | n/a, nothing to correct |
| docs/11 section 13 (line 334) | "A certificate verification failure is classified temporary: it retries and then needs intervention instead of failing at once" | True for both modes and all three cases. |
| same line, first sentences | "`smtp_tls_failed` ... are configuration faults" | True for what raises `ETLS` (a server refusing STARTTLS). Incomplete: it does not say the certificate failure shows `smtp_unavailable`, so an operator may look for `smtp_tls_failed` and not find it. |
| docs/12 line 67 | "reaches the SMTP adapter as a socket error ... retried and then ends in visible intervention" | True for both modes and all three cases (`ESOCKET`). It does not name the code `smtp_unavailable` (see wording below). |
| Pilot packet section 8 D-8 row | "TLS certificate failure is classified temporary (retries, then intervention)" | True for both modes. It is accurate only because it says "certificate"; a generic "TLS failure" would be false for a refused STARTTLS. |
| docs/10, 2026-10-20 entry | "a TLS certificate failure stays classified as temporary (retries, then visible intervention)" | True for both modes. |

Outside the requested files:

- `smtpAdapter.ts:18-19` says "Authentication and TLS failures are permanent configuration errors". That is overbroad for
  certificate failures (a source comment, not a doc; not changed).
- `WP5-REL.md:164` already states that a certificate failure reaches the adapter as `ESOCKET` (temporary) and `ETLS` is permanent. That is correct.
- The T06 brief premise ("the doc claim holds only if a certificate failure reaches the adapter under another code") is met: it
  does, as `ESOCKET`, in both modes.

### Minimal true wording for D-8 a "kept and documented"

> A TLS certificate failure (untrusted, expired or wrong host name) is classified temporary in both security modes
> (`tls` and `starttls`): it is retried (five attempts in all, after 1, 5, 15 and 60 minutes) and then needs
> intervention, and it shows as `smtp_unavailable`, not `smtp_tls_failed`. `smtp_tls_failed` is raised only when
> the server refuses STARTTLS.

The current docs/12 and docs/10 wording is already true; only the code name `smtp_unavailable` and the
`smtp_tls_failed` boundary are missing, and they matter because the runbook line lists `smtp_tls_failed` first.
An optional shorter form of the same fact for docs/11: "A certificate failure shows `smtp_unavailable`."

### Pinning test (not written)

A small, offline test is possible, without real SMTP, in the existing loopback section of
`tests/integration/delivery.test.ts` (`describe` at line 392), using `tests/support/smtpSink.ts`:

- Two cases, `startSmtpSink({ implicitTls: true })` and `startSmtpSink({})`. Build the adapter WITHOUT `trustedCa`
  (`createOutboundAdapter(config.outbound, { dataDir })`), so the sink's self-signed certificate is untrusted, then `runSend`.
- Assertions: `attempts(revisionId)` equals `[['failed_temporary', 'smtp_unavailable']]`; `job(sendJobId)` matches
  `{ state: 'queued', last_error: 'smtp_unavailable' }` with a next run one minute later (as at lines 434-435); `target.transactions` is 0 and
  `target.messages` is empty.
- Optional unit line beside line 574: `classifySmtpFailure({ code: 'ESOCKET', command: 'CONN' }, 'connect')` is temporary
  `smtp_unavailable`.
- Limit: the sink makes only one certificate (valid dates, localhost). Expired and mismatch would need a certificate
  option on the sink; the untrusted case already crosses the same code path (the socket error), so it is enough to pin the claim.

### Does the premise of the owner's choice change?

No. Option a was "keep the current handling" of a certificate failure: temporary, retried, then intervention. Observed behaviour
is exactly that in both security modes, so the owner's choice rested on a true premise. `ETLS` (permanent) does not occur for
certificate failures. Option b ("treat as a permanent configuration fault shown at once") would still be a code change; it was
not chosen. No new owner question is needed. The only correction is the optional wording above (name the code
`smtp_unavailable`), which the T06 owner of the docs can apply; it does not change D-8 a.

### Evidence

`handoff/delivery/evidence/WP5-UX4-D8-DIAG/`: `probe-output.txt`, `probe-first-run-segfault-output.txt`, `probe-script.txt`,
`port-check.txt`, `listing.txt` (no certificate or key material).
