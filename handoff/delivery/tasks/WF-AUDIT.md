# WF-AUDIT dispatch brief

- Mission/task: timesheet-software-readiness / WF-AUDIT; board package WP1 (workflow
  revision v2); kind audit; depends on WF-GATE (PASS required); fresh context.
- Profile/routing: timesheet-auditor, requested opus/xhigh (profile), no override.
  Routing: size M, risk H, novelty no. Task record in English; the review document is
  human-facing and bilingual.
- Author separation: you are not WF-REVIEW, WF-IMPL-TOOLING, WF-IMPL-DOCS or the
  coordinator. Treat their reports as claims to verify, not as evidence.
- Target: the freeze commit on the board (`WF-FREEZE.commit_sha`), already pushed to
  origin/main. Record HEAD and `npm run digest` before and after; both must equal the
  WF-GATE values. Coordinator files under handoff/ may change during your audit; any
  change outside handoff/ invalidates the audit.
- Scope: cumulative workflow change `1a25275b7c87bcef1e9099d7adba8f2eb763d698..<freeze>`:
  the ffbf8f0 orchestration redesign (never independently audited) plus revision v2:
  AGENTS/CLAUDE/README, docs 06/08/09/10 and pairs, prompts, templates, NEXT_ACTION,
  STATE, board, nine profiles, settings.json, validators, check_recovery.py,
  scripts/precommit-check.mjs, package.json. Application source is out of scope.
- Requirements: board `owner_decisions` and `coordinator_decisions`, AGENTS rules 1–13,
  WF-CAPS facts in board `auxiliary_lookups`.

## Checklist

1. Commit authority: only timesheet-committer commits/pushes; prohibitions (amend,
   force, --no-verify, reset, rebase, clean, stash, tag, history rewrite, add -A,
   commit -a) consistent across AGENTS rule 12, doc 08, ORCHESTRATE, RESUME and the
   committer profile; post-release branch policy; permission settings unchanged.
2. Routing: doc 08 table, profile frontmatter and validator constants agree; fable,
   best and opusplan excluded; effort only through profiles; override recording works;
   an audit weaker than its author is rejected.
3. Coordinator still has no shell and writes shared state only as documented; nested
   delegation stays prohibited.
4. Run validate_orchestration.py and check_recovery.py; craft at least three extra
   negative probes yourself on synthetic boards in a scratch location (for example
   override without reason, commit beside another running task, weaker audit) and
   confirm rejection.
5. precommit-check.mjs: review the rules, run `--self-test`, and run your own negative
   probe in a scratch clone (per-process safe.directory override; delete afterwards);
   confirm no deprecated APIs (`npm run lint` with Node 24).
6. English/Vietnamese equivalence: full check for AGENTS, doc 08, ORCHESTRATE,
   NEXT_ACTION; sample every other changed pair.
7. No secrets or personal data in the diff; no business-rule change; STATE keeps WP1
   FIX REQUIRED; the WP1-F01 chain still requires fix, freeze commit and fresh audit on
   the new digest.
8. Practicality: contradictions, unenforceable rules, or token waste in the new
   workflow, as findings with severity.

## Output

handoff/delivery/WORKFLOW_REVIEW.md and WORKFLOW_REVIEW.vi.md (REVIEW template),
results in this file, evidence in handoff/delivery/evidence/WF-AUDIT/. Decision PASS /
FIX REQUIRED / NOT VERIFIED with findings (ID, severity, file:line, required change).
Do not fix anything. Return at most 300 words: decision, findings, HEAD/digest
before/after, self-reported model.

## Results

(Auditor appends here.)
