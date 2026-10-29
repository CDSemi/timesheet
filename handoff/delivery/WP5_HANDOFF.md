# WP5 handoff — Independent acceptance and pilot preparation

Completed from [HANDOFF](../templates/HANDOFF.md). Translation: [WP5_HANDOFF.vi.md](WP5_HANDOFF.vi.md). The sections up to "Orchestration provenance" are the WP5-REL snapshot taken before the WP5 package-final gate; where they differ from the acceptance record at the end, the record wins; the current record is the last section, "Re-acceptance after UI change rounds 4 and 5 (WP5-UX4, WP5-UX5)". The acceptance record was filled by WP5-ACCREC (records only, no source edit) after WP5-RECHECK passed. No figure was re-run to write it; every figure is taken from the board, the gate notes and the review files.

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
- **Current verified/reviewed digest; review report and decision:** [WP5_RECHECK](WP5_RECHECK.md): PASS on `014bd47a8d906c944d2781eba4f2b91c5a532419`, digest `150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61` (779 files). Earlier reviews are listed in the acceptance record. This was the acceptance at the snapshot; the current acceptance is in the section "Re-acceptance after UI change rounds 4 and 5 (WP5-UX4, WP5-UX5)".
- **Remaining tasks/dependencies; one next coordinator action:** WP5-ACCEPT, then GOV-RECOVERY. Next coordinator action: record WP5-ACCEPT, then ask the owner. This was the next action at the snapshot; the current next action is in the last section.
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

## Re-acceptance after the UI change round (WP5-UX)

This section is added after the older acceptance record above, which is kept unchanged as history (its identity `014bd47` / `150420e7…` was the first accepted WP5 snapshot). Sources: the board [ORCHESTRATION.json](ORCHESTRATION.json) (tasks `WP5-UX-*`, `owner_decisions`, `coordinator_decisions`), the [checkpoint](WORKFLOW_REVISION_CHECKPOINT.md) and the reviews named below. A reported result is not independent proof; the independent proofs are the audits.

- **Owner request and answers:**
  - 2026-10-08, the owner asked for a more beautiful, easier UI with the Timesheet page laid out like the sample Excel workbook (verbatim in `owner_decisions`). The coordinator ran it as a WP5 change round before pilot activation (no new package).
  - E-1..E-7 (plan [WP5-UX-PLAN](tasks/WP5-UX-PLAN.md) section E): answered "OK theo khuyến nghị", all as recommended (Excel-style rows with details behind "Show details"; one hatched tint for every non-working day; side panel on desktop and bottom sheet on phone; US dates, h:mm, 24-hour; navigation Timesheet, Overtime, History, Settings (+ Admin); empty manager signature line shown; scope shell/tokens, Timesheet, day editor and Review).
  - WP5-UX-Q1 (2026-10-09): answered "a", fix the focus-ring contrast and the US due-date format in one small round (FIX6).
  - WP5-UX-Q2 (2026-10-09): answered "a", one accessibility sweep, then one fix round for every WCAG 2.2 AA item (A11Y-SWEEP, then FIX7).
- **Slices (one line each; each is followed by a FREEZE commit):**
  - T01: app shell, design tokens, navigation (Settings and Sign out under More on the phone) and four specs.
  - T02: the Excel-style sheet components; the old grid and list deleted; display formatter.
  - T03: PeriodBar, ClockPanel, `periodBarModel` and batch mode.
  - T04: side-panel and bottom-sheet day editor, hours-and-minutes leave, one-tap break confirmation, in-cell label picker.
  - T05: Review as a read-only sheet plus checklist.
  - T06: docs/04, docs/10 (owner decisions of 2026-10-08) and docs/12, EN and VI.
- **Fix rounds (one line each; each is followed by a FREEZE commit):**
  - FIX1: "Times in <zone>" always shown, with a note when the zones differ (docs/04 contradiction decided by the coordinator).
  - FIX2: malformed leave input refused instead of saved as another leave (A-01).
  - FIX3: phone first day row above the tab bar, modal editor below 1200 px, import-absence assertion restored, docs/04 wording, phone tab order (B-01..B-04).
  - FIX4: the "Open a day" field shows the full date at 360 and 320 px (B2-01).
  - FIX5: the editor defers the mode switch while another modal is open; docs/04; meaningful assertion; spacing tokens (B3-01, B3-02, O-5, R-7).
  - FIX6: stronger focus ring with an automated contrast check, and the US due date in the zone note (B4-01, B4-02).
  - FIX7: ten WCAG 2.2 AA items AX-01..AX-10 (client-only, 29 files, plus docs/04 line 48).
  - FIX8: one-row compact switcher bar on the phone, first day row above the tab bar with a received share (B6-01).
  - FIX9: e2e isolation days seeded from the displayed period (A7-01, B7-01; tests only).
  - FIX10: calendar-independent e2e suite after a simulated-clock sweep (AB8-01..AB8-04; tests only).
- **Final gate and final audit (accepted identity):**
  - Release commit `90b98efc395c3894a21a909b6d361eadc6fc2bd9` (WP5-UX-FIX10-FREEZE, pushed); source digest `57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d`, 795 files, `handoff/` excluded.
  - WP5-UX-REGATE8 PASS, NAS NOT VERIFIED ([task](tasks/WP5-UX-REGATE8.md)): real-clock full e2e 210 passed / 26 skipped / 0 failed; simulated-clock sweep of 7 instants, 0 failed; drill `--wp3` 208 PASS / 0 FAIL; 1,831 unit tests. Reference image `sha256:dec7b4856a8220743c513a955a840d399e4be0d74970a89801ea39b6d7898327` (110,014,793 bytes, `linux/amd64`), removed after the gate.
  - WP5-UX-AUDIT-AB9 PASS, no finding, combined areas A and B ([WP5_UX_REVIEW_AB9](WP5_UX_REVIEW_AB9.md)): `dist/` byte-identical across 255ba17, 3670a6c and 90b98ef; test strength holds; own sweep at 8 more instants and 2 one-worker runs all 210/0/26. It supersedes WP5-UX-AUDIT-A6 and the audits before it (A5, A4, A3, A2 and WP5-RECHECK). Earlier reviews of the round: `WP5_UX_REVIEW_A.md` to `_A7.md`, `WP5_UX_REVIEW_B.md` to `_B7.md` and `WP5_UX_REVIEW_AB8.md`.
  - Product boundary: the round changed the client UI and the tests (plus the display-only formatter in `src/domain/format.ts`). `dist/server` is byte-identical to 014bd47 (A7, AB9); no server or business-rule change.
- **docs/10 decision (coordinator):** docs/10 is kept unchanged for this re-accept. Reason: `docs/` is inside the source digest, so an entry for Q1 and Q2 would move the digest after the final gate and audit; Q1 and Q2 stay recorded verbatim on the board in `owner_decisions` and are summarised here. Carry-forward: a docs/10 (+ vi) entry for Q1 and Q2 goes into the next source-changing round, which is gated and audited anyway.
- **Carried optional backlog (by ID; none blocks acceptance):** R-B7-1..R-B7-4 ([WP5_UX_REVIEW_B7](WP5_UX_REVIEW_B7.md)); R-AB8-1..R-AB8-4 ([WP5_UX_REVIEW_AB8](WP5_UX_REVIEW_AB8.md)); R-AB9-1..R-AB9-6 ([WP5_UX_REVIEW_AB9](WP5_UX_REVIEW_AB9.md)); the B6 and A7 risks ([WP5_UX_REVIEW_B6](WP5_UX_REVIEW_B6.md), [WP5_UX_REVIEW_A7](WP5_UX_REVIEW_A7.md)). The older carried risks above still apply.
- **Pilot packet:** [WP5_PILOT_PACKET](WP5_PILOT_PACKET.md) and its `.vi.md` are refreshed to the identity above (sections 0, 3, 5, 6 and 10); D-1..D-15 and the unsigned authorization record are unchanged.
- **Separation of three outcomes:** software readiness of WP1–WP5 on `90b98ef` / `57e2974c…`: accepted by REGATE8 and AB9, with the NAS still NOT VERIFIED; owner permission: not requested and not given; pilot result: none, no pilot has run.

## Re-acceptance after UI change round 2 (WP5-UX2)

This section is added after the WP5-UX re-acceptance above, which is kept unchanged as history (its identity `90b98ef` / `57e2974c…` is superseded). Sources: the board [ORCHESTRATION.json](ORCHESTRATION.json) (tasks `WP5-UX2-*`, `owner_decisions` and `coordinator_decisions` of 2026-10-14 and 2026-10-15) and the reviews named below. A reported result is not independent proof; the independent proofs are the audits.

- **Owner requests of 2026-10-14 (English summary; the verbatim text stays on the board) and answers:**
  - Request 1: highlight the whole day column whose Day editor is open; a lighter, more elegant selection in the Label picker; a dark/light theme toggle in the main navigation; a clearer hover highlight on toggle buttons; an explicit Today button that returns to the current day or period; "Show details" becomes a slide toggle.
  - Request 2: the C&D logo replaces the brand text at the top left; on phones the check in/out controls move into the top bar and Today, Current period and Review share one row; the wording "Clock in/out" becomes "Check in/out".
  - Request 3: the brand text beside the logo becomes the two-line wordmark in the image's colours and the referenced font, logo on the left; the company line is removed from the on-screen timesheet (the PDF keeps it).
  - Request 4: on phones "Review & sign off" shortens to "Sign off" instead of wrapping; more space between brand and menu on large screens; the desktop theme control becomes a Dark/Light toggle with icons; "Due" takes the label style; the "to" in a period range becomes a label-coloured arrow.
  - WP5-UX2-Q1 (2026-10-14): both buttons. Today opens the period that contains today's date; Current period returns to the period the page opens on (the R-07 period, which in the five window days is the period that just ended). The landing rule R-07 is unchanged.
  - WP5-UX2-Q2 (2026-10-14, "Q-1 a, Q-2 a"): the company may use the font for its logo/wordmark, so the wordmark ships as vector outlines (the font file is never committed); in the dark theme the wordmark uses lighter tints.
- **Plan and addenda:** WP5-UX2-PLAN ([task](tasks/WP5-UX2-PLAN.md); client-only design, mockup, slicing); PLAN2 (Current period button: targets, visibility, editor behaviour, phone fit); PLAN3 (logo, phone header clock, three-button row, rename inventory); PLAN4 (wordmark, theme legibility, font facts).
- **Slices (one line each; each followed by a FREEZE commit):**
  - T01 `af6207c`: Dark mode toggle in the main navigation.
  - T02 `d0d21e1`: clearer hover, switch and label-picker selection.
  - T03 `70ecb12`: mark the day open in the Day editor.
  - T04 `54dda11`: Today and Current period buttons.
  - T05 `fa2e679`: C&D logo in the top bar.
  - T06 `3f5a3b3`: two-line wordmark beside the logo.
  - T07 `9864400`: Light/Dark theme toggle with icons.
  - T08 `608572f`: "Check in/out" wording (three server message texts included).
  - T09 `f70a5c0`: check in/out in the phone top bar.
  - T10 `d1a20a7`: documentation of the round (docs/04, docs/10, docs/12, EN and VI).
- **Fix rounds (one line each; each followed by a FREEZE commit):**
  - FIX1 `b1b725b`: the three Low findings of WP5-UX2-AUDIT (Today after the reporting-zone midnight, the 320 px Review row in docs/04, the inactive Today focus ring) and R-UX2A-2 (a unit test against the old clock wording).
  - FIX2 `a643794`: a calendar-independent test for the inactive-Today focus ring.
- **Gates and audits:**
  - WP5-UX2-GATE PASS on `d1a20a7` (digest `20e7a7c8…`).
  - WP5-UX2-AUDIT, FIX REQUIRED ([WP5_UX2_REVIEW](WP5_UX2_REVIEW.md)): three Low findings (01 Today inert after the reporting-zone midnight; 02 docs omit the 320 px Review row; 03 the inactive Today focus ring dimmed to 2.70:1) and optional risks R-UX2A-1..R-UX2A-5; closed by FIX1.
  - WP5-UX2-REGATE FAIL on `b1b725b`: a calendar-dependent test failed in the simulated-clock sweep (8 failed in two of three full runs); fixed by FIX2. NAS NOT VERIFIED.
  - WP5-UX2-REGATE2 PASS, NAS NOT VERIFIED ([task](tasks/WP5-UX2-REGATE2.md)): real-clock full e2e 448 passed / 42 skipped / 0 failed; simulated-clock runs inside and outside the five-day window, 0 failed; drill `--wp3` 208 PASS / 0 FAIL; 1,882 unit tests.
  - WP5-UX2-AUDIT2 PASS ([WP5_UX2_REVIEW2](WP5_UX2_REVIEW2.md)), optional risks R-UX2A2-1..R-UX2A2-4. It supersedes WP5-UX-AUDIT-AB9.
- **Accepted identity:**
  - Release commit `a6437943403fc416240fd13a787a8c4748af3e84` (WP5-UX2-FIX2-FREEZE, pushed); source digest `229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3`, 815 files, `handoff/` excluded.
  - Reference image `sha256:6d1844425345a6e64a962689c01c03143a225abf33df02bcdaa20c8dcc05695a` (110,024,344 bytes, `linux/amd64`, REGATE2 drill build), removed after the gate.
  - Product boundary: the round changed the client UI, wording and tests. `dist/server` differs from 90b98ef only in the wording of three error messages in `services/timesheetCommands.js` and one comment (GATE, REGATE and REGATE2 evidence); no business rule, calculation, schema, API or PDF change.
- **docs/10 entries:** the entries for WP5-UX-Q1 and WP5-UX-Q2, carried from round 1, were recorded in docs/10 (EN and VI) in this round (T10), together with the decisions of round 2.
- **Carried optional backlog (by ID; none blocks acceptance):** R-UX2A-1..R-UX2A-5 and R-UX2A2-1..R-UX2A2-4 (above); R-B7-1..R-B7-4, R-AB8-1..R-AB8-4, R-AB9-1..R-AB9-6, and the B6 and A7 risks (see the section above). The older carried risks still apply.
- **Open optional owner question WP5-UX2-Q3 (blocks nothing; default (a) keep):** in the five days from the Monday after a period ends to its payroll Friday, the period that Today opens shows the badge "future"; option (b) would show "in progress" there (a small client wording change plus docs/04; the server is unchanged).
- **Pilot packet:** [WP5_PILOT_PACKET](WP5_PILOT_PACKET.md) and its `.vi.md` are refreshed to the identity above (sections 0, 3, 5, 6 and 10); D-1..D-15 (all pending) and the unsigned authorization record are unchanged.
- **Separation of three outcomes:** software readiness of WP1–WP5 on `a643794` / `229df806…`: accepted by REGATE2 and AUDIT2, with the NAS still NOT VERIFIED; owner permission: not requested and not given; pilot result: none, no pilot has run.

## Re-acceptance after UI change round 3 (WP5-UX3)

This section is added after the WP5-UX2 re-acceptance above, which is kept unchanged as history (its identity `a643794` / `229df806…` is superseded). Sources: the board [ORCHESTRATION.json](ORCHESTRATION.json) (tasks `WP5-UX3-*`, `owner_decisions` and `coordinator_decisions` of 2026-10-15 to 2026-10-19, `runtime_observations`) and the reviews named below. A reported result is not independent proof; the independent proofs are the audits.

- **Owner request of 2026-10-15 (English summary; the verbatim text stays on the board) and answers:**
  - Request: stop enforcing the industrial style and use a modern style (governance text in AGENTS.md); more contrast between page, cards, panels and sheets, with the week sheet raised; a top-bar identity block (right-aligned avatar, display name over a smaller email) that opens a menu with Light/Dark, Profile, Settings and Sign out (Settings and Admin leave the main menu; Administration becomes a Settings tab); on large screens the wordmark visible, Check in/out on the page-title row, no user name under the title, distinct old/current/future pills (future pink), one wrapping row for payroll date, due and zone, "Open a day" beside its date picker; selected columns and the editor column lifted by a soft shadow, the editor column marked by a Day-cell fill; on narrow screens "Current" and a hidden "Open a day" text when the row does not fit; in the Day editor a short zone note, a stronger header, new/edit time sessions in a separate dialog, a clear delete confirmation, defaults and suggested breaks pre-filled, a simpler break area, Save also confirming, and WFH on the Category row. The item list U-01..U-27 is in [WP5-UX3-PLAN](tasks/WP5-UX3-PLAN.md).
  - G-1..G-5 (2026-10-15): G-1 (b) approve the mockup and the modern direction with changes (no rounded week sheets; selection columns with a 4px radius; adjacent lifted columns must not shadow each other; sheet columns never squeezed until content overlaps, the Day editor floats when there is no room); G-2 (a) "Category" replaces "Label" and "Status" replaces "Check"; G-3 (a) automatic pre-fill of the reference hours and of suggested breaks for past days, with the rewritten rule; G-4 (owner variant) a notice with three choices when Save is pressed with no break and the box unticked (confirm no breaks, leave breaks unconfirmed for now, or cancel), then the final save confirmation; G-5 (b) the period that contains today shows "in progress" in the five window days. It supersedes the optional WP5-UX2-Q3. Added phone requests N-1 (break chips with a sub-dialog) and N-2 (dialog spacing).
  - WP5-UX3-Q6 (2026-10-15): (b) the break date field shows only when the session crosses local midnight (or its end is not set); and the break chips use 24-hour times.
  - WP5-UX3-Q7 (2026-10-19): (a) the owner's AGENTS.md text (AI Instruction header, Operating Contract, Prime Directive) joins the repository, with two edits (the runbook-mirror line follows this repository's `.vi.md` convention; project-foreign phrases removed).
- **Plans and mockup:** WP5-UX3-PLAN ([task](tasks/WP5-UX3-PLAN.md); items U-01..U-27, the rule rewrite of section C, questions G-1..G-5) and PLAN2 ([task](tasks/WP5-UX3-PLAN2.md); the break-row and session-dialog design); the mockup is `handoff/delivery/design/WP5-UX3/mockup.html` with ten synthetic renders in the same folder.
- **Governance changes:** WP5-UX3-GOV (the AGENTS UI section "Frontend and UI/UX standards"): freeze 79b9a53, WP5-UX3-GOV-AUDIT PASS ([GOV_UX3_REVIEW](GOV_UX3_REVIEW.md)), accepted by WP5-UX3-GOV-ACCEPT at 3968e15. WP5-UX3-GOV2 (the owner's AI Instruction header, Q7): freeze ceb86b6, WP5-UX3-GOV2-AUDIT PASS ([GOV_UX3_REVIEW2](GOV_UX3_REVIEW2.md)).
- **Slices (one line each; each followed by a FREEZE commit):**
  - T06 `5c8355d`: the pure break-row model and its unit tests (no UI).
  - T01 `e2f3d74`: modern style tokens and the application shell.
  - T02 `aa64999`: identity block, account menu, phone More content, slimmer navigation, wordmark rule.
  - T03 `7cd8c59`: Settings sub-pages (Personal, Profile, Administration), routes, lazy loading.
  - T04 `83c32d2`: page header and period bar.
  - T05 `699b1b3`: sheet selection markers, the row names "Category" and "Status", the "No times" shape.
  - T05B `5c0dad8`: the floating Day editor rule (no squeezed sheet columns).
  - T07 `f8117a4`: Day editor panel (header, chips, session cards with break tables), delete confirmation, WFH on the Category row.
  - T08 `1a33c57`: session dialog (new and edit), break rows, "Confirm no breaks taken", pre-fill, the G-4 notice, save and discard confirmations.
  - T08B `f89573b`: Q6 (b) break-date rule, break chips with sub-dialog, phone spacing, the suggestion helper moved into the model.
  - T09 `4b5403d`: the Check out dialog on the new break rows; remaining "label" strings become "category".
  - T10 `cecfceb`: the documents of the round (docs/04, docs/10, docs/12, EN and VI) and the rule rewrite.
- **Fix rounds (one line each; each followed by a FREEZE commit):**
  - FIX1 `9187f31`: the findings of WP5-UX3-GATE (simulated-clock Tuesday test and a seed flake, week-card focus clipping from 768 to about 880 px, three axe items).
  - FIX2 `7ce4e95`: the findings of the read-only WP5-UX3-SWEEP ([task](tasks/WP5-UX3-SWEEP.md)).
  - FIX3 `a78ada5`: F-UX3A-01..06 and F-UX3B-1..2 of AUDIT-A and AUDIT-B.
  - FIX4 `8629441`: F-UX3A2-1..3 and F-UX3B2-1 of AUDIT-A2 and AUDIT-B2.
  - FIX5 `5c101c1`: REGATE3's time-of-day-dependent "Confirm breaks today" test, made hour-independent.
  - FIX6 `8e55710`: REGATE4's layout-swap race in a hover test, after the diagnosis WP5-UX3-DIAG1 ([task](tasks/WP5-UX3-DIAG1.md)).
- **Gates (NAS NOT VERIFIED throughout):**
  - WP5-UX3-GATE FAIL on `cecfceb` ([task](tasks/WP5-UX3-GATE.md)): a calendar-dependent lifted-column test (Tuesdays) and a seed flake, keyboard focus clipped inside the week card from 768 to about 880 px, and three serious axe items; closed by FIX1 and FIX2.
  - WP5-UX3-REGATE PASS on `7ce4e95` ([task](tasks/WP5-UX3-REGATE.md)), recorded with a deviation on the timeouts of one simulated-clock run (board `coordinator_decisions` of 2026-10-16).
  - WP5-UX3-REGATE2 PASS on `ceb86b6` ([task](tasks/WP5-UX3-REGATE2.md)).
  - WP5-UX3-REGATE3 FAIL on `8629441` ([task](tasks/WP5-UX3-REGATE3.md)): the FIX4 "Confirm breaks" test fails between local midnight and about 03:00 on the phone project; closed by FIX5.
  - WP5-UX3-REGATE4 FAIL on `5c101c1` ([task](tasks/WP5-UX3-REGATE4.md)): gate item 2 strictly unmet by a race in a hover test; the fixed test, the identity and the carry-forward proofs held; closed by FIX6.
  - WP5-UX3-REGATE5 PASS on `8e55710` ([task](tasks/WP5-UX3-REGATE5.md)): builds byte-identical to REGATE3 and REGATE4 (their items carry forward); real-clock full e2e 651 passed / 67 skipped / 0 failed; simulated-clock FULL runs at a window day and a DST change, 0 failed; drill `--wp3` 208 PASS / 0 FAIL (REGATE3); 2,141 unit tests; axe: only the justified account-menu target-size item.
- **Audits:**
  - WP5-UX3-AUDIT-A ([WP5_UX3_REVIEW_A](WP5_UX3_REVIEW_A.md)) and AUDIT-B ([WP5_UX3_REVIEW_B](WP5_UX3_REVIEW_B.md)) on `7ce4e95`: FIX REQUIRED; findings F-UX3A-01..06 (area A) and F-UX3B-1..2 (area B); closed by FIX3.
  - WP5-UX3-AUDIT-A2 ([WP5_UX3_REVIEW_A2](WP5_UX3_REVIEW_A2.md)) and AUDIT-B2 ([WP5_UX3_REVIEW_B2](WP5_UX3_REVIEW_B2.md)) on `ceb86b6`: FIX REQUIRED; findings F-UX3A2-1..3 (one Medium, two Low) and F-UX3B2-1 (Low, test strength); closed by FIX4.
  - WP5-UX3-AUDIT-INT PASS ([WP5_UX3_REVIEW_INT](WP5_UX3_REVIEW_INT.md)) on `8e55710` / `507de97c…`, no finding, optional risks R-INT-1..R-INT-4. It supersedes WP5-UX2-AUDIT2.
- **Usage pause:** the mission paused on 2026-10-16 at a usage limit and resumed on 2026-10-19 with a reconciliation of HEAD against the last board commit (a78ada5); the board and the checkpoint carry the record.
- **Accepted identity:**
  - Release commit `8e557100d16b6b6eb86a48e00276835761aabfdf` (WP5-UX3-FIX6-FREEZE, pushed); source digest `507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6`, 833 files, `handoff/` excluded.
  - Reference image `sha256:bcb0692cc99fe5c0b198dc26cff623045903f851f3d7069105b1df09bf9e493b` (110,042,848 bytes, `linux/amd64`, REGATE3 drill build of bytes identical to the release, development workstation), removed after the gate.
  - Product boundary: the round changed the client UI and the documents. `dist/server` and `dist/domain` are byte-identical to a643794; no business rule, calculation, schema, API, PDF or email change.
- **Carried optional backlog (by ID; none blocks acceptance):** R-UX3B-1, R-UX3B-2, R-UX3B-5..R-UX3B-7 (WP5_UX3_REVIEW_B); R-A2-1's residual and the A2 risks R3, R5, R7 (WP5_UX3_REVIEW_A2); R-B2-2, R-B2-3, R-B2-5 (WP5_UX3_REVIEW_B2); R-INT-1..R-INT-4 (WP5_UX3_REVIEW_INT); the governance backlog items R3-R5 and R8 of GOV_UX3_REVIEW2. The earlier carried risks (R-UX2A-1..R-UX2A-5, R-UX2A2-1..R-UX2A2-4 and the older ones listed above) still apply. WP5-UX2-Q3 is superseded by G-5 (b).
- **Pilot packet:** [WP5_PILOT_PACKET](WP5_PILOT_PACKET.md) and its `.vi.md` are refreshed to the identity above (sections 0, 3, 5, 6 and 10); D-1..D-15 (all pending) and the unsigned authorization record are unchanged.
- **Separation of three outcomes:** software readiness of WP1–WP5 on `8e55710` / `507de97c…`: accepted by REGATE5 and AUDIT-INT, with the NAS still NOT VERIFIED; owner permission: not requested and not given; pilot result: none, no pilot has run.

## Re-acceptance after UI change rounds 4 and 5 (WP5-UX4, WP5-UX5)

This section is added after the WP5-UX3 re-acceptance above, which is kept unchanged as history (its identity `8e55710` / `507de97c…` is superseded). It is the current record of WP5. Sources: the board [ORCHESTRATION.json](ORCHESTRATION.json) (tasks `WP5-UX4-*` and `WP5-UX5-*`, `owner_decisions`, `coordinator_decisions` and `runtime_observations` from 2026-10-20 to 2026-10-29), the [checkpoint](WORKFLOW_REVISION_CHECKPOINT.md) and the reviews named below. No figure was re-run to write it. A reported result is not independent proof; the independent proofs are the audits. Rounds 4 and 5 shared one package-final gate and one set of audits (owner decision Q0 a).

- **Owner requests (English summaries; the verbatim text stays on the board):**
  - Round 4, 2026-10-20 (items U4-01..U4-15 of [WP5-UX4-PLAN](tasks/WP5-UX4-PLAN.md)): export and import of all settings; a 32 px gap between the Timesheet title and the panel below it; the toolbar, both week sheets and the footer in one "paper" panel, and the same for Review; round modern slide switches; select or unselect another column while the Day editor is open (a non-modal drawer with square edge corners that floats only when the sheets and the drawer do not fit); a stronger week header row and first column; a start-time edit for a running session; in the session dialog the zone first, Today and Now links aligned, fixed break time slots and an alert dialog for save errors; the select chevron, checkbox alignment and the "Show worked hours" wording.
  - Round 5, 2026-10-21 (34 items U5-01..U5-34 of [WP5-UX5-PLAN](tasks/WP5-UX5-PLAN.md)): compact layouts from 480 px instead of 768 px; the company name stays in the top bar on narrow screens while it fits; a seamless select chevron; icons on Edit, Delete and Suggest breaks, and sub-buttons 56 px instead of 68 px; a smaller theme switch; spaces around the dash of a time range; a rearranged period card and Review page with a Sign off dialog; sign-off split from sending (per-send PDF switches, editable recipients, subject and body, and a typed reason for any further copy); a redesigned PDF (reference layout, handwriting font, footer texts); closing the Day editor by a press outside it, a partial-leave dialog and a phone sheet with a fixed Save foot.
- **Owner answers:**
  - D-1..D-15 (2026-10-20, recorded on the board): D-1 a, D-2 a, D-3 a, D-4 a, D-5 a (an offsetting correction to a net zero), D-6 a (at most 20 uncommitted previews per person), D-7 a, D-8 a (TLS failures stay temporary; documented), D-9 b (a self-service change-password route), D-10 a (an opening OT balance of 0, editable at any time; reconciled with the canonical rule by F-1 i), D-11 a, D-12 a, D-13 a, D-14 b (the first release is declared after the pilot period), D-15 b (per-date counts in the holiday preview restored; reconciled by F-2 b). Code changes: D-5 a, D-6 a, D-9 b, D-15 b and the D-10 rule; the others are documentation.
  - Round 4 F-1..F-5 (2026-10-20): F-1 i (the opening balance starts at 0 with no entry; each change is a reasoned ledger entry; evidence optional; only the owner of the timesheet sets it; no historical import for the pilot, production keeps the import); F-2 b (exact per-date counts in the holiday preview with a written exception and an audit event per preview); F-3 a (a personal settings file plus an administrators' company-calendar file); F-4 a (preview with a Now / In the file comparison, new versions, auto-submit only with its own tick); F-5 approved with changes (title gap 32 px; toolbar, sheets and footer unchanged inside one paper sheet; two signature rows; Today and Now right-aligned; stronger week header row and first column).
  - Round 4 follow-ups (2026-10-21): R2 a (an edit grantee deleting the owner's running session answers 409 `shared_clock_action`); R3 b (Review two columns from 1200 px; dropped because the round-5 Review redesign superseded it); R4 a (footer unchanged); R5 b (no forced scrollbar track; the drawer layout decision subtracts the classic scrollbar width).
  - Q0 a (2026-10-21): fold round 4 into round 5, with one package-final gate and audits for both. Q1: the owner's reference image of the PDF body is not stored (it holds personal data); its layout is described in text on the board. Q2: footer left "© 2026 C&D Semiconductor Services, Inc. All rights reserved.", right "Internal use by C&D only".
  - Round 5 F-1..F-10 (2026-10-21): F-1 a (36 px visible sub-buttons with a 44 px touch hit area; the AGENTS 44 px rule is unchanged), F-2 a, F-3 b (switches per send, with Settings defaults), F-4 (recipients, subject and body editable per send, plus a new rule: after one copy was sent, another needs a confirmation and a typed reason), F-5 b (the signature image is optional), F-6 a, F-7 a, F-8 a, F-9 b (a handwriting font with a usable licence, Indie Flower under the SIL OFL 1.1), F-10 a. G-1: the revised mockup approved with named changes (the "Change days" short form, the Sign off button aligned to its signature line, PDF field indents of 1.5 tabs, bold day names, the reference type faces).
  - H-1 a (2026-10-22): a period stays submitted once any revision has a send; a later correction or late review is not sent at the deadline and reminders do not restart; the person sends it from the Send card.
  - Commit and remote handling: WP5-UX4-FREEZE1-Q a and FREEZE2-Q a (2026-10-20, permission for the T01 freeze set; the owner then committed `213bbdc` by hand); WP5-UX5-FREEZE-T01B-Q a (2026-10-22, a fresh committer stages explicit paths, no list file); WP5-UX5-REMOTE-Q A a, B a, C b (2026-10-22; the push hold was lifted the same day by the owner's "push freely"); WP5-UX5-REMOTE2-Q D a and E a and the `--ff-only` request (2026-10-23); the Ingat track's commits are owner work outside rounds 4 and 5, checked only for non-interference.
- **Plans and governance changes:**
  - Plans: WP5-UX4-PLAN (read-only; 15 items with measurements, the settings export/import design, the sized changes for the pilot decisions, six slices, questions F-1..F-5; mockup `handoff/delivery/design/WP5-UX4/mockup.html`); WP5-UX5-PLAN (34 items U5-01..U5-34, Addenda 1 to 3, questions F-1..F-10 and G, mockup in `handoff/delivery/design/WP5-UX5/`); WP5-UX5-PLAN-FIX7 ([task](tasks/WP5-UX5-PLAN-FIX7.md); the code route for F-UX5B-3 and option A for R-UX5B-1) and WP5-UX5-PLAN-FIX7A ([task](tasks/WP5-UX5-PLAN-FIX7A.md); the area-A fixes).
  - Governance: no governance task ran in these rounds, and AGENTS.md, CLAUDE.md and docs/08 did not change since `8e55710`. The canonical rule text for the opening balance (F-1 i) and for the holiday-preview exception (F-2 b) was updated in docs/03 and docs/10, EN and VI, in slice UX4-T04. The coordinator decisions of the rounds: reopen the mission for WP5-UX4 (2026-10-20); fold round 4 into round 5 (2026-10-21); split UX5-T05 into T05A and T05B (2026-10-22); the documentation-only refresh WP5-UX5-RELNOTES before acceptance (2026-10-29).
- **Slices (one line each; each followed by a FREEZE commit):**
  - UX4-T04 `5a68fba`: server (D-9 b change-password route, D-5 a, D-6 a, D-10 per F-1 i, D-15 per F-2 b, the shared-clock guard) and the canonical rule texts.
  - UX4-T01 `213bbdc`: paper panel, title gap, switches, selects, checkboxes, wording.
  - UX4-T02 `b7cc063`: non-modal edge drawer, discard guard, content-based floating rule.
  - UX4-T03 `cda9c51`: running-session start edit, zone first, Today and Now, fixed break slots, alert dialog.
  - UX4-T05 `82d1ab4`: settings export and import (client only).
  - UX4-T06 `a3042dd`: documents and pilot packet for the pilot-decision answers, plus a test pinning the D-8 behaviour.
  - UX5-T01A `c1b2cc4`: the signer is the account display name, the signature image is optional (migration 0014).
  - UX5-T01B `9917ae8`: sign-off creates only the PDF; sends become their own records with a reason rule (migration 0015).
  - UX5-T02 `b4c5004`: the redesigned PDF, the Indie Flower font asset with ADR 0001, one page in all four variants.
  - UX5-T03 `65def2f`: the Review page, the Sign off dialog and the Send card.
  - UX5-T04 `060302b`: the 480 and 768 px breakpoints in range syntax, the top bar and the period card.
  - UX5-T05A `70f7800`: chevron, icons, sub-button size, time ranges, week sheet controls.
  - UX5-T05B `69d6340`: Day editor press-outside close, leave dialog, phone sheet foot.
  - UX5-T06 `e2bf1aa`: documents of the round (docs/04, 11, 12, EN and VI), the package-final snapshot.
- **Fix rounds and diagnoses (one line each; the freeze commit and what each answered):**
  - UX4-FIX1 `0ddfead`: WP5-UX4-GATE FAIL (WCAG 2.4.11 hidden focus at 1280 px and several calendar-dependent tests).
  - UX4-FIX2 `178f1cf`: F-UX4A-1..4 and F-UX4B-1 of the round-4 audits.
  - UX4-FIX3 `57c41e8`: R2 a, R5 b and a hover timeout; the last round-4 source commit.
  - UX5-FIX1 `2bce0ab`: WP5-UX5-GATE FAIL (drill sign-off body, four date-dependent tests, History axe).
  - UX5-FIX2 `7aafa21`: REGATE FAIL (a bar-size test race; DIAG1).
  - UX5-FIX3 `5b8b718`: REGATE2 FAIL (two test races).
  - UX5-FIX4 `f4049aa`: `npm audit` advisories; pins nodemailer 10.1.4 and zod 4.6.6 (DEPS1).
  - UX5-FIX5 `f4049aa`: REGATE3 sweep failures (a midnight crossing, a late signature image, a socket reset; DIAG2).
  - UX5-FIX6 `f4049aa`: host-load findings (vitest workers at 50 percent, smoke keep-alive; DIAG3).
  - UX5-FIX7 `94accda`: AUDIT-B F-UX5B-1..5 and R-UX5B-1 option A.
  - UX5-FIX8 `94accda`: AUDIT-A F-UX5A-1..4.
  - UX5-FIX9 `94accda`: an axe scrollable-region item on the Review week cards.
  - UX5-FIX10 `a5533b5`: REGATE5 FAIL (a slow logo sweep timeout; DIAG4).
  - UX5-FIX11 `0f52300`: RECHECK-B F-UX5B2-1 and RECHECK-A F-UX5A2-1.
  - UX5-FIX12 `bb8d340`: REGATE7 FAIL (a one-frame measuring race; DIAG5).
  - UX5-FIX13 `bb8d340`: two flakes (a test race and a narrow dirty-flag product race; DIAG6).
  - UX5-FIX14 `bd9c275`: REGATE8 FAIL (a measuring race; DIAG7, DIAG8).
  - UX5-FIX15 `be2afa2`: REGATE9 FAIL (a local-midnight assumption; DIAG9).
  - UX5-FIX16 `1fe5ad3`: RECHECK-B2 F-UX5B3-1 (a later send in any state blocks a release).
  - UX5-FIX17 `a5cbc91`: REGATE11 FAIL (a starved background tab; DIAG10).
  - UX5-FIX18 `d96df5d`: AUDIT-INT F-UX5I-1.
  - UX5-FIX19 `0b45781`: AUDIT-INT2 F-UX5I2-1 and F-UX5I2-2.
  - UX5-FIX20 `a54061f`: AUDIT-RN F-UX5RN-1.
  - Diagnoses: DIAG1 (theme bar-size lag, a test defect), DIAG2 (midnight crossing, signature image, socket reset), DIAG3 (host load), DIAG4 (logo sweep margin), DIAG5 (one-frame media-query transient), DIAG6 (a keyboard-access test race and the Escape dirty-flag product race), DIAG7 and DIAG8 (measuring races), DIAG9 (a day-boundary assumption), DIAG10 (a starved tab). Only DIAG6 found a product fault (the dirty-flag race, fixed by FIX13). DEPS1 is the dependency pin of FIX4.
- **Gates (NAS NOT VERIFIED throughout; each result in one line):**
  - Round 4: WP5-UX4-GATE FAIL on `a3042dd` ([task](tasks/WP5-UX4-GATE.md)); WP5-UX4-REGATE PASS on `0ddfead` ([task](tasks/WP5-UX4-REGATE.md)); WP5-UX4-REGATE2 NOT VERIFIED on `178f1cf` (stopped early, superseded by FIX3 and the fold into round 5).
  - WP5-UX5-GATE FAIL on `e2bf1aa` ([task](tasks/WP5-UX5-GATE.md)): drill 203 PASS / 6 FAIL (the pre-upgrade build signed nothing), four date-dependent sweep tests, History axe.
  - REGATE FAIL on `2bce0ab`: a bar-size assertion in the sweep. REGATE2 FAIL on `7aafa21`: two flaky tests. REGATE3 FAIL on `5b8b718`: `npm audit` (nodemailer, zod) and sweep assertions.
  - REGATE4 PASS on `f4049aa`: drill 209 PASS / 0 FAIL, `npm audit` 0.
  - REGATE5 FAIL on `94accda`: one logo test timeout in a sweep. REGATE6 PASS (scoped) on `a5533b5`. REGATE7 FAIL on `0f52300`: a measuring race. REGATE8 FAIL on `bb8d340`: a measuring race. REGATE9 FAIL on `bd9c275`: a local-midnight test assumption. REGATE10 PASS on `be2afa2`.
  - REGATE11 FAIL on `1fe5ad3` ([task](tasks/WP5-UX5-REGATE11.md)): an import test timeout on a saturated host; its drill (209 PASS / 0 FAIL) and `npm audit` (0) are the ones carried forward.
  - REGATE12 PASS on `a5cbc91` ([task](tasks/WP5-UX5-REGATE12.md)). REGATE13 PASS on `d96df5d` ([task](tasks/WP5-UX5-REGATE13.md)).
  - REGATE14 PASS on `0b45781` ([task](tasks/WP5-UX5-REGATE14.md)), the package-final runtime gate: real-clock full e2e desktop 484 passed / 36 skipped / 0 failed and mobile 408 / 112 / 0, six sweeps with 0 failed, `npm test` 101 files and 2,397 tests, stress and mutants.
  - REGATE15 PASS on `dc487c6` ([task](tasks/WP5-UX5-REGATE15.md)): scoped; `dist/` identical to `0b45781`; the pilot samples and the ready check.
  - REGATE16 PASS on `a54061f` ([task](tasks/WP5-UX5-REGATE16.md)): scoped, documentation only.
  - Load rule (introduced by REGATE12; **not canonical yet, R-UX5I-3**): the entry limit is about 8 busy cores of non-mission load (it was 4; DIAG10 measured 0 failures at 3 to 8 busy cores); a census at the end of each sweep and right after a failure; a starvation timeout while the census is over the limit makes that run NOT VERIFIED and it is repeated once after the load is back within the limit; every other failure fails the gate. It lives in the REGATE12 brief and DIAG10. Recording it in docs/08 or the gate template needs a governance task, and whether a Playwright expect timeout on a starved tab counts as a timeout is not defined.
- **Audits (decision, findings by ID):**
  - Round 4: WP5-UX4-AUDIT-A ([WP5_UX4_REVIEW_A](WP5_UX4_REVIEW_A.md)) on `0ddfead`: FIX REQUIRED; F-UX4A-1 (Medium, the Day editor flaps with a classic scrollbar), F-UX4A-2, F-UX4A-3, F-UX4A-4 (Low). WP5-UX4-AUDIT-B ([WP5_UX4_REVIEW_B](WP5_UX4_REVIEW_B.md)): FIX REQUIRED; F-UX4B-1 (Low, the password-change rate limit shared with sign-in), risks R-UX4B-1..8. Closed by UX4-FIX2.
  - AUDIT-A ([WP5_UX5_REVIEW_A](WP5_UX5_REVIEW_A.md)) on `f4049aa`: FIX REQUIRED; F-UX5A-1 (Medium, the signed footer on a narrow Review page), F-UX5A-2..4 (Low); closed by FIX8.
  - AUDIT-B ([WP5_UX5_REVIEW_B](WP5_UX5_REVIEW_B.md)): FIX REQUIRED; F-UX5B-1..5 (Low); closed by FIX7.
  - RECHECK-A ([WP5_UX5_RECHECK_A](WP5_UX5_RECHECK_A.md)) on `a5533b5`: FIX REQUIRED; F-UX5A2-1 (Low). RECHECK-B ([WP5_UX5_RECHECK_B](WP5_UX5_RECHECK_B.md)): FIX REQUIRED; F-UX5B2-1 (Low). Both closed by FIX11.
  - RECHECK-A2 ([WP5_UX5_RECHECK_A2](WP5_UX5_RECHECK_A2.md)) on `be2afa2`: PASS, no finding, optional risks R-A3-1..3.
  - RECHECK-B2 ([WP5_UX5_RECHECK_B2](WP5_UX5_RECHECK_B2.md)): FIX REQUIRED; F-UX5B3-1 (Low); closed by FIX16.
  - RECHECK-B3 ([WP5_UX5_RECHECK_B3](WP5_UX5_RECHECK_B3.md)) on `a5cbc91`: PASS, no finding, optional risks R-UX5B4-1..5.
  - AUDIT-INT ([WP5_UX5_REVIEW_INT](WP5_UX5_REVIEW_INT.md)) on `a5cbc91`: FIX REQUIRED; F-UX5I-1 (Low, the open Day editor does not follow a Check in or Check out), risks R-UX5I-1..4; closed by FIX18.
  - AUDIT-INT2 ([WP5_UX5_REVIEW_INT2](WP5_UX5_REVIEW_INT2.md)) on `d96df5d`: FIX REQUIRED; F-UX5I2-1 (Medium, pre-existing since WP2-T10: a session write could silently overwrite day fields changed elsewhere), F-UX5I2-2 (Low, `npm run digest` failed with ENOBUFS); closed by FIX19.
  - AUDIT-INT3 ([WP5_UX5_REVIEW_INT3](WP5_UX5_REVIEW_INT3.md)) on `0b45781` / `67aa715c…`: PASS, no finding, optional risks R-UX5I3-1..4. It re-accepted WP5 after rounds 4 and 5, replacing WP5-UX3-AUDIT-INT as the acceptance.
  - AUDIT-RN ([WP5_UX5_REVIEW_RN](WP5_UX5_REVIEW_RN.md)) on `dc487c6`: FIX REQUIRED; F-UX5RN-1 (Low, DEVELOPMENT still said WP4 was not accepted); closed by FIX20.
  - RECHECK-RN ([WP5_UX5_RECHECK_RN](WP5_UX5_RECHECK_RN.md)) on `a54061f` / `690fd8fd…`: PASS, no finding. It is the current acceptance; it carries the product verdict of AUDIT-INT3 on a byte-identical `dist/` and supersedes it.
  - Each auditor was a fresh `timesheet-auditor` context with no authorship of the audited change; the self-reported models are on the board.
- **Pauses and restarts:**
  - 2026-10-22, two owner restarts: the owner paused to restart the machine, first while WP5-UX5-FIX2 attempt 1 was running and again during attempt 2; the coordinator stopped the worker each time, the board carried the status `paused_usage` with a note that it was a restart, and the owner resumed each time. FIX2 finished at attempt 3.
  - 2026-10-23, usage pause: the owner paused because the usage limit was near; REGATE3 attempt 1 was stopped mid-run and left no Results.
  - 2026-10-26, resume: REGATE3 attempt 2 ran on a fresh verifier, after a leftover check, and failed as recorded above.
  - Runtime observations (no process identifiers): a classifier denied the T01 freeze after the coordinator widened its staged set, and the owner committed `213bbdc` by hand; a list-file `git add` was denied and explicit paths passed; a few coordinator slips (a board dependency on a failed gate, lower-case task IDs, a task registered without its brief) stopped a freeze before any commit and were corrected.
- **Accepted identity:**
  - Release commit `a54061f6afc1fda00d4ee2cca4553a5916af24ec` (WP5-UX5-FIX20-FREEZE, pushed); source digest `690fd8fd588c902f03cbc9c6efeb63cd58f5c9246579dda0473a190a230c1c4f`, 882 files, `handoff/` excluded (the repository, the `git ls-tree` form, `npm run digest` and a clean clone agree). docs/12 line 7 says these three values are recorded here.
  - Gate: WP5-UX5-REGATE16 PASS (scoped, documentation only; `dist/` byte-identical to `dc487c6` and `0b45781`; `npm test` 2,397). Carried forward on identical builds: REGATE15 (the samples and the ready check), REGATE14 (the package-final runtime gate on `0b45781`) and REGATE11 (the drill, 209 PASS / 0 FAIL on `1fe5ad3`, and `npm audit`).
  - Final audit: WP5-UX5-RECHECK-RN PASS (above). The previous acceptance was WP5-UX3-AUDIT-INT on `8e55710` / `507de97c…`.
  - Documentation-only commits after the product acceptance (`0b45781` / `67aa715c…`: AUDIT-INT3 and REGATE14): `dc487c6` (WP5-UX5-RELNOTES-FREEZE) changed README and docs/12, EN and VI, and was gated by REGATE15, which also regenerated the pilot samples; AUDIT-RN returned FIX REQUIRED with F-UX5RN-1. `a54061f` (WP5-UX5-FIX20-FREEZE) changed DEVELOPMENT, docs/12 and README, EN and VI, and was gated by REGATE16; RECHECK-RN passed. The source digest moved `67aa715c…`, `2072e3f2…`, `690fd8fd…` for that reason only. This answers R-UX5RN2-1.
  - Product boundary: rounds 4 and 5 changed the client, the server (the change-password route, the import preview quota, the opening-balance rules, the holiday-preview counts, the shared-clock guard, the sign-off and send split with migrations 0014 and 0015, the PDF, the restore blocker), the tests and the documents. Latest schema 15.
- **Optional backlog (by ID; none blocks acceptance):**
  - The seven groups of "Optional backlog for the WP5 handoff" in [WP5_UX5_REVIEW_INT3](WP5_UX5_REVIEW_INT3.md):
    1. Test strength, area A: R-A3-1, R-A3-2, R-A3-3, MA5, R-UX5I-2, R-UX5I3-4.
    2. Test strength, area B: R-UX5B4-1, R-UX5B4-2, R-UX5B-5, G6.
    3. Docs and comments: R-UX5B4-3, R-UX5B4-4, R-UX5B4-5, R-UX5I-1, R-UX5I-4.
    4. Optional product hardening: R1, R2, the one-frame 8 px jump of DIAG5, R-UX5B2-1, R-UX5B2-2, R-UX5B-6, R6, R7, R-UX4B-1, R-UX4B-4, R-UX4B-8, UX4-A 1, 3, 4 and 9, R-UX5I2-3 (an owner decision, below), R-UX5I3-1, R-UX5I3-2, R-UX5I3-3 (accessibility: focus falls to the body after Save day fields and Reload day).
    5. Pilot device checks (NOT VERIFIED here; below): R-A2-1, R-A2-2, UX4-A 8, classic scrollbars in other browsers (docs/12:108), the owner's own look at the PDF samples against the B11 reference.
    6. Process and harness: the logo sweep's load sensitivity (R-A2-5, DIAG10), R-UX5I-3 (the load rule is not canonical), R-UX5B-2 (6 dev-only advisories in `npm ci`: 4 moderate, 2 high), R-UX5B-4, R-UX4B-6, the crossing test's mobile branch; no test runs the digest script, so the release step in docs/12:7 is its only check.
    7. Coordinator decisions the owner was informed of and not asked: as AUDIT-INT's item 7, plus FIX18's tab-return read, FIX19's quiet held branch (R-UX5I3-2) and the deferral of R-UX5I2-3.
  - From [WP5_UX5_RECHECK_RN](WP5_UX5_RECHECK_RN.md): R-UX5RN2-1 (docs/12:7 named the refreshed files only in part; answered by the identity item above), R-UX5RN2-2 (docs/11:34, a loose pointer to the release identity, pre-existing) and R-UX5RN2-3 (decision-time "needs its own gate" wording in docs/10), the last two for the next source-changing round.
  - Dispositions of R-UX5RN-1..6: R-UX5RN-1, -2, -3 and -5 done and accurate (FIX20, confirmed by RECHECK-RN). R-UX5RN-4 (forward references): the ones that concern this handoff (the release identity values, the two documentation-only commits with the current acceptance, and this section itself) are made true by this section; the pilot packet statements were made true by WP5-UX5-ACCEPT-PACKET. R-UX5RN-6 (run-specific sample values) stays with the packet.
  - The older carried risks above, including R-UX4B-1..8, R-UX5I-1..4 and R-UX5I3-1..4, still apply.
- **Owner decision best taken before the pilot, R-UX5I2-3:** a day without an entry keeps a calendar default, and that default has no version to protect it. If an administrator imports a holiday on the open date, the editor can still show "Worked", and "Save day fields" then records the old default as the person's explicit choice over the new Holiday, which changes the day's required time. This is not introduced by rounds 4 and 5. The three options (lettered as in the pilot packet section 8): (a) keep the current behaviour and document it, relying on the visible note "Calendar default. Saving records it as your choice."; (b) send the category only when the person changed it; (c) refuse the save when the default changed since the load. Options (b) and (c) are code changes and need a fix round (fix, freeze, gate, independent audit) before activation.
- **Pilot device checks NOT VERIFIED here (backlog item 5):** touch handling proven only in Chromium emulation (R-A2-1; check on a real iPad and an Android tablet), overlay scrollbars (R-A2-2), UX4-A 8, classic scrollbars in other browsers (docs/12:108), and the owner's own look at the PDF samples against the reference layout.
- **Pilot packet:** [WP5_PILOT_PACKET](WP5_PILOT_PACKET.md) and its `.vi.md` were refreshed to this identity by WP5-UX5-ACCEPT-PACKET (sections 0, 3, 5, 6, 7, 8, 10 and 11). The owner's answers recorded above supersede the "all pending" status of D-1..D-15 in the older sections; the authorization record stays unsigned.
- **Status (separation of three outcomes):** software readiness of WP1–WP5 on `a54061f` / `690fd8fd…`: accepted by RECHECK-RN (the product verdict of AUDIT-INT3 and REGATE14 on a byte-identical build), with the NAS still NOT VERIFIED; owner permission to start the pilot: not requested and not given; pilot result: none, no pilot has run. The next coordinator action is WP5-UX5-ACCEPT (record the acceptance and commit).
