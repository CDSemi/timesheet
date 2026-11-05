# GOV-DIRECT2 dispatch brief (risk-area tests inside the direct change policy)

- **Task.** Mission timesheet-software-readiness, task GOV-DIRECT2, package GOV, kind
  implement, attempt 1. It depends on GOV-DIRECT-COMMIT (23e653e).
- **Owner decision, 2026-11-04.** The board has it verbatim under `owner_decisions`. Without
  gates, an error in time or OT, or in email sending, could slip through until the owner
  tests. The owner allows separate test steps for that, or the agents testing it
  themselves.
- **Profile and routing.** timesheet-worker, requested sonnet, no override. Routing: size S,
  risk L (rule text only), novelty no. This task follows the direct policy: your own quick
  look, then one commit, no review.
- **AGENTS.md on disk wins.** Read rules 5 and 14 and document 08, "Direct change policy",
  first.

## The addition (write it in the fewest words)

**Risk-area tests, run by the worker itself, without asking the owner.** When a change touches
any of these areas:
- time and accounting dates, reporting zones, sessions and breaks;
- the OT calculation or the OT ledger and its balance;
- sign-off, revisions and corrections;
- submission and email sending: the Send card, jobs, deliveries, reminders, the PDF and mail
  rendering;

the worker runs these in the same task, besides the quick suite of rule 5:
- the unit and integration test files of that area;
- the e2e specs of that area;
- `npm run verify`, the smoke run of the built server in capture mode.

It records the commands and their results. This stays inside the one worker task: there is
no separate gate, and a full e2e run, sweep, drill or audit still needs the owner's yes.

## What to change

1. **`AGENTS.md` and `AGENTS.vi.md`, rule 5:** one added sentence, or two.
2. **`docs/08_AI_WORKFLOW_AND_BUDGET.md` and `.vi.md`, "Direct change policy":** the same,
   with the area list. If a table maps paths to areas, name the main source folders, for
   example `src/domain/`, the server services for timesheets, OT, sign-off and sending,
   `src/server/mail` or the PDF module. Check the real paths with Glob first.
3. **`.claude/agents/timesheet-worker.md` and `timesheet-worker-high.md`:** one line each.
   Change the text only, never the frontmatter.
4. **`handoff/prompts/ORCHESTRATE.md` and `.vi.md`:** one clause in the change step, if that
   step lists the checks.

## Hard limits

- **Change only** the files above and this brief's Results.
- **Do not change** the board, STATE, NEXT_ACTION, the checkpoint, `src/`, `tests/`,
  `scripts/` or `.claude/settings.json`.
- **Git.** Do not commit, stage or push. Change no git configuration.
- **Shell.** Use Git Bash. NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO
  `python -c`), NO PIPES INTO `head`, `tail` OR `cat`, NO `/dev/null` OR `nul` REDIRECTS,
  NO `sed -i`, NO `rm -r`.
- **Permissions.** If a permission check denies a call, stop and report.

## Checks

1. `python handoff/delivery/check_recovery.py` and
   `python handoff/delivery/validate_orchestration.py`, with the workflow Python
   (`$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`).
   Both must exit 0.
2. A quick look that each EN/VI pair carries the same rule.
3. `git status --short`: list the changed paths.

## Return

Return at most 100 words, beginning with "Self-reported model: ...". Include:
- the changed files;
- the added rule in one sentence;
- the check results.

Append the same to Results, ending with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5. Changed: AGENTS.md/.vi (rule 5), docs/08 EN/VI (Direct change policy, item 2, real source folders), timesheet-worker and -worker-high (text), ORCHESTRATE EN/VI (step 3). Rule: for time, OT/ledger, sign-off or sending changes the worker also runs that area's unit, integration, e2e specs and `npm run verify`, no separate gate; full e2e, sweeps, drills, audits need the owner's yes. check_recovery.py exit 0; validate_orchestration.py exit 0. Status: done
