# GOV-E8-FIX2 dispatch brief

- Mission/task: timesheet-software-readiness / GOV-E8-FIX2; board package GOV; kind fix;
  attempt 1; addresses the GOV-E8-GATE FAIL (gate report:
  [GOV-E8-GATE](GOV-E8-GATE.md), log
  handoff/delivery/evidence/GOV-E8-GATE/check-recovery.txt).
- Profile/routing: timesheet-worker, requested sonnet/medium, no override. Routing: size S,
  risk M (governance test harness), novelty no. Records in English.
- Read AGENTS.md from disk first, then handoff/delivery/check_recovery.py,
  handoff/delivery/validate_orchestration.py (read-only) and docs/08 governance rules.

## Problem (observed)

`python handoff/delivery/check_recovery.py` exits 1 with "Running task outside active
package" at probe "replacement attempt keeps same task ID". The cause is that synthetic
tasks default to package WP1 while the live board's `active_package` is now WP2. The
probes depend on mutable live board/state values.

## Required change

1. Make every synthetic probe self-contained. Each one builds a synthetic board and a
   synthetic state whose active package and task packages are consistent. As an
   alternative, derive the defaults consistently from the base board and state. No probe
   may depend on the live board's current package, phase or task list.
2. Keep exactly one acceptance probe that validates the live board and STATE as they
   are.
3. Keep the intent and expectation of every existing probe (81 today). Do not weaken any
   rejection.
4. Add a regression probe showing that the suite gives the same results when the base
   active package is not WP1, for example WP3.
5. Change no other file.

## Owned (writable) paths

handoff/delivery/check_recovery.py; this report; handoff/delivery/evidence/GOV-E8-FIX2/.

## Checks

- `python handoff/delivery/check_recovery.py`: exit 0, with the new probe total.
- `python handoff/delivery/validate_orchestration.py`: exit 0.
- `git diff --check`.
- Evidence must be masked, with LF line endings and a single final newline.
- Return at most 150 words, beginning with your self-reported model: the approach, the
  probe count before and after, check exits, deviations.

## Results

Self-reported model: claude-sonnet-5-5.

- Approach: the probes now run inside `suite()` against a synthetic board and a synthetic
  STATE built by `synthetic_state()` (active package, task packages and prior-phase reviews
  consistent). Nothing in the suite reads the live package, phase or task list. The
  "WP2 blocked" probe is now synthetic ("next package blocked by unresolved base package").
- One acceptance probe ("current board is valid") validates the live board and STATE as is.
- Regression probe: the suite is rerun with base WP3 and must yield the same probe names;
  it is recorded as "suite gives the same results when the base active package is WP3".
- Probe count: 81 before, 82 after. No rejection weakened.
- Checks (evidence in handoff/delivery/evidence/GOV-E8-FIX2/): check_recovery.py exit 0
  (count 82); validate_orchestration.py exit 0; git diff --check exit 0.
- Deviations: none. Only check_recovery.py, this brief and the evidence directory changed.
