# Independent review

Translation: [WP4_RECHECK_B3.vi.md](WP4_RECHECK_B3.vi.md).

- Package/date/reviewer and observable model/effort: WP4, third fresh independent recheck of area B (data) after fix
  round 3 (WP4-FIXB3: decode once, kept-attribute cap 255, own copies, lower package limits, R-B2-1, R-B2-2). It checks
  whether WP4-RB2-01 is closed (the stated parse budget holds with margin), whether the R-B2-1 and R-B2-2 changes are
  correct, and whether area B still holds. 2026-10-06; task WP4-RECHECK-B3 attempt 1 (profile timesheet-auditor,
  requested opus/xhigh); self-reported model `claude-opus-5-5`; effort not observable. Authors of the reviewed
  snapshot: WP4-FIXB3 `claude-opus-5-5`; the freeze committer and the WP4-REGATE3 verifier (`claude-sonnet-5-5`)
  authored no source. The reviewer model is not weaker than the strongest author. WP4-RECHECK-A attempt 3 ran at the
  same time in its own folder; no file or process was shared and its report was not read.
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness:
  `972ccda6409a7521a008c55c35a5b5cf416daf1e` (the WP4-REGATE3 `freeze_commit`, on origin/main). Source digest
  `635f909da72873548d93407fb3d250806a7e1c29f101cb32e91234c2c9ec3f7b` (775 files, handoff/ excluded) before and after,
  by `scripts/source-digest.mjs` and by the `git ls-tree` form; equal to the gate digest of record. HEAD unchanged; the
  working tree differs only under handoff/. Every check ran on a `git archive` export of that commit under
  `D:\.claude-tmp\timesheet\WP4-RECHECK-B3`, whose 775 non-handoff files hash-equal the commit blobs
  (`99-digest-after.txt`). The accepted WP4-T09 reader was exported from `13a258d` into the same folder.
- Decision: PASS / FIX REQUIRED / NOT VERIFIED: **FIX REQUIRED.** Decode-once, the kept-attribute cap, R-B2-1, R-B2-2,
  the differential and the regression checks all hold. The stated parse budget does not hold. Shapes inside every
  stated limit whose parts do not compress (high-entropy text, so the upload is close to the XML size) take 508-611 ms
  for one preview in memory. Over HTTP they stall `/api/health` for 554-648 ms. The code comment and docs/07 state a
  measured worst case of about 290 ms and +89 MiB (58 % and 60 %). This recheck measured 611 ms (122 %) and +123 MiB
  (82 %). Finding WP4-RB3-01 (Low).
- Scope actually inspected/executed:
  1. Source read at the reviewed commit: `import/xlsxReader.ts` whole (limits and budget comment, `listEntries`,
     `inflateEntry`, `decodeXmlBytes`, `referenceCode`, `decodeXml`, `ownCopy`, the schemas, `scanXml`, `parseXml` with
     the encoding check, `attr`, `richText`, `readWorksheet`, `readWorkbook`), `import/templateMapping.ts` whole
     (`matchedHoliday`, `readHolidays`, `readPeriod`, `detectFormulaDefects`, `mapWorkbook`), `services/workbookImport.ts`
     (`reportDay`, `buildReport`, `buildPlan`, `serializeReport`, `previewImport`), `routes/imports.ts`,
     `files/fileStore.ts` `put`; the diff `cc34e7f..972ccda`.
  2. Canon: docs/07 "Workbook import" and its `.vi.md` (the budget sentence and the new limits match the code),
     WP4_REVIEW, WP4_RECHECK_B2 and its probes, the WP4-FIXB3 and WP4-REGATE3 results.
  3. Execution: `npm ci` and `npm run verify` on the export; the four area suites; the RECHECK-B2 catalogue (E7, Y7 and
     the rest) and the FIXB3 search, both rebuilt verbatim; the auditor's own worst-case search (104 shapes in two
     rounds, fresh process per case), repeats, a phase breakdown, a built-server HTTP probe with health polling, a
     correctness probe (75 checks) and a two-reader differential.
- Evidence table: command | result/exit | evidence (all under `handoff/delivery/evidence/WP4-RECHECK-B3/`, masked, LF):

| Command | Result/exit | Evidence |
|---|---|---|
| `git rev-parse HEAD`; `source-digest.mjs`; `git ls-tree … \| sha256sum` (before) | 972ccda; 635f909d…ec3f7b (775 files) both ways; exit 0 | `01-baseline.txt` |
| `npm ci` (export of 972ccda; export of 13a258d) | 161 packages; 1 high advisory (dev only, as before); exit 0 and 0 | `02-npm-ci.txt`, `03-t09-npm-ci.txt` |
| `npm run verify` (`--trace-deprecation --pending-deprecation`) | typecheck, lint, 76 files / 1755 tests, build, SMOKE PASSED (41 PASS); no deprecation line; exit 0 | `04-verify.txt` |
| `vitest run` workbook-reader, workbook-import, opening-balance, sharing-matrix (verbose) | 4 files, 128 tests passed; exit 0 | `05-suites.txt` |
| `node b2-cost.mjs` (RECHECK-B2 catalogue, verbatim) | 72 shapes; E7, E7b, E7c, E7d `attribute_too_large` in 22-24 ms; Y7, Y8, Y9 `total_xml_too_large` at +73..+76 MiB in 118-140 ms; worst 140 ms and +87 MiB; nothing thrown; exit 0 | `10-b2-catalogue.txt` |
| `run-cost.mjs` with `search.mjs` (FIXB3, verbatim) at the final limits (4×2 MiB and 2×4 MiB parts, 150 000 openings) | 132 shapes, 120 accepted, 12 refused; worst 184 ms and +93 MiB; exit 0 | `11-fixb3-search.txt` |
| `run-cost.mjs` with `rcb3-cases.mjs` (round 1: 67 shapes) | all accepted inside every limit; worst time 329 ms (64 decoded 14-character kept attributes per cell); worst memory +119 MiB (about 72 000 distinct formulas with references on dated sheets, two-byte parts); 3 over the 70 % memory target; exit 0 | `12-rcb3-run1.txt` |
| `run-cost.mjs` with `rcb3-cases2.mjs` (round 2: 37 shapes) | 35 accepted; 4 OVER-BUDGET on time, all with incompressible parts: formulas 596-611 ms and +120..+121 MiB; kept-attribute flood 508 ms; 13 over the 70 % target; exit 0 | `13-rcb3-run2.txt` |
| repeats (5 fresh processes each) | F2-rand100-d2-wide 576-593 ms, +117..+123 MiB; A2-rand13amp-wide 510-528 ms, +88..+92 MiB; exit 0 | `15-repeats.txt` |
| `phase.mjs` (F2-rand100 and two compressible controls) | the reader's 4 KiB-step inflate replicated: 264 ms for this upload (fflate `unzipSync` 61 ms); `readWorkbook` 527 ms, mapping 41 ms. Controls with the same XML size: inflate 38-39 ms, read 130-268 ms | `14-phase-F2.txt` |
| `node ../probes/http.mjs` (built server) | template 201 in 41 ms; compressible control 201, health 260 ms; incompressible shapes 201 after 474-653 ms, health 476-648 ms (3 of 4 over 500 ms); no 5xx, no transport error, no server error line; 6 rows and 7 stored files (6 uploads plus the seed signature) | `16-http.txt` |
| `diff-build`, `diff-dump` (both exports), `diff-compare`, `diff-rules` | reader cells byte-identical (1 055 and 7 403); preview identical after dropping `sourceCount`; stored report identical after dropping `sourceCount` and the R3 rule text from 0f7fba2 (168 days, 12 floating flags, 23 holiday days, 44 findings, 49 decisions); exit 1 by design of the raw compare, see text | `17-differential.txt` |
| `node correct.mjs` | 75 PASS, 0 FAIL; 3 lenient encoding cases listed; exit 0 | `18-correct.txt` |
| digest after; export integrity | unchanged; 775 of 775 export files hash-equal the commit | `99-digest-after.txt` |

  Results by scope item:
  - **1 The budget claim: it does not hold (WP4-RB3-01).**
    - Earlier shapes, rebuilt verbatim: E7 and its variants are refused in 22-24 ms. Y7, Y8 and Y9 are refused at the
      package XML total after +73..+76 MiB. The whole RECHECK-B2 catalogue stays within 140 ms and +87 MiB. The FIXB3
      search at the final limits peaks at 184 ms and +93 MiB. So the RB2-01 shapes themselves are closed.
    - Independent search (104 shapes, each inside every stated limit; the builder's own count of bytes, openings and
      attributes is in the evidence). It covered decode paths (dense predefined, numeric and astral references,
      mixed, `&;` pairs, one reference before 4 MiB of text, CDATA, comment-split segments), kept-attribute floods at
      the attribute limit with every value length from 6 to 255, formulas on mapped sheets (many short ones, ones cut
      at 8 192, shared ones), the most cells, values, relationships and shared strings, workbook-level kept nodes, the
      largest report (61 dated sheets, 2 000 holidays), two-byte parts, and combinations of the attribute, opening
      and byte budgets.
    - All compressible shapes stay under 500 ms (worst 379 ms). Memory never passes +150 MiB (worst +123 MiB).
    - The axis no earlier search used is incompressible content. Every earlier package compressed to at most 0.6 MB.
      With text that does not compress (an upload of 4.1-5.4 MB, inside the 8 MiB package limit), the reader's
      streaming inflate in 4 KiB steps costs about 264 ms for about 5.4 MB (fflate's one-shot `unzipSync` takes 61 ms
      on the same bytes). That comes on top of the scan:
      - about 74 000 distinct formulas with references on two dated sheets take 576-611 ms (+117..+123 MiB) in
        memory, and stall `/api/health` for 640-648 ms over HTTP;
      - the 64-attribute decode flood with random values takes 508-528 ms, and 554 ms over HTTP.
    - The server never answers 5xx, stays up and stores nothing for refused uploads; the cost stays linear and
      bounded.
  - **2 Correctness — holds.**
    - Every value is decoded exactly once (`18-correct.txt`): `&amp;amp;` gives `&amp;`, `&amp;lt;` gives `&lt;`,
      `&#38;#65;` gives `&#65;` and `&#x26;amp;` gives `&amp;`. This holds in inline text, `<v>`, `<f>`, shared
      strings and rich runs, and in kept attributes (sheet name, `r`, relationship `Id`).
    - CDATA stays literal, and a reference split by a comment is never joined. Through the mapping a label written
      `&amp;amp;Worked` reads `&amp;Worked` and is unknown. Code reading confirms that `attr()` no longer decodes
      and that `decodeXml` runs only in the scanner.
    - The 255 cap never cuts a value. 255 written characters are accepted and kept whole; 256 refuse the package
      (`attribute_too_large`). The cap counts characters as written (51 × `&amp;` is accepted). Unkept attributes are
      not capped. A sheet name written in 255 characters (`2026.05.29` plus 49 `&#32;`) decodes whole and maps to
      payroll 2026-05-29; one more written character refuses the package instead of cutting it.
    - R-B2-1 holds. Two holidays share their first 300 characters, so both show the same 200-character name, and only
      one of them is floating. Through `previewImport` and the stored report, the day matching the fixed holiday has
      `floating_holiday: false` and no floating decision; the day matching the floating holiday has `true` and a
      floating decision.
    - R-B2-2 holds. Nine names (ISO-8859-1, latin1, windows-1252, US-ASCII, UTF-32, UTF-7, Shift_JIS, `UTF8`,
      ` UTF-8 `) are refused with `unsupported_encoding` in each of the five parsed parts (45 of 45, single and double
      quotes). UTF-8, utf-8, UTF-16, utf-16le, UTF-16BE and no declaration are accepted.
    - Differential against WP4-T09 (13a258d) on the tracked template and a 12-dated-sheet workbook (`17`): the reader's
      cells are byte-identical, and the preview is identical once `sourceCount` is dropped. The stored report is
      identical once `sourceCount` and one rule string are dropped: the R3 `not_due` rule that WP4-FIXB added in
      0f7fba2, accepted at WP4-REGATE. This includes all 168 days, the 12 floating flags and the 49 decisions. Neither
      difference comes from the reader or the mapping.
  - **3 Regression — none found.** `npm ci` and `npm run verify` pass (1755 tests, no deprecation line), and the four
    area suites pass (128 tests). They cover ownership 404s, idempotent preview and commit, concurrent commits,
    decisions and conflicts, `not_due`, the F-2 guards, no automation of imported periods, the opening balance and the
    sharing matrix. Over HTTP every upload is 201 or 422, never 5xx. The diff since cc34e7f touches only the WP4-FIXB3
    paths.
- Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix:

| ID | Severity | File/function | Reproduction | Expected / actual | Rule/AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP4-RB3-01 | Low | `src/server/import/xlsxReader.ts`: `inflateEntry` (`INFLATE_STEP` = 4096, fflate streaming `Inflate`), with the scan and mapping costs it adds to; the budget comment next to `DEFAULT_READER_LIMITS`; docs/07 "Workbook import" and its `.vi.md` (the measured-worst-case sentence) | `rcb3-cases2.mjs` F2-rand100-d2-wide: a 5.4 MB upload of two dated sheets (8 MiB of XML, 148 491 openings) whose cells hold about 74 000 distinct formulas of random letters with one `&amp;` each; the parts barely compress. In memory 576-611 ms and +117..+123 MiB over 6 runs; over HTTP 201 after 653 ms, `/api/health` 648 ms. A2-rand13amp-wide (64 kept attributes per cell, random values of 17 characters, 359 017 attributes): 508-528 ms, HTTP 557 ms. Control F2-plain100 (same XML size, compressible): 199-212 ms. Phase breakdown: the reader's 4 KiB-step inflate replicated costs 264 ms for this upload, against 38 ms for the control. | Expected (code comment and docs/07): every package inside the limits within 500 ms and +150 MiB, with a measured worst case of about 290 ms and +89 MiB (58 % and 60 %); WP4-FIXB3 target about 70 %. Actual: 611 ms (122 %) and +123 MiB (82 %) on the reference workstation. Linear and bounded; no 5xx; the server stays up. | docs/07 "Workbook import"; `xlsxReader.ts` budget; WP4-RB2-01 (budget with margin); FR-16 | Make inflating cheaper while keeping the over-cap stop: for example a much larger step, or one bounded inflate into the preallocated `data` buffer. Add incompressible content (random text, so the upload is close to the XML size) as a dimension of the adversarial sweep and the worst-case search, together with distinct formulas on dated sheets and decoded kept-attribute floods. Then re-measure and restate the worst case in the code comment and docs/07 EN/VI. If the cost cannot be brought under about 70 %, lower `maxTotalXmlBytes` or `maxCompressedBytes`, or restate the budget, as the coordinator decides. |

- Risks and optional improvements, separate from proven defects:
  - R-B3-1: an encoding declaration that is not first in the part (leading white space), or that is malformed (a `?`
    inside the version, mismatched quotes), is not recognized, so the part is read as UTF-8 (`18-correct.txt`
    LENIENT). Such a part is not well-formed XML anyway, and a misread only changes text into unknown labels
    (skip-only). Optional: refuse an `<?xml` declaration anywhere but at the start, or one the expression cannot
    parse.
  - R-B3-2: memory reaches +117..+123 MiB on formula-dense dated sheets (82 % of the budget, above the 70 % target the
    fix brief set) even when the parts compress. It stays under the budget.
  - R-B3-3 (carried): no per-user preview quota (owner choice I-5 open). Each upload can stall the event loop for the
    time above, so the NAS (three to four times slower, by the code comment's own estimate) would pause about 2 to
    2.5 s per such upload. The NAS is NOT VERIFIED. The dev-only `source-map-js` advisory remains.
  - R-B3-4 (carried): the lenient XML cases listed in WP4_RECHECK_B2 are unchanged and expand nothing.
- Required gates unrun/blocked and why: none of the mandatory area-B checks is unrun. Not rerun, because they are
  outside this brief and WP4-REGATE3 ran them on this digest: the e2e suite and the container drill. The NAS target
  is NOT VERIFIED (no owner access), which also bears on the budget.
- Disposition of previous findings:
  - WP4-RB2-01: the E7 and Y7 mechanisms (double decoding and pinned parts) are **fixed and verified**. The claim "the
    budget holds with margin" is **not met**: WP4-RB3-01 (Low), through incompressible content, an axis neither the
    fix's search nor the gate tried.
  - R-B2-1: **fixed and verified**.
  - R-B2-2: **fixed and verified**, with the lenient cases recorded as R-B3-1.
  - WP4-RB-01, R-RB1, WP4-B-02, R1, R3: still hold, through the suites, the rebuilt probes and the HTTP spot checks.
- Software readiness, owner permission and pilot result separately: software readiness of area B is not accepted until
  WP4-RB3-01 is fixed (or the budget restated) and rechecked on the new digest. Every data-integrity, privacy, decoding
  and report rule of the area held under the probes. Owner pilot permission has not been requested or given. No
  deployment, real data or real mail.
- One next action/prompt: the coordinator dispatches one bounded fix (`handoff/prompts/FIX_FINDINGS.md`) for
  WP4-RB3-01. It should make inflating cheaper and add incompressible content to the adversarial sweep and the
  worst-case search, with red-first tests based on F2-rand100 and A2-rand13amp, then re-measure and restate the worst
  case in docs/07 EN/VI and the code comment (or restate the budget). Then a freeze, a regate and a fresh area-B
  recheck on the new digest.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP4-RECHECK-B3 attempt 1 (board agent ID recorded by the
  coordinator; not observable to the reviewer). Authors of the reviewed snapshot: WP4-FIXB3 (`claude-opus-5-5`), the
  WP4-FIXB3-FREEZE committer, and the WP4-REGATE3 verifier (`claude-sonnet-5-5`). The earlier area-B authors and
  auditors are recorded in WP4_REVIEW_B, WP4_RECHECK_B and WP4_RECHECK_B2.
- Fresh context; confirm reviewer did not author changes: fresh context. This reviewer authored no WP4 change, fix,
  freeze or gate, and ran none of WP4-AUDIT-B, WP4-RECHECK-B or WP4-RECHECK-B2. It wrote only this report pair, the
  Results section of its brief and `evidence/WP4-RECHECK-B3/`. Every hostile workbook was built and kept under the
  task folder; no workbook or binary is in the evidence.
- Source digest before/after; gate evidence for that snapshot:
  `635f909da72873548d93407fb3d250806a7e1c29f101cb32e91234c2c9ec3f7b` before and after (`01-baseline.txt`,
  `99-digest-after.txt`). WP4-REGATE3 PASS on the same commit and digest was treated as a claim and re-executed for
  this area.
- New report path preserving previous review history: `handoff/delivery/WP4_RECHECK_B3.md` and `.vi.md` (new).
  WP4_REVIEW_B, WP4_RECHECK_B, WP4_RECHECK_B2 and all earlier reports are unchanged.
- Finding dispositions and next coordinator fix/recheck task: WP4-RB3-01 (fix or restate), then a fresh WP4 area-B
  recheck on the new digest. The HTTP probe's server child was stopped through its handle (SIGTERM). No container,
  docker command or background process was used or left.
