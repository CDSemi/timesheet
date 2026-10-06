# WP5 closing independent recheck — documentation fix freeze

Completed from [REVIEW](../templates/REVIEW.md). Translation: [WP5_RECHECK.vi.md](WP5_RECHECK.vi.md). Brief and results:
[WP5-RECHECK](tasks/WP5-RECHECK.md). Evidence: `handoff/delivery/evidence/WP5-RECHECK/` (index in `00-README.txt`). Earlier
reports kept unchanged: [WP5_REVIEW_FINAL](WP5_REVIEW_FINAL.md) and [WP5_REVIEW_A2](WP5_REVIEW_A2.md).

- **Package/date/reviewer and observable model/effort:** WP5, closing recheck (WP5-RECHECK, attempt 1). 2026-10-06, from
  23:12Z to about 23:35Z. Reviewer: a fresh `timesheet-auditor` subagent, self-reported model `claude-opus-5-5`; effort is not
  observable. The strongest author model of the reviewed snapshot is `claude-opus-5-5` (WP1–WP4 records); the WP5 authors and
  fixers self-report `claude-sonnet-5-5`. The reviewer is not weaker than any author.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:**
  - Commit `014bd47a8d906c944d2781eba4f2b91c5a532419` (the WP5-REGATE2 `freeze_commit`). HEAD = `origin/main` = `014bd47`
    before and after; no unpushed commit.
  - Digest `150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61` (779 files, `handoff/` excluded), equal to the
    gate digest of record. Recorded before (23:12Z) and after (23:28Z, and again at the end) in three forms:
    `scripts/source-digest.mjs`, the `git ls-tree` form, and a clean `git archive 014bd47` export.
  - No file outside `handoff/` differs from HEAD. Source complete. The pilot packet changes of WP5-PKTID are uncommitted
    handoff files; they do not change the digest.
- **Decision: PASS.** All four Low findings are resolved on this freeze, the small risk fixes are accurate, the packet names
  the regated release, and EN/VI parity holds. The delta since `74d5bfe` is documentation only. No new defect was found; the
  observations below are risks and optional improvements.

## Scope actually inspected and executed

- Read: AGENTS.md (disk), the brief, WP5_REVIEW, docs/05, 06, 07, 11 and 12 (EN and VI where changed), WP5_REVIEW_FINAL and
  WP5_REVIEW_A2 (findings, risks, evidence), the results of WP5-FIXD, WP5-REGATE, WP5-FIXD2, WP5-REGATE2 and WP5-PKTID and
  their evidence, the packet (EN and VI) and the board `pending_owner_question`.
- Code traced: `config.ts` (`parseOutbound`), `cli.ts` (which commands read the mail settings), `index.ts` (server start),
  `services/operationsStatus.ts` (`deliverySetupOf`, `operationsStatusJson`), `client/components/OperationsStatus.tsx`
  (`StatusPanel`), `client/components/format.ts` (`instantText`, `displayZone`), `domain/reminders.ts` (`reviewLink`),
  `services/notifications.ts` (activation gate), `client/components/AppShell.tsx` (`useHashRoute`), `client/App.tsx` (sign-in
  gate), `client/components/deliveryModel.ts`, `mail/captureAdapter.ts`, `compose.example.yaml`, `.env.example`.
- Executed on a clean export of `014bd47`, Git Bash, portable Node v24.21.0 first on PATH, npm scripts in Git Bash (no
  `cmd.exe`), `DATA_DIR` and `DATABASE_PATH` inside the task folder for every run, ports 47760–47761, no Docker, capture mode
  only, `PRODUCTION_SENDING_ENABLED` never set in any process.

## Evidence table

| Command | Result / exit | Evidence |
|---|---|---|
| `git rev-parse`; `scripts/source-digest.mjs`; `git ls-tree` digest of HEAD, `014bd47`, `9bcdd88`, `74d5bfe` | HEAD = origin/main = `014bd47`; `150420e7…` (779) both forms; `9bcdd88` = `1b8ceae4…`, `74d5bfe` = `0a64a75f…` (the claimed values) | `00-baseline.txt` |
| `git log`, `git diff --name-status --stat 74d5bfe 014bd47 -- . ':!handoff'` | 2 commits; only `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md` (+22/−20); 0 paths under src, tests, scripts, migrations, package files, Dockerfile, `.dockerignore`, Compose or `.env.example` | `01-delta.txt`, `02-diff-docs11-*.txt` |
| `git archive 014bd47` export, export digest | `150420e7…` (779); listing equal to the ls-tree listing | `03-export-digest-before.txt` |
| `npm ci` (`--trace-deprecation --pending-deprecation`) | exit 0, 161 packages, lockfile unchanged, no deprecation line | `04-npm-ci.txt` |
| `SMOKE_PORT=47760 npm run verify` | exit 0: typecheck, lint, 77 files / 1,759 tests, build, `SMOKE PASSED` | `05-verify.txt` |
| AC-13 test alone | exit 0, 1 test | `06-ac13.txt` |
| `npm ci` + `npm run build` of a `git archive 74d5bfe` export; SHA-256 of every `dist/` file of both builds | both 230 files, 4,044,281 bytes, listings identical | `07-dist-compare.txt`, `07-dist-hashes.txt` |
| `node probe.mjs` (built server, production mode, capture, runner on, Edge headless) | exit 0: 27 PASS, 0 FAIL (run of record, first run) | `08-probe-log.txt` and `08-*.txt`, `probe.mjs.txt` |
| `grep -c '^PRODUCTION_SENDING_ENABLED=true$'` on six synthetic env files | absent/commented/`false` print 0 (exit 1); the canonical line prints 1; quoted value 0 | `09-grep-flag-check.txt` |
| EN/VI parity (`parity.mjs`) of docs/11 and the packet | every changed section equal; three span differences are translated placeholders in unchanged text | `10-parity.txt` |
| Grep of docs/05, 07, 11, 12, README and the packet (EN and VI) for a status-shows-flag claim and the old wording | 0 claims; old wording 0 hits | `11-flag-grep.txt` |
| Packet identity tokens against the gate records and evidence | as below | `12-packet-identity.txt`, `13-packet-pktid-diff-*.txt` |
| `validate_package.py --preflight` (workflow Python); precommit check over this task's files (private git dir) | preflight exit 0, PASS, 91 pairs; precommit exit 0, PASS, 0 blocking findings, 0 warnings; both rerun after the last edit (run 2 in the same files) | `96-preflight.txt`, `97-precommit.txt` |
| `netstat`, `ps -W`; digest after | no listener on 47760–47779, no portable-Node process; digest unchanged in all forms | `98-process-listing.txt`, `99-digest-after.txt` |

## Findings

None. No observed defect in the reviewed delta, the packet or the code paths the changed sentences describe.

## Recheck of the four findings

1. **WP5-F-01 (status flag claims, refusal sentence): resolved.**
   - Live instance, capture mode, after a captured submission. The screen shows "Sender address: Configured", "Outbound mode:
     Capture only (nothing leaves the server)" and "Automatic submission starts: Not activated", with no mention of a flag.
   - `GET /api/admin/operations` has `sender` = `{configured, outbound_mode}` and no key that names a flag or production
     sending.
   - This matches docs/11 section 12 (the WP5-FIXD2 sentence, with the labels "Sender address" and "Outbound mode"), section
     13 steps 2 and 4, section 14 step 4, packet section 2 (first box) and section 6 step 1. The section 12 items are all in
     the JSON.
   - Refusal sentence, with `OUTBOUND_MODE=smtp` and no flag, in production. The server exits 1 and never listens.
     `backup --to` and `restore` exit 1 with the message that names the flag. No SMTP value appears in any output, and the
     refused restore leaves no target. Other commands do not refuse for the flag:
     - `migrate` exits 0;
     - `backup prune --in … --dry-run` exits 0 (it reads no mail settings);
     - `outbound release` and `outbound resume` print their previews (exit 2);
     - `bootstrap --new-token`, `run-jobs` and `seed` refuse for their own reasons (an administrator exists; production).

     As a control, the same restore runs in capture mode (exit 0).
2. **WP5-A2-01 (deactivation flag check): resolved.** Section 13 step 2 and step 4 and section 14 step 4 name the screen texts
   and add `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>`. On synthetic files the check printed 0 for a file without
   the line, with the commented `.env.example` line, after deletion and with `=false`, and 1 with the activation line. It
   never prints a value.
3. **WP5-A2-02 (deep link): resolved.**
   - Signed out, Edge opened `<loopback origin>/#/review/2026-10-09`: the sign-in form, the hash kept and no review shown.
     After the sign-in the same address opened "Review and sign off" for payroll date 2026-10-09.
   - The captured submission holds no URL, as the new text says.
   - Section 13 step 7 has the first-reminder link check in the form `https://<nas-host>/#/review/<payroll-date>`.
   - After the activation instant was set with the documented call, the first reminder to the employee (`run-jobs` at
     2027-01-01T00:01Z) carried exactly `https://timesheet.example.invalid/#/review/2027-01-01`. That is `reviewLink`
     (`PUBLIC_BASE_URL` + `/#/review/<payroll-date>`), marked `Auto-Submitted: auto-generated`.
   - The same link, with the host replaced by the loopback origin, asked for sign-in and then opened the review of 2027-01-01.
4. **WP5-F-02 (packet section 8): resolved.** Section 8 says that an answer differing from the current default for D-3, D-5,
   D-6 or D-8 causes a fix round (fix, freeze, gate, independent audit) before activation, and that the release identity in
   sections 0 and 6 is then refreshed. The board `pending_owner_question.blocking` says the same (working tree and HEAD).

## Small risk fixes

- **R-A2-1: accurate.** The owner's history shows the captured attempt as "Accepted by the mail server" and never shows
  "captured". The API record has `provider_response` `captured` and `provider_message_id` `capture-…`.
- **R-A2-2 and R-F1 (section 15 step 5): accurate and executable.** A shell `TIMESHEET_ENV_FILE` overrides `<project-dir>/.env`
  for this Compose file. WP5-REGATE `08-config-rollback.txt` shows `<compose-previous>` binding another env file this way. Not
  rerun here (no Docker).
- **R-F4 (section 13 introduction): consistent** with section 1 step 3 (`<data-dir>` mode 700, UID 10001). `sudo -i` on DSM
  is not observable here (NAS NOT VERIFIED).
- **R-F5 (section 13 step 5): accurate.** `2027-01-01T00:00:00Z` showed as "2026-12-31 16:00" (America/Los_Angeles),
  "2027-01-01 09:00" (Asia/Tokyo) and "2026-12-31 19:00" (America/New_York), with no zone label (`instantText` in the
  browser's zone).
- **R-F6: accurate by reading** (the Chromium console paste guard). A headless browser cannot show it.

## Packet identity

- Sections 0 and 6 (EN and VI) name `014bd47a8d906c944d2781eba4f2b91c5a532419` and `150420e7…` (779 files). Both equal this
  recheck's figures and the WP5-REGATE2 record.
- The reference image `sha256:bd17d061…` is the WP5-REGATE drill build of `9bcdd88` (110,002,055 bytes,
  `evidence/WP5-REGATE/07-drill.txt`), removed after that gate (`14-image-rm.txt`). The packet labels it a development-machine
  build of `9bcdd88`, a documentation-only delta.
- The NAS image-ID rule is kept: `<image-id>` in sections 0 and 6, recorded at build time; section 10.
- No current-release mention of `74d5bfe`, `0a64a75f`, `9bcdd88` or `1b8ceae4` remains. The `74d5bfe` and `0addd200…`
  mentions in sections 3 and 5 are labelled history.
- The provenance sentences hold: this recheck built `74d5bfe` and `014bd47` from clean exports and found the 230 `dist/` files
  byte-identical.

## EN/VI parity

docs/11 sections 12 to 16 and the packet sections 0, 1, 2, 3, 5, 6 and 8 have equal numbered items, bullets, table rows,
fences, checkboxes, links, code spans and hex tokens. I read the Vietnamese of every changed sentence; each says the same as
the English.

## Risks and optional improvements (not defects)

- **R-RC-1 (Info, exact-line check).** The `grep -c` check matches only the canonical line. A quoted `"true"` prints 0, and on
  the NAS (Linux grep) a CRLF line end prints 0 too; Git Bash grep strips the CR (`09-grep-flag-check.txt`). Section 13 step 4
  expects 1 right after the edit and requires "exactly that value", so such a form shows at activation.
- **R-RC-2 (Info, ordering).** Section 13 step 6 enables automation "only after step 7 passes". The new step 7 link bullet can
  only run after step 5, and says so ("once the activation instant is set"). Optional: move that bullet into step 5, or say
  that step 7 passes without it.
- **R-RC-3 (Info, packet section 8).** It names only D-8 as a recommendation that differs from the current default. The D-5
  recommendation (a) also differs when an opening balance is recorded at pilot start (D-10). The general sentence covers it,
  and docs/12 lists the current defaults. Optional: name D-5 as well.
- **R-RC-4 (Info, residual R-F1).** Section 6 step 3 still says the restored instance runs "in capture mode". After activation
  that holds only with the section 15 step 5 override; the outbound pause still holds every send. Within section 15, step 1
  has already returned the live file to capture mode.
- **R-RC-5 (Info, R-F4 scope).** The root note covers sections 13 to 16; the backup, restore and upgrade commands of sections
  4, 6 and 8 need it on DSM too.
- **R-RC-6 (Info, citation).** Sections 3 and 5 cite WP5-REGATE2 for the identical `dist/`, but that gate compared `9bcdd88` with
  `014bd47`. This recheck closes `74d5bfe` against `014bd47` directly.
- Carried, unchanged: R-F2 (promoting restored data), R-F3/R-B5-1 (image IDs per build), R-F7/R-B5-2 (base-image pin).

## Required gates unrun or blocked, and why

- The NAS is NOT VERIFIED (no owner hardware): DSM, `sudo -i`, the reverse proxy, the real bind mount and the host alert.
- Real SMTP is not exercised; `PRODUCTION_SENDING_ENABLED` is never set.
- Not rerun here, by the brief and because the delta is two documentation files with `dist/` byte-identical:
  - the e2e suite and the container drill (WP5-REGATE passed both on `9bcdd88`);
  - `docker compose config` (WP5-REGATE).
- The manual "allow pasting" guard cannot be shown in a headless browser.

## Disposition of previous findings

- WP5-F-01, WP5-F-02, WP5-A2-01, WP5-A2-02: resolved and closed on `014bd47` / `150420e7…`.
- R-A2-1, R-A2-2/R-F1, R-F4, R-F5, R-F6: fixed in the text and accurate.
- WP5-B-01 and WP5-B-02 stay closed (WP5-FINAL-AUDIT).
- Area A and area B results on `74d5bfe` carry over: the code and `dist/` are unchanged.

## Software readiness, owner permission and pilot result

- **Software readiness: ready (pilot pending).**
  - Area A (WP5-ASSESS-A attempt 2) and area B (WP5-FINAL-AUDIT) passed on `74d5bfe`, apart from the documentation findings now
    closed.
  - The delta to `014bd47` is documentation only, and `dist/` is byte-identical.
  - Here verify (1,759 tests), AC-13 and the probe pass.
  - No blocking integrity, privacy or submission defect under docs/06.
  - The NAS is NOT VERIFIED.
- **Owner permission:** not requested and not given. Nothing is deployed, no real mail was sent, and no activation instant is set
  on any real instance.
- **Pilot result:** none; no pilot has run.

## One next action

The coordinator records WP5 software readiness on `014bd47` / `150420e7…`, has the packet changes committed, and asks the owner
for the D-1 to D-15 answers and the pilot authorization with the concrete packet. R-RC-1 to R-RC-6 are optional and do not
block. A D-3, D-5, D-6 or D-8 answer that differs from the current default starts the fix round in packet section 8.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP5-RECHECK, attempt 1, fresh `timesheet-auditor` subagent
  (self-reported `claude-opus-5-5`). Reviewed authors: the WP1–WP4 workers, and in WP5 the fixers WP5-FIXD and WP5-FIXD2, the
  packet task WP5-PKTID and their committers. Earlier WP5 authors are WP5-PLAN, WP5-FIXB, WP5-AC13, WP5-REL and WP5-PILOT.
- **Fresh context; reviewer did not author changes:** confirmed. Not the WP5-ASSESS-A (attempts 1 and 2), WP5-ASSESS-B or
  WP5-FINAL-AUDIT auditor. No source, test, doc, board, STATE, NEXT_ACTION or checkpoint edit. Written: this report and its
  translation, the brief's Results section and `evidence/WP5-RECHECK/` only.
- **Source digest before/after; gate evidence for that snapshot:** `150420e7…` (779) before and after, in the repository, the
  `git ls-tree` form and the export. The gate is WP5-REGATE2 PASS on the same freeze (WP5-REGATE on `9bcdd88`).
- **New report path preserving previous review history:** `handoff/delivery/WP5_RECHECK.md` and `.vi.md`, new files. No earlier
  report was changed.
- **Finding dispositions and next coordinator fix/recheck task:** no open finding; no fix or recheck task is needed.
