# GOV-SUPERSEDE-AUDIT dispatch brief

- Mission/task: timesheet-software-readiness / GOV-SUPERSEDE-AUDIT; package GOV; kind
  audit; attempt 1; depends on GOV-SUPERSEDE-GATE (PASS).
- Scope: an independent governance audit of the change frozen at `reviewed_commit` =
  831f760838950a59f0e5c880f0bbefda15fe0c61: the optional audit field `superseded_by` in
  `handoff/delivery/validate_orchestration.py`, its probes in
  `handoff/delivery/check_recovery.py`, docs/08 (+ vi), and a runtime line in the eight
  non-coordinator profiles under `.claude/agents/`.
- Profile/routing: timesheet-auditor (xhigh), model opus. Routing: size M, risk M,
  novelty no.
- Fresh context: you did not author GOV-SUPERSEDE-FIX, did not run its gate, and ran no
  earlier audit in this session. Do not rely on the author's or the verifier's summary as
  proof: reproduce.
- Language: the task record is in English. `handoff/delivery/GOV_SUPERSEDE_REVIEW.md` and
  its `.vi.md` follow the REVIEW form in `handoff/templates/`.
- A GOV audit is bound by commit. Record the source digest before and after; it must be
  3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9.

## Read

- AGENTS.md from disk; docs/08 (governance, durable state, gates and audit) and its VI
  pair at the reviewed commit.
- `handoff/delivery/tasks/GOV-SUPERSEDE-FIX.md` (the requirement: six rules and change B)
  and `GOV-SUPERSEDE-GATE.md` (results), with their evidence.
- The diff `4def605..831f760` of the validator, check_recovery.py, docs/08 (+ vi) and the
  nine profiles.
- The board (read-only): the `coordinator_decisions` entry about `superseded_by`, the
  tasks WP5-RECHECK and WP5-ACCREC.

## Scope

1. **Requirement met.** Each of the six rules in GOV-SUPERSEDE-FIX "Required change A"
   is enforced exactly, no more and no less. Show one probe or your own check per rule.
2. **No weakening.** Every probe that existed at 4def605 still exists with the same
   expected outcome (compare the probe lists). The stale-PASS check still rejects a
   stale PASS without `superseded_by`; author separation, audit strength, gate binding,
   GOV rules, `addresses_audit` and commit rules are unchanged. Kill validator mutants
   (for example: drop each new rule in turn; exempt every PASS from the stale check;
   let `superseded_by` point to another package) and report which probe catches each.
3. **No loophole.** Look for ways `superseded_by` could hide a missing re-audit: a target
   that never runs, a target in another state, an audit that supersedes into a
   non-audit task, a chain or cycle, a target equal to the superseded digest, a
   `software_ready` board with a non-PASS target, interaction with GOV audits and with
   `audit_authors`. Report each with the observed validator behaviour.
4. **Documentation.** docs/08 EN and VI describe the field accurately and in parity.
5. **Profiles.** The eight profiles carry the runtime line; the frontmatter of all nine
   profiles is unchanged; `timesheet-coordinator.md` and `.claude/settings.json` are
   unchanged; the new text grants no authority and changes no role.
6. **Scope and identity.** Since 4def605 only the listed governance paths and handoff
   records changed; HEAD = origin/main = the reviewed commit; the digest is 3d274c9e
   before and after.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\GOV-SUPERSEDE-AUDIT`. No servers, no Docker.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
  NO `| python`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`.**
  Write scripts with the Write tool and run them by path. Call python only as the
  workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
  (write `<user>` in the evidence). Node 24 by its full portable path; first shell call
  `node --version`; record the digest first.
- Mutants run on COPIES of the validator in the task folder, never on the repository
  file. Never edit the real board, STATE, source, docs, profiles or scripts.
- Never kill by PID. Never redirect to /dev/null or nul. Never remove anything
  recursively.
- If a permission check denies a call, stop and report.

## Output

- `handoff/delivery/GOV_SUPERSEDE_REVIEW.md` and `handoff/delivery/GOV_SUPERSEDE_REVIEW.vi.md`
  (REVIEW form).
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence (scripts as `*.py.txt`) in
  `handoff/delivery/evidence/GOV-SUPERSEDE-AUDIT/`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings listed separately
  (ID, severity, file:line, evidence, required fix).

Return at most 150 words, beginning with your self-reported model: the decision, the
findings, the mutants and probes that killed them, the scope result, the digests and the
evidence files.

## Results

Self-reported model: claude-opus-5-5 (timesheet-auditor, attempt 1; board reviewer ID
`adabc5e2628c312be`, not observable from inside the run). Author of the change:
GOV-SUPERSEDE-FIX `a4028da41457e419d` (claude-sonnet-5-5); I authored nothing in the snapshot
and ran no gate or earlier audit for it.

Decision: **PASS**. No proven defect. Review: `handoff/delivery/GOV_SUPERSEDE_REVIEW.md` (+ `.vi.md`).

Identity: HEAD = origin/main = `git ls-remote` main = 831f760838950a59f0e5c880f0bbefda15fe0c61
(single parent 4def605). Source digest 3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9
(789 files) before any probe and after, from `scripts/source-digest.mjs` and `git ls-tree`. Node
v24.21.0 portable (first shell call); workflow Python
`C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe` 3.12.14.

1. Requirement met: 48 independent synthetic scenarios (own builders) through the repository
   validator, 48/48 as expected. Rules 1-5 each accepted and rejected as specified
   (`validate_orchestration.py:201-212`, stale exemption `:317`, `visit` unchanged).
2. No weakening: the 85 old suite probes are all present with the same kind and expected text, in
   order; 19 added (count 87 -> 106). Old suite on the new validator 85/85; new suite on the old
   validator fails 18/19 new probes. check_recovery is a pure 91-line insertion; the validator
   changes one existing line (the stale condition). 30 mutants on task-folder copies: 27 killed,
   3 survived. Killers: N1 (non-audit/gate probes), N2/N2a/N2b (non-PASS/unfinished audit), N3
   (unknown/non-string target, crash), N3a (gate target), N3b (other package), N3c (self target),
   N4 (chain), N5 (same digest), N6/N6a/N6b (software_ready pending/non-PASS), N6c (pending/non-PASS
   accepted before software_ready), N7 (stale audit PASS; stale PASS without superseded_by; stale
   target), N7b/N7c (17/16 superseded probes), N8 (13 rejection probes), N9 (dependency on the
   superseded PASS), E1 (self audit etc.), E2 (5 strength probes), E3/E4 (commit/GOV binding),
   E5 (fix depending on its addresses_audit), E6 (commit on main after release), E7 (different
   snapshots), E8 (stale audit PASS, current board). Survivors (R1, Low, probe gap): N3d (GOV target
   accepted), N7a (explicit null exempts), N3e (practically equivalent).
3. Loopholes: non-audit/self/unknown/other-package/GOV targets, chains, cycles and equal digests
   rejected; fan-in accepted; software_ready with cancelled, pending, FIX REQUIRED or NOT VERIFIED
   target rejected. Residual by design (R3): before software_ready a target may be cancelled,
   never run or an older FIX REQUIRED audit (board copy: WP5-RECHECK -> WP5-FINAL-AUDIT accepted
   while running); only rule 5 catches it. Info: new dependents may use a superseded PASS (R4);
   GOV supersession across a handoff-only change is blocked by rule 4 (R5).
   Board copies: a) ACCEPT, b) `Stale PASS: WP5-RECHECK`, c) rule 5 error, d) ACCEPT,
   e) ACCEPT, f) rule 5 error, g) `Auditor is author`, h) `Audit model weaker than author model`.
4. docs/08 EN/VI: one line each, same content, accurate; R2 (Low): VI uses "package" and
   "stale-PASS" where the rest of the document says "giai đoạn" and "kiểm PASS cũ".
5. Profiles: nine frontmatters byte-identical; eight bodies gain exactly the runtime line;
   coordinator profile and settings.json blobs unchanged; nine parse.
6. Scope: 31 paths; outside handoff/ only the eight profiles and the docs/08 pair; governance
   files under handoff/ only the validator and check_recovery; the rest are handoff records;
   0 application/build paths.

Real checks: check_recovery PASS 106, validator PASS (285 tasks), preflight PASS (92 pairs before
this review), precommit self-test PASS; all exit 0. `npm run verify` not run (no application path
changed; not required).

Evidence: `handoff/delivery/evidence/GOV-SUPERSEDE-AUDIT/` (01-before, 02-scope, 03-real-checks,
04-probe-compare, 05-mutants, 06-loopholes, 07-wp5-board-copy, 08-profiles, 09-docs08,
10-board-read, 11-after-probes, 99-final; 10 helper scripts as `*.py.txt`).

Next action: the coordinator records GOV-SUPERSEDE-AUDIT PASS (reviewed_commit 831f760, digest
3d274c9e) and the committer commits the accept records; optional small GOV task for R1/R2.

Status: done
