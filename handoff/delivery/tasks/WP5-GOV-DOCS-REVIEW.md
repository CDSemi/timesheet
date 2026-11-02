# WP5-GOV-DOCS-REVIEW dispatch brief (review and fix of the documentation rule change)

- **Task.** Mission timesheet-software-readiness, task WP5-GOV-DOCS-REVIEW, package GOV, kind
  documentation, attempt 1. It depends on WP5-GOV-DOCS-RULES.
- **Why.** The owner's three decisions of 2026-10-29 and 2026-11-02 (`owner_decisions` on the
  board):
  - documentation gets a review and fixes, not a test, gate or audit;
  - working rules in Markdown count as documentation;
  - validators, agent profiles, skills and scripts need no gate or audit either; a tool also
    runs its own checks.

  **Names:** the code uses `is_non_product`, `non_product_since_acceptance`,
  `--non-product-range` and `--non-product-staged`. They replace any `documentation` name
  below.
- **Profile and routing.** timesheet-worker (medium), requested sonnet, no override. Routing:
  size S, risk M, novelty no. You wrote none of the change. Task record in English.
- **AGENTS.md on disk wins.** Read it first.

## Review

1. **The rule reads as the owner decided.**
   - Read rule 14 in `AGENTS.md`, the "Documentation and workflow tooling" section of docs/08
     and the entry in docs/10. Check them against the three verbatim decisions:
     - documentation needs no test, gate or audit;
     - working rules in Markdown count as documentation;
     - validators, profiles, skills and scripts need no gate or audit, and a tool runs its
       own checks;
     - behaviour changes keep their code task's gate and audit;
     - only `.claude/settings.json` keeps the governance cycle.
   - No remaining sentence in the changed files contradicts this. Search for `rule_change`,
     `head_commit`, `documentation_since_acceptance`, `--documentation-` and "keeps the GOV".
2. **Consistency across the working documents.** AGENTS rules 2, 5, 12 and 13, docs/08 (table
   row, lines on source identity and governance, commit points), ORCHESTRATE, RESUME, the
   TASK and HANDOFF templates, docs/12:7, the pilot packet section 0 and the WP5 handoff must
   agree with each other and with the code.
3. **The text matches the validator.**
   - Check every field name, flag and path list in the text against
     `handoff/delivery/validate_orchestration.py`.
   - Read the validator diff (`git diff -- handoff/delivery/validate_orchestration.py
     handoff/delivery/check_recovery.py`) as a reader, not an auditor. Report anything that
     looks wrong. Do not edit the validators.
4. **Run the validator checks yourself** with the workflow Python, and record each exit code:
   - `validate_orchestration.py`;
   - `check_recovery.py`, with the count from the VALIDATOR Results;
   - `validate_package.py --preflight`;
   - `--non-product-range dc487c6..a54061f` (PASS, 6 paths);
   - `--non-product-range d96df5d..0b45781` (FAIL, code paths listed).
5. **EN/VI, links and private data.**
   - The same meaning in every changed pair.
   - Every link resolves.
   - If a heading or ID changed, `src/` and `tests/` comments that cite it still hold.
   - No private data.

**Fix** every documentation drift you find, with the smallest edit, in the files
WP5-GOV-DOCS-RULES changed. Record each fix (file, line, before, after, why) in the evidence.
If a fix would need a validator change, or a file outside that list, do not make it; report
it.

## Hard limits

- Change only the documentation files named in the "Hard limits" of
  `handoff/delivery/tasks/WP5-GOV-DOCS-RULES.md`, this brief's Results and
  `handoff/delivery/evidence/WP5-GOV-DOCS-REVIEW/` (masked LF `.txt`).
- Do not change the board, STATE, NEXT_ACTION, the checkpoint or the validators. Do not
  commit or push. Run no git command that changes the index, the working tree or any
  configuration.
- Use Git Bash.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
    `head`, `tail` OR `cat`, NO `/dev/null` OR `nul`, NO `rm -r`, NO `sed -i`.**
  - Use the Write, Edit, Read, Glob and Grep tools.
- Task folder: `D:\.claude-tmp\timesheet\WP5-GOV-DOCS-REVIEW`. Set TEMP and TMP to it. Put
  Node 24 first on PATH before any node or npm call.
- Write `<user>` for profile paths.
- If a permission check denies a call, stop and report the reason exactly.

## Final record

After your last fix, run and record:
- `npm run digest`: the final digest and the file count;
- `git diff --name-only a54061f -- . ':!handoff'`: the net paths. The coordinator copies both
  into the board record.

## Return

Return at most 150 words, beginning with "Self-reported model: ...". Include:
- each drift fixed;
- anything reported but not fixed;
- each validator check with its exit code;
- the parity result;
- the final digest in full;
- the net paths.

Append the same to Results, ending with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5.

- Drifts fixed: none. Rule 14, docs/08, docs/10, docs/12, ORCHESTRATE, RESUME, templates, packet and handoff agree with each other and with `validate_orchestration.py`. No stale names remain outside historical records. No `src/` or `tests/` comment cites a changed heading.
- Reported, not fixed: none. The validator diff read as correct.
- Checks (exit): validate_orchestration 0; check_recovery 0 (140 probes); validate_package --preflight 0 (2512 links); `--non-product-range dc487c6..a54061f` 0 (PASS, 6 paths); `--non-product-range d96df5d..0b45781` 1 (FAIL, lists src/client/DayEditor.tsx and tests/e2e/day-editor.spec.ts).
- Parity: aligned in every pair. No private data.
- Digest: 4ac52e6b1296fa5753d00d12e5ba0868a06b1f0081d6ce25dbb563eeb44fe6e4 (882 files).
- Net paths: AGENTS.md, AGENTS.vi.md, docs/08, docs/10, docs/12 (each with .vi.md).
- Evidence: `handoff/delivery/evidence/WP5-GOV-DOCS-REVIEW/`.
- Follow-up (synthetic() fix): drops only `non_product_since_acceptance`; new regression probe added, no probe weakened. validate_orchestration exit 0; check_recovery exit 0 (141 probes) on the real board (v6.txt). No document states 140. Digest 4ac52e6b1296fa5753d00d12e5ba0868a06b1f0081d6ce25dbb563eeb44fe6e4 unchanged. Slip: one empty heredoc `cat >>` (no content written).

Status: done
