# WP5 independent review, area B — reproducible release, verified restore and operations

Completed from [REVIEW](../templates/REVIEW.md). Translation: [WP5_REVIEW_B.vi.md](WP5_REVIEW_B.vi.md). Brief and results:
[WP5-ASSESS-B](tasks/WP5-ASSESS-B.md). Evidence: `handoff/delivery/evidence/WP5-ASSESS-B/` (index in `00-README.txt`).

- **Package/date/reviewer and observable model/effort:** WP5, first step (fresh assessment of the WP1–WP4 release
  candidate), area B. 2026-10-06, 20:22Z to 20:50Z. Reviewer: the `timesheet-auditor` subagent of task WP5-ASSESS-B,
  attempt 1. Self-reported model `claude-opus-5-5`; effort not observable. The strongest author model of the reviewed
  snapshot is `claude-opus-5-5` (WP4 and WP5-PLAN records), so the audit-strength rule holds.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** commit
  `546cddaf6747aef85e8b6d9b7712de9e28f138bf`, digest `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081`
  (775 files, `handoff/` excluded). HEAD = origin/main = `e7fe5144` (changes only `handoff/`). The digest matched before and
  after in the repository (`scripts/source-digest.mjs`), in the `git ls-tree` form of HEAD and of `546cdda`, and on three clean
  `git archive` exports (computed from the tar listing with raw git blob IDs). No source file outside `handoff/` differs from
  HEAD. Source complete.
- **Decision: FIX REQUIRED.** Two documentation findings in the operations runbook (B-01 Medium, B-02 Low). The software
  itself passed every check of this area: reproducible build, clean image, the drill, an independent restore with a
  finalized period, a correction and OT reservations, the uncertain-send reconciliation path, and operations privacy. No
  blocking integrity, privacy or recovery defect was found in the code.

## Scope actually inspected and executed

WP5-PLAN section B, "WP5-ASSESS-B", items 1 to 6, on clean exports outside Dropbox, synthetic data and capture mode only.
`PRODUCTION_SENDING_ENABLED` was never set and no real mail was sent. Git Bash only; npm ran its scripts through Git Bash
(`npm_config_script_shell`), so no `cmd.exe` was used. `DATA_DIR` and `DATABASE_PATH` were set inside the task folder for every
CLI and server run. Ports 47721–47725 and 47730. Compose project `ts-wp5-assess-b`.

Read: AGENTS.md (disk), the brief, WP5_REVIEW, docs/02, 05, 06, 07, 08, 09, 10 (restore and rollback decisions), 11, WP5-PLAN
sections A, B, C, F and G, the WP4_HANDOFF acceptance record and the WP4-REGATE4 drill evidence. Code traced: `ops/backup.ts`,
`ops/restore.ts`, `ops/manifest.ts`, `cli.ts`, `config.ts`, `routes/auth.ts`, `routes/submission.ts`, `routes/ot.ts`,
`services/deliveries.ts` (`decideDelivery`), `services/finalization.ts` (`resendRevision`), `seed.ts`, `Dockerfile`,
`.dockerignore`, `compose.example.yaml`, `.env.example`, `scripts/container-drill.mjs`.

## Evidence table

| Command | Result / exit | Evidence |
|---|---|---|
| `git archive 546cdda` twice, extracted to `src` and `src2` | the two tar files are identical (SHA-256 `7dc39d6a…`); export digest `26fcc969…`, 775 files | `00-export-digest-before.txt` |
| `npm ci` in both exports (`--trace-deprecation`) | exit 0 / 0, 161 packages, lockfile SHA-256 `dda35f8b…` unchanged, 0 deprecation lines | `01-npm-ci.txt` |
| `npm audit --omit=dev`; `npm audit` | 0 vulnerabilities / 1 high (`source-map-js` 1.2.1 via vite > postcss, dev only) | `02-npm-audit.txt` |
| `npm run build` in both exports, then `dist-hash.mjs` | exit 0 / 0; 230 `dist/` files, 4,044,281 bytes, every SHA-256 identical (tree `a7371fb8…`) | `03-build.txt`, `04-dist-compare.txt` |
| `npm run drill:container -- --work <task>\drill --project ts-wp5-assess-b --wp3 <task>\wp3` (`git archive 49651c8`, `npm ci`, `build:server`) | exit 0, `DRILL STAGES 1-6 PASSED`, 208 PASS, 0 FAIL (33/31/57/35/27/23), 6 min | `07-drill*.txt`, `05-wp3-prep.txt` |
| Drill image facts | ID `sha256:75f50c10…`, linux/amd64, 110,002,030 bytes (104.9 MiB), User `10001:10001`, healthcheck, `/data` volume, no labels; every build step was CACHED | `09-image-inspect.txt`, `07-drill-build-log.txt` |
| Independent forbidden-file scan of the image file list (`image-scan.mjs`, 12 rules) | 10,331 paths; forbidden total **0**; `/app` holds only `package.json`, `dist`, `node_modules`; 16 of 16 production packages, 0 dev packages; 560 third-party maps only under `node_modules` | `08-image-forbidden-scan.txt` |
| `.env.example`, `compose.example.yaml` | read in full: placeholders only, no secret value, SMTP password and seed passwords commented and empty | this report |
| Independent restore, host route (`xrestore.mjs`, 5 runs) | run 2 48/0, run 4 (uncertain mode) 63/0, run 5 50/0; runs 1 and 3 failed on probe errors only (see below) | `10-xrestore-run*.txt` |
| Same backup restored by the host build and by the image in the docs/11 section 6 one-off container form; tables compared | attempt 1 exit 1 (`backup_unreadable`: Git Bash rewrote `/backups` into a Windows path); attempt 2 with `MSYS_NO_PATHCONV=1` exit 0; all 29 tables equal after masking restore instants and the audit id; 3 files hash to the manifest | `11-container-restore.txt` |
| Restored instance started through Compose (docs/11 section 6 step 3) with the four `TIMESHEET_*` variables | healthy; log `Outbound delivery PAUSED … (reason: restored); 1 delivery attempt(s) await a decision`; `outbound release` preview blocked `attempt_uncertain`; `outbound resume --confirm` refused (exit 1); uid 10001; `down` by project name | `13-restored-instance-compose.txt` |
| `docker compose config` of the literal docs/11 `<compose>` form | case 1 exit 1 (`env file … timesheet.env not found`); case 2 binds `<project-dir>/data`, image `timesheet:local`, port 3000; case 4: the four variables in `<project-dir>/.env` resolve as intended | `12-runbook-compose-config.txt` |
| `docker buildx imagetools inspect node:24.21.0-trixie-slim` (docs/11 section 9 step 1) | exit 0; the tag's index is now `173f1258…` (rebuilt 2026-10-06 01:44Z); the Dockerfile pins `8ec5d755…` | `14-base-image-digest.txt` |
| `<compose> build --no-cache` (docs/11 section 9 step 3), same exact tag | exit 0, 15 s; new image ID `62fb1101…` (110,002,192 bytes); the drill image ID is then "No such image"; layers 1–6 equal, 7–10 differ | `15-build-no-cache.txt` |
| `/app/dist` of the no-cache image vs a local image-style build of a third export | 116 files, byte-identical; no `sourceMappingURL` in `/app/dist` | `16-image-dist-compare.txt` |
| Production-mode host CLI (`ops-cli.mjs`) | run 2 16/0: `bootstrap --new-token` works before the first administrator and is refused after it; `seed` and `run-jobs` refused; `backup --to <dir> --prune` twice keeps one same-day backup; prune dry run; Secure, HttpOnly, SameSite=Strict cookie; health and ready private-data free. Run 1 had one probe expectation error | `17-ops-cli-run*.txt` |
| Previous WP3 build with `JOB_RUNNER=off` on a `restore --keep-schema --confirm` copy (docs/11 section 8 step 3) | 5/0: the restore warns about `JOB_RUNNER=off`; in 25 s no job, attempt or PDF moved; schema stays 6 | `18-runner-off.txt` |
| docs/11 section 11 host-alert commands on synthetic folders | silent for a fresh backup; "backup too old" for an empty folder and for `-mmin -0` | `19-host-alert.txt` |
| `SMOKE_PORT=47725 NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` on export 1 | exit 0, 76 files, 1,758 tests, SMOKE PASSED (41 PASS), 0 deprecation lines, 82 s | `20-verify.txt` |
| Final Docker and process state | image removed by exact tag, project down by name; `docker ps --all --filter name=ts-wp5-assess-b` empty; no network or volume; no listener on 47720–47739 | `98-*.txt` |

### The independent restore (item 2)

The dataset has seeded synthetic accounts. employee2 finalizes the past period 2026-10-02 with a weekday that credits 60 and a
Saturday that credits 240. It then edits that finalized period with a reason and finalizes a correction revision (+30). It
holds the seeded 240-minute OT reservation, and a second leave request of 120 minutes of which 60 are used. Totals: posted 870,
reserved 300, available 570; 5 ledger entries; 2 revisions; 2 PDFs and a signature. `cli.js backup` runs while the server runs.
One more session is written after the backup. The source is stopped through its own handle.

Results:
- Restore refusals: a target inside the live `DATA_DIR` gives exit 2 `target_inside_data_dir`; a non-empty target gives exit 2
  `target_not_empty`.
- The restore verifies the manifest and sets the pause (`restored`). Only `operations_state`, the one restore audit event and
  the held jobs differ from the backup copy (in uncertain mode also the attempt marked uncertain).
- Ledger, revisions, sign-offs, leave requests, attachments and sessions are equal row for row. The restored copy lacks exactly
  the session written after the backup, so it is a point-in-time image.
- Through the API of the restored instance: balance, every ledger entry, leave requests, revisions, the finalized timesheet
  view and the SHA-256 of both PDFs equal the source. The pause line is logged. `/api/admin/operations` shows the pause.
  Health and ready carry no private data.
- Uncertain path (run 4), not exercised by the drill (its `attempts_marked_uncertain` is always 0): a resend made with the
  source's runner off is in the backup as a `preparing` attempt. The restore marks it uncertain and holds its job.
  - `outbound resume --confirm` is refused (exit 1), and `release --all` refuses it (`attempt_uncertain`).
  - The owner's decision "resend" creates a new attempt. Nothing goes out while the instance is paused.
  - After `resume --confirm` the mail is captured exactly once, with the revision 2 PDF (same SHA-256) and `example.invalid`
    recipients.
  - The original held job can never be released, and no ledger minute moved.

Probe errors, kept for honesty:
- Run 1: the session written after the backup overlapped a seeded session (422), so the point-in-time check had no extra row.
- Run 3: four expectations were too narrow. The restore changes the `delivery_attempts` table, and a preparing delivery reads
  uncertain after the restore. The probe also counted a Message-ID as a recipient and forgot the earlier accepted attempt of
  revision 1.
- The product behaviour was correct each time. The corrected probe (runs 4 and 5) passes.

## Findings

| ID | Severity | File / function | Reproduction | Expected / actual | Rule / AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP5-B-01 | Medium | `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md`: "Placeholders and conventions" (`<compose>`, no `<image>`), section 1 steps 5 and 8, section 6 steps 2–3, section 8 (upgrade steps 1–2, rollback step 3); with `compose.example.yaml` and the `.env.example` header | `12-runbook-compose-config.txt`; `15-build-no-cache.txt`; `git grep TIMESHEET_ 546cdda` finds the variables only in `compose.example.yaml` and the drill (which sets all four, and switches `TIMESHEET_DATA_DIR` for stages 3 and 4) | **Expected:** the documented commands bind `<env-file>`, `<data-dir>` or `<restore-dir>`, and a release-specific `<image>`, as the drill steps they cite do. **Actual:** with the env file at `<env-file>`, the verbatim `<compose>` fails (`env file <project-dir>/timesheet.env not found`). `.env.example` suggests `/volume1/docker/timesheet/.env`. Otherwise Compose binds `<project-dir>/data` (`create_host_path`, root-owned on Linux, while the runbook chowns `<data-dir>`), tags `timesheet:local` and publishes 3000. Section 6 step 3 (restored instance on `<restore-dir>`) and rollback step 3 (the previous image) have no documented way to set `/data` or the image, and `<image>` is never defined. "Note the running image tag" identifies nothing after an upgrade rebuild re-tags `timesheet:local`: the previous image ID was "No such image" after a same-tag rebuild here | AC-11 (isolated restore), AC-15 (compatible rollback), docs/07 "Backup, restore and upgrades" and setup step 5, WP5 gate "verified restore", runbook fidelity (WP5-PLAN B item 4) | Docs only, EN and VI:<br>1. In "Placeholders and conventions", define `<image>` and the four Compose variables (for example in `<project-dir>/.env`: `TIMESHEET_ENV_FILE=<env-file>`, `TIMESHEET_DATA_DIR=<data-dir>`, `TIMESHEET_IMAGE=timesheet:<release-commit>`, `TIMESHEET_PORT=3000`).<br>2. Section 6 step 3: `TIMESHEET_DATA_DIR=<restore-dir>` under its own project name.<br>3. Section 8: one tag per release, and record the image ID at build; the rollback starts the previous tag.<br>4. Align the `.env.example` example path with `timesheet.env`, or say to set `TIMESHEET_ENV_FILE`.<br>5. Recheck: `docker compose config` of each documented form |
| WP5-B-02 | Low | `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md`, section 4 step 3 and the section 2 checklist | `grep -n env-file docs/11…`: the env file appears only in sections 1, 2 (mode 600), 6 and 8. `backup.ts` copies the database and the referenced files only (manifest key allowlist). Every restore here needed a separately supplied env file | **Expected:** docs/07 line 28, "retain needed secret configuration securely without printing it", as part of backup. **Actual:** neither the tool nor the runbook keeps it. After the NAS volume is lost, the separate-device copy holds the data but not the configuration a restored instance needs to start: `APP_ORIGINS`, `PUBLIC_BASE_URL`, `MAIL_FROM`, `TRUSTED_PROXY_ADDRESSES`, and the SMTP credentials during the pilot. It also does not record which release built the data | docs/07 "Backup, restore and upgrades"; AC-15 | Docs only, EN and VI:<br>1. Section 4 step 3: keep a protected copy of `<env-file>` (mode 600, never in git or chat) with the separate-device copy.<br>2. Note the release commit, digest and image ID with it.<br>3. Add a section 2 checklist line |

## Risks and optional improvements (not defects)

- **R-B5-1 release identity.**
  - The image ID is not stable per build: `75f50c10…` (cached) and `62fb1101…` (no cache) for the same source; layers 7–10
    differ in metadata. The application content does reproduce: `dist/` is byte-identical across exports, and `/app/dist`
    equals a local image-style build.
  - `package.json` and the backup manifest `app_version` are 0.1.0, the same as the WP3 build `49651c8`. The image has no
    revision label, and `/api/ready` exposes only the schema.
  - The pilot packet must therefore record the image ID built on the NAS. Bumping the version or adding an OCI revision label
    is optional (WP5-REL).
- **R-B5-2 base image.** The pinned index `8ec5d755…` is one Debian rebuild behind the tag (`173f1258…`, 2026-10-06). Decide on
  the section 9 refresh before the pilot build.
- **R-B5-3 dev-only advisory.** `source-map-js` 1.2.1 (high) is a dev dependency only; `npm audit --omit=dev` finds 0, and the
  image holds no dev package.
- **R-B5-4 backup status after a restore.** A restored instance reports backup `never` until its own first backup (the status
  is outside the snapshot by design). Add "take a backup after reconciliation" to the runbook notes.
- **R-B5-5 R-RA2 reconfirmed.** Two same-day `backup --prune` runs keep one folder, so a same-day prune removes the paired
  pre-upgrade backup.
- **R-B5-6 Windows operator.** Git Bash rewrites container paths in `docker run` (MSYS path conversion). It affects only a
  Windows operator; the NAS shell is unaffected.
- **R-B5-7 info.** `cli.js migrate` prints the absolute `DATABASE_PATH` (operator terminal; `/data/timesheet.db` in the image).
- **Observation.** In run 1 the send of revision 1 had not yet run at backup time (attempts 1, no delivery attempt: the
  documented send-before-PDF retry). The restore held it, as designed.

## Required gates unrun or blocked, and why

- NAS: everything is NOT VERIFIED (no owner hardware): the architecture, the DSM file system, UID/GID ownership on a real bind
  mount, the reverse proxy, `TRUSTED_PROXY_ADDRESSES`, NTP, Task Scheduler, the separate-device copy, DSM's `find`, and a native
  arm64 image. By the brief, this does not fail the area by itself.
- `outbound drop --job <id> --confirm` was not executed: no held reminder arose in these datasets. It is covered by
  `tests/integration/restore.test.ts` inside the 1,758-test verify run; this audit did not execute it directly.
- The previous build with `JOB_RUNNER=off` ran as a host process, not as a previous image (see B-01).
- AC-13 and the integrated workflow belong to area A.

## Disposition of previous findings

- WP4 A-01 (source maps in the image): stays fixed. There is no map under `/app/dist` and no `sourceMappingURL`, and
  `/assets/*.map` answers 404 (drill).
- R-A3 (rollback residual): the documented `JOB_RUNNER=off` rule works for the WP3 build (`18-runner-off.txt`); the owner's
  choice D-1 is still open.
- R-RA2: reconfirmed (R-B5-5).
- R-A8 and R-RA9: not re-tested (every run here set explicit paths).
- WP4-I-1..I-5 and the dev advisory: unchanged.

## Software readiness, owner permission and pilot result

- **Software readiness, area B.** The release builds reproducibly from a clean export. The image is pinned, non-root and free
  of forbidden files. Backup and restore, including the uncertain-send reconciliation, are verified on a developer workstation
  (Docker Desktop, amd64) with synthetic data. The runbook needs the B-01 and B-02 documentation fixes before the pilot packet
  can rely on it. The NAS is NOT VERIFIED.
- **Owner permission.** Not requested and not given. No deployment, no real mail, no production data.
- **Pilot result.** None; no pilot has run.

Operations-side facts for the pilot packet (facts only; owner inputs named, never requested):
1. The Compose binding and per-release image tags (B-01), and the env-file retention (B-02).
2. Activation and deactivation steps are not in docs/11 by design (`PRODUCTION_SENDING_ENABLED`, `OUTBOUND_MODE=smtp`,
   `SMTP_*`, the activation instant, first-period staging). They are planned for WP5-REL.
3. There is no rollback card for a first installation yet: deactivate, keep the data, fall back to Excel.
4. Release record: commit, digest, the NAS-built image ID and the base-image refresh decision (R-B5-1, R-B5-2).
5. The NAS restore proof form and the host alert remain owner steps.
6. Owner inputs needed: NAS model, `uname -m` and DSM version; data and backup paths; UID/GID; the HTTPS host name and the proxy
   address; the SMTP provider, with credentials only in the protected env file; recipients; the D-1 (R-A3) choice.

## One next action

The coordinator dispatches a bounded documentation fix for WP5-B-01 and WP5-B-02 (docs/11 EN and VI, optionally the
`.env.example` header and one `compose.example.yaml` comment), using [FIX_FINDINGS](../prompts/FIX_FINDINGS.md) and
`addresses_audit: WP5-ASSESS-B`. The fix can be folded into WP5-REL. After it, a freeze, a gate and an independent recheck
run on the new digest: `docker compose config` of each documented form, and the section 6 step 3 start on `<restore-dir>`.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP5-ASSESS-B, attempt 1, agent `a76dbe4b854f423f7` (board
  record). The authors are the WP1–WP4 implementers and fixers and WP5-PLAN, as recorded on the board. This reviewer is none of
  them and is not the WP5-ASSESS-A auditor.
- **Fresh context; reviewer did not author changes:** confirmed. Fresh context. No source, test, doc, board, STATE,
  NEXT_ACTION or checkpoint edit. Written: this report and its translation, the brief's Results section and
  `evidence/WP5-ASSESS-B/` only.
- **Source digest before/after; gate evidence for that snapshot:** `26fcc969…` before and after, in all three forms (and on
  three exports). The gate is WP4-REGATE4 PASS on the same freeze; this audit re-ran verify, the drill and the restores itself.
- **New report path preserving previous review history:** `handoff/delivery/WP5_REVIEW_B.md` and `.vi.md`, new files. No
  earlier report was changed.
- **Finding dispositions and next coordinator fix/recheck task:** WP5-B-01 and WP5-B-02 go to a bounded docs fix (or into
  WP5-REL), then a freeze, a gate and a recheck of this area.
