# WP4 recheck — area A (operations), attempt 3: delta recheck on the round-3 fix freeze

Form: [REVIEW](../templates/REVIEW.md). Translation: [WP4_RECHECK_A3.vi.md](WP4_RECHECK_A3.vi.md). Review prompt: [WP4_REVIEW](../prompts/WP4_REVIEW.md); dispatch brief and task record: [WP4-RECHECK-A](tasks/WP4-RECHECK-A.md), section "Attempt 3". Earlier area-A reviews (kept unchanged): [WP4_REVIEW_A](WP4_REVIEW_A.md), [WP4_RECHECK_A](WP4_RECHECK_A.md) (attempt 1) and [WP4_RECHECK_A2](WP4_RECHECK_A2.md) (attempt 2). Evidence: `handoff/delivery/evidence/WP4-RECHECK-A3/` (index in `00-README.txt`; masked, LF; helper sources `*.sh.txt`, `*.mjs.txt`).

- **Package/date/reviewer and observable model/effort:** WP4, area A (operations), digest-bound delta recheck (WP4-RECHECK-A attempt 3) after WP4-FIXB3. 2026-10-06, 17:00 to about 17:25 UTC. Reviewer: the WP4-RECHECK-A attempt-3 subagent (profile timesheet-auditor, board agent `a9f9312409bbc8109` as recorded by the coordinator), self-reported model `claude-opus-5-5`; requested opus/xhigh; effort and speed are not observable from inside the session.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:**
  - Commit `972ccda6409a7521a008c55c35a5b5cf416daf1e`, the WP4-REGATE3 `freeze_commit`; its parent is `cc34e7f`. `origin/main` is the same commit, so no commit is unpushed.
  - Source digest `635f909da72873548d93407fb3d250806a7e1c29f101cb32e91234c2c9ec3f7b` over 775 files (`handoff/` excluded), equal to the gate digest of record.
  - Recorded before (17:00 UTC) and after the checks (17:10 UTC) in the repository, in the `git ls-tree` form and with `scripts/source-digest.mjs` (`00`, `99`). Rechecked after the reports, the task record and the evidence were written (`99b`). HEAD did not move, and no file outside `handoff/` changed.
  - Complete source: a `git archive` export of the commit. Its full tree id `b0545cec…` equals the freeze tree, and its digest is the same before and after the checks (`00b`, `99`).
- **Decision: PASS / FIX REQUIRED / NOT VERIFIED:** **PASS.**
  - The delta since `cc34e7f` touches 7 paths outside `handoff/`. Each is a WP4-FIXB3 owned path, and none is an area-A runtime path. `package.json`, the lock and `.npmrc` are blob-identical.
  - The docs/07 change is line 46 only, EN and VI. It touches only the workbook reader's limit-and-budget statement, and its numbers equal the code.
  - `npm ci` prints no deprecation line. `npm run verify` passes with `DATA_DIR` and `DATABASE_PATH` exported: 76 files, 1755 tests, and the same 41 smoke checks as attempt 2.
  - The WP4-REGATE3 drill result was read: 208 PASS, with check names identical to attempt 2's drill.
  - The seven area-A probes of attempt 1 pass again, with identical check lines.
  - The Dockerfile's build-stage commands, run without Docker, produce a `dist/` with no map and no `sourceMappingURL`.
  - Every attempt-1 and attempt-2 conclusion still applies.
  - No finding. The earlier risks stand. Two new Info risks (R-RA6, R-RA7) concern a dev-only dependency advisory and a drill label, not the product.
- **Scope actually inspected/executed:**
  - Read:
    - AGENTS.md (from disk) and the brief (attempt-3 section);
    - WP4_REVIEW and the REVIEW template;
    - WP4_RECHECK_A2, which stays unchanged, and the attempt-1 and attempt-2 results in the brief;
    - the WP4-FIXB3 and WP4-REGATE3 results and the REGATE3 evidence;
    - the board entries of WP4-RECHECK-A, WP4-FIXB3, WP4-FIXB3-FREEZE, WP4-REGATE3 and WP4-RECHECK-B3, for the separation of authors and auditors.
  - Code and docs read:
    - the whole non-handoff `git diff cc34e7f 972ccda`;
    - `workbookImport.ts`: the R-B2-1 change and the unchanged `importedPeriodError` and `isImportedTimesheet`;
    - `templateMapping.ts`: the `matchedHoliday` WeakMap;
    - the `xlsxReader.ts` limits and budget comment;
    - the docs/07 hunk, EN and VI (word diff);
    - the `Dockerfile` build stage, and the bundle check in `scripts/container-drill.mjs`.
  - Executed on the export:
    - `npm ci`, `npm ls`, `npm audit --omit=dev` and the full `npm audit`;
    - `npm run verify` with `DATA_DIR` and `DATABASE_PATH` exported and deprecation tracing on;
    - the Dockerfile build-stage commands on a second export, with no Docker;
    - the attempt-1 probes P2, P8, P4, P7, P3, R-A1 and A-03, unchanged;
    - read-only source and digest checks.
  - No Docker command was run.
- **Evidence table:**

| Command | Result / exit | Evidence |
|---|---|---|
| `git ls-tree` digest and `scripts/source-digest.mjs` in the repository, before and after | HEAD `972ccda` = `origin/main`; `635f909d…` (775 files) both times; no non-handoff change | `00`, `99` |
| `git archive 972ccda`; private git dir `add -A`, `write-tree` (outside the repository) | tree `b0545cec…` = freeze tree; digest `635f909d…` before and after the checks | `00b`, `99` |
| `git diff --name-status cc34e7f 972ccda`; `git diff --quiet … -- package.json package-lock.json` | 148 paths: 141 under `handoff/` (134 added, 7 modified), 7 outside, all FIXB3 owned; package files unchanged (exit 0; blobs `c74a01b9`, `f4f491a6`) | `10` |
| Read-only source checks (`git grep`, `git rev-parse <commit>:<path>`, `git diff --word-diff`) | no area-A path changed since `0f7fba2`; the two exports used outside area B are identical; docs/07 changes 2 sentences of line 46 only; its numbers equal the code | `11` |
| `npm ci`; `npm ls fast-xml-parser`; `npm audit --omit=dev`; `npm audit` (Node 24.21.0, npm 11.18.0) | exit 0, 161 packages, no deprecation line; `fast-xml-parser` absent; production audit 0; full audit 1 high in dev-only `source-map-js` 1.2.1 | `12` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify`, `DATA_DIR` and `DATABASE_PATH` exported | exit 0: typecheck, lint, 76 files / 1755 tests, build, SMOKE PASSED (41); no deprecation line; the exported `DATA_DIR` stayed empty | `13`, `13b` |
| `npm run build:server -- --sourceMap false`, then `BUILD_SOURCEMAPS=off npm run build:client`, on a second export | exit 0, 0; `dist/`: 116 files, 0 `*.map`, 0 `sourceMappingURL`; the FIXB3 reader is in it; bundle `index-ZGs6tcbH.js` | `14` |
| WP4-REGATE3 `04-drill.txt` read and compared with attempt 2's `15-drill.txt` | exit 0, 208 PASS (33/31/57/35/27/23), 0 FAIL; check names identical; same served bundle as `14` | `15` |
| Attempt-1 probes rerun unchanged: P2, P8, P4, P7, P3, R-A1, A-03 | all exit 0: 31, 8, 16, 23, 10, 24 and 15 PASS; check lines identical to attempt 2 | `20`-`27` |
| `validate_package.py --preflight` (workflow Python), after the report pair and the task record were written | exit 0, PASS, 80 translation pairs | `28` |
| `scripts/precommit-check.mjs` over this task's files, staged in a private git dir outside the repository, run last | exit 0, 0 findings, each run (31 files in the last one) | `29` |

- **Findings:** none. No defect was observed in the reviewed snapshot.
- **Verified checks, by brief attempt-3 scope item:**
  1. The delta (`10`, `11`):
     - `git diff --name-status cc34e7f 972ccda` lists 7 paths outside `handoff/`:
       - `src/server/import/xlsxReader.ts`, `src/server/import/templateMapping.ts` and `src/server/services/workbookImport.ts`;
       - `tests/integration/workbook-reader.test.ts` and `workbook-import.test.ts`;
       - docs/07 EN and VI.
     - Every one is an owned path of WP4-FIXB3 on the board. `src/client/importModel.ts`, `.claude/`, `reference/`, the migrations, `AGENTS.md` and `CLAUDE.md` are unchanged.
     - The 141 handoff paths are records and evidence:
       - the WP4-RECHECK-A2 and WP4-RECHECK-B2 report pairs;
       - nine task briefs under `handoff/delivery/tasks/`;
       - the board and the workflow checkpoint pair;
       - 125 evidence files.
     - No path is area-A runtime. Each of these is blob-identical at `0f7fba2`, `cc34e7f` and `972ccda`:
       - `src/server/ops`, `db`, `jobs`, `routes`, `mail` and `files`;
       - `cli.ts`, `app.ts`, `index.ts` and `config.ts`;
       - `bootstrap.ts`, `automation.ts` and `operationsStatus.ts`;
       - the `Dockerfile`, `compose.example.yaml`, `.dockerignore` and `.env.example`;
       - `scripts/`, `vite.config.ts` and `tsconfig.json`;
       - docs/03, docs/10 and docs/11, EN and VI.
     - Importers of the changed modules:
       - `routes/imports.ts`, the area-B import route;
       - `finalization.ts`, `otLeave.ts` and `timesheetCommands.ts`, which import only `importedPeriodError` and `isImportedTimesheet`. Their text is identical at both commits (`cmp` exit 0).
       - No area-A module imports any changed module. The `workbookImport.ts` hunks touch only `reportDay` and `buildReport` (R-B2-1). Import-source storage, which the backup copies, is unchanged.
     - `package.json` and `package-lock.json` are unchanged (`git diff --quiet` exit 0; same blob ids), and so is `.npmrc`.
     - The docs/07 change is one line (46), EN and VI. The word diff shows changes in two sentences only:
       - the reader's refusal list: 16 → 8 MiB and 200,000 → 150,000, plus kept attribute values (255 characters) and a declared encoding other than UTF-8 or UTF-16;
       - the budget sentence, which gains the measured worst case (about 290 ms and +89 MiB).
       - The 500 ms / 150 MiB claim is unchanged.
       - Every number equals `DEFAULT_READER_LIMITS` and the `unsupported_encoding` refusal at `972ccda`.
       - This is the workbook-reader limit-and-budget statement, so it is no wider than the brief allows. No operations text changed.
       - The docs/11 "at most 8 MiB" upload line is `maxCompressedBytes`, unchanged.
  2. `npm ci` and `npm run verify` on the export (`12`, `13`, `13b`):
     - `npm ci`: exit 0, 161 packages, no deprecation line, `fast-xml-parser` absent. `npm audit --omit=dev`: 0 vulnerabilities.
     - `npm run verify` with `DATA_DIR` and `DATABASE_PATH` exported and `--trace-deprecation --pending-deprecation`: exit 0.
       - 76 files / 1755 tests, against 1750 in attempt 2; the 5 new tests are FIXB3's area-B workbook tests.
       - SMOKE PASSED, with the same 41 check names as attempt 2.
       - No deprecation line.
       - The exported `DATA_DIR` held 0 entries before and after. A-04 still holds.
  3. The WP4-REGATE3 drill result (`15`):
     - Read: exit 0, `DRILL STAGES 1-6 PASSED`, 208 PASS (33/31/57/35/27/23), 0 FAIL. Its 208 check names are identical to attempt 2's drill.
     - Stage 1 holds:
       - the forbidden-file scan, including source maps under `/app/dist`;
       - a bundle with no `sourceMappingURL`;
       - `/assets/<bundle>.map` answering 404;
       - a numeric non-root user and production dependencies only.
     - Stage 2: backup under writes, including the import sources.
     - Stage 3: restore paused with reason `restored`, then release by id and `--all`, each released job making exactly one attempt (R-A5).
     - Stages 4 and 5: upgrade from the WP3 schema, and rollback.
     - I did not rerun the container drill (see "Required gates unrun"). In its place:
       - I ran the `Dockerfile` build-stage commands on a second export (`14`): `tsc --sourceMap false`, then vite with `BUILD_SOURCEMAPS=off`. Result: 116 files, 0 `*.map`, 0 `sourceMappingURL`, the same counts as the attempt-1 and attempt-2 images.
       - That bundle has the content-hashed name `index-ZGs6tcbH.js` and a decoded length of 454,172. Both equal what the REGATE3 container served.
  4. The attempt-1 and attempt-2 conclusions still apply (`20`-`27`):
     - The seven attempt-1 probes, rerun unchanged against this freeze's built server and CLI, all exit 0, with check lines identical to attempt 2:
       - P2, backup under three writers and isolated restore with hashes and balances: 31;
       - P8, admin allowlists: 8;
       - P4, backup and restore target boundaries: 16;
       - P7, retention window and the paused sweep: 23;
       - P3, prune junction escapes: 10;
       - R-A1 refusal and normal pruning: 24;
       - A-03, bootstrap refusals that print no marker: 15.
     - So:
       - WP4-A-01 to A-04 are closed;
       - R-A1, R-A5 and R-A7 are correct;
       - backup and restore, pause and reconciliation, upgrade and rollback, retention and the admin allowlists hold;
       - the docs sync holds;
       - the same-second tie is still acceptable (Info).
     - The area-A code they rest on is byte-identical between `0f7fba2`, `cc34e7f` and `972ccda`.
- **Risks and optional improvements, separate from proven defects:**
  - **R-RA1 (Info), the same-second tie: unchanged and still acceptable.** `ops/prune.ts` is unchanged. In this run, 6 of 12 back-to-back CLI pairs shared a UTC second, and in 3 of them `--prune` removed the backup it had just printed. One complete backup of that second always remained (`25`).
  - **R-RA2 (Low), the paired pre-upgrade backup: unchanged.** A later `--prune` in the same UTC day removes it; on the next UTC day it is kept (`25`).
  - **R-RA3 (Info), third-party source maps in the image: not re-measured.** The dependencies are unchanged since attempt 2, which counted 560 (pdf-lib only). They are never served; REGATE3 stage 1 shows `/assets/*.map` answering 404.
  - **R-RA4 (Info), a far-future backup blocks pruning: unchanged** (the code is unchanged).
  - **R-RA5 (Info), drill tooling: still applies.**
    - The REGATE3 image build took 8 s with unchanged package files, so its `npm ci` layers were very likely cached. This is an inference; the build log is not in its evidence.
    - The check "build output (including npm ci) has no deprecation line" then saw no `npm ci` output.
    - Both `npm ci` runs of this audit printed no deprecation line (`12`, `14`).
  - **R-RA6 (Info, new, dependency advisory, dev only):**
    - The full `npm audit` reports 1 high, GHSA-68fv-2mgg-jv7q in `source-map-js` 1.2.1 (`vite` → `postcss`).
    - The lock marks it `"dev": true`. `npm ls --omit=dev` does not list it, and `npm audit --omit=dev` is 0, so it is not in the image.
    - The lock is byte-identical to `cc34e7f`, and REGATE3 also saw this advisory.
    - It affects the build toolchain only, which processes the project's own maps. Optional: a later dependency task can take the fixed version.
  - **R-RA7 (Info, new, drill label):** the drill's bundle check prints the decoded string length as "bytes" (`container-drill.mjs:1514`): 454,172 printed against 454,210 bytes on disk. The pass condition is unaffected.
  - Wording nit (Info, pre-existing): docs/11 section 4 step 1 says the backup "prints counts only", but it also prints the new folder name. docs/11 is unchanged.
- **Required gates unrun/blocked and why:**
  - **The container drill and the image layer scan were not rerun by this audit.** The attempt-3 brief asks to read the WP4-REGATE3 drill result, and allows Docker only if needed. I judged it not needed:
    - the image inputs are unchanged apart from three compiled import modules: the `Dockerfile`, `compose.example.yaml`, `.dockerignore`, package files, `.npmrc`, `vite.config.ts`, `tsconfig*.json` and every area-A module;
    - the build-stage commands were reproduced without Docker (`14`);
    - the REGATE3 drill reads coherently, with the same 208 checks.
    - A drill would also have loaded this workstation while WP4-RECHECK-B3 runs its timing measurements.
    - So the container path on this exact freeze rests on the REGATE3 verifier run, a reported result, together with this audit's reproduction and the attempt-1 and attempt-2 container runs on byte-identical area-A code.
  - NAS target and native arm64: NOT VERIFIED (no owner access; owner steps in docs/11), as in attempts 1 and 2.
  - `npm run test:e2e` was not rerun. It is not required for area A; REGATE3 reported 145 passed and 5 skipped on this freeze. No real SMTP (capture only).
  - The first audit's P1 and P1b (migration runner), P5 (bootstrap token), P6 (proxy and configuration) and P9 were not rerun as separate probes.
    - Their code is unchanged since `13a258d` and again since `cc34e7f` (`11`).
    - The 1755 tests and the REGATE3 drill cover them.
  - The area-B correctness of FIXB3 belongs to WP4-RECHECK-B3: the parse budget, decode-once, R-B2-1, R-B2-2 and the benign differential. This recheck covers only its effect on area A.
- **Disposition of previous findings:**
  - WP4-A-01, A-02, A-03 and A-04: still closed on `972ccda` (`11`, `13`, `14`, `15`, `26`).
  - R-A1, R-A5 and R-A7: still correct (`15`, `24`, `25`).
  - R-RA1, R-RA2, R-RA4 and R-RA5: unchanged, optional backlog. R-RA3: not re-measured; the dependencies are unchanged.
  - New Info risks: R-RA6 and R-RA7.
  - What changed since attempt 2:
    - the digest, `96445de4…` to `635f909d…`;
    - tests 1750 to 1755, all area-B workbook tests;
    - the same-second sample: 6 of 12 pairs, 3 removals.
  - The first audit's R-A2, R-A3, R-A4, R-A6, R-A8 and R-A9 stand as recorded.
- **Software readiness, owner permission and pilot result separately:**
  - Software readiness of area A: accepted at `972ccda` / `635f909d…` on a workstation. The NAS and arm64 are not verified.
  - Owner permission: none requested or given; nothing deployed and nothing sent.
  - Pilot result: none (WP5).
- **One next action/prompt:** the coordinator records WP4-RECHECK-A attempt 3 as PASS at digest `635f909d…`. Once WP4-RECHECK-B3 finishes, it moves WP4 to acceptance. R-RA1, R-RA2, R-RA5, R-RA6 and R-RA7 can go to the backlog as optional prune, runbook, drill or dependency improvements.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:**
  - WP4-RECHECK-A, attempt 3. Reviewer: timesheet-auditor subagent, board agent `a9f9312409bbc8109` (`claude-opus-5-5`).
  - Authors of the reviewed delta:
    - WP4-FIXB3 `a25ba7423ae0846ed` (timesheet-expert, `claude-opus-5-5`);
    - committer WP4-FIXB3-FREEZE `aaeffec9c7edac640`, sonnet;
    - verifier WP4-REGATE3 `aecfa5a35b65989fd`, sonnet.
  - The strongest author model of the snapshot is `claude-opus-5-5`, so the reviewer is not weaker.
  - The reviewer is not:
    - the attempt-1 auditor `a659b8cbd52722f18`;
    - the attempt-2 auditor `aabafcca9efc225db`;
    - the first area-A auditor `af8b9184c8adf6eb0`;
    - the WP4-RECHECK-B3 auditor `a0e015d15e6c5c5fb`.
- **Fresh context; confirm reviewer did not author changes:** fresh context. This reviewer authored nothing in WP4.
  - It wrote only this report, its translation, the attempt-3 results in the brief and `evidence/WP4-RECHECK-A3/`.
  - No source was edited.
  - Probes and builds ran in a scratch export outside Dropbox. No file was shared with WP4-RECHECK-B3.
- **Source digest before/after; gate evidence for that snapshot:** `635f909d…c3f7b` before and after, in the repository and on the export. It equals the WP4-REGATE3 digest of record (`handoff/delivery/evidence/WP4-REGATE3/`).
- **New report path preserving previous review history:** `handoff/delivery/WP4_RECHECK_A3.md` (new file). `WP4_RECHECK_A2`, `WP4_RECHECK_A`, `WP4_REVIEW_A` and the other reviews are unchanged.
- **Finding dispositions and next coordinator fix/recheck task:** no fix task is needed for area A. Optional backlog: R-RA1 to R-RA7. Next: WP4 acceptance once WP4-RECHECK-B3 finishes.
