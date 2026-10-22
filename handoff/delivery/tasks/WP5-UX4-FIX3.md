# WP5-UX4-FIX3 dispatch brief (owner answers R2 a, R3 b, R5; the hover timeout)

- **Task.** Mission timesheet-software-readiness, task WP5-UX4-FIX3, package WP5, kind fix,
  attempt 1.
  - It implements the owner's 2026-10-21 answers to WP5-UX4-R2-Q (a), WP5-UX4-R3-Q (b) and
    WP5-UX4-R5-Q (see "R5 decision" below). The answers are verbatim in the board
    `owner_decisions`.
  - It also fixes the new real-clock failure that WP5-UX4-REGATE2 found.
  - It depends on WP5-UX4-FIX2-FREEZE.
- **Profile and routing.** timesheet-worker-high (effort high, fixed by the profile);
  requested model sonnet; no override.
  - Routing: size M, risk H (an authorization guard on shared edits), novelty no.
  - Write the task record in English.
- **AGENTS.md on disk wins.** Rules 4 and 8 and the UI section apply.
- **Base.** HEAD = origin/main = 178f1cf8970086018e2e96e8340d911077a2d3ad, or a later commit
  that changes only `handoff/`. The digest is
  1c1c526f3c7748fb108c7f6a535568e510e1d84faf813ef80d49c499a56cdcd0 (850 files). Before you
  edit, record HEAD, `git status --short` and the digest.

## R5 decision

The coordinator fills this in before dispatch:

**R5 = (b).** The owner answered '- R5 b' (board `owner_decisions` 2026-10-21).

**Item 2 (R3 b) is DROPPED from this task.** The owner's round-5 request on the same day
redesigns Review and sign off: the "Days that need attention" checklist moves into a Sign
off confirmation dialog, so the two-column Review layout no longer exists in the target
design. See the 2026-10-21 coordinator decision on the board. Do not change the Review
layout. Ignore item 2 and its acceptance, tests, mutant, docs and screenshots, and leave
`ReviewScreen.tsx`, `ReviewDays.tsx` and `review.spec.ts` untouched.

## Items

1. **R2 (a): an edit grantee may not delete the owner's running session.**
   - **Server.** `DELETE /sessions/:id` (`src/server/routes/api.ts:165` and its service)
     answers 409 `shared_clock_action` when the request comes through a share and the
     session is open (no end). This follows the existing guard in
     `src/server/services/timesheetCommands.ts:444-459`.
     - The owner's own delete is unchanged.
     - A grantee may still delete an ended session, as today.
     - Nothing is written on refusal.
   - **Client.** In a shared edit view, a running session card offers no Delete. Do not
     offer an action that the server refuses. The owner's view is unchanged.
   - **Tests:**
     - integration in `sharing.test.ts` or `sharing-matrix.test.ts`: a grantee deleting a
       running session gets 409 and nothing changes; a grantee deleting an ended session
       gets 200; the owner deleting a running session gets 200; the route inventory is
       unchanged;
     - e2e in `sharing.spec.ts`: no Delete on a running card in the shared view.
     - **Mutant:** remove the server guard.
   - **Docs:** docs/03 (+ vi), where the shared clock guard is described; docs/10 (+ vi),
     a short 2026-10-21 entry for owner decision R2 a; docs/04 (+ vi), the shared view.
2. **R3 (b): Review shows two columns again from 1200px, without overflow.**
   - T01 moved the switch to 1330px because at 1280px the 850px week grid overflowed its
     card beside the checklist.
   - Restore the two-column layout from 1200px by making the parts fit, not by letting the
     grid overflow. Possible means:
     - a narrower checklist column, with its text wrapping;
     - a smaller paper padding on Review in that range;
     - smaller page gutters in that range.

     Measure the room first, then choose the smallest change. Use tokens only (AGENTS UI
     rule 1).
   - **Acceptance** at 1200, 1240, 1280, 1329, 1330, 1440 and 1920, light and dark:
     - two columns;
     - the week grid inside its card (`scrollWidth <= clientWidth`), with no week card
       scrolling sideways;
     - no cell or word wider than its cell;
     - the checklist readable: no clipped word, font size unchanged, radio and checkbox
       targets as before;
     - no page-level horizontal scroll.

     At 1199 and below, one column as before. The paper and its signatures stay as T01 made
     them.
   - **Tests.** Update the containment test that T01 added (Review at 1440, 1330, 1280 and
     1024) to the new widths, including 1200 and 1199. **Mutant:** restore the 1330 switch;
     the test must fail.
   - **Docs:** docs/04 (+ vi) and docs/12 (+ vi): "two columns from 1200px".
   - Put two `-synthetic.png` screenshots in evidence for the owner: Review at 1200 and at
     1280, light.
3. **R5: the classic-scrollbar layout loop, per the decision above.**
   - **If R5 = (a):** no change.
   - **If R5 = (b):**
     - Remove the root `overflow-y: scroll` that FIX2 added.
     - Instead, `useEditorLayout` decides on a width that always subtracts the classic
       scrollbar width. Measure that width once, with an off-screen probe element that has
       `overflow: scroll`; it is 0 with overlay or hidden scrollbars. Then the decision does
       not depend on whether the page scrolls at this moment.
     - **Keep** `tests/e2e/classic-scrollbar.spec.ts`: no layout change during 1.5 s in the
       height band, one change per crossing, and the switch point recorded.
     - **Add** an assertion that a short page with a classic scrollbar draws no vertical
       track: the root's `clientWidth` equals `innerWidth`.
     - **Mutant:** use the live `clientWidth` again; the classic spec must fail.
     - Update docs/04 line 66 (+ vi) and docs/12 (+ vi) to the new wording.
4. **The REGATE2 real-clock failure: `hover.spec.ts:125` on the mobile project**
   ("computed borderTopColor is settled", timeout). It is not a network error.
   - Reproduce: run that test, and the whole `hover.spec.ts`, on the mobile project at least
     30 times (`--repeat-each`), first on the FIX2 build (178f1cf) and then on the FIX1 build
     (0ddfead) for comparison. Record the failure rate of each.
   - Find the cause. Is it a wait shorter than a transition, a race, or a product change
     from FIX2 (for example the root overflow)?
   - Fix it deterministically: in the test if the test is wrong, in the product if the
     product is.
   - Prove it with 30 passes in a row on the final build.

## Checks (in order; verify and the digest are the LAST commands)

1. Put Node 24 first on PATH; run `node --version`. Before any edit: HEAD,
   `git status --short`, `npm run digest`.
2. Record the reproductions on the base: item 1 (the grantee's delete answers 200), item 3
   if (b), and item 4.
3. Implement. Then run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`.
   The build must show no chunk advisory; record the main chunk.
4. Run the integration files `sharing`, `sharing-matrix`, `password-change` and `auth`,
   each once.
5. `classic-scrollbar.spec.ts` with `--repeat-each=5`, and `hover.spec.ts` on the mobile
   project with `--repeat-each=30`, each with 0 failed.
6. The FULL e2e on both projects on the real clock, alone, after the last change, with 0
   failed. Only a network or buffer error may be rerun, once, and both runs are recorded.
7. The mutants of items 1, 2 and 3 (if b), each applied alone and reverted.
8. EN/VI parity of every docs pair you touched, then `validate_package.py --preflight` with
   the workflow Python
   `"$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe"`.
   Write `<user>` in the evidence.
9. Privacy and whitespace checks.
10. `npm run verify` with `SMOKE_PORT` in 49620-49639, and `DATA_DIR` / `DATABASE_PATH` in
    the task folder.
11. `npm run digest` LAST.

**Rules:**
- List every changed assertion with file:line and why it is not a weakening.
- No `skip`, `fixme` or `.only`, except a project-conditional skip with its reason.
- No migration and no dependency change.

## Owned paths

- server: `src/server/routes/api.ts`, `src/server/services/timesheetCommands.ts`
- client:
  - `src/client/components/SessionList.tsx`, `src/client/DayEditor.tsx`;
  - `src/client/ReviewScreen.tsx`, `src/client/components/ReviewDays.tsx`;
  - `src/client/styles.css`;
  - `src/client/components/useEditorLayout.ts`, `src/client/components/editorLayoutModel.ts`
- tests:
  - `tests/client/`;
  - `tests/integration/sharing.test.ts`, `sharing-matrix.test.ts`;
  - `tests/e2e/sharing.spec.ts`, `surfaces.spec.ts`, `review.spec.ts`, `controls.spec.ts`,
    `classic-scrollbar.spec.ts`, `hover.spec.ts`, `day-editor.spec.ts`
- docs: `docs/03_ARCHITECTURE_AND_DATA.md`, `docs/04_UX_AND_SETTINGS.md`,
  `docs/10_DECISIONS_AND_SOURCES.md` and `docs/12_RELEASE_NOTES.md`, each with its `.vi.md`
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX4-FIX3/`

If a change needs any other path, stop and report; do not edit it.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX4-FIX3`. Ports 49620-49639.
- Set TEMP, TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`), NO
  PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/stderr` OR
  `nul`, NO `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
  - Use the Write and Edit tools for files, and Glob and Grep for searches.
  - Redirect output to files in the task folder and read them with Read.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Run npm through that Node, never through the Program Files shim or Node 26.
- You may copy the FIX10 preload and gate scripts from earlier task folders into yours.
  Never write into another task's folder.
- Never touch the data in `%LOCALAPPDATA%\timesheet-dev`. Do not install or change
  dependencies.
- Before returning, confirm that no background task is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit.

## Return

At most 200 words, beginning 'Self-reported model: ...'. Include:
- per item, the cause or change and the proof;
- the files changed;
- the changed assertions;
- unit, integration and full e2e counts per project;
- the repeat counts;
- the mutants;
- the main chunk;
- parity and preflight;
- the verify exit code;
- the final 64-hex digest and file count;
- any stop or deviation.

## Results

- Base: HEAD 178f1cf8970086018e2e96e8340d911077a2d3ad, digest 1c1c526f3c7748fb108c7f6a535568e510e1d84faf813ef80d49c499a56cdcd0 (850 files), node v24.21.0. Evidence in `handoff/delivery/evidence/WP5-UX4-FIX3/`.
- Item 2 (R3 b) is dropped by the coordinator: Review, `ReviewScreen.tsx`, `ReviewDays.tsx` and `review.spec.ts` are untouched.
- Item 1 (R2 a): reproduced on the base (`01-r2-repro-base.txt`: the grantee's delete answered 200). Fixed in `deleteSession` with the existing `assertNoSharedClockAction` guard; `SessionList` takes a `shared` prop and draws no Delete on a running card. Integration test "R2 a" in `sharing.test.ts`; e2e assertions in the edit-share test of `sharing.spec.ts`. Mutants: server guard removed (`06-mutant1-server.txt`, fails), client condition removed (`07-mutant1b-client.txt`, fails).
- Item 3 (R5 b): reproduced on the base (`05-r5-repro-base.txt`: a short page drew a 15px track). `html { overflow-y: scroll }` removed; `useEditorLayout` reads `window.innerWidth` less the probe-measured classic scrollbar width (cached per devicePixelRatio). Mutant "live clientWidth" fails the classic spec (`08-mutant3-r5.txt`).
- Item 4 (hover timeout), cause and fix:
  - Reproduction: `hover differs from rest` (hover.spec.ts:125, 4 situations) 30x on the mobile project: 0 failed of 120 on 178f1cf and 0 of 120 on 0ddfead. The whole `hover.spec.ts` 30x on mobile: 0 of 1050 on each (`14-hover-repro-summary.txt`). The failure did not reproduce in isolation on either build, so it is not a FIX2 product regression (the FIX1 and FIX2 builds behave alike).
  - Cause, from the REGATE2 failure trace (`16-regate2-trace-test-side.txt`, `16-regate2-trace-browser-side.txt`): `settledStyle` of `contrast.ts` runs two reads 400 ms apart inside a 7 s `expect.poll`. In the failing run the browser side finished its 400 ms timer in 403 ms, but the next read reached the browser only 24 s later (the runner side recorded the wait as 24 289 ms; teardown also took 17 s). The worker side stalled for about 24 s (host stall), the 7 s poll limit ran out, and the test failed with "computed borderTopColor is settled". The helper makes the test fragile because it costs about 0.4 s per call (about 12 s per mobile test of a 30 s budget) and any stall over 7 s fails it. The stall itself is environmental and cannot be reproduced on demand; this is the best-supported cause, not a proof of what stalled the host.
  - Fix, in the test only: `hover.spec.ts:100` has its own `settledStyle` that waits on the browser (`getAnimations()` flushes style, awaits each running transition's `finished`, then two animation frames) and reads once; no timer or poll. A mobile run of the first test drops from about 12 s to about 2 s, so the 30 s budget has room for a stall of about 28 s. `contrast.ts` is not an owned path and still has the old helper (other specs call it): flagged for the coordinator.
  - Proof on the final build: whole `hover.spec.ts` on mobile 30x: 1050 passed, 0 failed (`pw-h30`, summarised in `14-hover-repro-summary.txt`); both projects once: 70 passed.
- Files changed: `src/server/services/timesheetCommands.ts`, `src/client/components/SessionList.tsx`, `src/client/DayEditor.tsx`, `src/client/components/useEditorLayout.ts`, `src/client/components/editorLayoutModel.ts` (comment), `src/client/styles.css`; tests `tests/integration/sharing.test.ts`, `tests/e2e/sharing.spec.ts`, `tests/e2e/classic-scrollbar.spec.ts`, `tests/e2e/hover.spec.ts`; docs 03, 04, 10, 12 with their `.vi.md`. `api.ts` needed no change (the guard is in the service). No migration, no dependency change.
- Changed assertions (none weakened):
  - `tests/e2e/classic-scrollbar.spec.ts:89` replaces "the track stays in a window taller than the page (> 0)" by "a short page draws no vertical track (= 0)" (the R5 b requirement) and adds `:91-92`, a 1.5 s watch that the layout stays `floating` at 1340x3000; the layout assertions of the same test are unchanged.
  - `tests/e2e/hover.spec.ts:100`: the local `settledStyle` replaces the import from `contrast.ts`; every hover/contrast expectation is unchanged and all 35 tests per project still pass.
  - Added only: `sharing.test.ts:492` (R2 a, 409 and no write, ended session 200, owner 200); `sharing.spec.ts:432-436` (no Delete on the running card, DELETE answers 409, the session stays).
- Proof:
  - typecheck, lint, `npm test` 97 files and 2227 tests passed; build has no chunk advisory, main chunk `index-bf2IoL5q.js` 489.75 kB (gzip 143.39 kB; the base was 489.31 kB).
  - Integration, each once: sharing 31, sharing-matrix 26 (the route inventory test is unchanged and passes), password-change 7, auth 18, all passed.
  - `classic-scrollbar.spec.ts --repeat-each=5`: 10 passed, 10 skipped (the mobile project skips by design), 0 failed.
  - FULL e2e on both projects, real clock, alone, after the last change: desktop 407 passed, mobile 372 passed, 101 skipped, 0 failed (`17-full-e2e-summary.txt`); no rerun was needed.
  - Mutants, each alone and reverted: server guard removed (integration "R2 a" fails with 200 instead of 409); client Delete condition removed (sharing e2e fails: Delete count 1, expected 0); `viewportWidth` back to the live `clientWidth` (classic spec fails at 1335x1410, the layout changes). The tree was rebuilt after the reverts.
  - EN/VI parity of docs 03, 04, 10 and 12: PASS (`09-parity.txt`); `validate_package.py --preflight` with the workflow Python: PASS (120 translation pairs). Privacy search of the evidence for the user name and mail: empty. `git diff --check`: clean.
  - `npm run verify` (SMOKE_PORT 49621, data in the task folder): exit 0. `npm run digest` LAST: `7af8e935f2c11f05b5c584a0a38da1170aa9826d752ee54434a4a8d2be434949` (850 files).
- Deviations: one empty heredoc (`cat > file <<EOF` with no body) was typed by mistake during the hover work; it wrote nothing of value and no data came through it. The `head` pipe was used once on a listing before I re-read the rules (a directory list, no evidence). Ports: the e2e fixture picks a free loopback port itself; only `SMOKE_PORT` was set (49620 and 49621).

Status: done
