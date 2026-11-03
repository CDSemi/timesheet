# WP5-CALDEF-ACCEPT dispatch brief (accept commit after the calendar-default round, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-ACCEPT, package WP5, kind
  commit, attempt 1. It depends on WP5-CALDEF-ACCEPT-REVIEW.
- **What it commits.**
  - The WP5 re-acceptance on b810ba9 / 59e2ec3f: the records of WP5-CALDEF-REGATE and
    WP5-CALDEF-AUDIT, with the review pair `WP5_CALDEF_REVIEW`.
  - The documentation fixes after it, under AGENTS rule 14: WP5-CALDEF-DOCFIX, reviewed and
    fixed by WP5-CALDEF-ACCEPT-REVIEW.
  - The WP5 handoff and the pilot packet.
  - The mission records.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk L (Markdown outside `handoff/` and records under `handoff/`; no merge
  expected).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes"; the owner allows pushes
  to main. Create no tag. Never amend, force-push or rewrite history.
- **Runtime.** As in `handoff/delivery/tasks/WP5-CALDEF-FIX2-FREEZE.md` ("Runtime": the rules
  in capitals, staging, no git configuration change, the workflow Python). Task folder:
  `D:\.claude-tmp\timesheet\WP5-CALDEF-ACCEPT`.
- **The coordinator writes no file while you run.**
- **Confirmed at dispatch** (filled in by the coordinator from the REVIEW Results):
  - D_PRE: `52ec1fc748fa1e8eabd63d628abee9c1c77666a24ebf250ef66c26d1dd96dc07` (885 files), the
    final digest of WP5-CALDEF-ACCEPT-REVIEW.
  - The net paths outside `handoff/`, eight modified, no untracked file:
    - `README.md` and `README.vi.md`;
    - `DEVELOPMENT.md` and `DEVELOPMENT.vi.md`;
    - `docs/03_ARCHITECTURE_AND_DATA.md` and `docs/03_ARCHITECTURE_AND_DATA.vi.md`;
    - `docs/12_RELEASE_NOTES.md` and `docs/12_RELEASE_NOTES.vi.md`.
  - The board carries `non_product_since_acceptance` (base b810ba9 / 59e2ec3f, head D_PRE)
    and `current_source_digest` = D_PRE. `validate_orchestration.py` reads them.
  - `check_recovery.py` must report 141 probes.

## Steps

1. **Check the starting point.**
   - Run `node --version`. It must print v24.x.
   - HEAD must be b810ba942c608e058bd8c146de6f076734c48bf2.
   - Run `git fetch origin`. origin/main must still be b810ba9.

   If either check fails, stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty.
3. **The working tree outside `handoff/`.** `git status --short --untracked-files=all -- .
   ':!handoff'` must show exactly the eight confirmed paths. Anything else stops the commit.
4. **D_PRE.** Run `npm run digest`. It must equal the D_PRE confirmed above.
5. **Stage these:**
   - **the eight confirmed paths;**
   - **the mission records** (those that changed):
     - `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
   - **the WP5 documents, each with its `.vi.md`:** `handoff/delivery/WP5_CALDEF_REVIEW.md`,
     `handoff/delivery/WP5_HANDOFF.md` and `handoff/delivery/WP5_PILOT_PACKET.md`;
   - **every changed or untracked brief** under `handoff/delivery/tasks/`. Expected:
     - WP5-CALDEF-FIX2-FREEZE (its Results);
     - WP5-CALDEF-REGATE and WP5-CALDEF-AUDIT;
     - WP5-CALDEF-DOCFIX, -ACCEPT-HANDOFF, -ACCEPT-PACKET, -SAMPLES and -ACCEPT-REVIEW;
     - this brief.

     List them in `checks.txt`.
   - **every new or changed folder under `handoff/delivery/evidence/` since b810ba9,** staged
     as directories. Expected:
     - `WP5-CALDEF-FIX2-FREEZE/`, `WP5-CALDEF-REGATE/` and `WP5-CALDEF-AUDIT/`;
     - `WP5-CALDEF-DOCFIX/`, `WP5-CALDEF-ACCEPT-HANDOFF/`, `WP5-CALDEF-ACCEPT-PACKET/`,
       `WP5-CALDEF-SAMPLES/` (with its `samples/` subfolder and `-synthetic.png` renders) and
       `WP5-CALDEF-ACCEPT-REVIEW/`.

   **Expected leftovers.** The four known untracked files stay out:
   - `WP5-UX5-DIAG6/new-proc-detail.txt`;
   - `WP5-UX5-REGATE7/10-census-sample1.txt`;
   - `WP5-UX5-REGATE8/log-chain1.log`;
   - `WP5-UX5-REGATE8/log-master.log`.

   If any other changed path appears, list it and stop. List every staged path group in
   `checks.txt`, with a count.
6. **Run steps 6 to 9 of the WP5-CALDEF-FIX2-FREEZE brief** over the staged evidence folders,
   with the same allowed edits:
   - owner process details: read every census or process file, including the `*.sh.txt` and
     `*.mjs.txt` census scripts;
   - file types and names;
   - the key and PEM scan, and the email and Message-ID scan;
   - `node scripts/precommit-check.mjs`.
7. **Run these checks, with the workflow Python for the validators:**
   - `validate_orchestration.py --non-product-staged`: PASS, listing only the eight confirmed
     paths;
   - `git diff --cached --check`;
   - a JSON parse of ORCHESTRATION.json and STATE.json;
   - `validate_orchestration.py`;
   - `check_recovery.py` (141 probes);
   - `validate_package.py --preflight`.

   Any failure stops the commit. If a validator stops on a board or brief issue, list every
   error you can see. Do not edit the board.
8. **Commit on main, then run `git push origin main`.** The push must fast-forward the remote
   from b810ba9. Record the remote SHA. It must equal HEAD.
9. **After the push:**
   - `validate_orchestration.py --non-product-range b810ba9..HEAD`: PASS;
   - HEAD's digest, in the `git ls-tree` form and by `npm run digest`, must equal D_PRE.
10. **Write the outputs.**
    - Write `checks.txt` and `commit-message.txt` in
      `handoff/delivery/evidence/WP5-CALDEF-ACCEPT/`.
    - Write a short Results section here.
    - Leave all of these unstaged.

## Commit message (refine with the commit-message skill; keep the facts from the Results)

Subject: Accept WP5 after the calendar-default round (R-UX5I2-3) on b810ba9

- docs(handoff): WP5-CALDEF-REGATE passed on b810ba9 / 59e2ec3f. It was scoped after the
  tests-only fix: `dist/` is identical to 300d61f, and the real-clock FULL run and six sweeps
  had 0 failures. The fresh opus WP5-CALDEF-AUDIT passed on the same snapshot and closed
  R-UX5I2-3. It supersedes WP5-UX5-RECHECK-RN. The commit adds the review pair, the WP5
  handoff section, the pilot packet refresh, the pilot samples regenerated from b810ba9
  (WP5-CALDEF-SAMPLES; content equal to REGATE15's once the per-run submission ID is
  normalised), the board, STATE, the checkpoint and NEXT_ACTION (+ vi).
- docs: the audit's two Low documentation findings, under AGENTS rule 14:
  - F-CALDEF-1: the `day_entries` row of docs/03 EN/VI (the lost facts restored; the
    review also removed "confirmation", which `day_entries` does not have);
  - F-CALDEF-2: the Vietnamese handoff link in docs/12.

  It also adds the round's acceptance to docs/12, README and DEVELOPMENT (EN/VI). These are
  reviewed by WP5-CALDEF-ACCEPT-REVIEW, with no gate or audit.

Task: WP5-CALDEF-DOCFIX, reviewed by WP5-CALDEF-ACCEPT-REVIEW; WP5 accept after WP5-CALDEF-FIX2
Gate: WP5-CALDEF-REGATE PASS on b810ba9
Audit: WP5-CALDEF-AUDIT PASS on b810ba9 / 59e2ec3f
Digest: D_PRE (documentation after the accepted 59e2ec3f)

## Report

Append briefly:
- HEAD before and after the commit;
- the commit SHA, the push result and the remote SHA;
- D_PRE and the HEAD digest;
- the staged counts per group;
- any unstaged, masked or converted file, with its reason;
- every check, with its exit code.

Return at most 80 words, beginning 'Self-reported model: ...', with the full commit SHA.

## Results
