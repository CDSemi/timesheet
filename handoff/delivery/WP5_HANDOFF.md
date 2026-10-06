# WP5 handoff — Independent acceptance and pilot preparation

Completed from [HANDOFF](../templates/HANDOFF.md). Translation: [WP5_HANDOFF.vi.md](WP5_HANDOFF.vi.md). The sections up to "Orchestration provenance" are the WP5-REL snapshot taken before the WP5 package-final gate; where they differ from the acceptance record at the end, the record wins. The acceptance record was filled by WP5-ACCREC (records only, no source edit) after WP5-RECHECK passed. No figure was re-run to write it; every figure is taken from the board, the gate notes and the review files.

## Handoff record

- **Package/scope, date and author:** WP5 only, per [WP5-PLAN](tasks/WP5-PLAN.md), [WP5_IMPLEMENT](../prompts/WP5_IMPLEMENT.md) and [09 Roadmap](../../docs/09_IMPLEMENTATION_ROADMAP.md). Snapshot of 2026-10-06, written by the WP5-REL task ([brief](tasks/WP5-REL.md)).
- **Actual model/effort/speed, or not observable:** WP5-REL: self-reported `claude-sonnet-5-5` (profile timesheet-worker); effort and speed are not observable from inside the session. Other tasks self-report in their own briefs.
- **Commit SHA, source digest and unpushed commits, or complete source archive:**
  - Base of WP5-REL: commit `8e99d2c6375f71ac94faff9eb859b9b7bcf3e741` (WP5-AC13-FREEZE), equal to `origin/main`, digest `1e59ad31d9af2a3f4a3aa5711647ea8742e1534b3d4f8ba4f2210beee44a3d2c` over 777 files (`handoff/` excluded).
  - WP5-REL was frozen as `74d5bfec6700126da4105b5d97f5efe943f896f5` (digest `0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba`, 779 files). The accepted source is later: commit `014bd47a8d906c944d2781eba4f2b91c5a532419`, digest `150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61`, 779 files (see the acceptance record).
  - Commits of the accepted candidate: WP1 to WP4 accepted at `546cddaf6747aef85e8b6d9b7712de9e28f138bf`, digest `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081` (775 files); WP4 accept record `e7fe5144dc62f5047c79dd5ef69d973f60dfd14d`.
- **Implementation status; independent review status:**
  - Done and frozen at the time of the snapshot: the independent assessment (area A PASS, area B FIX REQUIRED with B-01 Medium and B-02 Low, both documentation), the runbook fix WP5-FIXB (commit `85838b515a86b3cca40cfbba189ba290ec06de58`) and the integrated AC-13 test WP5-AC13 (commit `8e99d2c6375f71ac94faff9eb859b9b7bcf3e741`).
  - Later: WP5-REL frozen, gated (WP5-GATE, WP5-REGATE, WP5-REGATE2 PASS), finally audited and rechecked (WP5-RECHECK PASS). See the acceptance record.
- **Implemented behavior and changed files:**
  - WP5-FIXB (`85838b5`): `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md` (the Compose binding, per-release image tags and the env-file copy), one comment in `.env.example` and one in `compose.example.yaml`.
  - WP5-AC13 (`8e99d2c`): `tests/integration/ac13-two-week.test.ts` and `tests/integration/ac13-support.ts`; no application source changed.
  - WP5-REL (this snapshot, documentation only): new `docs/12_RELEASE_NOTES.md` and `.vi.md`; `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md` (sections 13 to 16, new placeholders, command-map rows); a link row in `README.md` and `README.vi.md`; this handoff pair. No application source, test, Compose behaviour or migration changed.
- **Migrations/schema compatibility:** unchanged by WP5. Latest schema 13 (migrations 0007 to 0013 are WP4's; see [WP4 handoff](WP4_HANDOFF.md)).
- **Changed canonical contracts and reason, or none:** none. `docs/11` gains sections 13 to 16 as the runbook that [11](../../docs/11_OPERATIONS_RUNBOOK.md) deferred to the pilot; no rule of docs/01 to 10 changed.
- **Verification table:**

  | Command | Environment | Exit status | Observed result | Evidence path |
  |---|---|---|---|---|
  | Assessment area A: clean export of `546cdda`, integrated workflow probe | Node 24.21.0, capture mode, synthetic | not restated | PASS: 77 of 77 checks, fault instance 12 of 12 | `evidence/WP5-ASSESS-A/` |
  | Assessment area B: reproducible release, drill stages 1 to 6, independent restore | Docker Desktop, linux/amd64, synthetic | not restated | findings WP5-B-01 (Medium) and WP5-B-02 (Low), both documentation | `evidence/WP5-ASSESS-B/` |
  | WP5-AC13 `npm run verify` | Node 24.21.0 | 0 | 77 test files, 1,759 tests, smoke passed | `evidence/WP5-AC13/verify.txt` |
  | WP5-REL checks | Node 24.21.0 | see the WP5-REL brief | EN/VI parity, env-key check, verify, precommit, preflight, digest | `evidence/WP5-REL/` |

  The exact figures are in the named evidence. The final figures are in the acceptance record.
- **AC IDs covered; genuinely unrun/blocked paths:**
  - AC-13 has an integrated test (WP5-AC13) and an independent probe (area A). AC-14 and AC-15 are covered in capture mode and by the WP4 drill and the area B restore.
  - Unrun: real SMTP (reminder repeat, certificate failure, send before the PDF), the NAS target (NOT VERIFIED), the owner's real pilot period, and the section 13 to 16 steps of the runbook (written from the code; no drill stage covers them).
- **Synthetic screenshots/PDF/mail-capture evidence:** PDF renders `*-synthetic.png` and masked capture listings are in `evidence/WP5-ASSESS-A/`. The exact pilot email and PDF samples belong to WP5-PILOT and do not exist yet.
- **Findings resolved, remaining defects and optional backlog:**
  - Resolved: WP5-B-01 (Medium, Compose binding) and WP5-B-02 (Low, env file kept with off-device backups) by WP5-FIXB; WP5-FINAL-AUDIT confirmed both resolved.
  - Risks carried into the release notes ([12 Release notes](../../docs/12_RELEASE_NOTES.md)): R-WA1 to R-WA3 and R-WA8, R-B5-1, R-B5-2, R-B5-4, and the pilot-relevant items of [WP5-PLAN](tasks/WP5-PLAN.md) section F.
  - Governance backlog before the mission status `software_ready`: GOV-RECOVERY (`check_recovery.py` independent of the live status).
- **Owner setup inputs needed, excluding secrets:** the NAS model, DSM version and `uname -m`; data and backup paths; UID and GID; the HTTPS host name and the proxy address; the SMTP provider and mode and the sender address; payroll recipient addresses and the owner's own address for the first send; the 2027 company holiday list; an opening balance with evidence, if any. Real values stay in the owner's private copy outside git.
- **Open owner decisions (all pending; each is recommended, none is decided):** the full table is in [WP5-PLAN](tasks/WP5-PLAN.md) section D.

  | ID | Recommended option (owner decision pending) |
  |---|---|
  | D-1 (R-A3) | Keep the rule: an older build runs with `JOB_RUNNER=off` until reconciliation |
  | D-2 (WP4-I-1) | A draft period never receives imported days (current) |
  | D-3 (WP4-I-2) | Import "Off day (overtime used)" as Off with no ledger effect, if history is imported before the pilot; otherwise keep skip |
  | D-4 (WP4-I-3) | An unended period is not imported (current) |
  | D-5 (WP4-I-4) | Allow a reasoned correction of the opening balance to a net zero, if one is recorded |
  | D-6 (WP4-I-5) | A quota of 20 uncommitted previews per person, after the pilot (before it if others are onboarded) |
  | D-7 (WP3 carry 1) | Accept at-least-once reminders after a crash on real SMTP |
  | D-8 (WP3 carry 2) | Classify a TLS certificate failure as a permanent configuration fault (subject to the assessment) |
  | D-9 (E-11) | Owner-only pilot, temporary password out of band; a change-password route before anyone else |
  | D-10 | One evidence-backed opening balance or zero; no historical import for the pilot |
  | D-11 | Tracked documents hold placeholders; real values in the owner's private copy |
  | D-12 | Staged first period: manual sign-off, first real send to the owner's own address, auto-submit off, no activation instant; automation from the next period |
  | D-13 | The NAS host stays NOT VERIFIED until the owner ticks the docs/11 checklist |
  | D-14 | Declare the first release at the owner's pilot authorization; fixes then go through branches and pull requests; agents create no tag |
  | D-15 (F-Q6) | Keep the removed holiday-preview counts removed |
- **Production actions and explicit authorization, normally none:** none. No deployment, no real email, no real data. `PRODUCTION_SENDING_ENABLED` is never set and the activation instant is empty. Owner authorization is not requested and not given.
- **Usage/credits only if actually observable:** not observable in this session.
- **One next action and matching prompt:** the coordinator records WP5-ACCEPT on `014bd47` / `150420e7…`, has the uncommitted packet changes committed, then asks the owner for the D-1 to D-15 answers and the pilot authorization with the pilot packet ([WP5_PILOT_PACKET](WP5_PILOT_PACKET.md)); GOV-RECOVERY remains before the mission status `software_ready`.

## Orchestration provenance

- **Mission/task IDs and board/checkpoint:** mission `timesheet-software-readiness`, package WP5; tasks WP5-PLAN, WP5-ASSESS-A, WP5-ASSESS-B, WP5-FIXB, WP5-FIXB-FREEZE, WP5-AC13, WP5-AC13-FREEZE and WP5-REL at the snapshot (the later tasks are in the acceptance record). Board: [ORCHESTRATION.json](ORCHESTRATION.json); checkpoint: [WORKFLOW_REVISION_CHECKPOINT.md](WORKFLOW_REVISION_CHECKPOINT.md).
- **Implementer and independent auditor identities; separate contexts:** every task ran in its own subagent context. The two assessment auditors authored no change. The final audit must be a fresh context that authored no WP5 change, including this one.
- **Current verified/reviewed digest; review report and decision:** [WP5_RECHECK](WP5_RECHECK.md): PASS on `014bd47a8d906c944d2781eba4f2b91c5a532419`, digest `150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61` (779 files). Earlier reviews are listed in the acceptance record.
- **Remaining tasks/dependencies; one next coordinator action:** WP5-ACCEPT, then GOV-RECOVERY. Next coordinator action: record WP5-ACCEPT, then ask the owner.
- **Software readiness and pending owner pilot authorization separately:** software readiness of WP5: accepted (the NAS is NOT VERIFIED). Owner pilot authorization: not requested and not given. Pilot result: none.

## Acceptance record (WP5-ACCEPT)

Prepared by WP5-ACCREC (records only, no source edit). The sections above are the WP5-REL snapshot and are superseded by this record where they differ (for example the digest, the "not yet gated" statements and the open findings). Sources: the board tasks WP5-PLAN to WP5-RECHECK (`decision`, `findings`, `notes`, `gate_notes`, `history`), `pending_owner_question`, `owner_decisions` and `runtime_observations`, the task briefs and their Results, and the reports [WP5_REVIEW_A](WP5_REVIEW_A.md), [WP5_REVIEW_B](WP5_REVIEW_B.md), [WP5_REVIEW_A2](WP5_REVIEW_A2.md), [WP5_REVIEW_FINAL](WP5_REVIEW_FINAL.md) and [WP5_RECHECK](WP5_RECHECK.md). No figure was re-run. A reported result is not independent proof; the independent proofs are the audits listed below.

- **Accepted source:** commit `014bd47a8d906c944d2781eba4f2b91c5a532419` (WP5-FIXD2-FREEZE, pushed; equal to `origin/main`), source digest `150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61` over 779 files, `handoff/` excluded (WP5-REGATE2 PASS; WP5-RECHECK PASS on the same commit and digest; the repository, the `git ls-tree` form and the clean `git archive` export agree). Final figures:
  - WP5-REGATE2 on `014bd47`: `npm ci` exit 0 with the lockfile unchanged and no deprecation line; lint exit 0; `npm run verify` exit 0 with 77 files, 1,759 tests and smoke passed; `npm audit --omit=dev` 0 vulnerabilities; `validate_package.py --preflight`, the orchestration validator and `check_recovery.py` exit 0/0/0;
  - WP5-REGATE (full gate) on `9bcdd88`: 77 files, 1,759 tests, smoke passed; e2e 145 passed and 5 skipped; drill stages 1 to 6 with `--wp3`, 208 `PASS` and 0 `FAIL` (33/31/57/35/27/23), image `sha256:bd17d061…` (110,002,055 bytes), forbidden-file scan passed; `docker compose config` for the live, restored and rollback forms, exit 0 three times;
  - WP5-REGATE2 did not repeat the drill and e2e: the delta since `9bcdd88` is one line in each of `docs/11_OPERATIONS_RUNBOOK.md` and its `.vi.md`, and every non-documentation file is byte-identical, so the 208 and 145 results carry over;
  - WP5-RECHECK, independent, on a clean export of `014bd47`: `npm run verify` exit 0 (1,759 tests, smoke passed); AC-13 alone exit 0; built-server probe 27 `PASS`, 0 `FAIL`;
  - `dist/` identity: 230 files, 4,044,281 bytes, byte-identical between `9bcdd88` and `014bd47` (WP5-REGATE2) and between `74d5bfe` and `014bd47` (WP5-RECHECK); WP5-FINAL-AUDIT found it also equal to the `546cdda` build;
  - NAS NOT VERIFIED; real SMTP never exercised (`PRODUCTION_SENDING_ENABLED` is never set).
- **AC-13** (the integrated two-week scenario):
  - Integrated run: WP5-ASSESS-A attempt 1 on `546cdda`, a pilot-shaped instance in production mode with capture mail and five synthetic users: probe run of record 12 gave 77 `PASS` and 0 `FAIL`, and the fault probe run of record 3 gave 12 `PASS` and 0 `FAIL`. Attempt 2 on `74d5bfe` re-ran a built-server probe (26 `PASS`, 0 `FAIL`, run 2 of record; run 1 had a probe defect).
  - Committed test: WP5-AC13 (`8e99d2c`), `tests/integration/ac13-two-week.test.ts` and `tests/integration/ac13-support.ts`, one deterministic test with no application source change. It covers 14 dates, the credited total of 8:30 and a single ledger posting, a restart around the send with no blind resend, a correction (revision 2, only +30), a concurrent double spend refused, second-user isolation (11 swapped identifiers) and the overdue path.
  - Repeat runs: WP5-AC13 three runs, 1,705, 1,739 and 1,754 ms, all exit 0; WP5-GATE three runs, 4.08, 4.07 and 4.13 s; WP5-REGATE three runs, 3.00, 2.91 and 2.97 s; WP5-ASSESS-A attempt 2 three runs plus four machine zones and two moved wall clocks; WP5-FINAL-AUDIT two runs plus `TZ=Asia/Tokyo`; WP5-REGATE2 and WP5-RECHECK one run each. All passed.
  - Real time zones: WP5-REGATE, with a wrapper that sets the zone in the vitest child environment and a probe test that printed the zone the process saw: Asia/Tokyo (offset -540) and America/New_York (offset 300), 2 tests passed each, exit 0, on a machine whose zone is America/Los_Angeles. WP5-ASSESS-A attempt 2 re-proved this with a preload (risk R-A2-3: the earlier `TZ` runs of WP5-AC13 never changed the zone, because Git Bash drops `TZ`).
  - Mutations (scratch copy, never the repository): WP5-AC13 mutation 1 (the N threshold skipped, `> 0`) failed with `credit 2026-09-24: expected 30 to be +0`; mutation 2 (credits posted twice) failed; WP5-ASSESS-A attempt 2 repeated mutation 1 (fails) and added its own mutation 3 (a signature read without its ownership filter), which failed with `expected [403, 404] to include 200`. All mutated files were restored.
- **Gate chain** (verifier, clean export, Node 24.21.0, capture only):
  - WP4-REGATE4 PASS on `546cdda` (`26fcc969…`, 775 files): the assessment base;
  - WP5-GATE PASS on `74d5bfe` (`0a64a75f…`, 779 files): 77 files and 1,759 tests, e2e 145 passed and 5 skipped, drill 208 `PASS`, image `sha256:0addd200…`, AC-13 three times;
  - WP5-REGATE PASS on `9bcdd88` (`1b8ceae4…`, 779 files);
  - WP5-REGATE2 PASS on `014bd47` (`150420e7…`, 779 files).
- **Audit chain** (each auditor a fresh `timesheet-auditor` context, self-reported `claude-opus-5-5`, with no WP1–WP5 authorship):
  - WP5-ASSESS-A attempt 1 on `546cdda`: PASS, no finding; risks R-WA1 to R-WA8;
  - WP5-ASSESS-A attempt 2 on `74d5bfe`: FIX REQUIRED, two Low documentation findings (A2-01 the runbook said the status shows the sending flag; A2-02 the capture self-test named a deep link in a captured message that does not exist); the software passed every area-A check;
  - WP5-ASSESS-B on `546cdda`: FIX REQUIRED (B-01 Medium: runbook commands did not bind the env file, data folder or release image; B-02 Low: the env file was not kept with the off-device backup);
  - WP5-FINAL-AUDIT on `74d5bfe`: FIX REQUIRED (F-01 Low: the same status-flag claims in the runbook and the packet; F-02 Low: packet section 8 named a step already past), with B-01 and B-02 resolved and area B passing on the new digest (drill 208 `PASS`, an independent verified restore, a reproducible release);
  - WP5-RECHECK on `014bd47`: PASS, no finding; F-01, F-02, A2-01 and A2-02 resolved; the small risk fixes are accurate.
- **Writers and fixes** (profile as recorded on the board; model self-reported):
  - WP5-FIXB, freeze `85838b5` (digest `ed604d0c…`, 775 files): the Compose binding, per-release image tags and the env-file copy in docs/11, for B-01 and B-02;
  - WP5-AC13, freeze `8e99d2c` (digest `1e59ad31…`, 777 files): the committed AC-13 test;
  - WP5-REL, freeze `74d5bfe` (digest `0a64a75f…`, 779 files): `docs/12_RELEASE_NOTES.md`, docs/11 sections 13 to 16 and a README row;
  - WP5-PILOT: the pilot packet, handoff only (no digest change);
  - WP5-FIXD, freeze `9bcdd88` (digest `1b8ceae4…`): F-01, A2-01, A2-02 and F-02, with small risk fixes R-A2-1, R-A2-2, R-F1, R-F4, R-F5 and R-F6;
  - WP5-FIXD2, freeze `014bd47` (digest `150420e7…`): the last status-flag sentence in docs/11 section 12; a sweep of docs/05, 07, 11, 12, README and the packet found no other hit;
  - WP5-PKTID: the release identity of the packet refreshed to `014bd47` and `150420e7…`, handoff only; its changes are uncommitted handoff files and have no commit yet (the coordinator has them committed).
  - The workers self-report `claude-sonnet-5-5`.
- **The pilot packet:** [WP5_PILOT_PACKET](WP5_PILOT_PACKET.md) and its `.vi.md`. It holds placeholders and synthetic samples only: the release identity, the URL checks, sender and recipients with the capture-mode self-test, email and PDF samples (8 captured messages, 4 PDFs, 4 renders), the settings checklist, the restore proof with a blank NAS form, the rollback card, the NAS checklist, the D-1 to D-15 table, an unsigned authorization record and the known limits. Nothing is ticked and every owner decision reads pending. Real values stay in the owner's private copy outside git (D-11).
- **Owner decisions D-1 to D-15:** all pending; each recommendation is a recommendation, not a decision (the board `owner_decisions` has no answer). They are listed with their recommendations in the table above ("Open owner decisions"). D-1, D-7, D-8 and D-13 must be answered before activation. An answer that differs from the current default for D-3, D-5, D-6 or D-8 causes a fix round (fix, freeze, gate, independent audit) before activation, after which the release identity in the packet is refreshed.
- **Carried risks** (none blocks acceptance):
  - NAS NOT VERIFIED (DSM, `sudo -i`, the reverse proxy, the real bind mount, the host alert, a native arm64 image) and real SMTP never exercised (D-7, D-8);
  - from WP5-ASSESS-A: R-WA1 (Low) outcome-notice wording after downtime recovery; R-WA2 (Low) partial leave not visible on the PDF; R-WA3 (Low) never-configured accounts, including the bootstrap administrator, get before-due reminders after activation; R-WA4 (Info) a share change issues a new identifier; R-WA5 (Info) a probe-side keep-alive reset; R-WA6 (Info) a long holiday label is cut with an ellipsis; R-WA7 (Info) the live runner path is covered by e2e and suites, not by the CLI-driven probe; R-WA8 (Info) days without records print "Worked" on automatic PDFs (owner decision);
  - from WP5-ASSESS-B: R-B5-1 the image ID differs for every build of the same source, so the NAS image ID is recorded at build time; R-B5-2 the pinned base image is one Debian rebuild behind the tag (decide the refresh before the pilot build); R-B5-3 the `source-map-js` advisory is dev-only; R-B5-4 a restored instance reports backup `never` until its first own backup; R-B5-5 a same-day `--prune` removes the paired pre-upgrade backup (R-RA2); R-B5-6 Git Bash rewrites container paths for a Windows operator; R-B5-7 `migrate` prints the absolute `DATABASE_PATH`;
  - from WP5-ASSESS-A attempt 2: R-A2-1 and R-A2-2 (fixed in the text), R-A2-3 (TZ runs, closed by WP5-REGATE), R-A2-4 an overdue warning can follow its overdue record by up to one five-minute bucket, R-A2-5 optional test additions;
  - from WP5-FINAL-AUDIT: R-F1 and R-F4 to R-F6 (fixed in the text), R-F2 how a restored copy becomes the live instance after a rollback (document before relying on it), R-F3 image IDs per build (R-B5-1), R-F7 the base-image pin (R-B5-2);
  - from WP5-RECHECK (all Info, optional): R-RC-1 the `grep -c` flag check matches only the canonical line (a quoted `"true"`, or a CRLF line end on Linux, prints 0); R-RC-2 section 13 step 6 says "only after step 7 passes" while the first-reminder link bullet of step 7 can only run after step 5; R-RC-3 packet section 8 names only D-8, and D-5 recommendation (a) also differs when an opening balance is recorded; R-RC-4 section 6 step 3 still says "capture mode" for a restored instance after activation; R-RC-5 the root note covers sections 13 to 16 and not the commands of sections 4, 6 and 8; R-RC-6 sections 3 and 5 of the packet cite WP5-REGATE2 for the identical `dist/`, which compared `9bcdd88`, while WP5-RECHECK compared `74d5bfe` directly;
  - WP1–WP4 items classed pilot-relevant (PR) in [WP5-PLAN](tasks/WP5-PLAN.md) section F, documented in the runbook and release notes:
    - future break rows on open sessions and the unconfirmed Clock out 422;
    - WP3 R1 long holiday label; R4 the reviewed hash includes the OT balance (reload and review again); R5 sign-off before the period end allowed; R8 never-configured accounts (save the submission settings before activation); R9 seed events show as automatic;
    - WP4 R-A2 `SQLITE_BUSY` for concurrent openers of a new database (migrate once before the first start); R-A8 the CLI falls back to the development database without `DATABASE_PATH` (keep both paths explicit); R-RA2; R-RA9 a restore target must be a new real folder; R-B4-3 more than 64 sheets refused;
    - the WP4 handoff notes: prune status not recorded, retention not on screen, held sends cannot be dropped from the screen;
    - temporary passwords with no change route (D-9);
  - pilot-blocking items, as decisions: D-1 (R-A3), D-7 and D-8 (WP3 carry-over), and D-13 (the NAS); the governance item GOV-RECOVERY (`check_recovery.py` independent of the live mission status) before the status `software_ready`.
- **Runtime incidents** (2026-10-06, one line each, no process identifiers):
  - WP5-PILOT: a worker fed an empty heredoc to `python` on stdin; a background task looped on an error and wrote a very large output file outside the repository; the coordinator stopped it, and the file is left for the owner to delete (the fourth stdin incident);
  - WP4-REGATE4: a probe piped into `head` left one Node 24 server child running, and one stray recursive-delete form had no effect; the coordinator stopped the agent, and a later process listing shows no such process left;
  - WP4-REGATE3 and earlier: agents fed empty heredocs to `python -`; the coordinator stopped the blocked background tasks, and dispatch prompts now state the no-stdin rule in capitals;
  - WP4-AUDIT-B: a heredoc probe opened an interactive Python REPL that looped and wrote about 2.5 MiB/s outside the repository; the coordinator stopped it and the file is left for the owner to delete;
  - WP4-GATE: a first migrate probe ran without `DATABASE_PATH` and migrated the owner's local development database (outside the repository, dev data only); later checks used task-local paths.
- **O-1 correction (from WP5_REVIEW_FINAL):** WP5-B-01 is Medium. The snapshot above called the area-B findings "two low documentation findings" and "(low, documentation)"; those places are corrected. WP5-B-02 is Low.
- **Separation of three outcomes:**
  - software readiness of WP1–WP5: accepted. WP5 is implemented, gated (WP5-REGATE2 PASS, with WP5-GATE and WP5-REGATE on the earlier freezes) and independently audited (WP5-RECHECK PASS on `014bd47`, digest `150420e7…`), with the NAS target NOT VERIFIED; the coordinator records WP5-ACCEPT;
  - owner permission: not requested here, and not given. The pilot packet is ready for the owner's review. No deployment, no real email, no real data, `PRODUCTION_SENDING_ENABLED` never set, and no activation instant on any real instance;
  - pilot result: none; no pilot has run.
