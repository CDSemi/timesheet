# GOV-E8-AUDIT dispatch brief

- Mission/task: timesheet-software-readiness / GOV-E8-AUDIT; board package GOV; kind
  audit; attempt 1; depends on GOV-E8-GATE2 (PASS required); fresh context.
- Update after GOV-E8-GATE FAIL:
  - The target is now the GOV-E8-FREEZE2 commit, with the GOV-E8-GATE2 digest.
  - The scope adds the check_recovery.py harness fix: synthetic probes are now
    independent of the live active package. Verify that no probe was weakened, the probe
    count did not fall, and the regression probe exists.
  - The governance range is `f7b9f8e3f07b68e636da54ba589b286fa59561b8..<freeze2>`.
  - GOV-E8-FIX2 is also an author.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size S,
  risk M, novelty no. Task record in English; GOV_E8_REVIEW.md/.vi.md bilingual (REVIEW
  template).
- Author separation: you are not GOV-E8-FIX or WP2-DEC; their agent IDs are on the board.
  Treat their reports as claims.
- Target: the GOV-E8-FREEZE commit and the WP2-GATE digest recorded on the board. Record
  HEAD, digest before and after, and `reviewed_commit`. Any change outside handoff/
  invalidates the audit.

## Scope (governance only; keep it proportionate)

1. The AGENTS.md and AGENTS.vi.md UI section matches owner decision E-8 (board
   `owner_decisions`, 2026-10-03): plain CSS custom properties, 4px radius, 300 ms
   ease-out. No conflicting Tailwind, brandkit or product-card reference remains. The
   owner's other intent and the three-skill orchestration are preserved. The two
   languages are equivalent.
2. AGENTS.md agrees with docs/04 "Visual standard" and docs/10 E-8.
3. No other governance path changed in `f7b9f8e..<freeze>`. Confirm this with git.
4. Run the orchestration validator yourself and `validate_package.py --preflight`
   (workflow Python).

The WP2 business docs and the fixture (E-2/E-3) are reviewed by the WP2 package audits,
not here. Report any contradiction you notice with AGENTS rules as an observation.

## Output

handoff/delivery/GOV_E8_REVIEW.md and .vi.md, results in this file, evidence in
handoff/delivery/evidence/GOV-E8-AUDIT/. Decision PASS / FIX REQUIRED / NOT VERIFIED.
Return at most 200 words, beginning with your self-reported model.

## Results

(Auditor appends here.)
