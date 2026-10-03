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
