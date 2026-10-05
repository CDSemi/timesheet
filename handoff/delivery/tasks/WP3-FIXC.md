# WP3-FIXC dispatch brief

- Mission/task: timesheet-software-readiness / WP3-FIXC; package WP3; kind fix; attempt 1;
  `addresses_audit` WP3-AUDIT-C (FIX REQUIRED: WP3-C-01, WP3-C-02, WP3-C-03). Runs after
  WP3-FIXB, on its working tree; one source writer at a time.
- Profile/routing: timesheet-worker-high, requested sonnet/high, no override. Routing:
  size M, risk H (sharing attribution and the review screen), novelty no.
- Read AGENTS.md from disk first. Then read:
  - handoff/prompts/FIX_FINDINGS.md;
  - [WP3_REVIEW_C](../WP3_REVIEW_C.md), findings WP3-C-01..03 and the risks;
  - [WP3-REQ](WP3-REQ.md) lines 455-460 and 584-588 (attribution and the "changed by"
    hint);
  - the WP3-T13B and WP3-T13C records;
  - the WP3-FIXB results;
  - the board `coordinator_decisions` dated 2026-10-05.

  Records in English.
- Baseline: main at a1cd566e59253d19f53cfd5b3a81fd27a7e9a056 plus the uncommitted
  WP3-FIXB changes. Preserve them; the working tree otherwise differs only in handoff/.
- Runtime:
  - Call the Node 24 portable binary by its full path (plain `node` resolves v26). Make
    the first shell call a trivial `node --version`; stop on ENOSPC.
  - Use `D:\timesheet-tmp\WP3-FIXC` for TEMP/TMP. Delete only files you created; never
    remove folders recursively.
  - Never open an interactive shell and never kill processes by PID.
  - Never write into the repository root. Never redirect to /dev/null or nul.
- Permissions: if a permission check denies a call, stop and report; do not retry or
  rephrase it.
- Do not commit.

## Coordinator decisions (binding; reversible by the owner)

- **WP3-C-01.** Implement the planned hint; do not drop it. On the owner's own Review
  screen, show "N day(s) last changed by <grantee display name>" for the period being
  reviewed. Rules:
  - Derive it from audit events written through a grant since the owner's previous
    finalization of that period; with no previous finalization, since the period
    started.
  - Owner-only: never on shared views and never in admin responses.
  - Keep it outside the snapshot, the payload hash and the PDF. Signing with the hint
    shown or hidden must give the same reviewed hash; test that.
  - Use E-8 CSS tokens only. Keep the hint visible on mobile.
- **WP3-C-02.** History attributes an act to a grantee only when that act was performed
  through `/api/shared` under a grant. Rules:
  - Use the recorded request path or a recorded flag. Do not infer attribution from the
    time window in which a share existed.
  - An admin-route revocation by an admin who also holds a share stays an admin act.
  - A same-second earlier act is not attributed retroactively.
  - If the audit rows lack the information, add the smallest field and a migration only
    if unavoidable. Report it as a deviation for coordinator review before you rely on
    it.
- **WP3-C-03.** Update the stale comment at `src/server/types.ts:22-27`.
- **Risk "Changed by" wording on downloads.** If History's wording says "Changed by" for
  a grantee's PDF download, use a neutral verb such as "Downloaded by". Treat this as
  part of C-02 attribution wording.

## Owned (writable) paths

- Source:
  - `src/server/services/history.ts`;
  - the review-data service and route that feed `src/client/ReviewScreen.tsx` (locate
    them);
  - `src/client/ReviewScreen.tsx`, `src/client/api.ts` (types only),
    `src/client/styles.css` (tokens only);
  - `src/server/types.ts` (comment);
  - the client History model, only for the C-02 wording.
- Tests: their direct tests under tests/integration and tests/client, and
  tests/e2e/sharing.spec.ts for the hint.
- handoff/delivery/WP3_HANDOFF.md and .vi.md: append a "Fix round 1 — WP3-FIXC"
  disposition subsection.
- This report and handoff/delivery/evidence/WP3-FIXC/.

List any other minimal edit as a deviation.

## Checks

- Reproduce first: write red-first tests and save their output against the code before
  your change.
  - C-02: an admin-route revocation by a sharing admin; a same-second earlier act.
  - C-01: the hint appears for grantee edits, is absent for owner-only edits, is absent
    on shared views and in admin responses, and leaves the reviewed hash unchanged.
- Take synthetic desktop and mobile screenshots of the Review hint, named
  `*-synthetic.png`.
- Run `npm run test:e2e` (both projects) after the final edit. Then run
  `npm run verify` and `npm run digest` as the **last** commands; rerun them if any file
  changes.
- Evidence must be masked (`<email>`), LF and free of trailing whitespace. Run the
  precommit check over your evidence on a temporary index before hand-back.
- Use synthetic data only and no deprecated APIs. Leave no server, browser or runner
  process.

Return at most 180 words, beginning with your self-reported model:
- each finding's fix;
- the tests (red→green);
- whether you added a field or migration;
- e2e and verify exit codes and the test count;
- the digest;
- every changed path, including WP3-FIXB's paths still in the tree;
- deviations.

## Results

(Worker appends here.)

### Worker result - attempt 1 (timesheet-worker-high; self-reported model claude-sonnet-5-5; effort requested high)

Status: complete; nothing committed. Evidence `handoff/delivery/evidence/WP3-FIXC/` (00-commands.txt lists every command and exit). Disposition table: `handoff/delivery/WP3_HANDOFF.md` and `.vi.md`, "Fix round 1 - WP3-FIXC". Baseline a1cd566 plus the uncommitted WP3-FIXB changes, which were preserved and not reworked.

- **WP3-C-01** (hint implemented as decided). New `src/server/services/sharedActs.ts` `granteeChangesForReview`: from the audit, the days of the reviewed period whose last `day_entry.*`/`work_session.*` event was written through a grant, grouped by grantee display name, since the owner's latest own finalization of the period (sign-off, correction, late review; the automatic submission is not the owner's), else since the period start in the reporting zone. `routes/submission.ts` returns `grantee_changes` beside the payload (never inside it, never the hash or PDF) and only when actor = subject; the review route is not on the shared allowlist, so a grantee, a shared view and an admin never get it. `ReviewScreen.tsx` shows "N day(s) last changed by <name>" above the day table; `styles.css` one rule with E-8 tokens (`--rule`, `--warn`); `api.ts` types; `granteeChangesModel.ts` the wording.
- **WP3-C-02.** `history.ts` no longer uses the share's time window. An event is "through a grant" when its actor is not the owner and its operation is one a shared route writes (`SHARED_ACT_OPERATIONS`); the Review hint uses the same condition. An admin-route revocation by an admin holding a share, a same-second act before a later grant, `user.*` and a grantee leaving stay unattributed. `historyActorBadge` says "Downloaded by <name> (shared access)" for a PDF download, "Changed by" for edits.
- **WP3-C-03.** `src/server/types.ts` `AppEnv` comment now describes `requireShare`.
- **Field or migration: none.** The audit rows do not record the request path or a flag. I did not add one; the operation-plus-actor rule above met the decision without it. Deviation for coordinator review: a future non-shared route that writes one of the listed operation codes for another actor would be attributed wrongly (the drift-guard test covers the shared routes only); a recorded marker (a migration) is the robust alternative.
- **Tests (red then green).** `history.test.ts` (3 new red: sharing admin revocation, same-second act, grantee leaving; plus a drift guard that all five shared write routes are attributed, which was and stays green; the old synthetic-row test was replaced), `review-grantee-changes.test.ts` (11 new, 10 red), `sharingModel.test.ts` (download wording, red), `granteeChangesModel.test.ts` (1), `tests/e2e/sharing.spec.ts` (hint on desktop and mobile, absent on the shared view, cleared by an owner edit), `reviewModel.test.ts` (fixture gets the new required field). Red: 13 failed of 50 (01-red-regressions.txt) and 14 of 49 on the first run (01a). Green: full suite 62 files / 1407 tests.
- **Final checks.** `npm run test:e2e` exit 0 (127 passed, 5 skipped); `npm run verify` exit 0 (62 files / 1407 tests, SMOKE PASSED, 40 `PASS`, 0 deprecation lines); `npm run digest` exit 0 `eeb417d3b903b30f1c21fa0a855424da02ab1d6e1d525f2509130f3933a48410` (721 files). Precommit check on a temporary index over the evidence folder: PASS (08-precommit-check.txt). Screenshots: `sharing-review-hint-desktop-synthetic.png`, `sharing-review-hint-mobile-synthetic.png` (viewed; hint visible above the days on both).
- **Changed paths (whole tree, FIXB's included).** Source: src/server/services/automation.ts, src/server/jobs/runner.ts, src/client/components/otModel.ts, src/client/components/sharingModel.ts, src/client/HistoryScreen.tsx (FIXB; sharingModel.ts also has my wording change); src/server/services/history.ts, src/server/routes/submission.ts, src/server/types.ts, src/client/ReviewScreen.tsx, src/client/api.ts, src/client/styles.css, and new src/server/services/sharedActs.ts, src/client/components/granteeChangesModel.ts. Tests: tests/integration/deadline.test.ts, delivery.test.ts, delivery-crash.test.ts, tests/client/otModel.test.ts (FIXB); tests/client/sharingModel.test.ts (both), tests/integration/history.test.ts, tests/client/reviewModel.test.ts, tests/e2e/sharing.spec.ts, and new tests/integration/review-grantee-changes.test.ts, tests/client/granteeChangesModel.test.ts. Handoff: WP3_HANDOFF.md and .vi.md, this brief, evidence/WP3-FIXC/.
- **Deviations.** (1) No field or migration, as above (the operation-plus-actor rule is the residual risk). (2) Two new source files (`sharedActs.ts`, `granteeChangesModel.ts`) and two new test files, so the shared-act rule has one definition for History and the Review hint. (3) `tests/client/reviewModel.test.ts` (one fixture line) and `tests/e2e/sharing.spec.ts` are outside the named direct tests but needed for the new required `grantee_changes` field and the hint check. (4) The grantee leaving a share is no longer named in the owner's History, as the decision requires; it reads "Share ended" by someone else. (5) The old test that inserted a synthetic row after a share ended was replaced, because it encoded the time-window rule.
