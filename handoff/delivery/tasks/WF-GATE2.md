# WF-GATE2 dispatch brief

- Mission/task: timesheet-software-readiness / WF-GATE2; board package GOV; kind gate;
  attempt 1; depends on WF-FREEZE2.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size M, risk M, novelty no. Records in English.
- Target: the WF-FREEZE2 commit on the board (`WF-FREEZE2.commit_sha`). At start HEAD must
  equal it and nothing outside handoff/ may differ from it.
- Writable: this report and handoff/delivery/evidence/WF-GATE2/ only.

## Checks (record command | environment | exit | observed result | log path)

Repeat checks 1–8 of [WF-GATE](WF-GATE.md) on the new SHA, with these additions:

- Check 3 must report the new probe total (WF-FIX1 reported 67).
- Check 5 scratch-clone probes must include the WF-AUDIT probes
  (`SMTP_PASSWORD: Zq81probeKx`, `api_token: Zq81probeKx`,
  `handoff/delivery/evidence/WP3/employee-signature.png`, a PDF under evidence,
  `/c/Users/<real-looking-name>/x`). Each must exit 1. A Co-Authored-By trailer line with
  `noreply@anthropic.com` and a `*synthetic*` evidence image must exit 0.
- Check 8 must also confirm that no profile allows `max` effort and that every
  non-coordinator profile reads AGENTS.md from disk.

Use the Node 24 runtime and the workflow Python as in WF-GATE. Mask user paths in logs.

Decision: PASS / FAIL / NOT VERIFIED; any unrun check is NOT VERIFIED. Return at most 250
words, beginning with your self-reported model: decision, digest, HEAD, check exits,
blockers.

## Results

(Verifier appends here.)

Attempt 1 (verifier, claude-sonnet-5-5). HEAD c219d79a2c202861b719473cdffb0efb59f14290; non-handoff
changes: none. Uncommitted under handoff/: ORCHESTRATION.json, tasks/WF-FREEZE2.md,
evidence/WF-FREEZE2/*. Node 24.21.0. Logs in handoff/delivery/evidence/WF-GATE2/ (exits.txt lists exits).

| # | Check | Exit | Result |
|---|-------|------|--------|
| 1 | npm run digest before/after | 0/0 | d4d49149221e45459937d26bdd1258d681341b73712d8564a852c9131c5429d2 both, 532 files |
| 2 | validate_orchestration.py | 0 | PASS |
| 3 | check_recovery.py | 0 | PASS, probe count 67 |
| 4 | validate_package.py --preflight (workflow Python) | 0 | PASS, 91 scenarios; system Python exit 1 ZoneInfoNotFoundError America/Los_Angeles |
| 5 | precommit --self-test | 0 | 35 path, 59 line samples, 12 rules |
| 5 | scratch clone probes (probes.txt, probes-extra.txt); clone deleted | - | SMTP_PASSWORD, api_token, WP3 employee-signature.png, evidence PDF, /c/Users/<name>/x, .env, signature.png, private-key header, non-synthetic email: each exit 1; trailer line and *synthetic* image: exit 0; clean README edit exit 0 |
| 6 | npm run verify | 0 | 174 tests passed, build and smoke passed |
| 6 | git diff --check fd77a87..HEAD | 0 | clean |
| 7 | git diff --stat 1a25275..HEAD -- src tests package-lock.json | 0 | empty |
| 8 | profile inventory (profiles.txt) | - | nine profiles; no max effort; all 8 non-coordinator profiles read AGENTS.md from disk; only committer mentions git commit/push |

Note: first probe round's `.env` probe gave exit 0 only because git add -A skipped the gitignored file
(0 staged); rerun with git add -Af blocked (exit 1). Digest unchanged before/after.
Decision: PASS.
