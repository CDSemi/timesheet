# WP5-UX3-T03 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T03; package WP5; kind implement;
  attempt 1; depends on WP5-UX3-T02-FREEZE. Third slice of UI change round 3: Settings
  sub-pages (Personal, Profile, Administration), the Profile page, the routes and the old
  `#/admin` redirect, and lazy loading of the Administration and Import screens.
- **AGENTS.md on disk wins.** Any older injected AGENTS.md copy in your context with the
  section "Unified Frontend & UI/UX Standards (Taste Skills Integration)" is superseded;
  follow the on-disk section "Frontend and UI/UX standards".
- Owner basis (board `owner_decisions`, 2026-10-15): U-04 (the avatar menu holds Profile and
  Settings) and U-05 (the Settings and Admin main-menu items move into that menu;
  "Administration" becomes a sub-page or tab inside the Settings page).
- Design sources (the contract): `handoff/delivery/tasks/WP5-UX3-PLAN.md` Results section
  B3 (the bullets "Settings sub-pages", "Server authorization is unchanged" and "Profile"),
  section F row U-05, section H row WP5-UX3-T03; the mockup artboard A6 and the render
  `handoff/delivery/design/WP5-UX3/mockup-a6-settings-tabs-synthetic.png`; the T02 record
  `handoff/delivery/tasks/WP5-UX3-T02.md` Results (the account menu, `PROFILE_HASH` and
  `ADMIN_HASH` in `accountModel.ts`, the `openAccount` e2e helper).
- Coordinator decisions (board `coordinator_decisions`, 2026-10-15):
  - Settings sub-pages are links with their own address and h1, not ARIA tabs (plan B3).
  - Code-split: load the Administration and Import screens lazily (React.lazy with a
    dynamic import; same-origin chunks, the CSP unchanged), with an accessible loading state
    and unchanged heading and focus behaviour, so the build prints no 500 kB chunk-size
    advisory (the main chunk was 502.77 kB after T02). Record the main chunk size before and
    after.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk H (authorization surface: the client must
  never show or request admin data for an employee; the server stays unchanged), novelty no.
  Task record in English.
- Base: HEAD = origin/main = the WP5-UX3-T02-FREEZE commit (board `commit_sha`), or a later
  commit that changes only `handoff/`; source digest as recorded by that freeze. Record HEAD,
  `git status --short` and the digest before you edit. Uncommitted coordinator files under
  `handoff/` are expected: never touch them.

## Scope

1. **Routes** (client only): `#/settings` (Personal: today's Settings content),
   `#/settings/profile` (Profile), `#/settings/admin` (Administration, rendered only for
   `role === 'admin'`). Old `#/admin`: for an administrator `history.replaceState` to
   `#/settings/admin`; for an employee the existing fallback to `#/timesheet`.
   `#/settings/admin` for an employee: the same fallback, no admin request. `#/import` stays
   and is linked from Personal and the phone More panel. A pure route model (for example
   `src/client/components/routeModel.ts`) canonicalises these addresses per role.
2. **Settings sections nav**: `<nav aria-label="Settings sections">` with links Personal,
   Profile and Administration (admins only) and `aria-current="page"`; each sub-page keeps
   its own h1 ("Settings", "Profile", "Administration"), so existing heading assertions
   hold. Tokens only; 44px targets below 768px; the shared focus ring; one row with wrapping
   on a phone; no horizontal scroll at 320.
3. **Profile page** (no server change): read-only display name, email, role and the
   reporting zone (from `/api/periods/current`), with the note "An administrator changes
   display names." No editing of the name or the password (D-9 stays the password decision).
4. **Account menu targets**: set `PROFILE_HASH` to `#/settings/profile` and `ADMIN_HASH` to
   `#/settings/admin` in `accountModel.ts`; the menu marks the current entry with
   `aria-current="page"` when its sub-page is shown.
5. **Lazy loading** of `AdminScreen` and `ImportScreen` (and any admin-only module they
   alone use): a dynamic import per screen, a `Suspense` fallback with `role="status"` and
   readable text, focus and the h1 behaviour as today once loaded; a failed chunk load shows
   a readable error with a retry (no blank page).
6. **Server authorization unchanged**: no file under `src/server/` or `src/domain/` changes;
   `/api/admin/*` stays behind `requireAdmin`.

## Tests

- New `tests/client/routeModel.test.ts` (or `routes.test.ts`): `#/admin` canonicalises to
  `#/settings/admin` for an admin and to `#/timesheet` for an employee; `#/settings/admin`
  for an employee to `#/timesheet`; `#/settings`, `#/settings/profile`; unknown sub-paths.
- `tests/client/accountModel.test.ts`: the two targets updated.
- e2e (both projects): an admin reaches Administration through the menu (desktop) or More
  (phone) and through `#/settings/admin` and `#/admin` (redirected, address replaced); an
  employee sees no Administration link in the menu, the More panel or the Settings nav, and
  at `#/settings/admin` and `#/admin` sees no Administration heading and the page makes no
  `/api/admin/` request (request listener for the whole visit); Profile shows the four
  read-only values and the note; the Settings nav marks the current section; the browser
  back button returns to the previous sub-page; the lazy Admin and Import screens load and
  show their h1; a forced chunk-load failure (route the chunk request to an error in
  Playwright) shows the error with a retry.
- Update the navigation steps in `admin.spec.ts`, `admin-status.spec.ts`,
  `admin-users.spec.ts`, `import.spec.ts`, `isolation.spec.ts`, `history-settings.spec.ts`
  and `shell.spec.ts` (reachability test) to the new addresses where they assert the old
  `#/admin` or Settings screens; list each changed assertion with file:line and why it is
  not a weakening.
- The server integration tests for 403 stay green unchanged (`npm test`).
- No assertion removed or weakened; no `skip`, `fixme` or `.only`.

## Hard constraints

- No server, API, domain, schema or CSP change; no new dependency.
- Tokens only; shared `var(--transition)`; WCAG 2.2 AA (2.4.3 focus order, 2.4.7, 2.5.3,
  2.5.8 / 44px below 768px, 1.4.11, 4.1.3 for the loading status).
- Keep AX-01..AX-10, R-12, the T01 and T02 behaviour and the round-2 behaviour.

## Owned paths

- `src/client/App.tsx`, `src/client/components/AppShell.tsx` (routes only),
  `src/client/SettingsScreen.tsx`, `src/client/AdminScreen.tsx` (export shape only, if
  needed for lazy loading), `src/client/ImportScreen.tsx` (export shape only, if needed),
  `src/client/ProfileScreen.tsx` (new), `src/client/components/SettingsNav.tsx` (new),
  `src/client/components/routeModel.ts` (new), `src/client/components/accountModel.ts` (the
  two targets and the current-entry marking), `src/client/components/AccountMenu.tsx`
  (current-entry marking only), `src/client/styles.css` (settings nav, Profile, loading
  state)
- `tests/client/routeModel.test.ts` (new), `tests/client/accountModel.test.ts`,
  `tests/e2e/settings-routes.spec.ts` (new, optional), and the navigation assertions in
  `tests/e2e/admin.spec.ts`, `admin-status.spec.ts`, `admin-users.spec.ts`,
  `import.spec.ts`, `isolation.spec.ts`, `history-settings.spec.ts`, `shell.spec.ts`
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-T03/` (masked LF `.txt` only, plus at most six
  screenshots whose basenames end in `-synthetic.png`)

## Checks (in this order; verify and digest are the LAST commands)

1. Node 24 first on PATH (with `cygpath -u`), then `node --version` (v24.x).
2. Before any edit: `git rev-parse HEAD`, `git status --short`, `npm run digest`, and
   `npm run build` once to record the main chunk size before the change.
3. Implement, then `npm run typecheck`, `npm run lint`, `npm test`.
4. `npm run build`: record every client chunk and its size; the output must contain no
   chunk-size advisory.
5. The FULL e2e suite on both projects on the real clock (`npm run test:e2e`), alone, with
   `E2E_SCREENSHOT_DIR` and the Playwright output folder inside the task folder. 0 failed;
   counts per project. `ERR_NO_BUFFER_SPACE` or an ECONNRESET in `automation.spec.ts`: rerun
   that test three times, then the full suite once. Any other failure in a file you do not
   own: stop and report it.
6. Mutation check: render the Administration sub-page for any role (drop the role check);
   show that the employee e2e check fails; revert.
7. `git diff --stat -- src/server src/domain` must be empty (record it).
8. Privacy and whitespace: Grep changed files and evidence for email addresses and
   user-profile paths (only the full synthetic example.invalid form may remain); Grep every
   new or changed file for `[ \t]+$` and read its last lines (exactly one final newline).
9. `npm run verify` with `SMOKE_PORT` in 48640-48659 and `DATA_DIR` and `DATABASE_PATH`
   both inside the task folder.
10. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
11. Copy the masked logs of steps 2-7, 9 and 10 into the evidence folder.

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
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-T03`. Set TEMP and TMP to it. Ports
  48640-48659. Never touch `%LOCALAPPDATA%\timesheet-dev` data or `B:\Temp\claude`. Never
  kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write no
  markdown links in Results (paths in backticks only).

## Return

At most 170 words, beginning with 'Self-reported model: ...': files changed (every test file
with changed assertions), the routes and redirects as implemented, the chunk sizes before and
after and whether any advisory remains, unit and full e2e counts per project, the mutation
result, the server/domain diff result, verify exit code, the final full 64-hex digest and file
count, the evidence files, the background-task confirmation, any stop, conflict or deviation.

## Results
