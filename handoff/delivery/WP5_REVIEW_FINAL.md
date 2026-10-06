# WP5 final independent audit — package-final freeze

Completed from [REVIEW](../templates/REVIEW.md). Translation: [WP5_REVIEW_FINAL.vi.md](WP5_REVIEW_FINAL.vi.md). Brief and results:
[WP5-FINAL-AUDIT](tasks/WP5-FINAL-AUDIT.md). Evidence: `handoff/delivery/evidence/WP5-FINAL-AUDIT/` (index in `00-README.txt`).

- **Package/date/reviewer and observable model/effort:** WP5, final audit on the package-final freeze (WP5-FINAL-AUDIT,
  attempt 1). 2026-10-06, 22:09Z to about 22:35Z. Reviewer: a `timesheet-auditor` subagent. Self-reported model
  `claude-opus-5-5`; effort not observable. The strongest author model of the reviewed snapshot is `claude-opus-5-5`
  (WP1–WP4 records); the WP5 authors self-report `claude-sonnet-5-5`. The audit-strength rule holds.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** commit
  `74d5bfec6700126da4105b5d97f5efe943f896f5` (the WP5-GATE `freeze_commit`), digest
  `0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba` (779 files, `handoff/` excluded). HEAD = origin/main =
  `74d5bfe` before and after; no unpushed commit. The digest was equal before and after in the repository
  (`scripts/source-digest.mjs`), in the `git ls-tree` form and on two clean `git archive` exports. No file outside `handoff/`
  differs from HEAD. Source complete.
- **Decision: FIX REQUIRED.** Two Low documentation findings (WP5-F-01 in the runbook and the packet, WP5-F-02 in the
  packet). WP5-B-01 and WP5-B-02 are resolved. Area B passes on the new digest. No blocking defect under the docs/06 block
  list was found: software readiness otherwise holds.

## Scope actually inspected and executed

Read: AGENTS.md (disk), the brief, WP5_REVIEW and the documents it names (docs/02, 05, 06, 07, 09), docs/11 and docs/12 (EN
and VI), WP5_REVIEW_B, the WP5-PLAN sections B to G, the results and evidence of WP5-FIXB, WP5-AC13, WP5-REL, WP5-GATE and
WP5-PILOT, `WP5_PILOT_PACKET.md` and `.vi.md`, and `WP5_HANDOFF.md` and `.vi.md`. Code traced: `config.ts`, `cli.ts` (which
commands read the mail settings), `routes/admin.ts` (activation route), `services/automation.ts`, `http/security.ts`
(origin and content-type checks), `app.ts` (health and ready), `services/operationsStatus.ts` and
`client/components/OperationsStatus.tsx` (what the status shows), `mail/captureAdapter.ts`, `mail/smtpAdapter.ts` (fault
codes), `Dockerfile`, `.dockerignore`, `compose.example.yaml`, `.env.example`, `scripts/container-drill.mjs`.

Not repeated: the area-A delta (WP5-ASSESS-A attempt 2 covers it). I did not read its report.

## Evidence table

| Command | Result / exit | Evidence |
|---|---|---|
| Digest before: `scripts/source-digest.mjs`, the `git ls-tree` form, two `git archive 74d5bfe` exports | `0a64a75f…` (779 files) in all four; the two tars are identical; export listing = ls-tree listing | `00-*`, `01-*` |
| `npm ci` in both exports (`--trace-deprecation --pending-deprecation`) | exit 0/0, 161 packages, lockfile unchanged, 0 deprecation lines | `02-npm-ci.txt` |
| `npm run build` in both exports, per-file SHA-256 of `dist/` | exit 0/0; 230 files, 4,044,281 bytes, byte-identical; also equal to the WP5-ASSESS-B dist of `546cdda` | `03-build.txt`, `04-*` |
| `git diff --stat 546cdda 74d5bfe -- . ':!handoff'` | only `.env.example`, `compose.example.yaml`, README, docs/11, docs/12 (EN, VI) and the two AC-13 test files | `05-diff-scope.txt` |
| `npm run drill:container -- --work <task>\drill --project ts-wp5-final --wp3 <task>\wp3` (`git archive 49651c8` prepared) | exit 0, `DRILL STAGES 1-6 PASSED`, 208 PASS, 0 FAIL (33/31/57/35/27/23), 5 min | `06-*`, `08-drill*.txt` |
| Independent scan of the drill image file list; `docker image inspect` | 10,331 paths, FORBIDDEN TOTAL 0; `/app` = `dist`, `node_modules`, `package.json`; 0 devDependencies; User `10001:10001`; image `sha256:03dd6422…` (110,002,055 bytes) | `10-*`, `11-*` |
| `docker compose config` of `<compose>`, `<compose-restored>` and `<compose-previous>`, variables in `<project-dir>/.env`, run from another folder | exit 0 ×3: live binds `<data-dir>`, `<env-file>`, the release tag, port from `.env`; restored binds `<restore-dir>` under `<project>-restored`; rollback binds the previous tag, `<restore-dir>`, `JOB_RUNNER: "off"` under `<project>-rollback` | `12-*` |
| Section 16 step 1 `<compose> run --rm --no-deps -T timesheet <cli> migrate` on a fresh `<data-dir>` | exit 0, schema 1–13 applied (the image was built on the way) | `13-migrate-first.txt` |
| Section 1 step 8 (`up --detach --build`, `ps`, `logs`, `docker image inspect`) | healthy; mount `<data-dir>` → `/data`; read-only root; loopback port; image ID recorded | `14-live-up.txt` |
| Section 3 bootstrap; synthetic admin, employee, signature, one signed-off period with its PDF | exit 0; 201s; PDF ready in 6 s (one probe error, fixed and rerun: see `16-*`) | `15-*`, `16-*` |
| Section 13 step 5 console call, verbatim from the export's docs/11, in headless Edge after a UI sign-in; section 14 step 1 clear | past instant 422 `activation_in_past`; blank reason 422 `reason_required`; set → the status shows the instant; clear with `null` → "Not activated"; from an origin not in `APP_ORIGINS` 403 `origin_rejected`. Run 2 9/0 (run 1 read a stale screen: probe error) | `18-*` |
| `OUTBOUND_MODE=smtp` without the flag: `<compose> restart`, then `up --detach --force-recreate --no-build`, then the CLI | restart keeps the old environment; recreate rereads it and the server refuses to start, naming the flag only; `cli.js migrate` exits 0; revert and recreate: healthy | `19-env-reread.txt` |
| Section 13 step 3 (`backup`, `ls -1 <backup-dir>`, `sha256sum <backup-dir>/<backup-name>/manifest.json`); a write after the backup | backup `succeeded`, 2 files; manifest hash printed; the post-backup session is created | `20-*`, `21-*`, `22-*` |
| Live stopped; section 6 step 2 one-off restore container | exit 0; manifest verified; `paused: true, reason: restored` | `23-restore.txt` |
| Section 6 step 3 `<compose-restored> up --detach --no-build`; `ps`; `docker inspect`; logs; section 7 previews | own project `ts-wp5-final-live-restored`; `/data` = `<restore-dir>`; the release image (same ID); healthy; `Outbound delivery PAUSED … (reason: restored)`; `outbound release` and `resume` preview exit 2 | `24-restored-instance.txt` |
| API of the restored instance | pre-backup session 200, post-backup session 404 (point in time); revision with its PDF; operations outbound paused `restored`; backup `never`; health and ready minimal; no password, address, name or session id in the operations JSON | `25-check-restored.txt` |
| Backup folder read-only (`backup-facts.mjs`) | manifest holds no configuration; file and database hashes match; 4 activation audit events, each with a reason; integrity ok | `26-*` |
| `SMOKE_PORT=47762 NODE_OPTIONS=… npm run verify` on export 1 | exit 0, 77 files, 1,759 tests, SMOKE PASSED, 0 deprecation lines | `29-*` |
| AC-13 test alone ×2 and with `TZ=Asia/Tokyo` | exit 0 ×3 (1.8 s test, 3.8 s total) | `31-*` |
| Env keys named in docs/11, docs/12 and the packet | every application key is in `.env.example` or `src/server/config.ts` (`JOB_RUNNER`, `STATIC_DIR` in `.env.example` and `index.ts`); `TIMESHEET_*` are Compose variables; `NODE_IMAGE_DIGEST` a Dockerfile ARG; `SQLITE_BUSY` an error code | `30-*` |
| EN/VI parity (`parity.mjs`) | docs/11, docs/12, packet, WP5_HANDOFF: equal headings, numbered items, bullets, table rows, fences (identical), checkboxes and links; code spans differ only where a placeholder is translated; README differences predate WP5 | `09-*` |
| `npm audit --omit=dev`; `validate_package.py --preflight` | 0 vulnerabilities; PASS (89 pairs) | `32-*`, `35-*` |
| Claimed digests of `8e99d2c`, `85838b5`, `546cdda`; base-image index | all equal the claims; tag index `173f1258…`, pin `8ec5d755…` (R-B5-2 still open) | `33-*`, `34-*` |
| Final state | both projects down by name, images removed by exact tag; `docker ps --all --filter name=ts-wp5-final` empty; no network, volume or listener on 47760–47779; digest unchanged in all forms | `27-*`, `28-*`, `36-*`, `99-*` |

## Findings

| ID | Severity | File / function | Reproduction | Expected / actual | Rule / AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP5-F-01 | Low | `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md`: section 13 step 2 (first bullet), step 4 (second and third bullets), section 14 step 4. `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`: section 2 "Capture-mode self-test" first box, section 6 step 1. Status source: `services/operationsStatus.ts` `deliverySetupOf`, `client/components/OperationsStatus.tsx` `StatusPanel`; CLI: `cli.ts` | Live instance in capture mode: the status screen shows "Sender address: Configured", "Outbound mode: Capture only (nothing leaves the server)", "Not activated" (`18-activation-browser-run2.txt`). `GET /api/admin/operations` has `sender: {configured: true, outbound_mode: "capture"}` and no sending-flag field (`17-check-live.txt`); no source file exposes `PRODUCTION_SENDING_ENABLED` to the status. With `OUTBOUND_MODE=smtp` and no flag the server refuses, but `cli.js migrate` exits 0 (`19-env-reread.txt`); `cli.ts` reads the mail settings only for `backup`, `restore`, `run-jobs` and `seed` | **Expected:** every activation and deactivation check names something the operator can observe. **Actual:** "the administrator status shows … the flag off" (and "the flag on") cannot be checked: the status has no such field. Read as the only flag on the screen, "Sender address: Configured", it contradicts "off". "The server and the CLI refuse to start" is true for the server and for `backup` and `restore`, not for `migrate`, `outbound` or `bootstrap` | WP5-FINAL-AUDIT scope 3 (every step executable); WP5-PLAN B item 4 (runbook fidelity); AC-14 (sender setup visible); docs/06 pilot packet accuracy | Docs only, EN and VI, runbook and packet: <br>1. Replace "the flag off/on" with the facts the screen shows: Outbound mode "Capture only (nothing leaves the server)" or "SMTP (real sending)", and the activation.<br>2. Check the flag in `<env-file>` itself without printing values, for example `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` (0 or 1).<br>3. Say "the server, and the CLI commands that read the mail settings (`backup`, `restore`), refuse to start". Optional: name the screen label "Running" next to "leased" |
| WP5-F-02 | Low | `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`, section 8, the paragraph under the heading | Section 0 names the package-final freeze `74d5bfe`; section 8 says "An answer that differs from the current default for D-3, D-5, D-6 or D-8 becomes a small follow-up before the package-final freeze". The recommended D-8 option (b) differs from the current default | **Expected:** the packet tells the owner what a differing answer causes now: a fix round (fix, freeze, gate, independent audit) before activation, after which the release identity in sections 0 and 6 is refreshed. **Actual:** it names a step that is already past, so the owner cannot tell that following the D-8 recommendation changes the release named in the packet | docs/06 "concrete pilot packet"; WP5_REVIEW (separate software readiness from owner authorization) | Handoff only (no digest change), EN and VI: reword that sentence as above. The same stale wording is in the board's `pending_owner_question.blocking`; that is the coordinator's record |

## Risks and optional improvements (not defects)

- **R-F1 restored instance during the pilot.** `<compose-restored>` reads the live `<env-file>`. After activation that file
  is in SMTP mode, while section 6 step 3 says the inspection instance runs "in capture mode". The outbound pause holds every
  send until `outbound resume --confirm`, so nothing leaves during an inspection. Optional: point `TIMESHEET_ENV_FILE` at
  the protected capture-mode copy kept in section 13 step 3 for an inspection-only instance.
- **R-F2 promoting restored data.** The runbook does not say how a restored copy becomes the live instance after section 15
  step 5 and section 7. Which project and data folder continue? `<project-dir>/.env` would need `TIMESHEET_DATA_DIR`. The
  backups and the host alert would then be on `<restore-dir>/backups`. Likewise "upgrading again" after a section 8 rollback
  has no command form. Neither is needed for the first period; document it before relying on it.
- **R-F3 image identity (R-B5-1) reconfirmed.**
  - Three builds of the same source here gave three image IDs: the drill `03dd6422…`, the `compose run` build `f22b659a…` and
    `up --build` `bbfef4d7…`. The gate's was `0addd200…`.
  - The application content is stable: the `dist/` files are byte-identical.
  - Section 16 step 1 builds the image when it is missing, and section 1 step 8 rebuilds it under the same tag. Record the
    ID after the last build, as the runbook says.
- **R-F4 root on the NAS.** `<data-dir>` is mode 700 and owned by UID 10001. The commands `ls -1 <backup-dir>` and
  `sha256sum` (section 13 step 3, section 15 step 5) and the Docker commands therefore need root (`sudo -i`) on DSM. Optional:
  state it once.
- **R-F5 instant display.** The status shows the activation instant in the browser's zone without a zone label: `2027-01-01T00:00:00Z` reads
  "2026-12-31 16:00". Optional: say so next to "Check that the administrator status shows the instant".
- **R-F6 console paste guard.** Edge and Chrome may ask the operator to type "allow pasting" before a pasted line runs. The
  step stays executable.
- **R-F7 R-B5-2 still open.** The tag's index is `173f1258…`, the pin is `8ec5d755…` (read again at 22:26Z).
- **O-1 handoff wording.** `WP5_HANDOFF.md` and `.vi.md` call the area-B findings "two low documentation findings" and
  "(low, documentation)"; WP5-B-01 was Medium. Fold the correction into WP5-ACCREC, which rewrites that file.
- **O-2 recorded deviations of this audit.**
  - The documented commands were run with three additions:
    - `--name ts-wp5-final-restore-1` on the one-off restore, for the task prefix;
    - `-T` on `<compose> run`, for non-TTY;
    - `MSYS_NO_PATHCONV=1`, for Git Bash only (R-B5-6).
  - One shell call of this audit carried a stray `cp` of a file onto itself with `2>/dev/null`, against the runtime rule. It
    changed nothing and no result depends on it.
  - Three probe errors were fixed and rerun; all are kept in the evidence:
    - a local offset instead of a UTC instant;
    - a stale screen after a hash-only navigation;
    - two wrong names in `backup-facts`.

## Required gates unrun or blocked, and why

- NAS: NOT VERIFIED (no owner hardware). This covers the DSM file system, UID/GID on a real bind mount, the reverse proxy,
  `TRUSTED_PROXY_ADDRESSES`, NTP, Task Scheduler, the separate-device copy, the host alert and a native arm64 image. By the
  brief this does not fail the audit.
- Real SMTP was not exercised: `PRODUCTION_SENDING_ENABLED` is never set. This covers the reminder repeat (D-7), the TLS
  classification (D-8, read from `smtpAdapter.ts` only) and provider acceptance.
- `<compose-previous> up` was not started (config only, as the brief asks). The rollback path ran in drill stage 5 with the
  previous build as a host process.
- `outbound drop` was not exercised: no held reminder arose. It is covered by `tests/integration/restore.test.ts` inside verify.
- The area-A delta belongs to WP5-ASSESS-A attempt 2.

## Disposition of previous findings

- **WP5-B-01 (Medium): resolved.**
  - `<image>`, the four Compose variables in `<project-dir>/.env`, `<compose-restored>` and `<compose-previous>` are defined
    (EN and VI).
  - All three forms pass `docker compose config` from an unrelated working folder.
  - The restored instance started from a backup made here, under its own project. It bound `<restore-dir>` and the release
    image (same ID) and started paused.
  - Section 8 uses one tag per release, records the image ID and rolls back to `<previous-image>` with `JOB_RUNNER=off`.
  - The `.env.example` header points at `TIMESHEET_ENV_FILE`.
- **WP5-B-02 (Low): resolved.**
  - Section 4 step 3 keeps a protected copy of `<env-file>` (mode 600) with the separate-device copy, with the release commit,
    digest and image ID.
  - The section 2 checklist has the matching line (EN and VI).
  - The backup manifest holds no configuration (`26-backup-facts-run2.txt`), which confirms the need.
- R-B5-4 is now a runbook note (section 7, section 16 step 6), and the restored instance showed backup `never`. R-B5-1 and
  R-B5-2 are documented in docs/12. R-B5-5 (R-RA2) and R-RA9 are runbook notes (section 16).

## Area B on the new digest: PASS

- **Reproducible build.** Two clean exports give identical tars and the digest of record. `npm ci` leaves the lockfile
  unchanged and prints no deprecation line. `dist/` is byte-identical and equal to the audited `546cdda` build.
- **Image.** The image is pinned, non-root (10001) and read-only at run time, with no forbidden file and no dev dependency.
- **Drill.** Stages 1–6 pass on this freeze: 208/0.
- **Verified restore.** An independent restore through the documented container forms was paused, consistent and point in
  time.
- **Operations privacy.** Health and ready are minimal. The operations JSON has no password and no personal field. CLI
  output shows counts only. Logs show no token or password (drill).

## Release notes, runbook additions and pilot packet

- **Executable steps.** Every new runbook step uses the defined placeholders. I executed the following on synthetic data:
  - the activation console call (verbatim), the clear, the recreate behaviour and the flag refusal;
  - the pre-activation backup commands;
  - the explicit migrate.

  The console step is executable and safe as written:
  - it needs a signed-in administrator, with a `Secure`, `HttpOnly`, `SameSite=Strict` cookie;
  - the origin must be in `APP_ORIGINS`;
  - a reason is required, and the instant cannot be in the past;
  - the call is audited, with the reason stored;
  - the clear works.

  WP5-F-01 is the exception.
- **Env keys.** All named keys exist (see the table).
- **Owner decisions.** D-1 to D-15 appear as "recommended; owner decision pending" or "pending" everywhere. None is
  presented as decided, and the board has no answer.
- **EN/VI parity.** It holds.
- **Contradictions.** None found against docs/05, docs/06 or docs/07. The known limits follow WP5-PLAN section F (every PR
  and PB item) and the named R-WA and R-B5 items.
- **Packet.**
  - It is complete against WP5-PLAN section C.
  - The samples come from a clean export of `74d5bfe`, with `example.invalid` recipients only. The PDFs are rendered; I viewed
    2 of the 4 renders, which are synthetic and show correct OT for the sample sessions.
  - The figures quoted from the gate match its evidence.
  - A scan found no real host, address, credential, signature or personal data.
  - The authorization record keeps the four facts separate. 0 of 35 boxes are ticked.
  - WP5-F-02 is the exception.

## Software readiness, owner permission and pilot result

- **Software readiness.** No blocking defect under the docs/06 block list. That list covers incorrect OT, a privacy leak, a
  duplicate or lost ledger event, a fabricated sign-off, a lost revision, a blind resend after uncertainty and a failed
  restore. The evidence:
  - AC-13 passes alone and within verify;
  - the drill and the restore pass;
  - the release reproduces.

  Readiness is recorded after the two Low documentation fixes and their recheck. The NAS is NOT VERIFIED.
- **Owner permission.** Not requested and not given. Nothing is deployed, no real mail was sent and the activation instant
  is empty.
- **Pilot result.** None; no pilot has run.

## One next action

The coordinator dispatches one bounded documentation fix for WP5-F-01 and WP5-F-02, using
[FIX_FINDINGS](../prompts/FIX_FINDINGS.md) and `addresses_audit: WP5-FINAL-AUDIT`. It may share a fix task with the
findings of WP5-ASSESS-A attempt 2 if they touch the same sections.
- WP5-F-01 changes docs/11 (EN and VI) and the packet.
- WP5-F-02 changes the packet only.

After the fix come a freeze, a gate and a recheck of the changed lines on the new digest. The recheck covers the status
facts named in sections 13 and 14, and the packet sections 2, 6 and 8. If docs/11 changes, the packet identity (sections 0
and 6) is refreshed to the new freeze. O-1 goes into WP5-ACCREC.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP5-FINAL-AUDIT, attempt 1, fresh `timesheet-auditor`
  subagent. The authors are the WP1–WP4 implementers and fixers, WP5-PLAN, WP5-FIXB, WP5-AC13, WP5-REL and WP5-PILOT, as
  recorded on the board. This reviewer is none of them, and not the WP5-ASSESS-A (attempts 1 and 2) or WP5-ASSESS-B auditor.
- **Fresh context; reviewer did not author changes:** confirmed. No source, test, doc, board, STATE, NEXT_ACTION or checkpoint
  edit. Written: this report and its translation, the brief's Results section and `evidence/WP5-FINAL-AUDIT/` only.
- **Source digest before/after; gate evidence for that snapshot:** `0a64a75f…` before and after, in the repository, the
  `git ls-tree` form and two exports. The gate is WP5-GATE PASS on the same freeze; this audit reran the build, the drill,
  verify, AC-13 and a restore itself.
- **New report path preserving previous review history:** `handoff/delivery/WP5_REVIEW_FINAL.md` and `.vi.md`, new files.
  No earlier report was changed.
- **Finding dispositions and next coordinator fix/recheck task:** WP5-F-01 and WP5-F-02 go to one bounded documentation
  fix, then a freeze, a gate and a recheck. WP5-B-01 and WP5-B-02 are closed.
