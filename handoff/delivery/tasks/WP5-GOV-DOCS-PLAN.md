# WP5-GOV-DOCS-PLAN dispatch brief (plan the owner's documentation rule)

- **Task.** Mission timesheet-software-readiness, task WP5-GOV-DOCS-PLAN, package GOV, kind
  plan, attempt 1. Read-only: you change no repository file except this brief's Results
  and your evidence folder.
- **Owner decision (2026-10-29, verbatim on the board under `owner_decisions`):** "Sửa luật
  giúp tôi, tài liệu không cần test/gate/audit gì cả. chỉ cần duyệt và sửa để make sure
  chúng up to date, ko bị lệch nội dung là đc."
  - Translation: fix the rules. Documentation needs no test, gate or audit of any kind. It
    only needs a review and fixes, to make sure it is up to date and its content does not
    drift.
  - This is an explicit owner requirement that revises repository conventions (AGENTS.md
    Operating Contract). Plan how to apply it. Do not argue it away. Flag any material
    conflict.
- **Why it matters now.** Today a change to any file outside `handoff/`, documentation
  included, changes the source digest. The board rules then treat the last audit PASS as
  stale. So a one-line documentation fix after an acceptance costs a freeze, a gate and a
  fresh opus audit. That happened twice on 2026-10-29 (dc487c6 and a54061f; see
  WP5-UX5-RELNOTES to WP5-UX5-RECHECK-RN on the board).
- **Profile and routing.** timesheet-planner (high), requested sonnet, no override.
  - Routing: size M, risk M (governance and the validators), novelty no.
  - Task record in English.
- **AGENTS.md on disk wins.** Read it first.

## Read

- `AGENTS.md`, `CLAUDE.md` and their `.vi.md` files.
- `docs/08_AI_WORKFLOW_AND_BUDGET.md` (+ `.vi.md`), all of it. Note in particular:
  - "Audit strength";
  - "Durable state and recovery" ("Changed source identity invalidates an old audit pass");
  - the gate and audit flow;
  - the governance-path list;
  - "Commits and pushes".
- `handoff/prompts/ORCHESTRATE.md` (+ `.vi.md`), `RESUME.md`, `FIX_FINDINGS.md`, and the
  `WP5_REVIEW.md` and `WP5_IMPLEMENT.md` prompts, where they state gate or audit rules for
  documentation.
- `handoff/templates/` (TASK, REVIEW, HANDOFF, CHECKPOINT).
- `.claude/agents/*.md` (read only): any instruction there that would contradict the new
  rule.
- `docs/12_RELEASE_NOTES.md` line 7 (the release rule), `docs/06_TEST_AND_ACCEPTANCE.md` and
  `docs/09_IMPLEMENTATION_ROADMAP.md`, where they describe gates for documentation.
- The validators:
  - `handoff/delivery/validate_orchestration.py`;
  - `handoff/delivery/check_recovery.py` (106 probes);
  - `handoff/delivery/validate_package.py`.

  Find every rule that makes a documentation-only change require a gate or an audit. In
  particular, find the stale-PASS rule: `reviewed_digest == current_source_digest` or
  `superseded_by`.
- `scripts/source-digest.mjs`: what the digest covers.
- `docs/adr/`: the ADR form, in case the plan needs one.

## Plan (write it in your Results and evidence; change nothing else)

1. **What counts as documentation.**
   - Propose an exact path rule. The coordinator's starting proposal:
     - **Included:** every `*.md` file outside `src/`, `tests/`, `scripts/`, `.claude/`
       and `.agents/`, with its `.vi.md`. That covers `docs/`, README, DEVELOPMENT,
       AGENTS.md, CLAUDE.md, `reference/**/README*`, `assets/**/README*` and `handoff/`.
     - **Excluded,** because they configure behaviour:
       - `.claude/` agent profiles and settings;
       - skills under `.agents/` and `skills-lock.json`;
       - code, tests and scripts;
       - package files;
       - Dockerfile, compose and `.env.example`.
   - Confirm or correct this against the repository. Name any `.md` file that a test,
     build or script reads, because such a file is not "only documentation".
2. **The new process for documentation.**
   - It is one review-and-fix step, not a test, gate or audit. Propose:
     - who does it (a profile and model per docs/08, and whether the reviewer must be
       someone other than the author);
     - what it checks: currency against the code, the board and the records;
       cross-document consistency; EN/VI parity; links; no private data; and that no
       business rule changes without the matching code task;
     - what it records;
     - how it is committed (the committer, the same privacy checks).
   - Give the business-rule safeguard explicitly. A documentation change that would change
     product behaviour (docs/01 to 05, AGENTS rule 8) is not documentation-only. The code
     task that implements it keeps the gate and audit.
3. **Acceptance and release identity after a documentation-only commit.**
   - Design the smallest change that lets a documentation-only commit after an acceptance
     keep that acceptance, without a new gate or audit. Compare at least two options. For
     example:
     - **(a)** Keep `npm run digest` as it is. Record documentation-only successors on the
       board, and let the validators accept a PASS audit whose reviewed digest differs only
       by documentation. Verify that with `git diff --name-only` limited to the
       documentation rule.
     - **(b)** Change the digest to exclude documentation. This is a code change: it
       changes the meaning of every recorded digest.
   - Recommend one, with its validator changes and new `check_recovery` probes.
   - Say how the release is named: the accepted code commit and digest, plus the latest
     documentation-only commit. Draft the docs/12:7 wording.
   - Respect AGENTS.md "no concept without an ADR and a named consumer need". Say whether
     the change needs an ADR (the owner's decision is the consumer).
4. **Exact edits.** For each file, give:
   - the paragraph or line;
   - the current text;
   - the proposed English text, short, in the style of the file;
   - a note that the `.vi.md` gets the same meaning.

   Cover AGENTS.md (one short rule), docs/08, ORCHESTRATE, the prompts or templates that
   need it, docs/12:7, and anything in docs/06 or docs/09 that conflicts. Keep the change
   minimal.
5. **The validators.** Specify the code change, each new or changed probe, and how to run
   them. If option (a), say exactly how a validator decides that a path is documentation.
6. **How this change itself is reviewed and committed under the new rule.**
   - The documentation part is reviewed and fixed.
   - The validator part runs its own probes.
   - Say whether anything needs a gate, and why.
7. **Conflicts and risks,** each in one line, including anything in `.claude/agents/` or the
   session prompt that would still say "gate and audit every change".

## Runtime and limits

- Task folder `D:\.claude-tmp\timesheet\WP5-GOV-DOCS-PLAN`. Set TEMP and TMP to it.
- Read-only on the repository: no edits outside this brief's Results and
  `handoff/delivery/evidence/WP5-GOV-DOCS-PLAN/` (masked LF `.txt`). No commit or push. No
  git command that changes the index, the working tree or any configuration.
- Use Git Bash.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
    `head`, `tail` OR `cat`, NO `/dev/null` OR `nul`, NO `rm -r`, NO `sed -i`.**
  - You may run the validators read-only with the workflow Python
    (`$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`).
- Write `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Return

Return at most 250 words, beginning with "Self-reported model: ...". Include:
- the documentation rule;
- the recommended option and why;
- the files to change;
- the validator changes;
- whether an ADR is needed;
- the conflicts.

Put the full plan with the exact text in Results, or in
`evidence/WP5-GOV-DOCS-PLAN/plan.txt`, ending with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5 (planner, attempt 1). Full plan with exact text:
`handoff/delivery/evidence/WP5-GOV-DOCS-PLAN/plan.txt` (evidence beside it: baseline validator outputs and the
history path listing).

Observed (read-only): validate_orchestration exit 0 (559 tasks); check_recovery exit 0 (106 probes);
validate_package --preflight exit 0 (142 pairs, 2506 links). The only digest-bound rule is the stale-PASS check
(validate_orchestration.py:316-318). The only Markdown a test reads is assets/pdf-fonts/README.md.

Plan in short:
- Documentation = `*.md` (with `.vi.md`) outside src/, tests/, scripts/, assets/, .claude/, .agents/, handoff/.
  Correction to the coordinator proposal: add `assets/`.
- Process: a worker edits, a fresh worker reviews and fixes (currency against code/board/records, consistency,
  EN/VI, links, citations from src/tests comments, private data); no freeze, gate or audit. Safeguard: a change of
  a behaviour (docs 01-05, 07, AGENTS rule 8) or of a workflow rule is not documentation-only (its code task or GOV
  cycle keeps the gate and audit); wording/currency/link/translation fixes are.
- Identity: option (a), keep `npm run digest`, add the board record `documentation_since_acceptance`
  (base/head commit and digest, net paths, per-commit author/review task, rule_change none|audited); the stale-PASS
  check accepts base digest while current digest = head digest; new CLI `--documentation-range` and
  `--documentation-staged` prove the paths with git. Option (b) (digest excludes docs) rejected: it changes the
  meaning of every recorded digest.
- Release = accepted commit + digest; release commit (image tag) = latest documentation-only commit or the
  accepted commit.
- Files: AGENTS(.vi) rule 14; docs/08(.vi) table row, line 56, line 64, new "Documentation" section, commit points;
  ORCHESTRATE(.vi) item 4; RESUME(.vi) item 4; TASK(.vi) and HANDOFF(.vi) templates; docs/12(.vi):7; docs/10(.vi)
  decision entry; validate_orchestration.py and check_recovery.py (17 new probes, 106 to 123). docs/06, docs/09,
  `.claude/agents/`, validate_package.py unchanged.
- ADR: not needed (workflow decisions live in docs/08 and docs/10; consumer is the owner decision).
- Tasks: A validator+probes, B rule text, C freeze, D gate, E fresh opus GOV audit, F accept; then G docs/12+docs/10,
  H fresh review-and-fix, I documentation commit (no gate or audit). Only the validator and rule text keep one GOV gate
  and audit.
- Conflicts: governance Markdown vs "no audit of any kind" (owner to confirm); stale injected AGENTS in running
  sessions; rule_change is an attestation; code comments cite document headings.

Status: done
