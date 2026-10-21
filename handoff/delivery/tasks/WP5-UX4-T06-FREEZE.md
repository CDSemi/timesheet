# WP5-UX4-T06-FREEZE dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX4-T06-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX4-T06 (done, after Addendum 1).
- **What this commit freezes.** The round-4 documentation and pilot packet:
  - docs/01, 03, 04, 05, 07, 10, 11 and 12 (+ vi);
  - the D-1..D-15 answer table;
  - D-8 wording, pinned by one new integration test.

  It completes the round-4 source. The round-4 package gate follows.
- **Coordinator records it also carries:**
  - the T05-FREEZE results and evidence;
  - the D8-DIAG record and evidence;
  - the T06 record and evidence;
  - the board and the checkpoint pair.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no model override.
  Routing: size M, risk L.
- **Authority.** AGENTS.md rule 12 and the docs/08 section "Commits and pushes". Every path
  you may stage is listed in this brief as dispatched. Nothing will be added while you run.
- **Branch.** main. The expected HEAD is origin/main =
  82d1ab4d8300de139db88dbaa9f7b2d56d2650b0.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each one and
    continue.
  - Push after the commit. Create no tag.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX4-T06-FREEZE`.
  - The capitalised rules apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO
    `python -c`), NO PIPES INTO `head` OR `tail`, NO NULL-DEVICE REDIRECTS (`/dev/null`,
    `/dev/stdout`, `nul`), NO `rm -r`, NO INTERACTIVE SHELLS.
  - For the JSON parse, use the workflow Python with a script file in your task folder, or
    the validators' own parse.
  - Run every Python check with the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Run `git add` as a plain command with explicit paths, not chained with other commands.
  - **If a permission check denies any call, stop at once and report the denial reason
    exactly. Do not retry it in another form.**
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (17 paths, all modified)

- **docs, each with its `.vi.md`:**
  - `docs/01_PRODUCT_REQUIREMENTS.md`;
  - `docs/03_ARCHITECTURE_AND_DATA.md`;
  - `docs/04_UX_AND_SETTINGS.md`;
  - `docs/05_SUBMISSION_AND_NOTIFICATIONS.md`;
  - `docs/07_DEPLOYMENT_AND_OPERATIONS.md`;
  - `docs/10_DECISIONS_AND_SOURCES.md`;
  - `docs/11_OPERATIONS_RUNBOOK.md`;
  - `docs/12_RELEASE_NOTES.md`.

  That is 16 files.
- **test:** `tests/integration/delivery.test.ts`.

If the working tree differs from this set, do not commit. Report the exact difference and
stop. In particular, any `src/` change stops the commit.

Any of these also stops the commit:
- a migration;
- a `package.json` or lockfile change;
- anything under `scripts/`;
- the AGENTS or CLAUDE files, or `.claude/`;
- docs/08 or the prompts;
- any other path.

Recompute the digest with Node 24 immediately before `git add`. It must equal
104ca9c3f5e31959a23a9b509edfc6367dfef7d9b837e0e938db81641de8a5ae (849 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified:**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX4-T05-FREEZE.md`, which now has its Results.
- **New:**
  - `handoff/delivery/evidence/WP5-UX4-T05-FREEZE/checks.txt` and `commit-message.txt`;
  - `handoff/delivery/tasks/WP5-UX4-D8-DIAG.md`;
  - the folder `handoff/delivery/evidence/WP5-UX4-D8-DIAG/`, 5 `.txt` files;
  - `handoff/delivery/tasks/WP5-UX4-T06.md`;
  - the folder `handoff/delivery/evidence/WP5-UX4-T06/`, 29 `.txt` files;
  - this brief, as it stands before you append results.

Count each folder with Glob. Every evidence file name must end in `.txt` or
`-synthetic.png`.

`evidence/WP5-UX4-D8-DIAG/probe-script.txt` is a probe script saved as text.
- Before you stage it, Grep it and the other D8-DIAG files for `BEGIN` (any PEM block), for
  `PRIVATE KEY`, and for a base64 run of 200 or more characters.
- Any hit stops the commit. Report the file and line, but not the content.

**Other paths under `handoff/` (set at dispatch, not later).** If `git status` shows another
path under `handoff/`, the rule depends on the path.
- **You may stage it, and must list it by name in Results,** if it matches one of these:
  - `handoff/delivery/tasks/WP5-UX4-*.md`;
  - a `.txt` or `-synthetic.png` file under `handoff/delivery/evidence/WP5-UX4-*/`;
  - `handoff/delivery/STATE.json`;
  - `handoff/NEXT_ACTION.md` or `.vi.md`.
- **Any other path stops the commit.**

**Privacy.** Run the precommit check.
- A `profile-path` finding in an evidence log may be masked: replace the account segment
  with `<user>`, then re-stage.
- Any other finding stops the commit.

## Checks before committing

Record each exit code in `handoff/delivery/evidence/WP5-UX4-T06-FREEZE/checks.txt`
(required).

1. `node --version`.
2. HEAD and origin/main.
3. The digest (104ca9c3…).
4. The PEM and key Grep on the D8-DIAG evidence.
5. `git add` with the explicit paths.
6. `node scripts/precommit-check.mjs`.
7. `git diff --cached --check`.
8. A JSON parse of ORCHESTRATION.json and STATE.json.
9. `validate_orchestration.py`.
10. `check_recovery.py` (106 probes).
11. `validate_package.py --preflight` (write `<user>` for the profile path in the evidence).
12. After the commit: the `git ls-tree` digest of HEAD.

**Allowed fixes:** trailing whitespace or a blank line at EOF in a task record outside
`evidence/`. A whitespace finding in a source, test or docs file stops the commit; report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX4-T06: round-4 documentation and pilot decisions

- docs:
  - change password (docs/03, docs/04, runbook §3);
  - the opening balance per F-1 (i), the 20-preview limit, and no historical import for
    the pilot (docs/01 FR-16, docs/07, runbook §10);
  - at-least-once reminders, D-7 a (docs/05).
- docs(decisions): one 2026-10-20 entry for the documentation-only owner answers D-1 a,
  D-2 a, D-3 a, D-4 a, D-7 a, D-8 a and D-11 a to D-14 b (docs/10).
- docs(release-notes): the round-4 entry, the 1330px rule, the known limits (unguarded
  routes, company-file limits, D-7 a, D-8 a), and the declaration after the pilot per D-14 b
  (docs/12).
- docs(runbook): D-1 a (`JOB_RUNNER=off` until reconciliation); D-8 a (a certificate
  failure is temporary `smtp_unavailable`, five attempts, then intervention).
- test(delivery): pin that an untrusted certificate fails temporarily, as
  `smtp_unavailable`, in both the STARTTLS and implicit-TLS modes.
- docs(handoff): the pilot packet D-1..D-15 answer table, release declaration and
  opening-balance row (+ vi); the T05-FREEZE results; the D8-DIAG and T06 records and
  evidence; the board and the checkpoint (+ vi).

Task: WP5-UX4-T06 (owner answers D-1..D-15, F-1 i; diagnosis WP5-UX4-D8-DIAG)
Gate: pending (round-4 package gate)
Audit: pending (round-4 audits)
Digest: 104ca9c3 (was b4727677)

Save the final message as `handoff/delivery/evidence/WP5-UX4-T06-FREEZE/commit-message.txt`.
Leave it, checks.txt and this brief's Results unstaged after the commit.

## Push and report

Append to this brief:
- the HEAD before and after the commit;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digests;
- the staged counts per group;
- any extra handoff paths staged;
- every check with its exit code;
- any fix, masking or stop.

Return at most 80 words, beginning 'Self-reported model: ...'.

## Addendum 1 (coordinator, for attempt 2 by a fresh committer)

- **Why attempt 1 stopped.** Attempt 1 stopped before staging; nothing was staged. Its
  pre-checks passed:
  - HEAD = origin/main = 82d1ab4;
  - the working-tree set matched;
  - the digest was 104ca9c3 (849 files).

  The PEM and key Grep hit the word `BEGIN` once:
  `handoff/delivery/evidence/WP5-UX4-D8-DIAG/probe-script.txt:50`. There was no
  `PRIVATE KEY` text and no base64 run of 200 or more characters.
- **What the coordinator found.** The coordinator read that line on 2026-10-21. It is
  source code that builds a certificate string at run time: a template literal
  `` `-----BEGIN CERTIFICATE-----\n${b64}\n-----END CERTIFICATE-----\n` `` with no encoded
  body. On the same line, `privateKey.export(...)` is a method call, not key material.
- **The corrected rule** for check 4, which replaces the earlier wording:
  - **Allowed:** exactly this one known hit, a `BEGIN CERTIFICATE` template literal on
    `probe-script.txt` line 50 whose body is the variable `${b64}`. Confirm that the line
    still matches this description and record it in checks.txt.
  - **Still stops the commit:**
    - any other `BEGIN` hit in the D8-DIAG files;
    - any line containing `PRIVATE KEY` (as text, not `privateKey`);
    - any base64 run of 200 or more characters;
    - a PEM header followed by literal base64 lines.
- Everything else in this brief is unchanged. Rerun every check from the start, and write
  the results under "### Attempt 2".

## Results

Attempt 1 stopped before staging on the single `BEGIN` hit in `probe-script.txt:50`
(cleared by Addendum 1).

### Attempt 2

- HEAD before: 82d1ab4d8300de139db88dbaa9f7b2d56d2650b0 (= origin/main). HEAD after and
  commit SHA: a3042dd9c2f94dd2287ef04ed815db0fbf1838b6. Pushed: yes (dry-run 0, push 0).
  Remote SHA: a3042dd9c2f94dd2287ef04ed815db0fbf1838b6. Branch main. No tag.
- Digest before add and after commit: 104ca9c3f5e31959a23a9b509edfc6367dfef7d9b837e0e938db81641de8a5ae
  (849 files), both equal.
- Staged: 62 (17 outside handoff; 6 modified handoff records; 3 new task records
  D8-DIAG, T06, T06-FREEZE; 2 T05-FREEZE evidence; 5 D8-DIAG evidence; 29 T06 evidence).
  No extra handoff paths.
- Checks, all exit 0: node v24.21.0; D8-DIAG grep (one allowed `BEGIN CERTIFICATE`
  template literal with `${b64}` at probe-script.txt:50; no PRIVATE KEY, no long base64);
  precommit-check PASS (0 findings); `git diff --cached --check`; JSON parse via
  validate_orchestration.py; validate_orchestration.py PASS; check_recovery.py PASS (106);
  validate_package.py --preflight PASS.
- No fix, no masking, no stop. Details: `evidence/WP5-UX4-T06-FREEZE/checks.txt`.
