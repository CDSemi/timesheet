# WP4 recheck — area A (operations), attempt 2: delta recheck on the round-2 fix freeze

Form: [REVIEW](../templates/REVIEW.md). Translation: [WP4_RECHECK_A2.vi.md](WP4_RECHECK_A2.vi.md). Review prompt: [WP4_REVIEW](../prompts/WP4_REVIEW.md); dispatch brief and task record: [WP4-RECHECK-A](tasks/WP4-RECHECK-A.md), section "Attempt 2". Earlier area-A reviews (kept unchanged): [WP4_REVIEW_A](WP4_REVIEW_A.md) and [WP4_RECHECK_A](WP4_RECHECK_A.md) (attempt 1). Evidence: `handoff/delivery/evidence/WP4-RECHECK-A2/` (index in `00-README.txt`; masked, LF; helper and probe sources `*.sh.txt`, `*.mjs.txt`).

- **Package/date/reviewer and observable model/effort:** WP4, area A (operations), digest-bound delta recheck (WP4-RECHECK-A attempt 2) after WP4-FIXB2 and WP4-DEPCLEAN. 2026-10-06, 14:54 to about 15:20 UTC. Reviewer: the WP4-RECHECK-A attempt-2 subagent (profile timesheet-auditor, board agent `aabafcca9efc225db` as recorded by the coordinator), self-reported model `claude-opus-5-5`; requested opus/xhigh; effort and speed are not observable from inside the session.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:**
  - Commit `cc34e7ff11e6c27f23fd2bf1b86f77159f95eb8d`, the WP4-REGATE2 `freeze_commit`. `origin/main` is the same commit, so no commit is unpushed.
  - Source digest `96445de4ad266f0fa70f78c0c72b03625775d170e8841c757c39b2b5cae7d503` over 775 files (`handoff/` excluded), equal to the gate digest of record.
  - Recorded before (14:54 UTC) and after (15:08 UTC) in the repository, with the `git ls-tree` form and `scripts/source-digest.mjs` (`00`, `99`). Rechecked after the reports, the task record and the evidence were written (`99b`). HEAD did not move, and no file outside `handoff/` changed.
  - Complete source: a `git archive` export of the commit. Its full tree id `940def94…` equals the freeze tree, and its digest is equal before and after every check (`00b`, `99`).
- **Decision: PASS / FIX REQUIRED / NOT VERIFIED:** **PASS.**
  - The delta since `0f7fba2` touches 9 paths outside `handoff/`, each owned by WP4-FIXB2 or WP4-DEPCLEAN. None is an area-A runtime path, and no area-A module imports any of them.
  - The lock change removes only `fast-xml-parser` and its 7 transitive packages. It adds and changes nothing.
  - Area A still holds on the new freeze. `npm ci` prints no deprecation line, `npm run verify` passes with `DATA_DIR` exported, and the full drill passes with 208 checks. Both the cached and the no-cache image ship no map under `/app/dist`, and the seven area-A probes of attempt 1 pass with the same check sets.
  - Every attempt-1 conclusion still applies. Only counts changed (packages, tests, third-party maps); they are listed under "Disposition of previous findings".
  - No finding. The four earlier risks stand, R-RA3 with a smaller count. One new Info risk (R-RA5) concerns the drill tool, not the product.
- **Scope actually inspected/executed:**
  - Read: AGENTS.md (from disk), the brief (attempt-2 section), WP4_REVIEW, the REVIEW template, WP4_RECHECK_A and its task results, the results of WP4-FIXB2, WP4-DEPCLEAN and WP4-REGATE2, and the board entries of these tasks for author and auditor separation.
  - Code and docs read: the whole `git diff 0f7fba2 cc34e7f` outside `handoff/`, including `workbookImport.ts` (the preview path and the unchanged `importedPeriodError` and `isImportedTimesheet` exports), the `xlsxReader.ts` header and limits, and the docs/07 hunk (EN and VI). Also `scripts/container-drill.mjs` (build and map checks), `Dockerfile`, `vite.config.ts` and `compose.example.yaml`.
  - Executed on the export: the lock comparison probe; `npm ci` and `npm audit --omit=dev`; `npm run verify` with `DATA_DIR` and `DATABASE_PATH` exported; the WP3 build and the full container drill with `--wp3`; a no-cache image build under the Compose project `ts-wp4-rca2`; a layer scan of both images without starting a container; the attempt-1 probes P2, P8, P4, P7, P3, R-A1 and A-03, unchanged; read-only source checks.
- **Evidence table:**

| Command | Result / exit | Evidence |
|---|---|---|
| `git ls-tree` digest and `scripts/source-digest.mjs` in the repository, before and after | HEAD `cc34e7f`; `96445de4…` (775 files) both times; no non-handoff change | `00`, `99` |
| `git archive cc34e7f`; private git dir `add -A`, `write-tree` (outside the repository) | tree `940def94…` = freeze tree; digest `96445de4…` before and after all checks | `00b`, `99` |
| `git diff --name-status 0f7fba2 cc34e7f` | 127 paths: 118 under `handoff/delivery/`, 9 outside, all FIXB2 or DEPCLEAN owned paths; no governance or area-A path | `10` |
| `node p-lock.mjs` over both versions of `package.json` and `package-lock.json` | exit 0, `LOCK CHECK PASSED`: 8 entries removed, 0 added, 0 changed; all 8 in the `fast-xml-parser` closure, none needed outside it | `11` |
| `npm ci`; `npm audit --omit=dev` (Node 24.21.0, npm 11.18.0) | exit 0, 161 packages, no deprecation line, the 8 packages absent from `node_modules`; audit 0 vulnerabilities | `12` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify`, `DATA_DIR` and `DATABASE_PATH` exported | exit 0: typecheck, lint, 76 files / 1750 tests, build, SMOKE PASSED (41 checks, the same as attempt 1); no deprecation line; the exported `DATA_DIR` stayed empty | `13` |
| WP3 build (`git archive 49651c8`, `npm ci`, `build:server`) | exit 0 | `14` |
| `node scripts/container-drill.mjs --work <work>\drill --project ts-wp4-rca2 --wp3 <work>\wp3` | exit 0, `DRILL STAGES 1-6 PASSED`, 33/31/57/35/27/23 PASS (208), 0 FAIL | `15` |
| Layer scan of the drill image (`docker image save`, `tar`) | `/app/dist`: 116 files, 0 `*.map`, 0 `sourceMappingURL`; 560 third-party maps (pdf-lib only); no removed package | `16` |
| `docker compose --project-name ts-wp4-rca2 --file compose.example.yaml build --no-cache` | exit 0; every source step rebuilt; `tsc --sourceMap false`; vite prints no map; 0 deprecation lines | `17` |
| Layer scan of the no-cache image | the same counts; `/app/dist` byte-identical to the drill image | `18` |
| Docker leftovers by project and name; `docker image rm` of both audit images | nothing left | `19` |
| Attempt-1 probes rerun unchanged: P2, P8, P4, P7, P3, R-A1, A-03 | all exit 0: 31, 8, 16, 23, 10, 24 and 15 PASS; the check lines equal attempt 1's | `20`-`26` |
| Read-only source checks | see the file | `27` |
| `validate_package.py --preflight` (workflow Python), after the report pair was written | exit 0, PASS, 78 translation pairs | `28` |
| `scripts/precommit-check.mjs` over this task's files, staged in a private git dir outside the repository, run last | exit 0, 0 findings | `29` |

- **Findings:** none. No defect was observed in the reviewed snapshot.
- **Verified checks, by brief attempt-2 scope item:**
  1. The delta:
     - `git diff --name-status 0f7fba2 cc34e7f` lists 9 paths outside `handoff/` (`10`).
       - FIXB2: `xlsxReader.ts`, `templateMapping.ts`, `workbookImport.ts`, the two workbook test files and docs/07 EN and VI.
       - DEPCLEAN: `package.json` and `package-lock.json`.
       - Every one is an owned path of those tasks on the board. Nothing changed under `.claude/`, `reference/`, the migrations, `AGENTS.md` or `CLAUDE.md`.
     - None of the 9 paths is an area-A runtime path (`27`).
       - No path changed under `ops/`, `db/` or `jobs/`, nor in `cli.ts`, `app.ts`, `index.ts`, `config.ts`, `bootstrap.ts`, `automation.ts` or the routes.
       - The Dockerfile, the Compose example, `.dockerignore`, `.env.example`, `scripts/`, docs/03, docs/10 and docs/11 are unchanged too.
       - No area-A module imports a changed module.
       - `timesheetCommands`, `otLeave` and `finalization` import only `importedPeriodError` and `isImportedTimesheet` from `workbookImport.ts`, and the diff does not touch either.
       - The docs/07 change is the single workbook-import paragraph (line 46, EN and VI). Its numbers equal the code: 100,000/200,000 openings, 64/200,000/500,000 attributes, 64 KiB start tag, depth 40, sheet name 100, 2,000 holiday rows, 200 characters, 2 MiB report.
     - The lock change removes only `fast-xml-parser` and its own transitive packages (`11`).
       - `package.json` loses one line and is otherwise identical.
       - The lock loses 8 entries: `fast-xml-parser` 5.11.2, `fast-xml-builder` 1.3.1, `strnum` 2.4.2, `@nodable/entities` 3.1.0, `anynum` 1.0.1, `is-unsafe` 2.0.2, `path-expression-matcher` 1.6.2 and `xml-naming` 0.3.0.
       - It adds and changes nothing, and the root entry differs only by that dependency.
       - Every removed entry is in the closure of `fast-xml-parser` in the old lock, and no package outside that closure needs any of them.
       - No source, test, script or doc outside `handoff/` still names the removed packages (`27`).
  2. Area-A behaviour on the new freeze:
     - `npm ci`: exit 0, 161 packages (169 before), no deprecation line. The removed packages are absent from `node_modules`, and `npm audit --omit=dev` finds 0 vulnerabilities (`12`).
     - `npm run verify` with `DATA_DIR` and `DATABASE_PATH` exported: exit 0, 76 files / 1750 tests, and the same 41 smoke checks as attempt 1. No deprecation line; the exported folder stays empty, so A-04 still holds (`13`).
     - WP4-REGATE2 drill result read: 208 PASS (33/31/57/35/27/23). I reran the drill rather than rely on it, because the delta changes the image's dependencies and the import code that stage 6 runs inside the container. Result: exit 0, 208 PASS with the same stage counts (`15`).
       - Stage 1: numeric non-root user, forbidden-file scan including `*.map` under `/app/dist`, a bundle with no `sourceMappingURL`, and `/assets/<bundle>.map` answering 404.
       - Stage 2: backup under writes, including the import sources.
       - Stage 3: isolated restore, outbound pause and release.
       - Stages 4 and 5: upgrade from the WP3 schema, and rollback.
       - Stage 6: import and opening balance.
     - The image ships no maps (`16`-`18`).
       - The drill image, which BuildKit served from its cache, and my no-cache build are byte-identical under `/app/dist`: 116 files, 0 `*.map`, 0 `sourceMappingURL`.
       - The no-cache build ran `npm ci`, `tsc --sourceMap false` and vite with no map, and printed no deprecation line.
     - The attempt-1 probes, rerun unchanged, all pass with check lines identical to attempt 1 (`20`-`26`):
       - backup under three writers and isolated restore with hashes and balances (P2, 31);
       - admin allowlists (P8, 8);
       - backup and restore target boundaries (P4, 16);
       - retention window and the paused sweep (P7, 23);
       - prune junction escapes (P3, 10);
       - the R-A1 refusal and normal pruning (24);
       - bootstrap refusals that print no marker (A-03, 15).
  3. The attempt-1 conclusions still apply:
     - WP4-A-01 to A-04: closed.
     - R-A1, R-A5 and R-A7: correct.
     - Backup and restore, pause and reconciliation, upgrade and rollback, retention and the admin allowlists hold.
     - The docs sync holds.
     - The same-second tie is still acceptable (Info).
     - The area-A code they rest on is byte-identical between `0f7fba2` and `cc34e7f`.
     - What changed is listed under "Disposition of previous findings" below.
- **Risks and optional improvements, separate from proven defects:**
  - **R-RA1 (Info), the same-second tie: unchanged and still acceptable.** `ops/prune.ts` is unchanged. In this run, 8 of 12 back-to-back CLI pairs shared a UTC second, and in 5 of them `--prune` removed the backup it had just printed (attempt 1: 7 and 3). One complete backup of that second always remained (`25`). Optional: keep `requiredName` on a tie.
  - **R-RA2 (Low), the paired pre-upgrade backup: unchanged.** A later `--prune` in the same UTC day removes it; on the next UTC day it is kept (`25`). Optional runbook line, as in attempt 1.
  - **R-RA3 (Info), third-party source maps in the image: now 560, all pdf-lib** (566 before; the 6 maps of `fast-xml-parser`, `fast-xml-builder` and `path-expression-matcher` left with the dependency). They are never served, and `/assets/*.map` answers 404 (`16`, `18`).
  - **R-RA4 (Info), a far-future backup blocks pruning: unchanged** (the code is unchanged; the refusal is shown again in `25`).
  - **R-RA5 (Info, new, drill tooling, pre-existing): one drill check can pass vacuously.**
    - Stage 1's check "build output (including npm ci) has no deprecation line" reads only the `docker build` log (`container-drill.mjs:1442-1443`).
    - When BuildKit serves every step from its cache, as in this run (11 `CACHED`, no `npm ci`, `tsc` or vite output in the log), the check has nothing to inspect and passes.
    - The product is not affected: `npm ci` on the export and my no-cache build both printed no deprecation line (`12`, `17`).
    - Optional: the drill could build with `--no-cache`, or report in the check detail when every step was cached.
  - Wording nit (Info, pre-existing): docs/11 section 4 step 1 says the backup "prints counts only", but it also prints the new folder name. docs/11 is unchanged.
- **Required gates unrun/blocked and why:**
  - NAS target and native arm64: NOT VERIFIED (no owner access; owner steps in docs/11). They are outside this workstation recheck, as in attempt 1.
  - `npm run test:e2e` was not rerun. It is not required for area A, and WP4-REGATE2 reported 145 passed and 5 skipped on this freeze. No real SMTP (capture only).
  - The first audit's P1 and P1b (migration runner), P5 (bootstrap token), P6 (proxy and configuration) and P9 were not rerun as separate probes.
    - Their code is unchanged since `13a258d` (attempt-1 evidence `15`) and again since `0f7fba2` (`10`, `27`).
    - Drill stages 1, 3, 4 and 5 and the 1750 tests cover them on this freeze.
  - The area-B correctness of the new scanner (the resource bound, the report cap and the benign-workbook differential) belongs to WP4-RECHECK-B2. This recheck covers only its effect on area A.
- **Disposition of previous findings:**
  - WP4-A-01, A-02, A-03 and A-04: still closed on `cc34e7f` (`13`, `15`-`18`, `26`).
  - R-A1, R-A5 and R-A7: still correct (`15`, `24`, `25`).
  - R-RA1, R-RA2 and R-RA4: unchanged, optional backlog. R-RA3 is updated to 560 maps.
  - What changed since attempt 1:
    - the digest, `dfe4541d…` to `96445de4…`;
    - packages 169 to 161;
    - tests 1734 to 1750, all in the area-B workbook suites;
    - third-party maps 566 to 560.
  - The first audit's R-A2, R-A3, R-A4, R-A6, R-A8 and R-A9 stand as recorded.
- **Software readiness, owner permission and pilot result separately:**
  - Software readiness of area A: accepted at `cc34e7f` / `96445de4…` on a workstation (Docker Desktop, linux/amd64). The NAS and arm64 are not verified.
  - Owner permission: none requested or given; nothing deployed and nothing sent.
  - Pilot result: none (WP5).
- **One next action/prompt:** the coordinator records WP4-RECHECK-A attempt 2 as PASS at digest `96445de4…`. Once WP4-RECHECK-B2 finishes, it moves WP4 to acceptance. R-RA1, R-RA2 and R-RA5 can go to the backlog as optional runbook, prune or drill improvements.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:**
  - WP4-RECHECK-A, attempt 2. Reviewer: timesheet-auditor subagent, board agent `aabafcca9efc225db` (`claude-opus-5-5`).
  - Authors of the reviewed delta:
    - WP4-FIXB2 `a25ba7423ae0846ed` (timesheet-expert, `claude-opus-5-5`);
    - WP4-DEPCLEAN `af38846cc479cc2e3` (`claude-sonnet-5-5`);
    - committer WP4-FIXB2-FREEZE `a6aac816cd417734e` and verifier WP4-REGATE2 `acddc52ef017c9200`, both sonnet.
  - The strongest author model of the snapshot is `claude-opus-5-5` (WP4-FIXB2 and earlier WP4 tasks), so the reviewer is not weaker.
  - The reviewer is not:
    - the attempt-1 auditor `a659b8cbd52722f18`;
    - the first area-A auditor `af8b9184c8adf6eb0`;
    - the WP4-RECHECK-B2 auditor `af0ca5d5f3ab94048`.
- **Fresh context; confirm reviewer did not author changes:** fresh context. This reviewer authored nothing in WP4.
  - It wrote only this report, its translation, the attempt-2 results in the brief and `evidence/WP4-RECHECK-A2/`.
  - No source was edited.
  - The probes ran in a scratch export outside Dropbox. No file was shared with WP4-RECHECK-B2.
- **Source digest before/after; gate evidence for that snapshot:** `96445de4…cae7d503` before and after (repository and export), equal to the WP4-REGATE2 digest of record (`handoff/delivery/evidence/WP4-REGATE2/`).
- **New report path preserving previous review history:** `handoff/delivery/WP4_RECHECK_A2.md` (new file). `WP4_RECHECK_A`, `WP4_REVIEW_A` and the other reviews are unchanged.
- **Finding dispositions and next coordinator fix/recheck task:** no fix task is needed for area A. Optional backlog: R-RA1 to R-RA5. Next: WP4 acceptance once WP4-RECHECK-B2 finishes.
