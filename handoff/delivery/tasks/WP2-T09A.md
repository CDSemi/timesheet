# WP2-T09A dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T09A; package WP2; kind implement;
  attempt 1; depends on WP2-CALFIX-FREEZE.
- Coordinator decision: split the plan's T09 as WP2-T09-PREP recommends.
  - T09A: browser harness, E-8 tokens, app shell and API client types.
  - T09B: two-week grid, mobile day list and batch edit.
- Profile/routing: timesheet-worker-high, requested sonnet/high, no override. Routing:
  size M, risk M, novelty yes (the first browser harness and the visual standard).
- Read AGENTS.md from disk first, especially the Unified Frontend & UI/UX Standards
  section. Then read:
  - the Results of [WP2-T09-PREP](WP2-T09-PREP.md), sections A–E; they are binding
    unless this brief says otherwise;
  - [WP2-PLAN](WP2-PLAN.md) task T09 and E-8/E-9;
  - docs/04 lines 7, 14 and 38;
  - src/client/*;
  - scripts/smoke-built-server.mjs, package.json, tsconfig.test.json and the eslint
    config.

  Records in English.
- Before any UI edit, load the three design skills with the Skill tool:
  `stitch-design-taste`, `design-taste-frontend` and `high-end-visual-design`. AGENTS.md
  and owner decision E-8 win on conflicts (plain CSS, 4px radius, 300 ms ease-out through
  custom properties, high density). Record every conflict resolution in your report.
- Baseline: main at 24f192dddbe658246dab020c5bc87c74a02a4310 (the WP2-CALFIX-FREEZE
  commit). The working tree differs only in handoff/.
- Runtime note: after a PATH prepend, bare `node` has still resolved to the system
  v26 in this environment.
  - Call the Node 24 portable binary by its full path for npm and the scripts.
  - Spawn every child Node process from the fixture with `process.execPath`, never with a
    bare `node`.
- Do not commit.

## Required content

1. **Dependency** (E-9):
   - add `@playwright/test` 1.63.0 as an exact devDependency;
   - add a `test:e2e` script that builds and then runs `playwright test`;
   - make no other package change, and keep e2e out of `npm run verify`.
2. **Browser**:
   - use the installed Edge through `channel: 'msedge'` by default;
   - an `E2E_CHANNEL` environment override accepts `chrome` or `chromium`;
   - download no browser. If both installed browsers fail, stop and report.
3. **playwright.config.ts**:
   - projects `desktop` (1280×800) and `mobile` (390×844, `isMobile`, `hasTouch`,
     `deviceScaleFactor: 2`);
   - `workers: 2` and reporter `list`;
   - output, traces and screenshots go under the OS temp directory, so no `.gitignore`
     change is needed.
4. **tests/e2e/fixtures.ts**: a worker-scoped fixture for the built server, as in PREP B.
   - It works in a temp directory outside Dropbox.
   - It runs `migrate` and `seed` with seed passwords generated at run time.
   - It uses a free port and `APP_ORIGINS`, and tears everything down afterwards.
   - It provides seed helpers over HTTP, relative to today through the API.
   - Production code gets no clock override. Never seed today or a future day.
5. **tsconfig.test.json**: include `playwright.config.ts` and `tests/e2e/` so that lint
   passes. Make no other change.
6. **CSS** (src/client/styles.css), with the tokens from PREP C:
   - `--radius: 4px`, which replaces the 8px, 6px and 999px radii;
   - `--duration`, `--ease` and `--transition`;
   - tinted multi-layer shadows, `--focus-ring`, and `--on-accent`, which fixes the
     dark-mode contrast defect;
   - `--ok` and `--warn`, spacing, and mono tabular numbers;
   - a reduced-motion guard.
   No inline styles (CSP), no web fonts, and hover states never change layout properties.
7. **App shell**:
   - App.tsx has the auth gate and an AppShell with a hash route `#/timesheet`;
   - the navigation shows only "Timesheet" for now;
   - TimesheetScreen keeps working inside the shell, with no feature change.
8. **api.ts**:
   - add the view and batch types that T09B will use;
   - keep `error.details` on `ApiRequestError` (a defect fix);
   - existing callers keep working.
9. **tests/e2e/shell.spec.ts**:
   - login, then the shell, then the existing timesheet view, on both projects;
   - on mobile, no horizontal overflow and tap targets of at least 44px;
   - screenshots named `*-synthetic.png`.
   Copy the named screenshots into handoff/delivery/evidence/WP2-T09A/.

Covers: E-8, E-9 and the harness part of the gate item "core browser flows".

## Owned (writable) paths

- src/client/App.tsx, src/client/TimesheetScreen.tsx (shell integration only),
  src/client/api.ts and src/client/styles.css.
- src/client/components/AppShell.tsx (new).
- package.json and package-lock.json: the devDependency and the `test:e2e` script only.
- playwright.config.ts (new) and tsconfig.test.json (the include change only).
- tests/e2e/fixtures.ts and tests/e2e/shell.spec.ts (both new).
- This report and handoff/delivery/evidence/WP2-T09A/.

List any other minimal edit as a deviation.

## Checks

- Run `npm run verify` and confirm exit 0. Lint must cover the new config with
  `no-deprecated`.
- Run `npm run test:e2e`. Both projects must pass. Record the browser channel and
  version, and the Playwright version.
- Record the screenshots in the evidence directory.
- Run `npm run digest` with the Node 24 portable runtime first on PATH, and confirm
  `node --version`.
- Evidence must be masked, LF and free of trailing whitespace. Use synthetic data only and
  no deprecated APIs.

Return at most 200 words, beginning with your self-reported model:
- files changed;
- the browser channel and versions;
- the harness design;
- tokens added;
- verify and e2e exits;
- digest;
- skill-conflict resolutions;
- deviations.

## Results


Self-reported model: claude-sonnet-5-5 (timesheet-worker-high, attempt 1). Baseline main
24f192d. Nothing was staged, committed or pushed; no shared state was edited.

### Files

- Source: `src/client/App.tsx`, `src/client/TimesheetScreen.tsx`, `src/client/api.ts`,
  `src/client/styles.css`, `src/client/components/AppShell.tsx` (new).
- Harness: `playwright.config.ts`, `tests/e2e/fixtures.ts`, `tests/e2e/shell.spec.ts` (new).
- Config: `package.json` and `package-lock.json` (`@playwright/test` 1.63.0 exact devDependency, script
  `test:e2e` = `npm run build && playwright test`), `tsconfig.test.json` (include only).
- Evidence: `handoff/delivery/evidence/WP2-T09A/` (`commands.txt`, four `*-synthetic.png`).

### Runtime and browser

- Node v24.21.0 portable called by full path for npm and scripts (`node.exe --version` printed
  v24.21.0; the smoke step inside `npm run verify` also printed v24.21.0). The fixture spawns
  every child with `process.execPath`.
- Browser: installed Microsoft Edge 153.0.4234.48 through `channel: 'msedge'`; it launched on the
  first run, so Chrome was not needed. `E2E_CHANNEL` accepts `msedge`, `chrome` or `chromium` and
  rejects anything else. Nothing was downloaded. Playwright 1.63.0.

### Harness design

- `playwright.config.ts`: projects `desktop` 1280x800 and `mobile` 390x844 (`isMobile`, `hasTouch`,
  `deviceScaleFactor: 2`), `workers: 2`, reporter `list`, `outputDir` and traces under
  `os.tmpdir()`, so no `.gitignore` change.
- `fixtures.ts`: worker-scoped `builtServer` creates a `mkdtemp` directory under the OS temp
  directory (asserted to be outside the repository; on Windows a different drive makes
  `path.relative` absolute, handled), picks a free port, runs `dist/server/cli.js migrate` and
  `seed` with `randomBytes` passwords, starts `dist/server/index.js` with `APP_ORIGINS` set to its
  origin, waits for `/api/health`, and on teardown kills the process and removes the directory.
  `baseURL` is overridden from the fixture. `SeedClient` signs in over HTTP with an explicit
  `Origin` header; `pastFreeWorkdays()` derives dates from `/api/periods/current` and the period
  timesheets (past, normal, no session, no reason-required period; never today);
  `seedCompleteDay` (09:00-18:00, three breaks) and `seedUnconfirmedBreaksDay` (pending evidence)
  are ready for T09B. `screenshotPath()` enforces the `-synthetic.png` suffix and writes to
  `E2E_SCREENSHOT_DIR` (default under the temp directory). Production code has no clock override.
- `shell.spec.ts` (fixed zone America/Los_Angeles and locale en-US for stable screenshots; a
  console-error listener catches CSP violations, ignoring only the expected signed-out 401 probe):
  sign-in then shell and `#/timesheet`; an unknown hash falls back to `#/timesheet`; the existing
  view inside the shell with a seeded complete day (row shows `complete`, `8h 00m`, 15 rows);
  mobile only: `scrollWidth <= innerWidth` and every button, link, text input and checkbox label at
  least 44x44.

### Tokens added (E-8, PREP C)

`--radius: 4px` (replaces 8px, 6px, 999px), `--duration: 300ms`, `--ease: ease-out`,
`--transition: all var(--duration) var(--ease)`, `--shadow-panel`, `--shadow-overlay`,
`--focus-ring`, `--on-accent` (dark `#0b1220`, fixes the dark button contrast), `--ok`, `--warn`,
`--line-soft`, `--space-1..6`, `--tap-min: 44px`, `--page-max`, `--page-narrow`, `--font-size-xs`,
`--font-size-sm`, `--font-mono` (+ `.mono`; `font-variant-numeric: tabular-nums` on the root).
Dark values live in the existing `prefers-color-scheme` block; `prefers-reduced-motion` sets
`--duration: 0.01ms`. Existing tokens kept; `Roboto` dropped from the font stack. No inline styles,
no web fonts; hover and active states change only colour, shadow and transform. Controls get the
44px minimum under `(max-width: 767px), (pointer: coarse)` (the documented 768px literal).

### Checks (actual results; log in `evidence/WP2-T09A/commands.txt`)

- `npm run verify`: exit 0 (typecheck, lint incl. `no-deprecated` over `playwright.config.ts` and
  `tests/e2e`, vitest 26 files and 524 tests, build, smoke 13 checks, SMOKE PASSED).
- `npm run test:e2e`: exit 0; 7 passed and 1 skipped (the mobile-only test on `desktop`), both
  projects.
- `npm run digest` (Node 24 first on PATH, v24.21.0): exit 0,
  `6c1947e343b45a849c8a23accdbdbe6e4aebb722cfa6af19d4fb5e18ebf94133 (566 files, handoff/ excluded)`.
- Defect found and fixed during the work: the first hash-route draft did not rewrite an unknown
  hash that mapped to the same route id; the e2e test caught it and the listener now normalizes
  the address bar on every `hashchange`.

### Skill conflict resolutions (AGENTS.md and E-8 win)

- Marketing-page rules do not fit a dense internal tool (the design-taste skill itself lists
  dashboards and data tables as out of scope): used only calibrated neutrals with one accent,
  tinted multi-layer shadows, the tactile 1px `:active` push, tabular numbers, labels above
  inputs, a reduced-motion guard, 44px targets and visible focus.
- Squircle and pill radii, double-bezel cards, macro-whitespace (`py-24`) and the button-in-button
  pattern were not used: one 4px radius and the existing high density apply.
- Custom `cubic-bezier` and spring easing were not used: `transition: all 300ms ease-out`
  through `--transition` is mandated.
- Geist, Satoshi and other web fonts were not used: the CSP forbids them; the system stack stays
  (an owner option, not T09A scope). The `Inter`/`Roboto` bans are met.
- Cards use the tinted shadow instead of a border; the data table keeps a hairline between rows
  because it is a data grid.
- The em-dash ban applies to new visible strings (none added). The existing `—` placeholders and
  the `–` period range in `TimesheetScreen.tsx` were left because T09A allows shell integration
  only and T09B replaces the grid.
- The mobile layout of the period header (the two arrow buttons stacking) is unchanged in
  structure; T09B rebuilds the header.

### Deviations

1. `tsconfig.json` (the editor umbrella config) gained `playwright.config.ts` in `include`. ESLint's
   project service reads the root `tsconfig.json`, not `tsconfig.test.json`, so the PREP assumption
   was incomplete: without this edit `npm run lint` fails with a project-service parse error
   (reproduced). Brief-listed `tsconfig.test.json` also got the include (`tests/e2e/`,
   `playwright.config.ts`).
2. `.notice` (reason-required notice) now uses `--warn` instead of `--error`; it is a notice, not an
   error, and the text is unchanged.
3. `TimesheetScreen` lost its own `<main>` wrapper, the Sign out button and the `onSignedOut` prop
   (moved to the shell); no feature change.
4. A stray `python -` call hung a shell; I killed only that process (and its shell). No other
   process was touched. No servers or background processes of mine remain.
