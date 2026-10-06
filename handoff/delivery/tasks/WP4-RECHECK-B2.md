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
