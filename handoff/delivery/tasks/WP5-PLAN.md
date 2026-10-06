# WP5-PLAN dispatch brief

- Mission/task: timesheet-software-readiness / WP5-PLAN; package WP5; kind plan;
  attempt 1; depends on WP4-ACCEPT (WP4 accepted).
  - The WP4 accept commit is e7fe5144dc62f5047c79dd5ef69d973f60dfd14d. It changes no
    source.
  - The accepted WP1–WP4 release candidate is 546cddaf6747aef85e8b6d9b7712de9e28f138bf,
    digest 26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081 (775 files).
  - Record the HEAD and digest you observe. They must match; if not, stop and report.
- Profile/routing: timesheet-planner with model override opus, reason `size_risk`
  (release-candidate acceptance design, restore proof and pilot packet across all
  packages; docs/08 rubric). Effort stays at the profile's high. Routing: size L,
  risk H, novelty yes.
  - Record in English.
  - This is read-only planning: no source, docs or test edits.
- WP5 order, from WP5_IMPLEMENT: a fresh auditor assesses first; a worker fixes; an
  independent auditor rechecks; the owner reviews the concrete pilot packet. This plan
  prepares that order. It must not prejudge or pre-empt the independent assessment:
  do not audit, do not record findings as defects, and do not propose fixes for
  problems you have not been asked to diagnose.

## Read

- AGENTS.md from disk first, including the UI standards section.
- docs/08 (routing rubric, commit points, package-final gate) and docs/09 (WP5 section).
- handoff/prompts/WP5_IMPLEMENT.md and WP5_REVIEW.md, and the documents they name:
  docs/02, docs/05, docs/06 (AC-13 and every required gate), docs/07; others only where
  a dependency needs them (docs/10 and docs/11 for restore and rollback).
- handoff/delivery/STATE.json (read-only): every carried risk of WP1–WP4.
- The acceptance records in WP1_HANDOFF … WP4_HANDOFF, and the final rechecks
  WP4_RECHECK_A4.md and WP4_RECHECK_B4.md.
- The board (read-only): `pending_owner_question` (WP4-I-1..I-5), `owner_decisions`,
  `governance_backlog` (the WP4 backlog line) and `runtime_observations`.
- Inspect the source tree, scripts, drill, smoke, e2e fixtures, Compose files and the
  runbook read-only, enough to design executable checks.

## Required output (append under Results)

A. **WP5 scope.** List AC-13 and every required gate from docs/06 and WP5_REVIEW that
   is not already closed by an accepted package. For each, cite where it is defined
   and whether accepted evidence from WP1–WP4 already covers part of it.
B. **Independent assessment design** (the first WP5 step). Split it into at most two
   fresh-auditor areas that can run in parallel without sharing files, ports or
   Compose projects. For each area give:
   - ID (WP5-ASSESS-A, WP5-ASSESS-B), title, size, risk, profile and model per docs/08;
   - the exact scope from the WP5_REVIEW focus: the integrated two-week workflow,
     correction, partial approved OT use, second-user isolation, the overdue and
     restart path, a complete reproducible release, verified restore, and no blocking
     integrity, privacy or submission defect;
   - the executable checks, with synthetic data and local mail capture only;
   - the task folder, port range and Compose project name;
   - what the auditor must record so its PASS can be digest-bound.
   Say whether a package gate (verifier) should run before the assessment on the same
   freeze, and why.
C. **Pilot packet outline.** List the concrete items WP5_IMPLEMENT requires: URL,
   sender and recipients, email and PDF samples, settings, restore proof and rollback.
   For each, say what software or documentation work produces it, what owner input it
   needs (named, never requested here), and what stays owner-controlled. Never
   include credentials, real addresses, signatures or personal data.
D. **Owner decisions before the pilot.** List every open owner item that blocks or
   shapes the pilot (at least R-A3 and WP4-I-1..I-5; others you find). For each, give
   the options and a recommendation with its reason.
E. **Provisional task list after the assessment.** Bounded slices: release and setup
   notes (EN and VI), pilot-packet documents, a fix-slot placeholder for assessment
   findings, the recheck, and the WP5 acceptance. For each give the ID, size, risk,
   profile and model, owned paths, dependencies and freeze point. Keep one writer at a
   time.
F. **Carry-forward triage.** For each carried risk in STATE and the WP4 backlog, mark
   it pilot-blocking, pilot-relevant (document only) or post-pilot, with one line of
   rationale.
G. **Runtime rules for every WP5 brief**, from the board `runtime_observations`.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER feed anything to python or node through stdin**, including `python -`,
  `node -` and empty heredocs. Never pipe into head or tail.
- Call Node 24 by its full portable path; make the first shell call a trivial
  `node --version`.
- Use `D:\.claude-tmp\timesheet\WP5-PLAN` for TEMP/TMP and raw output. If you run any
  CLI, set both `DATA_DIR` and `DATABASE_PATH` there.
- Do not build images, run Compose, start servers or run the full test suite; this is
  planning. Version checks are allowed.
- Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
  folders recursively. Never write into the repository root.
- If a permission check denies a call, stop and report.
- Write the plan into this brief with the Edit tool. Put masked LF `.txt` evidence
  (baseline, digest, end state) in `handoff/delivery/evidence/WP5-PLAN/`.

Return at most 200 words, beginning with your self-reported model: the observed HEAD
and digest, the assessment split, whether a gate runs first, the owner decisions
needed, and the next dispatch you recommend.

## Results

Self-reported model: claude-opus-5-5 (profile timesheet-planner, override opus, reason
`size_risk`; effort not observable). Status: done (plan only; read-only; no source, docs,
tests, board, STATE, NEXT_ACTION or checkpoint edited).

### Baseline (observed)

- HEAD = origin/main = `e7fe5144dc62f5047c79dd5ef69d973f60dfd14d` (expected: match).
  `git diff --stat 546cdda e7fe514 -- . ':!handoff'` is empty.
- Working-tree `node scripts/source-digest.mjs` (Node v24.21.0 by full path):
  `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081` (775 files); the
  `git ls-tree` form of HEAD and of `546cdda` gives the same value (expected: match).
- `git status`: only coordinator records under `handoff/` are modified or untracked.
- Version checks only: Docker 28.5.1, Compose v2.40.2-desktop.1, git 2.55.0, Edge installed.
- Evidence: `handoff/delivery/evidence/WP5-PLAN/01-baseline.txt`, `02-digest.txt`,
  `03-end-state.txt`.

Observations versus assumptions used below:

- Observed: no file under `src/`, `tests/` or `scripts/` mentions AC-13, and no single test
  runs the integrated two-week scenario. The building blocks exist as separate specs
  (`review`, `submission`, `automation`, `ot-leave`, `isolation`, `pdf-visual`) and suites
  (`corrections`, `deadline`, `deadline-race`, `delivery-crash`, `jobs-restart`,
  `finalization-concurrency`, `ot-leave-concurrency`, `sharing-matrix`). This is a coverage
  fact, not a defect: AC-13 is WP5's own gate.
- Observed: `cli.js run-jobs --once --now <UTC instant>` exists, so deadlines can be
  simulated without waiting. The activation instant is set through the admin route
  (`routes/admin.ts`, `active_from`).
- Observed: no route lets a user change their own password (`routes/admin.ts` comment cites
  E-11 and FR-01); docs/11 has no section on enabling real sending or recording activation
  (it defers both to the WP5 pilot).
- Observed: `validate_orchestration.py` accepts an audit whose gate dependency is in another
  package (`validate_audits`: "any package"), requires the gate's `freeze_commit` to equal
  the audit's `reviewed_commit`, and counts WP5-PLAN (kind plan, opus) as a WP5 author, so
  every WP5 audit must be opus.
- Assumption: the pilot is the first production installation, so there is no older
  production schema to roll back to during the pilot.
- Assumption: the pilot cohort is the owner alone (docs/09:69 "the owner's normal two-week
  workflow"). Item D-9 asks the owner to confirm this.

### A. WP5 scope

| Gate or requirement | Defined in | Accepted evidence that already covers part | Open for WP5 |
|---|---|---|---|
| AC-13 integrated two-week scenario, historical correction, approved partial OT leave, overdue case | docs/06:21; WP5_REVIEW focus (line 14); docs/09:61 | Parts only, each in isolation: WP2 (ledger, partial use, corrections), WP3 (review, sign-off, automation, overdue, restart), WP4 (regressions). No integrated run exists. | All of it, as one integrated run on the release candidate |
| AC-14 sender/channel faults visible, no leaked secrets, exact captured recipients/body/PDF | docs/06:22 (WP3/WP5) | WP3 accepted capture, faults and delivery history (WP3_HANDOFF; `submission.spec`, `delivery*.test`, smoke) | Capture checked inside the integrated run with a configuration shaped like the pilot. Real-SMTP behaviour (WP3 carry items 1-3) can only be observed on the pilot host after authorization |
| AC-15 safe health/backup status, compatible rollback, restored instance paused | docs/06:23 (WP4/WP5) | WP4 accepted: drill stages 3 and 5, operations allowlist, `restore.test.ts` (WP4_HANDOFF acceptance record) | Rollback point of the pilot release; R-A3 owner choice (D-1); restore proof on the target (owner NAS step) |
| AC-01..AC-12, AC-16 | docs/06:9-20, 24 | Closed by the WP1-WP4 acceptance records (STATE `independent_review: passed`) | Regression only, through the integrated run and the release reproduction; not reopened. NAS-specific parts of AC-11 stay NOT VERIFIED (docs/06:32) |
| Complete reproducible release | docs/09:61; WP5_REVIEW:16; WP5_IMPLEMENT:20 | WP4-REGATE4 on a clean export of `546cdda`: `npm ci`, verify (76 files, 1,758 tests), e2e 145/5, drill 208 PASS | An independent reproduction from a clean export; release identity (commit, digest, image ID, `package.json` version 0.1.0); bilingual release notes |
| Verified restore | docs/09:61; docs/07:30 | WP4 drill stage 3 and the second-generation restore (Docker Desktop, amd64) | An independent re-run that restores a dataset holding a finalized period, a correction and an OT-leave reservation; the target restore stays an owner step |
| No blocking integrity, privacy or submission defect | docs/06:36 (block list); docs/09:61 | Per-package audits | A whole-system judgement by the fresh assessment |
| Bilingual release and setup notes | WP5_IMPLEMENT:16; docs/09:57 | docs/11 runbook (EN/VI) from WP4-T13 | Release notes, plus the pilot activation and deactivation steps the runbook defers |
| Concrete pilot packet (URL, sender/recipients, email/PDF, settings, restore proof, rollback) | docs/06:38; WP5_IMPLEMENT:16; docs/07:20 | None | All of it (section C) |
| Separate software readiness, owner authorization and pilot outcome | docs/06:38; WP5_REVIEW:16 | Each WP4 record separates the three | Kept in every WP5 record |
| Completion: authorized pilot, restorable installation, one real period observed | docs/09:69; docs/06:38 | None | Owner-controlled; outside software readiness |

### B. Independent assessment design (first WP5 step)

**Gate before the assessment: no new gate.** WP4-REGATE4 (verifier) already passed on the
same freeze (`546cdda`, digest `26fcc969`), and nothing outside `handoff/` has changed since.
The validator accepts a gate dependency from another package when its `freeze_commit` equals
the audit's `reviewed_commit`. A second gate on an identical snapshot would repeat npm ci,
verify, e2e and the drill, which both auditors must execute themselves anyway (WP5_REVIEW:24
"Independently execute mandatory gates"). docs/06:36 advises against redundant broad testing.
`546cdda` cannot be the WP5 package-final snapshot either, because the release notes change
`docs/`. The separate package-final verifier gate is therefore WP5-GATE (section E).
Both assessments depend on `WP4-REGATE4` and `WP5-PLAN`, with `reviewed_commit` =
`546cddaf6747aef85e8b6d9b7712de9e28f138bf`.

**Split.** Two parallel fresh audits now. docs/08's "integration pass" is the final WP5 audit
on the package-final freeze (WP5-FINAL-AUDIT, section E). The two areas share no export,
data directory, port, browser profile or Compose project: A uses no Docker, and B uses no
Playwright. Together they occupy both subagent slots (`max_active_subagents` 2), so the
coordinator runs nothing else in parallel.

#### WP5-ASSESS-A: Integrated workflow, submission and privacy

- Kind audit; size L; risk H; profile `timesheet-auditor` (xhigh); model opus. docs/08 says
  "never below the strongest author model", and WP4 and WP5-PLAN authors used opus. Routing
  {L, H, novelty: true}; override reason `size_risk`. The auditor must be a new context that
  authored no WP1-WP5 change.
- Scope (WP5_REVIEW focus; docs/02, 05, 06):
  1. **The integrated two-week workflow (AC-13)** on the built server: two synthetic users
     with saved settings, a payroll calendar and a policy (B=480, N=30, M=30). Over 14 dates:
     - clock and manual entries, confirmed and unknown breaks, and a flexible start;
     - weekday excess on both sides of N (30/31/45/46), work on both Sundays, and an overnight
       Friday into Saturday (R-03);
     - a holiday, 4 h work plus 4 h leave, and a deficit day in the configured mode.
     Then review, sign-off with name and image, and the PDF in capture. Check the 14 dates,
     the credited OT total in h:mm with both Sundays, the real sign date, the bounded image,
     the revision ID and the rendered pages (AC-10 regression). Check that the ledger posts
     exactly once (AC-03).
  2. **Historical correction (AC-04, R-06, docs/05 "Corrections and resends").** Edit a
     finalized period. Check that a reason is required, that a correction draft and a new
     revision are created, that only the ledger difference posts, and that the original
     snapshot, PDF and sign-off are kept. Editing must not send anything. An explicit resend
     of an unchanged PDF must make a new attempt with no ledger movement.
  3. **Approved partial OT use (R-06).** Permission record, reservation, partial "record
     use" on or after the leave date, release of the cancelled remainder, compensation of a
     reversal, and posted versus available balance. Concurrent double spending must be
     refused. A day's `ot`-kind leave mismatch gives a warning only.
  4. **Second-user isolation (AC-01, AC-16).** Swap IDs for timesheets, ledger, revisions,
     PDFs, signatures, imports and the opening balance. The administrator sees no timesheet
     details. A share reaches only its enabled items, and revocation applies on the next
     request.
  5. **The overdue and restart path (AC-07, AC-08, docs/05 "Deadline and recovery").**
     Simulate deadlines with `run-jobs --once --now`.
     - Auto-submit off: overdue warning, no export, no send.
     - Auto-submit on, after the activation instant: automatic finalization with the F-1 and
       F-Q2 presentation.
     - Never auto-finalized: an account that never saved its settings, and any period before
       the activation instant or before the account existed.
     - Missed deadlines are recovered in chronological order.
     - Restart before and after the PDF and around the send: an uncertain outcome is not
       blindly resent (AC-08). GET never signs (AC-09).
  6. **Sender and channel faults (AC-14).** A missing sender or recipient shows a fault and
     never "sent". The capture holds exactly the configured recipients, frozen body and PDF.
     No secret or token appears in logs, health, readiness or CLI output.
  7. **Overall verdict:** any blocking integrity, privacy or submission defect under the
     docs/06:36 block list.
- Executable checks (synthetic data, local capture only, Node 24.21.0 by full path):
  - a clean export via `git archive 546cdda` into `<task>/src`, then `npm ci` (no deprecation
    line) and `npm run verify` with `SMOKE_PORT`, `DATA_DIR` and `DATABASE_PATH` set inside
    the task folder;
  - `npm run test:e2e` (Edge; WP4 baseline 145 passed, 5 skipped);
  - targeted re-runs of the suites listed under "Observed" above, which also cover the
    fixture tests (AC-02 regression);
  - the auditor's own scenario probe for items 1-6: a script in the task folder that drives
    the built server over HTTP on a fixed port, uses only `example.invalid` users and
    `run-jobs --once --now` at recorded UTC instants, renders the captured PDF pages to
    `*-synthetic.png` with the devDependency pdfjs-dist, and views them. Stop only servers
    the probe spawned itself, through its own child handle.
- Task folder `D:\.claude-tmp\timesheet\WP5-ASSESS-A`. Ports 47700-47719 for the auditor's
  servers and `SMOKE_PORT`. The e2e fixture picks free ephemeral ports from the OS by
  design. Compose project: none (Docker is not used).
- Digest binding (record all): `reviewed_commit` `546cdda…`; the digest before and after in
  the repository, `git ls-tree` and export forms (as in WP4-REGATE4); Node, npm and Edge
  versions; every command with its exit status and counts; the probe source, saved as
  `*.mjs.txt` in evidence; the masked capture listings (headers, recipients as
  `example.invalid`, body text, PDF SHA-256); and the process listing at the end. The
  verdict is PASS, FIX REQUIRED or NOT VERIFIED, with findings that give file and function,
  reproduction, expected and actual results, rule or AC ID, and a bounded fix. Report
  `handoff/delivery/WP5_REVIEW_A.md` and `.vi.md`; brief/results
  `handoff/delivery/tasks/WP5-ASSESS-A.md`; evidence `handoff/delivery/evidence/WP5-ASSESS-A/`.

#### WP5-ASSESS-B: Release reproducibility, verified restore and operations

- Kind audit; size L; risk H; profile `timesheet-auditor` (xhigh); model opus (same reason as
  area A). Routing {L, H, novelty: true}; override reason `size_risk`. The auditor is a new
  context, separate from area A.
- Scope:
  1. **Complete reproducible release.**
     - From a clean export of `546cdda`: `npm ci` with the lockfile unchanged and no
       deprecation line; `npm audit --omit=dev`; `npm run build` twice from two separate
       exports, then compare the SHA-256 of the `dist/` files and record any difference as
       an observation;
     - the image build is pinned by digest, runs non-root and contains no source maps,
       tests, workbook, `.env` or handoff files;
     - `.env.example` and `compose.example.yaml` are free of secrets;
     - the release can be identified by commit, digest and image ID.
  2. **Verified restore (AC-11, AC-15).** `npm run drill:container -- --work <task>/drill
     --project ts-wp5-assess-b --wp3 <task>/wp3`, stages 1-6, with
     `git archive 49651c8` prepared in `<task>/wp3`. Check: backup under writes, isolated
     restore with hashes and balances, outbound paused, held sends released exactly once,
     the upgrade from schema 6 and the rollback with `JOB_RUNNER=off`. Then restore,
     independently, a backup holding a finalized period, a correction and an OT reservation,
     and compare balances, revisions, file hashes and the PDF. Two routes are acceptable: an
     extra one-off step against the drill's `--keep` instance (removed by project name
     afterwards), or the `restore` CLI against a server the auditor started on ports
     47720-47739.
  3. **Operations privacy (AC-01, AC-15).** `/api/health`, `/api/ready`, the administrator
     operations JSON and CLI output show no private data. The restored instance logs the
     pause.
  4. **Runbook fidelity.** Every docs/11 command maps to an executed drill step or carries
     the label "owner NAS step, unverified". Execute the non-NAS commands that the drill does
     not cover.
  5. **Concrete pilot readiness from the operations side** (WP5_REVIEW:14). What setup and
     rollback information is missing for the packet. Report facts only, never production
     values.
  6. **Overall verdict:** any blocking integrity, privacy or recovery defect.
- Task folder `D:\.claude-tmp\timesheet\WP5-ASSESS-B`, with `drill/`, `wp3/`, `src/`,
  `src2/` and `scratch/` under it. Ports 47720-47739. The drill's own published port is an OS
  free loopback port. Compose project `ts-wp5-assess-b`; the one-off containers use the same
  prefix. At the end, remove the image `ts-wp5-assess-b-timesheet:drill` by exact tag and the
  project by name only.
- Digest binding: as for area A, plus the drill summary lines per stage, the image ID and
  size, the forbidden-file scan count, the `dist/` hash comparison, and the
  `docker ps --all --filter name=ts-wp5-assess-b` listing at the end (empty). Report
  `handoff/delivery/WP5_REVIEW_B.md` and `.vi.md`; brief/results
  `handoff/delivery/tasks/WP5-ASSESS-B.md`; evidence `handoff/delivery/evidence/WP5-ASSESS-B/`.

Rules shared by both areas:

- A timing-sensitive failure while the other area loads the machine is rerun once, alone, and
  both runs are recorded. A recurrence of `ERR_NO_BUFFER_SPACE` is treated as environmental
  (WP3 carry 12).
- Neither auditor fixes anything, writes outside its owned paths, sends real mail or sets
  `PRODUCTION_SENDING_ENABLED`.
- Prior evidence is inspected, not trusted. Carried risks (section F) are judged afresh and
  may be raised as findings when the auditor shows a concrete rule violation.

### C. Pilot packet outline

The tracked packet is `handoff/delivery/WP5_PILOT_PACKET.md` plus its `.vi.md`. The public
repository holds placeholders and synthetic samples only. The owner keeps the real values in
a private copy outside git (D-11).

| Item | Software/documentation work that produces it | Owner input needed (named, not requested here) | Stays owner-controlled |
|---|---|---|---|
| URL | WP5-REL: the runbook's activation section and how to check `PUBLIC_BASE_URL`/`APP_ORIGINS`; the packet holds a placeholder and the check steps (`/api/ready`, sign-in, deep link) | The public HTTPS host name, certificate and reverse-proxy address for `TRUSTED_PROXY_ADDRESSES` | DNS, certificate, proxy, exposure decision |
| Sender and recipients | The packet: `MAIL_FROM` and SMTP mode fields, where per-user recipients and templates are set (user settings, not env), and a self-test step | The sender address and SMTP provider/mode; payroll recipient address(es); whether the first real send goes to the owner's own address (D-12) | SMTP credentials (protected env file only), recipient list |
| Email and PDF samples | WP5-PILOT: generate them from the gated freeze in capture mode with synthetic data. Save the subject, headers with `example.invalid` recipients and body text as `.txt`, and each PDF page as a `*-synthetic.png` render. Cover a manual revision and an automatic revision with the note line off and on | The final template text and note line choice; whether the image goes on automatic submissions | Approval of the exact wording; the real preview on the host, in capture mode, with real recipients |
| Settings | WP5-PILOT: a settings checklist with the env keys (names only), reporting zone, payroll calendar, the 2026 and 2027 company holidays (E-12 warns from 1 October), policy B/N/M, deficit mode, reminders, auto-submit, note line, image authorization, activation instant and first pilot period | The values of each; the 2027 holiday list; an opening balance with evidence, if any (D-10) | Every production value |
| Restore proof | WP5-GATE and the ASSESS-B drill give the development-machine proof (hashes, counts, pause); WP5-PILOT adds a target restore form based on runbook sections 4, 6 and 7 | Running the runbook backup and isolated restore on the NAS with synthetic data before activation, and recording counts and hashes (no personal data) | NAS access; the separate-device copy |
| Rollback | WP5-REL: a rollback card in the runbook. Deactivate: unset `PRODUCTION_SENDING_ENABLED`, set `OUTBOUND_MODE=capture`, clear the activation instant, restart. Keep the data. Fall back to Excel. Restore the pre-activation backup in isolation only if needed, and never run two queues. The packet names the release commit, digest, image ID and the pre-activation backup by name and hash | The R-A3 choice (D-1); the moment of the pre-activation backup | Executing a rollback on production |
| Release identity and NAS checklist | WP5-REL release notes; runbook section 2 | NAS model, DSM version, `uname -m`, data and backup paths, UID/GID, NTP | Hardware; NAS stays NOT VERIFIED until the owner ticks the checklist |
| Authorization record | The packet ends with an unsigned checklist that keeps software readiness, owner permission, provider acceptance and recipient receipt as separate facts (docs/06:38) | The owner's explicit authorization in chat or in the owner's own record | Real sending and activation (board `stop_before`) |

### D. Owner decisions before the pilot

| ID | Question | Options | Recommendation and reason |
|---|---|---|---|
| D-1 (R-A3) | Rollback residual: jobs created after a rollback to an older schema are not held | (a) keep the documented rule: the older build runs with `JOB_RUNNER=off` until reconciliation; (b) `restore --keep-schema --confirm` also clears the activation instant | (a). The pilot is the first installation, so no older production schema exists to roll back to. (b) would make a restore tool change business state. Revisit before the first post-pilot upgrade that adds a migration |
| D-2 (WP4-I-1) | May a draft app period receive imported days | (a) never, current; (b) merge into days without app rows; (c) flag the whole period read-only | (a): the safest option, and no code change |
| D-3 (WP4-I-2) | "Off day (overtime used)" | (a) skip, current; (b) import as Off, no ledger effect; (c) Worked with OT-kind leave | (b) if the owner imports history before the pilot (WP4-T09 recommendation; a small follow-up before the package-final freeze). Otherwise keep (a) and decide after the pilot |
| D-4 (WP4-I-3) | Import an unended period | (a) no, current (stricter `not_due`); (b) yes | (a). Imported history must stay complete and read-only |
| D-5 (WP4-I-4) | Correct a mistaken opening balance to a net zero | (a) yes, by a reasoned offsetting correction; (b) no, current | (a) if an opening balance is recorded at pilot start (D-10), because otherwise a mistaken entry cannot be neutralized. Small follow-up before the freeze |
| D-6 (WP4-I-5) | Uncommitted import previews have no quota | (a) at most 20 per person; (b) no limit, current | (a) as a post-pilot follow-up for an owner-only pilot (self-inflicted storage only). Before the pilot if other people are onboarded |
| D-7 (F-7, WP3 carry 1) | Reminder after a crash on real SMTP may repeat once | (a) accept at-least-once; (b) at-most-once | (a). Reminders are advisory; a rare duplicate is harmless, but a lost reminder could cause a missed deadline |
| D-8 (F-7, WP3 carry 2) | A TLS certificate failure is classified temporary (retries, then intervention) | (a) keep; (b) treat it as a permanent configuration fault, shown at once | (b), subject to the assessment's judgement: docs/05 asks that permanent configuration errors be exposed. If the assessment does not raise it, keep (a) for the pilot and document it |
| D-9 (E-11, F-7) | Pilot cohort and passwords: no self-service password change | (a) owner-only pilot, temporary password set out of band; (b) add a change-password route first | (a) for an owner-only pilot; (b) before anyone else is onboarded |
| D-10 | Opening balance and history at pilot start | (a) record one evidence-backed opening balance; (b) start at zero; also: import the historical workbook on the host or skip it | Record (a) only with evidence. Skip the historical import for the pilot (fewer moving parts); the real workbook never enters git |
| D-11 | Where the real pilot values live | (a) tracked packet with placeholders, real values in a private owner copy; (b) real host and addresses in the public repository | (a): the repository is public (AGENTS rule 4) |
| D-12 | Staging of the first real activation | (a) first period: manual sign-off with real sending, the first real send to the owner's own address, auto-submit off and no activation instant; enable automation from the next period; (b) everything at once | (a). It limits the effect of an unintended automatic submission and checks provider acceptance before payroll sees anything |
| D-13 | Pilot host | (a) the NAS after runbook sections 1, 2, 4 and 6; (b) another host | (a) per docs/07. Until the checklist is ticked, the NAS is NOT VERIFIED and the result is "software ready, pilot pending" |
| D-14 | First release declaration (`git.release_declared`) | (a) at the owner's pilot authorization; (b) after the pilot period | (a): later fixes then follow the branch and PR rule (docs/08). Agents create no tag |
| D-15 (F-Q6) | Holiday-preview privacy (WP2-A-01 removal kept) | (a) keep; (b) restore per-date counts | (a). No effect on an owner-only pilot |

Non-decisions for the owner to note: the 2027 company holiday list (settings input); the
separate-device backup copy (docs/07:26); the independent host alert (runbook section 11).

### E. Provisional task list after the assessment

One source writer at a time. Each writer is followed by its own freeze commit
(`timesheet-committer`, sonnet). Unrun slots are placeholders until the assessment returns.

| ID | Kind / size / risk | Profile, model | Owned paths | Depends on | Freeze point |
|---|---|---|---|---|---|
| WP5-ASSESS-A | audit / L / H | auditor (xhigh), opus | `handoff/delivery/WP5_REVIEW_A.md`, `.vi.md`, `tasks/WP5-ASSESS-A.md`, `evidence/WP5-ASSESS-A/` | WP4-REGATE4, WP5-PLAN | reviews `546cdda` |
| WP5-ASSESS-B | audit / L / H | auditor (xhigh), opus | `handoff/delivery/WP5_REVIEW_B.md`, `.vi.md`, `tasks/WP5-ASSESS-B.md`, `evidence/WP5-ASSESS-B/` | WP4-REGATE4, WP5-PLAN | reviews `546cdda` |
| WP5-OWNQ (coordinator action, no subagent) | ask D-1..D-15 now, in parallel with the assessment | — | board `pending_owner_question` (coordinator) | WP5-PLAN | none |
| WP5-FIX1..n (placeholder) | fix / S-L / per finding | per docs/08: worker-high sonnet for a fix with an existing pattern; worker-high opus for a novel high-risk L fix; expert opus/xhigh on recurrence | only the files a finding names, plus their tests, `tasks/WP5-FIXn.md`, `evidence/WP5-FIXn/`; canonical doc plus `.vi.md` only when a rule changes | the ASSESS audit (`addresses_audit`, not `depends_on`) | WP5-FIXn-FREEZE |
| WP5-OWNFIX (placeholder) | fix or implement / S each / M-H | worker-high, sonnet | as named by the owner answers that differ from the current default (D-3, D-5, D-6, D-8) | owner answer; the last fix freeze | its own freeze |
| WP5-AC13 (optional; decide after the assessment) | implement / M / H | worker-high, sonnet | `tests/e2e/ac13-two-week.spec.ts` or `tests/integration/ac13-two-week.test.ts`, its brief and evidence | ASSESS-A result | its own freeze |
| WP5-REL | documentation / M / H (outbound and rollback instructions) | worker, sonnet | new `docs/12_RELEASE_NOTES.md` and `.vi.md` (release identity, scope, known limits, setup summary); `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md` (new sections: pilot activation, deactivation and rollback card); `README.md` and `.vi.md` (link); `handoff/delivery/WP5_HANDOFF.md` and `.vi.md` (pre-gate snapshot); brief and evidence | the last fix or owner-fix freeze | WP5-REL-FREEZE = the package-final freeze |
| WP5-GATE | gate / L / H | verifier (medium), sonnet | `tasks/WP5-GATE.md`, `evidence/WP5-GATE/` | WP5-REL-FREEZE | gates the package-final freeze: clean export, `npm ci`, verify, e2e, drill `--wp3` (project `ts-wp5-gate`, ports 47740-47759), the AC-13 run (WP5-AC13 test or the ASSESS-A probe), precommit, validators, digest last |
| WP5-PILOT | documentation / M / H (privacy) | worker, sonnet | `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`, `evidence/WP5-PILOT/` (synthetic `.txt` captures, `*-synthetic.png` renders), brief | WP5-GATE PASS | none (only `handoff/`, so the digest is unchanged); ports 47780-47789 |
| WP5-FINAL-AUDIT (integration pass) | audit / L / H | auditor (xhigh), opus | `handoff/delivery/WP5_REVIEW_FINAL.md` and `.vi.md`, brief, evidence | WP5-GATE, WP5-PILOT | reviews the package-final freeze: rechecks every accepted finding, independently re-runs the AC-13 integrated run and a restore, checks the release notes and the packet for accuracy and privacy. Ports 47760-47779; Compose project `ts-wp5-final`. If both areas had several findings, split it into WP5-RECHECK-A and WP5-RECHECK-B plus this pass |
| (on FIX REQUIRED) | fix, then freeze, WP5-REGATEn, recheck | as above | as above | — | new freeze each round |
| WP5-ACCREC | documentation / S / L | light (low), sonnet | the acceptance record in `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`, brief | WP5-FINAL-AUDIT PASS | none |
| WP5-ACCEPT | commit | committer, sonnet | the expected path set | WP5-ACCREC | accept commit; then the owner reviews the packet |
| GOV-RECOVERY (governance, before the mission status `software_ready`) | fix, freeze, gate, audit / S / M | worker, then committer, verifier sonnet, auditor opus | `handoff/delivery/check_recovery.py` (governance path) | WP5-ACCEPT (or any gap without a running writer) | its own GOV freeze |

Count without fix rounds: 2 audits, REL, its freeze, gate, PILOT, the final audit, ACCREC and
ACCEPT come to 9 dispatches. Optional AC13 (2) and owner fixes (2 each). Each fix round
(fix, freeze, regate, recheck) adds 4. GOV-RECOVERY adds 4.

### F. Carry-forward triage (STATE `carried_risks` and the WP4 backlog line)

Legend: **PB** pilot-blocking, **PR** pilot-relevant (document only), **PP** post-pilot. The
assessment may raise any item as a finding; this triage is not an audit.

| Item | Class | Rationale |
|---|---|---|
| WP1 partial break-list semantics at Clock out | PP | Defined by coordinator decision E-1; unconfirmed rows never reach OT |
| WP1 future break rows on open sessions; unconfirmed Clock out 422 | PR | A user-visible refusal; the pilot notes should say how to confirm breaks |
| WP1 Clock out lacks `expected_version` | PP | Single user, one device in the pilot |
| WP2 R1, R2, R4, A4-01 | PP (closed) | Closed by WP3 T06, T00 and T05 (WP3_HANDOFF item 13) |
| WP2 R3 `calendar_in_use` 409 reveals data | PP | Accepted CALFIX decision; administrator-only surface |
| WP2 A3-01 audit payload field | PP | Respected by the T13D allowlist; matters only for a future admin audit view |
| WP2 ADV-A-05 duplicate append path | PP | Info; consolidation is optional |
| WP2 F1 missing screenshot | PP | Evidence gap only |
| WP2 owner option: prospective calendar reassignment | PP | Owner option; not needed for one user |
| WP3 R1 long holiday label ellipsis in the PDF | PR | Visible in the PDF sample; the owner judges it in the packet |
| WP3 R2 signature count outside the transaction | PP | Bounded overshoot, no rule ID |
| WP3 R4 reviewed hash includes the OT balance | PR | A review can go stale after OT movements; the notes must say "reload and review again" |
| WP3 R5 sign-off before the period end allowed | PR | Accepted interpretation; the notes state it |
| WP3 R6 hint and payload in two transactions; hint unbounded | PP | Integrity unaffected; 35.5 ms at 50,000 rows |
| WP3 R7 share marker | PP (closed) | Closed by WP4-T02 |
| WP3 R8 never-configured accounts get before-due reminders | PR | Packet step: save the submission settings before activation; the administrator "not set up" flag exists |
| WP3 R9 seed events show as automatic | PR | Runbook note; history readability only |
| WP3 hint shows a count; HEAD audit | PP | Presentation; HEAD part closed by WP4-T02 |
| WP3 real SMTP: reminder repeat, TLS as temporary, send before PDF | PB (decision) / PR | D-7 and D-8 need answers before activation; the send-before-PDF attempt is documented (one retry after a minute) |
| WP3 test gaps (activation cleared mid-scan, `not_active`, `before_account`) | PP | Low; the assessment may judge them in the AC-13 run |
| WP3 F-Q6, ADV-A-05, WP2 B4 optional items | PP | D-15; polish |
| WP4 R-A2 `SQLITE_BUSY` for concurrent openers of a new database | PR | Setup notes: migrate once before the first start (docs/07 step 2) |
| WP4 R-A3 rollback residual | PB (decision) | D-1 must be answered before the pilot (STATE wording) |
| WP4 R-A6 relaxed job-count pins | PP | Test strength; the assessment may judge it |
| WP4 R-A8 CLI falls back to the development database without `DATABASE_PATH` | PR | Production refuses a missing path (`config.ts`, WP4-T01); the runbook must keep both paths explicit for host CLI use |
| WP4 REVIEW_B R2 planBatch imported dates | PP | Imported periods are already read-only |
| WP4 R-RA1, R-RA3..R-RA7 | PP | Info items |
| WP4 R-RA2 a same-day `--prune` removes the paired pre-upgrade backup | PR | Upgrade notes: copy the pre-upgrade backup aside, or prune on another day |
| WP4 R-RA8 early 413 with connection reuse | PP | Not seen in a browser |
| WP4 R-RA9 restore onto a dangling junction | PR | The runbook restore target must be a new real folder |
| WP4 R-B4-1 lenient encoding declaration | PP | No crash or bound issue found |
| WP4 R-B4-2 / I-5 no preview quota; NAS NOT VERIFIED | PB (NAS) / PP (quota) | The NAS must be verified by the owner before activation (D-13); quota per D-6 |
| WP4 R-B4-3 more than 64 sheets refused | PR | Only matters if history is imported (D-10) |
| WP4 R-B4-4 the bound covers 61 unit families | PP | Accepted derivation |
| Owner questions WP4-I-1..I-5 | PR | D-2..D-6; safe defaults stand |
| WP4 handoff: prune status not recorded; retention not on screen; held sends cannot be dropped | PR | Runbook notes |
| Dev-only `source-map-js` advisory | PP | Not in the image (`npm audit --omit=dev` 0) |
| Temporary passwords, no change route | PR / PB if more users | D-9 |
| Governance backlog: GOV-E8-AUDIT R1 (`check_recovery` independent of the live status) | Mission-closure blocking (not a software defect) | The backlog says it is needed before status `software_ready`: GOV-RECOVERY |
| Governance backlog: GOV-E8 R2, WF-AUDIT3, GOV-WP3P R1-R3, evidence whitespace note | PP | Wording and translation polish (GOV) |

### G. Runtime rules for every WP5 brief (from the board `runtime_observations`)

1. Git Bash only. Never `cmd.exe` in any form and never an interactive shell (WP4-DEC,
   WP3-AUDIT-A). Run npm and node from Git Bash with Node 24.21.0 by full path first on
   PATH; record `node --version`. The bare `node` on PATH is v26.10.0.
2. Never feed anything to python or node through stdin (`python -`, `node -`, heredocs,
   pipes, REPL); write probes to files in the task folder (WP4-AUDIT-B, WP4-REGATE3).
3. Never pipe probe or server output into `head` or `tail`. Use explicit free ports from the
   brief's range. Stop only servers you spawned, through their own handle; never kill by PID
   (WP4-REGATE4).
4. Any CLI call sets both `DATA_DIR` and `DATABASE_PATH` inside the task folder; never rely
   on defaults (WP4-GATE migrated the owner's development database).
5. Raw output only under `D:\.claude-tmp\timesheet\<task>`. Only masked LF `.txt` copies go
   to `handoff/delivery/evidence/<task>/`: profile segment `<user>`, email tokens `<email>`
   unless `example.invalid`. No deletion inside the repository, no recursive removal, no
   redirect to `/dev/null` or `nul`, nothing written into the repository root (WP3-FIX2,
   WP3-T06-FREEZE).
6. Source and test files use neutral synthetic roots built at run time, never user-profile
   path literals or password-like literals (WP3-T01-FREEZE, WP3-T13B-FREEZE). Run the
   precommit check over your own evidence before hand-back.
7. Order inside a writer task: edits, tests, `npm run verify`, e2e if UI, precommit check,
   then `npm run digest` last; rerun the digest if any file changes (WP3-T07-FREEZE).
8. Write task results with the Edit tool, not shell heredocs (WP4-DEC). Briefs contain no
   markdown links to files that do not yet exist (WP3-T14-FREEZE).
9. If a permission check denies a call, stop and report; never retry, split or rephrase it
   (classifier observations 2026-10-02 to 2026-10-05).
10. Docker: task-unique Compose project names, removal by name or exact tag only, non-TTY
    flags only (`exec -T`).
11. Coordinator-side rules restated for the dispatch: no new handoff file while a commit
    task runs (WP4-T02-FREEZE); a done gate or audit decision is exactly PASS / FAIL / NOT
    VERIFIED or PASS / FIX REQUIRED / NOT VERIFIED; fix tasks use `addresses_audit`, never
    `depends_on`, for a non-PASS audit; done commit tasks record `branch`, `commit_sha` and
    `pushed`.
12. Scratch drive: if a shell call fails with ENOSPC on the temp drive, stop and report.
    Only the owner can free space (WP3-T06-FREEZE).

### Next dispatch recommended

Dispatch WP5-ASSESS-A and WP5-ASSESS-B in parallel (fresh opus auditors, xhigh), on
`546cdda` / `26fcc969`, with WP4-REGATE4 as the gate dependency. At the same time, put
D-1..D-15 to the owner as one `pending_owner_question`.

### Commands run (all exit 0)

`node --version` (system and Node 24); `git rev-parse HEAD origin/main`; `git status --short`;
`git diff --stat 546cdda e7fe514 -- . ':!handoff'`; `node scripts/source-digest.mjs`;
the `git ls-tree` digest form for HEAD and `546cdda`; read-only `node -e` extractions of
board fields into the task folder; `docker --version`; `docker compose version`;
`git --version`; read-only `grep`/`sed`/`ls` over docs, handoff records, scripts, tests and
source. Nothing was built, started, pulled or tested.
