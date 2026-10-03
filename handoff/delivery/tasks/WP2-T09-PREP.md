# WP2-T09-PREP dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T09-PREP; package WP2; kind plan;
  attempt 1. A read-only pre-flight for WP2-T09. It runs beside the WP2-CALFIX writer, as
  the plan's section on parallel read-only work allows.
- Profile/routing: timesheet-planner, requested sonnet/high, no override. Routing: size S,
  risk M, novelty yes (the first browser harness and the design standard). Records in
  English.
- Read AGENTS.md from disk first, especially the "Unified Frontend & UI/UX Standards"
  section, which requires three design skills. Then read:
  - [WP2-PLAN](WP2-PLAN.md): T09–T12, observations 8–10, and E-8 and E-9 in section E,
    together with the owner's E-8 decision on the board record;
  - docs/04 lines 7, 14 and 38, and any other UI requirements it names;
  - the client code: src/client/App.tsx, TimesheetScreen.tsx, api.ts and styles.css;
  - package.json, scripts/smoke-built-server.mjs, src/server/seed.ts and the API routes
    the views will use (timesheet view, days batch, OT summary).

## Hard limits

- Read-only: change no source, configuration, package or lock file. Install nothing,
  download no browser and commit nothing.
- You may run read-only probes and record them:
  - `npm view @playwright/test version`, to check that the registry is reachable;
  - checks for whether Microsoft Edge or Google Chrome is installed, for a Playwright
    `channel`;
  - `node --version` with the Node 24 portable runtime first on PATH.
- Load the three design skills with the Skill tool: `stitch-design-taste`,
  `design-taste-frontend` and `high-end-visual-design`. Apply their rules to this
  repository's plain CSS. E-8 keeps plain CSS, with a 4px radius and 300 ms ease-out
  transitions set through CSS custom properties.

## Output (append under Results; keep it to about one page)

A. The recommended T09 file layout and component split, within the T09 owned paths of the
   plan.
B. The Playwright approach:
   - package version and config;
   - browser source: an installed Edge or Chrome through `channel`, or a downloaded
     Chromium, with the reason;
   - how the harness starts the built server on a fresh temporary database with the
     synthetic seed and dates relative to today, without any production clock override;
   - viewports: desktop and 390×844;
   - screenshots named `*-synthetic.png`.
C. The CSS custom properties to add (names and values) for E-8 and the three skills, and
   which existing tokens stay.
D. The API endpoints and fields the T09 views need:
   - two-week grid: category, time, due date, completeness and pending OT;
   - mobile day list;
   - batch edit with the conflict dialog and reason prompt.
   Flag any missing field as a gap; do not fix it.
E. Risks, and a split if T09 is too large for one task, for example T09a (harness and
   shell) and T09b (grid, mobile and batch).

- Writable: this file and handoff/delivery/evidence/WP2-T09-PREP/. Probe outputs are
  masked, LF and end with a single final newline.

Return at most 250 words, beginning with your self-reported model, summarizing A–E.

## Results

Self-reported model: claude-sonnet-5-5 (timesheet-planner, attempt 1). Evidence:
`handoff/delivery/evidence/WP2-T09-PREP/probes.txt` (node v24.21.0 exit 0; registry
`@playwright/test` 1.63.0 exit 0; Edge 153.0.4234.48 and Chrome 154.0.8037.97 installed).
Nothing was changed, installed or downloaded.

### Skill conflict rule (applies to A-C)

The three skills target marketing pages (pill buttons, 2rem squircles, `py-24`, double-bezel,
Geist, web fonts). AGENTS.md and E-8 win where they conflict: 4px radius, high density,
`transition: all 300ms ease-out` through one custom property. Used from the skills: calibrated
neutrals with one accent, tinted multi-layer diffuse shadows, tactile `:active` push,
mono/tabular numbers, labels above inputs, skeleton/empty/error states, reduced-motion guard,
44px touch targets, one corner-radius system, no pure black, no emoji, no decorative dots.

### A. File layout (all inside the T09 owned paths)

- `src/client/App.tsx`: auth gate plus `AppShell`; hash route (`#/timesheet`), no router
  dependency, no server change (SPA fallback already exists). Only "Timesheet" in the nav;
  T10-T12 add Day, OT, History, Settings entries.
- `src/client/TimesheetScreen.tsx`: container only (period load, view state, selection,
  messages, clock actions); no table markup.
- `src/client/components/`: `AppShell`, `PeriodHeader` (prev/next, relation badge, due local plus
  "your time", calendar warning), `ClockBar` (extracted), `TimesheetGrid` (desktop table, two
  Monday-Sunday blocks, select column), `DayList` (mobile), `DayStatus` (completeness and pending
  OT as text plus shape, never colour only), `BatchBar`, `BatchDialog` (native `<dialog>` +
  `showModal()`: preview, conflicts, reason), `format.ts` (hours/minutes via `formatDuration`),
  `dayModel.ts` (pure: week groups, completeness, pending flag).
- Exactly one of grid/list renders, chosen by `matchMedia('(min-width: 768px)')` (no scroll
  listener), so there is one set of checkboxes.
- `src/client/api.ts`: add types (full DayView, batch, OT summary, calendar warnings) and keep
  `error.details` on `ApiRequestError` (today it is dropped; the conflict dialog needs it).
- `playwright.config.ts`, `tests/e2e/{fixtures.ts,timesheet.spec.ts}`, `package.json` and
  `package-lock.json` (`@playwright/test` 1.63.0 pinned exact, script `test:e2e` only).

### B. Playwright approach

- Package: `@playwright/test` 1.63.0 (exact pin like every other dependency), devDependency
  only, not part of `verify`. Script `test:e2e`: `npm run build && playwright test`.
- Browser: installed Edge via `channel: 'msedge'` (present here; no ~150 MB download, no network,
  no browser inside the repo). Override with `E2E_CHANNEL=chrome` or `chromium`; the last needs
  `npx playwright install chromium` (downloads under `%LOCALAPPDATA%\ms-playwright`, per E-9).
  Contexts are fresh and never touch the user's profile. Risk: Edge 153 versus a Playwright
  build that expects a different Chromium; T09 must prove it with a run, with Chrome as fallback.
- Harness: a worker-scoped fixture (one server and one database per project) in a `mkdtemp`
  directory under `os.tmpdir()` (outside Dropbox). It spawns `dist/server/cli.js migrate` and
  `seed` with random `SEED_*_PASSWORD`, picks a free port, sets `NODE_ENV=development`,
  `HOST=127.0.0.1`, `APP_ORIGINS=http://127.0.0.1:<port>` and starts `dist/server/index.js`
  (same recipe as `scripts/smoke-built-server.mjs`). It overrides `baseURL` from the fixture.
  Data are created over HTTP with an explicit `Origin` header, relative to the real clock:
  `GET /api/periods/current` and `GET /api/periods` give the in-progress and previous period;
  it picks past `normal` days (`classification.day_class`) from `GET /api/timesheets/:payroll`
  and writes: a complete 09:00-18:00 day with three breaks; an overtime day with credit; a day
  with unconfirmed breaks (pending OT); a clock-source session day (conflict target); and one
  day in the previous (old) period (reason required). Sessions cannot end in the future, so
  never seed today; if the in-progress period has no past workday use the previous one only.
  No clock override is added; assertions derive dates from the same API values. Teardown kills
  the process and removes the directory.
- Viewports: `desktop` 1280x800 and `mobile` 390x844 (`isMobile`, `hasTouch`,
  `deviceScaleFactor: 2`), `workers: 2` (isolated stores), `reporter: 'list'`.
- Screenshots: `*-synthetic.png` (privacy hook), written to `E2E_SCREENSHOT_DIR` (default under
  the OS temp dir); `outputDir` and traces also go to temp so no `.gitignore` change is needed.
  The verifier copies the named files into `handoff/delivery/evidence/WP2-T09/`.
- Assertions: grid has 14 rows and shows due date, completeness and pending OT; the mobile page
  has `scrollWidth <= innerWidth`, controls at least 44px, list instead of table; both zones
  and the accounting date are visible; conflict dialog; 422 reason prompt; stale 409 message.

### C. CSS custom properties (E-8 plus the three skills)

Existing tokens stay: `--bg --card --text --muted --line --accent --error --off`, font stack
(drop `Roboto` from the fallbacks), `color-scheme`, the dark block. Add to `:root` (dark values
under the existing `prefers-color-scheme` block):

- Shape and motion: `--radius: 4px` (replaces 8px/6px and the 999px badge); `--duration: 300ms`;
  `--ease: ease-out`; `--transition: all var(--duration) var(--ease)` (AGENTS wording, applied
  to buttons, links, inputs, rows; hover/active/focus change only colour, shadow, transform).
  Under `prefers-reduced-motion: reduce`: `--duration: 0.01ms`.
- Contrast fix: `--on-accent: #ffffff` light, `#0b1220` dark (existing white on dark `#6ea8ff`
  is about 2.4:1, a defect). `--tap-min: 44px` (mobile controls).
- Shadows (tinted to `#1c2430`, not black; dark uses `rgb(4 8 14 / .4)` layers):
  `--shadow-panel: 0 0 0 1px rgb(28 36 48 / .06), 0 1px 2px rgb(28 36 48 / .04), 0 4px 12px
  rgb(28 36 48 / .05), 0 12px 32px rgb(28 36 48 / .04)`; `--shadow-overlay`: the same four
  layers at roughly double strength; `--focus-ring: 0 0 0 3px rgb(31 95 191 / .35)` (dark
  `rgb(110 168 255 / .45)`), with a transparent outline for forced colours. Cards use the
  shadow, not a harsh border; table rows keep a hairline `--line` (data grid).
- Status (semantic, not a second accent; always paired with text): `--ok: #1a7f4b` (dark
  `#5fd29a`), `--warn: #8a5a00` (dark `#e3b341`). `--line-soft: #e8ecf1` (dark `#232a34`).
- Spacing and type: `--space-1..6: 4 8 12 16 24 32px`; `--page-max: 1200px` (existing);
  `--font-size-xs: .8rem`, `--font-size-sm: .9rem`; `--font-mono: ui-monospace, 'Cascadia Mono',
  'SF Mono', Consolas, monospace` with `font-variant-numeric: tabular-nums` for all times and
  minutes (density above 7). Fonts stay the system stack: CSP `default-src 'self'` forbids CDN
  fonts and Geist would need a new dependency plus self-hosting (record as an owner option, not
  T09 scope). Custom properties cannot drive media queries; the breakpoint is a documented
  768px literal. No inline `style` attributes anywhere (CSP `style-src 'self'`).

### D. API fields for the views (gaps flagged, none fixed)

Two-week grid, from `GET /api/timesheets/:payrollDate`:
- Category/time: `days[].category`, `category_source`, `default_category`, `entry` (version,
  null for a default row), `sessions[]` (`start_utc`, `end_utc`, `input_zone`, `work_date`,
  `breaks_confirmed`, `breaks`), `wfh`, `leave_minutes/leave_kind`, `calculation.*_minutes`.
- Due date: `period.due_local_date/due_local_time/due_at_utc` (per period, `relation`),
  `reporting_zone`, `current_payroll_date`, `reason_required`, `timesheet.finalized`.
- Completeness: `calculation.status` (`complete|incomplete|incomplete_breaks|no_records`),
  `attendance_expected`, `calculation_error`. Pending OT: `totals.pending_days` (period) and
  `credited_minutes`, `deficit_minutes`; `GET /api/ot/summary` gives
  `posted/reserved/available_minutes`, `provisional_minutes`, `provisional_periods[]`.
- Mobile day list: the same payload; `GET /api/days/:workDate` refreshes one day.
- Batch: `POST /api/days/batch` `{mode, entries[{work_date, category, expected_version}], reason,
  confirm_conflicts}`. Preview returns `can_commit`, `reason_required(_dates)`,
  `requires_conflict_confirmation`, `conflicts[]` (session counts, ids, current/new category),
  `entries[]` (before/after/status). Commit errors: 409 `stale_version`
  (`details.work_dates`), 409 `conflicts_require_confirmation` (`details.conflicts`), 422
  `reason_required`, 422 `batch_invalid`.

Gaps (observations, for the coordinator):
1. No per-day `completeness` or `ot_pending` field; derive in `dayModel.ts` from
   `calculation.status` and `attendance_expected` (client-only, T09 owned). Decide that a
   no-record expected day shows "missing", not pending OT.
2. Batch conflicts give counts/ids only; the dialog joins them to `sessions[]` by `work_date`
   to show times (client join, no server change). Minor.
3. Review/delivery status (docs/04:7) has no source until WP3; show only `timesheet.finalized`
   ("Draft"), no invented values.
4. `ApiRequestError` drops `error.details` (client defect in `api.ts`, T09 owned).
5. `GET /api/ot/summary` is fine for a header total; `provisional_periods[]` lacks per-day data.
6. No server endpoint lists the due state of other periods in one call; prev/next uses
   `/api/periods?from=&to=` as today.

### E. Risks and split

- Tooling files outside the T09 owned paths: `tsconfig.test.json` needs `playwright.config.ts`
  in `include`, or `npm run lint` fails with a projectService parse error (eslint
  `allowDefaultProject` lists only `eslint.config.js` and `scripts/*.mjs`). Add
  `tsconfig.test.json` to the T09 owned paths. `.gitignore` needs no change because outputs go to temp.
- Pure client logic (`dayModel.ts`) has no vitest home (`tests/**/*.test.ts` is outside the
  owned paths; `tests/e2e` is Playwright). Cover it through e2e, or add `tests/client/`.
- Skill clash (squircles, pills, `py-24`) versus E-8 and density is resolved above; record it so
  the auditor does not flag "missing" skill elements.
- CSP blocks inline styles and CDN fonts; seeded data near a period boundary or midnight in
  America/Los_Angeles can flake (derive from the API; fall back to the previous period).
- Edge/Chrome version drift against Playwright 1.63.0 (prove with one real run).
- `transition: all` is mandated; hover states must not change layout properties.
- Dark-mode contrast: verify `--accent`, `--muted`, `--warn` on both themes.
- Size: M is optimistic. Recommend splitting into T09a (about S/M: dependency, config,
  fixtures/harness, CSS tokens/E-8 refactor, shell, `api.ts` types, login-to-empty-view smoke at both
  viewports, first screenshots) and T09b (M: grid, mobile list, `dayModel`, batch bar/dialog,
  conflict/reason/stale flows, full spec). T09b depends on a T09a freeze; each has its own
  freeze. If kept as one task, run it at high effort with the harness proven first.
