# Independent review

Translation: [WP2_RECHECK_B.vi.md](WP2_RECHECK_B.vi.md).

- Package/date/reviewer and observable model/effort: WP2, recheck of area B (workspace, admin, UI and integration) after the audit-fix round; 2026-10-04 (UTC); task WP2-AUDIT-B2 attempt 1 (board kind `audit`, profile timesheet-auditor). Self-reported model `claude-opus-5-5`; the board requested xhigh effort, and the actual effort is not observable. The strongest author model in the snapshot is `claude-opus-5-5` (WP2-T02 and WP2-T03, per WP2_HANDOFF). The fix authors WP2-FIXA and WP2-FIXB and the committer ran on `claude-sonnet-5-5`. The reviewer model is therefore not weaker. WP2-AUDIT-A2 ran at the same time in its own clone, and no files were shared.
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness:
  - Reviewed commit: `f79413b77e7f745e1eff383f1ad748e7667533da`, the WP2-GATE2 `freeze_commit`, equal to origin/main per the gate.
  - Source digest: `4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528` (611 files, handoff/ excluded). It was the same before and after, in the project folder and in the scratch clone, and it matches the `git ls-tree` cross-check and the gate digest.
  - Project HEAD was the reviewed commit before and after. Working-tree changes are under handoff/ only.
  - Source complete: every command ran in a git clone of that commit on C: (outside Dropbox). A second clone at 8fae685 served only for the computed-style comparison. Both clones were deleted afterwards.
- Decision: PASS / FIX REQUIRED / NOT VERIFIED: **FIX REQUIRED.**
  - The product fixes for WP2-B-01 and WP2-B-02 are verified, and so are the FIXB zone-change addendum and the WP2-FIXA admin screen. Gate F1 stays closed, and `npm run verify` and `npm run test:e2e` (both projects) pass.
  - Two new findings:
    - WP2-B2-01 (Medium): the new R-07 e2e hard-codes a summer-time Los Angeles offset. It will fail deterministically in winter, from about 2026-11-03.
    - WP2-B2-02 (Low): WP2-introduced literal sizes outside the WP2-B-02 list remain.
  - Both are test or style fixes, with no product-behaviour change.
- Scope actually inspected/executed:
  1. Source diff 8fae685..f79413b outside handoff/ (11 files): DayEditor.tsx, SessionForm.tsx, sessionModel.ts, DayFigures.tsx, styles.css, api.ts, HolidayImport.tsx, holidayImport.ts and the three test files. The changes were traced against R-07, AGENTS rules 7 and 8 and the AGENTS UI pre-flight.
  2. WP2-B-01, with my own probe. The browser zones were Asia/Tokyo (no DST) and Europe/Berlin (DST), both different from the reporting zone and from the host zone. An Intl oracle independent of the app resolver gave the expected instants. Checked:
     - the default input zone and the datalist;
     - the stored instant of a time typed in the default zone;
     - an explicit Los Angeles choice;
     - the expected finish: display zone, "(derived)" label, display-only note, no server field, and no write request while viewing;
     - a saved session's zone change, which re-reads the typed wall times, breaks included, and leaves the accounting date unchanged;
     - DST re-ask after a zone change: a fold (Los Angeles to Sydney, later instant chosen) and a gap (London to Los Angeles, moved to the first valid time), with nothing stored while asking;
     - key-by-key typing of a new zone, with no page error.
  3. The attempt-1 probe was rerun unchanged: input-zone default, F1, every screen's CSP inline styles, transitions, radius, overflow and 44 px targets, and dark mode.
  4. WP2-B-02 was checked two independent ways:
     - a static check: the 12 new tokens were substituted back into styles.css and compared line by line with 8fae685;
     - a computed-style probe on real screens at both commits, with the same synthetic data. The screens were login, timesheet, batch dialog, day editor, OT with a leave row, history, settings, Clock-out dialog and admin. It covered 11 target selectors plus a style signature of every visible element.
  5. Regression in area B:
     - the full e2e suite on both projects;
     - visual inspection of 13 screenshots: day editor (display-zone default, zone change, 09:00–18:00 breaks), holiday preview (FIXA), OT after use, batch conflict, Clock out, F1, and the probe screenshots;
     - the WP2-FIXA client and server contract (removed counts, date-only `finalized_conflicts`).
  6. The new tests were checked for environment and date dependence. A temporary config tested the host zone, an Intl window calculation tested the date, and a replay of the committed test steps ran on a PST date.
- Evidence table: command | result/exit | evidence (all under `handoff/delivery/evidence/WP2-AUDIT-B2/`, masked, LF; Node v24.21.0 portable by full path; Edge channel; no browser download; TEMP/TMP and screenshots in the auditor's own C: work folder):

| Command | Result/exit | Evidence |
|---|---|---|
| `git rev-parse HEAD`; `node scripts/source-digest.mjs`; `git ls-tree … \| sha256sum` (before; project and clone) | HEAD f79413b; 4c2bd7ef…3528 (611 files); exit 0 | `digest-before.txt` |
| `npm ci --no-audit --no-fund` (clone and base clone); `npm run build` (base clone) | 144 packages each; exit 0 / 0 / 0 | `npm-ci.txt` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` (clone) | typecheck, lint (`no-deprecated`), 31 files / 606 tests, build, smoke 28 PASS; 0 deprecation lines; exit 0 | `verify.txt` |
| same NODE_OPTIONS, `npm run test:e2e` (clone; desktop and mobile) | 74 passed, 2 skipped (mobile-only on desktop); exit 0 | `e2e.txt` |
| `node css-substitute.mjs <8fae685 css> <f79413b css>` | 12 tokens, 12 uses substituted, 0 differing lines of 1017; exit 0 | `css-substitute.txt`, `css-substitute.mjs.txt` |
| `playwright test zz-audit-b2-style` at 8fae685 and at f79413b, then `node style-compare.mjs` | 0/0 run exits; 11 target selectors identical on both projects; only element difference: the new expected-finish note `p.hint.muted`. An earlier 0.3 s-settle pair also exited 0/0 and showed mid-transition samples only; rerun with 1.2 s | `style-runs.txt`, `style-compare.txt`, `style-targets-*.json`, `zz-audit-b2-style.spec.ts.txt`, `style-compare.mjs.txt` |
| `playwright test zz-audit-b2-probe` (B-01, Tokyo and Berlin) | run 1: 6 passed, 2 failed (probe bug: its own second session overlapped the first; product refused it correctly, `overlapping_user_intervals`); run 2 after the probe fix: 8 passed; exit 1 / 0 | `probe-b01-run1.txt`, `probe-b01.txt`, `audit-b2-input-zone-*.json`, `audit-b2-zone-change-*.json`, `audit-b2-*-synthetic.png`, `zz-audit-b2-probe.spec.ts.txt` |
| attempt-1 probe `zz-audit-b-probe` rerun unchanged | 8 passed; default input zone Asia/Saigon = display zone (attempt 1: America/Los_Angeles); F1 message and unchanged summary; 0 inline styles, 0 overflow, 0 small mobile targets; exit 0 | `probe-attempt1.txt`, `audit-b-input-zone-*.json`, `audit-b-f1-*.json`, `audit-b-screens-*.json`, `input-zone-default-*-synthetic.png`, `insufficient-balance-viewport-*-synthetic.png` |
| `playwright test zz-audit-b2-typing` | key-by-key zone typing: no page error, nothing stored before Save, London instants after; 2 passed; exit 0 | `typing-probe.txt`, `audit-b2-typing-*.json` |
| `AUDIT_TZ=<zone> playwright test -c zz-audit-b2-tz.config.ts day-editor.spec.ts -g "defaults its input zone…"` (Ho Chi Minh, Tokyo, Berlin) | 2 passed each; exit 0 ×3: the file-level `timezoneId` pin makes the test host-independent | `tz-dependence.txt` |
| `node season-window.mjs` | the committed assertion fails for every date from 2026-11-01 to 2027-03-13 (133 dates; 07:00 instead of 08:00); exit 0 | `season-window.txt`, `season-window.mjs.txt` |
| `playwright test zz-audit-b2-season` (committed test steps replayed on 2026-01-14) | stored 22:00 Asia/Saigon = 15:00Z = 07:00 Los Angeles (product correct; committed test expects 08:00); 2 passed; exit 0 | `season-probe.txt`, `audit-b2-season-*.json`, `zz-audit-b2-season.spec.ts.txt` |
| digest after (probe files removed; clone, base clone, project), plus a project recheck after the `nul` cleanup | clone clean, 4c2bd7ef…3528 two ways; base clone clean; project HEAD f79413b, 4c2bd7ef…3528, nothing outside handoff/ (10:32Z and again 10:36Z); exit 0 | `digest-after.txt` |
| `node scripts/precommit-check.mjs` on a temporary index holding this audit's outputs (real index untouched); `validate_package.py --preflight` (workflow Python, project folder, after writing this report pair) | privacy PASS, 61 files, 0 findings; preflight PASS, 54 translation pairs, 905 local links, 91 scenarios; exit 0 / 0 | `preflight-privacy.txt` |

  The failed probe run is listed because it happened. The bug was in auditor-written probe code, and the product did not change between runs. The probe specs and the temporary config existed only in the clones and were removed before the after-digest. Logs were masked with `export-evidence.mjs.txt`. The clones, temporary databases and e2e outputs were deleted, and no process was left running.

  Stray-file incident: at 10:33:58Z one of my evidence-export calls named `/dev/null` as its destination. Git Bash passed it to Node as the native path `nul`, and Node created a real untracked file `./nul` at the project root. Its content was a masked copy of the attempt-1 probe spec, synthetic only. The coordinator reported it, and I deleted it. The project recheck at 10:36Z shows the file gone, nothing outside handoff/ and the same digest. No tracked file was touched, and the file appeared after the 10:32Z after-digest.

- Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix:

  **WP2-B2-01 — Medium — the new R-07 e2e hard-codes a Pacific Daylight Time offset and will fail every winter.**
  - File: `tests/e2e/day-editor.spec.ts:222-223`, with the comment at 209. Test "manual entry defaults its input zone to the display zone and stores the instant typed there (R-07)" (line 187).
  - Reproduction:
    - The spec pins the browser zone to Asia/Ho_Chi_Minh (+07:00, no DST; line 16). It takes `date` from the real clock: the newest past free workday of the displayed period (line 193).
    - It types 22:00–23:30 and asserts `dateTimeIn(start, LA) === "<date> 08:00"` and `"<date> 09:30"`. That holds only while Los Angeles is at −07:00.
    - `season-window.txt`: for every date from 2026-11-01 to 2027-03-13 the conversion gives 07:00. The test will fail on every run whose newest past free workday falls in that range, from about 2026-11-03 to 2027-03-15 (Los Angeles dates), and again every winter.
    - `season-probe.txt` replays the committed steps on 2026-01-14. The product stores the typed display-zone time correctly (15:00Z = 07:00 PST), while the committed assertion would expect 08:00.
    - The test is host-independent (`tz-dependence.txt`); only the date matters.
  - Expected/actual:
    - Expected: an R-07 regression test that is valid on every run date.
    - Actual: a mandatory e2e gate (WP3 onwards) will go red within about a month without any product change. That can be misread as a product regression or provoke a wrong "fix".
  - Rule/AC: AGENTS rule 5 (reproducible executable evidence); AGENTS rule 7 (keep instants and zones apart in the oracle); docs/06 e2e gate.
  - Bounded fix (test only):
    - Derive the Los Angeles expectation from the date instead of hard-coding it. For example, compute the instant of `<date>T22:00` in the display zone with Intl, assert that the stored start equals it, and assert that `dateTimeIn(stored, LA)` equals `dateTimeIn(expected, LA)` and keeps the same calendar date. Alternatively, use a fixed past date with a reason.
    - Fix comment 209 to match.
    - Recheck: that test on both projects, plus a replay on a PST date.

  **WP2-B2-02 — Low — WP2-introduced literal sizes outside the WP2-B-02 list remain.**
  - File: `src/client/styles.css`:
    - lines 241-242: `width/height: 1.25rem`, checkbox and radio (WP2-T09A, 717db3e);
    - lines 473-474: `0.7rem`, `.shape` status mark (WP2-T09B, 9c36a7e);
    - line 629: `max-height: 90dvh`, `.dialog` (WP2-T09B);
    - lines 706, 884 and 1000: `font-size: 1rem`, `.dialog h3`, `.ot-leave-head h3` and `.user-head h3` (WP2-T10, 55d3bb8 for T11, da0ffc4 for T12).
  - None of these values occurs in the WP1 stylesheet (f32978f). The 6px and 14px paddings reuse WP1 values, and the 1–2 px hairlines and the 767/768 px breakpoints were accepted in attempt 1.
  - Expected/actual: AGENTS "Unified Frontend & UI/UX Standards" step 1 says "introduce new values only as CSS custom properties". Attempt 1 listed ten literals; WP2-FIXB tokenized exactly those, and these six declarations were missed by the attempt-1 list.
  - Rule: AGENTS UI pre-flight (E-8 visual standard).
  - Bounded fix:
    - Add tokens to `:root`, for example `--control-check-size`, `--shape-size`, `--dialog-max-height` and `--font-size-base`, and reference them with no visual change.
    - Recheck: the static substitution check plus the computed-style comparison against f79413b, `npm run verify` and the e2e suite.

- Risks and optional improvements, separate from proven defects:
  1. The browser may report a legacy alias, for example `Asia/Saigon` for `Asia/Ho_Chi_Minh` in Edge. It is saved as the session's input zone (the server accepts it), and the datalist then lists both spellings. Optional: canonicalize or deduplicate the display.
  2. `changeZone` drops pinned offsets on the first keystroke. Typing back to the original zone therefore re-resolves the wall times, and a fold time is asked again. This is acceptable and documented in the code; nothing is stored until Save.
  3. No committed test pins the WP2-B-02 computed values (the FIXB probe was temporary). This audit's real-screen comparison covers it now; a later regression would only show in screenshots.
  4. The attempt-1 risks 1, 3, 4 and 6–10 (History raw field names, cosmetic DST legend, holiday counts, WP1 `leave_kind`, and others) were not re-judged. Risk 4 is now moot: WP2-FIXA removed the counts.
- Required gates unrun/blocked and why: none blocked in area B.
  - Not run by design: WP3 finalization, revisions, PDF and email; Linux and NAS; Chrome/Chromium channels (Edge only).
  - Area A (WP2-AUDIT-A2) owns the ledger, concurrency and holiday-preview privacy judgement. The suite (606 tests, including LG and DF) passed inside `npm run verify`.
- Disposition of previous findings:
  - WP2-B-01 (Medium): **fixed, verified.**
    - New manual sessions default to the current display zone in both browser zones, and the reporting zone stays one explicit choice away.
    - Times typed in the default zone are stored at the instant the Intl oracle gives for that zone; an explicit Los Angeles choice stores Los Angeles wall times.
    - The expected finish is shown in the display zone, labelled "(derived)" with a display-only note. It is absent from the server response, and viewing it sends no write.
    - Changing a saved session's zone re-reads the wall times, breaks included, keeps the accounting date, and asks again for a DST fold or gap.
    - The attempt-1 probe now records the display zone as the default.
  - Related observation (expected finish in the display zone): fixed, verified (as above).
  - WP2-B-02 (Low): **fixed for the ten listed literals, verified.**
    - After substitution the stylesheet is identical to 8fae685.
    - Computed values of all 11 target selectors on real screens are identical on desktop and mobile.
    - The remaining WP2 literals are recorded as the new finding WP2-B2-02.
  - WP2-FIXB addendum (zone change of a saved session): verified, including key-by-key typing.
  - WP2-GATE F1: **stays closed**. The insufficient-balance flow passes on both projects with the alert text "Not enough available OT balance. 1h 00m available, 1h 01m needed. Nothing was reserved.", and the summary and leave list are unchanged (`audit-b-f1-*.json`, `insufficient-balance-viewport-*-synthetic.png`).
  - WP2-A-01 (area A): area-B side only. The admin holiday-import screen no longer shows employee counts, states the preservation rule, and shows `finalized_conflicts` as dates. The client types match the server, the admin e2e passes, and the screenshot was inspected. The privacy verdict belongs to WP2-AUDIT-A2.
- Software readiness, owner permission and pilot result separately:
  - Software readiness of WP2: not accepted. Area B is FIX REQUIRED (WP2-B2-01 Medium, WP2-B2-02 Low); WP2-AUDIT-A2 is reported separately.
  - Owner permission: not requested; nothing deployed, no email.
  - Pilot result: none (WP5).
- One next action/prompt: the coordinator dispatches one bounded fix task with `addresses_audit: WP2-AUDIT-B2` via [FIX_FINDINGS](../prompts/FIX_FINDINGS.md), covering WP2-B2-01 (test only) and WP2-B2-02 (styles.css tokens with identical computed values). A freeze, a new WP2 gate and a recheck of area B on the new digest follow.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs:
  - Review: WP2-AUDIT-B2 attempt 1. Reviewer board agent ID `a9e5f7844199fa574`, as recorded on the board; it is not visible inside the session.
  - Fix-round authors on the board: WP2-FIXA `aa3af6ddfb57e0a19`, WP2-FIXB `afdfdb7208db48436`, freeze/commit WP2-FIX-FREEZE `a478b6cc23befba3d`, gate WP2-GATE2 `a44cc217fb0ba6b27`.
  - Earlier WP2 authors are listed in [WP2_REVIEW_B](WP2_REVIEW_B.md).
- Fresh context; confirm reviewer did not author changes:
  - Fresh context. This reviewer authored nothing in WP2 and changed no source.
  - Writes were limited to this report, its translation, the brief results and `evidence/WP2-AUDIT-B2/`. The one exception was the accidental untracked `./nul`, deleted as described under the evidence table.
  - The probe specs and the temporary config existed only in the scratch clones and were removed before the after-digest.
- Source digest before/after; gate evidence for that snapshot: `4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528` before and after. It equals the WP2-GATE2 digest (`evidence/WP2-GATE2/digest-*.txt`) for the same commit f79413b.
- New report path preserving previous review history: `handoff/delivery/WP2_RECHECK_B.md` and `.vi.md` (new). [WP2_REVIEW_B](WP2_REVIEW_B.md) and its evidence are unchanged.
- Finding dispositions and next coordinator fix/recheck task:
  - WP2-B-01 and WP2-B-02: closed as verified, with the residual literals carried as WP2-B2-02.
  - Open: WP2-B2-01 (Medium) and WP2-B2-02 (Low), fixable in one bounded test/style task with no server or behaviour change.
  - Then a freeze, a new WP2 gate and a WP2-AUDIT-B recheck on the new digest, preserving this report.
