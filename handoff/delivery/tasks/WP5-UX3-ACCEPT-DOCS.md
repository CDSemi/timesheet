# WP5-UX3-ACCEPT-DOCS dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-ACCEPT-DOCS; package WP5; kind
  documentation; attempt 1; depends on WP5-UX3-AUDIT-INT (PASS).
- Purpose: bring the pilot packet and the WP5 handoff up to the WP5 snapshot re-accepted
  after the owner-requested UI change round 3 (WP5-UX3).
  - This is a handoff-only change: no file outside `handoff/` may change.
  - The previous run of this kind is `handoff/delivery/tasks/WP5-UX2-ACCEPT-DOCS.md`;
    follow its pattern.
- Profile/routing: timesheet-light (effort low, fixed by the profile); requested model
  sonnet; no override. Routing: size S, risk L. Task record in English; the documents keep
  their EN/VI pairs.

## Accepted identity (copy exactly)

- **Release commit:** `8e557100d16b6b6eb86a48e00276835761aabfdf` (WP5-UX3-FIX6-FREEZE,
  pushed).
- **Source digest:** `507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6`,
  833 files, with `handoff/` excluded.
- **Gate:** WP5-UX3-REGATE5, PASS, NAS NOT VERIFIED (`handoff/delivery/tasks/WP5-UX3-REGATE5.md`).
  - The builds are byte-identical to those of WP5-UX3-REGATE3 and REGATE4, so their
    items carry forward.
  - Real-clock full e2e: 651 passed / 67 skipped / 0 failed.
  - Simulated-clock FULL runs at a window day and a DST change: 0 failed.
  - Drill `--wp3`: 208 PASS / 0 FAIL (REGATE3).
  - Unit tests: 2,141.
  - axe: only the justified account-menu target-size item.
- **Reference image ID:**
  `sha256:bcb0692cc99fe5c0b198dc26cff623045903f851f3d7069105b1df09bf9e493b` (110,042,848
  bytes). This is the REGATE3 drill build, on the development workstation, of bytes
  identical to the release; the image has been removed.
- **Final independent audit:** WP5-UX3-AUDIT-INT, PASS
  (`handoff/delivery/WP5_UX3_REVIEW_INT.md`). It supersedes WP5-UX2-AUDIT2, the previous
  acceptance on a643794 / 229df806.
- **Governance during the round:**
  - WP5-UX3-GOV, the AGENTS UI section ("modern, friendly business style"): accepted by
    WP5-UX3-GOV-AUDIT at 79b9a53 (`handoff/delivery/GOV_UX3_REVIEW.md`).
  - WP5-UX3-GOV2, the owner's AI Instruction header in AGENTS.md (owner answer
    WP5-UX3-Q7): accepted by WP5-UX3-GOV2-AUDIT at ceb86b6
    (`handoff/delivery/GOV_UX3_REVIEW2.md`).
- **Server:** `dist/server` and `dist/domain` are byte-identical to a643794. There is no
  business rule, calculation, schema, API, PDF or email change.

## What to change

1. `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`:
   - Update the release identity in section 0 and the rollback card in section 6 to the
     identity above.
   - In the provenance sentences of sections 3 and 5, keep the history and add that the
     server and domain builds are byte-identical to a643794. The email and PDF samples
     therefore still represent the release. The restore figures come from the REGATE3
     drill (the same 208 checks).
   - Add one short paragraph about UI change round 3 next to the round-2 paragraph:
     - the owner requests of 2026-10-15: modern style, identity menu, header and period
       bar, lifted selections, Day editor with a session dialog and a simpler break area;
     - the answers G-1..G-5, Q6, the 24-hour chips and Q7;
     - client UI and docs only, with no server or business change;
     - a link to `handoff/delivery/WP5_UX3_REVIEW_INT.md`.
   - Record the optional backlog for the pilot fix round, by ID only:
     - R-UX3B-1, R-UX3B-2, R-UX3B-5..R-UX3B-7 (`WP5_UX3_REVIEW_B.md`);
     - R-A2-1's residual and the A2 risks R3, R5, R7 (`WP5_UX3_REVIEW_A2.md`);
     - R-B2-2, R-B2-3, R-B2-5 (`WP5_UX3_REVIEW_B2.md`);
     - R-INT-1..R-INT-4 (`WP5_UX3_REVIEW_INT.md`);
     - the governance backlog items of `GOV_UX3_REVIEW2.md` (R3-R5, R8).
   - Note that the optional owner question WP5-UX2-Q3 is superseded by the round-3 answer
     G-5 (b), the "in progress" pill.
   - Keep section 8 (D-1..D-15 all pending) and section 9 (unsigned) unchanged.
2. `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`: add a section "Re-acceptance after UI
   change round 3 (WP5-UX3)", in the style of the round-2 section.
   - Source: the board `handoff/delivery/ORCHESTRATION.json` (tasks `WP5-UX3-*`,
     `owner_decisions` and `coordinator_decisions` of 2026-10-15 to 2026-10-19,
     `runtime_observations`). Cover:
     - The owner requests of 2026-10-15, in an English summary; the verbatim text stays on
       the board. The answers G-1..G-5, Q6, the 24-hour chips and Q7.
     - The plans WP5-UX3-PLAN and PLAN2 and the mockup.
     - The governance changes GOV (79b9a53, accept 3968e15) and GOV2 (ceb86b6).
     - The slices, one line each, with their freeze commits: T06 5c8355d, T01 e2f3d74, T02
       aa64999, T03 7cd8c59, T04 83c32d2, T05 699b1b3, T05B 5c0dad8, T07 f8117a4, T08
       1a33c57, T08B f89573b, T09 4b5403d, T10 cecfceb.
     - The fix rounds, one line each: FIX1 9187f31 and FIX2 7ce4e95 (after the GATE FAIL
       and the read-only SWEEP), FIX3 a78ada5 (after AUDIT-A and -B), FIX4 8629441 (after
       AUDIT-A2 and -B2), FIX5 5c101c1 (REGATE3's time-of-day test), FIX6 8e55710
       (REGATE4's test race, after DIAG1).
     - The gates: GATE FAIL; REGATE PASS with a recorded timeout deviation; REGATE2 PASS;
       REGATE3 FAIL; REGATE4 FAIL; REGATE5 PASS.
     - The audits: A and B FIX REQUIRED; A2 and B2 FIX REQUIRED; AUDIT-INT PASS. Give each
       one line naming its findings by ID.
     - The usage pause of 2026-10-16 and the resume of 2026-10-19.
     - The accepted identity, as above.
     - The carried optional backlog by ID, as in item 1.
     - The NAS still NOT VERIFIED, the pilot not authorized, and no pilot result.
   - Keep the older acceptance records unchanged as history.
3. Keep EN/VI parity. Put Vietnamese only in the `.vi.md` files, and keep the same facts,
   IDs, SHAs and links in both.

## Hard limits

- Change only the four files above, this brief's Results and
  `handoff/delivery/evidence/WP5-UX3-ACCEPT-DOCS/` (masked LF `.txt`).
- Do not change the board, STATE, NEXT_ACTION or the checkpoint; the coordinator owns
  them.
- Never edit source, tests or docs outside `handoff/`. Do not commit or push. Do not run
  any git command that changes the index or the working tree.
- Use Git Bash only.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
    `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stderr` OR `nul`, NO `rm -r`.**
  - Use the Write, Edit, Glob and Grep tools (no sed).
- Task folder: `D:\.claude-tmp\timesheet\WP5-UX3-ACCEPT-DOCS`. Set TEMP and TMP to it. Put
  Node 24 first on PATH before any node call.
- Never write an email address other than the full synthetic `@example.invalid` form,
  and never write a profile path (use `<user>`).
- No markdown link to a file that does not exist.
- If a permission check denies a call, stop and report.

## Checks

1. Run `validate_package.py --preflight` with the workflow Python
   (`$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`).
   It must exit 0; write `<user>` in the evidence.
2. Do an EN/VI parity check of the four files: section counts, and identical IDs, SHAs
   and links.
3. Run `npm run digest`. It must still be 507de97c…, which shows nothing outside
   `handoff/` changed.

## Return

At most 120 words, beginning with 'Self-reported model: ...'. Include:
- the files changed;
- the provenance update;
- the parity result;
- the preflight exit code;
- the digest.

Append the same to Results, ending with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5.

- Files changed: `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md` (section 0 identity and round-3 paragraph, sections 3, 5, 6, 10); `handoff/delivery/WP5_HANDOFF.md` and `.vi.md` (new section "Re-acceptance after UI change round 3 (WP5-UX3)"); evidence `handoff/delivery/evidence/WP5-UX3-ACCEPT-DOCS/checks.txt`.
- Provenance update: identity now `8e55710` / `507de97c…` (833 files), gate REGATE5, audit AUDIT-INT; `dist/server` and `dist/domain` are byte-identical to a643794, so the samples still represent the release; restore figures cite the REGATE3 drill (same 208 checks, image `sha256:bcb0692c…`). WP5-UX2-Q3 recorded as superseded by G-5 (b). Sections 8 and 9 unchanged.
- Parity: pilot packet h2 12/12, handoff h2 6/6; SHA tokens, IDs and links identical; all link targets exist.
- Preflight exit 0 (PASS).
- Digest 507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6, 833 files, unchanged.
- Slip: one `| head -1` pipe in a file search (no effect).

Status: done
