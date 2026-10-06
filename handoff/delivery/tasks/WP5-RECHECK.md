# WP5-RECHECK dispatch brief

- Mission/task: timesheet-software-readiness / WP5-RECHECK; package WP5; kind audit;
  attempt 1; depends on WP5-REGATE2 (PASS) and WP5-PKTID.
- WP5-REGATE ran the full gate on 9bcdd88. WP5-FIXD2 then fixed the same status
  wording in docs/11 section 11 and in other docs, and WP5-REGATE2 gated that
  docs-only delta.
- Scope: the closing independent WP5 recheck on the documentation fix freeze. It
  rechecks the four Low findings:
  - WP5-F-01 and WP5-F-02 from [WP5_REVIEW_FINAL](../WP5_REVIEW_FINAL.md);
  - WP5-A2-01 and WP5-A2-02 from [WP5_REVIEW_A2](../WP5_REVIEW_A2.md).

  It also checks the small runbook risk fixes, the refreshed packet identity, and that
  nothing else changed since the reviewed freeze 74d5bfe. Areas A and B passed on
  74d5bfe apart from these documentation findings.
- Profile/routing: timesheet-auditor (xhigh), model opus. Routing: size M, risk M,
  novelty no.
- Fresh context. You authored no WP1–WP5 change. You are not one of these earlier
  WP5 auditors:
  - WP5-ASSESS-A, attempts 1 and 2;
  - WP5-ASSESS-B;
  - WP5-FINAL-AUDIT.
- Language: the task record is in English. `WP5_RECHECK.md` and its `.vi.md` follow
  the REVIEW form.
- Target: `reviewed_commit` is the WP5-REGATE2 `freeze_commit`. The coordinator gives
  the SHA and the gate digest in the dispatch prompt. Record HEAD and the digest before
  and after: in the repository, in the `git ls-tree` form and on your export.

## Read

- AGENTS.md, from disk.
- [WP5_REVIEW](../../prompts/WP5_REVIEW.md); docs/05, docs/06, docs/07, docs/11 and
  docs/12.
- Both reviews named above: their findings, risks and evidence.
- The results of WP5-FIXD, WP5-REGATE, WP5-FIXD2, WP5-REGATE2 and WP5-PKTID.
- `handoff/delivery/WP5_PILOT_PACKET.md`. Inspect the evidence; do not trust the
  summaries.

## Scope

1. **Delta since 74d5bfe.** Only documentation may have changed outside handoff/:
   docs/11, plus any other docs WP5-FIXD2 lists. Confirm this. Confirm that no
   application source, test, Compose or example file changed.
2. **WP5-F-01 and WP5-A2-01.**
   - Start the built app from a clean export in capture mode, with synthetic data.
   - Compare the administrator status screen and `GET /api/admin/operations` with the
     words in docs/11 section 11 and sections 13–14, and packet sections 2 and 6.
     Also compare them with every other sentence WP5-FIXD2 changed.
   - Run the documented `grep -c` flag check on a synthetic env file, with the flag
     present and absent.
   - Check the refusal sentence against `cli.ts` and the server start.
3. **WP5-A2-02.** Open `https://<host>/#/review/<payroll-date>` against your local
   instance; use your loopback origin as the host. Check that it asks for sign-in and
   then opens the review. Check that the first-reminder link step exists and matches
   the reminder link form in the code.
4. **WP5-F-02.** Packet section 8 now describes a fix round before activation, and
   matches the board `pending_owner_question.blocking`.
5. **The small risk fixes:** R-A2-1, R-A2-2/R-F1, R-F4, R-F5 and R-F6. Each is
   accurate and executable.
6. **Packet identity.**
   - Sections 0 and 6 name the WP5-REGATE2 freeze and digest.
   - They name the WP5-REGATE development image ID, with its documentation-only note.
   - They keep the NAS image-ID rule.
7. **EN/VI parity** of the changed sections.
8. **Overall verdict** for WP5 software readiness. Take the area A and B results on
   74d5bfe, plus this delta, into account. Keep software readiness, owner permission
   and the pilot result separate.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-RECHECK`. Ports 47760–47779. No Docker,
  unless a finding needs it; then use Compose project `ts-wp5-recheck` and remove it
  by name.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER feed anything to python or node through stdin. Never use a heredoc.** Call
  python only as the workflow Python running a named script by path.
- Never pipe into head or tail. Stop only processes you spawned, through their own
  handle. Never kill by PID.
- Never redirect to /dev/null or nul. Never remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Do not fix anything, send real mail or set `PRODUCTION_SENDING_ENABLED`.

## Output

- `handoff/delivery/WP5_RECHECK.md` and `.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence in `handoff/delivery/evidence/WP5-RECHECK/`, with probes
  saved as `*.mjs.txt`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings listed
  separately.
- Leave nothing running.

Return at most 200 words, beginning with your self-reported model.

## Results

(Auditor appends here.)

### Auditor result (attempt 1) - decision: PASS

Self-reported model: claude-opus-5-5. Fresh timesheet-auditor subagent; not an author of any WP1-WP5 change and not the
WP5-ASSESS-A (attempts 1, 2), WP5-ASSESS-B or WP5-FINAL-AUDIT auditor. Report: [WP5_RECHECK](../WP5_RECHECK.md) (VI:
[WP5_RECHECK.vi](../WP5_RECHECK.vi.md)). Evidence: `handoff/delivery/evidence/WP5-RECHECK/` (index `00-README.txt`).

- Reviewed commit 014bd47a8d906c944d2781eba4f2b91c5a532419 (HEAD = origin/main, 0 unpushed) before and after. Digest
  150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61 (779 files) before (23:12Z) and after (23:28Z, and at the
  end) in the repository (`scripts/source-digest.mjs`), the `git ls-tree` form and a clean `git archive 014bd47` export.
- Runtime: Git Bash only, portable Node v24.21.0 first on PATH, npm scripts in Git Bash, `DATA_DIR`/`DATABASE_PATH` in the
  task folder for every run, ports 47760-47761, no Docker, capture mode, `PRODUCTION_SENDING_ENABLED` never set in a process.

| # | Scope item | Result |
|---|---|---|
| 1 | Delta since 74d5bfe | only docs/11 EN and VI (+22/-20) outside handoff/; 0 src, tests, scripts, migrations, package, Dockerfile, Compose or example paths. dist of 74d5bfe and 014bd47 built from clean exports: 230 files, 4,044,281 bytes, identical. npm ci exit 0 (lockfile unchanged); verify exit 0 (77 files, 1759 tests, SMOKE PASSED); AC-13 alone exit 0 |
| 2 | WP5-F-01, WP5-A2-01 | resolved. Live built server (production, capture, runner on), Edge headless: screen "Sender address: Configured", "Outbound mode: Capture only (nothing leaves the server)", "Not activated", 0 flag mentions; JSON `sender` = {configured, outbound_mode}, no flag key; docs/11 s12, s13 steps 2/4, s14 step 4, packet s2 and s6 step 1 match. grep -c check: 0 without the line/commented/false, 1 with it, never a value. Refusal (smtp, no flag): server exit 1, backup --to and restore exit 1 naming the flag, no value printed; migrate 0, backup prune --dry-run 0, outbound previews 2, bootstrap/run-jobs/seed refuse for their own reasons |
| 3 | WP5-A2-02 | resolved. Signed out, `<loopback>/#/review/2026-10-09` shows sign-in (hash kept), then opens that review. Captured submission has no URL. s13 step 7 link check exists; first reminder after activation carries exactly `https://timesheet.example.invalid/#/review/2027-01-01` (= `reviewLink`), and that link (loopback host) asks for sign-in then opens the review |
| 4 | WP5-F-02 | resolved: packet s8 states the fix round before activation and the s0/s6 refresh; equals the board `pending_owner_question.blocking` (working tree and HEAD) |
| 5 | Small risk fixes | R-A2-1 accurate (history "Accepted by the mail server"; API `captured`, `capture-...`); R-A2-2/R-F1 executable (shell TIMESHEET_ENV_FILE override, proven by WP5-REGATE 08-config-rollback); R-F4 consistent (DSM not observable); R-F5 accurate (LA 2026-12-31 16:00, Tokyo 2027-01-01 09:00, NY 2026-12-31 19:00, no label); R-F6 accurate by reading |
| 6 | Packet identity | s0 and s6 name 014bd47 and 150420e7 (779); image bd17d061 = WP5-REGATE drill of 9bcdd88, documentation-only note, removed after the gate; NAS image-ID rule kept; 74d5bfe/0addd200 only as labelled history |
| 7 | EN/VI parity | docs/11 s12-16 and packet s0-3, 5, 6, 8 structurally equal; changed VI sentences read and equal in meaning |
| 8 | Overall | software ready (pilot pending); NAS NOT VERIFIED; owner permission not requested or given; no pilot result |

- Probe: one run, 27 PASS, 0 FAIL (`08-probe-log.txt`). Findings: none. Risks (optional, Info): R-RC-1 exact-line grep (quoted
  or CRLF prints 0; caught at activation), R-RC-2 s13 step 6/7 ordering wording, R-RC-3 packet s8 names only D-8 (D-5 (a)
  also differs if an opening balance is recorded), R-RC-4 s6 step 3 "in capture mode" residual, R-RC-5 root note scope,
  R-RC-6 dist citation (closed here directly).
- `validate_package.py --preflight` (workflow Python, by path) after the reports: exit 0, PASS, 91 pairs (`96-preflight.txt`).
  Precommit check over this task's files in a private git dir outside the repository: run 1 exit 0, PASS, 36 staged files,
  0 blocking findings, 0 warnings; preflight and precommit were rerun after this last edit (run 2 in `96-preflight.txt` and
  `97-precommit.txt`).
- Not run: e2e and the drill (WP5-REGATE on 9bcdd88; docs-only delta, dist identical), Docker, real SMTP, the NAS.
- Nothing left running: no listener on 47760-47779, no portable-Node process (`98-process-listing.txt`); the probe stopped its
  own servers through their child handles and closed its browser. Nothing committed, sent or edited outside the owned paths.
