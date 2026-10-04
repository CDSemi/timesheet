# WP2-AUDIT-B2 dispatch brief

- Mission/task: timesheet-software-readiness / WP2-AUDIT-B2; package WP2; kind audit;
  attempt 1; depends on WP2-GATE2. A fresh recheck of area B (workspace, admin, UI and
  integration) after the fix round.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk H, novelty no. Fresh context; you authored nothing in WP2. The author agent IDs
  are on the board, and they include the WP2-FIXA and WP2-FIXB workers. The task record
  is in English. WP2_RECHECK_B.md and its .vi.md are bilingual (REVIEW form).
- Target: `reviewed_commit` = f79413b77e7f745e1eff383f1ad748e7667533da, the WP2-GATE2
  `freeze_commit`. The gate digest is
  4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528. Record HEAD and the
  source digest before and after; the digest must equal the gate digest.
- WP2-AUDIT-A2 runs at the same time in its own clone. The WP2-B-02 computed-style proof
  is a temporary probe kept as evidence (handoff/delivery/evidence/WP2-FIXB/); rerun your
  own comparison against 8fae685.
- Execute only in your own scratch clone outside Dropbox, on a drive with free space.
  Delete it and your e2e outputs afterwards. Call Node 24 by its full path. The e2e uses
  the installed Edge; download no browser. Do not edit source. Report masked values only.
- Read AGENTS.md from disk first, including rule 7 and the UI standards section. Then
  read:
  - [WP2_REVIEW_B](../WP2_REVIEW_B.md) (attempt 1, FIX REQUIRED: WP2-B-01 and WP2-B-02),
    with its evidence in handoff/delivery/evidence/WP2-AUDIT-B/;
  - docs/02 R-07;
  - the WP2-FIXA and WP2-FIXB results.

## Scope

1. **WP2-B-01.**
   - Manual entry defaults its input zone to the current display zone (R-07), and the
     user can still change it explicitly.
   - With a browser zone different from the reporting zone, the stored instant matches
     the typed time in the chosen zone.
   - The expected finish is shown in the display zone and labelled as derived; it stays
     display-only.
   - Re-run the attempt-1 input-zone probe.
2. **WP2-B-02.** The literal CSS values are now custom properties, and the computed styles
   are unchanged. Verify with a `getComputedStyle` probe or screenshot comparison against
   8fae685.
3. **No regression in area B** from the fix round, including the WP2-FIXA change to the
   admin holiday-import screen.
   - Run `npm run verify` and `npm run test:e2e` (both projects).
   - Visually inspect the screenshots of the changed screens.
4. Gate F1 stays closed (insufficient-balance screenshot).

## Output

- handoff/delivery/WP2_RECHECK_B.md and .vi.md.
- Results in this file.
- Evidence in handoff/delivery/evidence/WP2-AUDIT-B2/ (masked, LF; screenshots
  `*-synthetic.png`).
- Verdict: PASS, FIX REQUIRED or NOT VERIFIED. Give each finding an ID (WP2-B2-nn), a
  severity, file:line and the required change.

Return at most 220 words, beginning with your self-reported model.

## Results

(Auditor appends here.)

### Auditor result (attempt 1)

Self-reported model: claude-opus-5-5 (not weaker than the strongest WP2 author, claude-opus-5-5). Report: [WP2_RECHECK_B](../WP2_RECHECK_B.md) and [.vi.md](../WP2_RECHECK_B.vi.md). Evidence: handoff/delivery/evidence/WP2-AUDIT-B2/.

- Target: HEAD f79413b77e7f745e1eff383f1ad748e7667533da before and after, in the project and in a scratch clone on C:. Source digest 4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528 (611 files) before and after, equal to the gate digest and to the `git ls-tree` cross-check (digest-before.txt, digest-after.txt).
- Gates: `npm run verify` exit 0 (31 files, 606 tests, smoke 28 PASS, 0 deprecation lines). `npm run test:e2e` exit 0, 74 passed and 2 skipped on both projects (Edge channel, Node v24.21.0 by full path).
- WP2-B-01: fixed and verified with my own probe. Browser zones Asia/Tokyo and Europe/Berlin, with an Intl oracle; 8 passed after one probe-bug run.
  - The default input zone is the display zone. The reporting zone can still be chosen explicitly.
  - The stored instant equals the typed time in the chosen zone, and the accounting date is kept.
  - The expected finish is shown in the display zone, labelled "(derived)", display only, with no write request.
  - A zone change re-reads the saved wall times. A DST fold and a gap are asked again, with nothing stored while asking. Key-by-key typing raises no page error.
  - The attempt-1 probe now reports Asia/Saigon as the default.
- WP2-B-02: fixed for the ten listed literals.
  - Static substitution against 8fae685: 0 differing lines.
  - Real-screen getComputedStyle comparison at 8fae685 and f79413b: 11 target selectors identical on desktop and mobile. The only element difference is the new expected-finish note.
- Area-B regression: none found in the product. The WP2-FIXA admin holiday screen shows no counts and date-only conflicts, and its client types match the server. 13 screenshots inspected.
- Gate F1 stays closed: insufficient-balance flow and screenshot on both projects, summary unchanged.
- New findings, verdict **FIX REQUIRED**:
  - WP2-B2-01 (Medium): tests/e2e/day-editor.spec.ts:222-223 (comment 209) hard-code 08:00/09:30 Los Angeles for 22:00/23:30 typed at +07:00. That is valid only under PDT. The date comes from the real clock (line 193), so the test fails on runs from about 2026-11-03 to 2027-03-15 and every winter. The product is correct (season-window.txt, season-probe.txt). Fix: derive the expectation from the date with Intl, or use a fixed date.
  - WP2-B2-02 (Low): src/client/styles.css still has WP2-introduced literals outside the B-02 list: 241-242 `1.25rem`, 473-474 `0.7rem`, 629 `90dvh`, 706/884/1000 `font-size: 1rem`. Fix: tokens with identical computed values.
- Incident: one of my export calls wrote to `/dev/null`. Git Bash turned that into `nul`, and Node created an untracked `./nul` (a synthetic probe-spec copy) at the project root at 10:33:58Z. The coordinator reported it. I deleted it and confirmed it is gone; the project recheck at 10:36Z shows nothing outside handoff/ and the same digest.
- Checks on my outputs: privacy check on a temporary index PASS (61 files, 0 findings); validate_package --preflight PASS (54 pairs, 905 links); preflight-privacy.txt.
- Cleanup: the scratch clones (f79413b and 8fae685), the temporary databases and the e2e outputs were deleted (419 MB). No process was left running, and nothing was staged or committed. ORCHESTRATION.json, STATE.json and NEXT_ACTION were not touched.
