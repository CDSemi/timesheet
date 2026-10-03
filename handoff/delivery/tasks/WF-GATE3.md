# WF-GATE3 dispatch brief

- Mission/task: timesheet-software-readiness / WF-GATE3; board package GOV; kind gate;
  attempt 1; depends on WF-FREEZE3.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk M, novelty no. Records in English.
- Target: the WF-FREEZE3 commit (board `WF-FREEZE3.commit_sha`); HEAD must equal it and
  nothing outside handoff/ may differ. Writable: this report and
  handoff/delivery/evidence/WF-GATE3/ only.

## Checks (record command | environment | exit | observed result | log path)

Repeat checks 1–8 of [WF-GATE2](WF-GATE2.md) on the new SHA, with these additions:

- check_recovery must report the new probe total and include a gate/audit commit
  mismatch (rejected), a match (accepted), and an `addresses_audit` misuse (rejected).
- In the scratch clone, replay the WF-AUDIT2 5b spaced-secret forms (each exit 1) and a
  prose value with spaces (exit 0), in addition to the WF-GATE2 probe set.
- A wording check: ORCHESTRATE.md, FIX_FINDINGS.md and their .vi.md limit gate_included
  to intermediate S-size fixes.

Use Node 24 and the workflow Python as before; mask user paths in logs. Decision: PASS /
FAIL / NOT VERIFIED. Return at most 250 words, beginning with your self-reported model.

## Results

(Verifier appends here.)

Attempt 1 (verifier, claude-sonnet-5-5). HEAD 6578df8f81e8c0ead5ec09444b7bd8fa081d1ff7; non-handoff
changes: none. Uncommitted under handoff/: ORCHESTRATION.json, tasks/WF-FREEZE3.md,
evidence/WF-FREEZE3/*. Node 24.21.0. Logs in handoff/delivery/evidence/WF-GATE3/ (exits.txt).

| # | Check | Exit | Result |
|---|-------|------|--------|
| 1 | npm run digest before/after | 0/0 | 2f50be649666c785f9fd3db99f67c6d9115ad75b3dda089c36fbfb8d460af7b3 both, 532 files |
| 2 | validate_orchestration.py | 0 | PASS |
| 3 | check_recovery.py | 0 | PASS, 81 probes; includes gate/audit commit mismatch rejected, match accepted, addresses_audit misuse rejected |
| 4 | validate_package.py --preflight (workflow Python) | 0 | PASS, 91 scenarios |
| 5 | precommit --self-test | 0 | 35 path, 74 line samples, 12 rules |
| 5 | scratch clone probes (probes.txt), clone deleted | - | WF-GATE2 set (smtp, api_token, WP3 signature png, pdf, /c/Users path, .env, signature.png, private key, email) and 7 spaced-secret 5b forms: each exit 1; prose values, attribution trailer, *synthetic* image, clean README: exit 0 |
| 6 | npm run verify | 0 | 174 tests passed, build and smoke passed |
| 6 | git diff --check c219d79..HEAD | 0 | clean |
| 7 | git diff --stat 1a25275..HEAD -- src tests package-lock.json | 0 | empty |
| 8 | profile inventory | - | nine profiles; no max effort; 8 non-coordinator profiles read AGENTS.md from disk; only committer mentions git commit/push |
| W | wording check | - | ORCHESTRATE.md, FIX_FINDINGS.md and .vi.md limit gate_included to intermediate S-size fixes |

Decision: PASS.
