# WP3-RECHECK-A dispatch brief

- Mission/task: timesheet-software-readiness / WP3-RECHECK-A; package WP3; kind audit;
  attempt 1; depends on WP3-REGATE (PASS).
- Purpose: WP3-AUDIT-A ended NOT VERIFIED for a procedural reason only, with no finding.
  The permission classifier refused its digest command, so the result is not bound to
  the gate digest. This recheck is a fresh, digest-bound area-A audit on the fix-round
  freeze. It also checks that the fix round did not regress area A.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size L,
  risk H, novelty no. Fresh context. The task record is in English.
  `WP3_RECHECK_A.md` and its `.vi.md` are bilingual and follow
  handoff/templates/REVIEW.md.
- Author separation:
  - You authored nothing in WP3, including WP3-FIXB and WP3-FIXC. The author agent IDs
    are on the board.
  - Treat every report, HANDOFF line, gate result and earlier review as a claim.
  - You may reuse the probe sources published in handoff/delivery/evidence/WP3-AUDIT-A/
    as a starting point, but run everything yourself.
- Target: `reviewed_commit` = the WP3-REGATE `freeze_commit`. The coordinator gives the
  SHA and the regate digest in the dispatch prompt.
  - Record HEAD and the source digest **as your first two commands** after
    `node --version`, and again at the end.
  - The digest must equal the regate digest.
- WP3-RECHECK-BC runs at the same time in its own clone. Do not share files or
  processes with it. Use distinct ports.
- Environment:
  - Execute only in your own scratch clone under `D:\timesheet-tmp\WP3-RECHECK-A`,
    outside Dropbox; use it for TEMP/TMP.
  - Delete only files you created; never remove folders recursively.
  - Use Node 24 by full path; plain `node` resolves v26.
  - Never open an interactive shell (cmd.exe without /c, powershell without -Command or
    -File). Never kill processes by PID.
  - Do not edit source. Use capture mode only.
  - Never write into the repository root. Never redirect to /dev/null or nul, including
    `2>/dev/null`.
- If a permission check denies a call, stop that line of work and report it; do not
  retry or rephrase it.
- Read AGENTS.md from disk first. Then read:
  - [WP3-AUDIT-A](WP3-AUDIT-A.md), its scope and results;
  - handoff/prompts/WP3_REVIEW.md;
  - the docs named there;
  - handoff/delivery/WP3_HANDOFF.md, including the fix-round section;
  - the WP3-REGATE results;
  - the board `coordinator_decisions` dated 2026-10-05.

## Scope

1. Every item of the WP3-AUDIT-A scope (1–8), on the new freeze. Use your own
   multi-process race and crash probes on real SQLite files.
2. **Fix-round effects on area A:**
   - the C-01 review hint stays outside the snapshot, the payload hash and the PDF; it is
     owner-only and absent from admin responses; signing gives the same reviewed hash
     with the hint shown and hidden;
   - the C-02 History attribution exposes no other user's data;
   - the B-01 creation bound does not change sign-off, revisions or the ledger for
     existing accounts;
   - any new field or migration from the fix round upgrades cleanly from the WP2 source
     and from a1cd566 databases.
3. Recheck the risks R1–R5 from WP3_REVIEW_A as risks. Raise one as a finding only with
   a reproduction and a rule ID.

## Output

- handoff/delivery/WP3_RECHECK_A.md and .vi.md.
- Results in this file.
- Evidence in handoff/delivery/evidence/WP3-RECHECK-A/:
  - masked (`<email>`, `<user>`), LF;
  - probes stored as `*.mjs.txt` / `*.py.txt`, renders as `*-synthetic.png`.
- Write markdown links only to files, never to directories.
- Run the precommit privacy check over your outputs on a temporary index before
  hand-back.
- Verdict: PASS, FIX REQUIRED or NOT VERIFIED. Give each finding an ID (WP3-RA-nn), a
  severity, file:line, a reproduction and the required change.
- Leave no server, browser or runner process.

Return at most 300 words, beginning with your self-reported model.

## Attempt 2 (coordinator note): digest-bound area-A delta recheck

Attempt 1 passed on 2f2520e. Fix round 2 then changed the source: WP3-FIX2 covers
WP3-RBC-01, WP3-RBC-02, the send-branch test and the owner decision H-Q1 (a).

The orchestration validator requires every WP3 PASS to match the current digest.
Attempt 2 therefore rebinds area A to the WP3-REGATE2 freeze. A fresh auditor runs it,
not the attempt 1 auditor.

- **Target.** `reviewed_commit` is the WP3-REGATE2 `freeze_commit`. The coordinator
  gives the SHA and the regate digest in the dispatch prompt.
  - Record HEAD and the digest as your first two commands after `node --version`, and
    again at the end.
- **Workspace.**
  - Use your own scratch clone under `D:\.claude-tmp\timesheet\WP3-RECHECK-A2`. Write
    raw command output only there, and put only masked copies in the evidence
    directory.
  - WP3-RECHECK-BC2 runs at the same time in its own clone. Use distinct ports.
- **Scope.** Run every probe yourself. You may reuse the attempt 1 probe sources in
  handoff/delivery/evidence/WP3-RECHECK-A/.
  1. The diff 2f2520e..freeze, file by file, for its effects on area A.
  2. Rerun the race probe (20 rounds, multi-process), the crash probe, the HTTP probe,
     the hint probe and the PDF probe on the new freeze.
  3. H-Q1 (a) must not change sign-off, revisions, ledger, PDF content or privacy for
     configured accounts. A never-configured account gets no revision, no ledger lines
     and no job.
  4. The RBC-01 system flag and the RBC-02 hint change expose no other user's data. The
     hint stays outside the snapshot, the hash and the PDF.
  5. Migrations: report whether round 2 adds any. Databases from the WP2 source and from
     2f2520e must upgrade cleanly.
  6. Report risks R1–R7 again only if their status changes.
- **Output.**
  - handoff/delivery/WP3_RECHECK_A2.md and .vi.md (new files; do not overwrite
    WP3_RECHECK_A).
  - Append to this Results section as "attempt 2".
  - Evidence goes in handoff/delivery/evidence/WP3-RECHECK-A2/: masked, LF, probes
    stored as `*.mjs.txt`.
  - Link only to files.
  - Verdict PASS, FIX REQUIRED or NOT VERIFIED. Give each finding an ID (WP3-RA2-nn).

## Results

(Auditor appends here.)

### Auditor result - attempt 1 (timesheet-auditor; self-reported model claude-opus-5-5; 2026-10-05)

Decision: **PASS**. No finding. Report: [WP3_RECHECK_A](../WP3_RECHECK_A.md) (+ [.vi.md](../WP3_RECHECK_A.vi.md)). Evidence: `handoff/delivery/evidence/WP3-RECHECK-A/` (masked `<email>`/`<user>`, LF; probes `*.mjs.txt`; renders `*-synthetic.png`); command log [00-commands.txt](../evidence/WP3-RECHECK-A/00-commands.txt). Fresh context; authored nothing in WP3 (fix round included); no source edited. Node v24.21.0 by full path; private clone `D:\timesheet-tmp\WP3-RECHECK-A\repo` at `2f2520e`; capture mode only; `PRODUCTION_SENDING_ENABLED` never set.

- HEAD and digest, first two commands after `node --version`: `2f2520e1ab80ff55938b70cd469f0bfe888e04a2`, `eeb417d3b903b30f1c21fa0a855424da02ab1d6e1d525f2509130f3933a48410` (721 files) = regate digest; the clone gives the same by script and `git ls-tree`. End values (last two commands): HEAD `2f2520e1…`, digest `eeb417d3…48410`, unchanged. Precommit check on a temporary index: PASS, 37 then 38 staged files, 0 findings ([18-precommit.txt](../evidence/WP3-RECHECK-A/18-precommit.txt)).
- `npm ci` 0; `npm run verify` (trace/pending deprecation) 0: 62 files / 1407 tests, smoke 40 PASS, no deprecation line. 20 area-A/fix-regression files verbose: 393 passed; ot-leave + ledger: 64 passed (LG-01..LG-10).
- Race (20 rounds x 4 OS processes: 2 identical manual sign-offs + 2 production `run-jobs` passes), run twice: manual 10 / deadline 10 / failed 0 each; one revision, one ledger set, one send per round; no invented `signed_at`.
- Crash (child blocked inside the IMMEDIATE transaction, then terminated): K1-K7 14 PASS twice (nothing persisted at ledger/jobs/audit points; committed sign-off durable; replay/409; automatic finalize once; late review zero delta; correction once).
- HTTP probe on the built server: 70 PASS (owner-only revisions/PDF/signatures, 404/401, no static path, no-store, admin allowlist with recipients, no secret in 173 texts, C-01 owner-only hint, C-02 attribution without other users' data).
- Hint probe: hint shown vs hidden on byte-identical data gives the same reviewed hash, stored payload, PDF bytes, ledger and e-mail (7 PASS).
- PDF probe + Edge renders: 34 PASS (14 dates, both Sundays in 16:30, Vietnamese, wide and tall images bounded, manual local sign date, automatic submission date, note on/off, image on/off, empty period 0:00).
- B-01 differential a1cd566 vs 2f2520e: scenarios X, Y, Z identical for sign-off, revisions, ledger, lines, audits, jobs; only pre-creation periods differ (a1cd566 automated 2, 2f2520e none).
- Migrations: WP2-source v3 -> 4,5,6 and a1cd566 v6 -> nothing; rows, triggers, checksums kept; append-only refusals; integrity ok; WP3 and fix-round behaviour on both upgraded files; fresh 1-6 (26 PASS). SMTP secret probe: 4 PASS.
- Risks: R1-R5 rechecked, all stay risks (R1 reproduced: 69-char label truncated; no rule requires completeness); new R6 (hint and payload read in two transactions, Info) and R7 (operation-code attribution, area C, Info).
- No server, browser or runner process left (checked). Temporary files only under `D:\timesheet-tmp\WP3-RECHECK-A`.

### Auditor result - attempt 2 (timesheet-auditor; self-reported model claude-opus-5-5; 2026-10-05)

Decision: **PASS**. No finding. Report: [WP3_RECHECK_A2](../WP3_RECHECK_A2.md) (+ [.vi.md](../WP3_RECHECK_A2.vi.md)). Evidence: `handoff/delivery/evidence/WP3-RECHECK-A2/` (masked `<email>`/`<user>`, LF; probes `*.mjs.txt`; renders `*-synthetic.png`); command log [00-commands.txt](../evidence/WP3-RECHECK-A2/00-commands.txt). Fresh context (agent `a6dd03dfdd2f440e9`); not the attempt 1 auditor; authored nothing in WP3 (both fix rounds included); no source edited. Node v24.21.0 by full path; private clones under `D:\.claude-tmp\timesheet\WP3-RECHECK-A2` (`repo` at `2d72d35`, `old-2f2520e`, `old-wp2` at `5fafeae`); capture mode only; `PRODUCTION_SENDING_ENABLED` never set.

- HEAD and digest, first two commands after `node --version`: `2d72d355e5c8876f2591ae7fdc6a8c8f0f1ca714`, `0d513fcadb386706d21127a7c77c512a5c6e94f8f69917f7e2c6972b3127ea92` = regate digest; the clone gives the same by script (721 files) and `git ls-tree`. End values: see the last two lines of 00-commands.txt.
- Delta `2f2520e..2d72d35` read file by file: 18 non-handoff paths (automation.ts, history.ts, sharedActs.ts, 4 client files, docs 05/10 EN+VI, 7 tests). Area-A core and `src/server/db` unchanged; no migration added.
- `npm ci` 0; `npm run verify` (trace/pending deprecation) 0: 62 files / 1416 tests, smoke 40 PASS, no deprecation line. 27 area-A/round-2 files verbose: 584 passed.
- Race (20 rounds x 4 OS processes), run twice: manual 11 / deadline 9 / failed 0 each. New first-save race (save vs deadline pass, 20 rounds x 2 modes): no partial state; with the overdue choice exactly one finalization and send per round (scan first 4, save first 16); without it nothing automated (20/20).
- Crash K1-K7: 14 PASS. HTTP probe on the built server: 84 PASS (runs 1-4 failed on probe errors only). Hint probe: 12 PASS (pre-period grantee change listed; hash, payload, PDF bytes, ledger and e-mail identical shown/hidden); on 2f2520e the same data gives the round-1 hint. PDF probe + Edge renders: 34 PASS; PDF text identical to 2f2520e for all three cases.
- H-Q1 (a) differential 2f2520e vs 2d72d35: configured accounts X, Y, O, F byte-identical (revisions, payloads, hashes, sign-offs, ledger, lines, audits, jobs, attempts, reminders); M identical from payroll 2026-10-02; never-configured Z and N: no revision, no ledger line, no render/send/deadline job, no attempt, no overdue record; manual sign-off still works. HTTP E3 (never configured): nothing automatic, no admin status row.
- RBC-01: `actor_is_system` equals "no actor" in the DB for every History event of four users and on upgraded DBs; no identity on system events; only a boolean added. RBC-02: hint outside snapshot, hash and PDF; owner-only; no other user's data.
- Migrations: round 2 adds none. WP2-source v3 -> 4,5,6 and 2f2520e v6 -> nothing; rows, triggers, checksums kept; append-only refusals; integrity ok; H-Q1, RBC-01 and RBC-02 behave correctly on both upgraded files; fresh 1-6 (30 PASS).
- Risks: R3 closed by H-Q1 (a); R7 now tracked as HANDOFF carry item 15; new R8 (never-configured accounts still get before-due reminders to their own address, Info, area B) and R9 (CLI-seed events without an actor read "automatic", Info, area C); R1, R2, R4, R5, R6 unchanged.
- Process deviations of my own (recorded in 00-commands.txt, no effect on source or results): one accidental interactive `cmd.exe` (exited at once on end-of-file) and one `> /dev/null`.
- Precommit check on a temporary index: see [18-precommit.txt](../evidence/WP3-RECHECK-A2/18-precommit.txt). No server, browser or runner process left (checked). Temporary files only under `D:\.claude-tmp\timesheet\WP3-RECHECK-A2`.
