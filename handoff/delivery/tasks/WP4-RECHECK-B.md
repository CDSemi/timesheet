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

Self-reported model: claude-opus-5-5 (effort not observable). Date 2026-10-06. Not committed.
Reports: `handoff/delivery/WP4_RECHECK_B.md` and `.vi.md` (REVIEW form). Masked LF evidence:
`handoff/delivery/evidence/WP4-RECHECK-B/` (01-baseline, 02-npm-ci, 03-verify, 04-suites,
05-r1-cost, 06-r2-http, 07-r3-bypass, 09-digest-after, 10-export-integrity; probes as
`probe-r0/r1/r2/r3-*.mjs.txt`). Precommit over the evidence: PASS, 13 files, 0 findings.

### Decision: FIX REQUIRED

Finding RB-01 (Medium) reopens WP4-B-01. WP4-B-02, R3 and R1 are closed; the rest of area B holds.

- Digest. HEAD 0f7fba2 before and after; digest
  `dfe4541d2c6c908a00782ed9fbe2fb7a3be48ea18aa9fc23ae1ced9085b86742` (775 files) both ways on
  HEAD and the commit, equal to the gate digest; no non-handoff working-tree change; the four
  audited files in the export hash-equal the commit blobs. Node v24.21.0 by full path, Git
  Bash, capture mode, `JOB_RUNNER=off`, `DATA_DIR`/`DATABASE_PATH` explicit per run.
- WP4-B-02 closed: 150,000 Holiday Dates cells → 422 `part_too_large` (7–13 ms), never 500;
  40,000-cell sheet previews; 2,001 date rows → `too_many_holidays`; sparse far rows fast.
- R3 (`not_due`) correct and within I-3 canon: ended-but-not-due is skip-only, flips to `new`
  at the due instant, writes nothing, rule stored; owner-reversible per docs/10. R1 correct:
  reserving OT leave inside an imported period → 409 `imported_period`, creates nothing.
- Regression holds: `npm ci` + `npm run verify` on the export (76 files / 1734 tests, SMOKE
  PASSED, no deprecation); 6 area suites / 176 tests pass; diff confined to FIXB/FIXA paths.
- WP4-B-01 NOT closed (RB-01). The three audited packages are now refused fast, but I got
  around the limits with new hostile packages that respect every enforced limit:
  - (a) `scanElements`'s `ELEMENT_OPENING` regex only counts tag names starting with
    `[A-Za-z_]`. A single ~3.8 MiB part of `<1/>`, `<9/>`, `< />` or `<.a/>` (26 KB upload,
    well under the 4/16 MiB limits) is parsed into a DOM by fast-xml-parser: 0.6–0.9 s and
    0.3–0.59 GiB. Four such parts (33 KB) → 201 after 3221 ms with `/api/health` blocked 2920
    ms; ~1.4 GiB in memory. Attributes are never counted: one `<c>` with 3.8 MiB of attributes
    → 1.1 s / 0.55 GiB; four parts (4.19 MB) → 201 after 5073 ms, health 4772 ms.
  - (b) `MAX_FINDING_SOURCES` caps only `sources`, not cell values. A 1 MiB shared string ×
    100 holiday names (28 KB) → a 99.81 MiB `report_json` stored and returned; a 4 MiB string
    × 2,000 holiday names (50 KB) → 500 `internal_error`, server logs `RangeError: Invalid
    string length`; a 4 MiB inline-string label → a 24–143 MiB report.
  - Bounded fix: count every tag opening (not only `[A-Za-z_]`-led) and bound attributes in
    `scanElements`/`inflateEntry`; cap stored cell-value length in `templateMapping.ts` and
    never 500 on report building in `workbookImport.ts`; add red-first tests from r1/r2/r3.
- Docs sync (docs/07, docs/10) accurate as written; the overclaim that the limits bound the
  work is in `xlsxReader.ts`'s header comment and is part of RB-01.
- Next action: one bounded FIX_FINDINGS task for RB-01, then freeze, regate and a fresh area-B
  recheck on the new digest. Nothing left running; the built server was stopped through its
  handle; no workbook or binary is in the repository or evidence.
