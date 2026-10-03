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
