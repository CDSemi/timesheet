# Workflow revision v2 handoff (governance package GOV)

Based on [HANDOFF](../templates/HANDOFF.md). Translation: [WORKFLOW_HANDOFF.vi.md](WORKFLOW_HANDOFF.vi.md).

- Package/scope, date and author: GOV, workflow revision v2 requested by the owner on
  2026-10-02. It covers adaptive model/effort routing, the committer role with
  commit/push to main until the first release, English-only task records, the governance
  scope and the privacy precommit gate. Coordinator: main session. Implementers and
  auditors are listed below.
- Actual model/effort: coordinator claude-opus-5-5, effort not observable. Implementers
  ran claude-sonnet-5-5, except WF-FIX2, which ran claude-opus-5-5 through an escalation
  override. Auditors ran claude-opus-5-5 with profile effort xhigh. All model values are
  self-reported.
- Commits (all pushed to origin/main):
  - ffbf8f0: earlier redesign;
  - fd77a87: freeze 1;
  - c219d79: freeze 2;
  - 6578df8: freeze 3, the reviewed commit.

  The source digest at 6578df8 is
  2f50be649666c785f9fd3db99f67c6d9115ad75b3dda089c36fbfb8d460af7b3. The WF-ACCEPT
  commit adds records only.
- Implementation status: done. Independent review status: **passed** (WF-AUDIT3, fresh
  auditor, PASS for `1a25275..6578df8`). Earlier rounds: [WORKFLOW_REVIEW](WORKFLOW_REVIEW.md)
  returned FIX REQUIRED with 3 Medium and 7 Low findings.
  [WORKFLOW_RECHECK](WORKFLOW_RECHECK.md) returned FIX REQUIRED with Low findings only.
  [WORKFLOW_RECHECK2](WORKFLOW_RECHECK2.md) returned PASS.
- Implemented behavior and changed files:
  - **Profiles:** nine profiles; the committer is new. Each profile sets the role and
    effort, and the coordinator chooses the model per dispatch with a recorded reason.
    Expert and auditor run opus/xhigh, the verifier sonnet/medium, and the coordinator
    inherits the session model.
  - **Validator** (`validate_orchestration.py`):
    - commit tasks and the GOV package;
    - override reasons, and no `max` effort;
    - audit strength must be at least the strongest author;
    - authors include every non-gate/audit/commit task, previous attempts included;
    - a gate's commit must match its audit's commit, and `addresses_audit` is checked.
  - **Recovery probes:** `check_recovery.py`, 81 probes.
  - **Precommit check** (`scripts/precommit-check.mjs`) blocks secrets, including
    unquoted and spaced values, unmarked media or signature files, private files, real
    user-profile paths, and non-synthetic emails. The attribution address is allowed.
  - **Docs and prompts:** AGENTS rules 1 and 12, docs/08 and docs/10, ORCHESTRATE,
    RESUME, FIX_FINDINGS and the templates, each with its .vi.md pair. NEXT_ACTION,
    STATE and the board were updated by the coordinator.
  - **Removed:** ORCHESTRATION.previous.json; git is now the recovery copy.
- Migrations/schema: none. src/, tests/ and lock files were unchanged in `1a25275..6578df8`
  (checked by the gates and audits).
- Changed canonical contracts:
  - AGENTS rule 1 (scope of the translation requirement) and rule 12 (standing
    commit/push authorization, confirmed directly by the owner);
  - the docs/08 routing, commit, governance and records sections.

  No business rule changed.
- Verification (final round; the evidence is in the folders named):

| Command | Environment | Exit | Observed result | Evidence |
|---|---|---|---|---|
| `npm run digest` before/after | Node 24.21.0 | 0/0 | 2f50be64…af7b3 both | [WF-GATE3](evidence/WF-GATE3/exits.txt) |
| `python handoff/delivery/validate_orchestration.py` | workflow Python | 0 | PASS | [WF-GATE3](evidence/WF-GATE3/validate-orch.txt) |
| `python handoff/delivery/check_recovery.py` | workflow Python | 0 | PASS, 81 probes | [WF-GATE3](evidence/WF-GATE3/check-recovery.txt) |
| `validate_package.py --preflight` | workflow Python | 0 | PASS, 91 scenarios | [WF-GATE3](evidence/WF-GATE3/preflight-workflow-python.txt) |
| `node scripts/precommit-check.mjs --self-test` plus scratch-clone probes | Node 24.21.0 | 0 | every bad form blocks; prose, attribution and synthetic media pass | [WF-GATE3](evidence/WF-GATE3/probes.txt) |
| `npm run verify` | Node 24.21.0 | 0 | 174 tests, build and smoke pass | [WF-GATE3](evidence/WF-GATE3/verify.txt) |
| Independent audit probes (31/31), lint, privacy range scans | Node 24.21.0, scratch clone | 0 | PASS | [WF-AUDIT3](evidence/WF-AUDIT3/10-identity-after.txt) |

- Unrun or blocked: system Python lacks IANA tzdata, so the preflight runs with the
  workflow Python. The WF-CAPS documentation URLs were not re-fetched by the auditors,
  who have no web tool.
- Findings resolved: WF-A-01 to WF-A-10, WF-R-01 and WF-R-02. Deferred by decision:
  rewriting user-profile paths already present in committed evidence (docs/10; no
  history rewrite).
- Optional backlog (no change required):
  - the precommit check misses a bare `pass` key and quoted compose list items;
  - six quoted test-password literals block a commit if those lines are edited;
  - the GOV PASS staleness rule cannot be enforced without git.
- Owner setup inputs: none. Permission settings are unchanged; the owner may
  pre-approve git commands or add deny rules.
- Production actions: none. Nothing was sent or deployed, and billing and global
  settings were not changed.
- Usage: not observable.
- One next action: WF-ACCEPT records commit and push, then WP1-F01-FIX under
  [FIX_FINDINGS](../prompts/FIX_FINDINGS.md).

## Orchestration provenance

- Mission/task IDs and board/checkpoint: timesheet-software-readiness; GOV tasks WF-REVIEW
  … WF-AUDIT3 and WF-ACCEPT in [ORCHESTRATION.json](ORCHESTRATION.json);
  [checkpoint](WORKFLOW_REVISION_CHECKPOINT.md).
- Implementers and auditors (separate fresh contexts):
  - Authors: WF-REVIEW, WF-IMPL-TOOLING, WF-IMPL-DOCS (2 attempts), WF-FIX1 and
    WF-FIX2.
  - Auditors: WF-AUDIT, WF-AUDIT2 and WF-AUDIT3, three distinct instances, none of them
    an author.
  - The board lists all agent IDs.
- Reviewed commit and digest: 6578df8 and 2f50be64…af7b3; decision PASS
  ([WORKFLOW_RECHECK2](WORKFLOW_RECHECK2.md)).
- Remaining:
  - WP1 is FIX REQUIRED, with F-01 unresolved. The chain is WP1-F01-FIX → FREEZE →
    GATE → AUDIT → ACCEPT.
  - WP2 starts only after a WP1 PASS.
- Software readiness: not reached. No owner pilot authorization is pending.
