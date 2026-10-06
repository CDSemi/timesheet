# WP4-RECHECK-B2 dispatch brief

- Mission/task: timesheet-software-readiness / WP4-RECHECK-B2; package WP4; kind audit;
  attempt 1; depends on WP4-REGATE2 (PASS).
- Scope: a fresh, independent recheck of WP4 area B (data) after the second fix round. It
  verifies two things:
  - WP4-RB-01, which reopened WP4-B-01, is closed as a class;
  - the new XML scanner is correct.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk H, novelty no.
- Fresh context. You did not author WP4, and you ran neither the first area-B audit nor
  WP4-RECHECK-B.
  - Write the task record in English.
  - `WP4_RECHECK_B2.md` and its `.vi.md` follow the REVIEW form.
  - Earlier reviews stay unchanged.
- Target: `reviewed_commit` is the WP4-REGATE2 `freeze_commit`. The coordinator gives
  the SHA and the gate digest in the dispatch prompt. Record HEAD and the digest before
  and after; the digest must equal the gate digest.
- WP4-RECHECK-A attempt 2 may run at the same time in its own folder. Do not share files
  with it.

## Runtime

- Work in your own export under `D:\.claude-tmp\timesheet\WP4-RECHECK-B2`.
  - Keep every generated or hostile workbook there.
  - Set `DATA_DIR` and `DATABASE_PATH` explicitly there for every CLI or server run.
- Use Git Bash only. Never use `cmd.exe` in any form, PowerShell without `-Command`, or
  any interactive shell.
- **Never feed scripts to python or node through stdin.** Write probe files and run them.
- Call Node 24 by its full path. Keep shell calls in the foreground.
- Run no docker command unless a finding needs one. If you do, use the Compose project
  name `ts-wp4-rcb2` and remove it by name.
- Do not edit source. Use capture mode only.
- Never kill processes by PID. Never write into the repository root. Never redirect to
  /dev/null or nul.
- If a permission check denies a call, stop and report.

## Read first

- AGENTS.md, from disk.
- [WP4_REVIEW](../../prompts/WP4_REVIEW.md).
- [WP4_REVIEW_B](../WP4_REVIEW_B.md) and [WP4_RECHECK_B](../WP4_RECHECK_B.md), with
  their probes in `handoff/delivery/evidence/WP4-AUDIT-B/` and `WP4-RECHECK-B/`.
- The results of [WP4-FIXB2](WP4-FIXB2.md), [WP4-DEPCLEAN](WP4-DEPCLEAN.md) and
  [WP4-REGATE2](WP4-REGATE2.md).
- docs/07, the workbook import section, with its `.vi.md`.

## Scope

1. **The resource bound holds as a class.**
   - Rebuild the earlier probes: P1b, P6 and P7 from the first audit, and r1, r2 and
     r3 from the recheck.
   - Try new hostile shapes inside every stated limit. Cover at least:
     - every tag-name shape;
     - attribute floods just under each attribute cap;
     - deep nesting;
     - long text and CDATA;
     - comments and processing instructions;
     - character and entity references in bulk;
     - many parts just under the part cap;
     - many shared strings;
     - long inline strings.
   - For each shape, measure the time, memory, report size, health latency and status.
   - No response may be 500.
2. **Correctness of the new scanner.** It is a hand-written parser and security-relevant.
   Check each of these against the XML spec and the OOXML parts the template uses:
   - entity and character references (`&amp;`, `&lt;`, `&#x...;`);
   - CDATA, comments and processing instructions;
   - single- and double-quoted attributes, `>` inside attribute values, whitespace,
     self-closing tags, and mismatched or unclosed tags;
   - BOM and declared encoding;
   - namespace prefixes;
   - DOCTYPE and ENTITY, which must still be refused.

   Then run a differential check. For the tracked template, and for a realistic
   12-dated-sheet synthetic workbook, the preview (mapped days, labels, source cells
   and findings) must equal the output of the accepted WP4-T09 reader on the same input.
   To get that output, export 13a258d and run its reader in your folder.
3. **The report bound.**
   - Text is cut at 200 characters and carries the `truncated` flag.
   - The report is at most 2 MiB.
   - A report failure answers 422, never 500.
   - Nothing is truncated in a way that changes an imported value: a truncated label
     must never be imported as a different label.
4. **Regression.** Area B is otherwise unchanged: ownership 404s, idempotency,
   conflicts, `not_due`, the F-2 guards, the opening balance and the client.
   - Rerun `npm ci` and `npm run verify` on your export.
   - Rerun the workbook-reader, workbook-import, opening-balance and sharing-matrix
     suites.
   - Confirm that `fast-xml-parser` is removed and no other dependency changed.

## Output

- `handoff/delivery/WP4_RECHECK_B2.md` and `.vi.md`.
- Results appended to this file.
- Masked LF evidence in `handoff/delivery/evidence/WP4-RECHECK-B2/`. Store probes as
  `*.mjs.txt`. No workbook or binary goes in the evidence.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with the findings listed
  separately.
- Leave nothing running.

Return at most 180 words, beginning with your self-reported model.

## Results

(Auditor appends here.)

### Auditor result (attempt 1) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (effort not observable). Fresh context; this auditor authored no WP4 change and
ran neither WP4-AUDIT-B nor WP4-RECHECK-B; the strongest author of the snapshot (WP4-FIXB2) is `claude-opus-5-5`, so
the auditor is not weaker. Report: `handoff/delivery/WP4_RECHECK_B2.md` and `.vi.md`. Evidence (masked, LF, probes as
`*.mjs.txt`, no workbook or binary): `handoff/delivery/evidence/WP4-RECHECK-B2/` (01-24 and `probe-b2-*.mjs.txt`;
`24-precommit.txt`: privacy check PASS over the 37 files this audit wrote, run in a scratch git repo).

- Target: HEAD `cc34e7ff11e6c27f23fd2bf1b86f77159f95eb8d` before and after; digest
  `96445de4ad266f0fa70f78c0c72b03625775d170e8841c757c39b2b5cae7d503` (775 files) before and after by
  `source-digest.mjs` and the `git ls-tree` form, equal to the gate digest; no non-handoff change; the export of
  cc34e7f under `D:\.claude-tmp\timesheet\WP4-RECHECK-B2\export` hash-equals all 775 blobs. WP4-T09 reader exported
  from 13a258d into `...\t09` for the differential.
- Regression (item 4): `npm ci` exit 0 (161 packages, no deprecation line); `npm run verify` with
  `--trace-deprecation --pending-deprecation` exit 0 (76 files, 1750 tests, SMOKE PASSED, no deprecation line); the
  workbook-reader, workbook-import, opening-balance, sharing-matrix, ot-leave and client importModel suites exit 0,
  192 tests. `fast-xml-parser` removed from package.json only; the lock loses exactly the 8 DEPCLEAN packages (121
  deletions, 0 additions); nothing else changed. HTTP spot checks: identical re-upload 200 same id; another employee
  and the administrator 404 on read and commit; replay `replayed`; different decisions 409; edge payroll dates never 500.
- Scanner correctness (item 2): 49 of 49 spec cases pass (references, CDATA, comments, PIs, attributes, BOM and
  UTF-16, namespaces, DOCTYPE/ENTITY and malformed-markup refusals, depth 40 accepted and 41 refused); 11 lenient cases
  behave like T09 and expand nothing. Differential against the WP4-T09 reader: tracked template and a realistic
  12-dated-sheet workbook (with Excel-style shared strings, rich text, phonetic runs and references) equal cell by
  cell and equal in the preview (days, labels, source cells, mapping, holidays, findings).
- Resource bound (item 1): P1b, P6, P7, r1, r2, r3 rebuilt byte for byte: all refused fast or bounded, no 500. 72 new
  shapes (tag names, attribute floods, nesting, text/CDATA, comments/PIs, reference floods, many parts, shared
  strings, long inline strings, memory maxima, late refusals): all linear and bounded, 70 over HTTP with 0 responses
  5xx and no server error line. Two exceed the stated budget (finding below).
- Report bound (item 3): text cut at 200 with `truncated`; largest stored report 1,686,087 bytes; over-cap reports 422
  `report_too_large`, nothing stored (56 files map to 55 rows plus the seed signature); truncated labels are never
  imported (commit check: day entries exactly as expected; forced import on a cut label 422 `decision_not_allowed`).
- Finding WP4-RB2-01 (Low): the class budget stated in docs/07 (EN and VI) and next to `DEFAULT_READER_LIMITS`
  ("within 500 ms and +150 MiB on the reference host") does not hold: E7 (kept `t` attribute values of bare `&`,
  decoded twice per cell by `attr()`) takes 596-630 ms in memory (19 runs) and blocks `/api/health` 593-629 ms over
  HTTP; Y7 (200,000 empty cells plus four parts decoded as two-byte strings) peaks at +155..+158 MiB (8 runs). Bounded
  fix: decode kept attributes once and cap their length; lower `maxTotalElements` modestly and copy kept values; add
  E7/Y7 red-first tests; or restate the budget as measured.
- Risks (not defects): floating-holiday flag can be a false positive when two holiday names share 200 characters
  (conservative); lenient XML acceptance as in T09 and a non-UTF declared encoding read as UTF-8; carried I-5 quota,
  dev-only advisory, NAS NOT VERIFIED.
- Runtime: Git Bash only; Node 24.21.0 by full path; foreground only; DATA_DIR/DATABASE_PATH explicit under the task
  folder; capture mode; no docker command; every server child stopped through its handle; nothing left running.
  Incidents in `22-incidents.txt`: probe defects, and one rule breach without effect (a stray no-op command in the
  final status check redirected to /dev/null; it failed at once and touched nothing).
- Next action: one bounded fix of WP4-RB2-01 (or a budget restatement), then freeze, regate and a fresh area-B recheck.
