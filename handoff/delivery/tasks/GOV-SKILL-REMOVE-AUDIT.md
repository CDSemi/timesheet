# GOV-SKILL-REMOVE-AUDIT dispatch brief

- Mission/task: timesheet-software-readiness / GOV-SKILL-REMOVE-AUDIT; package GOV; kind
  audit; attempt 1; depends on GOV-SKILL-REMOVE-GATE (PASS).
- What it audits: a fresh, independent audit of the governance change that removes
  `.claude/skills/readme-md/`.
  - The owner chose option B on 2026-10-05, which reverses H-Q3 (a). The choice is
    recorded verbatim in the board's `owner_decisions`.
  - The change answers the FIX REQUIRED audit GOV-SKILL-AUDIT; see
    [GOV_SKILL_REVIEW](../GOV_SKILL_REVIEW.md).
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size S,
  risk L, novelty no.
- Fresh context: you authored nothing in this change.
  - The worker of GOV-SKILL-REMOVE deleted the files.
  - The committer of GOV-SKILL-REMOVE-FREEZE committed them.
  - The verifier of GOV-SKILL-REMOVE-GATE ran the gate.
  - The coordinator wrote the briefs.
- Records: write the task record in English. GOV_SKILL_REMOVE_REVIEW.md and its .vi.md
  are bilingual and use the REVIEW form in handoff/templates/.
- Target: `reviewed_commit` = a92335184e7dc09b2114ec30a46979ecd02ab92a, the gate's
  `freeze_commit`. Record HEAD and the source digest before and after; the gate's digest
  of record is in its results.
- Read AGENTS.md from disk first. Then read:
  - docs/08: governance scope, roles, and commit rules;
  - the GOV-SKILL-AUDIT review;
  - the GOV-SKILL-REMOVE, GOV-SKILL-REMOVE-FREEZE and GOV-SKILL-REMOVE-GATE results.
- Read-only for everything except your outputs.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, or any interactive shell.
  - Call Node 24 by its full portable path.
  - Use `D:\.claude-tmp\timesheet\GOV-SKILL-REMOVE-AUDIT` for TEMP/TMP and raw output.
  - Delete only files you created; never remove folders recursively.
  - Never kill processes by PID. Never write into the repository root. Never redirect
    to /dev/null or nul.
  - If a permission check denies a call, stop and report.
  - Write records with the Edit or Write tools, not shell heredocs.

## Scope

1. **Exactness.** At the target, the change outside handoff/ is exactly the removal of
   the three skill files. Nothing else outside handoff/ changed. No folder or file of
   the skill remains in the tree.
2. **Residual references.** Nothing in the repository outside handoff/ still depends on
   or names the skill:
   - AGENTS.md and CLAUDE.md;
   - docs/ and the README pair;
   - `skills-lock.json`;
   - `.agents/` and `.claude/` (settings, profiles, other skills);
   - the prompts under handoff/prompts.

   Historical records under handoff/delivery stay as they are and are not findings.
3. **Findings closed.** Each of GOV-SKILL-01..04 and N1 is resolved by the removal, or
   still applies elsewhere. For example, check whether README.md:35 and .vi.md:35 are
   still accurate about the skills pinned in `skills-lock.json`. Report only what you
   can prove.
4. **Authority and process.**
   - The removal follows the owner's verbatim decision.
   - Only timesheet-committer committed.
   - The commit is on main and pushed, with no amend, force-push or tag.
   - The gate evidence is real: rerun the cheap claims (HEAD, diff scope, ls-tree,
     `git grep`, digest by the ls-tree form).
5. **Validators.** `validate_orchestration.py`, `check_recovery.py` and
   `validate_package.py --preflight` on the live board, using the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

A full `npm run verify` is not required: no source or test changed, and the gate ran it
on a clean export. Say so in the review.

## Output

- `handoff/delivery/GOV_SKILL_REMOVE_REVIEW.md` and `.vi.md` (REVIEW form; English is
  authoritative).
- Masked, LF `.txt` evidence in `handoff/delivery/evidence/GOV-SKILL-REMOVE-AUDIT/`.
- Results appended to this brief.
- Decision: exactly one of PASS, FIX REQUIRED or NOT VERIFIED, with findings listed
  separately.

Return at most 120 words, beginning with your self-reported model.

## Results

(Auditor appends here.)

Self-reported model: claude-opus-5-5. Reviewer agent `adbb762323c56bffb` (board record);
effort requested xhigh, actual not observable. The author model is claude-sonnet-5-5, and the
strongest GOV author model is claude-opus-5-5, so the reviewer is not weaker. Fresh context;
the reviewer authored nothing in the reviewed snapshot.

Decision: **PASS**. Findings: none. Notes R1–R5 are separate from the decision.

- Target: reviewed_commit a92335184e7dc09b2114ec30a46979ecd02ab92a (= gate freeze_commit =
  origin/main = remote main by `git ls-remote`); parent e5576de.
  - HEAD a923351 before and after.
  - Source digest fcd8fe1e859ca34b63c6b82e2d4f593c8bfd422a2d8b04f24d056f82bb6b194c (750
    files) before and after, by both `node scripts/source-digest.mjs` (Node 24.21.0, full
    path) and the ls-tree form. The parent's digest is 65247d70… (753 files).
- 1 Exactness: outside handoff/, exactly three `D` entries (the readme-md SKILL.md,
  references/markdown.md and references/outlines.md; 605 deletions).
  - `git ls-tree` of the skill folder at the freeze is empty, and the working tree has no
    such folder.
  - The deleted blobs (3f457942, 56f5eed2, 64de9ad8) are the ones GOV-SKILL-AUDIT
    reviewed.
  - It is the only governance-path change since 3bdffbe; `git diff --check` exits 0.
- 2 Residual references: none.
  - `git grep readme-md` (and `readme[-_ ]?md`) at the freeze, outside handoff/ and in
    handoff/prompts and handoff/templates: exit 1. The working-tree grep finds no match,
    and no file is ignored under .claude/ or .agents/.
  - Historical records under handoff/delivery are not findings.
- 3 Findings closed: GOV-SKILL-01, -02 and -04 are gone with the files.
  - GOV-SKILL-03 is resolved for the tree. README.md:35 and .vi.md:35 are now accurate:
    the 48 lock entries cover all 48 `.claude/skills` and 47 `.agents/skills` folders.
  - N1–N5 are moot; N6 was information only.
- 4 Authority and process: option B (verbatim `B`, 2026-10-05) is on the live board and was
  already in the committed board at e5576de.
  - The board records the timesheet-committer task GOV-SKILL-REMOVE-FREEZE
    (a4ef369bc593bda1a) as the commit task, and the worker left the deletions unstaged.
  - Reflog: one plain `commit:`, then `update by push` as a fast-forward. There is no
    amend and no tag, local or remote.
  - The freeze's precommit check was reproduced on the exact 13-path set in a scratch
    clone: PASS, 0 findings, 0 warnings. `diff --cached --check` exits 0, and the commit's
    added handoff lines contain no personal data.
  - The gate's cheap claims all reproduce.
- 5 Validators (workflow Python 3.12.14, C:\Users\<user>\...), before and after:
  - validate_orchestration PASS (9 profiles, 196 tasks), exit 0;
  - check_recovery PASS (count 82), exit 0;
  - preflight PASS, exit 0: 70 pairs and 1575 links before; 71 pairs and 1624 links after.
  - The first after-run of the preflight exited 1 with "Broken link … after.txt", because
    after.txt was written after that run. The rerun with the file present passed.
- `npm ci` and `npm run verify` were not rerun: they are not required, and no source or test
  changed. The gate ran them on a clean export: 70 files, 1589 tests, 0 deprecation lines.
- Notes:
  - R1: the skill blobs stay in the public history (3bdffbe..e5576de), and their licence
    is NOT VERIFIED. Removing them would need a history rewrite, which docs/08 forbids;
    only the owner could decide that.
  - R2: the freeze committer saved no check logs (already recorded on the board); this
    audit reproduced the checks.
  - R3: the live board's `current_source_digest` is still aab8b32c…. Update it to
    fcd8fe1e… before recording WP4 audit PASSes.
  - R4: `source-digest.mjs` exits 1 while a deleted file is still in the index; stage
    first.
  - R5: the gate's `npm ci` reports one high-severity advisory (pre-existing; out of
    scope).
- During the after-run, a coordinator brief `handoff/delivery/tasks/WP4-T07B.md` appeared,
  untracked. It is not on the board, and nothing outside handoff/ changed.
- Outputs:
  - handoff/delivery/GOV_SKILL_REMOVE_REVIEW.md and .vi.md;
  - evidence in handoff/delivery/evidence/GOV-SKILL-REMOVE-AUDIT/ (before, scope,
    references, process, validate-orchestration, check-recovery, preflight, after; masked,
    LF).
  - Raw output and a scratch clone stay in D:\.claude-tmp\timesheet\GOV-SKILL-REMOVE-AUDIT.
  - No source, governance or shared-state file was modified, and no process was left
    running.
- Next action: the coordinator records the PASS (reviewed_digest fcd8fe1e…), updates
  `current_source_digest`, dispatches the accept commit, then resumes WP4.
