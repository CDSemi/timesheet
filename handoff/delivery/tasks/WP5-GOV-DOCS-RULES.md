# WP5-GOV-DOCS-RULES dispatch brief (the documentation rule in the working documents)

- **Task.** Mission timesheet-software-readiness, task WP5-GOV-DOCS-RULES, package GOV, kind
  documentation, attempt 1. It depends on WP5-GOV-DOCS-VALIDATOR.
- **Authority.** The owner's decisions, verbatim under `owner_decisions` on the board:
  - 2026-10-29: "Sửa luật giúp tôi, tài liệu không cần test/gate/audit gì cả. chỉ cần duyệt và
    sửa để make sure chúng up to date, ko bị lệch nội dung là đc."
  - 2026-11-02: "Q1 (a), Q2 (a)".

  These are the owner's own instructions to change AGENTS.md and document 08. If a
  permission check still denies an edit, stop and report the reason exactly.
- **Profile and routing.** timesheet-worker (medium), requested sonnet, no override. Routing:
  size S, risk L, novelty no. Task record in English.
- **AGENTS.md on disk wins.** Read it first.

## Addendum 1 (owner decision 2026-11-02; it wins over the rest of this brief and the plan)

The owner's third decision, verbatim on the board: "sửa validator, profile agent, skill hay
script (cấu hình), cũng ko cần đi qua vòng gate và audit." So the rule covers two groups:

- **Documentation:** a Markdown file, with its `.vi.md`, outside `src/`, `tests/`, `scripts/`,
  `assets/`, `.claude/` and `.agents/`.
- **Workflow tooling:** the validators (`handoff/delivery/validate_*.py`,
  `handoff/delivery/check_recovery.py`), `scripts/`, agent profiles (`.claude/agents/`), skills
  (`.claude/skills/`, `.agents/`) and `skills-lock.json`. A tool also runs its own checks: the
  validators' probes, the tests that use a script (for example
  `tests/integration/ghcr-cleanup.test.ts`), or the script itself.

**Names.** Use the names WP5-GOV-DOCS-VALIDATOR left in the code: `is_non_product`,
`non_product_since_acceptance`, `--non-product-range` and `--non-product-staged`. They replace
the `documentation` names everywhere in this brief and the plan.

**Text changes:**

- **E1, AGENTS.md rule 14 (VI with the same meaning), in place of the text below:**

  > 14. Documentation and workflow tooling need no gate or audit (owner decisions 2026-10-29
  > and 2026-11-02); rules 2, 5 and 13 do not apply to them. Documentation is a Markdown
  > file, with its `.vi.md`, outside `src/`, `tests/`, `scripts/`, `assets/`, `.claude/` and
  > `.agents/`; the working rules in this file and document 08 are documentation too.
  > Workflow tooling is the board validators, `scripts/`, `.claude/agents/`, `.claude/skills/`,
  > `.agents/` and `skills-lock.json`. Each change gets one review-and-fix by a fresh
  > instance against the code, the board and the other documents, with EN/VI aligned and no
  > private data, and a tool also runs its own checks (document 08, "Documentation and
  > workflow tooling"). A change that alters product behaviour ships with its code task,
  > which keeps the gate and audit.

- **E2:** the table row reads "Routine slice; documentation or tooling edit; review-and-fix by
  a fresh instance".
- **E3:** "…except a change recorded under "Documentation and workflow tooling"."
- **E4, docs/08:64:** replace "Any change to them requires a GOV freeze commit, gate and fresh
  audit." with "Changes to them follow "Documentation and workflow tooling", with no gate or
  audit, except `.claude/settings.json`, which keeps a GOV freeze commit, gate and fresh
  audit." Keep the rest of the paragraph.
- **E5:** the section title is "## Documentation and workflow tooling" (VI "## Tài liệu và công
  cụ quy trình"), and it gets:
  - **What counts:** the two groups above, and that `.claude/settings.json` is not included
    because the owner did not name it. The path rule is `is_non_product` in
    `validate_orchestration.py`. The validators sit in `handoff/`, outside the digest, so
    they need no path rule.
  - **Review and fix:** a fresh instance reviews and fixes; a tool also runs its own checks.
  - **Behaviour:** as in the changes below. Add that a tool change must not change the built
    application; `scripts/` never enters the image (the `.dockerignore` allow-list).
  - The other bullets, with the new names.
- **E7, E8, E9, E10:** the new names and the new section title. E9 covers "Documentation or
  tooling tasks".
- **E11, docs/12:7:** "…or a later commit that changes only documentation or workflow tooling
  (document 08, "Documentation and workflow tooling"). Such commits need a review and fixes,
  not a gate or audit, and keep the acceptance…". Keep the rest as below.
- **E12, docs/10:** quote all three verbatim sentences. Say that `.claude/settings.json` was not
  named and stays a governance path.
- **Pilot packet and WP5 handoff:** "commits that change only documentation or workflow
  tooling".

## Read

`handoff/delivery/evidence/WP5-GOV-DOCS-PLAN/plan.txt`, sections 1 to 4. Apply edits E1 to E12
with the changes below. Each `.vi.md` gets the same meaning. Where this brief and the plan
differ, this brief wins. Read `handoff/delivery/validate_orchestration.py` so that the text
matches the code as WP5-GOV-DOCS-VALIDATOR left it.

## Changes to the plan

The owner chose Q1 (a): working rules in Markdown are documentation too. So:

- **Remove everywhere:** clause (ii) of the safeguard ("a workflow rule change keeps the GOV
  freeze, gate and audit"), every use of `rule_change`, and the words "head_commit" and
  "per commit" from the record description.
- **E1, AGENTS.md rule 14 (VI with the same meaning):**

  > 14. Documentation needs no test, gate or audit (owner decisions 2026-10-29 and 2026-11-02);
  > rules 2, 5 and 13 do not apply to it. Documentation is a Markdown file, with its
  > `.vi.md`, outside `src/`, `tests/`, `scripts/`, `assets/`, `.claude/` and `.agents/`; the
  > working rules in this file and document 08 are documentation too. It gets one
  > review-and-fix by a fresh instance against the code, the board and the other documents,
  > with EN/VI aligned and no private data (document 08, "Documentation"). A text change
  > that alters product behaviour ships with its code task, which keeps the gate and audit.

- **E4:** "Any change to them requires a GOV freeze commit, gate and fresh audit, except
  Markdown files, which follow "Documentation". Validators, profiles, skills and scripts
  never qualify."
- **E5, the section "Documentation":** as the plan, with these bullets changed:
  - **Review and fix:** end at "…no private data. It records the facts checked and the drifts
    fixed in its task Results. There is no freeze commit, verifier gate or auditor."
  - **Replace "Rules are not documentation" with "Behaviour":** "A change that adds, removes
    or alters a behaviour a correct implementation must satisfy (documents 01 to 05 and 07,
    AGENTS rule 8) ships with its code task, which keeps the gate and audit; if in doubt,
    treat it so. Working rules in Markdown (AGENTS, CLAUDE, document 08, prompts, templates)
    are documentation."
  - **Commit and acceptance:** the coordinator writes `documentation_since_acceptance` on
    the board before the commit: `base_commit` and `base_digest` of the accepted audit,
    `head_digest` of the tree being committed, net `paths`, and `reviews` with `author_task`
    and `review_task`. The committer runs `--documentation-staged` before and
    `--documentation-range <accepted>..HEAD` after the commit.
  - **Release:** as the plan. The latest documentation-only commit is found with `git log`,
    and `--documentation-range` proves it.
- **E9:** drop `rule_change` from the TASK template bullet.
- **E11, docs/12:7:** the plan's draft, with one addition: name DEVELOPMENT in "These notes,
  the README status and DEVELOPMENT were then refreshed…" (this closes R-UX5RN2-1). Keep
  "each gated and audited again (before the rule of 2026-10-29)".
- **E12, docs/10:** the dated entry quotes both verbatim sentences, and says that this change
  to the validators had the probes and a review, by the owner's Q2 (a).

## Added edits

- **`handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`, section 0.** One short paragraph after
  the release identity table:
  - The accepted source stays `a54061f` / `690fd8fd…`.
  - Later commits that change only documentation (owner rule of 2026-10-29) keep that
    acceptance and leave the application files identical.
  - Prove it with `python handoff/delivery/validate_orchestration.py --documentation-range
    a54061f..<commit>`.
- **`handoff/delivery/WP5_HANDOFF.md` and `.vi.md`.** The same fact, in one short item at the
  end of the section "Re-acceptance after UI change rounds 4 and 5 (WP5-UX4, WP5-UX5)".
- **Count of `check_recovery` probes.** If the plan's edits or any changed file state the
  count, use the new count from the VALIDATOR Results.

## Hard limits

- Change only:
  - `AGENTS.md`, `AGENTS.vi.md`;
  - `docs/08_AI_WORKFLOW_AND_BUDGET.md`, `docs/10_DECISIONS_AND_SOURCES.md`,
    `docs/12_RELEASE_NOTES.md`, each with its `.vi.md`;
  - `handoff/prompts/ORCHESTRATE.md`, `handoff/prompts/RESUME.md`, each with its `.vi.md`;
  - `handoff/templates/TASK.md`, `handoff/templates/HANDOFF.md`, each with its `.vi.md`;
  - `handoff/delivery/WP5_PILOT_PACKET.md`, `handoff/delivery/WP5_HANDOFF.md`, each with its
    `.vi.md`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-GOV-DOCS-RULES/` (masked LF `.txt`).
- Do not change the board, STATE, NEXT_ACTION, the checkpoint, the validators, `CLAUDE.md`,
  `.claude/` or any file outside this list. Do not commit or push. Run no git command that
  changes the index, the working tree or any configuration.
- No business rule changes. Write no digest of the current tree into a document outside
  `handoff/`.
- Use Git Bash.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
    `head`, `tail` OR `cat`, NO `/dev/null` OR `nul`, NO `rm -r`, NO `sed -i`.**
  - Use the Write, Edit, Read, Glob and Grep tools.
- Task folder: `D:\.claude-tmp\timesheet\WP5-GOV-DOCS-RULES`. Set TEMP and TMP to it. Put
  Node 24 first on PATH before any node or npm call.
- Write `<user>` for profile paths.

## Checks

1. `validate_package.py --preflight` with the workflow Python
   (`$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`):
   exit 0.
2. `validate_orchestration.py --non-product-staged` is not usable yet, because nothing is
   staged. Instead list `git status --porcelain` outside `handoff/`: only `AGENTS.md`,
   `AGENTS.vi.md` and the docs/08, docs/10 and docs/12 pairs may appear.
3. `npm run digest`: record the digest and the file count (expected 882).
4. EN/VI parity of every pair you changed.

## Return

Return at most 120 words, beginning with "Self-reported model: ...". Include:
- the files changed;
- the preflight exit code;
- the paths outside `handoff/`;
- the digest and the file count;
- the parity result.

Append the same to Results, ending with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5.

- Files changed: AGENTS.md, AGENTS.vi.md (rule 14); docs/08, docs/10, docs/12 and their .vi.md; handoff/prompts/ORCHESTRATE and RESUME; handoff/templates/TASK and HANDOFF; handoff/delivery/WP5_PILOT_PACKET and WP5_HANDOFF (each with .vi.md); evidence `handoff/delivery/evidence/WP5-GOV-DOCS-RULES/checks.txt`.
- Preflight exit 0 (142 pairs, 2512 links).
- Paths outside handoff/: only AGENTS, docs/08, docs/10, docs/12 pairs.
- Digest 4ac52e6b1296fa5753d00d12e5ba0868a06b1f0081d6ce25dbb563eeb44fe6e4, 882 files.
- EN/VI parity: aligned, same items in each pair. No `rule_change`, `documentation_since_acceptance` or `--documentation-` names remain.
- Slip: one `| head -1` pipe when locating the Node 24 folder. Probe count not stated anywhere.

Status: done
