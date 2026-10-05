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

### Auditor result (attempt 1, 2026-10-05)

- Self-reported model: claude-opus-5-5 (profile timesheet-auditor; effort not observable). Fresh context. This auditor
  authored nothing in WP3, and the WP3_REVIEW_A/B reports were not read. The strongest author model of the snapshot is
  opus, so the reviewer is not weaker.
- Target: `a1cd566e59253d19f53cfd5b3a81fd27a7e9a056` (= `origin/main`, WP3-GATE `freeze_commit`). Digest
  `96870f7eaf5a0e892a9682e28931b3c46cf2888a4bfae3abd242b541e6a6e729` (717 files) before and after, in the clone and in
  the project, equal to the gate digest. Report: [WP3_REVIEW_C](../WP3_REVIEW_C.md) (+ `.vi.md`). Evidence:
  `handoff/delivery/evidence/WP3-AUDIT-C/` (start at [00-baseline.txt](../evidence/WP3-AUDIT-C/00-baseline.txt)).
- **Verdict: FIX REQUIRED.**
- Route inventory: 88 registered (method, path) entries = 85 routes + 3 middleware wildcards, read from
  `createApp(...).routes`. 17 sit under `/api/shared/:ownerId`, exactly the auditor's own matrix. Every entry is
  pinned by `sharing-matrix.test.ts`; no route is missing from it.
- Checks run (all exit 0 unless stated):
  - `npm ci`.
  - `npm run verify` with deprecation tracing: 60 files / 1384 tests, SMOKE PASSED (40 PASS lines), 0 deprecation
    lines.
  - Playwright sharing, isolation and admin-status specs (Edge, desktop and mobile): 18 passed.
  - Probes P1 authorization: 86/0. All 11 item sets × 17 routes as real requests; 153 probes of non-allowlisted
    routes under the shared prefix all 404; live revoke/leave/admin revoke/scope drop/deactivations on the next
    request; IDOR 404; no re-share.
  - P2 race: 23/0. Deterministic second-connection interleavings on all 5 writes and the PDF, all refused with
    nothing written; a positive control without `shareCheckedDb` lets the write land; 20/20 multi-process rounds with
    0 writes after the revocation.
  - P3 records: 43/0 (0006 constraints and triggers, change atomicity with an injected failure, admin allowlist).
  - P4 UI: 25/0 (disallowed actions absent, not disabled; every grantee data call goes to `/api/shared`; 14
    screenshots viewed).
  - P5: 7/0 (origin/CSRF, cookie, rate limit, inventory pins).
  - `validate_package.py --preflight`: exit 1, blocked by the area-A/B reports' directory links (not this task's
    files). The same rules applied to this pair: PASS.
- Findings:
  - WP3-C-01 Medium. The review "changed by" hint planned in WP3-REQ C/E/G (`WP3-REQ.md:459,529,587`) is absent:
    `ReviewScreen.tsx` shows no grantee change. Required change: implement an owner-only, write-free hint outside the
    payload hash, or record a coordinator decision that drops it.
  - WP3-C-02 Low. `services/history.ts:73-78` attributes an admin-route `share.revoke` as "shared access" when the
    admin also holds a share of the owner, and a same-second earlier act retroactively. Required change: attribute
    only acts performed through `/api/shared`.
  - WP3-C-03 Info. Stale comment `types.ts:22-27`.
- Carry items: 8a (optional actor/delivery) is acceptable backlog. 8b (window attribution) is acceptable for the
  unattributed case, but its reverse effect is C-02. 7 (raw History operation names) is acceptable backlog. 12 (e2e
  flake) was not observed. GOV R1 is acceptable backlog.
- Risks: R1 HEAD on the shared PDF writes a download audit without bytes; R2 "Changed by" wording for downloads; R3
  the hand-written NEVER list; R4 the in-memory lookup limiter; R5 the origin is visible in the shared status list;
  R6 `actor` is optional.
- Commands, exits and probe sources are in the evidence folder. No server, browser or job runner was left running.
  Capture mode only, no real mail, no commit.
