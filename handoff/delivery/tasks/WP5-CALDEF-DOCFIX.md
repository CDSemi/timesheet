# WP5-CALDEF-DOCFIX dispatch brief (documentation fixes after the WP5-CALDEF-AUDIT PASS)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-DOCFIX, package WP5, kind
  documentation, attempt 1. It depends on WP5-CALDEF-AUDIT (PASS on b810ba9 / 59e2ec3f).
- **Why.** The audit passed and closed R-UX5I2-3. It left two Low documentation findings,
  F-CALDEF-1 and F-CALDEF-2 (`handoff/delivery/WP5_CALDEF_REVIEW.md`, "Findings"). The release
  documents must also stop saying that this change waits for its gate and audit.
- **Rule.** AGENTS rule 14 and document 08, "Documentation and workflow tooling". These are
  documentation changes: no freeze, gate or audit. A fresh worker reviews and fixes them
  afterwards (WP5-CALDEF-ACCEPT-REVIEW).
  - F-CALDEF-1 changes docs/03, a behaviour document. It is in scope only because it restores
    three facts that the round deleted by mistake: the round changed none of them, and the
    code still has them. It adds no behaviour (coordinator decision 2026-11-03). If you find
    that a fix would add, remove or alter a behaviour, do not make it; report it.
- **Profile and routing.** timesheet-worker (medium), requested sonnet, no override. Routing:
  size S, risk L, novelty no. You are the only writer of files outside `handoff/`.
  - It runs beside WP5-CALDEF-ACCEPT-HANDOFF, which owns `handoff/delivery/WP5_HANDOFF.md`
    and `.vi.md`. Do not touch those files.
  - Task record in English.
- **AGENTS.md on disk wins.** Read it first.

## Accepted identity (verify on the board before you rely on it)

- Accepted source: b810ba942c608e058bd8c146de6f076734c48bf2, digest
  59e2ec3f22d951366d4a54d0564ed2731d3b4f8c1fa90bc1cfbea10ebf0d770a (885 files).
- Gate: WP5-CALDEF-REGATE PASS (scoped), carrying forward WP5-CALDEF-GATE on 300d61f.
- Audit: WP5-CALDEF-AUDIT PASS. It supersedes WP5-UX5-RECHECK-RN (a54061f / 690fd8fd).
- The WP5 handoff gets a new section with this exact title (written by the parallel task):
  "Re-acceptance after the calendar-default round (WP5-CALDEF, R-UX5I2-3)".

## Changes

1. **F-CALDEF-1.** `docs/03_ARCHITECTURE_AND_DATA.md:24` and `.vi.md:24`, the
   `timesheets/day_entries` row.
   - Restore "notes, confirmation, optimistic version" (VI "ghi chú, xác nhận, phiên bản
     chống sửa đè"), as they were at a54061f (`git show a54061f:<path>`).
   - Keep the round's "category source (…)" addition after them, joined by one comma.
   - Remove the ", ," artefact.
   - Check each restored fact against `src/` (the `day_entries` columns, the optimistic
     version) and cite the files in the evidence.
2. **F-CALDEF-2.** `docs/12_RELEASE_NOTES.vi.md:63`: link the Vietnamese text "bàn giao WP5"
   to `../handoff/delivery/WP5_HANDOFF.vi.md`, as lines 7 and 19 of the same file do.
3. **docs/12 EN/VI, the round's acceptance.**
   - Line 63 says acceptance "is recorded in the WP5 handoff when its gate and audit pass".
     Make it state the fact: the change was gated by WP5-CALDEF-REGATE, audited by
     WP5-CALDEF-AUDIT, and re-accepted WP5. The record is in the WP5 handoff.
   - Line 7 names the acceptances of the earlier rounds. Add one sentence for this round, in
     the same style: the gate and audit names and the short accepted commit `b810ba9`.
     - Write no digest. docs/12 forbids writing the digest of the tree that holds it.
     - Do not write that a documentation-only commit followed unless you can state it
       truthfully. The accept commit that will carry these fixes does not exist yet.
4. **README and DEVELOPMENT, EN and VI.**
   - README lines 3 and 12 say WP5 was "re-accepted after UI change rounds 1 to 5". Add the
     calendar-default change (R-UX5I2-3) in the fewest words.
   - Read DEVELOPMENT line 3. If it states the acceptance status, make it say the same.
5. **Stale-status search.**
   - Search README, DEVELOPMENT and every `docs/**/*.md` with its `.vi.md`.
   - Search for: `R-UX5I2-3`; "when its gate and audit pass"; "not accepted"; "pending";
     "awaiting"; "open owner decision"; `a54061f`; `690fd8f`; `RECHECK-RN`.
   - Fix each hit that presents this round as unaccepted, or a54061f as the current
     acceptance. Leave history as history.
   - List every hit in the evidence, with what you did and why.

## Hard limits

- **Change only these files:**
  - `docs/03_ARCHITECTURE_AND_DATA.md` and `.vi.md`;
  - `docs/12_RELEASE_NOTES.md` and `.vi.md`;
  - `README.md` and `README.vi.md`;
  - `DEVELOPMENT.md` and `DEVELOPMENT.vi.md`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-CALDEF-DOCFIX/` (LF `.txt`).

  If the search shows a needed change in any other file, do not make it; report it.
- Never edit `src/`, `tests/`, `scripts/`, `assets/`, `.claude/`, `.agents/`, package or
  config files.
- Do not change the board, STATE, NEXT_ACTION, the checkpoint, the WP5 handoff or the pilot
  packet.
- Do not commit or push. Run no git command that changes the index or the working tree
  (`git show`, `git diff` and `git status` are fine).
- **Shell.** Use Git Bash.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
    `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout`, `/dev/stderr` OR `nul` (ALSO NOT
    IN `2>`), NO `rm -r`, NO `sed -i`, NO PID KILLS, NO GIT CONFIGURATION CHANGES.**
  - Edit with the Write and Edit tools; search with Glob and Grep.
- **Task folder:** `D:\.claude-tmp\timesheet\WP5-CALDEF-DOCFIX`. Set TEMP and TMP to it. Put
  Node 24 first on PATH before any node or npm call.
- **Private data.** Never write a profile path (use `<user>`), and no email address except
  the full synthetic `@example.invalid` form.
- If a permission check denies a call, stop and report it.

## Checks

1. `python handoff/delivery/validate_package.py --preflight` with the workflow Python
   (`$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`;
   if it lacks a time-zone database, put a scratch `tzdata` outside the repository on
   `PYTHONPATH` and say so). It must exit 0. Write `<user>` in the evidence.
2. **EN/VI parity** of each pair you changed: the same facts, IDs, SHAs and links. Every link
   target exists.
3. `git status --short --untracked-files=all -- . ':!handoff'` lists only the files you
   changed, from the list above.
4. `npm run digest`: record the new digest and file count (885 expected).

## Return

Return at most 150 words, beginning with "Self-reported model: ...". Include:
- each change, as file:line;
- the search hits and what you did with them;
- anything reported but not changed;
- the parity result;
- the preflight exit code;
- the git status list;
- the new digest and file count.

Append the same to Results, ending with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5

- Changes: docs/03_ARCHITECTURE_AND_DATA.md:24 and .vi.md:24 (restored notes, confirmation,
  optimistic version; ", ," removed); docs/12_RELEASE_NOTES.md:7,63 and .vi.md:7,63 (acceptance
  sentence with WP5-CALDEF-REGATE, WP5-CALDEF-AUDIT, `b810ba9`; stale "when gate and audit pass"
  replaced; VI link to WP5_HANDOFF.vi.md); README.md and .vi.md:3,12; DEVELOPMENT.md and .vi.md:3
  (added R-UX5I2-3).
- Search hits: only docs/12:63 was stale; rest are history or unrelated. No a54061f, 690fd8f,
  RECHECK-RN, "not accepted" hits. Details in evidence/WP5-CALDEF-DOCFIX/search-and-checks.txt.
- Reported, not changed: day_entries has no "confirmation" column (conflict confirmation and
  work_sessions.breaks_confirmed exist); wording restored as a54061f had it.
- Parity: EN/VI aligned; preflight exit 0 (143 pairs, 2539 links).
- git status outside handoff: DEVELOPMENT(.vi).md, README(.vi).md, docs/03(.vi).md, docs/12(.vi).md.
- Digest: c0852196759ee3cec9a4d93ee97fabef4bf403215be1fd7e47f9039aa4d8e52a, 885 files.

Status: done
