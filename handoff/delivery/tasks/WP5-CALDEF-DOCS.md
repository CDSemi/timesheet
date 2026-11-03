# WP5-CALDEF-DOCS dispatch brief (canonical documents for the changed-default notice)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-DOCS, package WP5, kind
  documentation, attempt 1, depends on WP5-CALDEF-FIX (done). You are the only source writer.
- **Why.** The owner's answer to R-UX5I2-3 changes product behaviour, so its documents ship
  with the code task (AGENTS rule 14): they are frozen with the code, gated and audited. You
  write them against the code as built, not against the plan.
- **Owner decision (2026-11-02, verbatim on the board under `owner_decisions`):**
  "R-UX5I2-3: nếu giá trị mặc định đã đổi thì hiện thông báo, để người dùng quyết định save
  (ghi đè) hay update theo giá trị mặc định mới". Translation: if the default value has
  changed, show a notice so that the person decides whether to save (overwrite) or to update
  to the new default.
- **Profile and routing.** timesheet-worker (medium), requested sonnet, no override. Size S,
  risk M (canonical business documents), novelty no. Task record in English; the documents
  keep their `.vi.md` pairs aligned.
- **State.** HEAD = origin/main = 5b2f287. The working tree holds WP5-CALDEF-FIX's 21
  uncommitted source and test paths (digest 1b40bf8a, 885 files) and uncommitted coordinator
  records under `handoff/`. Leave all of them alone. Do not stage or commit.

## Read

- `AGENTS.md` (rules 1, 4, 8, 14).
- The code as built: `handoff/delivery/tasks/WP5-CALDEF-FIX.md` (Results) and the changed
  files (`git diff` outside `handoff/`). Where the Results and the code disagree, the code
  wins; report the disagreement.
- The plan items D1-D6: `handoff/delivery/evidence/WP5-CALDEF-PLAN/plan.txt`, and their
  corrections: `handoff/delivery/evidence/WP5-CALDEF-PLAN-REVIEW/review.txt` section 6.7 and
  the docs/10 wording correction (a no-entry overwrite by a client without the field is
  audited with before = null).
- Board `coordinator_decisions` 2026-11-02 (the notice scope, the optional field).
- `docs/12_RELEASE_NOTES.md` line 7 (the release rule) and the style of its existing entries.

## Edit (each with its `.vi.md`, same meaning, same structure)

1. D1 `docs/02_TIME_AND_OT_RULES.md` R-03: the calendar default versus the person's saved
   category, and the rule that a changed default is decided by the person before it is
   overwritten.
2. D2 `docs/03_ARCHITECTURE_AND_DATA.md` `day_entries` row: the category source.
3. D3 `docs/03` "API and hosting boundary": the optional `default_category`, the 409
   `default_changed` rule (MF1: refused only when the saved category also differs from the
   current default), an omitted field and explicit entries not checked, the PUT and batch
   commit orders, the batch preview status.
4. D4 `docs/04_UX_AND_SETTINGS.md` "Day editor": the notice, its two buttons, what each does,
   focus.
5. D5 `docs/04`: one clause each in the switching bullet, the label picker bullet and the
   "Change several days" sentence (closing a preview that holds stale or changed-default
   entries offers "Reload period").
6. D6 `docs/10_DECISIONS_AND_SOURCES.md`: a new owner-decision section: the verbatim
   sentence, its translation, the scope reading (MF1, Day editor notice, picker and batch
   reload flow), the optional field with its reason, and the accurate audit statement.
7. D7 `docs/12_RELEASE_NOTES.md`: one entry for this change in the existing style; no commit
   SHA or digest in the text (line 7 rule).
8. Optional: one acceptance line in `docs/06_TEST_AND_ACCEPTANCE.md`, only if the document
   lists comparable behaviours.
9. Only if a line becomes untrue because of this change: `README.md`, `DEVELOPMENT.md` (and
   their `.vi.md`). Otherwise do not touch them.

Do not edit the pilot packet, the WP5 handoff or any `handoff/` record: the coordinator's
accept step does that.

## Writable paths

`docs/02_TIME_AND_OT_RULES.md`, `docs/03_ARCHITECTURE_AND_DATA.md`,
`docs/04_UX_AND_SETTINGS.md`, `docs/06_TEST_AND_ACCEPTANCE.md`,
`docs/10_DECISIONS_AND_SOURCES.md`, `docs/12_RELEASE_NOTES.md`, `README.md`,
`DEVELOPMENT.md`, each with its `.vi.md`; this brief's Results;
`handoff/delivery/evidence/WP5-CALDEF-DOCS/`.

## Self-check before you report (record command, exit code and counts)

- Every new statement checked against the code (file:line in your Results).
- EN/VI parity of every edited pair; links resolve.
- `python handoff/delivery/validate_package.py --preflight`: exit 0, with its counts.
- No private data, no real names; synthetic examples only.
- `git status --short` outside `handoff/`: the fix's 21 paths plus exactly your edited
  documents.
- `npm run digest`: the new digest and file count.

## Results

(worker appends here: edits per item with file:line, code facts checked, disagreements
found, checks with exit codes, final digest, slips)

Worker: self-reported model claude-sonnet-5-5 (timesheet-worker, 2026-11-03). Evidence: `handoff/delivery/evidence/WP5-CALDEF-DOCS/`
(01-parity-links, 02-code-facts, 03-preflight, 04-git-status-outside-handoff, 05-diff-check, 06-digest). Nothing was staged or committed; no
source, test or shared record was edited.

### Edits (each EN with its `.vi.md`, same structure)

- D1 `docs/02_TIME_AND_OT_RULES.md` R-03: one new paragraph after the Off-label sentence (default versus saved category; a changed default is
  decided by the person; no refusal when the category saved equals the new default).
- D2 `docs/03_ARCHITECTURE_AND_DATA.md` table row `timesheets/day_entries` (line 24): the category source (`default` / `explicit`; who writes which;
  a holiday import writes no row).
- D3 `docs/03` "API and hosting boundary": new paragraph after the routes paragraph (line 58): optional `default_category`, the MF1 rule, 409
  `default_changed` and its body, PUT order, the no-entry/stale case, batch preview status and `can_commit`, batch commit order, acknowledgement,
  audit statement (create over a no-entry day: before = null), optional by decision.
- D4 `docs/04_UX_AND_SETTINGS.md` "Day editor": new bullet after "Order" (notice text, placement, focus, the two buttons and Tab order, what each does,
  status text, stale precedence, hint kept, what is never refused).
- D5 `docs/04`: one clause in the switching bullet (line 69), one in the "Category in the cell" bullet (line 80), one in the "Change several days"
  sentence of the Toolbar bullet (line 63).
- D6 `docs/10_DECISIONS_AND_SOURCES.md`: new last section "Owner decisions - 2026-11-02 (WP5-UX5, a calendar default that changed under an open
  editor, R-UX5I2-3)": verbatim sentence, translation, rule, scope reading (labelled a coordinator decision the owner may veto), MF1, optional field,
  audit statement, no data change.
- D7 `docs/12_RELEASE_NOTES.md`: one entry after round 5 ("WP5 change, a calendar default that changed under an open editor"); no SHA or digest;
  acceptance is stated as recorded in the WP5 handoff when the gate and audit pass.
- Optional `docs/06`: AC-05 row extended with one clause (the existing comparable behaviour: holiday import). README and DEVELOPMENT not touched (no
  line became untrue; DEVELOPMENT's 409 list says "stale_version/immutable/conflict" and stays correct).

### Code facts checked (02-code-facts.txt)

`schemas.ts:91,102,123` optional nullable field in both strict schemas; `timesheetCommands.ts:302-312` rule (field present, entry absent or source default,
current known, sent != current, saved != current), `:358-365` order for the no-entry branch (version, then default), `:405-407` update branch;
`timesheets.ts:252` `calendarDefaultOn`; `http/errors.ts:39-` message and details; `dayEntries.ts:125-135` preview status/error, `:182` `can_commit`,
`:222-232` commit order (stale, invalid, reason, default_changed, conflicts); `DayFieldsForm.tsx:81` focus and scroll, `:158` status text,
`:177-189` notice markup, buttons and labels, `:221` hint; `TimesheetScreen.tsx:482-483` commit 409 handled as stale, `:538-541` reload offered for moved
dates; `BatchDialog.tsx:12,93`; `dayModel.ts:150`. Exact quotes of the notice and status texts were copied from the code.

### Disagreements between the fix's Results and the code

None found on any statement used. Differences to the plan (code wins, docs follow the code): the status line after "Use" reads "Category set to {new},
the calendar default now. Nothing needs saving." (or "... Save day fields to keep your other changes."), not the plan's "Not saved yet."; "Save anyway"
success moves focus to the Category select.

### Checks

- EN/VI parity of the 6 pairs (headings, bullets, table rows equal; line-count offsets between EN and VI identical to HEAD; 12 equal) and every local
  link of the 12 files resolves: exit 0 as run by my script, 01-parity-links.txt (its "MISMATCH" lines are only the raw line counts, whose pre-existing
  offsets are unchanged; its final exit line is 1 for that reason, the rest of the check is clean: no BROKEN line).
- `python handoff/delivery/validate_package.py --preflight`: first run exit 1 (host Python has no tz database: ZoneInfoNotFoundError
  America/Los_Angeles, not caused by the change); rerun with `PYTHONPATH` to a scratch `tzdata` install outside the repository: exit 0, PASS, 142
  translation pairs, 2538 local links, 91 scenarios (03-preflight.txt).
- `git diff --check -- docs`: exit 0. `git status --short` outside `handoff/`: the fix's 21 paths plus exactly the 12 document files above (33 lines).
- `npm run digest`: `81f9cc3b59762db67b14b24ca3bd1328e4644cf2d70a02c7b64e07de120a3a3f  (885 files, handoff/ excluded)` (the fix alone was 1b40bf8a, 885
  files; the docs are inside the digest). No process started and left running.

### Slips

- 01-parity-links.txt ends with `exit 1` because my script compared raw line counts; the real parity metrics pass (explained in the file).
- A first heredoc script of mine had no terminator and failed before running anything; no file was changed by it.
- A stray `python -` in my own append command waited on stdin; I stopped that one python.exe by its process id (started by me) and the append then completed once. No process of mine remains.
