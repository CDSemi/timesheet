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
