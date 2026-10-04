# Independent review

Translation: [WP2_RECHECK_B4.vi.md](WP2_RECHECK_B4.vi.md).

- Package/date/reviewer and observable model/effort: WP2, final recheck of area B (workspace, admin, UI and integration) after the third fix round; 2026-10-04 (UTC); task WP2-AUDIT-B4 attempt 1 (board kind `audit`, profile timesheet-auditor). Self-reported model `claude-opus-5-5`; the board requested xhigh effort, and the actual effort is not observable. The strongest author model in the snapshot is opus (`claude-opus-5-5`, WP2-T02 and WP2-T03 per the board). The third-round fix author WP2-FIXB3, its committer WP2-FIXB3-FREEZE and the WP2-GATE4 verifier ran on sonnet (`claude-sonnet-5-5`). The reviewer model is therefore not weaker. WP2-AUDIT-A2 (attempt 3) ran at the same time in its own clone, and no files were shared.
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness:
  - Reviewed commit: `5fafeaee72509c6110a907458643bf7582dad81a`, the WP2-GATE4 `freeze_commit`, equal to origin/main.
  - Source digest: `e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df` (613 files, handoff/ excluded). It was the same before (11:58Z) and after (12:21Z), in the project folder and in the scratch clone. It matches the `git ls-tree` cross-check and the gate digest.
  - Project HEAD was the reviewed commit before and after, and nothing changed outside handoff/.
  - Source complete: every command ran in a git clone of that commit on C: (outside Dropbox). A second clone at a3d1b65 served only for the computed-style comparison and the oracle control. Both clones were deleted afterwards.
- Decision: PASS / FIX REQUIRED / NOT VERIFIED: **PASS.**
  - WP2-B3-01 is fixed for the whole literal class: zero raw literals remain in declarations, WP2-introduced or not.
  - The computed styles are identical to a3d1b65 on 91 live screen states (every committed screenshot point plus 20 interactive and media states per project). A mutant control shows that the probe detects a change.
  - WP2-B3-02 is fixed: the oracle throws for folds and gaps as documented, the unit tests cover both, and it imports nothing.
  - No area-B regression. `npm run verify` and `npm run test:e2e` (both projects) pass. B-01, B-02, B2-01, B2-02, the payroll-exception screen and F1 still hold.
  - No finding. The optional improvements below are not defects.
- Scope actually inspected/executed:
  1. Diff a3d1b65..5fafeae. Outside handoff/ it touches exactly three files: `src/client/styles.css`, `tests/client/zoneOracle.ts` and `tests/client/zoneOracle.test.ts`. The built client JavaScript of both commits is byte-identical except the source-map file name, so only the CSS differs.
  2. WP2-B3-01, with my own scanner (`literal-scan-b4.mjs.txt`, written for this audit, not derived from the WP2-FIXB3 inventory script):
     - It parses every rule, including nested `@media` blocks. In every declaration that is not a custom-property definition it removes `var(--x)` references, then lists numbers with or without a unit, hex colours, colour functions and named colours. Exclusions per the brief: bare `0`, unitless `1`, `100%`, keywords. It also reports `var()` fallbacks, at-rule preludes, undefined tokens and unused tokens.
     - Result at 5fafeae: 431 declarations, 0 declarations with a literal, 0 occurrences, 0 WP2-introduced; 0 `var()` fallbacks; every referenced token is defined.
     - Sensitivity: the same scanner on a3d1b65 finds 60 declarations / 67 occurrences / 37 absent from WP1. That reproduces the WP2-FIXB3 "before" inventory exactly, and it includes all twelve WP2-B3-01 lines.
     - What stays literal: the six `@media` preludes. Two have no number, and four hold the 767/768 px breakpoint, documented in the stylesheet header because custom properties cannot drive media queries. Token definitions (69, of which 21 are new in this fix) carry the values by design.
     - Static equivalence (`resolve-equiv.mjs.txt`): every `var()` resolved against `:root` in the light, dark and reduced-motion contexts gives the same 431 declarations as a3d1b65, so 1293 resolved values with 0 differences. A mutant copy gives 24 differences.
  3. Computed styles on live screens, my own probe (`audit-b4-capture.ts.txt`, `zz-audit-b4-states.spec.ts.txt`, `instrumented-copy.txt`):
     - The committed e2e suite ran unmodified, except that its screenshot calls were wrapped in a scratch copy. Every committed `page.screenshot` point (26 named screens per project) became a capture point: login, timesheet and timesheet view, upcoming days, batch conflict and reason, the day editor in ten states (breaks, display-zone default, DST fold, DST gap, zone change, overnight, partial leave, OT mismatch, reason prompt, mobile fit), Clock-out dialog, OT after use, history, settings preview, holiday issue and preview, admin accounts and payroll, and both isolation screens.
     - A probe spec added 20 states per project: keyboard focus ring, button hover and pressed (`:active`), navigation and row hover, the batch bar with and without a selection (disabled buttons), all five status shapes (the error triangle injected, because only a calculation error renders it), dark colour scheme on timesheet, day editor, OT, history, settings and admin, reduced motion, the OT export-link hover, and the disabled payroll-exception button.
     - Each capture waited 1.2 s, then recorded every visible element (plus the dialog `::backdrop`): DOM path, box, own text and 80 computed properties. The same suite ran at a3d1b65 and at 5fafeae: 78 passed, 2 skipped each.
     - Result (`style-compare.txt`): 91 screen states, 26,377 elements, 2,162,914 values, **0 style differences**, 0 structure differences. All 48 geometry differences are the admin account cards whose order and names change between runs (the h3 widths and the badge next to them). The 314 content differences are clock times, generated UUIDs and generated synthetic e-mail addresses.
     - Mutant control (`style-compare-mutant.txt`): five tokens edited in the built CSS (`--space-row`, `--press-offset`, `--opacity-disabled`, `--order-first`, `--letter-spacing-tight`). The comparison then reports 10,978 style differences (padding 10,404, letter-spacing 350, opacity 193, order 25, pressed transform 2). The CSS was restored to sha256 prefix 957a13dd28eb9741.
     - The distinct computed values of the tokenized properties (font-weight 600, the four letter-spacing values, line-heights, 0.3 s and the reduced-motion 1e-05 s durations, opacity 0.6, the diamond and pressed transforms, triangle and `.sr-only` clip paths, order −1, 4 px and 50 % radii) are identical at both commits (`target-values.txt`).
  4. WP2-B3-02 (`oracle-check-b4.mjs.txt`):
     - Independence: `tests/client/zoneOracle.ts` has 0 import statements, 0 dynamic imports or requires, and no `src/` reference.
     - Behaviour against an exhaustive reference built by a different algorithm (an hourly scan for transitions, then a wall-text map of every UTC minute ±72 h). Ten zones (Los Angeles, New York, Berlin, London, Sydney, Lord Howe with its 30-minute shift, Auckland, Santiago, Ho Chi Minh, Saigon), 32 transitions in 2026–2027, 135,360 minutes of transition days: every gap minute (900) throws "(DST gap)", every fold minute (900) throws "(DST fold)", every other minute returns the single instant. 4,200 ordinary-day samples and 496 no-Intl US/EU-rule cases, boundary minutes included: 0 mismatches.
     - The three B3 reproduction folds now throw "(DST fold)".
     - Control: the same checker on the a3d1b65 oracle reports 2,280 mismatches. There the folds return an instant (the B3 defect), and the gap message lacks the kind.
     - The unit tests pass (6 tests). They hold five fold cases (LA, Sydney, Berlin, including the first and last repeated minute), three gap cases and the neighbouring minutes.
     - The comment at zoneOracle.ts:19-25 now states the real behaviour.
  5. No regression:
     - `npm run verify`: 32 files / 613 tests, lint (`no-deprecated`), build and smoke; 0 deprecation lines.
     - `npm run test:e2e`: 74 passed, 2 skipped (mobile-only tests on desktop).
     - Targeted vitest: zoneOracle, payroll-exceptions and sessionModel, 53 tests passed.
     - WP2-B2-01 rechecked on the new oracle code: no-Intl season check over 2026–2028, 8,768 conversions, 0 mismatches. The committed R-07 e2e passes on both projects with the real server clock and with the server clock moved to winter dates (picked 2026-11-02 and 2027-01-13, PST).
     - I opened and inspected these screenshots: timesheet with all shapes, DST fold re-ask on mobile, OT in dark mode, login focus ring, admin with the disabled payroll button on mobile, and day editor in dark mode on mobile. Nothing looked wrong.
- Evidence table: command | result/exit | evidence (all under `handoff/delivery/evidence/WP2-AUDIT-B4/`, masked, LF; Node v24.21.0 portable by full path; Edge channel; no browser download; TEMP/TMP, clones and e2e output in the auditor's own C: work folder; full list in `00-commands.txt`):

| Command | Result/exit | Evidence |
|---|---|---|
| `git rev-parse HEAD`; `node scripts/source-digest.mjs`; `git ls-tree … \| sha256sum` (before; project, clone, base clone) | HEAD 5fafeae = origin/main; e61fa914…14df (613 files) three ways; base 5b370621…8581; exit 0 | `digest-before.txt` |
| `git diff --name-status a3d1b65 5fafeae` | outside handoff/: styles.css, zoneOracle.ts, zoneOracle.test.ts only | `diff-scope.txt`, `diff-scope-src.txt` |
| `npm ci --no-audit --no-fund` (clone, base clone) | 144 packages each; exit 0 / 0 | `npm-ci.txt` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` (clone) | typecheck, lint, 32 files / 613 tests, build, SMOKE PASSED; 0 deprecation lines; exit 0 | `verify.txt` |
| same NODE_OPTIONS, `npm run test:e2e` (clone; desktop and mobile) | 74 passed, 2 skipped; exit 0 | `e2e.txt` |
| `node literal-scan-b4.mjs` (5fafeae, then a3d1b65 control) | 0 / 0 / 0 at 5fafeae; control 60 / 67 / 37; exit 0 / 0 | `literal-scan-5fafeae.txt`, `literal-scan-a3d1b65-control.txt` |
| `node resolve-equiv.mjs` a3d1b65 vs 5fafeae (and mutant copy) | 1293 resolved values, 0 differences; mutant 24; exit 0 | `static-equivalence.txt` |
| instrumented suite, `AUDIT_B4_LABEL=base` (a3d1b65) and `=reviewed` (5fafeae) | 78 passed, 2 skipped each; exit 0 / 0 | `style-runs.txt` |
| `node compare-b4.mjs` base vs reviewed | 91 screens, 26,377 elements, 2,162,914 values; style 0, structure 0; geometry 48 / content 314, content-driven | `style-compare.txt`, `target-values.txt` |
| mutant: 5 tokens in the built CSS, rerun, restore | 78 passed, exit 0; 10,978 style differences; CSS hash restored | `style-compare-mutant.txt`, `style-runs.txt` |
| `node oracle-check-b4.mjs` (5fafeae, then a3d1b65 control) | 0 mismatches (900 gap, 900 fold, 496 no-Intl cases); control 2,280 mismatches; exit 0 / 0 | `oracle-check-b4.txt`, `oracle-check-b4-control-a3d1b65.txt` |
| `node season-check.mjs` | 8,768 conversions, 0 mismatches, 382 PST days; exit 0 | `season-check.txt` |
| `vitest run zoneOracle.test.ts --reporter=verbose`; with payroll-exceptions and sessionModel | 6 passed; 3 files / 53 passed; exit 0 / 0 | `vitest-zoneoracle.txt`, `vitest-targeted.txt` |
| server clock real / 2026-11-03 / 2027-01-14 (preload `winter-clock.mjs`), `playwright test zz-audit-b4-date day-editor.spec.ts -g "R-07\|zz-audit-b4"` | picked 2026-10-02 / 2026-11-02 / 2027-01-13; 4 passed each; exit 0 ×3 | `winter-run.txt` |
| probe files removed; digest after (clone, base clone, project) | clones clean; project HEAD 5fafeae, e61fa914…14df two ways, nothing outside handoff/; exit 0 | `digest-after.txt` |
| `node scripts/precommit-check.mjs` (scratch clone, this audit's outputs staged there); workflow Python `validate_package.py --preflight` | see `preflight-privacy.txt` | `preflight-privacy.txt` |

  Two runs failed because of my own tooling, and none because of the product:
  - My first oracle check reported 2 mismatches. The expected value was mine and wrong: Berlin 01:59 on the fold day is still CEST. The exhaustive reference agreed with the oracle. I corrected the checker and reran (`oracle-check-b4-run1-auditor-expectation-error.txt`).
  - My first winter preload lost a backslash in a shell heredoc. Node raised a SyntaxError before any test ran, exit 1 for both winter dates (`winter-run-attempt1-preload-syntax.txt`). I rewrote it with the file tool and reran.

  The probe files existed only in the clones and were removed before the after-digest. The mutant edit touched only the clone's ignored `dist/` CSS and was restored. Logs were masked with `mask.mjs.txt`.

- Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix:
  - None.
- Risks and optional improvements, separate from proven defects:
  1. `--space-6` (styles.css:47) is defined but never referenced. It was already unused at a3d1b65. Optional: remove it or use it.
  2. Some tokens share a value but carry different meanings (`--space-0` and `--rule` are both 2px; `--hairline` and `--press-offset` are both 1px). This is not duplication: a spacing and a rule thickness may change independently. The structural tokens `--track`, `--cols-2/3/4` and `--order-first` follow the brief's exhaustive class. They are harmless, though more granular than the UI standard strictly needs.
  3. The stylesheet header (styles.css:4-5) names "the documented 768px literal". The queries also use its complement, 767px max-width. Optional: mention both in the comment.
  4. The oracle takes its candidate offsets from ±1 day. A zone with two transitions inside 48 hours would escape detection. No such zone exists in 2026–2027 or in the tests. Optional: note this in the comment.
  5. Carried from B3 and still optional: `legacyPdtWallTime` stays exported for the unit test. The first mobile radio of the breaks group computes 17.19 × 18.75 px, at both commits, so it is not a regression. No committed test pins computed style values; this audit's instrumented probe could become one.
  6. The winter run moved only the server clock; the browser clock stayed real. The R-07 test takes its date from the API, so this does not limit the result.
- Required gates unrun/blocked and why: none blocked in area B.
  - Not run by design: WP3 finalization, revisions, PDF and email; Linux and NAS; Chrome/Chromium channels (Edge only).
  - Area A (WP2-AUDIT-A2, attempt 3) owns the ledger, concurrency and payroll-response privacy judgement. The full suite passed inside `npm run verify`.
- Disposition of previous findings:
  - WP2-B3-01 (Low): **fixed, verified.**
    - The twelve listed declarations, and all 60 declarations / 67 literal occurrences of the class, now reference tokens.
    - My independent scan shows 0 left.
    - The computed styles are identical on 91 live screen states, and the mutant control detects a change.
  - WP2-B3-02 (Low): **fixed, verified.**
    - Folds and gaps throw as documented, with zero mismatches against an exhaustive reference in ten zones.
    - The unit fold and gap cases exist and pass.
    - The oracle imports nothing.
  - WP2-B2-01 (Medium): **still holds.**
    - Season check: 0 mismatches over 2026–2028.
    - The committed R-07 e2e passes with PST server dates on both projects.
  - WP2-B2-02 and WP2-B-02 (Low): **still hold.** The earlier tokens are unchanged, and all computed values are identical to a3d1b65.
  - WP2-B-01 (Medium): **still holds.** The committed display-zone default, R-07, DST fold, zone-change re-read, fold re-ask and DST gap e2e pass on both projects, and their computed styles are identical to a3d1b65. No product code changed.
  - Payroll-exception screen (WP2-A2-02, UI side): **still holds.**
    - The committed e2e passes on both projects.
    - My probe confirms the disabled "Record exception" button without a reason, at opacity 0.6 both times.
    - The server side is unchanged since a3d1b65. Its privacy verdict belongs to WP2-AUDIT-A2.
  - WP2-GATE F1: **stays closed.** The committed insufficient-balance e2e passes on both projects. Its assertions are unchanged: the message, "Nothing was reserved", the available balance, and no request or balance change.
- Software readiness, owner permission and pilot result separately:
  - Software readiness of WP2: area B passes on digest e61fa914. WP2 acceptance also needs WP2-AUDIT-A2, reported separately.
  - Owner permission: not requested; nothing deployed, no email.
  - Pilot result: none (WP5).
- One next action/prompt: the coordinator records WP2-AUDIT-B4 = PASS on 5fafeae / e61fa914. If WP2-AUDIT-A2 (attempt 3) also passes on this digest, WP2 acceptance follows (accept commit through timesheet-committer), then WP3 planning.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs:
  - Review: WP2-AUDIT-B4 attempt 1. Reviewer board agent ID `a83d7267129f6a949`, as recorded on the board; it is not visible inside the session.
  - Third-round authors on the board: WP2-FIXB3 `a33c20fa0f60a68da`, freeze/commit WP2-FIXB3-FREEZE `aadc0ad71deea6050`, gate WP2-GATE4 `a99b6f7545d1ec005`.
  - The earlier rounds and the WP2 authors are listed in [WP2_RECHECK_B3](WP2_RECHECK_B3.md), [WP2_RECHECK_B](WP2_RECHECK_B.md) and [WP2_REVIEW_B](WP2_REVIEW_B.md).
- Fresh context; confirm reviewer did not author changes:
  - Fresh context. This reviewer authored nothing in WP2 and changed no source.
  - Writes were limited to this report, its translation, the brief results and `evidence/WP2-AUDIT-B4/`.
  - The probes existed only in the scratch clones and were removed before the after-digest.
- Source digest before/after; gate evidence for that snapshot: `e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df` before and after. It equals the WP2-GATE4 digest (`evidence/WP2-GATE4/digest-*.txt`) for the same commit 5fafeae.
- New report path preserving previous review history: `handoff/delivery/WP2_RECHECK_B4.md` and `.vi.md` (new). [WP2_REVIEW_B](WP2_REVIEW_B.md), [WP2_RECHECK_B](WP2_RECHECK_B.md), [WP2_RECHECK_B3](WP2_RECHECK_B3.md) and their evidence are unchanged.
- Finding dispositions and next coordinator fix/recheck task:
  - WP2-B3-01 and WP2-B3-02: closed as verified. WP2-B2-01, WP2-B2-02, WP2-B-01, WP2-B-02, the payroll-exception screen and F1 still hold.
  - No open area-B finding, so no fix or recheck task is needed for area B.
