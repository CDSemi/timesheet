# GOV-SKILL-AUDIT dispatch brief

- Mission/task: timesheet-software-readiness / GOV-SKILL-AUDIT; package GOV; kind audit;
  attempt 1; depends on GOV-SKILL-GATE (PASS). This is a fresh, independent audit of the
  owner's skill `.claude/skills/readme-md/`, added under owner decision H-Q3 (a).
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size S,
  risk M, novelty no.
  - Fresh context: you authored nothing in this change. The owner supplied the skill;
    the coordinator wrote this brief.
  - Write the task record in English. GOV_SKILL_REVIEW.md and its .vi.md are bilingual
    and use the REVIEW form in handoff/templates/.
- Target: `reviewed_commit` = the GOV-SKILL-GATE `freeze_commit`. The coordinator gives
  the SHA in the dispatch prompt. Record HEAD and the source digest before and after.
- Read AGENTS.md from disk first, including the rules on language, privacy, deprecated
  APIs, commits and the "Agent skills" section. Then read:
  - docs/08 (governance scope, roles, commit rules);
  - the three skill files at the target;
  - the GOV-SKILL-GATE evidence;
  - the existing skills and `.claude/settings.json` (read-only), to check for conflicts.
- Read-only for everything except your outputs.
- Runtime:
  - Use Node 24 by full path.
  - Use `D:\.claude-tmp\timesheet\GOV-SKILL-AUDIT` for TEMP/TMP and raw output.
  - Delete only files you created; never remove folders recursively.
  - Never open an interactive shell, and never kill processes by PID.
  - Never write into the repository root, and never redirect to /dev/null or nul.
  - If a permission check denies a call, stop and report.

## Scope

1. **Conflicts with project rules.** Find any instruction in the skill that conflicts
   with AGENTS.md or docs/08:
   - English authoritative with matching `.vi.md` translations, and Vietnamese chat;
   - task records in English only;
   - the privacy rules: no personal timesheet data, secrets or signature images;
   - the public repository;
   - no deprecated APIs;
   - commit and push only through timesheet-committer;
   - the vendor-neutral roles;
   - the UI standards, if the skill touches them.

   Quote file:line for each conflict.
2. **Unsafe behaviour.** Find any instruction that would:
   - fetch or execute remote content;
   - request credentials;
   - widen permissions or change settings;
   - write outside the task's owned paths;
   - bypass gates or audits;
   - tell an agent to ignore project rules.
3. **Provenance and licensing.** Check whether the content names its source or license.
   If it appears to be copied from a third party without a compatible license or
   attribution, raise a finding.
4. **Fit.** Check whether the skill's README guidance can coexist with the bilingual
   README.md / README.vi.md pair, and with the preflight translation rule. Decide whether
   AGENTS.md "Agent skills" should mention it. If so, record that as an optional
   governance note. Do not edit AGENTS.md.
5. **Validators.** Run `validate_orchestration.py`, `check_recovery.py` and the
   preflight with the workflow Python. Each must exit 0.

## Output

- handoff/delivery/GOV_SKILL_REVIEW.md and .vi.md.
- Your results in this file.
- Masked, LF evidence in handoff/delivery/evidence/GOV-SKILL-AUDIT/, with `.txt` files
  only. Link only to files.
- Verdict: PASS, FIX REQUIRED or NOT VERIFIED.
- For each finding give an ID (GOV-SKILL-nn), a severity, file:line and the required
  change. Because the skill is the owner's content, a required change is put to the
  owner as a question. Separate optional improvements from findings.

Return at most 150 words, beginning with your self-reported model.

## Results

(Auditor appends here.)
