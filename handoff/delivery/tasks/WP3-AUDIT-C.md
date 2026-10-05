# WP3-AUDIT-C dispatch brief

- Mission/task: timesheet-software-readiness / WP3-AUDIT-C; package WP3; kind audit;
  attempt 1; depends on WP3-GATE (PASS). Package-final independent audit of area C,
  timesheet sharing (FR-17, AC-16). This is the third area audit allowed by WP3-REQ E; it
  runs because sharing is a new authorization surface.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk H, novelty yes. Fresh context. The task record is in English. WP3_REVIEW_C.md and
  its .vi.md are bilingual and follow handoff/templates/REVIEW.md.
- Author separation:
  - You authored nothing in WP3. The author agent IDs are on the board (WP3 tasks other
    than gates, audits and commits).
  - The sharing core (T13B) was authored at opus, so the audit runs at opus.
  - Treat every report, HANDOFF line and gate result as a claim.
- Target: `reviewed_commit` = the WP3-GATE `freeze_commit`. The coordinator gives that
  SHA and the gate digest in the dispatch prompt. Record HEAD and the source digest
  before and after; the digest must equal the gate digest.
- Another area audit may run at the same time in its own scratch clone; do not share
  files with it.
- Environment:
  - Execute only in your own scratch clone under `D:\timesheet-tmp\WP3-AUDIT-C`, outside
    Dropbox; use it for TEMP/TMP.
  - Delete only files you created; never remove folders recursively.
  - Make the first shell call a trivial `node --version` with Node 24 by full path. Plain
    `node` on PATH resolves v26. Stop on ENOSPC.
  - Do not edit source. Use capture mode only; no real mail. Use the installed Edge
    channel.
  - Never write into the repository root. On Windows, never redirect to /dev/null or nul
    from a POSIX shell.
- Read AGENTS.md from disk first. Then read:
  - handoff/prompts/WP3_REVIEW.md (your review prompt);
  - docs/01 (FR-17), docs/03, docs/04, docs/06 (AC-16) and docs/10, including "Owner
    decisions — 2026-10-04" (F-3);
  - [WP3-REQ](WP3-REQ.md) and [WP3-REQ2](WP3-REQ2.md), especially their authorization
    matrices;
  - handoff/delivery/WP3_HANDOFF.md, the WP3-GATE results, and the T13A, T13B and T13C
    records;
  - the board `owner_decisions` and `coordinator_decisions`.

## Scope

1. **Route inventory.**
   - Enumerate every mounted route from the source, not from the tests.
   - Only the allowlisted `/api/shared/:ownerId` routes are reachable through a grant.
   - Every other route, owner-only route and admin route ignores grants.
   - Find any route missing from the matrix test.
2. **Live authorization.**
   - The share check runs on every request; there is no cached session grant.
   - Revocation, item change and grantee or owner deactivation take effect on the next
     request.
   - A non-grantee, an admin without a share and an anonymous user get 404 (or 401 when
     anonymous).
3. **Items and modes.**
   - View-only refuses every write.
   - An edit grant writes only the allowed items.
   - A grant never allows Clock in/out on the owner's behalf, sign-off, sending,
     settings, signature or auto-image changes, or re-sharing.
   - Probe each of the 11 valid item sets yourself.
4. **Write re-check race.**
   - Your own probe: the write re-checks the grant inside the transaction.
   - Race a revocation against an edit on a real SQLite file. The edit either commits
     before the revocation or is refused; it never lands after it.
5. **Attribution.**
   - Each write through a grant records `actor_user_id` = grantee and `owner_user_id` =
     owner in audit and History.
   - The grantee's PDF download (`share.pdf_download`) is audited and shown to the
     owner.
   - The review "changed by" hint is correct.
6. **Share records (migration 0006).**
   - Grants are immutable, and revocation fields are set once.
   - A scope change is a revoke plus a new grant in one transaction, with `share.change`
     before/after.
   - No DELETE.
   - Admin grant list and revoke expose only the allowlisted fields and no timesheet
     details.
7. **Responses.**
   - `no-store` on shared responses.
   - No password, hash or token.
   - Grantee names appear only where the owner decisions allow.
8. **UI** (Settings → Sharing, "Shared with me", the owner bar, shared views):
   - disallowed actions are absent, not only disabled;
   - view your own synthetic screenshots on desktop and mobile.
9. **Carry items in your area** (from the HANDOFF): judge each one blocking or
   acceptable backlog.

## Output

- handoff/delivery/WP3_REVIEW_C.md and .vi.md.
- Results in this file.
- Evidence and probe sources in handoff/delivery/evidence/WP3-AUDIT-C/:
  - masked, LF, no trailing whitespace;
  - screenshots named `*-synthetic.png`;
  - probe scripts stored as `*.mjs.txt` / `*.py.txt`;
  - every email address masked as `<email>`.
- Before hand-back, run the precommit privacy check over your staged outputs in a
  throwaway repository or on a temporary index.
- Verdict: PASS, FIX REQUIRED or NOT VERIFIED. Give each finding an ID (WP3-C-nn), a
  severity, file:line, a reproduction and the required change.
- Separate observed defects from risks and optional improvements.
- Leave no server, browser or runner process.

Return at most 300 words, beginning with your self-reported model.

## Results

(Auditor appends here.)
