# WP5-UX4-T04-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX4-T04-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX4-T04 (done, with Addendum 1).
- This commit freezes the round-4 server slice:
  - the change-password route and Profile card;
  - the opening balance per F-1 (i) with D-5 a;
  - the 20-preview limit;
  - the holiday-preview counts with an audit event;
  - the shared clock guard;
  - docs/03 and docs/10.
- It also carries the coordinator records since the owner's commit 18c8fd9:
  - the round-4 owner request and answers on the board;
  - the plan WP5-UX4-PLAN and its design folder;
  - the T04 record and evidence;
  - the checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk L.
- Authority: AGENTS.md rule 12, and the docs/08 section "Commits and pushes".
- Branch: main. Expected HEAD = origin/main = 18c8fd916e86bb7f4d302a06813e5e17fdf3c1f0.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- Runtime: the same as `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md` "Runtime", with the
  task folder `D:\.claude-tmp\timesheet\WP5-UX4-T04-FREEZE`.
  - The capitalised rules apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO
    `head` OR `tail`, NO NULL-DEVICE REDIRECTS, NO `rm -r`.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (33 paths: 31 modified, 2 new)

- docs: `docs/03_ARCHITECTURE_AND_DATA.md` and `.vi.md`,
  `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md`.
- client:
  - `src/client/ImportScreen.tsx`, `ProfileScreen.tsx`, `api.ts`, `styles.css`,
    `importModel.ts`, `AdminScreen.tsx`;
  - `src/client/components/HolidayImport.tsx`, `OpeningBalanceForm.tsx`,
    `OpeningBalancePanel.tsx`.
- server:
  - `src/server/auth/sessions.ts`, `src/server/http/schemas.ts`;
  - `src/server/routes/admin.ts`, `routes/auth.ts`;
  - `src/server/services/holidayImport.ts`, `ledger.ts`, `timesheetCommands.ts`,
    `workbookImport.ts`.
- tests:
  - e2e: `tests/e2e/admin.spec.ts`, `import.spec.ts`, `settings-routes.spec.ts`, and
    `profile.spec.ts` (new);
  - integration: `tests/integration/holiday-import.test.ts`, `opening-balance.test.ts`,
    `sharing.test.ts`, `sharing-matrix.test.ts`, `workbook-import.test.ts`, `ot-api.test.ts`,
    and `password-change.test.ts` (new);
  - client: `tests/client/importModel.test.ts`.

If the working tree differs from this set, do not commit: report the exact difference and
stop.

These always stop the commit:
- any migration;
- a `package.json` or lockfile change;
- `scripts/`, AGENTS/CLAUDE files or `.claude/`;
- any other path.

Recompute the digest with Node 24 immediately before `git add`. It must equal
6e9e3001fe1f1ed352f446be19cc07c152d4cb61aa7ab0dce145f1fc6e1f8f41 (835 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified:**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.
- **New:**
  - `handoff/delivery/tasks/WP5-UX4-PLAN.md`;
  - `handoff/delivery/tasks/WP5-UX4-T04.md`;
  - this brief, as it stands before you append results;
  - the folder `handoff/delivery/design/WP5-UX4/`: `mockup.html` and 11 `-synthetic.png`;
  - the folder `handoff/delivery/evidence/WP5-UX4-T04/`: `.txt` and 3 `-synthetic.png`.

Count each folder with Glob. Evidence names must end in `.txt` or `-synthetic.png`; in the
design folder, `mockup.html` is also allowed.

**Other paths under `handoff/`.** If `git status` shows any other modified or untracked
path under `handoff/`, list it by name.
- You may also stage it if it is one of these: `handoff/delivery/STATE.json`,
  `handoff/NEXT_ACTION.md` or `.vi.md`, `handoff/delivery/tasks/WP5-UX3-ACCEPT.md`, or a
  file in `handoff/delivery/evidence/WP5-UX3-ACCEPT/`. These are round-3 records the
  owner's commit may have left out.
- Any other unexpected path stops the commit.

**Privacy.** Run the precommit check.
- A `profile-path` finding in an evidence log may be masked: replace the account segment
  with `<user>`, then re-stage.
- Any other finding stops the commit.

## Checks before committing

Record each exit code in `handoff/delivery/evidence/WP5-UX4-T04-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. The digest (6e9e3001…).
4. `git add` with the explicit paths.
5. `node scripts/precommit-check.mjs`.
6. `git diff --cached --check`.
7. A JSON parse of ORCHESTRATION.json and STATE.json.
8. `validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD.

**Allowed fixes:** trailing whitespace or a blank line at EOF in a task record outside
`evidence/`. A whitespace finding in a source, test or docs file: stop and report.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX4-T04: round-4 server changes from the pilot decisions

- feat(auth): self-service password change (POST /api/auth/password):
  - current-password check with rate limiting;
  - length rules;
  - other sessions revoked;
  - an audit record without secrets;
  - a Change password card on Profile.
- feat(ot): the opening balance starts at 0. The owner sets or corrects it at any time with
  a short reason; evidence is optional; a correction may return it to 0.
- feat(import): at most 20 open import previews per person (409 import_preview_limit).
- feat(admin): the holiday-import preview shows per-date counts again, with no names, and
  each preview is audited (owner decision F-2 b).
- fix(sharing): a shared editor can no longer check the owner in or out through session
  edits (409 shared_clock_action), enforcing F-Q5.
- docs: docs/03 (opening balance rule F-3; privacy exception) and docs/10 (+ vi).
- docs(handoff): round-4 owner request and answers, the WP5-UX4 plan and mockup, the T04
  record and evidence, board and checkpoint (+ vi).

Task: WP5-UX4-T04 (owner answers D-5 a, D-6 a, D-9 b, D-10/F-1 i, D-15/F-2 b)
Gate: pending (round-4 package gate)
Audit: pending (round-4 audits)
Digest: 6e9e3001 (was 507de97c)

## Push and report

Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digests;
- the staged counts per group;
- any extra handoff paths staged;
- every check with its exit code;
- any fix, masking or stop.

## Results

- STOPPED, no commit, no push. HEAD = origin/main = 18c8fd916e86bb7f4d302a06813e5e17fdf3c1f0 (unchanged).
- Digest before add: 6e9e3001fe1f1ed352f446be19cc07c152d4cb61aa7ab0dce145f1fc6e1f8f41 (835 files); matches.
- Staged 70 (33 outside handoff; 37 handoff). No extra handoff paths. No masking.
- precommit-check 0; diff --cached --check 0; JSON parse 0; validate_package --preflight 0.
- validate_orchestration.py exit 1 and check_recovery.py exit 1: "Prompt missing: WP5-UX4-T01"
  (the board's pending task WP5-UX4-T01 names a prompt file that does not exist).
- The 70 paths remain staged. Details in evidence/WP5-UX4-T04-FREEZE/checks.txt.

### Attempt 2

- HEAD before 18c8fd916e86bb7f4d302a06813e5e17fdf3c1f0; after and remote 5a68fba65bac6723ed3e66f33048b722d34c4656; pushed.
- Staged 71 (70 plus WP5-UX4-T01.md). Digest before and after commit: 6e9e3001fe1f1ed352f446be19cc07c152d4cb61aa7ab0dce145f1fc6e1f8f41 (835 files).
- precommit, diff --check, JSON parse, validate_orchestration, check_recovery (106) and preflight all exit 0. No masking.
