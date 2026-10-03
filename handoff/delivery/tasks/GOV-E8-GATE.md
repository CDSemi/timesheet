# GOV-E8-GATE dispatch brief

- Mission/task: timesheet-software-readiness / GOV-E8-GATE; board package GOV; kind gate;
  attempt 1; depends on GOV-E8-FREEZE.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk M, novelty no. Records in English.
- Target: the GOV-E8-FREEZE commit (board `GOV-E8-FREEZE.commit_sha`). HEAD must equal it
  and nothing outside handoff/ may differ. Writable: this report and
  handoff/delivery/evidence/GOV-E8-GATE/ only.

## Checks (record command | environment | exit | observed result | log path)

1. `npm run digest` (Node 24) before and after; the two values must be equal.
2. `python handoff/delivery/validate_orchestration.py` and
   `python handoff/delivery/check_recovery.py` (probe total).
3. `python handoff/delivery/validate_package.py --preflight` with the workflow Python
   recorded in handoff/delivery/evidence/orchestration/run-validation.ps1. Expect pairs,
   links and 91 scenarios.
4. `npm run verify` (Node 24). The commit changes a reference fixture.
5. `git diff --check f7b9f8e3f07b68e636da54ba589b286fa59561b8 HEAD`. Then list the
   governance paths changed in that range; the expected result is AGENTS.md and
   AGENTS.vi.md only.
6. Wording check: AGENTS.md and AGENTS.vi.md no longer reference tailwind.config.js, the
   brandkit, or P8000/P9000. They state CSS custom properties, a 4px radius and 300 ms
   ease-out.

Mask user paths in logs; use LF line endings and a single final newline. Decision: PASS /
FAIL / NOT VERIFIED. Return at most 200 words, beginning with your self-reported model.

## Results

(Verifier appends here.)
