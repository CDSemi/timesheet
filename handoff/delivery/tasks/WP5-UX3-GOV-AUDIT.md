# WP5-UX3-GOV-AUDIT dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-GOV-AUDIT; board package GOV; kind
  audit; attempt 1; depends on WP5-UX3-GOV-GATE (PASS required); fresh context.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size S,
  risk M, novelty no. Task record in English; `handoff/delivery/GOV_UX3_REVIEW.md` and
  `.vi.md` bilingual (REVIEW template in `handoff/templates/`).
- Author separation: you did not write WP5-UX3-GOV or WP5-UX3-PLAN (their agent IDs are on
  the board). Treat their reports as claims.
- Target: the WP5-UX3-GOV-FREEZE commit (board `commit_sha`) with the gate digest
  a682f15323b7204010060b9619cc38b29cc5afd331c01f7c7622d8be06408d8b (817 files). Record HEAD,
  the digest before and after, and `reviewed_commit`. Any change outside `handoff/`
  invalidates the audit.

## Owner basis (board `owner_decisions`, 2026-10-15)

- U-01 (verbatim): "Đừng ép dùng theme style chuẩn công nghiệp, đây không phải app công
  nghiệp. hãy dùng modern style." (Do not force the industrial-standard style theme; this
  is not an industrial app. Use a modern style.)
- G-1 (b): the mockup and the modern direction are approved, with changes (square week
  sheets, 4px selection columns, no overlapping shadows between adjacent lifted columns, a
  floating editor panel when the sheet and the panel do not fit side by side). These are
  document 04 and token values, implemented in later WP5 slices.
- E-8 (2026-10-03) adopted plain CSS custom properties, a 4px radius and 300 ms ease-out
  transitions; the round-3 decision replaces the radius and motion values and keeps plain
  CSS custom properties.

## Scope (governance only; keep it proportionate)

1. The new AGENTS.md section and its AGENTS.vi.md counterpart implement U-01 and G-1:
   no industrial or "B2B semiconductor hardware" direction remains; the checks that still
   apply are kept (tokens as CSS custom properties in the light set and both dark sets, a
   consistency pre-flight, accessible states with WCAG 2.2 AA, a shared transition
   property, reduced motion); the three named skills become optional references that yield
   to the section, the CSP, accessibility and document 04. The text equals
   `handoff/delivery/tasks/WP5-UX3-PLAN.md` section B2.
2. EN and VI are equivalent (AGENTS rule 1), including the backlog item GOV-E8-AUDIT R2
   ("mobile-first" in VI item 2).
3. Consistency with other rules: AGENTS rules 1-13 and the CLAUDE.md import; the content
   security policy (docs/03: system fonts only, no external icon or animation library);
   docs/04 accessibility promises. Planned transition, not a finding by itself: docs/04
   "Visual standard" and docs/10 E-8 still describe 4px and 300 ms until slice WP5-UX3-T01
   updates them together with `styles.css` (board `coordinator_decisions`). Report whether
   the new AGENTS wording would conflict with docs/04 after that planned update, or with
   docs/04 as it stands in a way the transition does not explain.
4. No other governance path changed in
   `5c8355df8d60fdeb85b551eb0e5a09e8f18a6334..<freeze>`; confirm with git.
5. Run `validate_orchestration.py`, `check_recovery.py` and `validate_package.py
   --preflight` (workflow Python) yourself.

## Runtime

- Git Bash only; never `cmd.exe` or an interactive shell. **NEVER FEED ANYTHING TO PYTHON
  OR NODE THROUGH STDIN (NO HEREDOCS, NO `node -e`, NO `| node`, NO `| python`). NEVER
  PIPE INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`. NEVER `rm
  -rf`.** Redirect to a file in `D:\.claude-tmp\timesheet\WP5-UX3-GOV-AUDIT` and read it
  with the Read tool. Never kill processes by PID. Create files only in that folder, the
  evidence folder and the review pair. Run the digest before any long probe.
- If a permission check denies a call, stop and report.

## Output

`handoff/delivery/GOV_UX3_REVIEW.md` and `.vi.md`, results in this file, evidence in
`handoff/delivery/evidence/WP5-UX3-GOV-AUDIT/` (masked LF `.txt`). Decision PASS / FIX
REQUIRED / NOT VERIFIED with findings. Return at most 200 words, beginning with your
self-reported model.

## Results
