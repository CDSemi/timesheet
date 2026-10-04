# WP3-PLAN dispatch brief

- Mission/task: timesheet-software-readiness / WP3-PLAN; package WP3; kind plan; attempt 1;
  depends on WP2-ACCEPT (WP2 accepted; source 5fafeaee72509c6110a907458643bf7582dad81a,
  digest e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df).
- Profile/routing: timesheet-planner with model override opus, reason `size_risk`
  (package decomposition, docs/08 rubric); effort stays the profile's high. Routing:
  size L, risk H, novelty yes. Record in English; read-only planning, no source edits.
- Read AGENTS.md from disk first, including the UI standards section. Then read:
  - docs/08 (routing rubric, commit points, package-final gate) and docs/09 (WP3 section);
  - handoff/prompts/WP3_IMPLEMENT.md and WP3_REVIEW.md, and the canonical documents they
    name (02–06; 01 and 07 only where a dependency needs them);
  - handoff/delivery/WP2_HANDOFF.md (including the acceptance record and carry-forward),
    WP2_RECHECK_A4.md and WP2_RECHECK_B4.md;
  - the WP2 carried risks in handoff/delivery/STATE.json (read-only).
  Inspect the current source tree, migrations and tests read-only to find existing
  patterns (ledger, corrections, outbox or job tables if any, audit, privacy guards,
  zone handling, client tokens, e2e fixture).

## Required output (append under Results)

A. WP3 scope summary with the requirement, rule and acceptance IDs it must satisfy
   (at least AC-06–AC-10 and AC-14 and the WP3_IMPLEMENT gate items).
B. Ordered task list of bounded slices (prefer S/M; L only when unavoidable). For each
   task give:
   - ID (WP3-T01…) and title;
   - size, risk and novelty;
   - profile and model per the docs/08 rubric, with an override reason if any;
   - exact owned paths;
   - dependencies;
   - covered IDs;
   - required tests and checks, and the freeze-commit point.

   Keep a single writer at a time. Mark which tasks can run their planning or read-only
   analysis in parallel. Name any new runtime dependency (for example pdf-lib), its
   current non-deprecated version and why it is needed.
C. WP2 carry-forward: say which task addresses each item, or record an explicit deferral
   with its rationale:
   - R4: handle and persist the `CorrectionResult`/`DeficitDebitResult` pending variant;
     drop provisional minutes at finalization;
   - R1: revision-specific correction keys (the duplicate check ignores `sourceRef`);
   - R2: a policy note with a leading space before '=' is exported raw;
   - A3-01: the payroll_exception audit record keeps `refreshed_pay_period`;
   - A4-01: the smoke exits without a FAIL line on a port conflict;
   - ADV-A-05 and the B4 optional items (optional);
   - the owner option of prospective calendar reassignment (owner decision; do not plan
     it as work unless a canonical text requires it).
D. Lessons from the WP2 audit rounds, built into each task's acceptance checks so that
   they do not recur:
   - every new UI value is a CSS custom property per the AGENTS UI standards (no raw
     lengths, colours, weights, durations or shadow parts);
   - e2e and unit tests are season-independent (no hard-coded DST offsets; use the
     existing zone oracle or equivalent);
   - admin and job responses carry no employee-derived counts or data beyond the
     canonical privacy boundary;
   - red-first regression tests and mutation checks for integrity rules;
   - synthetic screenshots `*-synthetic.png` at 1280×800 and 390×844 on the installed
     Edge channel; no browser download.
E. Package-final gate: commands, the WP3_IMPLEMENT gate items (deadline/manual race,
   auto-image on/off, interrupted and uncertain send, duplicate jobs, private downloads,
   visual PDF evidence including both Sundays), dry-run/capture mail only, and the
   synthetic data setup. Audit scope: fresh opus auditors with area audits if one context
   is not enough. Accept commit.
F. Contradictions or ambiguities in canonical documents that need an owner decision.
   Flag them and do not resolve them silently. Give the exact file:line and the decision
   needed, with a recommended option.
G. Risks, the expected number of dispatches, and the critical path. Give no token or
   time estimates.

- Writable: this file and handoff/delivery/evidence/WP3-PLAN/ (read-only command outputs,
  masked, LF, single final newline). Everything else read-only. No commits.
- Call Node 24 by its full path if you run anything. Never write into the repository
  root. On Windows, never redirect to /dev/null or nul from a POSIX shell.
- Return at most 400 words, beginning with your self-reported model: task list summary,
  owner decisions needed, critical path.

## Results

(Planner appends here.)
