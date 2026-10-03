# Mission checkpoint (WP2 implementation)

Based on [CHECKPOINT](../templates/CHECKPOINT.md). Updated 2026-10-03 UTC (2026-10-02
America/Los_Angeles).

- Active package and role: WP2 (implementation); coordinator. Actual model
  claude-opus-5-5 (owner choice; profile inherit); effort not observable. Session
  44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: branch main.
  - HEAD = origin/main = a0f06f5a3c9c6639bcd1ec79519d9bfc139bf8a6, the WP2-T07 freeze.
  - Source digest 705d78fd06b9f0db85edb8f3545821cfa5481b745b3c6bd43ebf62994bf954c5
    (author-reported).
  - Uncommitted: WP2-T08 (source digest
    95b5291b0a893312bab01791265739d2e094ffe8b61b0bab5cc423781de0b061, author-reported),
    the T07-FREEZE evidence, the CALFIX brief, the board and this checkpoint.
    WP2-T08-FREEZE commits them.
  - No unpushed commits.
- Completed scope:
  - Governance:
    - Revision v2 accepted (WF-AUDIT3 PASS, `1a25275..6578df8`;
      [handoff](WORKFLOW_HANDOFF.md)).
    - GOV-E8 accepted (GOV-E8-AUDIT PASS on ed92cb7; [review](GOV_E8_REVIEW.md)).
  - WP1 accepted (recheck PASS at 68bbb31 / c6e24381; accept commit f32978f).
  - Owner decisions E-2, E-3 and E-8 adopted ("dùng đề xuất"); decision commit 393779d.
  - WP2 freezes so far:
    - T01: 396b399.
    - T02: 8930efe.
    - T03: 67c7e7a; concurrency proven.
    - T04: e92add0, together with `.gitattributes` evidence -whitespace.
  - Advisory ledger check:
    - WP2-ADV-GATE PASS on e92add0 (clean export; concurrency x5).
    - WP2-ADV-REVIEW (fresh opus): FINDINGS ADV-A-01..04 Low and ADV-A-05 Info
      ([report](WP2_ADV_LEDGER_REVIEW.md)).
    - WP2-ADVFIX fixed ADV-A-01..04 (author-reported; verify 344 tests).
  - WP2-T05 (day-entry workspace) done: migration 0003; author-reported verify 387 tests.
- Last verification: the WP2-T05 worker ran both commands on Node v24.21.0; both are
  author-reported, not independent.
  - `npm run verify`: exit 0, 387 tests.
  - `npm run digest`: exit 0.
- WP2-T06 (personal policy preview) is done: author-reported verify 414 tests. Frozen in
  1970536 by the committer, with no classifier denial.
- WP2-T07 (user administration) is done: author-reported verify 448 tests and 5 mutations
  caught. Frozen in a0f06f5 by the committer.
- WP2-T08 (calendar administration) is done: author-reported verify 514 tests and 11
  mutations caught. WP2-T08-FREEZE (committer) is in progress.
  - Finding: WP2-T07's admin `calendar_id` change regroups the user's draft period,
    orphans existing timesheets and hides finalized state.
  - WP2-CALFIX refuses the change while the user has data. This is a coordinator decision,
    reversible by the owner; a prospective reassignment is an owner option for later.
- WP2-T05-FREEZE is done (two owner commits, e768b71 and a8a5890). Freeze history:
  - Attempt 1 is blocked. The auto-mode permission classifier denied the staging/check
    command as "Credential Leakage". Nothing executed and nothing was committed.
  - WP2-T05-PRIVSCAN (read-only) found the set clean: no real credential or personal data
    and no precommit-blocking line.
  - The owner confirmed directly on 2026-10-03 (board `owner_decisions`). Attempt 2 quoted
    that confirmation verbatim, but the classifier denied the standalone `git add` again
    ("Credential Leakage"). No commit was made.
  - WF-CAPS2 (read-only documentation lookup) is done; its result is in the board
    `auxiliary_lookups`.
    - A user message that names the action and its specific danger can clear one
      classifier block.
    - The classifier reads `autoMode` only from user or managed settings, not from
      project settings.
  - The owner committed and pushed manually ("tôi đã commit xong, tiếp tục đi").
    WP2-T05-RECON found that the commit, e768b71c2a5e522bdfece8617599992f8f4a0abc
    (parent e92add0), holds only the 23 modified tracked paths.
    - Its message is the coordinator's chat Commit description.
    - Every new file is still untracked: migration 0003, dayEntries.ts, the new tests,
      the advisory review, briefs and evidence.
    - main therefore references files that are not in git.
    - The digest matches T05, and the validator and check_recovery exit 0.
  - The owner's completion commit a8a5890 added the new files. WP2-T05-RECON2 verified
    the following:
    - the two commits together equal the expected set;
    - the HEAD tree has the new source and test files;
    - nothing is left over;
    - the digest matches;
    - the validator and check_recovery exit 0.
- Remaining:
  - WP2-CALFIX, then WP2-T09..T13, each with its freeze ([plan](tasks/WP2-PLAN.md)).
  - The package-final gate: clean export, WP1→WP2 upgrade, 20 concurrency runs and the
    browser flows.
  - Two fresh opus audits:
    - AUDIT-A: ledger and privacy, focused on the changes since the advisory review.
    - AUDIT-B: workspace, admin, UI and integration.
  - WP2 acceptance.
  - Then WP3, WP4 and WP5 (WP5 starts with independent acceptance), and a concrete pilot
    packet. The real pilot stays owner-controlled.
- Blocker: none. Risk: the classifier may deny the committer's `git add` again in later
  freezes. The coordinator changes no permission settings and does not route around
  a denial. The options are an owner approval message naming the action and its danger, a
  manual commit, or `autoMode` user settings configured by the owner. Freezes may be
  batched to reduce interruptions.
- Carry-forward notes:
  - WP3 must handle the `CorrectionResult` 'pending' variant and persist pending debits.
  - Provisional OT is computed only for days with sessions (T04/T05), and WP3
    finalization must drop the provisional figures.
  - WP2-T06 added a function-level import cycle between policies.ts and timesheets.ts.
    AUDIT-B should judge it.
  - WP2-T07 calendar reassignment: confirmed defective by WP2-T08 and fixed by
    WP2-CALFIX. AUDIT-B rechecks it.
  - WP2-T08 design notes for AUDIT-B:
    - commit refusals precede the hash comparison, so a retried identical request after
      the boundary moves gets `retroactive_change`;
    - a calendar without a version is refused.
  - The governance backlog stays batched for one later GOV cycle: R1 (check_recovery
    inherits the live status; fix before software_ready), R2 (AGENTS.vi item 2),
    precommit limits and ADV-A-05.
- Unchanged constraints:
  - Synthetic data and dry-run mail only. No real sending or deployment, and no changes to
    billing, global settings or permission settings.
  - Commits go only through timesheet-committer, on main until the first release. No
    amend, force-push or tags.
- Next action: record the WP2-T08-FREEZE result, then dispatch WP2-CALFIX (brief ready).
  - The committer runs the normal procedure once.
  - If the classifier denies it, the coordinator stops and asks the owner for an
    approval message that names the action and its danger, or for a manual commit. The
    chat Commit description then equals the intended message and stresses new files.
- Matching prompt: handoff/prompts/ORCHESTRATE.md (WP2 per WP2_IMPLEMENT.md).

## Orchestration recovery

- Board: [ORCHESTRATION.json](ORCHESTRATION.json). The last committed board is the
  recovery copy.
- Running: WP2-T08-FREEZE (committer). WP2-CALFIX is pending on it.
- Live processes: none known besides the committer. The earlier workers and committers
  reported none left.
- Last digest: 809215583… (author-reported). No WP2 package audit has run yet.
- Usage/reset: not observable.
