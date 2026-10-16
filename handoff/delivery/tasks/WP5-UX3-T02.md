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
- Base: HEAD = origin/main = the WP5-UX3-T01-FREEZE commit (board `commit_sha`), or a later
  commit that changes only `handoff/`. Record HEAD, `git status --short` and the digest
  before you edit (the freeze's digest is on the board). Uncommitted coordinator files under
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
   full synthetic example.invalid form may remain; mask everything else.
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
