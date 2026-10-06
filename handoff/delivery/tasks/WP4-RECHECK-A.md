# WP4-RECHECK-A dispatch brief

- Mission/task: timesheet-software-readiness / WP4-RECHECK-A; package WP4; kind audit;
  attempt 1; depends on WP4-REGATE (PASS).
- Scope: a fresh, independent recheck of WP4 area A (operations) after the fix round. It
  verifies WP4-A-01 to A-04 and the R-A1, R-A5 and R-A7 changes, and re-confirms that
  area A holds on the new freeze.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk H, novelty no.
- Fresh context: you did not author WP4 and did not run the first area-A audit.
  - Write the task record in English.
  - `WP4_RECHECK_A.md` and its `.vi.md` are bilingual and follow the REVIEW form.
  - Earlier reviews stay unchanged.
- Target: `reviewed_commit` = the WP4-REGATE `freeze_commit`. The coordinator gives the
  SHA and the gate digest in the dispatch prompt. Record HEAD and the digest before and
  after; the digest must equal the gate digest.
- WP4-RECHECK-B may run at the same time in its own folder; do not share files.

## Runtime

- Use your own scratch clone or export under `D:\.claude-tmp\timesheet\WP4-RECHECK-A`,
  and use it for TEMP/TMP.
- For every CLI or server run, set `DATA_DIR` and `DATABASE_PATH` explicitly there.
- Use Git Bash only. Never use `cmd.exe` in any form, PowerShell without `-Command`, or
  any interactive shell.
- Never feed scripts to python or node through stdin; write probe files.
- Use Node 24 by full path. Keep shell calls in the foreground.
- Docker, if used: Compose project `ts-wp4-rca` only, removed by name; never push, log
  in or prune.
- Do not edit source. Use capture mode only.
- Never kill processes by PID. Never write into the repository root. Never redirect to
  /dev/null or nul.
- If a permission check denies a call, stop and report.

## Read first

- AGENTS.md, from disk.
- [WP4_REVIEW](../../prompts/WP4_REVIEW.md).
- [WP4_REVIEW_A](../WP4_REVIEW_A.md), the first audit.
- The results of [WP4-FIXA](WP4-FIXA.md), [WP4-FIXB](WP4-FIXB.md) and
  [WP4-REGATE](WP4-REGATE.md).
- docs/07, docs/10 and docs/11, with their `.vi.md` pairs.

## Scope

1. **Each finding is closed.** Check each with your own reproduction:
   - A-01: build or inspect the image. There is no `.map` and no `sourceMappingURL`, and
     `/assets/*.map` answers 404.
   - A-02: the `.env.example` wording.
   - A-03: the runbook statements are true.
   - A-04: verify passes with `DATA_DIR` exported.
2. **The improvements are correct and safe.**
   - R-A1: prune refuses future-dated candidates and still prunes normally.
   - R-A5: the drill's bulk release really releases.
   - R-A7: the wording.
3. **Regression.** Check that the fixes changed nothing else in area A:
   - backup and restore;
   - pause and reconciliation;
   - upgrade and rollback;
   - retention;
   - the admin allowlists.

   Rerun at least `npm ci` and `npm run verify` on your export, plus the backup and
   restore probe from the first audit.
4. **The FIXB docs sync in docs/07 and docs/10** matches the code.
5. **WP4-REGATE observation.** When two backups fall in the same UTC second, prune
   breaks the tie by name and can keep the older folder. Judge whether this is a
   defect or acceptable. The scheduled backup is nightly, and `--prune` runs only
   after the new backup has been verified.

## Output

- `handoff/delivery/WP4_RECHECK_A.md` and `.vi.md`.
- Results appended to this file.
- Masked LF evidence in `handoff/delivery/evidence/WP4-RECHECK-A/`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings separate.
- Leave nothing running.

Return at most 160 words, beginning with your self-reported model.

## Attempt 2 (coordinator note): area-A delta recheck on the round-2 freeze

After attempt 1 passed on 0f7fba2, the source changed again:
- WP4-FIXB2, in area B, added a bounded streaming XML scanner and a capped report;
- WP4-DEPCLEAN removed `fast-xml-parser` from `package.json` and the lock.

The board rules require every WP4 PASS audit to match the current source digest, so
area A needs a digest-bound delta recheck. A fresh auditor runs it: not the attempt-1
auditor, not a WP4 author, and not the WP4-RECHECK-B2 auditor.

Target: `reviewed_commit` is the WP4-REGATE2 `freeze_commit`. The coordinator gives the
SHA and the digest. Record HEAD and the digest before and after.

Scope for attempt 2:
1. **The delta.**
   - Run `git diff --name-status 0f7fba2 <freeze>`. Outside handoff/, it may list only
     the WP4-FIXB2 and WP4-DEPCLEAN paths.
   - Confirm that none of those paths is an area-A runtime path.
   - Confirm that the lock change removes only `fast-xml-parser` and its own transitive
     packages.
2. **Area-A behaviour still holds on the new freeze.**
   - Rerun `npm ci` (no deprecation line) and `npm run verify` on your export.
   - Read the WP4-REGATE2 drill result, and rerun the drill if anything is in doubt.
   - Check that the image build still ships no maps.
3. **The attempt-1 conclusions.** Confirm that they still apply, or say what changed.

Runtime: as above, with these settings:
- folder `D:\.claude-tmp\timesheet\WP4-RECHECK-A2`;
- Compose project `ts-wp4-rca2`;
- report `handoff/delivery/WP4_RECHECK_A2.md` and `.vi.md`, with evidence in
  `handoff/delivery/evidence/WP4-RECHECK-A2/`.

Keep `WP4_RECHECK_A.md` unchanged. Append the attempt-2 results after the attempt-1
results below.

## Attempt 3 (coordinator note): area-A delta recheck on the round-3 freeze

Attempt 2 passed on cc34e7f. After that, WP4-FIXB3 changed the source in area B only:
- `xlsxReader.ts`, `templateMapping.ts` and `workbookImport.ts`;
- their tests;
- docs/07.

Attempt 3 is a digest-bound delta recheck by another fresh auditor. That auditor must be
none of these:
- a659b8cbd52722f18 or aabafcca9efc225db;
- a WP4 author;
- the WP4-RECHECK-B3 auditor.

Target: `reviewed_commit` = the WP4-REGATE3 `freeze_commit`. The coordinator gives the
SHA and the digest.

Scope:
1. Delta: run `git diff --name-status cc34e7f <freeze>`. Outside handoff/, it may show
   only WP4-FIXB3 paths, none of them area-A runtime.
   - `package.json` and the lock are unchanged.
   - The docs/07 change touches only the workbook budget sentence.
2. Rerun `npm ci` and `npm run verify` on your export.
3. Read the WP4-REGATE3 drill result.
4. Confirm that the attempt-1 and attempt-2 conclusions still apply.

Runtime as above, with these settings:
- folder `D:\.claude-tmp\timesheet\WP4-RECHECK-A3`;
- Compose project `ts-wp4-rca3`, only if needed.

Report: `handoff/delivery/WP4_RECHECK_A3.md` and `.vi.md`. Evidence:
`handoff/delivery/evidence/WP4-RECHECK-A3/`. Append the attempt-3 results after the
attempt-2 results.

## Results

### Auditor result (attempt 1): decision PASS

Self-reported model: claude-opus-5-5 (board agent `a659b8cbd52722f18`; effort not observable). Date 2026-10-06,
12:45 to 13:10 UTC. Not committed. Report: [WP4_RECHECK_A](../WP4_RECHECK_A.md) (VI: `WP4_RECHECK_A.vi.md`).
Evidence: `handoff/delivery/evidence/WP4-RECHECK-A/` (index `00-README.txt`; masked, LF).

**Target and digest.** Reviewed commit `0f7fba2ee6bc2a7affcd1a3bf800e085351c7b65` (= `origin/main`). HEAD and the
digest were recorded before (12:45 UTC), after (13:03 UTC) and again at 13:09 UTC (`99b`), both in the repository (ls-tree form and
`scripts/source-digest.mjs`) and on the `git archive` export (its tree `ce6f443d…` equals the freeze tree). The digest
was `dfe4541d2c6c908a00782ed9fbe2fb7a3be48ea18aa9fc23ae1ced9085b86742` (775 files) every time, equal to the gate digest.
No non-handoff file changed.

**Separation.** The fix authors are WP4-FIXA `a7b344b3ceca312e4` and WP4-FIXB `afacb78fd37c3d657` (sonnet). The
strongest WP4 author model is opus, so the reviewer is not weaker. The first area-A auditor was `af8b9184c8adf6eb0`.
This reviewer authored nothing in WP4.

| # | Scope item | Result | Evidence |
|---|---|---|---|
| 1 | A-01 | Closed. Both images, the drill build and my `docker build --no-cache`, scanned layer by layer without a container: `/app/dist` has 116 files, 0 `*.map`, 0 `sourceMappingURL`. Drill stage 1: the bundle has no `sourceMappingURL`, `/assets/<bundle>.map` is 404, and the scan includes `*.map`. | `04`-`07` |
| 1 | A-02 | Closed. The `.env.example:60-61` wording matches docs/07:32, docs/10:159, docs/11 section 8 and the CLI warning. | `19` |
| 1 | A-03 | Closed. No client component renders the retention run. Thirteen invalid bootstrap files with markers in every free-text place: exit 1, no marker printed, only dates or policy numbers quoted. | `14`, `19` |
| 1 | A-04 | Closed. `npm run verify` with `DATA_DIR` and `DATABASE_PATH` exported: exit 0, 76 files / 1734 tests, SMOKE PASSED, no deprecation line, and the exported folder stays empty. | `02` |
| 2 | R-A1 | Correct and safe. A future-dated candidate refuses the dry run and the real run (exit 2, counts-free, nothing removed) in the library and the CLI. The boundary at the clock holds, and non-tool folders are ignored. Normal pruning still works: 180 nightly backups keep 13, equal to my independent 7/4/6 computation, and the CLI prunes 2 with exit 0. | `13`, `16` |
| 2 | R-A5 | Correct. Held 2, released 1 by id, then `--all` released 1; each job made one attempt. | `04` |
| 2 | R-A7 | Correct. docs/03:49 EN and VI. | `19` |
| 3 | Regression | None. Area-A runtime changed only in `prune.ts`, the `bootstrap.ts` comment and the `app.ts` asset route. Drill exit 0 with 208 PASS (33/31/57/35/27/23). P2 31, P3 10, P4 16, P7 23 and P8 8 PASS. | `04`, `10`-`12`, `15`-`17` |
| 4 | FIXB docs sync | Matches the code: 4/16 MiB, element, cell, row and string caps, 2,000 holiday rows, 422 `workbook_rejected`, capped findings, and `not_due` with the due instant counted as due. docs/10 has the decision; the VI pairs match. | `19` |
| 5 | Same-second tie | Acceptable (Info, R-RA1). In 7 of 12 back-to-back CLI pairs both backups fell in one second, and 3 of those removed the just-printed backup. One complete backup of that second always remains; the nightly schedule never ties. Optional: keep `requiredName` on a tie. | `13` |

**Findings:** none.

**Risks (non-blocking):**
- R-RA1: the same-second tie above.
- R-RA2 (Low): a later `--prune` in the same UTC day removes the paired pre-upgrade backup. Optional runbook line.
- R-RA3 (Info): 566 third-party maps under `/app/node_modules`, never served.
- R-RA4 (Info): a far-future backup blocks every prune until it is moved.
- A wording nit: the backup "prints counts only" but also prints the new folder name.

**Not run:**
- NAS and native arm64: NOT VERIFIED.
- e2e: not rerun (not required for area A).
- P1, P1b, P5, P6 and P9: not rerun as separate probes, because their code is unchanged and the drill and tests cover them.

**Validators:** `validate_package.py --preflight` exit 0 (77 translation pairs, `20`). `precommit-check.mjs` over this
task's files, staged in a private git dir: exit 0, 0 findings (`21`).

**Procedure:**
- One read-only grep used `2>/dev/null`, against the rule; it had no effect.
- The no-cache image was built with `docker build`, not Compose. It used a project-prefixed tag, started no container and was removed by name.
- Docker: nothing of `ts-wp4-rca` is left (`18`).
- No probe was rerun.
- Nothing is left running.

### Auditor result (attempt 2): decision PASS

Self-reported model: claude-opus-5-5 (board agent `aabafcca9efc225db`; effort not observable). Date 2026-10-06,
14:54 to about 15:20 UTC. Not committed. Report: [WP4_RECHECK_A2](../WP4_RECHECK_A2.md) (VI: `WP4_RECHECK_A2.vi.md`).
Evidence: `handoff/delivery/evidence/WP4-RECHECK-A2/` (index `00-README.txt`; masked, LF). Attempt-1 report
`WP4_RECHECK_A.md` and its evidence are unchanged.

**Target and digest.** Reviewed commit `cc34e7ff11e6c27f23fd2bf1b86f77159f95eb8d` (= `origin/main`, the WP4-REGATE2
`freeze_commit`). HEAD and the digest were recorded before (14:54 UTC), after (15:08 UTC) and again after the reports were
written (`99b`). Both forms were used in the repository (ls-tree and `scripts/source-digest.mjs`), and the same digest was
computed on the `git archive` export (its tree `940def94…` equals the freeze tree). The digest was
`96445de4ad266f0fa70f78c0c72b03625775d170e8841c757c39b2b5cae7d503` (775 files) every time, equal to the gate digest. No
non-handoff file changed.

**Separation.** The delta authors are WP4-FIXB2 `a25ba7423ae0846ed` (opus, expert) and WP4-DEPCLEAN `af38846cc479cc2e3`
(sonnet). The strongest author model is opus, so the reviewer is not weaker. The reviewer is not the attempt-1 auditor
`a659b8cbd52722f18`, the first area-A auditor `af8b9184c8adf6eb0` or the WP4-RECHECK-B2 auditor `af0ca5d5f3ab94048`. It
authored nothing in WP4 and shared no file with WP4-RECHECK-B2.

| # | Attempt-2 scope item | Result | Evidence |
|---|---|---|---|
| 1 | Delta since 0f7fba2 | 127 paths: 118 under `handoff/delivery/` and 9 outside it, all owned by FIXB2 (3 import modules, 2 workbook tests, docs/07 EN and VI) or DEPCLEAN (`package.json`, lock). No area-A runtime path changed. No area-A module imports a changed module, and the two `workbookImport.ts` exports used by area C are untouched. The docs/07 hunk is the workbook-import paragraph only, and its numbers equal the code. | `10`, `27` |
| 1 | Lock change | `p-lock` probe exit 0. 8 entries removed (`fast-xml-parser` and its 7 transitive packages), 0 added, 0 changed. Each removed entry is in the old `fast-xml-parser` closure and is needed by nothing outside it. `package.json` differs by that one line. No stale reference outside handoff/. | `11`, `27` |
| 2 | `npm ci`, verify | `npm ci`: exit 0, 161 packages, no deprecation line, removed packages absent, `npm audit --omit=dev` 0. `npm run verify` with `DATA_DIR`/`DATABASE_PATH` exported: exit 0, 76 files / 1750 tests, the same 41 smoke checks as attempt 1, no deprecation line, the exported `DATA_DIR` stays empty. | `12`, `13` |
| 2 | Drill | REGATE2 result read (208 PASS). Rerun because the image dependencies and the stage-6 import code changed. Result: exit 0, 208 PASS (33/31/57/35/27/23), Compose project `ts-wp4-rca2`. | `14`, `15` |
| 2 | Image ships no maps | Drill image (served from the BuildKit cache) and a `docker compose -p ts-wp4-rca2 build --no-cache` image: `/app/dist` 116 files, 0 `*.map`, 0 `sourceMappingURL`, byte-identical between the two. Third-party maps: 560, pdf-lib only. Drill stage 1: `/assets/<bundle>.map` 404. | `15`-`18` |
| 2 | Area-A probes | Attempt-1 probes rerun unchanged. P2 31, P8 8, P4 16, P7 23, P3 10, R-A1 24 and A-03 15 PASS; check lines identical to attempt 1. | `20`-`26` |
| 3 | Attempt-1 conclusions | All still apply. The area-A code is byte-identical to 0f7fba2. Changed counts: digest, packages 169 to 161, tests 1734 to 1750 (area-B suites), third-party maps 566 to 560 (R-RA3). | all |

**Findings:** none.

**Risks (non-blocking):**
- R-RA1 (Info), unchanged: this run had 8 of 12 same-second pairs, 5 of which removed the just-printed backup.
- R-RA2 (Low), unchanged.
- R-RA3 (Info): now 560 pdf-lib maps.
- R-RA4 (Info), unchanged.
- R-RA5 (Info, new, drill tooling, pre-existing): the stage-1 check "build output (including npm ci) has no deprecation line" passes vacuously when every build step is cached (this run: 11 `CACHED`, no `npm ci` output in the log). The product is unaffected (`12`, `17`). Optional: `--no-cache`, or report a fully cached build.
- Wording nit in docs/11 section 4, unchanged.

**Not run:**
- NAS and native arm64: NOT VERIFIED.
- e2e: not rerun (REGATE2: 145 passed, 5 skipped).
- P1, P1b, P5, P6 and P9: not rerun as separate probes, because their code is unchanged.
- The scanner's area-B correctness belongs to WP4-RECHECK-B2.

**Validators:** `validate_package.py --preflight` (workflow Python): exit 0, PASS, 78 translation pairs (`28`).
`precommit-check.mjs` over this task's files, staged in a private git dir outside the repository and run last: exit 0,
0 findings (`29`).

**Procedure:**
- The first launches of the R-A1 and A-03 probes were refused by their own fresh-folder guard, because I had pre-created
  the folders (`25a`, `26a`). Nothing ran; both were rerun into fresh folders.
- Two read-only commands used `2>/dev/null` against the rule: a `ps -W` process listing and a grep of two briefs. They had
  no effect.
- The no-cache build used Compose project `ts-wp4-rca2` (build only); both images were removed by name. No container,
  volume, network or image of `ts-wp4-rca2` is left (`19`).
- None of this audit's processes is left running.
