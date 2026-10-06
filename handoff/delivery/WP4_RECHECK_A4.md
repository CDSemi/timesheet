# WP4 recheck — area A (operations), attempt 4: delta recheck on the round-4 fix freeze

Form: [REVIEW](../templates/REVIEW.md). Translation: [WP4_RECHECK_A4.vi.md](WP4_RECHECK_A4.vi.md). Review prompt: [WP4_REVIEW](../prompts/WP4_REVIEW.md); dispatch brief and task record: [WP4-RECHECK-A](tasks/WP4-RECHECK-A.md), section "Attempt 4". Earlier area-A reviews (kept unchanged): [WP4_REVIEW_A](WP4_REVIEW_A.md), [WP4_RECHECK_A](WP4_RECHECK_A.md) (attempt 1), [WP4_RECHECK_A2](WP4_RECHECK_A2.md) (attempt 2) and [WP4_RECHECK_A3](WP4_RECHECK_A3.md) (attempt 3). Evidence: `handoff/delivery/evidence/WP4-RECHECK-A4/` (index in `00-README.txt`; masked, LF; helper sources `*.sh.txt`, `*.mjs.txt`).

- **Package/date/reviewer and observable model/effort:** WP4, area A (operations), digest-bound delta recheck (WP4-RECHECK-A attempt 4) after WP4-FIXB4 and WP4-DEPCLEAN2. 2026-10-06, 19:37 to about 20:05 UTC. Reviewer: the WP4-RECHECK-A attempt-4 subagent (profile timesheet-auditor, board agent `aa7e8b8b5f42b5f09` as recorded by the coordinator), self-reported model `claude-opus-5-5`; requested opus/xhigh; effort and speed are not observable from inside the session.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:**
  - Commit `546cddaf6747aef85e8b6d9b7712de9e28f138bf`, the WP4-REGATE4 `freeze_commit`; its parent is `972ccda`. `origin/main` is the same commit, so no commit is unpushed.
  - Source digest `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081` over 775 files (`handoff/` excluded), equal to the gate digest of record.
  - Recorded before (19:37 UTC) and after the checks (19:52 UTC) in the repository, in the `git ls-tree` form and with `scripts/source-digest.mjs` (`00`, `99`). Rechecked after the reports, the task record and the evidence were written (`99b`). HEAD did not move, and no file outside `handoff/` changed.
  - Complete source: two `git archive` exports of the commit. Their full tree id `16e3e0fe…` equals the freeze tree, and their digest is the same before and after the checks (`00b`, `99`).
- **Decision: PASS / FIX REQUIRED / NOT VERIFIED:** **PASS.**
  - The delta since `972ccda` touches 14 paths outside `handoff/`. Each is a WP4-FIXB4 or WP4-DEPCLEAN2 path.
  - Area-A runtime is touched only by comment lines in `src/server/app.ts` (2) and `src/server/routes/imports.ts` (1). The import ceiling itself changes in the reader's `DEFAULT_READER_LIMITS` (8 to 2 MiB), which the import route takes over. Every other request limit is unchanged in the code and, in a probe on the built app, in behaviour.
  - The docs/11 change is the import ceiling only (8 to 2 MiB, EN and VI), and it matches the route.
  - The `package.json` and lock change only moves `fflate` 0.8.3 to `devDependencies`. It has no area-A runtime effect: nothing in `src/` or `scripts/` imports `fflate`, and the image installs production dependencies only. The area-A probes pass on an image-equivalent folder without `fflate`.
  - `npm ci` prints no deprecation line. `npm run verify` passes with `DATA_DIR` and `DATABASE_PATH` exported: 76 files, 1758 tests, and the same 41 smoke checks as attempt 3.
  - The WP4-REGATE4 drill result was read: 208 PASS, with check names identical to the WP4-REGATE3 drill.
  - The seven area-A probes of attempt 1 pass again, with identical check lines. Every conclusion of attempts 1 to 3 still applies.
  - No finding. Two new risks (R-RA8 Info, R-RA9 Low) concern pre-existing, unchanged code outside the delta.
- **Scope actually inspected/executed:**
  - Read:
    - AGENTS.md (from disk) and the brief (attempt-4 section and the attempt-1 to 3 results);
    - WP4_REVIEW, the REVIEW template and WP4_RECHECK_A3 (which stays unchanged);
    - the WP4-FIXB4, WP4-DEPCLEAN2, WP4-FIXB4-FREEZE and WP4-REGATE4 results, and the REGATE4 drill evidence;
    - the board entries of the round-4 tasks, for the separation of authors and auditors (`16`).
  - Code and docs read:
    - the whole non-handoff `git diff 972ccda 546cdda`;
    - the request-size limits and route wiring of `app.ts`, `routes/imports.ts` and `routes/signatures.ts`;
    - the `xlsxReader.ts` limits;
    - the docs/07 and docs/11 hunks, EN and VI (word diff);
    - the `Dockerfile` stages;
    - the target planning of `ops/restore.ts`, for R-RA9.
  - Executed:
    - on the first export: `npm ci`, `npm ls`, `npm audit --omit=dev` and the full `npm audit`, then `npm run verify` with deprecation tracing;
    - on a second export, without Docker, the `Dockerfile` stages: the build stage, then `npm ci --omit=dev --ignore-scripts` in a separate folder holding `dist/` and `package.json`, like the runtime stage;
    - on that image-equivalent folder: the attempt-1 probes P2, P8, P4, P7, P3, R-A1 and A-03, unchanged, and a new request-limit probe;
    - a lock comparison by package, and read-only source and digest checks.
  - No Docker command was run.
- **Evidence table:**

| Command | Result / exit | Evidence |
|---|---|---|
| `git ls-tree` digest and `scripts/source-digest.mjs` in the repository, before and after | HEAD `546cdda` = `origin/main`; `26fcc969…` (775 files) both times; no non-handoff change | `00`, `99` |
| `git archive 546cdda` (two exports); private git dir `add -A`, `write-tree` (outside the repository) | tree `16e3e0fe…` = freeze tree; digest `26fcc969…` before and after the checks, on both exports | `00b`, `99` |
| `git diff --name-status 972ccda 546cdda`; `--stat` | 215 paths: 201 under `handoff/` (194 added, 7 modified), 14 outside, all FIXB4 or DEPCLEAN2 paths | `10` |
| Read-only source checks (`git diff -U0`, comment-stripped `cmp`, `git rev-parse <commit>:<path>` at 4 commits, `git grep`) | app.ts and imports.ts: comment lines only (`cmp` exit 0 without comments); all limits other than the reader's unchanged; every area-A path blob-identical since `0f7fba2`; no area-A importer; docs/11 word diff `8` → `2` only | `11`, `11b` |
| `p-lock.mjs` on both locks and `package.json` | 197 = 197 entries; only `fflate` changes: it gains `dev: true` and moves from dependencies to devDependencies; no dependent; not among the 16 non-dev entries | `11c` |
| `npm ci`; `npm ls fflate` (with and without `--omit=dev`); `npm audit --omit=dev`; `npm audit` (Node 24.21.0, npm 11.18.0) | exit 0, 161 packages, no deprecation line; `fflate` dev only; production audit 0; full audit 1 high in dev-only `source-map-js` (R-RA6) | `12`, `12b` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify`, `DATA_DIR`, `DATABASE_PATH` and `SMOKE_PORT=47613` exported | exit 0: 76 files / 1758 tests, SMOKE PASSED (41, names identical to attempt 3); no deprecation line; the exported `DATA_DIR` stayed empty | `13`, `13b` |
| `npm ci`; `npm run build:server -- --sourceMap false`; `BUILD_SOURCEMAPS=off npm run build:client` (second export) | exit 0, 0, 0; `dist/` 116 files, 0 `*.map`, 0 `sourceMappingURL`; bundle `index-DH2TBHE1.js` (454,210 bytes, decoded length 454,172; "2 MiB" once, "8 MiB" never) | `14`, `14d` |
| `npm ci --omit=dev --ignore-scripts` in `<work>/prod`, plus `dist/` | exit 0, 16 packages, no `fflate` anywhere (`npm ls fflate` empty); 560 third-party maps, all pdf-lib (R-RA3) | `14b`, `14c` |
| WP4-REGATE4 `04-drill.txt` read and compared with WP4-REGATE3 | `DRILL STAGES 1-6 PASSED`, 208 PASS (33/31/57/35/27/23), 0 FAIL; check names identical; same served bundle as `14`; image 21 paths fewer, matching `fflate`'s 17 files and 4 folders | `15`, `15b` |
| Attempt-1 probes rerun unchanged on `<work>/prod`: P2, P8, P4, P7, P3, R-A1, A-03 (run 2) | all exit 0: 31, 8, 16, 23, 10, 24 and 15 PASS; check lines identical to attempt 3 | `20`-`27` |
| The same probes, run 1 (`<work>/prod` without `reference/examples`) | the development `seed` reads `reference/examples/*.json` next to `dist/`, so it failed with ENOENT; P2, P8, P4 and P7 failed as a consequence; P3, R-A1 and A-03 passed | `run1-*`, `30` |
| `p-limits.mjs` on `<work>/prod`, explicit port 47618 (run 4; run 3 on port 47617 gave the same 20 check lines) | exit 0, 20 PASS: JSON 64 KiB, signature 256 KiB, workbook 2 MiB (exactly 2 MiB → 422 `not_a_zip`; +1 and 8 MiB → 413); template 201; the backup holds the import source with the template hash | `28` |
| `p-limits.mjs`, runs 1 (fetch, port 47615) and 2 (`node:http` with keep-alive, port 47616) | transport-level failures after early 413 answers (R-RA8); every status read in runs 3 and 4 as expected. Run 4 only renames a password literal that the precommit check blocked | `run1-28`, `run2-28`, `run3-28` |
| `ps -W`, `ps -ef`, `netstat -ano` before and after | no process of this audit left, no new listening socket | `05`, `05b`, `05c`, `98` |
| `validate_package.py --preflight` (workflow Python), after the report pair and the task record were written, and again after the last edit | exit 0, PASS, 83 translation pairs, each run | `31` |
| `scripts/precommit-check.mjs` over this task's files, staged in a private git dir outside the repository, run last | run 1: BLOCK, 2 findings, the bare refused-login password literal in `p-limits.mjs.txt` (removed by limit-probe run 4); every later run: exit 0, 0 findings | `32` |

- **Findings:** none. No defect was observed in the reviewed delta.
- **Verified checks, by brief attempt-4 scope item:**
  1. The delta since `972ccda` (`10`, `11`, `11b`, `11c`):
     - `git diff --name-status 972ccda 546cdda` lists 14 paths outside `handoff/`:
       - from WP4-FIXB4: `src/server/import/xlsxReader.ts`, `src/server/app.ts`, `src/server/routes/imports.ts`, `src/client/importModel.ts`, the client `importModel` test, the e2e import spec, the two workbook integration tests, and docs/07 and docs/11, EN and VI;
       - from WP4-DEPCLEAN2: `package.json` and `package-lock.json`.
     - `templateMapping.ts`, `workbookImport.ts`, `ImportScreen.tsx`, `ImportPreview.tsx` and docs/03 did not change. Nothing changed under `.claude/`, `reference/`, the migrations, `AGENTS.md` or `CLAUDE.md`.
     - The 201 handoff paths are records and evidence.
     - **`app.ts` and `routes/imports.ts`, the only area-A runtime paths in the delta.** Every changed line is a comment ("8 MiB" → "2 MiB"): 2 lines in `app.ts`, 1 in `routes/imports.ts`. With comment lines removed, both files are identical at both commits (`cmp` exit 0).
       - The import ceiling comes from `DEFAULT_IMPORT_MAX_BYTES = DEFAULT_READER_LIMITS.maxCompressedBytes`. That line is unchanged; the reader value changed from `8 * 1024 * 1024` to `2 * 1024 * 1024` (area B).
       - The other limits are unchanged at both commits: the global JSON limit (64 KiB), the signature upload (256 KiB), the CLI configuration file (256 KiB) and the manifest caps (32 MiB in prune, 64 MiB in restore). The route wiring is unchanged too.
       - Behaviour on the built app (`28`, run 4):
         - JSON routes: exactly 64 KiB passes and 64 KiB + 1 answers 413 `payload_too_large`. Checked on `/api/auth/login`, on the import router's own JSON route `POST /api/imports/:id/commit`, and on `PUT /api/settings`.
         - Signature upload: exactly 256 KiB reaches the image check (415), and 256 KiB + 1 answers 413.
         - Workbook upload: exactly 2 MiB reaches the reader (422 `not_a_zip`, 6 ms); 2 MiB + 1 and the old 8 MiB answer 413 (2 and 4 ms).
         - The tracked template is accepted (201). `/api/health` answers 200 afterwards.
         - A backup taken afterwards holds the stored import source (kind `import`) with the template's SHA-256 and size, and its copy hashes to the template.
     - No other area-A path changed. Each of these is blob-identical at `0f7fba2`, `cc34e7f`, `972ccda` and `546cdda`:
       - `src/server/ops`, `db` (with the migrations), `jobs`, `mail` and `files`;
       - `cli.ts`, `index.ts` and `config.ts`;
       - `services/bootstrap.ts`, `automation.ts` and `operationsStatus.ts`;
       - `routes/signatures.ts`, `admin.ts` and `auth.ts`;
       - the `Dockerfile`, `compose.example.yaml`, `.dockerignore`, `.env.example` and `.npmrc`;
       - `scripts/`, `vite.config.ts` and `tsconfig*.json`;
       - docs/03 and docs/10, EN and VI.
     - No area-A module imports or names `xlsxReader`, `routes/imports`, `importModel`, `workbookImport` or `templateMapping` (`git grep` exit 1). `importMaxBytes` is set only through `AppOptions`; no environment variable or configuration file sets it.
     - **docs/11 (EN and VI)** changes line 221 only. The word diff is the single number `8` → `2` in the import step ("at most 2 MiB" / "tối đa 2 MiB"), which matches the route. No other docs/11 statement names an upload size or 413.
     - **docs/07** changes line 46 only, EN and VI: the workbook-import paragraph (the route ceiling, the reader limits, the derived bound). This is area-B text. Its operations-relevant sentence, "at most 2 MiB … 413 `payload_too_large` above it", matches the route.
     - **`package.json` and the lock (WP4-DEPCLEAN2).** The `p-lock` comparison finds 197 entries at both commits, with exactly these differences:
       - `node_modules/fflate` gains `"dev": true`;
       - `fflate` 0.8.3 moves from dependencies to devDependencies, in the lock root and in `package.json`.
       - No other field of `package.json` changed. No lock entry depends on `fflate`, and it is not among the 16 non-dev entries.
     - **The DEPCLEAN2 change has no area-A runtime effect:**
       - no file in `src/` or `scripts/` imports `fflate`; one comment in `xlsxReader.ts` names it, and only `tests/support/syntheticWorkbook.ts` and the reader test import it;
       - the compiled reader imports only `node:zlib`;
       - the runtime stage installs `npm ci --omit=dev --ignore-scripts`;
       - my image-equivalent folder has no `fflate`, and all seven area-A probes and the limit probe pass on it;
       - the REGATE4 image lists 21 paths fewer than the REGATE3 image, matching `fflate`'s 17 files and 4 folders.
  2. `npm ci`, `npm run verify` and the drill (`12`, `12b`, `13`, `13b`, `14`, `15`):
     - `npm ci`: exit 0, 161 packages, no deprecation line. `npm ls fflate --omit=dev` is empty. `npm audit --omit=dev`: 0 vulnerabilities.
     - `npm run verify` with `DATA_DIR`, `DATABASE_PATH` and `SMOKE_PORT` exported and `--trace-deprecation --pending-deprecation`: exit 0.
       - 76 files / 1758 tests, against 1755 in attempt 3. The 3 extra tests come from FIXB4's test changes (net `it(` lines: +7 −4 in the reader test, +1 −1 in the client test).
       - SMOKE PASSED, with the same 41 check names as attempt 3.
       - No deprecation line; the only "deprecat" match is the echoed `NODE_OPTIONS`.
       - The exported `DATA_DIR` held 0 entries before and after. A-04 still holds.
     - The WP4-REGATE4 drill result was read: `DRILL STAGES 1-6 PASSED`, 208 PASS (33/31/57/35/27/23), 0 FAIL. Its 208 check names are identical to the REGATE3 drill.
       - Stage 1: a forbidden-file scan that includes source maps under `/app/dist`, a bundle with no `sourceMappingURL`, `/assets/<bundle>.map` answering 404, user 10001, and production dependencies only.
       - Stage 2: backup under writes, holding both import sources with their hashes.
       - Stage 3: restore paused with reason `restored`, then release by id and `--all` (R-A5).
       - Stages 4 and 5: upgrade from the WP3 schema, and rollback. Stage 6: import and opening balance.
       - The REGATE4 image build took 14 s against 8 s in REGATE3. The package files changed, so the `npm ci` layers were very likely rebuilt; this is an inference (R-RA5).
     - I did not rerun the container drill. In its place, I ran the `Dockerfile` stages without Docker:
       - `dist/` has 116 files, 0 `*.map` and 0 `sourceMappingURL`;
       - the bundle `index-DH2TBHE1.js` has the same content-hashed name the REGATE4 container served, and its decoded length (454,172) is what the drill printed;
       - the production folder installs without `fflate`.
  3. The conclusions of attempts 1 to 3 still apply (`20`-`27`):
     - The seven attempt-1 probes ran unchanged on the image-equivalent folder (production `node_modules`, no `fflate`), with check lines identical to attempt 3:
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
     - Every area-A module they rest on is byte-identical between `0f7fba2`, `cc34e7f`, `972ccda` and `546cdda`; `app.ts` differs only in comments.
- **Risks and optional improvements, separate from proven defects:**
  - **R-RA1 (Info), the same-second tie: unchanged and still acceptable.** In this run, 7 of 12 back-to-back CLI pairs shared a UTC second, and in 3 of them `--prune` removed the backup it had just printed. One complete backup of that second always remained (`25`).
  - **R-RA2 (Low), the paired pre-upgrade backup: unchanged.** A later `--prune` in the same UTC day removes it; on the next UTC day it is kept (`25`).
  - **R-RA3 (Info), third-party maps: re-measured.** The production `node_modules` has 560 maps, all pdf-lib, the same as attempt 2. `fflate` shipped none. They are never served.
  - **R-RA4 (Info), a far-future backup blocks pruning: unchanged** (the code is unchanged).
  - **R-RA5 (Info), drill tooling: still applies.** The check can still pass vacuously on a fully cached build. In REGATE4 the package files changed, so it most likely saw real `npm ci` output. Both `npm ci` runs of this audit printed no deprecation line.
  - **R-RA6 (Info), dependency advisory: unchanged.** GHSA-68fv-2mgg-jv7q in the dev-only `source-map-js` 1.2.1; not in the image.
  - **R-RA7 (Info), drill label: unchanged.** The drill prints the decoded length 454,172 as "bytes"; the file has 454,210 bytes.
  - **R-RA8 (Info, new, HTTP transport, outside area A, pre-existing): early 413 answers and connection reuse.** The raw upload routes answer 413 from `Content-Length` before the body has arrived.
    - With `fetch` (run 1), the 2 MiB + 1 upload failed with "other side closed", and no status was read.
    - With the default keep-alive `node:http` agent (run 2), the upload right after a 413 got `ECONNRESET` without a response, most likely on the reused connection. That happened after the signature route's 413, and again after the workbook route's 413.
    - With one connection per upload (runs 3 and 4), every status was as expected.
    - The signature route has had the same behaviour since before WP4, and the client checks both sizes before uploading. So this is not a delta effect, and it was not seen in a browser.
    - Optional: answer early 413s with `Connection: close`, or drain the body. This could go to WP4-RECHECK-B4 or the backlog.
  - **R-RA9 (Low, new, pre-existing in `ops/restore.ts`, not a delta effect): a dangling junction into DATA_DIR.**
    - Run 1 of P4 pointed `restore --to` at a junction whose target, `DATA_DIR/tmp`, did not exist yet. The restore answered `write_failed` (exit 1) instead of the refusal `target_inside_data_dir` (exit 2), and it wrote nothing in the live instance (`run1-22`, `05c`).
    - The cause is `canonical()`: it cannot resolve the missing link target, so it plans the link path itself, which lies outside DATA_DIR.
    - If the link target appeared between planning and writing, the restore could write into it. That race is theoretical and was not reproduced.
    - Optional: refuse a target that is an existing link that cannot be resolved (`lstat`) as `target_unusable`.
  - Wording nit (Info, pre-existing): docs/11 section 4 step 1 says the backup "prints counts only", but it also prints the new folder name.
- **Required gates unrun/blocked and why:**
  - **The container drill and the image layer scan were not rerun by this audit.** The attempt-4 brief asks me to read the WP4-REGATE4 drill result, and Docker is to be used only if a finding needs it. None did:
    - the image inputs that changed are three compiled modules (comments only in two of them) and the package files (`fflate` dropped from production);
    - I reproduced the build, prod-deps and runtime stages without Docker (`14`, `14b`), and ran the area-A probes on that result;
    - the REGATE4 drill reads coherently, with the same 208 checks.
    - So the container path on this exact freeze rests on the REGATE4 verifier run, a reported result, together with this audit's reproduction and the attempt-1 and attempt-2 container runs on area-A code that is byte-identical apart from comments.
  - NAS target and native arm64: NOT VERIFIED (no owner access; owner steps in docs/11), as in attempts 1 to 3.
  - `npm run test:e2e` was not rerun. It is not required for area A; REGATE4 reported 145 passed and 5 skipped on this freeze. No real SMTP (capture only).
  - The first audit's P1 and P1b (migration runner), P5 (bootstrap token), P6 (proxy and configuration) and P9 were not rerun as separate probes. Their code is unchanged since `13a258d`, and the 1758 tests and the REGATE4 drill cover them.
  - The area-B correctness of WP4-FIXB4 belongs to WP4-RECHECK-B4: the derived bound, the inflate change and the ceilings' justification. This recheck covers only its effect on area A.
- **Disposition of previous findings:**
  - WP4-A-01, A-02, A-03 and A-04: still closed on `546cdda` (`11`, `13`, `14`, `15`, `26`).
  - R-A1, R-A5 and R-A7: still correct (`15`, `24`, `25`).
  - R-RA1, R-RA2, R-RA4, R-RA5, R-RA6 and R-RA7: unchanged, optional backlog. R-RA3: re-measured, unchanged (560).
  - New risks: R-RA8 (Info) and R-RA9 (Low).
  - What changed since attempt 3:
    - the digest, `635f909d…` to `26fcc969…`;
    - tests 1755 to 1758 (FIXB4 limit pins);
    - the import ceiling, 8 to 2 MiB, in the route, the client and docs/07 and docs/11;
    - `fflate`, now dev only and absent from the image;
    - the client bundle, `index-ZGs6tcbH.js` to `index-DH2TBHE1.js`;
    - the same-second sample: 7 of 12 pairs, 3 removals.
  - The first audit's R-A2, R-A3, R-A4, R-A6, R-A8 and R-A9 stand as recorded.
- **Software readiness, owner permission and pilot result separately:**
  - Software readiness of area A: accepted at `546cdda` / `26fcc969…` on a workstation. The NAS and arm64 are not verified.
  - Owner permission: none requested or given; nothing deployed and nothing sent.
  - Pilot result: none (WP5).
- **One next action/prompt:** the coordinator records WP4-RECHECK-A attempt 4 as PASS at digest `26fcc969…`. Once WP4-RECHECK-B4 finishes, it moves WP4 to acceptance. R-RA1, R-RA2 and R-RA5 to R-RA9 can go to the backlog as optional improvements.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:**
  - WP4-RECHECK-A, attempt 4. Reviewer: timesheet-auditor subagent, board agent `aa7e8b8b5f42b5f09` (`claude-opus-5-5`).
  - Authors of the reviewed delta (`16`):
    - WP4-FIXB4 `a25ba7423ae0846ed` (timesheet-expert, `claude-opus-5-5`);
    - WP4-DEPCLEAN2 `a6a48b0c9d59f3cb2` (sonnet);
    - committer WP4-FIXB4-FREEZE `a6dda119886e663af` (sonnet);
    - verifier WP4-REGATE4 `a2309045d22c66236` (sonnet).
  - The strongest author model of the snapshot is `claude-opus-5-5`, so the reviewer is not weaker.
  - The reviewer is not:
    - the attempt-1 auditor `a659b8cbd52722f18`;
    - the attempt-2 auditor `aabafcca9efc225db`;
    - the attempt-3 auditor `a9f9312409bbc8109`;
    - the first area-A auditor `af8b9184c8adf6eb0`;
    - the WP4-RECHECK-B4 auditor `aea194a66a8cd3b00`.
- **Fresh context; confirm reviewer did not author changes:** fresh context. This reviewer authored nothing in WP4.
  - It wrote only this report, its translation, the attempt-4 results in the brief and `evidence/WP4-RECHECK-A4/`.
  - No source was edited.
  - Probes and builds ran in a scratch folder outside Dropbox. No file was shared with WP4-RECHECK-B4, whose timing run was active at the same time.
- **Source digest before/after; gate evidence for that snapshot:** `26fcc969…d9081` before and after, in the repository and on both exports. It equals the WP4-REGATE4 digest of record (`handoff/delivery/evidence/WP4-REGATE4/`).
- **New report path preserving previous review history:** `handoff/delivery/WP4_RECHECK_A4.md` (new file). `WP4_RECHECK_A3`, `WP4_RECHECK_A2`, `WP4_RECHECK_A`, `WP4_REVIEW_A` and the other reviews are unchanged.
- **Finding dispositions and next coordinator fix/recheck task:** no fix task is needed for area A. Optional backlog: R-RA1 to R-RA9. Next: WP4 acceptance once WP4-RECHECK-B4 finishes.
