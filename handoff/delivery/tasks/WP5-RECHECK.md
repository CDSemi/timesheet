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
