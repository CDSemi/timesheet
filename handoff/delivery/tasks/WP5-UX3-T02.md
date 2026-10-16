# WP5-UX3-T02 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T02; package WP5; kind implement;
  attempt 1; depends on WP5-UX3-T01-FREEZE. Second style slice of UI change round 3: the
  identity block, the account menu, the phone More content, the slimmer desktop navigation
  and the wordmark rule.
- **AGENTS.md on disk wins.** Your context may hold an older injected AGENTS.md section
  "Unified Frontend & UI/UX Standards (Taste Skills Integration)"; it is superseded. Follow
  the on-disk section "Frontend and UI/UX standards".
- Owner basis (board `owner_decisions`, 2026-10-15): U-03 (avatar right-aligned; display
  name in bold over a smaller email in a dark colour, right-aligned before the avatar), U-04
  (clicking the avatar opens a menu with the Light/Dark toggle, Profile, Settings and Sign
  out), U-05 (the Settings and Admin main-menu items move into that menu; Administration
  becomes a sub-page or tab of Settings: the sub-pages themselves are slice T03), U-06 (the
  "Semiconductor Services, Inc." wordmark visible beside the logo on common desktop widths).
- Design sources (the contract): `handoff/delivery/tasks/WP5-UX3-PLAN.md` Results section
  B3 (identity block, pattern, items, desktop navigation, phone More, shared view) and B4
  first bullet (wordmark rule), section F rows U-03/U-04 and U-06 and the "Existing
  assertions that must change" list (shell, hover, logo specs), section H row WP5-UX3-T02;
  the mockup `handoff/delivery/design/WP5-UX3/mockup.html` artboards A1, A2 and A7 and the
  renders `mockup-a1-topbar-1440-menu-synthetic.png`,
  `mockup-a2-topbar-1280-share-synthetic.png` and
  `mockup-a7-phones-390-320-more-synthetic.png`.
- Coordinator decisions (board): the disclosure account menu and its item order as in B3;
  the Administration link points to `#/settings/admin` (the route itself arrives in T03; in
  this slice the link may lead to the existing admin screen through a temporary mapping, or
  T02 keeps today's `#/admin` target and T03 changes it: choose the smaller change and say
  which); the Profile link points to `#/settings/profile` likewise (T03 adds the page; until
  then the link may be omitted or point to Settings: say which); the Theme control is the
  existing `ThemeToggle` moved, unchanged in behaviour and storage.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk M (navigation reachability for every
  screen, focus and Escape, the first-screen budget), novelty yes (account menu). Task
  record in English.
- Base: HEAD = origin/main = e2f3d7492160d389c18903285994bedec56df51e (the T01 freeze), or
  a later commit that changes only `handoff/`. Source digest
  a4f127cc4a10c8b311811b244be2a82fa87bcd636615b89c765d5be5d2411d86 (819 files). Record HEAD,
  `git status --short` and the digest before you edit. Uncommitted coordinator files under
  `handoff/` are expected: never touch them.

## Scope

1. **Identity block (desktop >= 768px)**: one button at the right end of the bar with the
   display name (bold, `--text`), the email (smaller, `--muted`), both right-aligned and
   truncated at `--identity-max` (14rem), then the 36px initials avatar (`--avatar-bg`,
   `--avatar-ink`, `aria-hidden`; initials of the first and last word of the display name,
   one letter for one word, the email's first character when the name has no letter; no
   image), then a chevron. Accessible name = the visible text plus a hidden ", account
   menu". The current theme control, name span and Sign out leave the bar.
2. **Account menu**: disclosure button (`aria-expanded`, `aria-controls`) with a non-modal
   panel (`--elev-3`, `--radius-lg`, right-aligned under the button, a menu layer token above
   the sticky bar). Items in order: header (avatar, full name, email, "Administrator" for
   admins); Profile; Settings; Administration (admins only); separator; Theme (the existing
   `ThemeToggle`); separator; Sign out. Keyboard: opening by keyboard moves focus to the first
   item; Tab and Shift+Tab move through the items; Escape closes and returns focus to the
   button; a pointer outside, a hash change or Tab past the last item closes it.
3. **Desktop main navigation**: Timesheet, Overtime, History only.
4. **Phone**: no avatar in the top bar (first-screen budget); the tab bar keeps Timesheet,
   Overtime, History, More; the More panel shows the same account content (header, Profile,
   Settings, Import, Administration for admins, Theme, Sign out); the `more-who` line
   becomes that header.
5. **Shared view**: the bar always shows the signed-in user, never the owner of the shared
   timesheet.
6. **Wordmark (U-06)**: shown from 1024px; hidden below 1280px while the "Shared with me"
   switcher is in the bar; `--shell-brand-gap` 32px wherever it shows; the bar stays one row
   (<= 64px) without horizontal overflow at 1024, 1280, 1440 and 1920 with and without a
   share and with a long synthetic display name.
7. A pure `src/client/components/accountModel.ts` for the initials and the menu item list
   (admin or not, phone or desktop).

## Tests

- New `tests/client/accountModel.test.ts`: initials (one word, two words, three words,
  non-letter name falls back to the email, empty name), item list for employee and admin.
- e2e per plan section F rows U-03/U-04 and U-06: identity button name contains name and
  email; Enter/Space opens, focus to the first item, the Tab order Profile, Settings,
  (Administration), Theme (one stop), Sign out; Escape returns focus; outside click and hash
  change close; email contrast >= 4.5:1 in both themes and both manual overrides; long-name
  truncation without overflow at 1024 and 1280; wordmark visible at 1024 without a share,
  hidden at 1024-1279 with a share, visible at 1280, 1440 and 1920 with a share, one bar row
  and no overflow in each case; the phone More panel holds the same items and still fits at
  390, 375, 360 and 320 with 44px targets; every screen stays reachable for an employee and an
  admin (Settings, Import, Administration, Sign out) through the menu or More.
- Replace the assertions listed in plan section F (`shell.spec.ts` Settings link, Theme in
  `.shell-user`, Sign out in the banner, Tab order; `hover.spec.ts:110` moves to another
  secondary bar button and a menu item; `logo.spec.ts` wordmark from 1440 becomes the new
  rule; navigation steps in `admin*.spec.ts`, `import.spec.ts`, `isolation.spec.ts`,
  `setup.spec.ts`, `sharing.spec.ts`, `keyboard-access.spec.ts` that click a main-nav
  Settings or Admin link now open the account menu or More first, through one additive
  helper in `tests/e2e/fixtures.ts`). For each changed assertion record file:line and why it
  is not a weakening (the same item is still reached and asserted).
- The 390x844 first-screen budgets must still pass; record the numbers.
- No assertion removed or weakened; no `skip`, `fixme` or `.only`; dates only from the
  server-reported `today_local` and the displayed period.

## Hard constraints

- No server, API, domain, schema or CSP change; `/api/admin/*` authorization untouched. No
  new dependency or icon library (inline SVG only, `aria-hidden`).
- Tokens only (the T01 token system); shared `var(--transition)` with a local
  `--transition-duration` where needed; WCAG 2.2 AA (2.4.7, 2.4.11 the menu never under the
  sticky bar, 2.5.3, 2.5.8 / 44px below 768px, 1.4.11, 1.4.1).
- Keep AX-01..AX-10, R-12, the Escape order and focus returns of the editor and dialogs, the
  round-2 phone header clock and every T01 behaviour.

## Owned paths

- `src/client/components/AppShell.tsx`, `src/client/components/AccountMenu.tsx` (new),
  `src/client/components/accountModel.ts` (new), `src/client/components/ThemeToggle.tsx`
  (placement only), `src/client/styles.css` (shell, menu and More parts)
- `tests/client/accountModel.test.ts` (new), `tests/e2e/fixtures.ts` (one additive helper),
  and the navigation and shell assertions in `tests/e2e/shell.spec.ts`, `logo.spec.ts`,
  `theme.spec.ts`, `hover.spec.ts`, `focus-ring.spec.ts`, `setup.spec.ts`,
  `sharing.spec.ts`, `keyboard-access.spec.ts`, `admin.spec.ts`, `admin-status.spec.ts`,
  `admin-users.spec.ts`, `import.spec.ts`, `isolation.spec.ts` (navigation steps only)
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-T02/` (masked LF `.txt` only, plus at most eight
  screenshots whose basenames end in `-synthetic.png`)

## Checks (in this order; verify and digest are the LAST commands)

1. Node 24 first on PATH (with `cygpath -u`), then `node --version` (v24.x).
2. Before any edit: `git rev-parse HEAD`, `git status --short`, `npm run digest`.
3. Implement, then `npm run typecheck`, `npm run lint`, `npm test`.
4. The FULL e2e suite on both projects on the real clock (`npm run test:e2e`), alone, with
   `E2E_SCREENSHOT_DIR` and the Playwright output folder inside the task folder. 0 failed;
   counts per project. `ERR_NO_BUFFER_SPACE` or an ECONNRESET in `automation.spec.ts`: rerun
   that test three times, then the full suite once. Any other failure in a file you do not
   own: stop and report it.
5. One mutation check: make Escape not return focus to the identity button; show that an
   e2e check fails; revert.
6. Grep changed files and evidence for email addresses and user-profile paths: only the
   full synthetic example.invalid form may remain; mask everything else. Whitespace: Grep
   every new or changed file for `[ \t]+$` and read its last lines (exactly one final
   newline, no blank line at EOF); the T01 freeze stopped once on this.
7. `npm run verify` with `SMOKE_PORT` in 48620-48639 and `DATA_DIR` and `DATABASE_PATH`
   both inside the task folder.
8. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
9. Copy the masked logs of steps 2-5, 7 and 8 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`, NOT EVEN
  FOR A READ-ONLY LISTING. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul` (NOT EVEN
  `2>/dev/null`). NEVER `rm -r` OR `rm -rf` ANYTHING.** Redirect to a file in the task
  folder and read it with the Read tool; list files with the Glob tool. Use the Write and
  Edit tools for files (no sed, no heredoc).
- **Create files only inside the task folder, the evidence folder or your owned paths.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-T02`. Set TEMP and TMP to it. Ports
  48620-48639. Never touch `%LOCALAPPDATA%\timesheet-dev` data or `B:\Temp\claude`. Never kill
  processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write no
  markdown links in Results (paths in backticks only).

## Return

At most 170 words, beginning with 'Self-reported model: ...': files changed (every test file
with changed assertions), the Profile and Administration link targets chosen, the wordmark
rule as implemented, unit and full e2e counts per project, the mutation result, the budget
numbers, verify exit code, the final full 64-hex digest and file count, the evidence files,
the background-task confirmation, any stop, conflict or deviation.

## Results

Self-reported model: claude-sonnet-5-5 (timesheet-worker-high, effort high).

### Step 2: base, status and digest before any edit

- HEAD `e2f3d7492160d389c18903285994bedec56df51e`; `git status --short` showed only the expected
  uncommitted coordinator files under `handoff/`; Node v24.21.0.
- Digest before: `a4f127cc4a10c8b311811b244be2a82fa87bcd636615b89c765d5be5d2411d86` (819 files).
  Evidence: `handoff/delivery/evidence/WP5-UX3-T02/step2-head-status.txt`, `step2-digest-before.txt`.

### What was built

- `src/client/components/accountModel.ts` (new, pure): `initialsOf` (first letter of the first and last word that
  holds a letter; one letter for one word; the email's first character when the name has no letter; `?` when both are
  empty), `roleLabel` ("Administrator" for admins only), `accountItems(role, layout)` (Profile, Settings, Import on a
  phone only, Administration for admins).
- `src/client/components/AccountMenu.tsx` (new): `AccountMenu` (identity button: bold name over smaller muted email,
  right-aligned and truncated at `--identity-max` 14rem, 36px `aria-hidden` initials avatar, chevron that turns over when
  open, hidden ", account menu" so the name contains the visible text; disclosure with `aria-expanded` and
  `aria-controls="account-menu"`, non-modal panel; keyboard opening (click with `detail === 0`) focuses the first item;
  Escape closes, calls `preventDefault` (so an open non-modal Day editor does not close with it) and returns focus to the
  button; a pointer press outside, a hash change and focus leaving the root (Tab past Sign out) close it) and
  `AccountContent` (header with avatar, full name, email and role; Profile, Settings, Administration; separator; the
  existing `ThemeToggle`; separator; Sign out), shared by the desktop menu and the phone More panel. Inline `aria-hidden`
  SVG icons only.
- `src/client/components/AppShell.tsx`: desktop bar = Timesheet, Overtime, History (`ROUTES` desktop flag off for
  Settings and Admin); the bar always renders the signed-in `user` (never the owner of a shared view); the More panel
  renders `AccountContent` (the `more-who` line became the header). `ThemeToggle.tsx`: comments only (placement).
- `src/client/styles.css`: tokens `--layer-menu` 4, `--identity-max` 14rem, `--avatar-size` 36px, `--account-width`
  18.5rem (replaces `--more-width`), `--account-icon-size`, `--chevron-open-transform`, `--line-height-tight`,
  `--shell-gap-tight`, `--nav-pad-x-tight` (all theme-independent, `:root` only; the avatar tokens already existed in all
  three sets); identity, avatar, `account-*` rules (surface `--elev-3`, `--radius-lg`, only `var(--transition)`, the shared
  focus ring, hover only under `(hover: hover)`, 44px entries); wordmark rule (below).
- Link targets chosen (smaller change): Administration keeps today's `#/admin` (T03 changes it to `#/settings/admin`);
  Profile points to `#/settings` (the Settings screen, which holds the personal data) and is never marked current; the
  two address constants are the only lines T03 has to change (`PROFILE_HASH`, `ADMIN_HASH` in `accountModel.ts`). Import
  is a menu entry on a phone only (the desktop reaches it from Settings, as before).
- Wordmark rule as implemented: shown from 1024px (`--shell-brand-gap` 32px on `.shell-bar` from 1024px); hidden from
  1024 to 1279px while `.shell-switcher` is in the bar (`.shell-bar:has(.shell-switcher)` inside
  `@media (min-width: 1024px) and (max-width: 1279px)`), with the gap back at 24px. Deviation to make that range fit one
  row (measured: with a share, no wordmark and a long name the bar needed about 1030px and wrapped to 102px at 1024):
  in that same range and condition the bar's column gap is `--shell-gap-tight` (16px) and the three menu links use
  `--nav-pad-x-tight` (8px); the brand-to-menu distance still equals `--shell-brand-gap`.

### Checks (actual results)

- `npm run typecheck`: exit 0; `npm run lint`: exit 0; `npm test`: 92 files, 2045 tests passed (the new
  `tests/client/accountModel.test.ts` has 14: initials for one, two and three words, lower case and non-ASCII, a word
  that starts with punctuation, a name without a letter falling back to the email, an empty and a blank name, an empty
  email; `roleLabel`; the item list for employee and admin on desktop and phone, distinct ids, hash shape, no
  Administration for an employee, the Administration and Import targets).
- Full `npm run test:e2e` on the real clock, alone, both projects: 0 failed, 503 passed, 49 skipped (desktop 246 passed
  and 30 skipped; mobile 257 passed and 19 skipped), 12.8 minutes. No `ERR_NO_BUFFER_SPACE` or ECONNRESET. Log:
  `step4-e2e-full.txt`. (Two earlier partial runs of `shell.spec.ts` and `logo.spec.ts` showed my own test mistakes,
  fixed before this run: a "long email" assertion that the generated email is too short to trigger, `openAccount`
  deciding desktop or phone before the shell had rendered, and the 1024px share bar needing the deviation above.)
- Mutation check: removed `buttonRef.current?.focus()` from the Escape handler of `AccountMenu`; the desktop run of
  `shell.spec.ts -g "account menu from the keyboard"` failed 2 of 2 (employee and admin) with `toBeFocused` expected
  focused, received inactive on the identity button (`step5-mutation.txt`); reverted (the file is byte-identical to the one
  the full run and the verify used).
- 390x844 first-screen budgets (still passing in `theme.spec.ts`, `today.spec.ts`): no share, with the zone note: first
  day row bottom 658.4 of tab bar top 788, bar 60px; received share, with the zone note: 710.4 of 788, bar 112px; no share,
  without the zone note: 559.5 of 788, bar 60px; received share, without the zone note: 611.5 of 788, bar 112px. The phone
  bar has no avatar and no identity button.
- Bar measurements (`logo.spec.ts`, long synthetic name, identity 298x38, text 210px): one 56px row, no overflow and the
  wordmark visible at 1024, 1280, 1440 and 1920 without a share; with a share hidden at 1024, 1150 and 1279 (brand-to-menu
  24px) and visible at 1280, 1440 and 1920 (32px), always one 56px row; user group right edge 1008 of 1024 at 1024 with a
  share (bar parts there: brand 36, menu 269, switcher 333, user group 298; logged in `step4-e2e-full.txt`).
- Contrast (`shell.spec.ts`, four theme situations incl. both manual overrides, desktop): bar name 13.45 to 15.62, bar
  email 5.83 to 6.56 (hovered 9.28 to 12.72), avatar initials 8.24 to 8.70, menu role 5.83 to 6.56, menu entries 13.45 to
  15.62 (all at least 4.5:1).
- `SMOKE_PORT=48621 npm run verify` (data dir and database path inside the task folder): exit 0 (`step7-verify.txt`):
  typecheck, lint, 2045 unit tests, build, smoke passed. Note: the client JS chunk is now 502.77 kB (it was 498.53 kB at
  the T01 freeze and 498.41 kB at T06), so Vite prints its "chunks are larger than 500 kB" advisory for the first time in
  this round; it is not a deprecation and not an error, no config was changed here, and the next slices (T07, T08) add
  more code, so the coordinator needs a code-split or limit decision (out of this task's paths).
- Digest after (last command, after verify): `c938aa6fcd55a15f1edd6fc28462981b33188de9462d6d60f9a8fcde19a7b72c` (822 files
  = 819 + `AccountMenu.tsx`, `accountModel.ts`, `accountModel.test.ts`), `step8-digest.txt`.
- Whitespace: Grep `[ \t]+$` over every changed source and test file: no match; new files end with exactly one newline.
  Emails in the evidence logs are the full synthetic `example.invalid` form only (seed accounts printed by the smoke);
  no user-profile path in any evidence file.

### Changed assertions (file:line after the edit; each is not a weakening because the same item is still reached and
asserted, mostly more strictly)

- `tests/e2e/shell.spec.ts:24-68` (was 23-60): Settings link in the bar becomes Settings in the opened account menu
  (`:62-66`); the bar's Theme and Sign out become "not in the bar" plus visible inside the menu; phone link list gains Profile.
- `shell.spec.ts:95-237` (was 62-103, Theme first in `.shell-user`, Sign out its only button): replaced by the account
  menu test (identity name contains name and email, avatar initials, right alignment, bold and muted colours, open, header,
  entries order Profile, Settings, Theme, Sign out, right-aligned under the button, above the page) and the phone More
  assertions (header, links, Theme between the entries and Sign out, 44px).
- `shell.spec.ts:427-470` (was 297-331, Tab order Overtime, History, Settings, Theme, Sign out): replaced by the bar order
  Overtime, History, identity button (and with a share: select, Open, identity button) plus `:472-549`, the menu's own
  Tab order Profile, Settings, (Administration), Theme (one stop), Sign out, Shift+Tab back, Enter and Space opening with
  focus on the first entry, Escape returning focus from three different places, Tab past the last entry, outside press
  and hash change closing, for an employee and an admin.
- New: `shell.spec.ts:551` (shared view shows the signed-in user), `:584` (contrast in four situations), `:626` (long
  name at 1024 and 1280), `:680` (More panel at 390, 375, 360, 320 for employee and admin: items, header, 44px, inside
  the screen), `:721` (every screen reachable: Settings, Import, Profile, Administration, Sign out).
- `tests/e2e/hover.spec.ts:107-121` (was `:110`, secondary "Sign out" in the banner): moved to the bar's quiet identity
  button plus two menu entries (Sign out button, Settings link); the hover criterion (fill difference at least 1.2:1,
  accent boundary at least 3:1, text at least 4.5:1) is unchanged; "Next period" stays as the secondary-button case.
- `tests/e2e/logo.spec.ts:156-` (`expectBar`, `:268`, `:321`; were `expectWordmarkBar` and the two tests at 240-311, wordmark
  from 1440): the new rule with more widths (768, 1023, 1024, 1150, 1279, 1280, 1440, 1920), both share states, one row,
  no overflow, a long name, the 24px and 32px gaps, no identity or wordmark on a phone; the theme-control geometry checks
  became identity-button checks; the shell brand test still asserts a 56px desktop bar (`:156-`).
- `tests/e2e/theme.spec.ts:49-62` and the callers: `themeControl` opens the menu or More through `openAccount` (it was
  the bar or More); `:380-386` the Tab test starts from the panel's last link and ends at Sign out inside the panel; the
  screenshot test captures the panel; `isMobile` parameters that became unused were removed. No assertion removed.
- `tests/e2e/focus-ring.spec.ts:360` (was `:357-361`): the theme group is reached through `openAccount`; the identity
  button is added to the controls whose focus ring is measured (desktop).
- `tests/e2e/admin.spec.ts:56-66, 196-198, 410-430` (were `:56-72, 197-202, 410-440`): Admin link in the main nav becomes
  Administration in the menu; the nav test now asserts the bar lists only the three screens, the employee menu has no
  Administration, `#/admin` falls back to `#/timesheet`, the admin menu adds Administration and the Administrator line.
- `tests/e2e/admin-status.spec.ts:195-203` (was 198), `isolation.spec.ts:114, 151, 198-224` (were 116, 152, 202-203),
  `import.spec.ts:112, 394-410` (were 118, 400), `sharing.spec.ts:136-142, 282` (were 136-152, 291), `setup.spec.ts:160-163`,
  `keyboard-access.spec.ts:259-261`: navigation steps now open the menu or More through `openAccount`; the same item is
  reached and asserted; the employee checks are stronger (no admin entry in the menu and, in `isolation.spec.ts`, no
  `/api/admin/` request at all from an employee page).
- `tests/e2e/fixtures.ts:700-725`: one additive helper `openAccount(page)` (waits for the shell, opens the account menu
  or More, returns its container).

### Not done / notes

- Production code touched only under `src/client/`; no server, API, domain, schema or CSP file changed. `docs/` untouched
  (slice T10). No commit, push or install.
- The Playwright harness picks its own free loopback ports (worker servers on ephemeral ports, as before); only the smoke
  used a port from 48620-48639 (48621).
- Evidence folder: `step2-head-status.txt`, `step2-digest-before.txt`, `step3-typecheck.txt`, `step3-lint.txt`,
  `step3-unit.txt`, `step4-e2e-full.txt`, `step5-mutation.txt`, `step7-verify.txt`, `step8-digest.txt` and eight
  `-synthetic.png` captures (account menu, wordmark bars at 1024 and 1440 without a share and 1279 and 1280 with one, the
  dark menu, the admin More panel at 390 and 320).
- No background task of mine is running.

Status: done
