# WP5 area A, attempt 2 — delta recheck of integrated workflow, submission and privacy on the package-final freeze

Form: [REVIEW](../templates/REVIEW.md). Translation: [WP5_REVIEW_A2.vi.md](WP5_REVIEW_A2.vi.md). Review prompt: [WP5_REVIEW](../prompts/WP5_REVIEW.md); dispatch brief and task record: [WP5-ASSESS-A](tasks/WP5-ASSESS-A.md), section "Attempt 2 (coordinator note)". Earlier review kept unchanged: [WP5_REVIEW_A](WP5_REVIEW_A.md) (attempt 1, PASS at `546cdda`). Evidence: `handoff/delivery/evidence/WP5-ASSESS-A2/` (masked, LF; probe and script sources as `*.mjs.txt` and `*.sh.txt`; index `00-README.txt`).

- **Package/date/reviewer and observable model/effort:** WP5, area A, attempt 2: the digest-bound delta recheck on the WP5 package-final freeze. 2026-10-06, 21:53 to about 22:30 UTC. Reviewer: a fresh timesheet-auditor subagent, self-reported model `claude-opus-5-5`; effort and speed are not observable from inside the session.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:**
  - Reviewed commit `74d5bfec6700126da4105b5d97f5efe943f896f5`, the WP5-GATE `freeze_commit`. HEAD = `origin/main` = `74d5bfe` before and after; no unpushed commit.
  - Source digest `0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba` over 779 files (`handoff/` excluded), equal to the gate digest of record. Recorded before (21:54 UTC) and after every run (22:12 UTC) in three forms: `scripts/source-digest.mjs` in the repository, the `git ls-tree` form of HEAD and of `74d5bfe`, and the clean export (`00-baseline.txt`, `99-digest-after.txt`). The delta base `546cdda` gives `26fcc969…` in the `git ls-tree` form, as recorded by attempt 1.
  - Complete source: `git archive 74d5bfe` into the task folder. Its digest is `0a64a75f…` before and after every run, and its non-ignored change list is empty after every run.
- **Decision: PASS / FIX REQUIRED / NOT VERIFIED:** **FIX REQUIRED** (two Low documentation findings in the new pilot sections of docs/11).
  - No application source, migration, script, package or Compose behaviour changed since `546cdda`. Every attempt-1 conclusion still holds, and every area-A run on the freeze passed (below).
  - The new AC-13 test asserts the attempt-1 scenario items, is deterministic (three runs, four machine zones, two shifted wall clocks), and fails under both mutations I applied.
  - Two steps of the pilot activation and deactivation runbook (docs/11 sections 13 and 14, EN and VI) tell the operator to confirm things the product does not show: the sending flag in the administrator status, and a deep link in the capture self-test. Both are reproduced below and have a bounded wording fix. No integrity, privacy or submission defect of the software was found.
- **Scope actually inspected/executed:**
  - Read: AGENTS.md (from disk), the brief and its attempt-2 note, attempt 1's results and WP5_REVIEW_A, the results of WP5-FIXB, WP5-AC13, WP5-REL and WP5-GATE, WP5_REVIEW, WP5-PLAN sections A, B, F and G, docs/05 and docs/06 (AC-13, AC-14, AC-16), docs/07 "Setup sequence", and the full delta: docs/11 and docs/12 (EN and VI), `.env.example`, `compose.example.yaml`, README, the AC-13 test and its helper.
  - Code read to check the docs claims: `config.ts` (outbound mode, flag, SMTP keys), `services/automation.ts` (activation, eligibility), `services/notifications.ts` and `jobs/reminderJob.ts` (activation gate, deep link), `mail/message.ts`, `mail/smtpAdapter.ts` (fault codes), `mail/captureAdapter.ts`, `jobs/sendJob.ts`, `jobs/runner.ts` (interval, scan order), `services/operationsStatus.ts`, `routes/admin.ts`, `client/components/OperationsStatus.tsx` and `deliveryModel.ts`, `services/signatures.ts`, the routes behind every swapped identifier of the test, `tests/support/testApp.ts` and `concurrency.ts`.
  - Executed on the clean export: `npm ci`, `npm run verify`, `npm run test:e2e` (twice, see below), the AC-13 test alone (3 runs, 4 zones, 2 wall clocks), two mutations in a separate scratch copy, an EN/VI parity script, and my own HTTP probe (`probe.mjs`) on ports 47702 and 47703.
  - Runtime: Git Bash, portable Node v24.21.0 by full path, npm 11.18.0, npm scripts run by Git Bash (no `cmd.exe`). `DATA_DIR` and `DATABASE_PATH` inside the task folder for every run. No Docker. Capture mode only; `PRODUCTION_SENDING_ENABLED` never set; nothing sent. WP5-PILOT ran on the same machine throughout.
- **Evidence table:**

| Command | Result / exit | Evidence |
|---|---|---|
| `git rev-parse`; `scripts/source-digest.mjs`; `git ls-tree` digest of HEAD, `74d5bfe` and `546cdda`; export digest; before and after | HEAD = `origin/main` = `74d5bfe`; `0a64a75f…` (779) in every form, both times; base `26fcc969…`; export change list empty | `00-baseline.txt`, `99-digest-after.txt` |
| `git log`, `git diff --name-status --stat 546cdda 74d5bfe -- . ':!handoff'`, per-commit paths | 10 paths in 3 commits; none under `src/`, `migrations`, `scripts/`, package files, Dockerfile or configs | `01-delta.txt` |
| `npm ci` (`NODE_OPTIONS=--trace-deprecation --pending-deprecation`) | exit 0, 161 packages, lockfile unchanged (`cmp` with the repository: equal), 0 deprecation lines | `02-npm-ci.txt` |
| `npm run verify` (`SMOKE_PORT=47701`) | exit 0: typecheck, lint, 77 files / 1,759 tests, build, `SMOKE PASSED` (41 checks), 0 deprecation lines | `03-verify.txt` |
| `npm run test:e2e`, run 1 | exit 1: 144 passed, 1 failed, 5 skipped. The failure is a console error `net::ERR_NO_BUFFER_SPACE` before sign-in in `submission.spec.ts:62` (desktop) | `04-e2e-run1.txt` |
| `npm run test:e2e`, run 2 (rerun once, per WP5-PLAN B shared rules) | exit 0: 145 passed, 5 skipped, 4.0 min, 0 deprecation lines | `04-e2e-run2.txt`, `04-e2e-load-before-run2.txt` |
| AC-13 test alone, 3 runs | exit 0 each; test 1,723 / 1,746 / 1,906 ms; wall 4.23 / 4.03 / 4.24 s | `06-ac13-run1..3.txt` |
| AC-13 test, machine zone set at run time (`settz.mjs` preload): Asia/Tokyo, Pacific/Kiritimati, Etc/UTC, America/New_York | exit 0 each; vitest "Start at" shows the local time of each zone | `06-ac13-zone-*.txt` |
| AC-13 test, wall clock moved to 2027-01-20T12:00Z and 2025-06-15T12:00Z (`shiftnow.mjs` preload) | exit 0 each | `06-ac13-now-*.txt` |
| `TZ=Pacific/Kiritimati` from Git Bash | not applied: Node reports `America/Los_Angeles` (see risk R-A2-3) | `06-ac13-tz-env-not-applied.txt` |
| Mutations in a scratch copy (`git archive 74d5bfe` + `npm ci`, outside the repository) | control exit 0; mutation 1 exit 1; mutation 3 exit 1; both files restored and equal to the export | `07-mutation.txt` |
| EN/VI parity of docs/11, docs/12 and README | headings, steps, bullets, fences, checkboxes and table rows equal; area-A tokens equal (two differences are translated prose) | `05-parity.txt` |
| `node probe/probe.mjs`, run 2 (run of record) | exit 0: 26 PASS, 0 FAIL | `08-probe-log-run2.txt`, `probe.mjs.txt`, `lib.mjs.txt` |
| `node probe/probe.mjs`, run 1 | 22 PASS, 4 FAIL, all a probe defect (wrong JSON path), fixed in the probe | `08-probe-run-history.txt`, `08-probe-log-run1.txt` |
| `netstat -ano`, `ps -W` at the end | no listener on 47700–47719; no portable-Node process of this task | `98-process-listing.txt` |
| `scripts/precommit-check.mjs` over this task's files, staged in a private git dir outside the repository | see the task record | `97-precommit.txt` |

- **Findings:**

| ID | Severity | File / place | Reproduction | Expected / actual | Rule / AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP5-A2-01 | Low | `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md`: section 13 step 2 first bullet (line 294), section 13 step 4 third bullet (line 318), section 14 step 4 (line 355) | Probe check `OPS-2`: `GET /api/admin/operations` returns `operations.sender` = `{configured, outbound_mode}` and no other sender field (`08-admin-operations.txt`). The screen (`OperationsStatus.tsx`, `StatusPanel`) shows "Sender address" and "Outbound mode" only. In capture mode the server never reads the flag (`config.ts`, `parseOutbound`) | Expected: each check can be done as written. Actual: the runbook says the administrator status shows "the flag off" or "the flag on"; no such field or text exists. At deactivation a `PRODUCTION_SENDING_ENABLED=true` line left in `<env-file>` cannot be seen from the status. If the mode is later switched back to `smtp`, real sending then needs one change instead of two | docs/11 convention (every step verifiable or labelled); the owner-only flag gate for real sending (`config.ts`, AGENTS rule 6, docs/07); AC-14 | Docs only, EN and VI. In the three places, name what the status shows: "Outbound mode: Capture only (nothing leaves the server)" or "SMTP (real sending)". The server reaches SMTP mode only with the flag. In section 14 step 3 or 4, add a file check that the flag line is gone, for example `grep -c '^PRODUCTION_SENDING_ENABLED=' <env-file>` prints `0` |
| WP5-A2-02 | Low | `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md`: section 13 step 2 third bullet (line 296) | Probe checks `SELF-4`, `LINK-1`, `LINK-2`. The captured submission has no URL (`mail/message.ts` builds no link; the body is in `08-probe-log-run2.txt`). Without an activation instant, `run-jobs` at the 24 h and 2 h reminder instants and after the deadline decides no reminder, overdue warning or outcome notice: 0 occurrences, 0 captures (`notifications.ts` header: nothing is decided while the activation instant is null). Positive control: after an activation instant is recorded, every captured reminder carries `https://timesheet.example.invalid/#/review/<payroll-date>` | Expected: the self-test check can be done. Actual: in the capture self-test no captured message holds a deep link. The staged first period (D-12) has no activation instant either, so `PUBLIC_BASE_URL` is first exercised by a real reminder after automation is enabled | docs/05 "Reminders and review links" (login-required deep links); docs/11 convention | Docs only, EN and VI. Replace the bullet with a check that works without activation: open `https://<nas-host>/#/review/<payroll-date>` (the form of every reminder link, `PUBLIC_BASE_URL` + `/#/review/<payroll-date>`); it must ask for sign-in and then open the review. Add to section 13 step 5 or 7: check the link of the first reminder after the activation instant is set |

- **Verified checks (area-A delta scope, attempt-2 note items 1–4):**
  1. **Delta since `546cdda`** (`01-delta.txt`). Ten non-handoff paths in three commits. `e7fe514` touches only `handoff/`. No application source changed.
     - WP5-FIXB `85838b5`:
       - `.env.example`: header comment only. No key or value changed; the privacy text (mode 600, never in git or chat) is unchanged.
       - `compose.example.yaml`: three comment lines; no Compose behaviour change.
       - docs/11 sections "Placeholders and conventions", 1, 2, 4, 6, 7, 8 and 9 (EN, VI).
     - WP5-AC13 `8e99d2c`: `tests/integration/ac13-two-week.test.ts` and `ac13-support.ts`.
     - WP5-REL `74d5bfe`: docs/12 (new, EN, VI); docs/11 sections 13–16 and the command map; one README row (EN, VI).
     - Area-A judgment of the docs:
       - Privacy holds. Only placeholders and `example.invalid` appear. The protected `<env-file>` copy is mode 600 and stays outside git and chat. SMTP values leave the file at deactivation, and the activation reason is never personal data.
       - Readiness, permission and outcome stay separate: docs/12 "Software readiness, owner permission and pilot result" and docs/11 section 13. Provider acceptance and recipient receipt are recorded as separate facts.
       - Checked against the code and the probe, these docs/11 and docs/12 statements are accurate:
         - the activation route and its refusals `activation_in_past`, `reason_required` and `origin_rejected` (`ACT-1`);
         - the audited instant shown in the status, and clearing it with null (`ACT-2`, `ACT-3`);
         - eligibility on or after both the activation instant and the user's auto-submit instant; never for accounts that never saved settings (`automation.ts`, docs/05);
         - SMTP refused without the flag, naming the flag and never a value (`F-5`);
         - the fault codes `smtp_auth_failed`, `smtp_tls_failed` and `smtp_config_invalid`, and a TLS socket error classified temporary (`smtpAdapter.ts`, D-8);
         - `SMTP_SECURITY` `starttls`/`tls`, and `SMTP_USER`/`SMTP_PASSWORD` set together (`config.ts`);
         - the capture folder under `/data/private-data` (Dockerfile `DATA_DIR`);
         - no blind resend of an uncertain attempt;
         - a recipient change needs a new revision;
         - runner discovery within a minute (15 s interval);
         - the queued-send count in the status (`outbound.queued_send_jobs`);
         - the R-WA3 note.
       - The exceptions are WP5-A2-01, WP5-A2-02 and the wording risk R-A2-1.
       - EN/VI parity holds (`05-parity.txt`), and the VI text of both findings says the same as the EN.
  2. **The AC-13 test.**
     - Coverage: it asserts everything attempt 1's probe showed for the items the note lists:
       - 14 dates;
       - credited total 510 = `8:30`, in the review and in the captured PDF;
       - the ledger posted once: 6 credits plus one −60, posted 540, 8 rows, unchanged by the restart, the decision and the swaps;
       - restart: a separate runner process commits `sending` and exits (86). The restarted production runner marks the attempt `uncertain` (`lease_expired_while_sending`) and captures nothing; resend is 409 until the owner decides; the decision gives exactly one accepted attempt and one capture with the frozen To/Cc, the sender, no Bcc and the PDF hash;
       - correction: 422 without a reason; revision 2 supersedes revision 1; only +30 correcting the 10-04 credit; the r1 payload byte-equal; two sign-offs; no job, attempt or capture from the edit or from `send_email: false`;
       - double spend: two connections in worker threads, exactly one `used` and one `409 exceeds_reserved`;
       - isolation: 11 swapped identifiers 403/404, every table count and the capture folder unchanged, Bob sees nothing of Alice;
       - overdue: at the recorded instant `2026-10-09T00:05:00Z` with auto-submit off, one overdue record, no automatic revision, no PDF or send job for Bob, exactly one capture (his own warning, no PDF), and nothing more on a later pass.
     - All swapped routes exist (`api.ts`, `ot.ts`, `submission.ts`, `shares.ts`), so the refusals are not vacuous.
     - Deterministic:
       - injected clock, no sleeps, no ports, run-time temporary folders;
       - three passes;
       - passes in four machine zones, applied at run time and visible in vitest's start time;
       - passes with the wall clock in January 2027 and June 2025;
       - the overdue check holds whichever of the two scans of a pass runs first, because the 00:11 pass opens a new reminder bucket (R-A2-4).
     - Mutations (`07-mutation.txt`):
       - control pass;
       - mutation 1, repeating WP5-AC13's: the N threshold skipped. Fails `credit 2026-09-24: expected 30 to be +0`, as WP5-AC13 recorded;
       - mutation 3, my own: the signature read without its ownership filter. Fails `Bob GET /api/signatures/<id>: expected [403, 404] to include 200`.
  3. **Reruns.**
     - `npm ci`, verify and e2e as in the table.
     - My probe covered the attempt-1 items the test does not. Shares (`SHARE-1..4`):
       - a view-only grant reaches the timesheet only; OT, PDF and edit return 403;
       - sign-off, signature, resend, settings, leave and re-share are never mounted (404);
       - a change applies on the next request: OT 200, the PDF with the same bytes and an audited download, the edit attributed to the grantee; the change issues a new id;
       - revocation gives 404 on the next request; deactivation gives 401; reactivation restores sign-in.
     - Sender and recipient faults (`F-1..5`):
       - `sender_missing` and `recipient_missing` are permanent and visible in the owner's list and in the administrator submission status (with the frozen recipients, no timesheet details);
       - neither is ever accepted, captured or retried automatically;
       - SMTP without the flag is refused, and the synthetic password never appears.
     - Secrets (`PRIV-1`, `PRIV-2`, `OPS-3`):
       - health is `{"status":"ok"}`; readiness carries no address or path;
       - server logs and CLI outputs of both instances hold no password or cookie, and each setup token appears only in its bootstrap output;
       - the administrator status holds no address or timesheet detail.
     - Capture self-test (`SELF-1..3`): exactly the configured To/Cc, `MAIL_FROM`, no Bcc, and the PDF equal to the download; the attempt is recorded `accepted` with provider response `captured`.
  4. **Earlier conclusions.** No source changed, so attempt 1's verified checks 1–7 and its PASS on the software still apply to the same code. They are re-proven here by the AC-13 test, the suites, e2e and the probe. R-WA1..R-WA8 are re-judged below.
- **Risks and optional improvements, separate from proven defects:**
  - **R-A2-1 (Low, wording):** docs/11 section 14 step 2 says a send captured after deactivation "is recorded with the capture sender".
    - "Capture sender" is the project's term for the capture adapter (DEVELOPMENT.md), so this is not wrong.
    - But the owner's history shows such an attempt as "Accepted by the mail server" (`deliveryModel.ts`). Only the API record shows provider response `captured` and provider id `capture-…` (`SELF-3`).
    - Naming those two would help the operator find captured-not-mailed submissions.
  - **R-A2-2 (Low, overlaps area B):** `<compose-restored>` keeps the live `<env-file>`; WP5-GATE's `08-config-restored.txt` shows `OUTBOUND_MODE` taken from it.
    - After activation, a restored inspection instance would read `smtp` and the flag, although section 6 step 3 says "in capture mode".
    - The restore's outbound pause holds every send until the explicit resume, so nothing goes out without the operator.
    - Optional: a capture-mode copy of the env file, as `<compose-previous>` does with `JOB_RUNNER=off`.
  - **R-A2-3 (Info, evidence quality):** WP5-AC13's runs "with `TZ=Asia/Tokyo` and `TZ=America/New_York`" did not change the zone.
    - Git Bash drops `TZ` when it starts a native process: `process.env.TZ` is undefined. Their vitest start time `14:16` is Los Angeles time, and this host's zone equals the scenario's reporting zone.
    - Re-proven here with a run-time preload. Later gates should set the zone the same way.
  - **R-A2-4 (Info):** an overdue warning can follow its overdue record by up to one five-minute reminder bucket.
    - The deadline scan and the reminder scan of one pass tie on `next_run_at` and `created_at` and are claimed by random id. Seen in probe run 1 against run 2 (`08-probe-run-history.txt`).
    - This is within the WP3 design (five-minute reminder bucket). The test's four passes cover both orders.
  - **R-A2-5 (Info, optional test additions):** the test does not cover these attempt-1 items. Each is covered by existing suites, e2e or attempt 1's probe:
    - a restart before and after the PDF;
    - the r1 PDF kept after the correction (only the r1 payload row, sign-offs and attempts are asserted);
    - an explicit unchanged-PDF resend with zero ledger movement;
    - swaps of the import batch, the settings version and the administrator;
    - a two-connection sign-off race (one connection only: idempotence).
  - **R-WA1..R-WA8 re-judged (code unchanged):**
    - R-WA1 (Low), R-WA2 (Low), R-WA6 (Info) and R-WA8 (Info) are unchanged and now listed in docs/12.
    - R-WA3 (Low) is unchanged and documented in docs/11 section 16 note 5. `LINK-2` again shows the bootstrap administrator and the never-configured Carol receiving before-due reminders after activation.
    - R-WA4 (Info) is confirmed: a change issues a new id (`SHARE-2`).
    - R-WA5 (Info) did not recur: the probe closes each connection.
    - R-WA7 (Info) is reduced: the AC-13 test drives the production `runJobsOnce` in process and in a separate runner process. The live loop is still covered by e2e only.
  - **E2E run 1:** `net::ERR_NO_BUFFER_SPACE`, treated as environmental (WP3 carry 12) while WP5-PILOT ran on the machine. Both runs are recorded; the single rerun passed.
- **Required gates unrun/blocked and why:**
  - Area B is not repeated here: release reproducibility, restore, drill, image, `npm audit` and runbook Compose fidelity. WP5-GATE covered them on this freeze.
  - Real SMTP and the NAS cannot be observed in capture mode and stay NOT VERIFIED (D-13).
  - Sections 13–16 are owner NAS steps. I checked their statements against the code and a local instance only.
  - No browser check was run beyond the e2e suite.
- **Disposition of previous findings:**
  - Attempt 1 had no finding.
  - WP5-B-01 and WP5-B-02 (area B) were fixed by WP5-FIXB. Area A sees no regression from the fix: the env-file copy is protected, and the restored instance has its own project and data (R-A2-2 noted).
  - WP1–WP4 findings stay closed.
- **Software readiness, owner permission and pilot result separately:**
  - Software readiness (area A): the software of `74d5bfe` / `0a64a75f…` passes every area-A check on a Windows workstation in capture mode. The package-final docs carry two Low runbook findings (FIX REQUIRED), so area A is not accepted on this freeze until they are fixed and rechecked.
  - Owner permission: none requested or given; nothing deployed, activated or sent.
  - Pilot result: none.
- **One next action/prompt:** the coordinator dispatches a bounded docs fix of WP5-A2-01 and WP5-A2-02 under [FIX_FINDINGS](../prompts/FIX_FINDINGS.md). It changes `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md`, sections 13 and 14 only. Then come its freeze, a regate and an area-A recheck of only those lines on the new digest. R-A2-1 and R-A2-2 may be fixed in the same pass.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:**
  - WP5-ASSESS-A, attempt 2, timesheet-auditor subagent, self-reported `claude-opus-5-5`. The board agent ID is recorded by the coordinator.
  - Reviewed authors:
    - the WP1–WP4 workers (strongest author model opus);
    - WP5-FIXB, WP5-AC13 and WP5-REL (sonnet);
    - their committers.
  - The reviewer is not weaker than the strongest author model.
- **Fresh context; confirm reviewer did not author changes:**
  - Fresh context. This reviewer authored no WP1–WP5 change. It is not the attempt-1 auditor, the WP5-ASSESS-B auditor or the WP5-FINAL-AUDIT auditor.
  - It wrote only this report, its translation, the attempt-2 results in the brief and `evidence/WP5-ASSESS-A2/`. No source was edited. The mutations ran in a separate scratch copy outside the repository.
  - Runtime deviation: one shell call redirected a failed `cp` error to `/dev/null`, against the brief's rule. The copy wrote nothing, and nothing else was affected.
- **Source digest before/after; gate evidence for that snapshot:** `0a64a75f…01ba` (779 files) before and after, in the repository, the `git ls-tree` form and the export. It equals the WP5-GATE digest of record (`handoff/delivery/evidence/WP5-GATE/00-digest.txt`).
- **New report path preserving previous review history:** `handoff/delivery/WP5_REVIEW_A2.md` and `.vi.md` (new files). `WP5_REVIEW_A.md` and its evidence are unchanged.
- **Finding dispositions and next coordinator fix/recheck task:**
  - WP5-A2-01 and WP5-A2-02 are open, with a docs-only fix as above, followed by a recheck on the new digest.
  - Risks R-A2-1..R-A2-5 go to the fix task (R-A2-1, R-A2-2), the WP5-GATE method (R-A2-3) and the backlog (R-A2-4, R-A2-5).
