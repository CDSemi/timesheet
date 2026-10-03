# Independent workflow recheck 2: WF-AUDIT2 open items on the WF-FIX2 freeze commit

Completed from [REVIEW](../templates/REVIEW.md). Translation: [WORKFLOW_RECHECK2.vi.md](WORKFLOW_RECHECK2.vi.md). Task record: [WF-AUDIT3](tasks/WF-AUDIT3.md). Items under recheck: [WORKFLOW_RECHECK](WORKFLOW_RECHECK.md) (WF-A-10 residual, WF-R-01, WF-R-02). Earlier findings: [WORKFLOW_REVIEW](WORKFLOW_REVIEW.md) (WF-A-01..WF-A-10).

- **Package/date/reviewer and observable model/effort:** Board package GOV. Reviewed 2026-10-03 UTC (2026-10-02 America/Los_Angeles). Fresh `timesheet-auditor` subagent. Self-reported model `claude-opus-5-5`; effort not observable. The strongest author model is Opus (WF-FIX2), so the auditor is not weaker.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** freeze commit `6578df8f81e8c0ead5ec09444b7bd8fa081d1ff7` = `origin/main` = remote `main`; no unpushed commits. Source digest `2f50be649666c785f9fd3db99f67c6d9115ad75b3dda089c36fbfb8d460af7b3` (532 files, `handoff/` excluded). It is the same in the Dropbox checkout and in a clean clone at that SHA, and equals the WF-GATE3 digest. Nothing outside `handoff/` changed before or after the audit. Reviewed range: the cumulative governance change `1a25275..6578df8`, with the fix commit `c219d79..6578df8` read line by line. The source is complete.
- **Decision: PASS.** The three open Low items (WF-A-10 residual, WF-R-01, WF-R-02) are fixed, and their reproductions, including probe D9 and the 5b spaced forms, now behave as required. Every mandatory check passes. There is no new finding at any severity, so no Low item remains open and none needs a deferral. The WF-A-09 deferral for already committed evidence stays as recorded in docs/10. This PASS accepts the cumulative governance change `1a25275..6578df8`.

## Scope actually inspected/executed

Read from disk: AGENTS.md (first), the WF-AUDIT3 brief, WORKFLOW_RECHECK with the WF-AUDIT2 probes (`3-probes.py`, `5b-spaced-secret-probes.*`), the WF-FIX2 report (treated as claims to check), the WF-FREEZE3 and WF-GATE3 records, and the full diff `c219d79..6578df8`: `validate_orchestration.py`, `check_recovery.py`, `precommit-check.mjs`, docs/08 (+vi), ORCHESTRATE (+vi), FIX_FINDINGS (+vi), NEXT_ACTION (+vi) and the board. Also read in full: the current validator, precommit script and docs/08, the working-tree board, the checkpoint, and the REVIEW and CHECKPOINT templates. Application source is unchanged: `git diff 1a25275 6578df8 -- src tests package-lock.json skills-lock.json` is empty, and package.json gained only the `precommit-check` script (fd77a87). Outside `handoff/`, the fix commit touches only the docs/08 pair and `scripts/precommit-check.mjs`. `.claude/`, `.agents/`, `docs/agents/`, AGENTS, CLAUDE and the templates are unchanged since c219d79.

## Evidence table

| Command | Result / exit | Evidence |
|---|---|---|
| `git rev-parse HEAD origin/main`; `git ls-remote origin refs/heads/main`; `npm run digest` (Node 24.21.0); status outside `handoff/`, before | 6578df8 in all three; 2f50be64…af7b3; none | [0-identity-before](evidence/WF-AUDIT3/0-identity-before.txt) |
| validator, check_recovery and `validate_package.py --preflight` (workflow Python) on the working-tree board | 0 PASS (9 profiles, 20 tasks); 0 PASS, 81 checks; 0 (44 pairs, 582 links, 91 scenarios) | [1-validator-recovery](evidence/WF-AUDIT3/1-validator-recovery.txt) |
| Own probes `3-probes.py` (31 in-memory boards built from the real board) | run 1: 28/29, because D9f tripped the digest binding before the commit binding (probe design). Run 2: 31/31 as expected, exit 0 | [3-probes.py](evidence/WF-AUDIT3/3-probes.py), [run 1](evidence/WF-AUDIT3/3-probes-output-run1.txt), [run 2](evidence/WF-AUDIT3/3-probes-output.txt) |
| WF-AUDIT2 `3-probes.py`, unchanged, against the 6578df8 validator | D9 and D8 flipped from ACCEPT to REJECT (the intended fixes). The other mismatches are board drift and are annotated | [3b-replay](evidence/WF-AUDIT3/3b-replay-wf-audit2-probes.txt) |
| `precommit-check.mjs --self-test` (checkout and clone); scratch clone outside Dropbox with 32 staged-set probes plus one multi-file set | 0 / 0 (35 path, 74 line samples). The 7 WF-AUDIT2 5b forms and 11 own spaced forms exit 1; 7 prose/placeholder controls exit 0; no plaintext value in any output; 7 documented limits recorded; clone deleted | [4 script](evidence/WF-AUDIT3/4-precommit-probes.sh), [4 output](evidence/WF-AUDIT3/4-precommit-output.txt) |
| Range privacy scans with the 6578df8 rules (scratch clones) | c219d79..6578df8: 69 files, 0 findings. 1a25275..6578df8: 204 files, 13 profile-path blocks in exactly the 7 files deferred under WF-A-09. Uncommitted coordinator/gate/freeze files: 24 files, 0 findings | [5 script](evidence/WF-AUDIT3/5-range-privacy.sh), [5 output](evidence/WF-AUDIT3/5-range-privacy.txt) |
| `npm run lint` with `--trace-deprecation --pending-deprecation` (Node 24.21.0): checkout, then a clean clone after `npm ci` | 0 and 0, no warnings; clone digest equal | [6-lint](evidence/WF-AUDIT3/6-lint.txt) |
| Committed board in a scratch clone; `git diff --check` for both ranges; scope diffs | validator 0, check_recovery 0 (81); 0 / 0; no src/tests/lock change; only the expected governance paths | [7-clone-and-scope](evidence/WF-AUDIT3/7-clone-and-scope.txt) |
| Full-tree scan: every tracked line staged as added on an unborn branch (regression check for the new rule) | the spaced rule flags no existing line; 17 profile-path (deferred and known) and 6 older quoted-literal hits in one test file (see risks) | [8-full-tree-scan](evidence/WF-AUDIT3/8-full-tree-scan.txt) |
| Privacy scan of this audit's own outputs; identity after | see the task record Results | [9-final-scan](evidence/WF-AUDIT3/9-final-scan.txt), [10-identity-after](evidence/WF-AUDIT3/10-identity-after.txt) |

## Disposition of previous findings

| ID | Sev | Status | Basis |
|---|---|---|---|
| WF-A-10 (residual) | Low | Fixed | ORCHESTRATE.md:25-28 (.vi:23-25) and FIX_FINDINGS.md:5 (.vi:5) now allow `gate_included` only for an intermediate S-size fix audit. Package-final snapshots, including a FIX REQUIRED recheck that unlocks the next package, and GOV audits keep a separate verifier gate. This matches docs/08:62,64. NEXT_ACTION.md:30-36 (.vi:29-35) routes F-01 through a separate WP1 gate, which matches the board's WP1-F01-GATE. The board decision carries `superseded_by` (ORCHESTRATION.json:93 at 6578df8). A wording search of the freeze commit finds no remaining unqualified "S-size fix audit may include the gate" outside that superseded board decision. |
| WF-R-01 | Low | Fixed | `validate_audits` (validate_orchestration.py:155-165) requires, in any package and at any status, that a gate dependency's `freeze_commit` equal the audit's `reviewed_commit` when both are recorded. A done GOV audit must also have a gate dependency whose 40-hex `freeze_commit` equals `reviewed_commit`. Probe D9 (replayed) and the WF-R-01 scenario D9a (a new audit reusing the old WF-GATE2 with the same digest) are rejected. So are D9b–D9g: `gate_included` without a gate, a gate without a commit, FIX REQUIRED, a running audit, two gates and a WP pair. check_recovery adds 6 binding probes (with 8 `addresses_audit` probes, 81 in total). On the real board, the WF-AUDIT, WF-AUDIT2 and WF-AUDIT3 commits equal their gates' commits. |
| WF-R-02 | Low | Fixed | `SECRET_SPACED` (precommit-check.mjs:21-24, used at 75-80) blocks secret-named values in the four-groups-of-four, single-space layout, quoted or unquoted, with an optional trailing comment. A spaced all-`x` placeholder passes. The self-test adds 15 samples (8 block, 7 pass) built at run time. In a scratch clone, all 5b forms and 11 further forms exit 1: upper case, TOML, JS object, unquoted INI, digits, compact JSON, CRLF, trailing spaces, a compose list item, a trailing comment and a prefixed name. Prose values exit 0, and the gate prints only a masked value. |
| WF-A-01..WF-A-09 | Medium/Low | Unchanged since WORKFLOW_RECHECK: Fixed; WF-A-09 committed evidence deferred (docs/10:85, .vi:86) | Spot rechecks on the new board: audit strength G2, G5, G6 (rejected); author separation G1 (WF-FIX2 cannot audit its own fix); the cross-package F-01 run on a GOV PASS, G3/G4; the 13 deferred profile-path occurrences are unchanged in number and location. |

WF-AUDIT2 optional improvements now implemented: `addresses_audit` is documented in docs/08:66 (+vi) and validated in `validate_addresses` (validate_orchestration.py:175-189); probes F1–F8 behave as expected. `.agents/` and `docs/agents/` are in the governance-path list at docs/08:64 (+vi).

## Findings

None. No new finding at High, Medium or Low severity.

## Coordinator choices judged

- **Commit binding (any package when both values exist; mandatory for done GOV audits): sound and minimal.** It closes the digest blind spot for `handoff/`-only governance changes without changing WP digest semantics. The WP-pair and missing-`reviewed_commit` probes in check_recovery keep the digest binding for work packages.
- **`addresses_audit` restricted to fix tasks and to a done FIX REQUIRED or NOT VERIFIED audit that is not also a dependency: sound.** Cross-package traceability is allowed (F7). An explicit null counts as absent (F8).
- **Spaced-rule scope: an acceptable heuristic.** The rule matches the exact layout only. Five-group values and prose continuations pass, and placeholders are judged on their compact form. One known false positive: four four-letter words after a secret name are blocked (L7); the remedy is to reword.
- **WF-FIX2 routing: acceptable, recorded as an observation.** The task ran as worker-high (effort high) with an Opus override and reason `escalation`. The docs/08:24 row for "recurring FIX REQUIRED" names expert (xhigh). The effort difference does not affect the audited snapshot, which this audit verified independently. For future escalations, use expert or record why worker-high was kept.
- **Masking at WF-FREEZE3 under docs/08:75: correct.** The c219d79..6578df8 range scan shows 0 findings.
- **NEXT_ACTION route and the board's WP1-F01 chain** (FIX → FREEZE → GATE → AUDIT → ACCEPT) **match docs/08:62.**

## Risks and optional improvements (no change required)

- Precommit heuristic limits, which predate WF-FIX2 and are outside the WF-R-02 forms. A bare `pass` key (for example in an SMTP auth object) and a quoted compose list item of the form `- "NAME=value"` pass, whether or not the value is spaced (L3–L6). Double-space or tab separators also pass (L1, L2). Before WP4 SMTP/compose work, consider adding an exact `pass` key and the leading-quote list form, with self-test cases. The backstops remain the `.env` path block and the committer's diff read.
- Six existing synthetic login passwords in tests/integration/auth.test.ts (lines 36, 53, 84, 85, 92, 95) match the older quoted-literal rule. If a writer edits those lines, the freeze commit blocks and the committer must stop. Worker briefs could require a synthetic marker in test secrets (`synthetic`, `fake`, `example` …), as tests/integration/migrations.test.ts:113 already does.
- A gate's `freeze_commit` is not cross-checked against its freeze task's `commit_sha` (D9h is accepted). This is optional defence in depth against transcription errors.
- Coordinator state:
  - There is no GOV accept-commit task yet. WP1-F01-FIX depends directly on WF-AUDIT3, while the checkpoint's next action puts the accept commit first. Add the accept task and make WP1-F01-FIX depend on it.
  - `WF-AUDIT3.author_agent_ids` omits WF-FIX2's `ac2a1aa382231d48e`. The validator still derives it from package membership (G1).
  - The checkpoint header (lines 5, 8, 17 and 28, with the .vi counterparts) keeps a stale phase, a stale HEAD and "audit (gate included)". Later bullets and the board supersede it.
- A GOV audit can still set `gate_included` to true alongside a matching gate. This is a harmless redundancy next to the docs/08:64 wording "never use".
- WF-FREEZE3 `node-version.txt` and `validate.txt` have CRLF line endings. git normalizes them to LF on commit, as the scan warning shows.

## Required gates unrun/blocked and why

None of the mandatory checks went unrun. `npm run verify` was not repeated: application source is unchanged since 1a25275, and WF-GATE3 ran it on the same commit and digest (174 tests).

## Software readiness, owner permission and pilot result

Unchanged. WP1 is FIX REQUIRED with F-01 open, and WP2 has not started. No owner pilot permission was sought, and nothing was sent or deployed.

## One next action

The coordinator records the WF-AUDIT3 PASS, then completes governance acceptance: STATE, NEXT_ACTION and HANDOFF updates, and a committer accept-commit task for the uncommitted GOV records and evidence. Then it dispatches WP1-F01-FIX.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WF-AUDIT3 attempt 1; board agent ID `ad06b62abaded3ade`, assigned by the coordinator and not self-observable. Authors: `a232a5b7f6cdec442` (WF-REVIEW), `ae6c446dc434f85d6` (WF-IMPL-TOOLING), `afbd2f9ae6ec1fce3` and `ad742f3b42890d674` (WF-IMPL-DOCS), `a2a9ec20d51be6815` (WF-FIX1), all Sonnet 5.5; `ac2a1aa382231d48e` (WF-FIX2, Opus 5.5). Previous auditors: `a80f8351bbd2fd196` (WF-AUDIT) and `aace091e55c54c3b0` (WF-AUDIT2). Verifiers and committers are not authors.
- Fresh context; confirm reviewer did not author changes: confirmed. This auditor wrote only this report pair, the Results of the WF-AUDIT3 task record and `evidence/WF-AUDIT3/`. It is not weaker than the strongest author model.
- Source digest before/after; gate evidence for that snapshot: 2f50be64…af7b3 before and after (10-identity-after). WF-GATE3 PASS on the same commit and digest.
- New report path preserving previous review history: new file. WORKFLOW_REVIEW, WORKFLOW_RECHECK and their evidence are unchanged.
- Finding dispositions and next coordinator fix/recheck task: every open item is closed; next comes the governance accept commit (see "One next action").
