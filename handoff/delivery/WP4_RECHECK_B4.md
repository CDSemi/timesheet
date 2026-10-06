# Independent review

Translation: [WP4_RECHECK_B4.vi.md](WP4_RECHECK_B4.vi.md).

- Package/date/reviewer and observable model/effort: WP4, fourth fresh independent recheck of area B (data) after fix
  round 4 (WP4-FIXB4: native inflate, a stepped decode, a parse budget derived from the limits, and lowered upload and
  package ceilings). It checks whether WP4-RB3-01 is closed (the stated parse budget now holds with margin for
  compressible and incompressible content) and whether area B still holds. 2026-10-06; task WP4-RECHECK-B4 attempt 1
  (profile timesheet-auditor, requested opus/xhigh, no override); self-reported model `claude-opus-5-5`; effort not
  observable. Authors of the reviewed snapshot: WP4-FIXB4 `claude-opus-5-5`; WP4-DEPCLEAN2 (package.json/lock only);
  the freeze committer and the WP4-REGATE4 verifier (`claude-sonnet-5-5`) authored no source. The reviewer model is not
  weaker than the strongest author. WP4-RECHECK-A attempt 4 ran at the same time in its own folder; no file or process
  was shared and its report was not read.
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness:
  `546cddaf6747aef85e8b6d9b7712de9e28f138bf` (the WP4-REGATE4 `freeze_commit`, on origin/main; HEAD = origin/main).
  Source digest `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081` (775 files, handoff/ excluded) before
  and after, by `scripts/source-digest.mjs` and by the `git ls-tree` form; equal to the gate digest of record. HEAD
  unchanged; the working tree differs only under handoff/. Every check ran on a `git archive` export of that commit
  under the task folder; its five area source files hash-equal the committed blobs (`git hash-object --no-filters`:
  `xlsxReader.ts` f20abaf3, `templateMapping.ts` 96299179, `workbookImport.ts` f2990e38, `routes/imports.ts` 10ac5445,
  `importModel.ts` f8f58d5c). The accepted WP4-T09 reader was exported from `13a258d` into the same task folder.
- Decision: PASS / FIX REQUIRED / NOT VERIFIED: **PASS.** WP4-RB3-01 is closed. The parse budget is now derived from the
  enforced limits, not claimed from searched shapes; the derivation is sound and reproduces independently; and at the
  lowered ceilings every worst construction stays well inside the 500 ms / +150 MiB budget and under the derived bound.
  The WP4-RECHECK-B3 incompressible shapes that stalled for 508-648 ms are now refused in 0-3 ms by the 2 MiB upload
  ceiling. Decode-once, the caps, R-B2-1, R-B2-2, the benign differential and the regression suites all still hold. No
  new defect.
- Scope actually inspected/executed:
  1. Source read at the reviewed commit: `import/xlsxReader.ts` whole (the budget comment and `DEFAULT_READER_LIMITS`,
     `inflateEntry` with the native `inflateRawSync`/`maxOutputLength` stop, `decodeFlat`/`DECODE_STEP` stepped decode,
     `decodeXml`/`SHORT_TEXT`, `ownCopy`, `scanXml` with the per-tag deferred kept-attribute decode, `readWorksheet`'s
     canonical-address fast path), `import/templateMapping.ts` (`scanText`/`MAX_TEXT_SCAN`, `readHolidays`,
     `detectFormulaDefects`, `mapWorkbook`, `previewWorkbook`), `services/workbookImport.ts` (`buildReport`,
     `serializeReport`/`MAX_REPORT_BYTES`, `buildPlan`, `previewImport`), `routes/imports.ts` (`DEFAULT_IMPORT_MAX_BYTES`
     = reader `maxCompressedBytes`, 413 `payload_too_large`), `client/importModel.ts`; the diff `972ccda..546cdda`.
  2. The derivation: the cost formula and its 61-family coefficient measurement (`05`/`06` of WP4-FIXB4), checked for
     every cost driver (inflate, decode, scan, attributes, kept values, mapping, report build and serialization), then
     re-measured independently (my own 61-family run, `20-coeff.txt`) and recomputed by LP duality (`21-bound.txt`).
  3. Canon: docs/07 "Workbook import" and its `.vi.md` (the 2 MiB upload sentence, the derived bound, the coefficients,
     the confirmation), docs/11 EN/VI (2 MiB), docs/03 (no size), WP4_REVIEW, WP4_RECHECK_B3 and its probes, the
     WP4-FIXB4 and WP4-REGATE4 results.
  4. Execution: `npm ci` and `npm run verify` on the export; the four area suites; the FIXB4 worst-construction
     catalogue (23 shapes) in preview and whole-service modes; the WP4-RECHECK-B3 incompressible catalogues rebuilt at
     their old sizes against the new-ceiling reader; an independent coefficient re-measurement and bound recomputation;
     a correctness probe (decode-once, caps, R-B2-1, R-B2-2); the benign two-reader differential against WP4-T09; a
     built-server HTTP probe with `/api/health` polling.
- Evidence table: command | result/exit | evidence (all under `handoff/delivery/evidence/WP4-RECHECK-B4/`, masked, LF):

| Command | Result/exit | Evidence |
|---|---|---|
| `git rev-parse HEAD`; `source-digest.mjs`; `git ls-tree … \| sha256sum` (before) | 546cdda; 26fcc969…9081 (775 files) both ways; exit 0 | `01-baseline.txt` |
| `npm ci` (export of 546cdda; export of 13a258d) | added packages; 1 high advisory (dev-only `source-map-js`, carried); exit 0 and 0 | `02-npm-ci.txt`, `03-t09-npm-ci.txt` |
| `npm run verify` (`--trace-deprecation --pending-deprecation`) | typecheck, lint, 76 files / 1758 tests, build, SMOKE PASSED (41 PASS); no deprecation line; exit 0 | `04-verify.txt` |
| `vitest run` workbook-reader, workbook-import, opening-balance, sharing-matrix | 4 files, 131 tests passed; exit 0 | `05-suites.txt` |
| `run-cost.mjs` CASES=`worst.mjs` `--run` (23 worst constructions at the ceilings, 3 runs) | all accepted, all inside every ceiling; worst single run 89 ms and +71 MiB; no OVER-BUDGET, nothing thrown; exit 0 | `14-worst-run.txt` |
| `run-cost.mjs` CASES=`worst.mjs` `--full` (whole `previewImport`, 2 runs) | all accepted; worst 90 ms and +46 MiB; no OVER-BUDGET, nothing thrown; exit 0 | `16-worst-full.txt` |
| `run-cost.mjs` CASES=`rcb3-cases(2).mjs` `--run` (old sizes, new-ceiling reader, 2 runs) | 210 refused (`package_too_large`/`part_too_large`/`too_many_elements`/`total_xml_too_large`) in 0-3 ms; 2 accepted (the realistic 2000-holiday report, 35 ms/+16 MiB); no OVER-BUDGET, nothing thrown; exit 0 | `15-rcb3.txt` |
| `coeff.mjs` (61 families, chosen env, 3 runs) + `bound.mjs 3145728 100000 500000` | 61 `@@` units; recomputed bound 105.5 ms and +90.8 MiB (21 % and 61 % of budget), same worst-mix; exit 0 | `20-coeff.txt`, `21-bound.txt` |
| `correct.mjs` | 75 PASS, 0 FAIL; 3 LENIENT (R-B3-1); exit 0 | `18-correct.txt` |
| `diff-build`/`diff-dump` (both exports)/`diff-compare` | reader cells byte-identical (1055 and 7403); preview identical after dropping `sourceCount`; stored report identical after dropping `sourceCount` and the post-T09 `rules[3..7]` text (168 days, 12 floating flags, 23 holiday days, 44 findings, 49 decisions); compare exit 1 by design | `17-differential.txt` |
| `http.mjs` (built server, OS-assigned free port, capture, JOB_RUNNER=off) | template 201/24 ms, realistic 12-sheet 201/26 ms; 5.4 MB incompressible → 413 in 3 ms; worst at-ceiling 201/77 ms; worst `/api/health` 78 ms, no non-200, no 5xx, 0 server error lines; server stopped via its handle | `19-http.txt` |
| digest after; export/source identity | unchanged; five area files hash-equal the commit blobs; no non-handoff working-tree change | `99-digest-after.txt` |

  Results by scope item:
  - **1 The derivation is sound (WP4-RB3-01 closed).**
    - Formula: time <= 40 ms + 14.8 ns·X + 339 ns·O, memory <= 15 MiB + 13.3 B·X + 428 B·O (X decoded XML bytes, O
      markup openings; attributes priced at zero because each costs less than its own bytes). Prices come from the 61
      measured unit families by linear-programming duality, so no mix of those units within the limits costs more. At
      the chosen ceilings (X = 3 MiB, O = 100 000) the bound is about 121 ms and +95 MiB (24 % and 63 % of the budget).
    - Every cost driver is in the formula or confirmed by the whole-service run: inflate (the `bytes-*` families, native
      `inflateRawSync` into one buffer), decode (`kept-text-refs/amp/bare-amp` families, stepped over `DECODE_STEP` for
      parts above 512 KiB), scan (`openings`, `attributes`), attributes and kept values (`kept-cell-max`, `values`,
      `kept-attributes`, `kept-attribute-flood`, the A2 shape), mapping (the probe measures reader + mapping together),
      and report building + serialization (the `--full` run measures the whole `previewImport`, and the report is
      bounded by `MAX_REPORT_BYTES` = 2 MiB and `MAX_TEXT_LENGTH` = 200).
    - Independent confirmation by measurement. I re-ran the 61-family coefficient measurement on this host and
      recomputed the bound by LP duality: 105.5 ms and +90.8 MiB, the same worst-mix (empty kept cells +
      formulas-rand100-wide), both under the budget with 79 % and 39 % margin — consistent with the stated 121 ms /
      +95 MiB, which is the slightly more conservative envelope. The 23 worst constructions at the ceilings (an
      incompressible part at each per-unit limit, incompressible content at the XML, opening, attribute and 2 MiB
      upload ceilings, the bound's own worst mixes, and the recheck's costliest shapes rebuilt) all stayed inside every
      ceiling and well under budget: worst preview single run 89 ms and +71 MiB, worst whole-service run 90 ms and
      +46 MiB. No overshoot of the stated figures (the stated worst single run was 114 ms / +72 MiB bar one 149 ms
      outlier; mine were lower).
  - **2 The ceilings hold.** The route upload limit is `DEFAULT_READER_LIMITS.maxCompressedBytes` = 2 MiB and answers
    413 `payload_too_large` above it (HTTP probe: a 5.4 MB incompressible package → 413 in 3 ms, `/api/health` 2 ms).
    The client message is "2 MiB" (`importModel.ts`); docs/07 and docs/11 EN and VI say 2 MiB; docs/03 states no size;
    the only "8 MiB" strings left are the code/doc notes that the earlier ceilings were lowered. A realistic workbook
    fits with room: the tracked template (26 KB) previews 201 in 24 ms, a 12-dated-sheet workbook (85 KB) 201 in 26 ms,
    and the documented 61-dated-sheet maximum (0.33 MB upload, 1.4 MB XML, 53 400 openings) sits at 2-6x inside every
    ceiling. (Three years of biweekly sheets, 78, exceed the pre-existing 64-sheet cap `maxSheets`, unchanged by this
    fix — see R-B4-3.)
  - **3 Correctness and regression — hold.**
    - Decoding happens once and the cap refuses rather than truncates: 75 PASS / 0 FAIL, including nested
      entities (`&amp;amp;`→`&amp;`, `&#38;#65;`→`&#65;`), CDATA kept literal, a reference split by a comment not
      joined, kept attributes decoded once, and 255-character values kept whole while 256 refuse the package
      (`attribute_too_large`). The incompressible catalogues are refused as `package_too_large`/`part_too_large`/
      `too_many_elements`/`total_xml_too_large`, never truncated.
    - R-B2-1 holds: two holidays sharing their first 300 characters both show the same 200-character name, yet the
      floating flag comes from the matched holiday itself (`matchedHoliday`), so only the floating one is floating.
      R-B2-2 holds: nine non-UTF declarations are refused `unsupported_encoding` in each of the five parsed parts.
    - The differential against WP4-T09 (13a258d) is identical after dropping `sourceCount` for the reader cells
      (byte-identical) and the preview; the stored report additionally differs only in `rules[3..7]` — the `not_due`
      rule and reworded conflict rules added after T09 and accepted at the earlier gates, not a reader or mapping
      change. All 168 days, 12 floating flags, 23 holiday days, 44 findings and 49 decisions are identical.
    - `npm ci` and `npm run verify` pass (1758 tests, no deprecation line), and the four area suites pass (131 tests;
      up from 128 as WP4-FIXB4 added the ceiling-pin tests). Over HTTP every upload is 201 or 413, never 5xx, and
      `/api/health` stays responsive (worst 78 ms).
- Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix:

  None. No observed defect.

- Risks and optional improvements, separate from proven defects:
  - R-B4-1 (carried R-B3-1): an `<?xml?>` encoding declaration that is not first in the part (leading white space) or
    is malformed (a `?` in the version, mismatched quotes) is not recognised, so the part is read as UTF-8 (3 LENIENT
    cases in `18-correct.txt`). Such a part is not well-formed anyway and a misread only turns text into unknown labels
    (skip-only). Optional: refuse an `<?xml` declaration anywhere but at the start.
  - R-B4-2 (carried R-B3-3): there is still no per-user preview quota (owner choice I-5 open), and the NAS target is
    NOT VERIFIED (no owner access). The budget was measured on this workstation only; at the code comment's own 3-4x
    NAS factor the worst preview (about 90 ms here) is roughly 0.3-0.4 s on the NAS — a pause, not a hang, and the
    upload ceiling now bounds it. The dev-only `source-map-js` high advisory remains (not shipped).
  - R-B4-3: a workbook with more than 64 sheets (e.g. three years of biweekly dated sheets, 78) is refused by the
    pre-existing `maxSheets` cap, unchanged by this fix. The owner's real workbooks are one period at a time; not a
    regression. Optional if multi-year single-file import is ever wanted.
  - R-B4-4: the derived bound's LP prices cover the 61 measured unit families; a unit kind not among them could in
    principle cost more per byte or per opening than the prices. The worst-construction sweep and every earlier probe
    family stayed under the bound, and the 2 MiB upload ceiling binds first on incompressible content, so I found no
    uncovered costly unit; this is a residual assumption, not an observed defect.
- Required gates unrun/blocked and why: none of the mandatory area-B checks is unrun. Not rerun here because they are
  outside this brief and WP4-REGATE4 ran them on this digest: the e2e suite and the container drill. The NAS target is
  NOT VERIFIED (no owner access), which also bears on the budget.
- Disposition of previous findings:
  - WP4-RB3-01 (the budget did not hold for incompressible content): **fixed and verified.** The budget is now derived
    from the limits and reproduces independently; the costliest WP4-RECHECK-B3 shape (F2-rand100-d2-wide, 611 ms before)
    is refused `package_too_large` in 0 ms, and the worst accepted construction is 89-90 ms and +71 MiB, well inside
    budget. The code comment and docs/07 and docs/11 (EN/VI) state the derived bound and the 2 MiB ceilings.
  - WP4-RB2-01, R-B2-1, R-B2-2: still **fixed and verified**; the lenient encoding cases remain as R-B4-1.
  - WP4-RB-01, R-RB1, WP4-B-02, R1, R3: still hold, through the suites, the rebuilt probes and the HTTP spot checks.
- Software readiness, owner permission and pilot result separately: software readiness of area B is met at this digest:
  WP4-RB3-01 is closed and every data-integrity, privacy, decoding, budget and report rule of the area held under the
  probes and the suites. Owner pilot permission has not been requested or given. No deployment, no real data, no real
  mail; the NAS target is NOT VERIFIED.
- One next action/prompt: the coordinator records WP4-RECHECK-B4 PASS and proceeds with the WP4 package acceptance /
  the next roadmap action; no area-B fix is outstanding. Carry R-B4-1..R-B4-4 as risks.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP4-RECHECK-B4 attempt 1 (board agent ID recorded by the
  coordinator; not observable to the reviewer). Authors of the reviewed snapshot: WP4-FIXB4 (`claude-opus-5-5`),
  WP4-DEPCLEAN2 (package.json/lock only), the WP4-FIXB4-FREEZE committer and the WP4-REGATE4 verifier
  (`claude-sonnet-5-5`). Earlier area-B authors and auditors are recorded in WP4_REVIEW_B, WP4_RECHECK_B,
  WP4_RECHECK_B2 and WP4_RECHECK_B3.
- Fresh context; confirm reviewer did not author changes: fresh context. This reviewer authored no WP4 change, fix,
  freeze or gate, and ran none of WP4-AUDIT-B, WP4-RECHECK-B, WP4-RECHECK-B2 or WP4-RECHECK-B3. It wrote only this
  report pair, the Results section of its brief and `evidence/WP4-RECHECK-B4/`. Every hostile workbook was built and
  kept under the task folder; no workbook or binary is in the evidence.
- Source digest before/after; gate evidence for that snapshot:
  `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081` before and after (`01-baseline.txt`,
  `99-digest-after.txt`). WP4-REGATE4 PASS on the same commit and digest was treated as a claim and re-executed for
  this area.
- New report path preserving previous review history: `handoff/delivery/WP4_RECHECK_B4.md` and `.vi.md` (new).
  WP4_REVIEW_B, WP4_RECHECK_B, WP4_RECHECK_B2, WP4_RECHECK_B3 and all earlier reports are unchanged.
- Finding dispositions and next coordinator fix/recheck task: no finding; WP4-RB3-01 closed. No further area-B fix or
  recheck is required at this digest. The HTTP probe's server child was stopped through its handle (SIGTERM); no
  container, docker command or background process was used or left.
