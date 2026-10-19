# Independent review

- Package/date/reviewer and observable model/effort: GOV (owner answer WP5-UX3-Q7: the owner's new AGENTS.md text, with the owner's two edits, and the AGENTS.vi.md translation); 2026-10-19T19:00Z to 19:20Z (UTC); task WP5-UX3-GOV2-AUDIT attempt 1, reviewer agent `a425d954ed94e4526` (board); self-reported model `claude-opus-5-5`; effort xhigh requested by the profile, actual effort not observable. The direct author WP5-UX3-GOV2 (`af5bf8a7f6d5d5e58`) used `claude-sonnet-5-5`; the base text is the owner's own. The strongest actual model on the board is `claude-opus-5-5` (90 opus, 318 sonnet, 1 haiku; `models.txt`), so the reviewer is not weaker than any author.
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness: `ceb86b6b18bd0e8fabd93f47672cd87f3899b92f` (WP5-UX3-GOV2-FREEZE; parent `a78ada5edbf5339d4502df57e9f195d11c0b5d28`), equal to `git ls-remote origin refs/heads/main`. Source digest `b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48` (833 files, handoff/ excluded) from `scripts/source-digest.mjs` and from the `git ls-tree` form; it equals the WP5-UX3-GOV2-GATE digest. No unpushed commits. Working-tree changes are under handoff/ only (coordinator records, freeze and gate evidence, this brief); `git status --short -- . ':!handoff'` is empty. Governance range `a78ada5..ceb86b6`.
- Decision: PASS / FIX REQUIRED / NOT VERIFIED: **PASS**.
- Scope actually inspected/executed:
  1. Owner fidelity. The owner's pre-edit text was rebuilt from the worker's captured diff (`owner-diff.txt`, index `2b33ed9..e8af2a2`) applied to `a78ada5:AGENTS.md`. Two independent proofs: its blob id is `e8af2a26a9c4fe4c7d7258ebbd1ded1969ab2a4b`, and putting that blob into the a78ada5 tree list gives `54cb9a3dbfab3b07…d7d110` (833 files), the working-tree digest that the board's WP5-UX3-Q7 record and the GOV2 brief name. The rebuilt text was then compared line by line and word by word with `ceb86b6:AGENTS.md`.
  2. Every candidate phrase was searched with `git grep` on ceb86b6, across all tracked paths outside handoff/ plus `handoff/prompts` and `handoff/templates`.
  3. Consistency of the new title paragraph, "Operating Contract" and "Prime Directive" with:
     - items 1-13;
     - docs/08 (authority and roles, dispatch, gates and audit, governance scope, commits);
     - CLAUDE.md and CLAUDE.vi.md;
     - `handoff/prompts/` (ORCHESTRATE, the WPn prompts);
     - the eight `.claude/agents` profiles;
     - the commit-message skill;
     - docs/agents/domain.md.
  4. EN/VI translation, sentence by sentence, with a script for headings, levels, code tokens, numbers, bullets, block quote, hard line break and bold markers. The script also checks that both files are byte-equal to a78ada5 after the "Project instructions" heading.
  5. Scope, format and validators, all run by the reviewer.
- Evidence table: command | result/exit | evidence (all under `handoff/delivery/evidence/WP5-UX3-GOV2-AUDIT/`):

| Command | Result/exit | Evidence |
|---|---|---|
| `git rev-parse HEAD`; `git status --porcelain`; `node --version`; `node scripts/source-digest.mjs`; `git ls-tree` digest (before) | HEAD ceb86b6; only handoff/ paths changed; v24.21.0; b35dddd5… (833 files) both ways; exit 0 | `digest-before.txt` |
| `patch -p1 < owner-diff.txt` on `a78ada5:AGENTS.md`; `git hash-object`; a78ada5 tree list with the owner's blob, `sha256sum` | patch exit 0; blob e8af2a26…; digest 54cb9a3d… (833 files), matching the recorded working-tree digest; a78ada5 itself gives d1d903cf…; the blob is not in the object store (`cat-file` exit 128, as expected for an uncommitted edit) | `owner-text.txt`, `owner-diff.txt`, `owner_text.sh.txt` |
| `diff -u` and `git diff --no-index --word-diff` of the owner's text against ceb86b6:AGENTS.md | exactly 4 hunks: runbook line; "architecture-aware, and shop-floor aware" became "and architecture-aware"; "CI run, " removed; "CI evidence" became "recorded evidence"; the list became "a concept or dependency" (re-wrapped); exit 1 (differences shown) | `owner-text.txt` |
| `git grep` on ceb86b6 for every candidate phrase | listed below under owner fidelity; exit 0 | `candidates.txt`, `candidates.sh.txt` |
| `git diff --name-only a78ada5..ceb86b6 -- . ':!handoff'`; the same restricted to the docs/08 governance paths | AGENTS.md, AGENTS.vi.md only (both lists); exit 0 | `checks.txt` |
| `git diff --check a78ada5..ceb86b6` | no output; exit 0 | `checks.txt` |
| `<python> -I text_checks.py` (reads `git show` blobs) | 35 checks, 0 failed: no BOM, no CR, one final LF, 0 trailing-whitespace lines, valid UTF-8 (both files); the working tree equals ceb86b6 for the pair; only the heading level changed (`#` to `##`) and every line after it is byte-equal to a78ada5 (37 lines each, EN and VI); the VI preface is unchanged; the owner text with exactly the 5 replacements equals ceb86b6; 9 headings at equal levels in the same order; equal code tokens (`.vi.md`, `.<lang>.md`), numbers (none), 14 bullets, 2 quote lines, 1 hard break, 2 bold markers; none of the 10 removed phrases in either file; exit 0 | `checks.txt`, `text_checks.py.txt` |
| first run of the same script | stopped at a Vietnamese print through the cp1252 console encoding (a defect in the reviewer's own script); fixed with `sys.stdout.reconfigure`, then rerun in full | `checks-run1-aborted.txt` |
| `<python> handoff/delivery/validate_package.py --preflight` | PASS, 114 pairs, 2258 links, 91 scenarios; exit 0 | `checks.txt` |
| `<python> handoff/delivery/validate_orchestration.py` | PASS, profiles 9, tasks 419, active 2; exit 0 | `checks.txt` |
| `<python> handoff/delivery/check_recovery.py` | PASS, count 106, board not modified; exit 0 | `checks.txt`, `check-recovery.txt` |
| `git grep` for precedence and language rules in CLAUDE.md, docs/08, prompts, profiles, docs/agents; the commit-message skill; line lengths and `.editorconfig` | listed under consistency; exit 0 | `consistency.txt` |
| board actual-model count | opus 90, sonnet 318, haiku 1; coordinator claude-opus-5-5; exit 0 | `models.txt` |
| digest after (same commands as before), `git status --porcelain`, `git ls-remote origin refs/heads/main` | HEAD ceb86b6; b35dddd5… (833 files) both ways; status unchanged; remote ceb86b6; exit 0 | `digest-after.txt` |
| final run after writing this review pair, the Results and the evidence: preflight, validate_orchestration, CR and trailing-whitespace scan, digest | preflight PASS (115 pairs with this pair, 2259 links); orchestration PASS; no CR in any written file, trailing blanks only in the diff context lines of `owner-diff.txt` and `owner-text.txt`; HEAD ceb86b6, b35dddd5… (833 files); exit 0 | `final-checks.txt` |

- Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix: **No proven defect.** Checked:
  - Owner fidelity (the owner's words: "(a) và sửa cho khớp quy ước .vi.md (xóa các cụm từ ko liên quan như “shop-floor”, “step type”, “probe kind”, “manifest key”..."):
    - The added title, precedence paragraph, every other sentence and the heading levels are the owner's text unchanged. The only edits are the five replacements above (proof in `owner-text.txt`, `text_checks.py` section 4).
    - Runbook line (AGENTS.md:13): it now follows the repository convention. `docs/11_OPERATIONS_RUNBOOK.md` and `docs/07_DEPLOYMENT_AND_OPERATIONS.md` each have a `.vi.md` beside them; `docs/runbooks/` does not exist; README.md:5 states the same convention. Correct.
    - "shop-floor aware" removed (AGENTS.md:18): this is what the owner named, and the sentence stays grammatical. Correct.
    - "step type", "probe kind", "manifest key": named by the owner; removal is correct. "task mode": 0 hits in the repository, so it is a foreign phrase covered by the owner's "...". Removal is correct.
    - "template variable": not named by the owner, and it does exist here (docs/04 line 100 has a closed set of email variables and "Reject unknown variables"; also `tests/domain/email-template.test.ts:45`). But the owner explicitly named "manifest key", which also exists here: the backup "manifest key allowlist" (`tests/integration/backup.test.ts:593`, `scripts/container-drill.mjs:7`). So the owner judges these list items by their origin (the source project's extension points), not by whether the word appears in this repository. Removing the whole list is the faithful reading, so this is no finding; see R1.
    - CI removal (AGENTS.md:30 and 39): accepted.
      - The repository has no CI: no `.github/`, no CI configuration. Gates are local verifier runs (docs/08 "Gates and independent audit").
      - The only project mention, DEVELOPMENT.md:54 ("never set in development, tests or CI"), is a precaution, not a CI system.
      - "command, build, test, … validation" still covers any check.
      - "CI evidence" became "recorded evidence". This adds the word "recorded" to the owner's text (the minimal deletion would leave "evidence"). It is neutral and matches item 5 and the evidence practice in docs/08 (R6).
    - Kept phrases are all used in this project, so keeping them is correct:
      - "host check": the drill's host checks at `scripts/container-drill.mjs:676` and `:1238`, and the host steps in docs/11;
      - "deployment", "migration", "release": docs/07, the DB migrations, docs/12 release notes;
      - "public APIs": the API contracts of item 1;
      - "README guidance": README.md and DEVELOPMENT.md;
      - "skill's output contract": `.agents/skills`;
      - "ADR": the "Domain docs" line;
      - "recoverability": `handoff/templates/CHECKPOINT.md`;
      - the generic words.
    - "production accuracy" is the one borderline phrase that was kept (R2).
  - Consistency (no contradiction found):
    - "Communicate in the requester's language" (AGENTS.md:9) and item 1, "Discuss progress (chat) in Vietnamese": they agree in practice. The owner, the only human requester, writes Vietnamese. Coordinator briefs are English, and subagent results are English by item 1 and the profiles (R3).
    - "Use English for … commit messages" agrees with the commit-message skill (`.agents/skills/commit-message/SKILL.md:186`: "Write in English unless the user requests another language"). The last 30 commit subjects are all English (`consistency.txt`).
    - Precedence clause (AGENTS.md:3-5):
      - CLAUDE.md and CLAUDE.vi.md only import AGENTS.md and keep Claude-specific additions there.
      - Every WPn prompt says "Follow AGENTS", and ORCHESTRATE acts "under AGENTS.md and document 08".
      - Items 3, 12 and 13 defer to docs/08 for routing, commits and roles. No docs/08 or prompt rule conflicts with the new bullets.
      - "Unless the owner explicitly overrides" matches the docs/08:7 authority split.
    - "State a concise plan before large … changes" asks the agent to state a plan, not to wait for approval. "Ask only when a missing decision blocks correct or safe progress; otherwise make the safest minimal assumption and proceed" matches docs/08:7: routine choices are authorized; business exceptions, real sending or deployment and secrets stay with the owner. It also matches ORCHESTRATE step 6, "proceed automatically", and item 8, "do not silently change business behavior".
    - "add a concept or dependency without an ADR" (AGENTS.md:43-44): `docs/adr/` does not exist, but docs/agents/domain.md:11 says it is created lazily when a decision is resolved, so the rule names when to create the first ADR. It is not a contradiction (R4).
    - No new bullet changes who commits (item 12, docs/08 "Commits and pushes"), who writes state (docs/08:7 and 40), or the gate and audit rules.
  - Translation:
    - AGENTS.vi.md:3-46 renders every added sentence faithfully, in the same order, at the same heading levels, with the same code tokens and list lengths. The lists hold 9, 6, 4 and 8 items in both languages.
    - Lines 48-84 (items 1-13, "Agent skills" and the UI section) are byte-equal to a78ada5 apart from `#` becoming `##`.
    - Terms follow existing VI usage: "chủ dự án" appears in docs/10 VI and reference/inputs/README.vi.md; "runbook" in docs/07 VI and docs/09 VI.
  - Format: LF, no BOM, one final newline, no trailing whitespace in both files. Two lines are longer than the owner's wrap: EN line 13 has 117 characters and line 44 has 104. `.editorconfig` sets no limit, and items 1-13 run up to 443 characters, so this is no defect.
- Risks and optional improvements, separate from proven defects:
  - R1 (low, owner-facing note): two of the removed list items do exist in this project:
    - "template variable": docs/04 line 100, `tests/domain/email-template.test.ts:45`, `tests/integration/submission-settings.test.ts:389`;
    - "manifest key": `tests/integration/backup.test.ts:593`, `scripts/container-drill.mjs:7`.

    The removal stands on the owner's words, as explained under owner fidelity. The GOV2 brief's stated premise ("keeps only the items that exist in this project") is wrong for both items, and the worker's Grep covered neither. Optional: in the Vietnamese progress note, tell the owner that, if they want the ADR rule to guard email template variables or backup manifest keys, a later GOV change can add them back. The generic "concept" already arguably covers them.
  - R2 (low): "production accuracy" (AGENTS.md:20; VI:21 "độ chính xác production") is kept.
    - In its source text it may be shop-floor wording.
    - Here it reads validly as the accuracy of results from the "one production calculation engine" (item 2).
    - The owner did not name it, and "nothing else changes" favours keeping it.
    - Optional owner check.
  - R3 (low, wording): AGENTS.md:9 "Communicate in the requester's language" and item 1 / the prompts' "Communicate in Vietnamese" (`handoff/prompts/WP*_IMPLEMENT.md:5`, `ORCHESTRATE.md:31`) agree today. For a requester who does not write Vietnamese, though, the file defines no order between the general bullet and item 1. Optional: "…; item 1 sets the chat language for this project".
  - R4 (low, wording): AGENTS.md:43-44 needs an ADR for any new "concept" or dependency. This project records its decisions in docs/10 and in the board's `owner_decisions`, and `docs/adr/` (like GLOSSARY.md, already in the governance backlog) does not exist yet. An agent may read "concept" broadly and stop a routine slice to write ADRs, or duplicate docs/10. Optional: say when an ADR is needed, or point to docs/10.
  - R5 (low, wording): AGENTS.md:25-26 "Explicit user requirements may revise repository conventions … update shared guidance" does not mention the docs/08 GOV chain or owned paths. It says "user" where the precedence clause says "owner". A subagent could read it as permission to edit governance paths outside its brief. docs/08:40 and :64 remain explicit, so there is no contradiction.
  - R6 (information): "recorded evidence" (AGENTS.md:39) is the worker's wording, not the owner's. Item 5's "A reported result is not independent proof" still governs audits.
  - R7 (information, records): The worker Results and the board decision say "0 hits for CI", which is inaccurate. DEVELOPMENT.md:54 and DEVELOPMENT.vi.md:54 mention CI, and several skills do. The GOV2 brief also said "`docs/adr/` exists here", which is false; the worker noted the absence. Neither error changes the outcome.
  - R8 (information, translation polish):
    - AGENTS.vi.md:17 drops "matching" ("các bản dịch `.<lang>.md` tương ứng hiện có").
    - VI:31 renders "validation" as "xác nhận"; "kiểm tra hợp lệ" would be closer.
    - The meaning is preserved in both cases.
  - R9 (operational): this reviewer's session-injected AGENTS.md is the owner's unedited text (blob e8af2a2: `docs/runbooks/vi/`, "shop-floor aware", "CI run", the five-item list), not ceb86b6. Agents dispatched in this session receive that stale copy. The profiles say to read AGENTS.md from disk. Briefs should say that the on-disk text at ceb86b6 replaces any injected copy, or the coordinator should restart the client, as in GOV_UX3_REVIEW R3.
- Required gates unrun/blocked and why: none of the mandatory checks (brief item 5) was skipped. No e2e suite or `npm run verify` was run, as the brief instructs, because WP5-UX3-REGATE2 runs in parallel on the same commit. WP5-UX3-GOV2-GATE recorded verify exit 0 on the same digest.
- Disposition of previous findings: none for this change. GOV_UX3_REVIEW R6 (GLOSSARY.md and `docs/adr/` absent) still holds and is now also touched by the Prime Directive (R4).
- Software readiness, owner permission and pilot result separately: this is a governance review only. It makes no software-readiness claim, gives no owner permission for real sending or deployment, and reports no pilot result. The WP5 regate, rechecks and AUDIT-INT on ceb86b6 are separate.
- One next action/prompt: the coordinator records WP5-UX3-GOV2-AUDIT PASS (reviewed_commit ceb86b6, digest b35dddd5) and continues the WP5 chain on ceb86b6. It mentions R1 and R2 to the owner in the Vietnamese progress note and adds R3-R5 and R8 to the governance backlog.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX3-GOV2-AUDIT attempt 1; reviewer `a425d954ed94e4526` (board). Author: WP5-UX3-GOV2 `af5bf8a7f6d5d5e58`, editing the owner's own text. The committer WP5-UX3-GOV2-FREEZE `a7363d5f342103ff7` and the verifier WP5-UX3-GOV2-GATE `af069fb5f257f61c1` were not treated as authors.
- Fresh context; confirm reviewer did not author changes: fresh context, not forked from an implementer. The reviewer authored no change in the reviewed snapshot or in any WP5-UX3 task. The worker and verifier reports were treated as claims, and their checks were rerun.
- Source digest before/after; gate evidence for that snapshot: b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48 (833 files) before and after, with HEAD ceb86b6 before and after. Gate evidence: `handoff/delivery/evidence/WP5-UX3-GOV2-GATE/checks.txt` (PASS, freeze_commit ceb86b6).
- New report path preserving previous review history: `handoff/delivery/GOV_UX3_REVIEW2.md` and `.vi.md` (new files); GOV_UX3_REVIEW and earlier reviews are untouched. Evidence: `handoff/delivery/evidence/WP5-UX3-GOV2-AUDIT/`.
- Finding dispositions and next coordinator fix/recheck task: no fix is required for the reviewed snapshot. R1 and R2 are owner-facing notes. R3-R5 and R8 are optional governance-backlog wording. R6 and R7 are information. R9 is operational, for briefs or a client restart.
