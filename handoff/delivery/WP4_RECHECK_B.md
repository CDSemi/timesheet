# Independent review

Translation: [WP4_RECHECK_B.vi.md](WP4_RECHECK_B.vi.md).

- Package/date/reviewer and observable model/effort: WP4, fresh independent recheck of area
  B (data) after the fix round (WP4-B-01, WP4-B-02, R1, R3, and that area B holds on the new
  freeze); 2026-10-06; task WP4-RECHECK-B attempt 1 (profile timesheet-auditor, requested
  opus/xhigh); self-reported model `claude-opus-5-5`; effort not observable. The strongest
  WP4 author model is `claude-opus-5-5`; the WP4-FIXB/FIXA authors reported
  `claude-sonnet-5-5` and the WP4-REGATE verifier `claude-sonnet-5-5`, so the reviewer model
  is not weaker than any author of the reviewed snapshot. WP4-RECHECK-A ran at the same time
  in its own folder; no file or process was shared.
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness:
  `0f7fba2ee6bc2a7affcd1a3bf800e085351c7b65` (the WP4-REGATE `freeze_commit`). Source digest
  `dfe4541d2c6c908a00782ed9fbe2fb7a3be48ea18aa9fc23ae1ced9085b86742` (775 files, handoff/
  excluded) before and after, by `scripts/source-digest.mjs` and the `git ls-tree` form on
  both HEAD and the commit; equal to the gate digest of record. HEAD unchanged; outside
  handoff/ the working tree equals the commit (no non-handoff change, tracked or untracked).
  Source complete: every check ran on a `git archive` export of that commit under
  `D:\.claude-tmp\timesheet\WP4-RECHECK-B` (outside Dropbox); the four audited files in the
  export hash-equal the commit blobs (`10-export-integrity.txt`).
- Decision: PASS / FIX REQUIRED / NOT VERIFIED: **FIX REQUIRED.** WP4-B-02, R3 and R1 are
  closed and the rest of area B still holds, but WP4-B-01 is **not** closed: a small upload
  that respects every enforced limit can still block the event loop for seconds and allocate
  hundreds of megabytes to a gigabyte, and the stored report is still unbounded in cell
  values (holiday names, labels, inline strings) — up to a 100 MiB `report_json` stored from
  a 28 KB upload, or a 500 `internal_error` from a 50 KB upload. One finding reopens
  WP4-B-01 (RB-01, Medium) with two mechanisms.
- Scope actually inspected/executed:
  1. Source read at the reviewed commit: `import/xlsxReader.ts` (the new per-part byte limit,
     the element/cell/row/shared-string pre-scan `scanElements` and its `ELEMENT_OPENING`
     regex, the inflate budget, the DOM build), `import/templateMapping.ts` (`finalizeFindings`
     with `MAX_FINDING_SOURCES`/`MAX_FINDINGS_PER_CODE`, `readHolidays` with `MAX_HOLIDAY_ROWS`,
     `detectFormulaDefects`, `mapWorkbook`), `services/workbookImport.ts` (`planPeriod` `not_due`,
     `IMPORT_RULES`, `previewImport` stores the whole report), `services/otLeave.ts`
     (`reserveOtLeave` R1 guard, `insideImportedPeriod`), `services/automation.ts` (`dueAtUtc`
     comparison), the client `api.ts`/`importModel.ts` `not_due`/`period_not_due` labels, and
     `app.ts`. fast-xml-parser 5.11.2 `readTagExp`/`resolveNameSpace` (what tag names it parses).
  2. Canon: docs/03 (imports, opening balance, API boundary, "validated upload types/sizes"),
     docs/07 "Workbook import" (the limits sentence and the I-3 safe default), docs/10 (the
     2026-10-06 WP4 import decision, I-3), WP4_REVIEW_B, the WP4-FIXB/FIXA/REGATE results,
     the WP4-AUDIT-B probes.
  3. Execution: `npm ci` and `npm run verify` on the export; the six area B suites; four own
     probes (an in-memory cost suite rebuilding the audit's P1b/B-02/P7 plus my own hostile
     packages; a single-part mechanism probe; a built-server HTTP probe with a concurrent
     health check; a template-structure read).
- Evidence table: command | result/exit | evidence (all under
  `handoff/delivery/evidence/WP4-RECHECK-B/`, masked, LF; Node v24.21.0 by full path; Git
  Bash only; capture mode, `JOB_RUNNER=off`; `DATA_DIR` and `DATABASE_PATH` explicit under the
  task folder for every CLI and server run; precommit check over the evidence: PASS, 13 files,
  0 findings):

| Command | Result/exit | Evidence |
|---|---|---|
| `git rev-parse HEAD`; `source-digest.mjs`; `git ls-tree … \| sha256sum` (before) | 0f7fba2; dfe4541d…6742 (775 files) both ways, HEAD and commit; exit 0 | `01-baseline.txt` |
| `npm ci` (export) | 169 packages; 1 high advisory (source-map-js, dev only); no deprecation line; exit 0 | `02-npm-ci.txt` |
| `npm run verify` (export, `--trace-deprecation --pending-deprecation`, `DATA_DIR` exported) | typecheck, lint, 76 files / 1734 tests, build, SMOKE PASSED; no deprecation line; exit 0 | `03-verify.txt` |
| `vitest run` workbook-import, workbook-reader, opening-balance, sharing-matrix, ot-leave, client importModel | 6 files, 176 tests passed; exit 0 | `04-suites.txt` |
| `node probes/r1-cost.mjs` (build child + fresh run child per case, in memory) | audit P1b/B-02/P7 all refused fast with bounded RSS; template, 26- and 60-sheet workbooks accepted; my hostile element-shape, attribute and big-string packages accepted at seconds / 0.3–1.4 GiB, or a report of 24–143 MiB, or a `JSON.stringify` `RangeError` | `05-r1-cost.txt`, `probe-r1-cost.mjs.txt` |
| `node ../probes/r2-http.mjs` (built server, concurrent `/api/health`) | the audit packages refused in 3–12 ms with health at 2 ms; H2a 201 in 3221 ms, health waited 2920 ms; H4b 201 in 5073 ms, health 4772 ms; H5d 201 storing a 99.81 MiB `report_json`; H5b 500 `internal_error` after 5172 ms, server logs `RangeError: Invalid string length`, server stays up; exit 0 | `06-r2-http.txt`, `probe-r2-http.mjs.txt` |
| `node probes/r3-bypass.mjs` (one ~3.8 MiB part, under every limit) | `<c/>`/`<row/>` refused; `<1/>`, `<9/>`, `< />`, `<.a/>` and a 3.8 MiB-attribute `<c>` all accepted at 0.6–1.1 s and 0.3–0.59 GiB for a 26 KB–1 MB upload | `07-r3-bypass.txt`, `probe-r3-bypass.mjs.txt` |
| digest after; export integrity | unchanged; template hash `47ef42d5…6331`; four audited files hash-equal the commit | `09-digest-after.txt`, `10-export-integrity.txt` |

  Results by scope item:
  - **1 Each finding is closed.**
    - **WP4-B-02 — closed.** The audited case (150,000 Holiday Dates cells, 692 KB) is now
      refused `422 workbook_rejected`/`part_too_large` in 7–13 ms, never 500 (in memory and
      over HTTP). A holiday sheet of 40,000 real cells under the part limit previews cleanly.
      2,001 date rows in A/B are refused `too_many_holidays`; a sparse far row `A9999999`
      (and combined `A/B/C` far rows) previews in under 30 ms — the `readHolidays` loop now
      takes its rows from the cells that exist, with no spread and no far-row loop. `verify`
      includes the B-02 tests (150,000 cells previewed under raised limits, 422 under the
      defaults, sparse far row fast).
    - **WP4-B-01 — NOT closed (see finding RB-01).** The three audited packages are fixed:
      the 65 KB `<c/>` package and the 113 KB `<c><v>1</v></c>` package are refused
      `part_too_large` in 4–6 ms at ~82 MiB; the 2.7 MB formula-heavy P7 package is refused
      `part_too_large`, the 6.2 MB seven-sheet one `total_too_large`; `/api/health` stays at
      2 ms through each refusal. The tracked template and a 60-dated-sheet workbook are
      accepted in 20–170 ms at under 120 MiB. But the finding's own wording — "the parse cost
      of a small upload inside every reader limit is unbounded in time and memory, and the
      stored report grows with it" — still holds for packages the fix does not bound (RB-01).
  - **2 The new guards are correct.**
    - **R3 (`not_due`) — PASS.** `planPeriod` sets `not_due` when the period has ended but
      `period.dueAtUtc > nowSeconds`, matching the deadline scan's own rule
      (`automation.ts:200`, the due instant itself counts as due). It is skip-only: the only
      allowed action is `skip`, `importable_days` is 0, the stored `IMPORT_RULES` carry the
      due-instant rule, an explicit `import` of such a day is `422 decision_not_allowed`, and
      at the exact due instant the state flips to `new` and no decision is needed — all
      asserted by the suite (`workbook-import … red-first (R3)`), including that nothing is
      written while `not_due`. I-3 judgment: within the canonical rules. The owner's I-3 (a)
      is "a period that has not ended cannot be imported"; `not_due` only makes that stricter
      for the few days between a period's end and its payroll due instant, is recorded in
      docs/10 as a conservative, owner-reversible coordinator decision, and preserves F-2 (an
      imported period can no longer be signed, so an import must not pre-empt the live
      period). It changes no confirmed requirement.
    - **R1 — PASS.** `reserveOtLeave` throws `importedPeriodError()` (409 `imported_period`)
      for a leave date inside an `imported_unverified` period, after the idempotent
      duplicate check and before the balance check, so nothing is reserved; the record-use
      guard stays as defence in depth. The ot-leave suite asserts the reservation is 409 and
      creates nothing, and that using a reservation that predates an import is also 409.
  - **3 Regression — holds.** `npm ci` and `npm run verify` on the export pass (76 files,
    1734 tests, SMOKE PASSED, no deprecation line). The workbook-import, workbook-reader,
    opening-balance, sharing-matrix, ot-leave and client importModel suites pass (176 tests).
    Ownership 404s, idempotency, the two-connection races, the F-2 guards, the opening
    balance and the client are exercised by those suites and unchanged by the fix. The fix
    diff since 13a258d is confined to the FIXB/FIXA paths (verified by the digest and the
    non-handoff working-tree equality).
  - **4 Docs sync (docs/07, docs/10) — accurate as written, but see RB-01.** docs/07's
    workbook-import paragraph states the limits (4 MiB of XML per part, 16 MiB per package,
    caps on elements, cells, rows and shared strings, >2,000 holiday rows → 422, capped
    findings) and the `not_due` safe default; every number matches `DEFAULT_READER_LIMITS`,
    `MAX_HOLIDAY_ROWS` and `finalizeFindings`. docs/10's 2026-10-06 entry matches the code and
    is marked reversible. The docs describe the limits truthfully; the overclaim that the
    limits bound the work is in `xlsxReader.ts`'s own header comment, part of RB-01, not a
    separate docs defect.
- Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix:

| ID | Severity | File/function | Reproduction | Expected / actual | Rule/AC | Bounded fix |
|---|---|---|---|---|---|---|
| RB-01 | Medium (reopens WP4-B-01) | `src/server/import/xlsxReader.ts` `scanElements`/`ELEMENT_OPENING` and `inflateEntry` (byte-only bound once the scan undercounts); `src/server/import/templateMapping.ts` `readHolidays`/`readPeriod` and `previewImport` storing the whole report (cell values uncapped) | **(a) Parse cost.** One ~3.8 MiB worksheet part (26 KB upload, under the 4 MiB per-part and 16 MiB package limits) filled with `<1/>`, `<9/>`, `< />` or `<.a/>` — tag names `ELEMENT_OPENING` does not match but fast-xml-parser parses — previews in 0.6–0.9 s at 0.3–0.59 GiB (`r3-bypass`); the same filled with `<c/>` is correctly refused. Four such parts (33 KB upload, H2a) → 201 after 3221 ms with `/api/health` blocked 2920 ms (`r2-http`), ~1.4 GiB in memory (`r1-cost`). A single `<c>` with 3.8 MiB of attributes (scan counts one element) → 1.1 s / 0.55 GiB; four parts (4.19 MB, H4b) → 201 after 5073 ms, health blocked 4772 ms. **(b) Report size / crash.** A 1 MiB shared string referenced by 100 holiday names (28 KB upload, H5d, every limit respected) → a 99.81 MiB `report_json` stored and returned; a 4 MiB shared string × 2,000 holiday names (50 KB upload, H5b) → `500 internal_error` after 5172 ms, server logs `RangeError: Invalid string length` (server stays up); 3 dated sheets with a 4 MiB inline-string label (56 KB, H6a/b) → a 24–143 MiB report. | Expected: the reader's limits bound the CPU time, memory and stored-report size an untrusted package inside them can cause, as `xlsxReader.ts:21-25` and docs/07 claim; a package is refused before large allocations. Actual: (a) the pre-scan regex requires a tag name starting with `[A-Za-z_]`, so digit-, dot-, punctuation- and space-prefixed openings (which fast-xml-parser still builds into a DOM) and element attributes are never counted — the 4/16 MiB byte limits are the only bound, and ~16 MiB of such markup builds a multi-million-node DOM that blocks the single event loop for seconds and grows RSS by hundreds of MiB to >1 GiB (a small NAS, the docs/07 target, may OOM). (b) `MAX_FINDING_SOURCES` caps only the `sources` address lists; holiday names, day labels and inline-string cell values are stored and returned in full, so the report (`imports.report_json`, which the schema never deletes) is unbounded and large values crash mapping/serialization with a 500. | docs/03 "validated upload types/sizes"; docs/07 "Workbook import" (the limits "refuse … and the findings it returns are capped"); `xlsxReader.ts:21-25`; FR-16; WP4-PLAN T08; WP4_REVIEW_B WP4-B-01 | In `scanElements`, count every `<` that opens a tag for the element total (match any non-`/`, non-`!`, non-`?` character after `<`), not only `[A-Za-z_]`-led names, so uncounted markup cannot reach the DOM; cap attributes per part cheaply (for example reject a part whose `=` or attribute count exceeds a bound), or lower `maxPartXmlBytes`/`maxTotalXmlBytes` so the worst uncounted DOM is bounded. Cap the stored and returned length of each cell value kept in the report (holiday name, label, inline string) — for example truncate to a few hundred bytes with a flag — so `report_json` size is bounded whatever the cell content, and `mapWorkbook`/`JSON.stringify` cannot throw. Add red-first tests from `r1-cost`/`r3-bypass`/`r2-http` (a `<1/>`-filled part refused or bounded; a big-shared-string/inline-string package giving a bounded report, never 500). |

- Risks and optional improvements, separate from proven defects:
  - R-RB1: `previewWorkbook` catches `WorkbookRejectedError` and answers 422, but RB-01 (b)
    shows an accepted package can still throw a plain `RangeError` out of `mapWorkbook`/report
    building, which the route reports as 500. A defensive 422/413 on any report-building
    failure (not only `WorkbookRejectedError`) would avoid the 500 even before RB-01's value
    cap lands. Not a separate defect; folded into RB-01's fix.
  - R-RB2 (carried from WP4_REVIEW_B R4): previews and their source files are kept with no
    per-user quota; with RB-01 (b)'s large reports, repeated distinct uploads grow the
    database and data folder. Open owner choice I-5 (recommended: at most 20 uncommitted
    previews per person). Not a defect.
  - R-RB3: WP4_REVIEW_B R1 and R2 are addressed/retained — R1 (reserve inside an imported
    period) is now 409 (fixed, above); R2 (a `can_commit`-style preview that then 409s) is a
    client-locked presentation nuance, unchanged, acceptable.
  - R-RB4: `npm audit` reports one high advisory in `source-map-js` (dev-only), outside area B.
- Required gates unrun/blocked and why: none of the mandatory area-B checks is unrun. The
  full e2e suite and the container drill are outside this recheck's brief (WP4-REGATE ran them
  on this digest: e2e 145 passed/5 skipped, drill 208 PASS). The NAS target is NOT VERIFIED
  (no owner access), which also bears on RB-01's OOM risk on a small device.
- Disposition of previous findings:
  - WP4-B-02: **fixed and verified.** R1, R3: **implemented and correct.**
  - WP4-B-01: **not closed.** The specific audited packages are refused, but the finding's
    class (unbounded parse cost and report growth for a small in-limits upload) persists via
    RB-01; a further fix round and recheck are required.
  - The I-3 `not_due` default, the docs/07 and docs/10 syncs, and the client labels: accurate
    and within canon.
- Software readiness, owner permission and pilot result separately: software readiness of
  area B is not accepted — RB-01 reopens WP4-B-01 and must be fixed and rechecked on a new
  digest. Every data-integrity and privacy rule of the area held under the probes (no cross-
  owner access, idempotency, F-2 guards, opening balance, client lock). Owner pilot
  permission has not been requested or given. No deployment, real data or real mail.
- One next action/prompt: the coordinator dispatches one bounded fix task
  (`handoff/prompts/FIX_FINDINGS.md`) for RB-01 in `xlsxReader.ts` (count all tag openings and
  bound attributes) and `templateMapping.ts`/`workbookImport.ts` (cap stored cell-value length
  and never 500 on report building), with red-first tests from this recheck, then a freeze, a
  regate and a fresh area-B recheck on the new digest.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP4-RECHECK-B attempt 1. Authors
  of the reviewed snapshot: WP4-FIXB and WP4-FIXA (both reported `claude-sonnet-5-5`); the
  earlier area authors (T02/T08/T09/T10/T11, WP4-DEC) and the WP4-AUDIT-B auditor are recorded
  in WP4_REVIEW_B. The WP4-REGATE verifier reported `claude-sonnet-5-5`.
- Fresh context; confirm reviewer did not author changes: fresh context; this reviewer
  authored no WP4 change, freeze, gate or earlier audit (including the first area-B audit). It
  wrote only this report pair, the Results section of its brief and
  `evidence/WP4-RECHECK-B/`. All probes ran in memory or against a throwaway built server
  under the task folder; no workbook was written into the repository and the template hash is
  unchanged.
- Source digest before/after; gate evidence for that snapshot:
  `dfe4541d2c6c908a00782ed9fbe2fb7a3be48ea18aa9fc23ae1ced9085b86742` before and after
  (`01-baseline.txt`, `09-digest-after.txt`); WP4-REGATE PASS on the same commit and digest,
  treated as a claim and re-executed for this area.
- New report path preserving previous review history: `handoff/delivery/WP4_RECHECK_B.md` and
  `.vi.md` (new). WP4_REVIEW_B and all earlier reports are unchanged.
- Finding dispositions and next coordinator fix/recheck task: RB-01 (fix; reopens WP4-B-01);
  WP4-B-02, R1, R3 closed. Next: one bounded fix of `xlsxReader.ts`/`templateMapping.ts`/
  `workbookImport.ts`, then a fresh WP4 area-B recheck on the fixed digest. No runaway process
  or background task was left; every probe ran in the foreground and the built server was
  stopped through its handle.
