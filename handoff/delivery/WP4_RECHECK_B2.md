# Independent review

Translation: [WP4_RECHECK_B2.vi.md](WP4_RECHECK_B2.vi.md).

- Package/date/reviewer and observable model/effort: WP4, second fresh independent recheck of area B
  (data) after the second fix round (WP4-FIXB2: the streaming XML scanner and the report cap; WP4-DEPCLEAN:
  fast-xml-parser removed). It verifies that WP4-RB-01 (which reopened WP4-B-01) is closed as a class, that the new
  scanner is correct, that the report bound holds and that area B has no regression. 2026-10-06; task WP4-RECHECK-B2
  attempt 1 (profile timesheet-auditor, requested opus/xhigh); self-reported model `claude-opus-5-5`; effort not
  observable. Authors of the reviewed snapshot: WP4-FIXB2 `claude-opus-5-5`, WP4-DEPCLEAN `claude-sonnet-5-5`, the
  freeze committer and the WP4-REGATE2 verifier `claude-sonnet-5-5`; the earlier area-B authors are listed in
  WP4_REVIEW_B (strongest `claude-opus-5-5`). The reviewer model is not weaker than any of them. WP4-RECHECK-A attempt
  2 ran at the same time in its own folder; no file or process was shared and its report was not read.
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness:
  `cc34e7ff11e6c27f23fd2bf1b86f77159f95eb8d` (the WP4-REGATE2 `freeze_commit`, pushed). Source digest
  `96445de4ad266f0fa70f78c0c72b03625775d170e8841c757c39b2b5cae7d503` (775 files, handoff/ excluded) before and after,
  by `scripts/source-digest.mjs` and by the `git ls-tree` form; equal to the gate digest of record. HEAD unchanged; no
  non-handoff change in the working tree, tracked or untracked. Source complete: every check ran on a `git archive`
  export of that commit under `D:\.claude-tmp\timesheet\WP4-RECHECK-B2` (outside Dropbox); all 775 non-handoff files
  of the export hash-equal the commit blobs (`21-digest-after.txt`). The accepted WP4-T09 reader was exported from
  `13a258d` into the same task folder for the differential.
- Decision: PASS / FIX REQUIRED / NOT VERIFIED: **FIX REQUIRED.** The class of WP4-RB-01 is closed in substance:
  every earlier hostile package (P1b, P6, P7, r1, r2, r3) is refused fast or bounded, and 72 new hostile shapes inside
  every stated limit stay linear and bounded (none over 0.8 s or +160 MiB, no 500, no stack trace, no orphan file). The
  scanner is correct (49 of 49 spec cases), the differential against the WP4-T09 reader is identical on the tracked
  template and on a realistic 12-dated-sheet workbook, the report bound holds (text cut at 200 with `truncated`,
  largest stored report 1.61 MiB, over-cap reports are 422, truncation never changes an imported value) and area B has
  no regression. One Low finding remains: the numeric budget that docs/07 and `xlsxReader.ts` state for the class
  ("within 500 ms of event-loop time and 150 MiB of added memory on the reference host") is exceeded by two in-limit
  shapes (WP4-RB2-01: about 610 ms, and +155 to +158 MiB).
- Scope actually inspected/executed:
  1. Source read at the reviewed commit: `import/xlsxReader.ts` whole (limits, budget comment, `listEntries`,
     `inflateEntry`, `decodeXmlBytes`, `referenceCode`, `decodeXml`, the part schemas, `scanXml`, `parseXml`, `attr`,
     `richText`, `readWorksheet`, `readWorkbook`), `import/templateMapping.ts` whole (`finalizeFindings`, `scanText`,
     `keptText`, `clipText`, `readHolidays`, `readPeriod`, `detectFormulaDefects`, `mapWorkbook`),
     `services/workbookImport.ts` whole (`MAX_REPORT_BYTES`, `serializeReport`, `previewImport`, `buildReport`,
     `reportDay`, `buildPlan`, `commitImport`), `routes/imports.ts`, `files/fileStore.ts` `put`, `domain/dates.ts`; the
     WP4-T09 reader at `13a258d` (fast-xml-parser options, `richText`, `readWorksheet`); the diff `0f7fba2..cc34e7f`
     and `13a258d..cc34e7f` of the import files, `package.json` and `package-lock.json`; the two new test files.
  2. Canon: docs/07 "Workbook import" and its `.vi.md` (the limits and budget sentences match the code numbers),
     WP4_REVIEW, WP4_REVIEW_B, WP4_RECHECK_B, the WP4-FIXB2, WP4-DEPCLEAN and WP4-REGATE2 results, the XML 1.0 rules
     for references, CDATA, comments, PIs, attributes, end tags, BOM and encoding declarations, and the OPC rule that
     parts are UTF-8 or UTF-16.
  3. Execution: `npm ci` and `npm run verify` on the export; the six area suites (twice, once verbose); the six earlier
     probes rebuilt byte for byte; my own probes: a scanner-correctness probe against the spec with T09 side by side,
     a two-reader differential, a 72-shape cost catalogue (fresh child per case, repeats for the near-budget ones), a
     built-server HTTP probe (back-to-back `/api/health` polling during every upload, stored report bytes, kept
     files, a truncation commit check, edge payroll dates, ownership, idempotency, replay and conflict) and a file map.
- Evidence table: command | result/exit | evidence (all under `handoff/delivery/evidence/WP4-RECHECK-B2/`, masked,
  LF; Node v24.21.0 by full path; Git Bash only, npm script shell = Git Bash; capture mode, `JOB_RUNNER=off`;
  `DATA_DIR` and `DATABASE_PATH` explicit under the task folder for every CLI, test and server run):

| Command | Result/exit | Evidence |
|---|---|---|
| `git rev-parse HEAD`; `source-digest.mjs`; `git ls-tree … \| sha256sum` (before) | cc34e7f; 96445de4…d503 (775 files) both ways; exit 0 | `01-baseline.txt` |
| `npm ci` (export of cc34e7f) | 161 packages; 1 high advisory (source-map-js, dev only); no deprecation line; exit 0 | `02-npm-ci.txt` |
| `git diff 0f7fba2 cc34e7f -- package.json package-lock.json`; grep of the export | only `fast-xml-parser` removed from package.json; lock: 121 deletions, 0 additions, the 8 packages of DEPCLEAN; no source, test, script or doc names fast-xml-parser; absent from node_modules | `03-deps.txt` |
| `npm run verify` (`--trace-deprecation --pending-deprecation`) | typecheck, lint, 76 files / 1750 tests, build, SMOKE PASSED (41 PASS); no deprecation line; exit 0 | `04-verify.txt` |
| `vitest run` workbook-reader, workbook-import, opening-balance, sharing-matrix, ot-leave, client importModel | 6 files, 192 tests passed (twice; second verbose); exit 0 | `05-suites.txt`, `05b-suites-verbose.txt` |
| `node probes/b2-diff.mjs` (T09 at 13a258d vs cc34e7f) | template and realistic 12 dated sheets: reader output cell by cell equal (1055 and 7403 cells); preview sheets, periods, holidays, calendar, summary, clean equal; findings equal; exit 0 | `07-diff.txt`, `probe-b2-diff.mjs.txt` |
| `node probes/b2-scanner.mjs` | 49 spec cases PASS, 0 FAIL; 11 lenient cases reported; exit 0 (first run had a probe depth miscount, see `22-incidents.txt`) | `08-scanner.txt`, `probe-b2-scanner.mjs.txt` |
| rebuilt P1b, P7, r3, r1 (verbatim copies) | every earlier package refused (2-10 ms) or bounded (accepted ones at most 82 ms, +73 MiB); exit 0 | `09`–`13` |
| `node probes/b2-cost.mjs` (66 new shapes; the other 6 below) | all bounded and linear; E7 596 ms is over the time budget; most memory Y2 +144 MiB, Y1 and Z1 +107 MiB; exit 0 | `14-b2-cost.txt`, `probe-b2-cases.mjs.txt`, `probe-b2-cost.mjs.txt` |
| `node probes/b2-cost.mjs <case> 5` and mechanism control | E7/E7b/E7c 596-630 ms (one 781 ms); E7d (decoded once) 334-341 ms; E1 324-338 ms; E5 176-193 ms; Y7 +155..+158 MiB; Y8 +141..+157 MiB; controls Y1 +106..+108 MiB and Y9 (nothing pinned) +147..+148 MiB; exit 0 | `15-b2-cost-repeats.txt`, `20-b2-cost-mechanism.txt`, `23-b2-cost-memory-control.txt` |
| rebuilt P6, r2 over HTTP (built server) | P6 422 in 5-11 ms; r2: template and 60 sheets 201, every hostile 422 or 201, largest report 0.57 MiB, no server error line; exit 0 | `16-p6.txt`, `17-r2.txt` |
| `node ../probes/b2-http.mjs` (built server, every new shape) | 0 responses 5xx or transport errors; worst `/api/health` during an upload 629 ms (E7, E7b, E7c over 500 ms; all others ≤ 350 ms); largest stored report 1,686,087 bytes; L5, L6 422 `report_too_large`; truncation commit check equal; edge dates 201 and commit 200; ownership 404s; replay and conflict as specified; exit 0 | `18-b2-http.txt`, `probe-b2-http.mjs.txt` |
| `node probes/b2-files.mjs` | 56 files: 55 referenced by `imports.storage_key`, 1 by `attachments` (seed signature); 0 unreferenced; 0 missing | `19-b2-files.txt` |
| digest after; export integrity | unchanged; template hash `47ef42d5…6331`; 775 of 775 export files hash-equal | `21-digest-after.txt` |
| `scripts/precommit-check.mjs` over the files this audit wrote (in a scratch git repo under the task folder) | PASS, 37 files, 0 findings; exit 0 | `24-precommit.txt` |

  Results by scope item:
  - **1 The resource bound holds as a class — in substance yes, numerically no (WP4-RB2-01).**
    - Earlier probes, rebuilt verbatim: P1b (37 KB, 65 KB, 113 KB, the 150,000-cell holiday sheet) `part_too_large`
      in 2-7 ms; P7 `part_too_large`/`total_too_large` in 0-10 ms; r3 `<1/>`, `<9/>`, `< />`, `<.a/>` `malformed_xml`
      in 17-27 ms, `<c/>` and `<row/>` refused, the 3.8 MiB-attribute `<c>` `too_many_attributes` in 64 ms; r1: 39
      cases, every hostile one refused or bounded, the slowest 82 ms (H5e, accepted) and the most memory +73 MiB
      (H4a, refused). Over
      HTTP: P6 422 in 5-11 ms; r2 every request 201 or 422, the largest `report_json` 0.57 MiB, no server error line.
    - New shapes (`14-b2-cost.txt`, `18-b2-http.txt`), each inside every stated limit or at its edge:
      - tag-name shapes: `<x/>`, prefixed kept cells `<x:c/>`, non-Latin-1 `<ā/>`, astral names, 65,000-character
        names, 32,000-character open/close pairs, end tags padded with 4 MiB of white space, start tags of 65,000
        spaces, `<Row/>`/`<C/>`, every name-character class, 19,999 kept rows: accepted in 29-179 ms at most +71
        MiB, or `too_many_elements` in 26-31 ms;
      - attribute floods: 64 per element × 3,124 × 2 + 1,562 (499,840 in the package), 64 attributes all named `r`
        on kept cells, 1,000-character attribute names, 64 namespace declarations per element, 64 KiB values full of
        `>` and quotes, 66,000 kept `sheetData` nodes with three kept attributes: 49-129 ms, at most +59 MiB; 65 on
        one element `too_many_attributes`;
      - deep nesting: 40-deep blocks to the opening limit 28 ms; kept nesting `too_many_elements`;
      - long text and CDATA: 4 MiB CDATA labels, 99,990 CDATA sections in one kept `<t>`, 4 MiB of text the reader
        does not keep, 4 MiB formulas of quotes, 2 M two-byte characters, 4 MiB of digits or white space in `<v>`:
        48-65 ms, at most +61 MiB (the 99,990 CDATA sections are refused at the package opening limit in 34 ms);
      - comments and PIs: 2 × 99,990 refused at the package limit in 15-18 ms; one 4 MiB comment or PI per part 54-58
        ms; a kept `<t>` split by 99,990 comments refused in 105 ms;
      - references in bulk: `&amp;` 176-193 ms; `&#1234567;`, `&abcdefgh;`, `&;&a;` 104-176 ms; astral `&#x1F600;`
        171 ms; bare `&` in 16 MiB of kept text, in a kept `r` attribute or in a 4 MiB relationships part 256-338
        ms; bare `&` in kept attribute values decoded twice (E7) about 610 ms — over the budget;
      - many parts just under the cap: 4 × 4 MiB of 156-character kept values 134 ms / +76 MiB; 61 dated sheets of
        270 KB (16 MiB) 115 ms / +71 MiB; 256 ZIP entries with 249 unparsed ones 51 ms;
      - shared strings: 49,999 (limit) 51 ms; 33,332 rich-text ones 50 ms; 49,999 used by 49,000 cells 96 ms; one
        string of 33,000 runs used by 2,000 holiday names 45 ms;
      - long inline strings and the report: 61 × 14 labels of 17,000 letters, 1,000 U+0001 or 1,000 euro signs, 2,000
        holiday names of 1,020 characters matched by 854 labels: 67-112 ms, at most +66 MiB, preview JSON at most 1.26
        MiB;
      - most memory: 4 × 49,990 empty cells with 10-character addresses and 97-character sheet names +107 MiB; the
        same with each part decoded as a two-byte string and pinned by one kept value (Y2) +143..+145 MiB, with an
        ASCII filler and one non-Latin-1 character (Y7) +155..+158 MiB — over the budget (Y9, the same without the
        pinning value, +147..+148 MiB);
      - late refusals after the most work: the package opening limit at the end of the 4th part 153 ms / +107 MiB;
        `tag_too_large` or `malformed_xml` at the very end after 16 MiB of bare `&` 318-322 ms; `too_many_holidays`
        after two maximal sheets 89 ms.
    - Over HTTP every one of these (70 uploads; the E7d and Y9 controls ran in memory only) answered 201 or 422 (0 responses
      5xx), `/api/health` polled back to back during each upload waited at most 350 ms except E7, E7b and E7c
      (593-629 ms), and the server wrote no error line. Refused uploads stored nothing: 56 kept files map one to one
      to 55 import rows and the seed signature.
  - **2 The new scanner is correct.** `08-scanner.txt` checks the new reader against the XML spec (the oracle is the
    spec; T09 is shown beside it):
    - references: the five predefined entities, decimal and hexadecimal references (astral included), single decoding
      (`&amp;lt;` stays `&lt;`), references inside attribute values (`r="A&#55;"` is A7) and inside `<v>`;
    - CDATA is literal (no reference decoding, markup kept) and may mix with text; comments and PIs inside text are
      not text and may stand between elements and outside the root;
    - attributes: single and double quotes, `>` and the other quote inside a value, LF/tab/CR around `=` and between
      attributes, self-closing tags with a space, empty `<t/>`, `</c >` accepted;
    - BOM and encoding: UTF-8 BOM, UTF-16LE and UTF-16BE with BOM (non-ASCII and astral text read correctly); a
      UTF-16 part without a BOM is refused;
    - namespaces: prefixed elements bound to the main namespace read; `xml:space="preserve"` keeps spaces; rich-text
      runs with run properties read and phonetic runs excluded;
    - refusals: DOCTYPE (also lower case, after `<! `, in UTF-16), ENTITY, ELEMENT/ATTLIST, mismatched, unclosed and
      orphan end tags, unclosed comment/PI/CDATA, two roots, text or CDATA outside the root, unquoted values, missing
      white space between attributes, `< c>`, `<1>`, `</ v>`, an attribute without a value, an unterminated quote, a
      lone `<`, and nesting deeper than 40 (exactly 40 is accepted): all 422;
    - 49 PASS, 0 FAIL. Compared with T09 the new reader is correct where T09 was not (CDATA was decoded, a reference
      in `<v>` was `invalid_number`) and stricter on malformed XML that T09 read silently (R06-R22). The 11 lenient
      cases (undeclared entity kept literal, invalid references kept literal, bare `&`, duplicate attribute last wins,
      `<` in a value, `]]>` in text, `--` in a comment, unbound prefix, `&#1;`, a declared ISO-8859-1 part read as
      UTF-8, a foreign-namespace kept name) behave exactly like T09, expand nothing and are listed under risks.
    - Differential (`07-diff.txt`): on the tracked template and on a realistic 12-dated-sheet synthetic workbook
      (mixed labels including holidays, a floating holiday, an unknown label, formula-cache labels, clocks, a start
      without an end, a blank and an unexpected date, a Sunday with clocks, clean and inherited formulas, a hidden
      sheet, a payroll-cell mismatch, and 15 labels rewritten to Excel-style shared strings with rich-text runs, a
      phonetic run, `xml:space` and references) the reader output is equal cell by cell (1,055 and 7,403 cells) and
      the preview — sheets, periods with every day's dates, labels, source cells, mapping, holiday names and clocks,
      holidays, calendar, summary, clean and the 6 and 60 findings — is equal to the T09 output.
  - **3 The report bound holds.**
    - Text: every label, holiday name and employee text is cut at 200 characters and flagged (`truncated` counted in
      the L and S cases, 879 to 2,904 flags); only text of at most 1,024 characters is ever compared.
    - Size: the largest stored `report_json` is 1,686,087 bytes; L5 (2,000 holiday names and 854 labels of 200
      three-byte characters) and L6 (the same with U+0001) are 422 `workbook_rejected`/`report_too_large` and store
      nothing; the suites cover the serialization failure (`report_too_large`) and a mapping failure
      (`report_failed`) as 422.
    - Truncation never changes an imported value (`18-b2-http.txt` V1): `Worked` + 300 spaces + `x` (307 characters,
      cut and flagged) and `Worked` + 2,000 spaces (longer than the scan, shown as `Worked` with `truncated`) and a
      label of 1,100 spaces + `Vacation` are unknown and skip-only; forcing `import` on one of them is 422
      `decision_not_allowed`; a 263-character holiday name used as a label maps to Holiday with the name cut; the
      commit wrote exactly Worked, Holiday, Holiday, Vacation and five Worked days as expected, and nothing for the
      three cut labels. Imports write only a category and the WFH flag, both from a full-text match.
  - **4 Regression — none found.** `npm ci` and `npm run verify` pass (1750 tests, no deprecation line); the six area
    suites pass (192 tests: ownership 404s, idempotent preview and commit, concurrent commits, decisions and
    conflicts, `not_due` (R3), the F-2 guards and the imported-period OT leave refusal (R1), the opening balance and
    its ownership, the sharing matrix, the client import model). Over HTTP an identical re-upload is 200 with the
    same id, another employee and the administrator get 404 on read and commit and do not see the batch, an
    identical re-commit is `replayed` and a different one 409 `import_already_committed`; payroll dates 1900.01.01,
    1900.01.19 and 2999.12.31 preview as `not_in_calendar` and commit with skips (no 500). The diff since `0f7fba2`
    touches only the three import files, their two test files, docs/07 EN/VI, `package.json` and the lock.
    `fast-xml-parser` and its seven transitive packages are gone and no other dependency changed.

- Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix:

| ID | Severity | File/function | Reproduction | Expected / actual | Rule/AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP4-RB2-01 | Low | `src/server/import/xlsxReader.ts`: `attr()` decodes the raw value on every call and `readWorksheet` `readCell` calls `attr(cell, 't')` twice when the cell has an `<is>` child; `decodeXml` scans a 9-character window for `;` after every `&`; the memory peak combines up to 200,000 kept cells with four 4 MiB parts decoded as two-byte strings, and a kept value that is a `slice` pins its decoded part; the budget comment next to `DEFAULT_READER_LIMITS`. docs/07 "Workbook import" and its `.vi.md` (the budget sentence) | **Time (E7):** a 24,780-byte upload of four worksheet parts, each with 64 cells `<c r="A1" t="&&&…(65,000)"><is><t>x</t></is></c>` (tags under 64 KiB, parts under 4 MiB, XML under 16 MiB, 2 attributes per element) is accepted in 596-630 ms in memory over 19 runs of E7/E7b/E7c (one outlier 781 ms), and over HTTP answers 201 after 593-629 ms while `/api/health` waits 593-629 ms. Control E7d (no `<is>`, `t` decoded once) 334-341 ms; the same `&` in text (E1) 324-338 ms. **Memory (Y7):** a 545,605-byte upload of four parts, each with 49,985 empty cells with 10-character addresses, one kept 20-character value, one non-Latin-1 character and an ASCII comment filling 4 MiB, is accepted at maxRSS +155 to +158 MiB (8 runs; Y8 with mapped sheet roles +141 to +157 MiB). Controls: the same cells without the two-byte parts (Y1) +106 to +108 MiB; Y7 without the kept value, so nothing pins the parts (Y9), +147 to +148 MiB. | Expected: as docs/07 and the code state, "these limits keep one preview within 500 ms of event-loop time and 150 MiB of added memory on the reference host" (the acceptance budget WP4-FIXB2 set for closing RB-01). Actual: about 610 ms and +158 MiB on the same host (the `&amp;` shape the fix measured at 176 ms measures 176-193 ms here). The cost stays linear and bounded (no 500, the server stays up); only the stated class bound is false. | docs/07 "Workbook import"; `xlsxReader.ts` budget; WP4_RECHECK_B RB-01 (reopened WP4-B-01); FR-16 | Decode each kept attribute value once and ignore (or refuse) kept attribute values longer than a small cap (OOXML `r`, `t`, `si` are a few characters; for example 255, like `MAX_ID_LENGTH`); lower `maxTotalElements` modestly (Y1 shows about 0.5 KiB of peak per kept cell) and keep kept cell values as copies rather than slices that pin the decoded part; add E7 and Y7 to the adversarial sweep (time bound, and a memory note). If the coordinator prefers, restate the budget in docs/07, its `.vi.md` and the code comment as the measured worst case with a margin instead. |

- Risks and optional improvements, separate from proven defects:
  - R-B2-1: `reportDay` sets `floating_holiday` by comparing the matched holiday's cut name with the cut names of the
    floating holidays, so two holiday names that share their first 200 characters can mark a non-floating holiday as
    floating (V1 day 4). The effect is conservative (one more explicit decision; the category imported is still
    Holiday) and no floating holiday can lose its flag. Optional: take the flag from the matched holiday itself.
  - R-B2-2: the scanner accepts some input the XML spec calls fatal (the 11 lenient cases), exactly as T09 did; nothing
    is expanded and the cost is counted. A part that declares an encoding other than UTF-8 or UTF-16 is read as UTF-8
    (OPC allows only UTF-8 and UTF-16). Optional: refuse such a declaration.
  - R-B2-3: a label of more than 1,024 characters that starts with white space is shown as an empty, `truncated` label
    (skip-only). Cosmetic.
  - R-B2-4 (carried): no per-user preview quota (owner choice I-5 open); `npm ci` reports one high advisory in the
    dev-only `source-map-js`; the budget is measured on the workstation only and the NAS is NOT VERIFIED.
- Required gates unrun/blocked and why: none of the mandatory area-B checks is unrun. Not rerun because they are
  outside this brief and WP4-REGATE2 ran them on this digest: the e2e suite (145 passed, 5 skipped) and the container
  drill (208 PASS). The NAS target is NOT VERIFIED (no owner access), which also bears on the budget.
- Disposition of previous findings:
  - WP4-RB-01 (reopened WP4-B-01): mechanisms (a) uncounted markup and attribute floods and (b) unbounded report and
    the 500 are **fixed and verified** on every earlier and every new shape; the class is bounded and linear. The
    stated numeric budget is **not met** by two shapes: WP4-RB2-01 (Low).
  - R-RB1 (500 on report building): **fixed** (L5/L6 422; the suites' serialization and mapping failures are 422).
  - R-RB2 / I-5 (preview quota): open owner choice, not a defect.
  - WP4-B-02, R1, R3: still hold (suites and the HTTP spot checks).
  - DEPCLEAN: `fast-xml-parser` removed, no other dependency changed: **verified**.
- Software readiness, owner permission and pilot result separately: software readiness of area B is not accepted
  until WP4-RB2-01 is fixed (or the budget restated) and rechecked on the new digest; every data-integrity, privacy
  and report rule of the area held under the probes. Owner pilot permission has not been requested or given. No
  deployment, real data or real mail.
- One next action/prompt: the coordinator dispatches one bounded fix (`handoff/prompts/FIX_FINDINGS.md`) for
  WP4-RB2-01 in `xlsxReader.ts` (decode kept attributes once and cap their length; stop pinning decoded parts or lower
  the opening limit) with red-first tests from E7 and Y7 — or a restatement of the budget in docs/07, its `.vi.md` and
  the code comment — then a freeze, a regate and a fresh area-B recheck on the new digest.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP4-RECHECK-B2 attempt 1 (board agent ID recorded by the
  coordinator; not observable to the reviewer). Authors of the reviewed snapshot: WP4-FIXB2 `a25ba7423ae0846ed`
  (`claude-opus-5-5`), WP4-DEPCLEAN `af38846cc479cc2e3` (`claude-sonnet-5-5`), freeze committer `a6aac816cd417734e`;
  gate verifier WP4-REGATE2 `acddc52ef017c9200`; the earlier area-B authors and auditors are recorded in WP4_REVIEW_B
  and WP4_RECHECK_B.
- Fresh context; confirm reviewer did not author changes: fresh context; this reviewer authored no WP4 change, fix,
  freeze or gate and ran neither WP4-AUDIT-B nor WP4-RECHECK-B. It wrote only this report pair, the Results section of
  its brief and `evidence/WP4-RECHECK-B2/`. Every hostile workbook was built and kept under the task folder; no
  workbook or binary is in the evidence; the template hash is unchanged.
- Source digest before/after; gate evidence for that snapshot:
  `96445de4ad266f0fa70f78c0c72b03625775d170e8841c757c39b2b5cae7d503` before and after (`01-baseline.txt`,
  `21-digest-after.txt`); WP4-REGATE2 PASS on the same commit and digest, treated as a claim and re-executed for this
  area.
- New report path preserving previous review history: `handoff/delivery/WP4_RECHECK_B2.md` and `.vi.md` (new).
  WP4_REVIEW_B, WP4_RECHECK_B and all earlier reports are unchanged.
- Finding dispositions and next coordinator fix/recheck task: WP4-RB2-01 (fix or restate); then a fresh WP4 area-B
  recheck on the new digest. No server, runner, container or background process was left; every server child was
  stopped through its handle; no docker command was run. One procedural breach without effect (a stray no-op command
  redirected to /dev/null) and the probe defects are recorded in `22-incidents.txt`.
