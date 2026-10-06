# WP4-RECHECK-B dispatch brief

- Mission/task: timesheet-software-readiness / WP4-RECHECK-B; package WP4; kind audit;
  attempt 1; depends on WP4-REGATE (PASS).
- Scope: a fresh, independent recheck of WP4 area B (data) after the fix round. It
  verifies WP4-B-01, B-02 and the R1 and R3 changes, and re-confirms that area B holds on
  the new freeze.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk H, novelty no.
- Fresh context: you did not author WP4 and did not run the first area-B audit.
  - Write the task record in English.
  - `WP4_RECHECK_B.md` and its `.vi.md` are bilingual and follow the REVIEW form.
  - Earlier reviews stay unchanged.
- Target: `reviewed_commit` is the WP4-REGATE `freeze_commit`. The coordinator gives the
  SHA and the gate digest in the dispatch prompt. Record HEAD and the digest before and
  after; the digest must equal the gate digest.
- WP4-RECHECK-A may run at the same time in its own folder. Do not share files with it.

## Runtime

- Use your own scratch clone or export under `D:\.claude-tmp\timesheet\WP4-RECHECK-B`.
  Use it for TEMP/TMP and for every generated or hostile workbook. Never write a
  workbook into the repository.
- Set `DATA_DIR` and `DATABASE_PATH` explicitly in that folder for every CLI or server
  run.
- Use Git Bash only. Never use `cmd.exe` in any form, PowerShell without `-Command`, or
  any interactive shell.
- **Never feed scripts to python or node through stdin (`-` or a heredoc). Write probe
  files and run them.** The first area-B audit left a runaway REPL this way.
- Call Node 24 by its full path. Keep shell calls in the foreground.
- Run no docker command unless a finding needs one. If you do, use the Compose project
  name `ts-wp4-rcb` and remove it by that name.
- Do not edit source. Use capture mode only.
- Never kill processes by PID. Never write into the repository root. Never redirect to
  /dev/null or nul.
- If a permission check denies a call, stop and report.

## Read first

- AGENTS.md, from disk.
- [WP4_REVIEW](../../prompts/WP4_REVIEW.md).
- [WP4_REVIEW_B](../WP4_REVIEW_B.md) (the first audit) and its probes in
  `handoff/delivery/evidence/WP4-AUDIT-B/`.
- The results of [WP4-FIXB](WP4-FIXB.md), [WP4-FIXA](WP4-FIXA.md) and
  [WP4-REGATE](WP4-REGATE.md).
- docs/03, docs/07 and docs/10, each with its `.vi.md` pair.

## Scope

1. **Each finding is closed.**
   - B-01: rebuild the first audit's cost probes, P1b, P6 and P7. Then try to get
     around the new limits with your own hostile packages:
     - many parts each just under the per-part limit;
     - deep nesting;
     - attribute-heavy elements;
     - many shared strings;
     - large inline strings.

     Check both the refusal timing and the memory use. Check also that the limits
     still accept the tracked template and a realistic multi-sheet workbook.
   - B-02: run the 150,000-cell Holiday Dates case and a sparse far row.
2. **The new guards are correct.**
   - R3 (`not_due`): skip-only, the rule stored, and an ended and due period still
     importable.
   - R1: the reservation inside an imported period answers 409.
   - Judge whether the R3 default stays within the canonical rules (I-3).
3. **Regression.** The fixes changed nothing else in area B: ownership 404s,
   idempotency, conflicts, the F-2 guards, the opening balance and the client.
   - Rerun at least `npm ci` and `npm run verify` on your export.
   - Rerun the workbook-import, workbook-reader, opening-balance and sharing-matrix
     suites.
4. **The FIXB docs sync** in docs/07 and docs/10 matches the code.

## Output

- `handoff/delivery/WP4_RECHECK_B.md` and `.vi.md`.
- Results appended to this file.
- Masked LF evidence in `handoff/delivery/evidence/WP4-RECHECK-B/`, with probes saved as
  `*.mjs.txt`. No workbook or binary goes into evidence.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with the findings listed
  separately.
- Leave nothing running.

Return at most 160 words, beginning with your self-reported model.

## Results

(Auditor appends here.)
