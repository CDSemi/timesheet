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

### Attempt 1 progress checkpoint (auditor, claude-opus-5-5)

- Identity before: HEAD fd77a8717da9a1b2ea9ce13520d59b9df60f4716 = origin/main; digest
  03d4a6f986c93423903ea94ded9f58a7ca127c64dc6bcca1342f38a8b24f491b (Node 24.21.0, 532 files);
  no change outside handoff/; src/tests unchanged in 1a25275..fd77a87.
- Done: read the cumulative diff; validator exit 0; check_recovery exit 0 (48); 19 own probes as
  expected; 11 profile-tampering probes in a scratch clone; precommit self-test exit 0 plus 18
  staged-set probes; npm ci + lint exit 0 (Node 24, trace/pending deprecation); preflight exit 0;
  owner verbatim verified against the session transcript (metadata only).
- Evidence so far: handoff/delivery/evidence/WF-AUDIT/0..9.
- Remaining: review documents, digest after, scratch clone deletion, final result.

### Attempt 1 result (auditor, claude-opus-5-5)

- Decision: **FIX REQUIRED** (3 Medium, 7 Low). Report: handoff/delivery/WORKFLOW_REVIEW.md
  and .vi.md (preflight exit 0, 43 pairs, 528 links).
- Identity: HEAD fd77a8717da9a1b2ea9ce13520d59b9df60f4716 = origin/main before and after; digest
  03d4a6f986c93423903ea94ded9f58a7ca127c64dc6bcca1342f38a8b24f491b before and after (Node
  24.21.0); no change outside handoff/; scratch clone (outside Dropbox, per-process
  safe.directory) deleted.
- Checks (all executed by the auditor): validate_orchestration 0; check_recovery 0 (48);
  2-probes.py 0 (19 as expected); profile-tampering probes (max effort wrongly accepted);
  precommit self-test 0 plus 18 staged probes (3 gaps); npm ci 0, lint 0 with trace/pending
  deprecation and no warnings; preflight 0; diff --check 0; src/tests/locks unchanged; range
  privacy scan 0 blocking / 16 profile-path warnings.
- Findings:
  - WF-A-01 M: audit-strength fallback contradicts "never below the author"
    (docs/08:26,30,34; timesheet-auditor.md:25; validate_orchestration.py:139).
  - WF-A-02 M: workflow tasks under WP1 become "Stale PASS" after the F-01 digest change; the
    archive plan is undocumented and breaks WP1-F01-FIX.depends_on
    (validate_orchestration.py:15,246-247,257-258).
  - WF-A-03 M: precommit misses unquoted YAML secrets, evidence-directory PDFs/signatures and
    /c/Users paths (precommit-check.mjs:17-18,10+43,22).
  - WF-A-04 L: EFFORTS allows max (validate_orchestration.py:19).
  - WF-A-05 L: auditor-is-author detection ignores documentation/plan authors
    (validate_orchestration.py:136-138,240-243).
  - WF-A-06 L: RESUME asks the shell-less coordinator to inspect git/processes (RESUME.md:6,9).
  - WF-A-07 L: subagents may hold a stale AGENTS.md ("unless already in your context", profile
    line 9; observed).
  - WF-A-08 L: committer runtime not pinned to Node 24 (WF-FREEZE ran Node 26).
  - WF-A-09 L: Windows account name in committed evidence (8 real of 12 freeze warnings; 3b
    undetected).
  - WF-A-10 L: F-01 chain: gate_included vs "package-final", .vi.md task records, no freeze task.
- Known items: classifier denial handled correctly; owner verbatim verified as a direct owner
  message (3-owner-confirmation.txt).
- Evidence: handoff/delivery/evidence/WF-AUDIT/0..10.
- Status: done. Next action: coordinator registers a bounded workflow-fix task for
  WF-A-01..09, re-plans F-01 (WF-A-10), then freeze commit, gate and a fresh recheck audit on
  the new digest.
