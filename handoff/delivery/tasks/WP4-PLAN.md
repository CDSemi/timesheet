# WP4-PLAN dispatch brief

- Mission/task: timesheet-software-readiness / WP4-PLAN; package WP4; kind plan; attempt
  1; depends on WP3-ACCEPT (WP3 accepted). The coordinator gives the accept commit
  (the expected HEAD) and the accepted source and digest in the dispatch prompt. Record
  the HEAD and digest you observe.
- Profile/routing: timesheet-planner with model override opus, reason `size_risk`
  (package decomposition across deployment, recovery and import; docs/08 rubric).
  Effort stays at the profile's high. Routing: size L, risk H, novelty yes.
  - Record in English.
  - This is read-only planning: no source edits.
- Read AGENTS.md from disk first, including the UI standards section. Then read:
  - docs/08 (routing rubric, commit points, package-final gate) and docs/09 (WP4
    section);
  - handoff/prompts/WP4_IMPLEMENT.md and WP4_REVIEW.md, and the canonical documents they
    name (docs/03, docs/06 and docs/07 at least; others where a dependency needs them);
  - reference/inputs/README.md (the sanitized template workbook rule);
  - handoff/delivery/WP3_HANDOFF.md, including the acceptance record and WP4
    carry-forward;
  - the final WP3 rechecks (WP3_RECHECK_A2.md, WP3_RECHECK_BC2.md);
  - the WP3 carried risks in handoff/delivery/STATE.json (read-only).
- Inspect the current source tree, configuration, scripts, migrations and tests
  read-only. Look for existing patterns:
  - configuration and environment loading;
  - DATA_DIR and private storage;
  - migrations and integrity checks;
  - the job runner;
  - health endpoints, if any;
  - smoke scripts;
  - the e2e fixture;
  - any workbook or spreadsheet parsing.
- Check read-only whether Docker or Podman is available on this machine (version only).
  Never pull or build images in this task.

## Required output (append under Results)

A. **WP4 scope summary.** List the requirement, rule and acceptance IDs it must satisfy
   (from WP4_IMPLEMENT, docs/06 and docs/07).
B. **Ordered task list** of bounded slices; prefer S/M and use L only when unavoidable.
   For each task give:
   - ID (WP4-T01…) and title;
   - size, risk and novelty;
   - profile and model per the docs/08 rubric, with an override reason if any;
   - exact owned paths;
   - dependencies;
   - covered IDs;
   - required tests and checks;
   - the freeze-commit point.

   Keep a single writer at a time. Name each new runtime or build dependency with its
   current non-deprecated version and the reason it is needed. Name pinned base images
   by digest strategy, never `latest`.
C. **WP3 carry-forward.** Say which task addresses each item, or record an explicit
   deferral with its rationale:
   - the recorded "through a share" marker on audit rows. It is required before any
     non-shared route writes day or session rows for another person; an import that
     writes another person's rows counts;
   - risks R1–R7 from the WP3 rechecks;
   - the hint shows a count, not dates;
   - a HEAD request on the shared PDF writes a download audit;
   - the reminder-repeat, TLS-as-temporary and send-before-PDF items;
   - F-Q6 open;
   - ADV-A-05;
   - any other item in the WP3 acceptance record.
D. **Lessons from WP2/WP3, built into acceptance checks:**
   - E-8 CSS tokens only for any UI;
   - season-independent tests;
   - no employee-derived data in admin or job responses;
   - red-first regression tests and mutation checks for integrity rules;
   - synthetic screenshots `*-synthetic.png` on the installed Edge channel;
   - raw logs only under `D:\.claude-tmp\timesheet\<task>`, masked copies in evidence;
   - no deletion inside the repository;
   - no interactive shells;
   - verify and digest run last;
   - each freeze brief stages its own brief.
E. **Package-final gate.** Cover:
   - commands for the image/installation dry-run and the restore;
   - the workbook preview/commit gate (source-cell provenance, source hash, idempotency
     and conflicts, explicit opening balance, the tracked template workbook with
     synthetic dated sheets);
   - the upgrade/rollback runbook check;
   - NAS target verification when available. Otherwise mark it unverified and give
     concrete owner setup steps.

   Audit scope: fresh opus auditors, with area audits if one context is not enough.
   Then the accept commit.
F. **Owner decisions needed.** List contradictions or ambiguities in canonical documents
   that need an owner decision. Give the exact file:line, the decision needed and a
   recommended option. Do not resolve them silently. Also list anything that needs the
   owner's machine, NAS or credentials. Never request credentials.
G. **Risks**, the expected number of dispatches and the critical path. Give no token or
   time estimates.

- Writable: this file and handoff/delivery/evidence/WP4-PLAN/ (read-only command
  outputs, masked, LF, single final newline). Everything else is read-only. No commits.
- Call Node 24 by its full path if you run anything. Use
  `D:\.claude-tmp\timesheet\WP4-PLAN` for temporary output.
- Never open an interactive shell. Never write into the repository root. Never redirect
  to /dev/null or nul.
- If a permission check denies a call, stop and report.
- Return at most 400 words, beginning with your self-reported model: a summary of the
  task list, the owner decisions needed, and the critical path.

## Results

(Planner appends here.)
