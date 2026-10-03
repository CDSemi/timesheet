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
- Baseline: main at the WP2-CALFIX-FREEZE commit. The coordinator gives the SHA at
  dispatch.
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

(Worker appends here.)
