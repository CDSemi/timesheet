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

Checkpoint 1 (timesheet-auditor, self-reported claude-opus-5-5, attempt 1, 2026-10-05 UTC):
- HEAD before 3bdffbec685599b02c41c0a1f85931c8d90242f2 = origin/main = GOV-SKILL-GATE freeze_commit;
  working tree clean outside handoff/. Digest before aab8b32c...705d (724 files) by `npm run digest`
  script and by `git ls-tree` on 3bdffbe; parent c31c300c (evidence before.txt, scope.txt).
- Validators with the workflow Python 3.12.14: validate_orchestration 0, check_recovery 0,
  validate_package --preflight 0. Precommit over the three skill files in a scratch repo: 0 findings.
- Provisional findings: GOV-SKILL-01 (Medium, SKILL.md:267 damaged write path), GOV-SKILL-02 (Low,
  markdown.md:142 damaged GitHub rule), GOV-SKILL-03 (Medium, provenance/licence unrecorded),
  GOV-SKILL-04 (Low, obsolete `align` attribute pattern). Remaining: review pair, after-checks.

Final result (timesheet-auditor `ab1a8fbe43413d745`, self-reported claude-opus-5-5, attempt 1):
- Verdict: **FIX REQUIRED**. Review: handoff/delivery/GOV_SKILL_REVIEW.md and .vi.md. Evidence (masked,
  LF, .txt): handoff/delivery/evidence/GOV-SKILL-AUDIT/ (before, scope, analysis, provenance,
  precommit-skill, validate-orchestration, check-recovery, preflight, after).
- reviewed_commit 3bdffbec685599b02c41c0a1f85931c8d90242f2; HEAD before and after the same (= origin/main);
  source digest aab8b32cd69a8ba598dc91929290ec198107664e5bc42fb2616c7eb6da0a705d (724 files) before and
  after, by the digest script and by `git ls-tree`. Governance and source paths equal 3bdffbe after
  (`git diff --quiet` exit 0).
- Scope 1 (conflicts): markdown.md:33-51 obsolete `<div align="center">` vs AGENTS.md rule 11
  (GOV-SKILL-04). SKILL.md:262-263 "updated or reported as stale" is a tension with AGENTS.md rule 1,
  resolved by precedence (note N1). No conflict with task-record language, privacy, public repository,
  commit/push, vendor-neutral roles or UI standards.
- Scope 2 (unsafe): SKILL.md:267 "write `../../../README.md` in the target directory" names a path three
  levels above the target (D:/README.md for the repository root) (GOV-SKILL-01). No remote fetch or
  execution (SKILL.md:80 asks first), no credential request, no permission/settings change (no
  allowed-tools/hooks), no gate bypass, no instruction to ignore project rules.
- Scope 3 (provenance): no source or licence named. Sibling project lock records readme-md from
  LisaHQ/lisa-skills; this repository's skills-lock.json has no entry, against README.md:35. Licence NOT
  VERIFIED (no network) (GOV-SKILL-03). markdown.md:142 damaged `docs/` token (GOV-SKILL-02).
- Scope 4 (fit): coexists with README.md / README.vi.md only under AGENTS.md rule 1; recommend a one-line
  AGENTS.md "Agent skills" mention (optional governance note N1; not edited).
- Scope 5 (validators, workflow Python 3.12.14): validate_orchestration 0, check_recovery 0,
  validate_package --preflight 0, before and after the review files (preflight after: 70 pairs, 1563
  links). Precommit over the three skill files: PASS, 0 findings.
- Owner questions: Q1 restore SKILL.md:267 to `README.md`; Q2 restore markdown.md:142 to `docs/`; Q3 source
  and licence, then record it (skills-lock.json entry or a source/licence line) or correct README.md:35 and
  its .vi pair; Q4 drop the centered-div pattern or record an exception.
- Output hygiene: five evidence logs carried CR from the Windows tools and were normalized to LF; then
  the precommit check over the 12 audit output files (review pair, this brief, nine evidence logs),
  staged in a scratch repository, reported PASS with 0 findings, and `git diff --cached --check` exited 0.
  Final recheck: HEAD 3bdffbe, digest aab8b32c...705d (724 files), nothing changed outside handoff/.
- No process left running. Temporary files only under D:\.claude-tmp\timesheet\GOV-SKILL-AUDIT (raw
  logs, the lockhash.mjs and board.mjs probes, two scratch repositories); nothing was deleted, because the
  scratch repositories would need recursive removal.
