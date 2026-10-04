# Independent review

Translation: [WP2_RECHECK_B3.vi.md](WP2_RECHECK_B3.vi.md).

- Package/date/reviewer and observable model/effort: WP2, final recheck of area B (workspace, admin, UI and integration) after the second fix round; 2026-10-04 (UTC); task WP2-AUDIT-B3 attempt 1 (board kind `audit`, profile timesheet-auditor). Self-reported model `claude-opus-5-5`; the board requested xhigh effort, and the actual effort is not observable. The strongest author model in the snapshot is opus (`claude-opus-5-5`, WP2-T02 and WP2-T03 per the board and WP2_HANDOFF). The second-round fix author WP2-FIXB2, its committer and the WP2-GATE3 verifier ran on sonnet. The reviewer model is therefore not weaker. WP2-AUDIT-A2 (attempt 2) ran at the same time in its own clone, and no files were shared.
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness:
  - Reviewed commit: `a3d1b6555c352afa68b3d61ddc67f0c596742698`, the WP2-GATE3 `freeze_commit`, equal to origin/main.
  - Source digest: `5b370621e7d3b9f292e8facebb1f0f6e9307a40cbda3a9f87b7dd61924298581` (613 files, handoff/ excluded). It was the same before (11:07Z) and after (11:22Z), in the project folder and in the scratch clone. It matches the `git ls-tree` cross-check and the gate digest.
  - Project HEAD was the reviewed commit before and after, and nothing changed outside handoff/.
  - Source complete: every command ran in a git clone of that commit on C: (outside Dropbox). A second clone at f79413b served only for the real-screen style comparison and the winter negative control. Both clones were deleted afterwards.
- Decision: PASS / FIX REQUIRED / NOT VERIFIED: **FIX REQUIRED.**
  - Every scope item passes: WP2-B2-01, WP2-B2-02 (the six listed declarations), WP2-B-01, WP2-B-02, the payroll-exception screen (WP2-A2-02, UI side), no area-B regression, and gate F1 stays closed.
  - `npm run verify` and `npm run test:e2e` (both projects) pass. The committed R-07 e2e also passes with the server clock in Pacific Standard Time.
  - Two new Low findings, both style or test-helper fixes with no behaviour change:
    - WP2-B3-01: WP2-introduced typographic literals remain (`font-weight: 600` ×8 and `letter-spacing: -0.01em` ×4).
    - WP2-B3-02: the new test oracle documents that a DST fold throws, but it returns an instant without warning.
- Scope actually inspected/executed:
  1. Source diff f79413b..a3d1b65 outside handoff/ (8 files): styles.css, admin.ts, calendars.ts, the new tests/client/zoneOracle.ts and zoneOracle.test.ts, day-editor.spec.ts, isolation.test.ts (comment) and payroll-exceptions.test.ts. I checked them against R-07, AGENTS rules 5, 7 and 8, and the AGENTS UI pre-flight.
  2. WP2-B2-01, checked four ways:
     - Imports: zoneOracle.ts imports nothing, product code included.
     - No-Intl cross-check: a separate calculation with plain arithmetic (US DST rule, no Intl) matches the oracle for every day of 2026–2028. That is 0 mismatches in 2192 conversions, for both `Asia/Ho_Chi_Minh` and the Edge alias `Asia/Saigon`.
     - Unit test: it covers summer and winter dates, both DST-change days and every day of 2026.
     - The committed e2e, unmodified, under a winter server clock. A test-only preload shifted the clock of `dist/server/index.js` and `cli.js` only. The spec picked 2026-11-02 and 2027-01-13 (PST), and the R-07 test passed on both projects. The same run with the old f79413b spec fails on both projects ("2026-11-02 08:00" expected, "07:00" received). This shows that the shifted clock really exercises winter.
  3. WP2-B2-02 and WP2-B-02, my own real-screen comparison. The same Playwright steps and synthetic data ran at f79413b and at a3d1b65:
     - Screens: login, timesheet (grid and day list), batch dialog, day editor with session form and break rows, OT with a leave row, history, settings, Clock-out dialog and admin. Each was captured on desktop and mobile after a 1.2 s settle.
     - Recorded: the tokenized target selectors, plus the DOM path, bounding box and 33 computed properties of every visible element.
     - Sensitivity check: a mutant token run (dist CSS only, restored afterwards) proved that the probe detects a change.
     - A static scan of the stylesheet lists every remaining literal against the WP1 stylesheet (f32978f) and git blame.
  4. WP2-B-01 rechecked with a browser zone the committed specs do not use (Europe/Berlin, a DST zone). Expected instants came from my own Intl helper (longOffset-based, separate from both the product and zoneOracle.ts). Checked:
     - the default input zone;
     - the stored instants, breaks included;
     - the expected finish, in the display zone and labelled "derived";
     - a zone change from Berlin to London of a saved session: wall times and breaks re-read, accounting date and session count kept, no write before Save;
     - DST re-ask after a zone change: a fold (Berlin to Sydney, later instant chosen) and a gap (London to Los Angeles, first valid time), with nothing stored while asking.
  5. Admin payroll-exception screen (WP2-A2-02, UI side):
     - A blank or whitespace-only reason keeps the button disabled, and the server answers 422.
     - A success answers 201 with body keys exactly `["payroll_exception"]`.
     - A period used by a finalized timesheet (set in the temporary database, as the integration tests do) answers 409 `period_finalized`. The refusal is shown in a `role="alert"` paragraph, and nothing is recorded.
  6. Regression: the full verify and e2e suites; targeted verbose vitest for the FIXB2, FIXB and FIXA regressions; gate F1 rerun with screenshots. I opened and inspected 13 screenshots: day editor display-zone default, zone change (committed and probe), DST gap re-ask, admin payroll (committed and probe finalized), insufficient balance, and the reviewed day editor, timesheet, OT, Clock-out and admin captures.
- Evidence table: command | result/exit | evidence (all under `handoff/delivery/evidence/WP2-AUDIT-B3/`, masked, LF; Node v24.21.0 portable by full path; Edge channel; no browser download; TEMP/TMP, clones and e2e output in the auditor's own C: work folder; full list in `00-commands.txt`):

| Command | Result/exit | Evidence |
|---|---|---|
| `git rev-parse HEAD`; `node scripts/source-digest.mjs`; `git ls-tree … \| sha256sum` (before; project, clone, base clone) | HEAD a3d1b65 = origin/main; 5b370621…8581 (613 files) three ways; base 4c2bd7ef…3528; exit 0 | `digest-before.txt` |
| `npm ci --no-audit --no-fund` (clone, base clone) | 144 packages each; exit 0 / 0 | `npm-ci.txt` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` (clone) | typecheck, lint (`no-deprecated`), 32 files / 611 tests, build, SMOKE PASSED; 0 deprecation lines; exit 0 | `verify.txt` |
| same NODE_OPTIONS, `npm run test:e2e` (clone; desktop and mobile) | 74 passed, 2 skipped (mobile-only on desktop); exit 0 | `e2e.txt` |
| `vitest run zoneOracle.test.ts payroll-exceptions.test.ts sessionModel.test.ts --reporter=verbose` | 3 files, 51 tests passed, including the four oracle tests, the WP2-A2-02 differential test, `input zone choices` and the zone-change tests; exit 0 | `vitest-targeted.txt` |
| `node oracle-check.mjs <clone>` | 0 mismatches against no-Intl arithmetic over 2026–2028; old 08:00 expectation wrong on 382 PST days; gap throws; 3 folds return an instant; exit 0 | `oracle-check.txt`, `oracle-check.mjs.txt` |
| `AUDIT_FAKE_NOW=2026-11-03T20:00:00Z` and `2027-01-14T20:00:00Z`, preload `fake-clock.mjs`, `playwright test zz-audit-b3-date day-editor.spec.ts -g "R-07\|audit-b3"` (committed spec unmodified) | picked 2026-11-02 / 2027-01-13; 4 passed each; exit 0 / 0 | `winter-run.txt`, `fake-clock.mjs.txt`, `zz-audit-b3-date.spec.ts.txt` |
| same on base f79413b (after `npm run build`, exit 0): real clock, then fake 2026-11-03 | real clock 4 passed, exit 0; winter: R-07 fails on both projects (08:00 expected, 07:00 received), exit 1, the expected negative control | `winter-control.txt`, `base-build.txt` |
| `node literal-scan.mjs <clone>` | 72 declarations with literals, 30 with a literal absent from WP1 (listed under WP2-B3-01 and risk 1); exit 0 | `literal-scan.txt`, `literal-scan.mjs.txt` |
| `playwright test zz-audit-b3-style` at a3d1b65 and at f79413b; `node compare.mjs` | 4 passed each (exit 0 / 0); 18 screens, 4690 elements, 159,460 values compared, **0 differences**; target values listed | `style-runs.txt`, `style-compare.txt`, `zz-audit-b3-style.spec.ts.txt`, `compare.mjs.txt` |
| mutant: dist CSS `--shape-size` .75rem and `--font-size-base` 1.02rem, capture, restore | 4 passed, exit 0; 1817 differing lines on the 12 screens that use those tokens; CSS hash restored | `style-mutant.txt` |
| `playwright test zz-audit-b3-zone zz-audit-b3-payroll zz-audit-b3-f1` | 8 passed; exit 0 | `probes-run1.txt`, `audit-b3-*.json`, `audit-b3-*-synthetic.png`, the three `.spec.ts.txt` |
| probe specs removed; digest after (clone, base clone, project) | clone and base clean; project HEAD a3d1b65, 5b370621…8581 two ways, nothing outside handoff/; exit 0 | `digest-after.txt` |
| `node scripts/precommit-check.mjs` in the scratch clone with this audit's outputs staged there (project index untouched); workflow Python `validate_package.py --preflight` (clone, then project folder) | privacy PASS, 50 files, 0 findings; preflight PASS (55 pairs / 924 links; project 56 / 931); exit 0 / 0 / 0 | `preflight-privacy.txt` |

  Apart from the deliberate negative control, one run failed. The first version of the preload had a backslash mangled by the shell, and Node raised a SyntaxError before any test ran (exit 1 for both winter dates, nothing executed). I rewrote the preload and reran. The rerun overwrote that log, so this outcome comes from the session transcript. The probe specs existed only in the clones and were removed before the after-digest. Logs were masked with `export.mjs.txt`. The clones, the temporary databases and the e2e outputs were deleted, and no process was left running.

- Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix:

  **WP2-B3-01 — Low — WP2-introduced typographic literals remain in the stylesheet.**
  - File: `src/client/styles.css` at a3d1b65:
    - `font-weight: 600` at lines 142 (`.shell-brand`), 170 (`.nav-link[aria-current='page']`), 377 (`th`), 516 (`.week-tag`), 588 (`.batch-count`), 763 (`.breaks legend`), 810 (`.time-problem legend`) and 860 (`.ot-balances dd`);
    - `letter-spacing: -0.01em` at lines 143 (`.shell-brand`), 194 (`h1`), 842 (`.ot-screen h2`) and 861 (`.ot-balances dd`).
    - They were added by WP2-T09A (717db3e), T09B (9c36a7e), T10 (26fa7c9) and T11 (55d3bb8).
  - Reproduction: `literal-scan.txt`. Neither value occurs in the WP1 stylesheet (f32978f), which has no `font-weight` or `letter-spacing` declaration, and `:root` has no token for either. Neither earlier audit listed them.
  - Expected/actual: AGENTS "Unified Frontend & UI/UX Standards" step 1 says to match the existing font weights and "introduce new values only as CSS custom properties". The rounds WP2-B-02 and WP2-B2-02 tokenized the size literals, but these two typographic values are still written literally twelve times.
  - Rule: AGENTS UI pre-flight (E-8 visual standard).
  - Bounded fix:
    - Add, for example, `--font-weight-strong: 600` and `--letter-spacing-tight: -0.01em` to `:root`, and reference them in the 12 declarations, with no visual change.
    - Recheck: the real-screen comparison against a3d1b65 (this audit's `zz-audit-b3-style.spec.ts.txt` and `compare.mjs.txt` can be reused as they are), `npm run verify` and the e2e suite.

  **WP2-B3-02 — Low — the test oracle promises a throw for DST folds but returns an instant instead.**
  - File/function: `tests/client/zoneOracle.ts:19-27`, `instantOfWallTime`. The comment at lines 20-21 says "Only for unambiguous wall times: a DST fold or gap throws".
  - Reproduction (`oracle-check.txt`): the gap 2026-03-08 02:30 Los Angeles throws, as documented. But three folds return an instant without error:
    - 2026-11-01 01:30 Los Angeles gives 08:30Z, the earlier instant;
    - 2026-04-05 02:30 Sydney gives 16:30Z, the later one;
    - 2026-10-25 02:30 Berlin gives 01:30Z, the later one.
    - The unit test covers only the gap ("refuses a DST gap", zoneOracle.test.ts:42-46).
  - Expected/actual: the oracle is the independent source of expectations that closes WP2-B2-01. A later test that types a fold time would silently get a zone-dependent choice instead of the documented refusal. That is the same class of hidden time-dependence the fix removed. No current test is affected: the R-07 e2e uses a zone without DST (`Asia/Saigon`), and the unit test uses no fold.
  - Rule: AGENTS rule 5 (test evidence must mean what it claims); AGENTS rule 7 and R-07 ("require explicit offset/fold for ambiguous times").
  - Bounded fix (test only):
    - Make `instantOfWallTime` throw when the wall time maps to two instants, for example by also testing the candidate given by the offset one day earlier and one day later. Alternatively, state the actual behaviour in the comment.
    - Add a fold case to `zoneOracle.test.ts`.
    - Recheck: the unit test and the R-07 e2e on both projects.

- Risks and optional improvements, separate from proven defects:
  1. The remaining WP2 literals that I judged acceptable, from `literal-scan.txt`:
     - layout structure: grid fractions (`1fr`, `repeat(n, 1fr)`), `order: -1`, `100%`, `flex: 1`;
     - status-shape geometry: `border-radius: 50%`, the triangle `polygon(…)`, `rotate(45deg) scale(0.85)`, and `clip-path: inset(50%)` for `.sr-only`;
     - the 1–2 px hairlines and the 767/768 px breakpoints, accepted in attempt 1;
     - values already in WP1: 14px, 6px, 15px, 1.45, 1.4rem and 0.6.
     - `scale(0.85)` is borderline. An optional `--shape-diamond-scale` token would remove all doubt.
  2. `legacyPdtWallTime` in `tests/client/zoneOracle.ts:8-12` is a deliberately wrong exported helper, kept only to show the old defect in the unit test. Optional: inline it into the test.
  3. On mobile, the first radio of the breaks group ("Breaks not confirmed yet") computes 17.19 × 18.75 px instead of 18.75 × 18.75 px in the day editor and the Clock-out dialog: it shrinks in its flex row. The same happens at f79413b, so this is a cosmetic WP2-T10 leftover, not a regression. Optional: `flex: none` on checkbox and radio inputs.
  4. No committed test pins the computed values of the tokens. This audit's comparison covers them now, and the probe could be committed as a visual-regression check.
  5. The winter run shifted only the server clock; the browser clock stayed real. The R-07 test takes its date from the API, and the test passed, so this does not limit the result.
  6. The attempt-1 and attempt-2 risks that are not repeated here were not re-judged.
- Required gates unrun/blocked and why: none blocked in area B.
  - Not run by design: WP3 finalization, revisions, PDF and email; Linux and NAS; Chrome/Chromium channels (Edge only).
  - Area A (WP2-AUDIT-A2) owns the ledger, concurrency and payroll-response privacy judgement (WP2-A2-01/02). The full suite passed inside `npm run verify`.
- Disposition of previous findings:
  - WP2-B2-01 (Medium): **fixed, verified.**
    - The oracle is independent: it imports no product code and agrees with a no-Intl calculation.
    - The unit test covers both seasons and the DST-change days.
    - The committed spec passes under PST server dates (2026-11-02, 2027-01-13), while the old spec fails there.
  - WP2-B2-02 (Low): **fixed for the six listed declarations (8 lines), verified.**
    - The four tokens (`--control-check-size`, `--shape-size`, `--dialog-max-height`, `--font-size-base`) give identical computed values on live screens against f79413b. Examples: checkbox and radio 18.75 px, shape 10.5 px, dialog max-height 720 px on desktop and 759.6 px on mobile, the three h3 at 15 px.
    - The remaining typographic literals are carried as WP2-B3-01.
  - WP2-B-01 (Medium): **still holds** (Berlin probe and the committed e2e): display-zone default, stored instant, derived expected finish, zone-change re-read with breaks, and the fold and gap re-ask.
  - WP2-B-02 (Low): **still holds**. The ten earlier tokens are unchanged, and all computed values are identical to f79413b.
  - WP2-A2-02 (area A, UI side): **verified**.
    - The reason is required, in the UI and on the server (422).
    - A success body holds only `payroll_exception`.
    - The finalized period gets 409 `period_finalized`, shown in words, with nothing recorded.
    - PayrollExceptions.tsx and api.ts never used `refreshed_pay_period`. The privacy verdict belongs to WP2-AUDIT-A2.
  - WP2-A2-01 (area A): the comment-only changes are present (admin.ts header, isolation.test.ts:280), and they are judged by area A.
  - WP2-GATE F1: **stays closed**.
    - The committed insufficient-balance e2e passes on both projects.
    - My rerun shows the alert "Not enough available OT balance. 1h 00m available, 1h 01m needed. Nothing was reserved." (`role="alert"`), the summary and leave count unchanged, and the screenshots `audit-b3-insufficient-balance-*-synthetic.png`.
- Software readiness, owner permission and pilot result separately:
  - Software readiness of WP2: not accepted. Area B is FIX REQUIRED (WP2-B3-01 and WP2-B3-02, both Low); WP2-AUDIT-A2 is reported separately.
  - Owner permission: not requested; nothing deployed, no email.
  - Pilot result: none (WP5).
- One next action/prompt: the coordinator dispatches one bounded fix task with `addresses_audit: WP2-AUDIT-B3` via [FIX_FINDINGS](../prompts/FIX_FINDINGS.md), covering WP2-B3-01 (styles.css tokens, identical computed values) and WP2-B3-02 (oracle fold refusal or corrected comment, plus a unit case). A freeze, a new WP2 gate and a recheck of area B on the new digest follow.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs:
  - Review: WP2-AUDIT-B3 attempt 1. Reviewer board agent ID `a4a12ead83ae7b867`, as recorded on the board; it is not visible inside the session.
  - Second-round authors on the board: WP2-FIXB2 `a908ddae97aaffe5a`, freeze/commit WP2-FIXB2-FREEZE `ab84d5b84b7b03680`, gate WP2-GATE3 `a412e4ac65755cb7c`.
  - The earlier fix round and the WP2 authors are listed in [WP2_RECHECK_B](WP2_RECHECK_B.md) and [WP2_REVIEW_B](WP2_REVIEW_B.md).
- Fresh context; confirm reviewer did not author changes:
  - Fresh context. This reviewer authored nothing in WP2 and changed no source.
  - Writes were limited to this report, its translation, the brief results and `evidence/WP2-AUDIT-B3/`.
  - The probe specs existed only in the scratch clones and were removed before the after-digest. The mutant edit touched only the clone's ignored `dist/` build output and was restored.
- Source digest before/after; gate evidence for that snapshot: `5b370621e7d3b9f292e8facebb1f0f6e9307a40cbda3a9f87b7dd61924298581` before and after. It equals the WP2-GATE3 digest (`evidence/WP2-GATE3/digest-*.txt`) for the same commit a3d1b65.
- New report path preserving previous review history: `handoff/delivery/WP2_RECHECK_B3.md` and `.vi.md` (new). [WP2_REVIEW_B](WP2_REVIEW_B.md), [WP2_RECHECK_B](WP2_RECHECK_B.md) and their evidence are unchanged.
- Finding dispositions and next coordinator fix/recheck task:
  - WP2-B2-01 and WP2-B2-02: closed as verified. WP2-B-01, WP2-B-02 and F1 still hold.
  - Open: WP2-B3-01 (Low) and WP2-B3-02 (Low). Both fit in one bounded style and test-helper task with no server or behaviour change.
  - Then a freeze, a new WP2 gate and a WP2-AUDIT-B recheck on the new digest, preserving this report.
