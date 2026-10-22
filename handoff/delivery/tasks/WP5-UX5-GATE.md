# WP5-UX5-GATE dispatch brief (package-final gate of rounds 4 and 5)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-GATE, package WP5, kind gate,
  attempt 1. It depends on WP5-UX5-T06-FREEZE.
- **Scope.** By owner decision Q0 a, this one gate covers UI change round 4 and round 5.
  Round 4's last gate (WP5-UX4-REGATE2) ended NOT VERIFIED before FIX3.
- **The previous accepted snapshot** is BASE_SHA = 8e557100d16b6b6eb86a48e00276835761aabfdf
  (digest 507de97c, 833 files; gate WP5-UX3-REGATE5; audit WP5-UX3-AUDIT-INT).
- **The frozen commits since then, in order:**
  - **Round 4:**
    - T04 5a68fba (server);
    - T01 213bbdc (the owner's manual commit);
    - T02 b7cc063, T03 cda9c51, T05 82d1ab4, T06 a3042dd;
    - FIX1 0ddfead, FIX2 178f1cf, FIX3 57c41e8.
  - **Round 5:**
    - T01A c1b2cc4 and T01B 9917ae8 (server, data, migrations 0014 and 0015);
    - T02 b4c5004 (the PDF and the font asset);
    - T03 65def2f (Review);
    - T04 060302b (breakpoints, top bar, period card);
    - T05A 70f7800 (sheets and controls);
    - T05B 69d6340 (Day editor);
    - T06 (docs and the pilot packet) at the target below.
- **Target.** Written under "Target at dispatch" below.
  - Compute the target digest on a clean `git archive` export. Cross-check it with the
    `git ls-tree` form and with `npm run digest`.
  - Uncommitted coordinator records under `handoff/` are expected.
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  - Routing: size L, risk H, novelty no.
  - This is a package-final snapshot of two rounds. It includes:
    - two migrations;
    - the split of sign-off and send, with the reason rule;
    - the signed PDF with a new font asset;
    - authentication and privacy changes from round 4;
    - a layout-wide breakpoint change.
  - Write the records in English.
- **AGENTS.md on disk wins.** Its UI section is "Frontend and UI/UX standards".

## Read

- AGENTS.md from disk first.
- `handoff/delivery/tasks/WP5-UX4-GATE.md`: the method, limits and evidence layout of the
  last full gate. Its Results show what the gate found. Reuse its methods; this brief lists
  what differs.
- `handoff/delivery/tasks/WP5-UX4-REGATE.md` and `WP5-UX4-REGATE2.md`.
- The round-4 fix records `WP5-UX4-FIX1.md`, `FIX2.md` and `FIX3.md`, and the audit
  records `WP5-UX4-AUDIT-A.md` and `WP5-UX4-AUDIT-B.md`, for the claims to verify.
- The round-5 plan `handoff/delivery/tasks/WP5-UX5-PLAN.md`, sections E and "E, revised"
  (the gate additions).
- The round-5 slice records `WP5-UX5-T01a.md`, `T01B.md`, `T02.md`, `T03.md`, `T04.md`,
  `T05A.md`, `T05B.md` and `T06.md` (Results and addenda).
- The owner's and coordinator's decisions of 2026-10-20 to 2026-10-22 on the board.
- The simulated-clock preload and wrapper from `handoff/delivery/evidence/WP5-UX-FIX10/`.
  Copy them into your task folder; never add them to the repository.
- For the axe scan: the method of `handoff/delivery/tasks/WP5-UX-A11Y-SWEEP.md`. Load the
  axe engine from a temporary location outside the repository; add nothing to
  `package.json` or the lockfile.

## Gate items

1. **The WP5 gate** (UX4 gate item 1, on a clean export of the target):
   - `npm ci`;
   - lint with deprecation tracing;
   - `npm run verify`;
   - the FULL e2e on both projects on the real clock, with per-project counts. Record the
     Los Angeles time and the period shown;
   - AC-13 three times, and once each under `Asia/Tokyo` and `America/New_York`;
   - **the drill `--wp3`.** It has not run since round 5 changed it (T01B and T02 edited
     `scripts/container-drill.mjs`). Record:
     - every stage and its counts;
     - the schema version after the upgrade (15);
     - a PDF rendered inside the container with the Indie Flower asset present.

     `docker version` comes first. If the engine is unreachable, finish every other item and
     report NOT VERIFIED for the drill only.
   - the compose config forms, the env keys and `npm audit --omit=dev`;
   - the validators, including check_recovery (106 probes) and the precommit self-test;
   - **`npm test` three times.** A vitest worker crash in any run is a FAIL to report, not a
     flake to rerun.
2. **Server, data and business boundary.**
   - Build BASE_SHA and the target from clean exports.
   - Run `git diff --stat BASE_SHA..TARGET -- src/server src/domain`, and list the migration
     files added. Map every path to the slice that recorded it:
     - round-4 T04 and FIX2;
     - round-5 T01A and T01B (migrations 0014 and 0015, finalization, submission routes,
       sends, jobs, mail, deliveries, shares, settings, operations status);
     - T02 (`src/server/pdf`, `src/domain/brand.ts`);
     - T05A (the `src/domain/policy.ts` message).

     Flag any unmapped path.
   - Map the `dist/server` and `dist/domain` differences to those sources.
   - List the route-table difference against BASE_SHA. The expected changes are:
     - round 4: `POST /api/auth/password`;
     - round 5:
       - `GET /api/revisions/:id/send-draft`;
       - `POST /api/revisions/:id/send`;
       - the revision PDF route with `time`, `ot` and `disposition`;
       - `GET /api/timesheets/:date/pdf-preview`;
       - the old resend route, replaced or reduced.

     Confirm that none of the send, send-draft or render routes is on the shared allowlist,
     and that the shared PDF route ignores its query and never renders.
3. **Round scope.**
   - Run `git diff --stat BASE_SHA..TARGET` outside `handoff/`. Map every path to its slice
     or slices, and flag any path outside the slices' recorded owned paths.
   - `git ls-files` shows exactly one font file:
     `assets/pdf-fonts/IndieFlower-Regular.ttf`, 108,196 bytes, with the SHA-256 recorded in
     its README.
   - There is no raster outside `reference/` and `-synthetic.png` evidence, except the
     earlier `WP1/ui-timesheet-synthetic.jpg`.
   - No `.json` was added outside `handoff/`.
   - Check that no test assertion was removed or weakened beyond the changes listed in the
     slice records. Sample at least two per slice of both rounds against the diff. Check
     these three specially:
     - T05A's change to the mobile "every control is 44 by 44" test;
     - T03's replacement of the History-resend part of `submission.spec.ts`;
     - T02 and T05A's `automation.spec.ts` PDF assertions.
   - There is no new `skip`, `fixme` or `.only` beyond project-conditional skips.
4. **Data, sends and PDF** (round 5). Run each named integration file once and record its
   counts; where no test exists, probe on the export:
   - **The migration upgrade from a schema-13 database** holding signed, automatic,
     corrected and sent revisions. Check:
     - rows are copied;
     - `revision_files.variant` is derived (`t1o1`, or `t1o0` when the snapshot had OT rows
       off);
     - one `revision_sends` row is backfilled per existing send job;
     - `signoffs.signature_attachment_id` is nullable, and the triggers still refuse a
       foreign image;
     - foreign keys and integrity are OK.
   - **Backup and restore** of a database holding PDF variants and send rows (the drill's
     restore stage, or a probe). Every file equals its manifest.
   - **Sends:**
     - sign-off enqueues no send;
     - a replay with the same request key returns the same send;
     - the same key with another body gives 409;
     - two concurrent sends give exactly one send;
     - `reason_required` follows the counting rule: `accepted` and `uncertain` count;
       `failed_permanent` does not;
     - a resend decision on an uncertain attempt needs the reason;
     - the send job builds the message from its own row.
   - **Deadline and reminders (F-2 a, H-1 a):**
     - a signed, unsent revision is sent at the deadline with auto-submit on, and warned
       with it off;
     - a period with any send on any revision counts as submitted: reminders stop, and a
       later correction is not sent automatically.
   - **PDF:**
     - all four variants are one page;
     - the embedded font subsets include Indie Flower, and DejaVu Serif Italic is the
       per-cell fallback;
     - the header, titles, fields, footer texts and year;
     - the name-only signature versus image and name;
     - the bytes are deterministic;
     - `pdf-visual` passes;
     - the shared mount never renders.
5. **Simulated-clock sweep** (America/Los_Angeles; UX4 gate item 4 method; validate the
   preload with one control first).
   - The FULL suite on both projects at `2026-10-26T16:00:00Z`, `2026-11-01T08:45:00Z` and
     `2027-03-14T10:30:00Z`.
   - `day-editor`, `today`, `timesheet`, `review`, `submission`, `settings-transfer` and
     `profile` specs on both projects at `2026-10-27T06:58:30Z`,
     `2026-12-31T23:30:00-08:00` and `2027-01-01T08:30:00Z`.
   - Every run ends with 0 failed. A run that fails only with a network or buffer error is
     rerun once, **the full run or the same spec set, not the single test**, and both runs
     are recorded. Any other failure is reported as is.
   - Record a table: instant, window or outside, scope, and the counts per project.
6. **UI checks.** Measure these on the build of the target. Each check gives a number or a
   yes/no with its method.
   - **Round-4 rechecks:**
     - the T02 keyboard walk at 768, 1024 and 1280, Tab and Shift+Tab, with seeded long
       content. No focused control may be wholly under the drawer; this was the FIX1
       defect;
     - non-modal from 768px;
     - the beside/floating sweep at the need minus 1, the need and the need plus 1;
     - the discard prompt;
     - the session-dialog checks of the UX4 gate;
     - `classic-scrollbar.spec.ts` and the FIX2/FIX3 behaviour: no layout flap when a
       classic scrollbar appears;
     - Escape does not leak from a nested dialog;
     - Current-period focus.

     The drawer corners are now 0 on every side (U5-23 supersedes the UX4 gate's 12px
     sheet-side corners).
   - **Breakpoints (T04):**
     - sweep 470-490 and 760-776 in 1px steps: exactly one layout in the DOM, and its
       styles apply;
     - at 600px the tab bar and the 7-column grid show together without page scroll;
     - fractional widths: try a device emulation that yields 479.33 and 767.33 CSS px. If
       no browser method sets them, say so; T04 proved them on the stylesheet text only;
     - the wordmark sweep 320-1440 (own and shared views): it never wraps a bar row;
     - the period card in both arrangements at 1440, 900, 631/632, 480, 390 and 320;
     - the range ladder;
     - the U5-14 primary table;
     - compact 8px edges at 320-479.
   - **Controls and sheets (T05A):**
     - the seam profile at DPR 1, 1.25, 1.5, 1.75 and 2, both themes, one layer;
     - sub-buttons 36px with a 44px hit area (elementFromPoint) below 768px and with a
       coarse pointer;
     - theme segments 32px and 44px;
     - spaced and tight ranges;
     - header wrap order on Timesheet and **Review**. T05A set the Review header to
       `nowrap`; measure whether it wraps by group as U5-16 asks, and report;
     - Open a day and Change several days at their AC widths;
     - Today spacing, worked-line groups, the WEEK bar fill from 480 to 913px.
   - **Day editor (T05B):**
     - the outside-press matrix (closes; controls keep their action; another column
       switches), with the discard guard;
     - the phone backdrop;
     - the Partial leave dialog: Done writes no server request; Save with the reason
       stores it; Cancel and Escape behave as specified;
     - at 390x844, Save is fixed in the foot and there are no Figures;
     - focus returns.
   - **Review (T03):**
     - the title has no submission id;
     - the check card shows "Back" below 480px;
     - the Preview company line hides rather than wraps;
     - one column at 1440;
     - the signature geometry fractions match the PDF's within 1% of the content width;
     - the Sign off dialog, with an image and without one;
     - the "Not signed off" alert, and a stale review;
     - the Send card:
       - disabled before sign-off;
       - edited To, Cc, Subject, body and switches reach local capture exactly, with the
         matching PDF variant;
       - the reason dialog after a copy counts;
       - the 409 path;
     - the Settings switch "Time rows on the PDF" and the settings-file key round trip;
     - the History reason and the `revision.send` label;
     - the admin "Not sent yet";
     - grantees see no Sign off or Send.
   - **A real axe scan** (WCAG 2.2 AA tags), light and dark, of:
     - Timesheet at 1440 (drawer beside), 1280 (floating), 600 and 390;
     - the narrow period card;
     - the Day editor with the Partial leave dialog and the discard prompt;
     - the phone sheet;
     - Review at 1440 and 390;
     - the Sign off dialog, the Send card with the reason dialog, and "Not signed off";
     - Settings with the submission defaults;
     - History with a send;
     - Administration status;
     - Profile.

     Report every violation.
   - **Contrast of the new tokens** (`--worked-line` and its text, the danger sub-button,
     the chevron, the period-card divider, the Preview header and chips), in light, dark and
     both manual overrides.
   - **Build:**
     - no chunk-size advisory; record the main chunk and the lazy Review, Administration,
       Import and SettingsTransfer chunks;
     - the CSP header is unchanged against BASE_SHA, and there is no
       `securitypolicyviolation`. "PDF Preview" opens in a new tab;
     - an employee page makes no `/api/admin/` request.
7. **Screenshots.** Synthetic only; basenames end in `-synthetic.png`; at most 16. For the
   owner and the auditors:
   - Timesheet at 1440 (light and dark), 600 and 390;
   - the period card, narrow;
   - the Day editor with the Partial leave dialog;
   - the phone sheet;
   - Review at 1440 and 390;
   - the Sign off dialog;
   - the Send card with the reason dialog;
   - the signed footer;
   - a PDF variant page with the time rows off;
   - Settings defaults;
   - History with a send reason.

**Decision:** PASS, FAIL or NOT VERIFIED. NAS items stay NOT VERIFIED, as in earlier gates.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-GATE`. Set TEMP and TMP to it.
- Ports: 49820-49859, with `SMOKE_PORT` in that range.
- Give each Playwright run its own output folder, and run them one after another.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- **Docker:**
  - use Compose project `ts-wp5-ux5gate`, with non-TTY flags only;
  - at the end, remove the drill image by exact tag and the project by name;
  - record `docker ps --all --filter name=ts-wp5-ux5gate`, which must be empty.
- Use Git Bash only, never cmd.exe, and never an interactive shell. Never create links or
  junctions.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES), NO `| node`, NO `| python`, NO `node -e` (NOT EVEN `node -e "1"`), NO `node -` OR
  `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
  `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`, ALSO NOT IN `2>`.**
  - Write scripts with the Write tool and run them by path.
  - Run Python only as the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
    Write `<user>` in the evidence.
  - Put Node 24 first on PATH with `cygpath -u` before any node call. The first shell call
    is `node --version`, and it must print v24.x.
- **Create files only inside the task folder and the evidence folder.** Probes run in a
  scratch copy of the export, never in the gate export.
- Never stop a process you did not start, and never kill by PID. Never remove anything
  recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Use synthetic data and local mail capture only. `PRODUCTION_SENDING_ENABLED` is never
  set.
- Never edit source, docs, tests, the board or STATE.
- Leave nothing running. Before returning, make sure none of your background commands is
  still running.
- In your Results and evidence:
  - no email address except the full synthetic `@example.invalid` form;
  - no real profile path (use `<user>`);
  - no exported settings file or `.json`.

## Output

- **Results** go in this file: the decision, the gate notes, and every item with its
  commands, exit codes and counts.
- **Evidence** goes in `handoff/delivery/evidence/WP5-UX5-GATE/`: masked LF `.txt` files and
  at most 16 `-synthetic.png` files.
- **Return** at most 250 words, beginning with 'Self-reported model: ...'.

## Target at dispatch

(written by the coordinator before dispatch)

## Results
