# Mission checkpoint (WP2 implementation)

Based on [CHECKPOINT](../templates/CHECKPOINT.md). Updated 2026-10-03 UTC (2026-10-02
America/Los_Angeles).

- Active package and role: WP2 (implementation); coordinator. Actual model
  claude-opus-5-5 (owner choice; profile inherit); effort not observable. Session
  44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: branch main.
  - HEAD = origin/main = 8fae685949adb525ec137e5972202f58b408ac24, the WP2-T13
    package-final freeze.
  - Source digest 8ebce5fe790870e0d52015fde658cfef0ee60929d6dcdafd80f563725f8524a2
    (author-reported; the gate records the digest of record).
  - Uncommitted (handoff only): the board, this checkpoint, the gate brief target line and
    the T13-FREEZE evidence.
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
  mutations caught. Frozen in 869bc8e by the committer.
  - Finding: WP2-T07's admin `calendar_id` change regroups the user's draft period,
    orphans existing timesheets and hides finalized state.
  - WP2-CALFIX refuses the change while the user has data. This is a coordinator decision,
    reversible by the owner; a prospective reassignment is an owner option for later.
  - WP2-CALFIX is done: the guard passed (no canonical text requires the change),
    author-reported verify 524 tests and 4 of 6 mutations killed. The two survivors are
    masked by foreign keys.
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
  - WP2-CALFIX, then WP2-T09A, T09B and T10..T13, each with its freeze
    ([plan](tasks/WP2-PLAN.md)). T09 is split per WP2-T09-PREP (coordinator decision).
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
- WP2-T09A is done: author-reported verify 524 tests and test:e2e 7 passed, 1 skipped
  (a mobile-only test on desktop), on installed Edge 153. Four synthetic screenshots were
  taken.
- WP2-T09A frozen in 717db3e: screenshots synthetic, and the lockfile adds only
  Playwright packages.
- WP2-T09B is done: author-reported verify 541 tests and test:e2e 15 passed, 1 skipped.
  Future days currently show "missing record"; the display follow-up is in T10.
- WP2-T09B frozen in 9c36a7e: six screenshots, all synthetic.
- WP2-T10 (day editor) is done: author-reported verify 571 tests and test:e2e 42 passed,
  2 skipped (run twice), including a Sydney DST fold and a Los Angeles gap.
  - Note for AUDIT-B: the client shows expected finish and break suggestions through the
    shared domain functions, for display only.
- WP2-T10 frozen in 26fa7c9: 54 paths; six screenshots viewed, all synthetic.
- WP2-T11 (OT, history and evidence UI) is done: author-reported verify 582 tests and
  test:e2e 50 passed, 2 skipped. Credits for the e2e are seeded by test-only code.
- WP2-T11-FREEZE attempt 1 is blocked.
  - The classifier ("Credential Leakage") denied a call that staged the set and printed
    the CSV sample and the test-only credit-seeding diff. Nothing ran.
  - The owner's direction is requested: an approval message naming the action and its
    danger, or a manual commit with `git add -A`.
  - The WP2-T13 brief is written and is now part of the set.
  - The owner committed and pushed the set from the IDE on 2026-10-04. The two IDE
    font-family warnings were false positives (`var(--font-mono)` ends in `monospace`);
    T12 adds an explicit fallback.
  - WP2-T11-RECON verified 55d3bb8:
    - its parent is 26fa7c9 (not an amend);
    - it is pushed;
    - its 35 paths match the expected set exactly;
    - the privacy scan is clean;
    - the digest matches.
- WP2-T12 (settings and admin UI) is done: author-reported verify 599 tests and
  test:e2e 66 passed, 2 skipped. Isolation e2e: other users' IDs give 404, admin routes
  give employees 403, and admin screens show no employee data.
- WP2-T12 frozen in da0ffc4 by the committer, with no classifier denial under the
  no-print hygiene.
- WP2-T13 (seed, smoke, docs, WP2 HANDOFF) is done. In a clean export: verify 599 tests
  and smoke 28, test:e2e 66 passed and 2 skipped, preflight 0.
- WP2-T13 was frozen in 8fae685 (the package-final freeze): 28 paths, all checks 0,
  preflight 0.
- WP2-GATE PASS on 8fae685 (digest of record
  8ebce5fe790870e0d52015fde658cfef0ee60929d6dcdafd80f563725f8524a2).
  - npm ci, verify with deprecation tracing, 599 tests with every LG/DF fixture,
    concurrency x20, fresh and WP1-upgrade migrations, e2e with 66 passed and all 12 flows
    mapped, and validators: all passed.
  - Minor F1: the insufficient-balance flow has no screenshot. The coordinator accepts it;
    AUDIT-B captures one.
- The B: temp drive had 12 MB free. WP2-TMPCLEAN (light) removes only this project's
  leftover e2e temp directories before the audits.
- WP2-TMPCLEAN is done. B: has about 548 MB free; the 12 MB reading was transient. Only
  the project's e2e leftovers (about 13 MB) were removed.
- Next action:
  1. Record the WP2-AUDIT-A and WP2-AUDIT-B results.
  2. If both PASS on 8fae685, run WP2-ACCEPT: the reviews, evidence, HANDOFF acceptance
     record, STATE and NEXT_ACTION.
  3. If either is FIX REQUIRED, create bounded fix tasks (`addresses_audit`), then freeze,
     gate and recheck.
  - WP2-T09-PREP is done. It found the following:
    - Playwright 1.63.0 can run on the installed Edge (channel msedge), with no browser
      download;
    - E-8 tokens, including a fix for a dark-mode contrast defect;
    - a T09 split.
  - The committer runs the normal procedure once.
  - If the classifier denies it, the coordinator stops and asks the owner for an
    approval message that names the action and its danger, or for a manual commit. The
    chat Commit description then equals the intended message and stresses new files.
- Matching prompt: handoff/prompts/ORCHESTRATE.md (WP2 per WP2_IMPLEMENT.md).

## Orchestration recovery

- Board: [ORCHESTRATION.json](ORCHESTRATION.json). The last committed board is the
  recovery copy.
- WP2-AUDIT-B (fresh opus) is FIX REQUIRED on 8fae685 / 8ebce5fe.
  - WP2-B-01 Medium: the manual-entry input zone defaults to the reporting zone instead of
    the display zone that R-07 requires.
  - WP2-B-02 Low: literal CSS values instead of custom properties.
  - Everything else in area B passed, and gate F1 needs no code change.
  - The fix brief WP2-FIXB is ready. It is dispatched after WP2-AUDIT-A, because no
    source writer may run beside an audit.
- WP2-AUDIT-A (fresh opus) is FIX REQUIRED on 8fae685 / 8ebce5fe.
  - WP2-A-01 Medium (privacy): the admin holiday preview returns per-date counts of
    employee entries.
  - Everything else in the ledger held: a 550-round multi-process race, 119/119 probes,
    the WP1 upgrade, and ADV-A-01..04 fixed.
  - R1–R4 are non-blocking and carried forward.
- Coordinator decision (2026-10-04): remove the counts, because the canonical privacy
  boundary outranks the plan wording. The owner may reverse this.
- Fix order: WP2-FIXA (privacy), then WP2-FIXB (zone default and CSS tokens). Then one
  combined freeze, WP2-GATE2, and fresh rechecks WP2-AUDIT-A2 and WP2-AUDIT-B2.
- WP2-FIXA is done (author-reported).
  - The preview no longer carries employee-derived counts, and `finalized_conflicts` is
    date-only.
  - The regression tests were red 3, then green 29.
  - verify 600 tests; e2e 66 passed.
  - Digest 73db9c0a… (working tree).
- WP2-FIXB, first pass done (author-reported):
  - the display-zone default (the R-07 guard passed; no doc change);
  - the derived expected finish in the display zone;
  - CSS tokens with an identical computed-style probe;
  - verify 603 tests; e2e 68 passed, 2 skipped; digest 01110f75….
- The worker observed that editing an existing session's zone keeps the old pinned
  offsets. The coordinator resumed the same FIXB worker to fix this too, with red-first
  tests, before the freeze; this avoids another audit cycle.
- WP2-FIXB is done, including the addendum (author-reported):
  - changing a saved session's zone re-reads the typed wall times;
  - verify 606 tests; e2e 74 passed, 2 skipped;
  - digest 4c2bd7ef… (working tree, FIXA plus FIXB).
- WP2-FIX-FREEZE is committed and pushed as f79413b (attempt 2, 152 paths).
  - Attempt 1 failed on an EOF blank line in a task record and on the system Python
    lacking tzdata.
  - f79413b is the new package-final freeze.
- WP2-GATE2 PASS on f79413b; digest of record
  4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528.
  - 606 tests with every LG/DF fixture; concurrency x20; migrations; e2e 74 passed with
    all 12 flows; validators.
  - The FIXA and FIXB regression tests are present and pass.
  - F1 stays an evidence-only note.
- WP2-AUDIT-A2 PASS on f79413b: WP2-A-01 resolved, no regression. Two observations:
  A2-01 (Info, stale comments) and A2-02 (Low, `refreshed_pay_period` reveals whether a
  period has timesheets).
- WP2-AUDIT-B2 FIX REQUIRED: the product fixes hold.
  - WP2-B2-01 Medium: an e2e hard-codes PDT and would fail every winter.
  - WP2-B2-02 Low: more CSS literals.
  - The B2 auditor removed a stray repo-root `nul` file it had created.
- Coordinator decision (board):
  - WP2-FIXB2 fixes B2-01 and B2-02 and also folds in A2-02 and A2-01;
  - then a freeze and WP2-GATE3;
  - then fresh rechecks at the new digest: WP2-AUDIT-A2 attempt 2 (its attempt-1 PASS is
    invalidated by the source change and kept in history) and WP2-AUDIT-B3.
- WP2-FIXB2 is done (author-reported):
  - a season-independent R-07 e2e (zoneOracle helper and unit test);
  - 4 more CSS tokens;
  - the payroll-exception 201 returns only the exception, with a differential test;
  - comments;
  - verify 611 tests; e2e 74 passed; digest 5b370621….
- Running: WP2-FIXB2-FREEZE (committer). Next come WP2-GATE3, then WP2-AUDIT-A2 attempt 2
  and WP2-AUDIT-B3 in parallel, then WP2-ACCEPT.
- Live processes: none known besides the committer.
- Last digest: 809215583… (author-reported). No WP2 package audit has run yet.
- Usage/reset: not observable.
