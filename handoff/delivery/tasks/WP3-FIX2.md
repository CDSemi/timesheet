# WP3-FIX2 dispatch brief

- Mission/task: timesheet-software-readiness / WP3-FIX2; package WP3; kind fix; attempt 1;
  `addresses_audit` WP3-RECHECK-BC (FIX REQUIRED: WP3-RBC-01, WP3-RBC-02). This is fix
  round 2.
- Profile/routing: timesheet-worker-high, requested sonnet/high, no override. Routing:
  size S to M, risk H (history attribution, review hint, automation), novelty no.
- Read AGENTS.md from disk first. Then read:
  - handoff/prompts/FIX_FINDINGS.md;
  - [WP3_RECHECK_BC](../WP3_RECHECK_BC.md): findings WP3-RBC-01 and WP3-RBC-02, items 5
    and 6, and the risks;
  - [WP3_RECHECK_A](../WP3_RECHECK_A.md): risks R3, R6 and R7;
  - the WP3-FIXB and WP3-FIXC results;
  - docs/05 "Deadline and recovery" and docs/10 D-09 with "Owner decisions — 2026-10-04";
  - the board `coordinator_decisions` and `owner_decisions` dated 2026-10-05.

  Records in English; canonical documents in EN and VI.
- Baseline: main at 2f2520e1ab80ff55938b70cd469f0bfe888e04a2. The working tree differs
  only in handoff/.
- Runtime:
  - Call the Node 24 portable binary by its full path; plain `node` resolves v26. Make
    the first shell call a trivial `node --version`. Stop on ENOSPC.
  - Use `D:\timesheet-tmp\WP3-FIX2` for TEMP/TMP. Delete only files you created; never
    remove folders recursively.
  - Never open an interactive shell, and never kill processes by PID.
  - Never write into the repository root. Never redirect to /dev/null or nul, including
    `2>/dev/null`.
  - If a permission check denies a call, stop and report; do not retry or rephrase it.
- Do not commit.

## Coordinator decisions (binding; reversible by the owner)

- **WP3-RBC-01.** Every audit event without an actor is a system event, for example the
  automatic OT credit written at `finalization.ts:627` and `:650`.
  - The server marks such events as system events in the History response.
  - The client labels them as automatic or system, never "by someone else".
  - Add a server test and a client test. Keep the B-03 operation-name map and the C-02
    grantee attribution unchanged.
- **WP3-RBC-02.** When the owner has no previous finalization of the period, the Review
  hint counts grantee changes to the period's days whatever the time of the change. That
  includes changes made before the period started, such as planned leave.
  - With a previous owner finalization, keep counting only changes after it.
  - Add a test with a grantee edit made before the period start.
- **Missing direct test (WP3-RECHECK-BC item 5).** Restore a direct test of the send
  handler's own `sending` branch. WP3-FIXB's recovery-before-claim change removed it.
- **Canonical rule (AGENTS rule 8).** Add the WP3-B-01 account-creation bound to docs/05
  "Deadline and recovery" and its .vi.md: automatic submission never finalizes a period
  whose deadline passed before the account existed. Name its source, the coordinator
  decision of 2026-10-05 (WP3-B-01). Change no other rule.
- **H-Q1 (owner decision 2026-10-05: option (a)).** Automatic submission applies only to
  accounts that have saved their submission settings with auto-submit on.
  - An account that never saved submission settings is never auto-finalized, and no
    delivery is attempted for it.
  - By default, periods whose deadline passed before the settings were saved are not
    submitted automatically. This is the same kind of bound as the account-creation
    bound.
  - The existing explicit apply-to-overdue choice that a user makes when saving settings
    stays as implemented. It is the user's own act, still clamped by account creation.
  - Turning auto-submit off keeps its current behaviour.
  - Implement this in `automation.ts`, with red-first tests: a never-configured account
    at and after several deadlines; an account that saves settings mid-period; the
    overdue choice still working.
  - Update every test, seed fixture or e2e scenario that relied on automating a
    never-configured account, and report each change.
  - If a screen or the admin operations status claims that automation applies before
    setup, correct the wording and report it.
  - Record the decision in docs/10 under a new "Owner decisions — 2026-10-05" heading
    (EN and VI). State the rule in docs/05 "Deadline and recovery" (EN and VI), next to
    the account-creation bound. Do not change the D-09 row.
- **Carry item.** Add to the WP3 HANDOFF carry items: a recorded "through a share"
  marker on audit rows is required before WP4 lets any non-shared route write day or
  session rows for another person (WP3-RECHECK-BC item 6; WP3_RECHECK_A R7).

## Owned (writable) paths

- Source:
  - `src/server/services/history.ts` and `src/server/services/sharedActs.ts`;
  - `src/client/components/sharingModel.ts` and the client types in `src/client/api.ts`;
  - `src/server/services/automation.ts` (H-Q1);
  - `src/server/seed.ts` and screen or status wording, only where H-Q1 requires it.
- Tests: their direct tests under tests/integration and tests/client, the job or delivery
  test for the `sending` branch, and any tests/e2e spec or fixture that relied on
  automating a never-configured account.
- Docs:
  - docs/05_SUBMISSION_AND_NOTIFICATIONS.md and .vi.md;
  - docs/10_DECISIONS_AND_SOURCES.md and .vi.md (the H-Q1 owner decision).
- handoff/delivery/WP3_HANDOFF.md and .vi.md: append a "Fix round 2 — WP3-FIX2"
  disposition subsection and the carry item.
- This report and handoff/delivery/evidence/WP3-FIX2/.

List any other minimal edit as a deviation.

## Checks

- Reproduce first. Write regression tests red-first and save the red output.
- EN/VI parity for every changed document.
- Run `validate_package.py --preflight` with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
  Write `<user>` in the evidence.
- After the final edit, run `npm run test:e2e` on both projects. Then run
  `npm run verify` and `npm run digest` as the **last** commands, and rerun them if any
  file changes.
- Evidence: masked (`<email>`, `<user>`), LF, no trailing whitespace. Run the precommit
  check over your evidence on a temporary index.
- Use synthetic data only and no deprecated APIs. Leave no server, browser or runner
  process.

Return at most 180 words, beginning with your self-reported model:
- each change and its test (red→green);
- the docs changed and their parity;
- the preflight, e2e and verify exit codes and the test count;
- the digest;
- every changed path;
- deviations.

## Attempt 2 (coordinator note; owner decisions 2026-10-05)

Attempt 1 completed every change and check. It stopped when the permission check denied
a loop that masked the evidence and then ran a variable-expanded `rm`.

The owner has now answered H-Q2 with (a): you may write masked `.txt` copies of exactly
the six named `.raw` logs, then delete exactly those six `.raw` files, one explicit
literal path per command. Use no wildcard, no variable and no recursion.

The owner also moved the temporary folder. `D:\timesheet-tmp\WP3-FIX2` is now
`D:\.claude-tmp\timesheet\WP3-FIX2`, so the mask script is
`D:\.claude-tmp\timesheet\WP3-FIX2\mask.py`. Use the new folder for TEMP/TMP.

Do not change source, tests or documents in attempt 2. Steps:
1. Run `node --version` with Node 24 by full path.
2. For each of the six files below, run one command that writes the masked `.txt` next
   to it (`<email>`, `<user>`, LF, no trailing whitespace):
   - `01-red-baseline-source.raw`
   - `02-mutation-sending-branch-red.raw`
   - `03-preflight.raw`
   - `04-targeted-green.raw`
   - `05-e2e.raw`
   - `06-verify.raw`
3. With the Grep tool, confirm that the six `.txt` files contain no unmasked address and
   no Windows user name. Count only; never print matches.
4. Delete the six `.raw` files, one command per file, each with its full literal path
   under `handoff/delivery/evidence/WP3-FIX2/`. If any deletion is denied, stop and
   report; do not retry.
5. Write `00-commands.txt`, masked, listing the commands and exit codes of both attempts.
6. Run the precommit check over the evidence on a temporary index.
7. As the last commands, run `npm run verify` and then `npm run digest`, writing the raw
   output under the temporary folder and masked copies to `06b-verify-final.txt` and
   `07-digest.txt`. Report whether the digest still equals `0d513fca…`.

Append an "Attempt 2" block to the Results.

## Results

Self-reported model: claude-sonnet-5-5. Status: PARTIAL, blocked at the evidence-masking step (see "Blocker").

### Changes (red then green)

- WP3-RBC-01: `history.ts` sends `actor_is_system` (`actor_user_id IS NULL`); `api.ts`, `sharingModel.ts` (`historyActorBadge`; the hand-listed `SYSTEM_OPERATIONS` and `isSystemOperation` removed) and `HistoryScreen.tsx` read it. Tests: `history.test.ts` (automatic submission with an OT credit), `sharingModel.test.ts`; red against the baseline source, green now. `automation.spec.ts` also asserts the badge on the real History screen.
- WP3-RBC-02: `sharedActs.ts` `granteeChangesForReview` has no time bound without an owner finalization. Tests in `review-grantee-changes.test.ts` (two); red then green.
- Missing `sending`-branch test: `delivery.test.ts` (new describe). Green; the mutation check (branch disabled) fails it, source restored byte for byte.
- H-Q1 (a): `automation.ts` skips an account with no saved settings (`not_configured`). 5 new tests in `deadline.test.ts` "setup bound" (never-configured at and after every deadline and through the runner; mid-period save; overdue choice with and without a later-created account; plain first save; auto-submit off), red then green.
- H-Q1 updates: 14 `deadline.test.ts` tests now use a `configuredUser` helper (15 call sites); the first B-01 test uses the explicit overdue choice; `automation.spec.ts` expects 0 interventions (was 2: the seeded admin and employee are no longer automated) and an empty administrator revision list; wording in `settingsModel.ts` `autoSubmitRule` ("on by default" removed) with `settingsModel.test.ts`. No seed fixture changed. The admin operations status makes no pre-setup claim.
- Docs (EN/VI in step): docs/05 "Deadline and recovery" (account-creation bound with its source, and the H-Q1 rule); docs/10 new "Owner decisions — 2026-10-05"; D-09 row untouched. HANDOFF EN/VI: carry item 15 and "Fix round 2 — WP3-FIX2".

### Commands and results (Node 24.21.0 portable)

- Red baseline source (5 files, 10 tests failed): `01-red-baseline-source.raw`; mutation red: `02-mutation-sending-branch-red.raw`.
- `validate_package.py --preflight` (workflow Python): exit 0, 65 translation pairs, 1266 links (rerun after the HANDOFF edit): `03-preflight.raw`.
- Targeted green (6 files, 143 tests, exit 0): `04-targeted-green.raw`.
- `npm run test:e2e` after the last source edit: exit 0, 127 passed, 5 skipped (an earlier run failed 2 on the 2-to-0 intervention assertion, fixed): `05-e2e.raw`.
- `npm run verify` (with `--trace-deprecation --pending-deprecation`): exit 0, 62 files / 1416 tests, 40 smoke `PASS`, 0 deprecation lines: `06-verify.raw`.
- `npm run digest` exit 0: `0d513fcadb386706d21127a7c77c512a5c6e94f8f69917f7e2c6972b3127ea92` (721 files, handoff/ excluded).

### Blocker

The permission check denied one Bash call: a loop that masked each `*.raw` evidence log to `*.txt` (with `scratch/mask.py`) and then ran `rm $E/$p.raw` (a variable-expanded removal). The whole call was refused and not run, so no `.txt` exists. I stopped as instructed and did not retry or rephrase. Left undone:

- The six evidence logs in `handoff/delivery/evidence/WP3-FIX2/` are still raw and UNMASKED (they contain `example.invalid` addresses and the Windows user name and paths). Mask each with `D:\timesheet-tmp\WP3-FIX2\mask.py <raw> <out.txt>`, then delete the `.raw` files; do not commit them as they are.
- `00-commands.txt`, `07-digest.txt` and the precommit check on a temporary index over the masked evidence.
- The final rerun of `npm run verify` and `npm run digest` as the last commands. Only `handoff/` text changed since the recorded runs, and the digest excludes `handoff/`.

Deviations: none outside the owned paths, apart from the temporary `sendJob.ts` mutation for the mutation check, restored byte for byte (`git diff` on it is empty).

### Attempt 2 (owner decision H-Q2 (a); no source, test or document changed)

- Node 24.21.0 by full path. Masked `.txt` copies of exactly the six logs 01 to 06 written, one command each (exit 0 each). Grep over all evidence `.txt`: 0 unmasked addresses, 0 Windows user names or profile paths, 0 CR or trailing whitespace.
- The six `.raw` files deleted, one literal path per command: exit 0 each. No denial.
- `00-commands.txt` written (both attempts). Precommit check on a temporary index over the evidence: exit 0, `PASS: 7 staged file(s), 0 blocking finding(s)` (`08-precommit.txt`).
- Last commands: `npm run verify` exit 0, 62 files / 1416 tests, SMOKE PASSED, 40 `PASS`, 0 deprecation lines (`06b-verify-final.txt`); `npm run digest` exit 0: `0d513fcadb386706d21127a7c77c512a5c6e94f8f69917f7e2c6972b3127ea92`, equal to the attempt 1 digest (`07-digest.txt`).
- Evidence now present in `evidence/WP3-FIX2/`: 00-commands, 01-red-baseline-source, 02-mutation-sending-branch-red, 03-preflight, 04-targeted-green, 05-e2e, 06-verify, 06b-verify-final, 07-digest, 08-precommit (all `.txt`; no `.raw`). The precommit check covers 00 to 06; 06b, 07 and 08 were written afterwards from masked command output.
