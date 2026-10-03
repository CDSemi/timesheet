# WF-FIX1 dispatch brief

- Mission/task: timesheet-software-readiness / WF-FIX1; governance fix for WF-AUDIT
  FIX REQUIRED (board package WP1 until the validator accepts GOV); kind fix; attempt 1.
- Profile/routing: timesheet-worker-high, requested sonnet/high, no override. Routing:
  size M, risk H (governance integrity), novelty no. Root causes are specified; this is
  the first fix round, so no escalation.
- Baseline: HEAD fd77a8717da9a1b2ea9ce13520d59b9df60f4716 (= origin/main). Findings:
  handoff/delivery/WORKFLOW_REVIEW.md (WF-A-01..WF-A-10), evidence in
  handoff/delivery/evidence/WF-AUDIT/. Records in English.
- Preserve, do not edit: board, STATE, NEXT_ACTION, checkpoints, other tasks' reports
  and evidence, WORKFLOW_REVIEW files, src/, tests/, package-lock.json.

## Owned (writable) paths

handoff/delivery/validate_orchestration.py; handoff/delivery/check_recovery.py;
scripts/precommit-check.mjs; .claude/agents/; docs/08_AI_WORKFLOW_AND_BUDGET.md and
.vi.md; docs/10_DECISIONS_AND_SOURCES.md and .vi.md; handoff/prompts/RESUME.md and .vi.md;
this report; handoff/delivery/evidence/WF-FIX1/.

## Coordinator decisions (binding)

1. WF-A-01 audit strength: one rule. An auditor's model is never weaker than the
   strongest author model of the reviewed snapshot; the validator enforces it with no
   bypass. If that model is unavailable, checkpoint and wait or raise an owner blocker.
   A Sonnet auditor (timesheet-auditor with model override sonnet, reason
   fallback_unavailable; effort stays the profile's xhigh) is valid only when no author
   used Opus. Remove "Sonnet/high" wording.
2. WF-A-02 governance scope: tasks may use package `GOV` (not part of
   `authorized_scope`, which stays WP1–WP5). Running GOV tasks are exempt from "running
   task outside active package"; stale-PASS checks stay limited to the active package;
   a done GOV audit also needs `reviewed_commit` (40-hex). Dependencies may cross
   packages. Governance paths: AGENTS.md, CLAUDE.md and pairs, docs/08 and pair,
   handoff/prompts/, handoff/templates/, .claude/, handoff/delivery/validate_*.py,
   handoff/delivery/check_recovery.py, scripts/precommit-check.mjs. Any change to them
   requires a GOV freeze commit, gate and fresh audit. A GOV PASS is identified by its
   reviewed commit (the source digest excludes handoff/) and is superseded only by a
   later governance change. NEXT_ACTION, STATE, board, checkpoints and docs/10 are state
   or records, not governance paths.
3. WF-A-03 and WF-A-09 precommit: detect unquoted `name: value` and `name=value`
   secrets (password, passwd, secret, token, api key, SMTP user/password and similar)
   with non-placeholder values; block PDF, image or signature-named files anywhere
   unless the basename contains `synthetic` (reference/fixtures/ and
   reference/examples/ stay allowed); block added lines containing concrete user-profile
   paths (`C:\Users\name`, `C:/Users/name`, `/c/Users/name`, `/Users/name`,
   `/home/name`), ignoring placeholders such as `<user>`, `%USERNAME%`, `$USER`,
   `{user}`. Add self-test cases for each, including the auditor's probes
   (`SMTP_PASSWORD: Zq81probeKx`, `api_token: Zq81probeKx`,
   `handoff/delivery/evidence/WP3/employee-signature.png`, a PDF in evidence,
   `/c/Users/<real-looking-name>/x`). Already committed evidence is not rewritten (no
   history rewrite); record that deferral in docs/10.
4. WF-A-04: remove `max` from allowed efforts (owner decision needed to add it back);
   add a probe.
5. WF-A-05: authors of an audit = agent_id and previous_agent_ids of every task in the
   same package whose kind is not gate, audit or commit, plus the audit's
   `author_agent_ids`; use this set for both separation and strength; add probes
   (documentation author, previous attempt author).
6. WF-A-06: RESUME (+vi) reads uncommitted/unpushed work and live processes from the
   board and checkpoint and delegates inspection when required; the coordinator never
   inspects git or processes itself.
7. WF-A-07: every non-coordinator profile reads AGENTS.md from disk at task start
   (context copies may be stale); drop "unless it is already in your context". Doc 08
   notes that a client restart refreshes injected AGENTS/CLAUDE context.
8. WF-A-08: committer runs Node commands with the Node 24 runtime (doc 08 path) and
   records `node --version` in commit evidence. Committer may mask concrete user-profile
   paths in staged evidence logs (replace the account segment with `<user>`), record
   each masked file and rerun all checks; it changes no other content.
9. WF-A-10: doc 08 defines "package-final snapshot" = the snapshot whose audit PASS would
   accept the package, including FIX REQUIRED rechecks that unlock the next package; it
   keeps a separate verifier gate. gate_included is only for intermediate S-size fixes.
   (The coordinator re-plans the F-01 chain on the board.)
10. docs/10 (+vi): record decisions 2, 3 (deferral of retroactive redaction), 4 and 9.

## Checks (record actual exits in your evidence dir)

`python handoff/delivery/validate_orchestration.py` (real board; WF tasks still use
package WP1 until the coordinator relabels them); `python handoff/delivery/check_recovery.py`
(new probes for decisions 1, 2, 4, 5); `node scripts/precommit-check.mjs --self-test`
(Node 24); a scratch-clone run of the auditor's five probes expecting exit 1 and a clean
change expecting exit 0 (outside Dropbox, per-process safe.directory override, delete
afterwards); `npm run lint` (Node 24); `validate_package.py --preflight` with the Python
in handoff/delivery/evidence/orchestration/run-validation.ps1; `git diff --check`.
Also run the new precommit path/media rules read-only over the uncommitted evidence of
WF-FREEZE, WF-GATE and WF-AUDIT and list any file that would block (do not edit them).
Mask user paths in your own logs. Node 24 recipe: see WF-IMPL-TOOLING brief.

Return at most 300 words, beginning with your self-reported model: files changed, checks
with exits, files that would block, deviations.

## Results

(Worker appends here.)

### Attempt 1 results (worker-high, self-reported model claude-sonnet-5-5)

Files changed (owned paths only; src/, tests/, package-lock.json, board, STATE, NEXT_ACTION,
checkpoints, other tasks and WORKFLOW_REVIEW untouched): handoff/delivery/validate_orchestration.py,
handoff/delivery/check_recovery.py, scripts/precommit-check.mjs, .claude/agents/ (all eight non-coordinator
profiles read AGENTS.md from disk; auditor strength wording; committer Node 24 + `node --version` + evidence
masking), docs/08 + .vi, docs/10 + .vi (decisions 2, 3 incl. deferral, 4, 9), handoff/prompts/RESUME.md + .vi,
this report, handoff/delivery/evidence/WF-FIX1/.

Changes by decision:
1. One audit-strength rule with no bypass (validator: `fallback_unavailable` no longer skips the check; a Sonnet
   auditor passes only when no author is Opus). Doc 08/profile wording; "Sonnet/high" removed.
2. Package `GOV` (TASK_PACKAGES; authorized_scope still WP1-WP5); running GOV tasks exempt from the
   active-package check; done GOV audit needs reviewed_commit; governance path list in doc 08.
3. precommit: unquoted `name: value`, `- name: value` and INI `name=value` secrets (an unquoted YAML value needs a
   digit, a symbol or 12+ chars so type names and prose do not trip it); PDF/image/signature files blocked unless
   the basename contains `synthetic` (the evidence directory is no longer exempt; reference/fixtures and
   reference/examples stay allowed); concrete user-profile paths (Windows backslash and forward-slash drive paths,
   /c/, /mnt/c/, /Users/, /home/) now BLOCK, placeholders (<user>, %USERNAME%, $USER, ${USER}, {user}, user,
   public ...) ignored. Self-test: 35 path + 55 line samples including the auditor's probes.
4. `max` removed from EFFORTS; probe through the new `parse_profile` (also ultracode, opusplan, worker with Agent).
5. Author set = agent_id + previous_agent_ids of every non-gate/audit/commit task of the package + author_agent_ids,
   used for both separation and strength; probes for a documentation author and a previous-attempt author.
6. RESUME (+vi): the board and checkpoint are the source; inspection is delegated; the coordinator never inspects
   git or processes itself.
7. Profiles read AGENTS.md from disk; doc 08 notes that a client restart refreshes injected AGENTS/CLAUDE context.
8. Committer runs Node 24 (doc 08 path), records `node --version`, may mask `<user>` in staged evidence logs.
9. Package-final snapshot defined in doc 08 (+vi).

Checks (logs in handoff/delivery/evidence/WF-FIX1/, account name masked; Node v24.21.0; workflow Python from
run-validation.ps1; runner `run-checks.sh`):
- 1a validate_orchestration.py on the real board: EXIT 1 "Dependency audit not PASS: WF-FIX1". PRE-EXISTING: 1b
  shows the baseline (git HEAD) validator fails identically (running WF-FIX1 depends on WF-AUDIT, which is FIX
  REQUIRED). The board is outside my paths; the coordinator must resolve it (relabel to GOV and/or drop that
  dependency). 1c, with WF-FIX1.depends_on cleared in memory: EXIT 0 (the working-tree validator accepts the real
  board).
- 2a check_recovery.py on the real board: EXIT 1, same pre-existing cause (first probe "current board is valid").
  2c, with the same in-memory blanking: EXIT 0, 67 synthetic checks (was 48). 2b runs the new probes statement by
  statement against the HEAD validator: 12 statements fail there (strength bypass, documentation and
  previous-attempt author, GOV, max effort), i.e. the probes detect the old gaps.
- 3 `node scripts/precommit-check.mjs --self-test`: EXIT 0.
- 4a scratch clone (outside Dropbox, per-process safe.directory, deleted afterwards): the auditor's five probes
  (SMTP_PASSWORD, api_token, signature png in evidence, PDF in evidence, /c/Users path) plus INI and forward-slash
  drive path all exit 1; synthetic-named media, a fixture PDF, placeholder paths and a clean change exit 0 (0
  mismatches). 4b, the HEAD script on the same cases: 6 mismatches (5 probes + forward-slash path), so the cases
  are meaningful.
- 5 read-only scan of the uncommitted WF-FREEZE (4 files), WF-GATE (11) and WF-AUDIT (12) evidence with the new
  rules (copies staged in a scratch clone): 27 files, EXIT 1 with ONE blocking file:
  handoff/delivery/evidence/WF-FREEZE/commit-message.txt:15 (the Co-Authored-By attribution line with the Claude noreply address,
  rule `email`). The HEAD rules block it identically (5b). No profile-path or media finding in any of the three.
  The committer will hit this for the WF-FREEZE accept commit: either allow the attribution address (a
  governance change to precommit-check.mjs, needs freeze/gate/audit) or keep commit-message files out of the
  staged evidence. I did not change the rule (outside the brief).
- 6 scan of this task's own changes (38 files) with the new rules: EXIT 0.
- 7 `npm run lint` (Node 24, --trace-deprecation --pending-deprecation): EXIT 0, no warnings.
- 8 `validate_package.py --preflight` (workflow Python): EXIT 0. 9 `git diff --check`: EXIT 0.

Deviations: (a) real-board validator/check_recovery runs fail for the pre-existing dependency reason above;
in-memory variants (1c, 2c) are provided. (b) validate_orchestration.py working-tree line endings normalized to LF
per .gitattributes (my first write had produced CRLF). (c) No permission rules added; edits and probes stayed in
owned paths and scratch.

### Follow-up (coordinator message, same attempt)

1. Board fixed by the coordinator (WF-FIX1 depends_on empty, addresses_audit WF-AUDIT). Real-board
   validator and check_recovery rerun without the in-memory workaround: see logs 1a and 2a (exits below).
2. precommit email rule: exact-address allowlist (a Set with the single commit-attribution address; no domain or
   wildcard). Self-test now has 59 line samples: the attribution trailer passes; the same local part with a
   suffix, another local part at the same domain, and the same local part at another domain all still block.
   docs/08 and docs/08.vi gained one clause stating the exact allowlist. Logs 3, 5, 6, 7, 9 rerun
   (see below for the actual exits).
   Actual exits (final rerun, Node v24.21.0): 1a validate_orchestration real board 0 (14 tasks); 2a check_recovery
   real board 0 (67 checks); 3 --self-test 0; 5 scan of uncommitted WF-FREEZE/WF-GATE/WF-AUDIT evidence with the new
   rules 0 (27 files, no blocking file; the baseline rules in 5b still exit 1 on the attribution line);
   6 scan of own changes 0 (38 files); 7 npm run lint 0; 8 preflight 0; 9 git diff --check 0.
   The earlier "pre-existing board failure" deviation and the in-memory logs 1c/2c are now superseded.
