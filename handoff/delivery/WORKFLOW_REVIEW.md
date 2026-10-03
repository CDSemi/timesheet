# Independent workflow review: orchestration redesign and revision v2

Completed from [REVIEW](../templates/REVIEW.md). Translation: [WORKFLOW_REVIEW.vi.md](WORKFLOW_REVIEW.vi.md). Task record: [WF-AUDIT](tasks/WF-AUDIT.md).

- **Package/date/reviewer and observable model/effort:** Workflow scope filed under board package WP1. Reviewed 2026-10-03 UTC (2026-10-02 America/Los_Angeles). Fresh `timesheet-auditor` subagent. Self-reported model `claude-opus-5-5`. Effort is not observable. The tool set matches the auditor profile.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** freeze commit `fd77a8717da9a1b2ea9ce13520d59b9df60f4716` = `origin/main`; no unpushed commits. Source digest `03d4a6f986c93423903ea94ded9f58a7ca127c64dc6bcca1342f38a8b24f491b` (532 files, `handoff/` excluded). The digest is the same in the Dropbox checkout and in a scratch clone at that SHA. The reviewed range is the cumulative `1a25275..fd77a87`: redesign `ffbf8f0` (never audited before) plus revision v2 `fd77a87`. The source is complete.
- **Decision: FIX REQUIRED.** All mandatory checks pass. However, three Medium findings need canonical rule or tool changes before the workflow can be accepted: a contradiction in the audit-strength rule, workflow audits that go stale on the next WP1 change, and privacy-check gaps in a public repository. There are also seven Low findings.

## Scope actually inspected/executed

Read in full: the cumulative diff for AGENTS/CLAUDE/README, docs 06/08/09/10, NEXT_ACTION, STATE, the board, all nine profiles, `settings.json`, `validate_orchestration.py`, `check_recovery.py`, `validate_package.py`, `scripts/precommit-check.mjs`, `package.json`, the ORCHESTRATE/RESUME/FIX_FINDINGS prompts, the templates, and samples of the WP1/WP5 prompts. Also read: the board `owner_decisions`, `coordinator_decisions` and WF-CAPS `auxiliary_lookups`; [WF-REVIEW](tasks/WF-REVIEW.md) as context only; and the WF-IMPL-TOOLING/WF-IMPL-DOCS/WF-FREEZE/WF-GATE reports, treated as claims to check. Application source is out of scope and unchanged (`git diff 1a25275 fd77a87 -- src tests package-lock.json skills-lock.json` is empty).

## Evidence table

| Command | Result / exit | Evidence |
|---|---|---|
| `git rev-parse HEAD`, `origin/main`; `npm run digest` (Node 24.21.0) before | fd77a87 both; 03d4a6f9…491b; nothing changed outside `handoff/` | [0-identity-before](evidence/WF-AUDIT/0-identity-before.txt) |
| `python handoff/delivery/validate_orchestration.py` | 0, PASS (9 profiles, 10 tasks) | [1-validator-recovery](evidence/WF-AUDIT/1-validator-recovery.txt) |
| `python handoff/delivery/check_recovery.py` | 0, 48 synthetic checks | same |
| Own probes `2-probes.py` (synthetic in-memory boards) | 0; all 19 behave as stated: rejects running override without a reason, opusplan/best/fable/default, a commit beside a running audit, weaker audits, gate/audit mismatch and main after release. The documented gaps are probes 6, 8, 10 and 11 | [2-probes](evidence/WF-AUDIT/2-probes.py), [output](evidence/WF-AUDIT/2-probes-output.txt) |
| Owner confirmation check (transcript metadata) | The board's verbatim text is a direct owner message, exactly equal | [3-owner-confirmation](evidence/WF-AUDIT/3-owner-confirmation.txt) |
| Profile-tampering probes, scratch clone | Correctly rejected: coordinator+Bash, worker+Agent, missing committer, committer without Bash, fable/opusplan/ultracode. Incorrectly accepted (exit 0): expert `effort: max` | [4-profile-probes](evidence/WF-AUDIT/4-profile-probes.txt) |
| `node scripts/precommit-check.mjs --self-test`; 18 staged-set probes | Self-test 0 (27 path, 24 line samples). Blocks email, quoted/env secrets, private key, URL credentials, signature outside evidence, spreadsheet, sqlite, `.env`, `data/`. Misses YAML secrets, evidence media and `/c/Users` paths | [5-precommit](evidence/WF-AUDIT/5-precommit.txt) |
| `npm ci`; `npm run lint` (Node 24.21.0, `--trace-deprecation --pending-deprecation`) | 0; 0; no warnings | [6-lint](evidence/WF-AUDIT/6-lint.txt) |
| `validate_package.py --preflight`; `git diff --check 1a25275 fd77a87`; scope listing | 0 (42 pairs, 496 links, 91 scenarios); 0; non-handoff changes limited to workflow files | [7-preflight-scope](evidence/WF-AUDIT/7-preflight-scope.txt) |
| precommit over the whole range 1a25275..fd77a87 | 0 blocking, 16 profile-path warnings; no email or secret | [8-range-privacy](evidence/WF-AUDIT/8-range-privacy.txt) |
| Runtime observations | Profile applied; stale AGENTS.md in subagent context | [9-observations](evidence/WF-AUDIT/9-observations.txt) |

## Findings

| ID | Sev | File:line | Reproduction / observation | Required change |
|---|---|---|---|---|
| WF-A-01 | Medium | docs/08_AI_WORKFLOW_AND_BUDGET.md:26,30,34; .claude/agents/timesheet-auditor.md:25; handoff/delivery/validate_orchestration.py:139 | Doc 08 says an auditor is "never below the author model", and the auditor profile says the auditor "must not be weaker". Yet doc 08 also allows a Sonnet auditor when Opus is unavailable, and the validator skips the strength check for `fallback_unavailable` (check_recovery accepts a Sonnet audit of an Opus author). Line 34 asks for a "Sonnet/high" auditor, but the auditor profile fixes `xhigh` and effort may change only through profiles (line 32). | State one canonical rule in doc 08 (+vi) and the auditor profile. Example: the fallback applies only when no author of the reviewed snapshot used a stronger model; otherwise checkpoint and wait, or raise an owner blocker. Narrow the validator bypass to match, resolve "Sonnet/high", and add a probe. |
| WF-A-02 | Medium | validate_orchestration.py:15,246-247,257-258; board `WP1-F01-FIX.depends_on`; WORKFLOW_REVISION_CHECKPOINT.md:42; docs/08:44-54 | Workflow tasks must use package WP1. Once the F-01 fix changes `current_source_digest`, the WF-AUDIT PASS fails as "Stale PASS" (probe 8). The planned archive of WF-* tasks is not documented anywhere. Simply removing WF-AUDIT breaks `WP1-F01-FIX` with "Unknown/self dependency". | Document how governance tasks are handled in doc 08 (+vi): a separate scope, or an archive location that the validator resolves for dependencies. Name the paths whose change requires a new workflow audit (AGENTS/CLAUDE, doc 08, prompts, templates, profiles, settings, validators, precommit). |
| WF-A-03 | Medium | scripts/precommit-check.mjs:17-18, 10+43, 22 | Probes pass with 0 findings: `SMTP_PASSWORD: Zq81probeKx` and `api_token: Zq81probeKx` (unquoted YAML), `handoff/delivery/evidence/WP3/employee-signature.png` and a PDF in the same directory, and `/c/Users/<name>/…`. The committed log 3b contains such a path. WP3 PDFs/signatures and WP4 compose files are next. | Detect unquoted `name: value` secrets. WARN at least (or require an explicit synthetic allowlist) for PDF/image/signature files under evidence. Extend the profile-path rule to POSIX drive paths and ignore `<placeholder>`. Add self-test cases for each. |
| WF-A-04 | Low | validate_orchestration.py:19; docs/08:30 | `EFFORTS` includes `max`, so a profile with `effort: max` validates (exit 0). Doc 08 requires an owner decision for max effort. | Remove `max` from the allowed set, or require an owner-decision record for it; add a probe. |
| WF-A-05 | Low | validate_orchestration.py:136-138,240-243 | Authors are detected automatically only for `implement`/`fix` tasks. A documentation author auditing its own change passes if `author_agent_ids` omits it (probe 6). Documentation is the main output of a workflow change. | Treat every non-gate/audit/commit task with an `agent_id` in the reviewed scope as an author, or require a non-empty `author_agent_ids`; add a probe. |
| WF-A-06 | Low | handoff/prompts/RESUME.md:6,9 (+vi :6,8); .claude/agents/timesheet-coordinator.md:4,13 | RESUME tells the coordinator to "Inspect actual uncommitted/unpushed work" and "Check live processes", but it has no shell. Step 2 makes delegating that inspection conditional. | Read that state from the board and checkpoint, and delegate inspection when required; same change in vi. |
| WF-A-07 | Low | All eight shell profiles, line 9; docs/08:32 | This auditor's context contained the ffbf8f0 AGENTS.md: rule 12 still forbade commits and rule 1 lacked the English-only sentence. The profiles say "Read AGENTS.md unless it is already in your context", so an agent with the stale copy will not re-read it. | Require a client restart after AGENTS/CLAUDE changes, or have briefs/profiles read AGENTS.md from disk. Record this in doc 08 (+vi). |
| WF-A-08 | Low | .claude/agents/timesheet-committer.md:22; docs/08:70; tasks/WF-FREEZE.md (Results) | WF-FREEZE ran the precommit check under Node v26.10.0 although its brief required Node 24. Nothing pins the committer's runtime. | Name the Node 24 runtime in the committer profile or brief, and record `node --version` in commit evidence. |
| WF-A-09 | Low | evidence/orchestration/{documentation,recovery,workflow}.txt:1, run-validation.ps1:3 (ffbf8f0); evidence/WF-IMPL-TOOLING/3a…:3-44, 3b…:1, 5a-lint.txt:1 (fd77a87) | The Windows account name appears in a public repository. Of the 12 freeze warnings, 8 are real paths and 4 are false positives from the `<user>` placeholders in WF-REVIEW. 3b went undetected. | Mask profile paths in new evidence. The committer stops, or masks first, when new evidence produces a profile-path warning. Optionally redact in a normal commit (no history rewrite). |
| WF-A-10 | Low | docs/08:60 vs handoff/NEXT_ACTION.md:33-34; board WP1-F01-FIX/GATE/AUDIT `owned_paths`; docs/08:48,69 | The F-01 recheck alone decides WP1 acceptance, but the plan includes it as "gate included" while doc 08 keeps a separate gate for "package-final snapshots". The F-01 tasks still own `.vi.md` task records. There is no freeze-commit task between fix and gate. | Define "package-final snapshot". Re-plan F-01 (fix → freeze commit → gate/audit) with English-only records before dispatch. This is the coordinator's re-plan, already noted on the board. |

## Risks and optional improvements (no change required)

- CLAUDE.vi.md keeps the heading "Điểm vào dự án cho Claude" (EN: "Claude guidance"). In docs/10.vi the translation note now sits before the new sections.
- The historical `evidence/orchestration/check-recovery.py` still reads the retired `ORCHESTRATION.previous.json`. It is kept untouched by decision.
- A non-Claude author is ranked by its requested Claude alias (probe 9). Model fields of done tasks are not re-validated (probe 11).
- Branch and PR creation steps after the first release are not yet in the committer profile; add them before `release_declared`. The coordinator's and committer's Write/Edit limits are enforced only by prose.

## Confirmed without finding

- Commit authority is consistent across AGENTS rule 12, doc 08 "Commits and pushes", ORCHESTRATE:6, RESUME:17-20,25, the committer profile (a superset of the prohibitions) and the worker profiles. The post-release branch policy is enforced for done commit tasks. `.claude/settings.json` holds only `agent`; no permission file is tracked. The owner's verbatim confirmation and original request were checked in the session transcript, not taken from agent messages.
- Routing: doc 08 table = frontmatter of all nine profiles = board decisions. Effort changes only through profiles. Overrides need a permitted alias and a reason. A weaker audit is rejected by requested and by actual model. Commit tasks run alone.
- The coordinator has no Bash and nested delegation is rejected, both enforced by the validator.
- Revision v2 touched only paths owned by its tasks or the coordinator. No secret or email was found in the range. Business rules are unchanged. STATE keeps WP1 `fix_required` with F-01. The WP1-F01 chain still needs fix → freeze → fresh audit on the new digest (NEXT_ACTION).
- AGENTS, doc 08, ORCHESTRATE and NEXT_ACTION are fully equivalent in English and Vietnamese. The sampled pairs (README, CLAUDE, docs 06/09/10, RESUME, FIX_FINDINGS, templates, WP1/WP5 prompts) are equivalent apart from the notes above.
- Known items: (1) the 12 warnings → WF-A-09; (2) the classifier denial was handled correctly: the worker stopped without a workaround; the owner then confirmed directly; the fallback was unused; no permission change was made; (3) the archive plan → WF-A-02.

## Required gates unrun/blocked and why

None of the mandatory checks went unrun. `npm run verify` was not repeated: application source is unchanged and WF-GATE ran it. The WF-CAPS documentation URLs were not re-fetched (this profile has no web tool). Their recorded facts were checked for consistency with doc 08 and the validator.

## Disposition of previous findings

Context only, not a recheck of WF-REVIEW:

- A1–A6, A8–A10 and A12–A14 are addressed by the revision. A9 is addressed through the audited identity reviewed_commit + source_digest.
- A7 (machine-specific tooling) remains partly open as WF-A-08, and A15 is open as WF-A-09.
- The A11 shortcut ("unless already in your context") led to WF-A-07.
- WP1_REVIEW F-01 is unchanged and still open.

## Software readiness, owner permission and pilot result

Unchanged. WP1 is FIX REQUIRED and WP2 has not started. No owner pilot permission was sought, and nothing was sent or deployed.

## One next action

The coordinator registers one bounded workflow-fix task (worker, docs + validator + precommit, with vi pairs) for WF-A-01…WF-A-09, and re-plans the F-01 chain (WF-A-10). Then: freeze commit, verifier gate, and a fresh audit that rechecks these findings on the new digest. The Medium findings must be fixed. Each Low finding must be fixed or explicitly deferred with a recorded decision.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WF-AUDIT attempt 1, board agent ID `a80f8351bbd2fd196`. Authors: `a232a5b7f6cdec442` (WF-REVIEW), `ae6c446dc434f85d6` (WF-IMPL-TOOLING), `afbd2f9ae6ec1fce3` and `ad742f3b42890d674` (WF-IMPL-DOCS), all Sonnet 5.5. The coordinator (main session, Opus 5.5) wrote NEXT_ACTION, STATE and the board. The ffbf8f0 author was a Codex session (its evidence uses Codex runtime paths); its model is not observable.
- Fresh context; confirm reviewer did not author changes: confirmed. This auditor wrote only this report pair, the WF-AUDIT task record and `evidence/WF-AUDIT/`.
- Source digest before/after; gate evidence for that snapshot: before 03d4a6f9…491b. After: see the [task record](tasks/WF-AUDIT.md) Results. WF-GATE PASS on the same digest.
- New report path preserving previous review history: new file; no earlier report changed.
- Finding dispositions and next coordinator fix/recheck task: see "One next action".
