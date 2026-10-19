# WP5-UX3-GOV2-AUDIT dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-GOV2-AUDIT; package GOV; kind audit;
  attempt 1; depends on WP5-UX3-GOV2-GATE (PASS required). Fresh context.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size S,
  risk M, novelty no.
- Records:
  - task record in English;
  - review pair `handoff/delivery/GOV_UX3_REVIEW2.md` and `.vi.md`, from the REVIEW
    template in `handoff/templates/`.
- Author separation: you did not write WP5-UX3-GOV2 or any other WP5-UX3 task (agent IDs
  are on the board). Treat the worker's and the verifier's reports as claims.
- Target: `reviewed_commit` = ceb86b6b18bd0e8fabd93f47672cd87f3899b92f, the governance
  freeze. Its digest is b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48
  (833 files). The base is a78ada5edbf5339d4502df57e9f195d11c0b5d28.
  - Record HEAD, the digest before and after, and `reviewed_commit`.
  - A GOV PASS is identified by its reviewed commit (docs/08 "Governance scope").
- The WP5 regate WP5-UX3-REGATE2 runs in parallel on the same commit with other ports and
  folders. Do not run e2e suites. Your checks are text and validator checks.

## Read

- docs/08 "Governance scope" and "Gates and independent audit".
- The owner's words on the board:
  - `owner_decisions` 2026-10-19 and `answered_owner_question_ux3_q7`, verbatim: "(a) và
    sửa cho khớp quy ước .vi.md (xóa các cụm từ ko liên quan như “shop-floor”, “step
    type”, “probe kind”, “manifest key”...";
  - the question text in the same record.
- `handoff/delivery/tasks/WP5-UX3-GOV2.md` (Results) and `WP5-UX3-GOV2-GATE.md` (Results),
  with their evidence.
- `git diff a78ada5..ceb86b6 -- AGENTS.md AGENTS.vi.md`.

## Scope

1. **Owner fidelity.**
   - The owner's added sections are adopted.
   - The runbook line follows the `.vi.md` convention.
   - The phrases the owner named, and others of the same kind, are removed.
   - Nothing else of the owner's text is changed. Judge each worker decision in the
     candidate list: the removal of "CI run" and "CI evidence" (the repository has no
     CI), and every phrase that was kept. Is any kept phrase still foreign to this
     project? Is any removal more than the owner asked for?
2. **Consistency.** The new "Operating Contract" and "Prime Directive" must not contradict:
   - items 1-13;
   - docs/08 (roles, commits only by timesheet-committer, gates and audits, the
     coordinator writing only state);
   - CLAUDE.md;
   - the prompts in `handoff/prompts/`.

   Points to check include:
   - "Communicate in the requester's language" against item 1 ("Discuss progress (chat)
     in Vietnamese");
   - "Use English for … commit messages" against the commit-message skill;
   - "this file takes precedence unless the owner explicitly overrides it";
   - "State a concise plan before large … changes" and "Ask only when a missing decision
     blocks" against the coordinator's autonomy in docs/08;
   - "add a concept or dependency without an ADR" against the missing `docs/adr/` (the
     governance backlog notes GLOSSARY.md is missing too).

   A real contradiction is a finding. Wording that could mislead an agent is a risk.
3. **Translation.** AGENTS.vi.md renders every added sentence faithfully, with the same
   headings, levels, code tokens and paths. Items 1-13 and the UI section are unchanged
   from a78ada5.
4. **Scope and format.**
   - Only the AGENTS pair changed outside `handoff/` in a78ada5..ceb86b6.
   - No other governance path changed.
   - LF line endings, no BOM, a final newline, no trailing whitespace.
5. **Mandatory checks yourself:**
   - `validate_package.py --preflight` (workflow Python; write `<user>` in the evidence);
   - `handoff/delivery/validate_orchestration.py`;
   - `check_recovery.py` (106 probes);
   - `git diff --check a78ada5..ceb86b6`;
   - the digest, before and after.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX3-GOV2-AUDIT`.
- Use Git Bash only.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN (NO HEREDOCS, NOT EVEN EMPTY
  ONES; NO `node -e`, `python -c`, `| node`, `| python`). NEVER PIPE INTO `head` OR `tail`.
  NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul`. NEVER `rm -r`.**
  - Write scripts as files in the task folder and run them by path.
  - Read outputs with the Read tool.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- The workflow Python is
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- Create files only in the task folder, the evidence folder
  `handoff/delivery/evidence/WP5-UX3-GOV2-AUDIT/` (LF `.txt` only) and the review pair.
- Never edit AGENTS files, docs, source, the board or STATE.
- If a permission check denies a call, stop and report.

## Output

- The review pair.
- Results in this file.
- Evidence in the folder above.
- A decision of PASS / FIX REQUIRED / NOT VERIFIED, with numbered findings (severity,
  file:line, reproduction, expected) and optional risks.
- Return at most 200 words, beginning with your self-reported model.

## Results

Self-reported model: claude-opus-5-5 (agent a425d954ed94e4526; fresh context; authored no WP5-UX3 change; board maximum is claude-opus-5-5, so audit strength holds).

Decision: PASS. Review: handoff/delivery/GOV_UX3_REVIEW2.md and .vi.md. Evidence: handoff/delivery/evidence/WP5-UX3-GOV2-AUDIT/ (LF .txt, masked).

Identity: reviewed_commit ceb86b6b18bd0e8fabd93f47672cd87f3899b92f = HEAD = origin/main before and after. Digest b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48 (833 files) before and after, from source-digest.mjs and the ls-tree form (digest-before.txt, digest-after.txt). Status outside handoff/ is empty.

Owner fidelity:
- Rebuilt the owner's pre-edit text from the worker's captured diff. Proof: blob e8af2a26, and with it the a78ada5 tree reproduces the recorded digest 54cb9a3d (owner-text.txt).
- Diff owner -> ceb86b6: exactly the runbook line, "shop-floor aware", "CI run", "CI evidence" -> "recorded evidence", and the list -> "a concept or dependency".
- Verdicts:
  - Runbook line, shop-floor, step type, probe kind and manifest key: correct.
  - task mode (0 hits): correct.
  - template variable: exists here (docs/04 line 100), but so does the owner-named manifest key (backup allowlist), so removing the whole list follows the owner (R1).
  - CI removal: accepted. There is no CI in the repository; DEVELOPMENT.md:54 is only a precaution.
  - Kept phrases: correct. production accuracy is borderline (R2).

Consistency: no contradiction with items 1-13, docs/08, CLAUDE.md, the prompts, the profiles, the commit-message skill (SKILL.md:186) or domain.md. Risks R3-R5 (wording).

Translation: faithful. 9 headings with equal levels, the same tokens and list lengths. Lines 48-84 are byte-equal to a78ada5 apart from the heading level. Polish in R8.

Checks:
- Text checks: 35/35.
- git diff --check: exit 0.
- Only the AGENTS pair changed outside handoff/; no other governance path changed.
- validate_package --preflight: PASS (114 pairs, 2258 links).
- validate_orchestration: PASS (419 tasks).
- check_recovery: PASS (106).
- e2e and verify not run, per the brief.

Findings: none. Risks R1-R9 are in the review.

Status: done
