# WP5-CALDEF-ACCEPT-REVIEW dispatch brief (documentation review-and-fix of the accept step)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-ACCEPT-REVIEW, package WP5,
  kind documentation, attempt 1. It depends on WP5-CALDEF-DOCFIX, WP5-CALDEF-ACCEPT-HANDOFF,
  WP5-CALDEF-SAMPLES (PASS; the pilot samples regenerated from b810ba9) and
  WP5-CALDEF-ACCEPT-PACKET (with its Addendum 1).
- **Why.** AGENTS rule 14 and document 08 ("Documentation and workflow tooling", "Review and
  fix"): documentation needs no gate or audit. It needs one review by a fresh worker that
  did not write it, with fixes, so that it is current and consistent. This is that review
  for every documentation change of the WP5 accept step after WP5-CALDEF-AUDIT.
- **Profile and routing.** timesheet-worker (medium), requested sonnet, no override. Routing:
  size M, risk M, novelty no.
  - You wrote none of these changes. Treat every statement as a claim to check.
  - You are the only writer while you run.
  - Task record in English.
- **AGENTS.md on disk wins.** Read it first, and document 08 "Documentation and workflow
  tooling".

## What to review

**Outside `handoff/` (uncommitted, WP5-CALDEF-DOCFIX).** See
`git diff -- . ':!handoff'` against HEAD b810ba9. The files:

- `docs/03_ARCHITECTURE_AND_DATA.md` and `.vi.md` (line 24, F-CALDEF-1);
- `docs/12_RELEASE_NOTES.md` and `.vi.md` (lines 7 and 63, F-CALDEF-2);
- `README.md` and `README.vi.md` (lines 3 and 12);
- `DEVELOPMENT.md` and `DEVELOPMENT.vi.md` (line 3).

**Under `handoff/` (uncommitted):**

- `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`: the new section "Re-acceptance after the
  calendar-default round (WP5-CALDEF, R-UX5I2-3)" and the clauses added to older text
  (WP5-CALDEF-ACCEPT-HANDOFF);
- `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md` (WP5-CALDEF-ACCEPT-PACKET).

**Sources.**

- The board `handoff/delivery/ORCHESTRATION.json` (read only).
- The task records `handoff/delivery/tasks/WP5-CALDEF-*.md` and their evidence, including
  `evidence/WP5-CALDEF-SAMPLES/samples/sample-index.txt` and `samples-compare.txt` for every
  sample file name, number and SHA-256 the packet states.
- The reviews `WP5_CALDEF_REVIEW.md`, `WP5_UX5_REVIEW_INT3.md` and `WP5_UX5_RECHECK_RN.md`.
- The code at HEAD (`src/`, `tests/`, `migrations` or schema files) for every statement about
  the product.

## Checks

1. **F-CALDEF-1 against the code.** The worker restored "notes, confirmation, optimistic
   version" in the `timesheets/day_entries` row as a54061f had it. It then reported that
   `day_entries` has no "confirmation" column; there is conflict confirmation and
   `work_sessions.breaks_confirmed`.
   - Read the schema and the code. Decide what "confirmation" refers to in this row.
   - If it is untrue of `day_entries`, fix the row in EN and VI with the smallest wording
     that is true. The row must not lose a true fact.
   - This is a correction of a documentation slip, not a behaviour change. If the only true
     fix would alter a behaviour statement of docs/03, stop and report it.
2. **Facts.** Check every SHA, digest, file count, gate result, audit decision, finding ID,
   risk ID, test count and task name the changed text states. Check them against the board
   and the records.
   - The accepted identity is b810ba942c608e058bd8c146de6f076734c48bf2 /
     59e2ec3f22d951366d4a54d0564ed2731d3b4f8c1fa90bc1cfbea10ebf0d770a (885 files).
   - No document outside `handoff/` may state a digest.
   - Nothing may state the SHA or digest of the accept commit, which does not exist yet.
3. **Consistency.** The packet, the handoff section, docs/12 (lines 7, 60 to 63), README,
   DEVELOPMENT and STATE (`handoff/delivery/STATE.json`, read only) must say the same about
   these:
   - the identity;
   - the gates and the audit;
   - R-UX5I2-3 closed;
   - the optional risks R-CALDEF-1..4, the 2.05:1 boundary and F2;
   - the release rule.

   Also:
   - The packet's link to the handoff section must resolve to an existing heading.
   - docs/12's link must target the handoff file in the matching language.
4. **Nothing stale.** No sentence presents these as current:
   - a54061f / 690fd8fd;
   - WP5-UX5-RECHECK-RN or REGATE16;
   - R-UX5I2-3 as open;
   - "when its gate and audit pass".
5. **EN/VI.** The same facts, IDs, SHAs, hashes and links, with Vietnamese that says the same
   thing. Every link target exists.
6. **No private data.** Placeholders stay placeholders. There are no real addresses, host
   names or personal data, no email address except `@example.invalid`, and no profile path.

**Fix** every discrepancy in the files listed above, with the smallest edit. Record each fix
in the evidence: file, line, before, after and source. If a fix would need a change in
another file, do not make it; report it.

## Hard limits

- **Change only:**
  - the twelve files listed above;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-CALDEF-ACCEPT-REVIEW/` (masked LF `.txt`).
- **Do not change** the board, STATE, NEXT_ACTION or the checkpoint. Never edit `src/`,
  `tests/`, `scripts/`, `assets/`, `.claude/`, `.agents/`, package or config files.
- **Git.** Do not commit or push. Run no git command that changes the index or the working
  tree.
- **Shell.** Use Git Bash only.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
    `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout`, `/dev/stderr` OR `nul` (ALSO NOT
    IN `2>`), NO `rm -r`, NO `sed -i`, NO PID KILLS, NO GIT CONFIGURATION CHANGES.**
  - Use the Write, Edit, Glob and Grep tools.
- **Task folder:** `D:\.claude-tmp\timesheet\WP5-CALDEF-ACCEPT-REVIEW`. Set TEMP and TMP to
  it. Put Node 24 first on PATH before any node or npm call.
- If a permission check denies a call, stop and report.

## Final checks

1. **Preflight.** `python handoff/delivery/validate_package.py --preflight` with the workflow
   Python
   (`$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`;
   a scratch `tzdata` on `PYTHONPATH` outside the repository if needed) must exit 0. Write
   `<user>` in the evidence.
2. **Git status.** `git status --short --untracked-files=all -- . ':!handoff'` lists only the
   eight documentation files above.
3. **`npm run digest`.** Record the final digest and file count (885 expected). The
   coordinator writes it into the board's `non_product_since_acceptance` record.

## Return

Return at most 150 words, beginning with "Self-reported model: ...". Include:
- the number of facts checked;
- the 'confirmation' answer;
- each discrepancy found and fixed;
- anything reported but not fixed;
- the parity result;
- the preflight exit code;
- the git status list;
- the final digest and file count.

Append the same to Results, ending with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5

- Facts checked: about 60 (identity, digests, counts, gate and audit results, finding, risk and task IDs, six PDF hashes, file names, links).
- 'confirmation': `day_entries` has no such column (`0001_initial.ts:143-158`; only `work_sessions.breaks_confirmed` exists). Removed from the row in docs/03 EN and VI ("notes, optimistic version"). No behaviour statement changed.
- Fixed: (1) docs/03:24 EN and VI; (2) WP5_HANDOFF EN and VI line 414 notes the correction; (3) the same files line 428 (stale "next is PACKET"); (4) packet EN and VI line 396 (claim that section 3 cites the dist comparison).
- Reported, not fixed: docs/12 holds the historic digest `1e59ad31...` of `8e99d2c` (pre-existing, not the accepted identity).
- Parity: tokens, SHAs, links equal EN/VI; 0 missing link targets; heading quotes resolve.
- Preflight exit 0. Git status: the eight documentation files only.
- Final `npm run digest`: 52ec1fc748fa1e8eabd63d628abee9c1c77666a24ebf250ef66c26d1dd96dc07 (885 files).
- Evidence: `handoff/delivery/evidence/WP5-CALDEF-ACCEPT-REVIEW/10-fixes-and-checks.txt`.

Status: done
