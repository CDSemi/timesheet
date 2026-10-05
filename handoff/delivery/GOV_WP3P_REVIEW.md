# Independent review

- Package/date/reviewer and observable model/effort: GOV (governance change: the WP3 scope and gate sentences in the WP3 prompts); 2026-10-05 (UTC); task GOV-WP3P-AUDIT attempt 1, reviewer agent `aa78670760adbe556` (board record); self-reported model `claude-opus-5-5`; effort requested xhigh on the board, actual effort not observable. The reviewed author, WP3-DOC worker `a3f90533c00057935`, used `claude-sonnet-5-5` (board, self-reported), so the reviewer model is not weaker.
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness: `da6d0cdd2d20b6ffabb18f4cfaf7d8ad72951c0d` (GOV-WP3P-FREEZE, equal to the GOV-WP3P-GATE `freeze_commit`, `origin/main` and `git ls-remote origin refs/heads/main`); parent `cb9800e4cfef57786c2e69bb4fd78d245ab5c817`. Source digest `4d4c4863cd6b61d63236927d5c77c6ea132edcf8d8d940789ecb61904918078f` (679 files, handoff/ excluded), equal to the expected value, before and after. No unpushed commit. Working-tree changes are under handoff/delivery/ only (board, checkpoint pair, GOV-WP3P briefs and evidence); the governance and docs paths equal the freeze commit.
- Decision: PASS / FIX REQUIRED / NOT VERIFIED: **PASS**.
- Scope actually inspected/executed:
  1. Mirror and fidelity: the WP3_IMPLEMENT scope (line 17) and gate (line 21) sentences and the WP3_REVIEW gate sentence (line 17), EN and VI, compared byte for byte with docs/09 lines 33 and 37 (EN and VI) at the freeze commit, and with the parent versions (`git show cb9800e:<path>`); then checked against the owner decisions of 2026-10-04 in docs/10 (lines 123–135) and the board `owner_decisions` (read-only), and against docs/01, 02, 03, 04, 05 and 06 where those decisions land.
  2. EN/VI equivalence of each added clause.
  3. Governance: every changed line of the four prompt files; the docs/08 governance-path list across the commit; AGENTS.md rules 1, 3, 4, 6, 8, 13 and docs/08.
  4. Gate coverage: each required WP3 gate item in each of the four gate lines, and the parent gate clause kept verbatim.
  5. `validate_orchestration.py`, `check_recovery.py` and `validate_package.py --preflight` with the workflow Python (Python 3.12.14).
- Evidence table: command | result/exit | evidence:

| Command | Result/exit | Evidence |
|---|---|---|
| `git rev-parse HEAD`, `git status --porcelain`, `git rev-parse origin/main`, `git ls-remote origin refs/heads/main` | HEAD da6d0cd = origin = remote; changes under handoff/delivery/ only; exit 0 | `evidence/GOV-WP3P-AUDIT/before.txt` |
| `git ls-tree -r … HEAD \| grep -v '^handoff/' \| LC_ALL=C sort \| sha256sum`; `npm run digest` (Node 24.21.0 by full path) | 4d4c4863…078f (679 files) both; exit 0 | `before.txt`, `after.txt` |
| `git diff --name-status cb9800e da6d0cd`; outside handoff/delivery/ | only the four WP3 prompt files; exit 0 | `gov-paths.txt` |
| `git diff --name-only cb9800e da6d0cd \| grep -E '<other docs/08 governance paths>'` | no match; exit 1 | `gov-paths.txt` |
| `git diff --check cb9800e da6d0cd` | no output; exit 0 | `gov-paths.txt` |
| `git diff --quiet da6d0cd -- handoff/prompts docs handoff/templates AGENTS.md CLAUDE.md .claude .agents` | exit 0 (working tree equals the freeze) | `gov-paths.txt` |
| `git grep` for stale "pending-review disclosure / pending review remains visible / auto-sign" in prompts, templates, docs/09 | no match; exit 1 | `gov-paths.txt` |
| `git grep -l 'auto-image on/off\|ảnh tự động bật/tắt'` outside handoff/delivery | docs/09 EN/VI and the four prompts only (no other gate copy); exit 0 | `gov-paths.txt` |
| `<workflow-python> mirror-check.py <project> da6d0cd cb9800e` | 6 × MATCH (scope and gates, EN and VI, equal to docs/09:33/37); only lines 17/21 and 17 changed; pure insertions; exit 0 | `mirror.txt`, `mirror-check.py.txt` |
| `<workflow-python> gate-coverage.py <project> da6d0cd cb9800e` | all 13 items present in all four gate lines; parent clause kept verbatim; exit 0 | `gate-coverage.txt`, `gate-coverage.py.txt` |
| `<workflow-python> handoff/delivery/validate_orchestration.py` | PASS, 9 profiles, 133 tasks, 1 active; exit 0 | `validate-orchestration.txt` |
| `<workflow-python> handoff/delivery/check_recovery.py` | PASS, count 82, board not modified; exit 0 | `check-recovery.txt` |
| `<workflow-python> handoff/delivery/validate_package.py --preflight` | PASS, 58 translation pairs, 1078 local links, 91 scenarios; exit 0 | `preflight.txt` |
| Reading: EN/VI parity and owner-decision mapping | see the tables | `analysis.txt` |

- Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix: **No proven defect.** What was checked:
  - Scope 1 (mirror and fidelity). With the label ("Scope: ", "Required gate: ", "Phạm vi: ", "Gate bắt buộc: ") removed, each of the six sentences is byte-identical to docs/09 line 33 or 37 in the same language. Against the parent, the change only inserts text. The scope sentence gains "Add owner-granted timesheet sharing with per-item toggles and the admin status boundary." The gate gains "; AC-16, the automatic note line and image options, outgoing automatic submissions without an automatic indicator, empty-period automatic submission and admin status without timesheet details" after "both Sundays". Nothing was removed. Each added clause traces to a recorded owner decision and its canonical text: F-1 to AC-07; F-Q1/F-Q2 and G-Q1 to AC-07, docs/05:24 and D-09; F-3/F-Q3 to docs/01:37, docs/03:34 and AC-01; F-3/F-Q4/F-Q5 to FR-17, docs/03:31 and AC-16. F-5 is already covered by AC-10 inside "AC-06–AC-10". No clause states a requirement that is absent from the canonical documents or the decisions, so rule 8 is respected.
  - Scope 2 (EN/VI). Every added clause has the same meaning in Vietnamese (table B in `analysis.txt`). The VI lines are byte-identical to docs/09.vi.
  - Scope 3 (governance). In each file only the scope/gate lines changed, with the same line counts as before. The Operator, Read, checkpoint, delivery, Task boundary and Audit boundary lines are byte-identical to the parent. No other docs/08 governance path changed in the commit. "All sending stays dry-run/capture." is kept as the last sentence, in line with AGENTS rules 3 and 6 and docs/08. Nothing touches roles, routing, authority or commit rules, and nothing conflicts with AGENTS.md or docs/08 (see R1 on rule 4).
  - Scope 4 (gate coverage). Each gate line still names AC-06–AC-10 and AC-14, the deadline/manual race, auto-image on/off, interrupted/uncertain send, duplicate jobs, private downloads, visual PDF evidence including both Sundays and dry-run/capture only. Each now also names AC-16, the note line and image options, no automatic indicator on outgoing submissions, empty-period submission and the admin status boundary. This holds in all four files.
  - Scope 5 (validators). All three exit 0.
- Risks and optional improvements, separate from proven defects:
  - R1 (information): AGENTS rule 4 says "Enforce ownership on all data/file actions. Keep PDFs, signatures and tokens private." The new scope adds owner-granted sharing that can include final PDF downloads. This is not a contradiction. Access is still decided by the owner and checked on each action ("ownership or an active grant of sufficient scope", docs/03:38). Signature image files and tokens are never shared (AC-16), and PDFs stay private, not public. Optional, for a later GOV change: add "or an owner-granted share item" to rule 4 (EN and VI) to prevent a literal misreading.
  - R2 (low, pre-existing, not introduced here): neither docs/09:37 nor the mirrored gate names F-2 (pending deficit line, docs/02:56), F-4 (one activation instant, docs/05:26) or the G-Q2 rendering of {SignOffStatus} (docs/04:52). They fall under the existing scope items "deficit choices" and "activation boundary" and under documents in the prompts' Read list, and the earlier gate did not name them either. Neither the WP3 implementer nor the WP3 auditor should leave them untested. Optional: name them in a future docs/09 revision and mirror that revision through a GOV cycle.
  - R3 (information, translation polish): VI "tình trạng admin không có chi tiết timesheet" could be read as "the admin's own status". The VI scope line ("ranh giới tình trạng cho admin") makes the meaning clear, and the text mirrors docs/09.vi:37 verbatim. Optional: "tình trạng cho admin …" in docs/09.vi first, then in the prompts.
  - R4 (information): WP3-REQ2 item 22 said to "append" the gate clause. The author put it before "All sending stays dry-run/capture." and recorded this as a deviation. docs/09 and the prompts are identical, and the dry-run sentence stays last and unqualified, so no action is needed.
  - R5 (information): the prompts' Read list omits docs/01 (FR-17) and docs/10 (owner decisions). The sharing and admin rules are present in docs/03, 04, 05 and 06, which are listed. No action is needed.
- Required gates unrun/blocked and why: none of the required checks was skipped. `npm run verify` was not rerun because this brief does not require it and the digest is unchanged; GOV-WP3P-GATE recorded exit 0 on the same digest and commit.
- Disposition of previous findings: none. This is the first audit of this governance change.
- Software readiness, owner permission and pilot result separately: this is a governance review only. It makes no software-readiness claim, gives no owner permission for real sending or deployment, and reports no pilot result.
- One next action/prompt: the coordinator records GOV-WP3P-AUDIT PASS (reviewed_commit da6d0cd) and lets timesheet-committer commit the accept records; R1–R3 can join the governance backlog.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: GOV-WP3P-AUDIT attempt 1; reviewer `aa78670760adbe556`; author WP3-DOC `a3f90533c00057935` (it wrote the four prompt edits). The committer of GOV-WP3P-FREEZE and the GOV-WP3P-GATE verifier were not treated as authors; the coordinator wrote only the briefs.
- Fresh context; confirm reviewer did not author changes: fresh context; the reviewer authored no change in the reviewed snapshot. Author and gate reports were treated as claims and re-executed.
- Source digest before/after; gate evidence for that snapshot: 4d4c4863cd6b61d63236927d5c77c6ea132edcf8d8d940789ecb61904918078f before and after, with HEAD da6d0cd before and after. Gate evidence: `handoff/delivery/evidence/GOV-WP3P-GATE/checks.txt` (PASS, freeze_commit da6d0cd).
- New report path preserving previous review history: `handoff/delivery/GOV_WP3P_REVIEW.md` and `.vi.md` (new files); earlier reviews are untouched. Evidence: `handoff/delivery/evidence/GOV-WP3P-AUDIT/`.
- Finding dispositions and next coordinator fix/recheck task: no fix is required. R1–R3 are optional; R4 and R5 need no action.
