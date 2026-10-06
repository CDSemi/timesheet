# WP4 recheck — area A (operations) after the fix round

Form: [REVIEW](../templates/REVIEW.md). Translation: [WP4_RECHECK_A.vi.md](WP4_RECHECK_A.vi.md). Review prompt: [WP4_REVIEW](../prompts/WP4_REVIEW.md); dispatch brief and task record: [WP4-RECHECK-A](tasks/WP4-RECHECK-A.md). Earlier area-A review (kept unchanged): [WP4_REVIEW_A](WP4_REVIEW_A.md). Evidence: `handoff/delivery/evidence/WP4-RECHECK-A/` (index in `00-README.txt`; masked, LF; probe sources `*.mjs.txt`).

- **Package/date/reviewer and observable model/effort:** WP4, area A (operations), fresh recheck after the fix round WP4-FIXA and WP4-FIXB. 2026-10-06, 12:45 to 13:10 UTC. Reviewer: the WP4-RECHECK-A subagent (profile timesheet-auditor, board agent `a659b8cbd52722f18`), self-reported model `claude-opus-5-5`; requested opus/xhigh; effort and speed are not observable from inside the session.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:**
  - Commit `0f7fba2ee6bc2a7affcd1a3bf800e085351c7b65`, the WP4-REGATE `freeze_commit`. `origin/main` is the same commit, so no commit is unpushed.
  - Source digest `dfe4541d2c6c908a00782ed9fbe2fb7a3be48ea18aa9fc23ae1ced9085b86742` over 775 files (`handoff/` excluded), equal to the gate digest of record.
  - Recorded before (12:45 UTC) and after (13:03 UTC) in the repository, with the `git ls-tree` form and `scripts/source-digest.mjs` (`00`, `99`). It was rechecked at 13:09 UTC, after the reports and the evidence were written (`99b`). HEAD did not move, and no file outside `handoff/` changed.
  - Complete source: a `git archive` export of the commit. Its full tree id `ce6f443d…` equals the freeze tree, and its digest is equal before and after every check (`00b`, `99`).
- **Decision: PASS / FIX REQUIRED / NOT VERIFIED:** **PASS.**
  - WP4-A-01 to A-04 are closed, each by my own reproduction.
  - The R-A1, R-A5 and R-A7 changes are correct and safe.
  - The fixes changed nothing else in area A: backup and restore, the pause and reconciliation, upgrade and rollback, retention and the admin allowlists all hold again on the new freeze.
  - The FIXB documentation sync in docs/07 and docs/10 matches the code.
  - The same-second tie of scope item 5 is acceptable (Info, R-RA1).
  - No finding. Four risks or optional improvements are listed separately (R-RA1 to R-RA4).
- **Scope actually inspected/executed:**
  - Read: AGENTS.md (from disk), the brief, WP4_REVIEW, WP4_REVIEW_A with its evidence, and the results of WP4-FIXA, WP4-FIXB and WP4-REGATE. Also docs/03:49, docs/07, docs/10 and docs/11 with their `.vi.md` pairs, the `13a258d..0f7fba2` diff of every non-handoff path, and the board entries for author and auditor separation.
  - Code read: `Dockerfile`, `vite.config.ts`, `tsconfig.server.json`, `.dockerignore`, `.env.example`, `src/server/app.ts` (static routes), `ops/prune.ts` (whole file), `ops/backup.ts` (naming), `cli.ts` (backup, prune and bootstrap paths), `services/bootstrap.ts` and the domain validators it calls, `scripts/container-drill.mjs` (the changed checks), `scripts/smoke-built-server.mjs`, `tests/integration/static-assets.test.ts` and `backup-prune.test.ts` (R-A1). Also `xlsxReader.ts` limits, `templateMapping.ts` caps, `workbookImport.ts` (I-3 states and the 422 path), the `automation.ts` due comparison and the client sources for retention.
  - Executed on the export: `npm ci`; `npm run verify` with `DATA_DIR` and `DATABASE_PATH` exported; the full container drill with the WP3 build; an independent `docker build --no-cache`; a layer scan of both images without starting a container; the first audit's probes P2, P3, P4, P7 and P8 again; two new probes (R-A1 and prune, and A-03 bootstrap refusals); read-only source checks.
- **Evidence table:**

| Command | Result / exit | Evidence |
|---|---|---|
| `git ls-tree` digest and `scripts/source-digest.mjs` in the repository, before and after | HEAD `0f7fba2`; `dfe4541d…` (775 files) both times; no non-handoff change | `00`, `99` |
| `git archive 0f7fba2`; private git dir `add -A`, `write-tree` (outside the repository) | tree `ce6f443d…` = freeze tree; digest `dfe4541d…` before and after all checks | `00b`, `99` |
| `npm ci` (Node 24.21.0, npm 11.18.0) | exit 0, 169 packages, no deprecation line | `01` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify`, `DATA_DIR` and `DATABASE_PATH` exported to the task folder | exit 0: typecheck, lint, 76 files / 1734 tests, build, SMOKE PASSED; no deprecation line; the exported `DATA_DIR` stayed empty | `02` |
| WP3 build for stages 4-5 (`git archive 49651c8`, `npm ci`, `build:server`) | exit 0 | `03` |
| `node scripts/container-drill.mjs --work <work>\drill --project ts-wp4-rca --wp3 <work>\wp3` | exit 0, `DRILL STAGES 1-6 PASSED`, 33/31/57/35/27/23 PASS (208), 0 FAIL | `04` |
| `docker build --no-cache --platform linux/amd64 --tag ts-wp4-rca-timesheet:nocache .` | exit 0; `tsc -p tsconfig.server.json --sourceMap false`; vite prints no map | `05` |
| `docker image save` and `tar` over every layer of both images | `/app/dist`: 116 files, 0 `*.map`, 0 files with `sourceMappingURL`, identical in both images; 566 third-party maps under `/app/node_modules` (R-RA3) | `06`, `07` |
| P2 (first audit) backup under three writers, isolated restore | exit 0, 31 PASS (writes during the backup: 74 sessions, 14 signatures, 5 opening balances) | `10` |
| P8 admin status and account list allowlists | exit 0, 8 PASS; same check lines as the first audit | `11` |
| P7 retention window and daily sweep while paused | exit 0, 23 PASS; same check lines as the first audit | `12` |
| New probe R-A1 and prune (library, CLI, tie, paired backup) | exit 0, 24 PASS plus measurements | `13` |
| New probe A-03 bootstrap refusal output (13 invalid files, 1 valid) | exit 0, 15 PASS | `14` |
| `git diff --name-only 13a258d 0f7fba2 -- . ':!handoff'` and `--stat` over area-A runtime paths | 29 paths; area-A runtime code changed only in `ops/prune.ts`, the `bootstrap.ts` comment and the `app.ts` asset route | `15` |
| P3 (first audit) prune selection and NTFS junction escapes; scenario B now expects the refusal | exit 0, 10 PASS | `16` |
| P4 (first audit) backup and restore target boundaries, tampered backups | exit 0, 16 PASS | `17` |
| Docker leftovers by project and name; `docker image rm` of both audit images | nothing left | `18` |
| Read-only source greps behind each closure | see the file | `19` |
| `validate_package.py --preflight` (workflow Python) after the report pair was written | exit 0, PASS, 77 translation pairs | `20` |
| `scripts/precommit-check.mjs` over this task's files, staged in a private git dir outside the repository | exit 0, 0 findings | `21` |

- **Findings:** none. No defect was observed in the reviewed snapshot.
- **Verified closures and checks, by brief scope item:**
  1. Findings closed:
     - **WP4-A-01 closed.**
       - Both images (the drill build and my no-cache build) have no `*.map` and no `sourceMappingURL` anywhere under `/app/dist` (`06`, `07`).
       - In the running container the bundle has no `sourceMappingURL`, and `/assets/<bundle>.map` answers 404 (drill stage 1, `04`).
       - The drill's forbidden-file scan has the `*.map` rule for `/app/dist`.
       - `app.ts` answers 404 JSON for any missing `/assets/*` instead of the single-page fallback (`static-assets.test.ts` passes in the 1734).
       - Local builds keep their maps (`02`, vite prints `map:`), as allowed.
     - **WP4-A-02 closed.** `.env.example:60-61` says `JOB_RUNNER=off` is required after a `restore --keep-schema --confirm` rollback until reconciliation, and otherwise unset. That matches docs/07:32, docs/10:159, docs/11 section 8 step 3 and the CLI's warning (`19`).
     - **WP4-A-03 closed.**
       - (a) No client component renders the retention run; only the `api.ts` type has it (`19`). docs/11 sections 5 and 12 now say that it is in the JSON only.
       - (b) Thirteen invalid bootstrap files carried markers in the calendar name, zone, holiday names, unknown keys and values, and an extra policy field. All exit 1, and none prints a marker. A refusal quotes only a date (`2026-01-01`, `2026-02-30`) or policy numbers (`08:00–17:00 (540 min) … 470 … 60`), or names a field and a rule. A non-JSON file prints a fixed text. The valid file prints counts and the token only (`14`). The runbook and the `bootstrap.ts` comment state exactly this.
     - **WP4-A-04 closed.** `npm run verify` exits 0 with `DATA_DIR` and `DATABASE_PATH` exported, and the exported folder stays empty (`02`). The smoke sets its own `DATA_DIR`.
  2. Improvements:
     - **R-A1 is correct and safe.**
       - A candidate dated after the clock refuses the whole run, dry run and real run alike, with `clock_behind_backups` (exit 2), and removes nothing. The guard runs before selection and removal.
       - Boundary: a backup exactly at the clock passes; one second later is refused.
       - A future-dated folder that is not the tool's (a wrong manifest or name) is only counted and does not refuse.
       - Through the CLI with the real clock, `backup prune --dry-run` and `backup --to --prune` exit 2 with empty stdout (dry run) and no name or path on stderr. The new verified backup is kept.
       - Normal pruning still works. On 180 nightly backups it keeps 13 and removes 167, and the kept set equals my independent 7-day / 4-ISO-week / 6-month computation. Through the CLI, `--prune` exits 0 with `removed 2, kept 2` (`13`, and `16` with the junction escapes still safe).
     - **R-A5 is correct.** Two held send jobs (`held 2, releasable 2`): the release by id frees one, `outbound release --all --confirm` reports `released 1`, and both jobs are claimed with exactly one delivery attempt each (`[0,0] -> [1,1]`, drill stage 3). The check now needs `released >= 1`.
     - **R-A7 is correct.** docs/03:49 (EN and VI) says "in the administrator's account list".
  3. Regression, nothing else changed in area A:
     - The diff since the first freeze touches area-A runtime code only in `ops/prune.ts` (the guard and its comment), the `bootstrap.ts` comment and the `app.ts` asset route (`15`).
     - Backup and restore: P2 31 PASS (WAL-consistent copy under writes, atomic ledger with its audit rows, the copy is a subset of the live data, isolated restore with an identical live tree, hashes, and balances through SQL and the API), P4 16 PASS, drill stages 2 and 3.
     - Pause and reconciliation: drill stage 3, 57 PASS.
     - Upgrade and rollback: drill stages 4 (35) and 5 (27), with the old build refusing the upgraded database and `--keep-schema` needing `--confirm`.
     - Retention: P7 23 PASS and the retention tests in the 1734.
     - Admin allowlists: P8 8 PASS, with exact key paths including `retention` and `not_set_up`.
  4. **The FIXB docs sync matches the code** (`19`):
     - docs/07 gives 4 MiB of XML per part (`maxPartXmlBytes`) and 16 MiB in all (`maxTotalXmlBytes`). It names the element, cell, row and shared-string caps, more than 2,000 holiday rows (`MAX_HOLIDAY_ROWS`, rejected as `too_many_holidays`), 422 `workbook_rejected`, and capped findings (`MAX_FINDING_SOURCES` 20, `MAX_FINDINGS_PER_CODE` 25).
     - The I-3 safe default: `periodEnd >= today` is `not_ended`, and `dueAtUtc > now` is `not_due`, so the due instant itself counts as due, as in `automation.ts:200`.
     - docs/10 has the dated, reversible coordinator decision. docs/11:225 is aligned. The VI pairs match, and no other doc still states the old I-3 rule.
  5. **The WP4-REGATE observation is acceptable (Info): R-RA1 below.**
- **Risks and optional improvements, separate from proven defects:**
  - **R-RA1 (scope item 5), the same-second tie. Judged acceptable, not a defect.**
    - `newerFirst` (`ops/prune.ts:77-80`) breaks an equal-instant tie by the folder name, whose last 8 hex digits are random.
    - When two backups share a UTC second and the just-created one (`requiredName`) has the lower suffix, `--prune` removes it and keeps the other.
    - Measured (`13`): 7 of 12 back-to-back CLI pairs (`backup --to`, then `backup --to --prune`) shared a second. In 3 of those 7, the command removed the backup it had just printed.
    - In every case exactly one complete, verified backup of that same second remained. The day window keeps only one backup per UTC day anyway, and the two copies differ by under one second of writes. The scheduled nightly backup never ties.
    - The only visible effect: the folder name printed by that command may no longer exist.
    - Optional improvement: on an equal instant, keep `requiredName`.
  - **R-RA2, the paired pre-upgrade backup and retention (Low; documentation, owner or coordinator choice).**
    - docs/11 section 8 (Upgrade step 1) and docs/07:32 rely on the paired pre-upgrade backup.
    - A later `--prune` in the same UTC day removes it, because only the newest backup of each UTC day is kept (`13`: paired backup at 03:00Z and nightly at 19:00Z the same day, so it is removed; with the nightly at 00:30Z the next day, it is kept).
    - A rollback then needs the previous day's nightly (the same older schema, kept as the newest of its day), losing the hours before the upgrade, or the separate-device copy of section 4 step 3.
    - Optional: one runbook line, "before the upgrade, copy the paired backup outside `<backup-dir>` or check it on the separate device".
  - **R-RA3, third-party source maps in the image (Info).**
    - `/app/node_modules` holds 566 published `*.map` files: pdf-lib 560, fast-xml-parser 4, fast-xml-builder 1, path-expression-matcher 1 (`06`).
    - They are public dependency code, are never served (the static root is `dist/client`, and `/assets/*.map` answers 404) and hold no secret. FIXA declared the drill rule's `/app/dist` scope.
    - The Dockerfile comment "The image ships no source maps" means the app build.
    - Optional: reword the comment, or delete `node_modules/**/*.map` in the `prod-deps` stage.
  - **R-RA4, a far-future backup blocks pruning (Info; fail-safe).**
    - If the host clock was once ahead and a backup got a future name, every later `--prune` and dry run exits 2 until an operator moves that folder.
    - The runbook says only "fix the host time first". Nothing is removed, the scheduled task fails visibly, and the disk alert of section 11 eventually fires.
    - Optional runbook sentence: when the host time is right, move the future-dated folder (its name shows the instant) out of `<backup-dir>`.
  - Wording nit (Info, pre-existing): docs/11 section 4 step 1 says the backup "prints counts only", but it also prints the new folder name, which section 8 step 1 relies on.
  - The first audit's R-A2, R-A3, R-A4, R-A6, R-A8 and R-A9 stand as recorded. Their code is unchanged, and they were not re-measured beyond the probes listed above.
- **Required gates unrun/blocked and why:**
  - NAS target and native arm64: NOT VERIFIED (no owner access; owner steps in docs/11). They are outside this workstation recheck, as in the first audit.
  - `npm run test:e2e` was not rerun; it is not required for area A, and the regate reported 145 passed and 5 skipped. No real SMTP (capture only).
  - The first audit's P1 and P1b (migration runner), P5 (bootstrap token), P6 (proxy and configuration) and P9 were not rerun as separate probes:
    - `db/`, `config.ts`, `http/`, `auth/`, `cli.ts` and the bootstrap logic are unchanged since `13a258d` (`15`);
    - drill stages 1, 3, 4 and 5 and the 1734 tests cover them on this freeze.
- **Disposition of previous findings:**
  - WP4-A-01, A-02, A-03 and A-04: closed.
  - R-A1: implemented and verified.
  - R-A5 and R-A7: closed.
  - R-A2, R-A3, R-A4, R-A6, R-A8 and R-A9: unchanged backlog or owner choices.
  - The WP4-REGATE same-second observation: R-RA1, acceptable.
- **Software readiness, owner permission and pilot result separately:**
  - Software readiness of area A: accepted at `0f7fba2` / `dfe4541d…` on a workstation (Docker Desktop, linux/amd64). The NAS and arm64 are not verified.
  - Owner permission: none requested or given; nothing deployed and nothing sent.
  - Pilot result: none (WP5).
- **One next action/prompt:** the coordinator records WP4-RECHECK-A as PASS at digest `dfe4541d…`. Once WP4-RECHECK-B finishes, it moves WP4 to acceptance. R-RA1 and R-RA2 can go to the backlog as optional runbook or prune improvements.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:**
  - WP4-RECHECK-A, attempt 1. Reviewer: timesheet-auditor subagent `a659b8cbd52722f18` (`claude-opus-5-5`).
  - Authors of the reviewed delta: WP4-FIXA `a7b344b3ceca312e4` and WP4-FIXB `afacb78fd37c3d657`, both `claude-sonnet-5-5`. Committer WP4-FIX-FREEZE `a1f25540e4029dee5` and verifier WP4-REGATE `a042ae51bdbb94d57`, both sonnet.
  - The strongest WP4 author model is `claude-opus-5-5` (T05, T06, T09, T10), so the reviewer is not weaker.
  - The reviewer is not the first area-A auditor `af8b9184c8adf6eb0`.
- **Fresh context; confirm reviewer did not author changes:** fresh context. This reviewer authored nothing in WP4. It wrote only this report, its translation, the results in the brief and `evidence/WP4-RECHECK-A/`. No source was edited, and probes ran in a scratch export outside Dropbox.
- **Source digest before/after; gate evidence for that snapshot:** `dfe4541d…86742` before and after (repository and export), equal to the WP4-REGATE digest of record (`handoff/delivery/evidence/WP4-REGATE/`).
- **New report path preserving previous review history:** `handoff/delivery/WP4_RECHECK_A.md` (new file); `WP4_REVIEW_A` and the other reviews are unchanged.
- **Finding dispositions and next coordinator fix/recheck task:** no fix task is needed for area A. Optional backlog: R-RA1 to R-RA4. Next: WP4 acceptance once WP4-RECHECK-B finishes.
