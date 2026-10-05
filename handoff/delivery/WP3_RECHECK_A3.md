# WP3 recheck — area A after fix round 3 (digest rebinding)

Form: [REVIEW](../templates/REVIEW.md). Translation: [WP3_RECHECK_A3.vi.md](WP3_RECHECK_A3.vi.md). Brief: [WP3-RECHECK-A](tasks/WP3-RECHECK-A.md), section "Attempt 3 (coordinator note)", with the scope in [WP3-RECHECK-BC3](tasks/WP3-RECHECK-BC3.md) items 5–7. Earlier area-A reports (kept unchanged): [WP3_REVIEW_A](WP3_REVIEW_A.md), [WP3_RECHECK_A](WP3_RECHECK_A.md), [WP3_RECHECK_A2](WP3_RECHECK_A2.md). The same audit rechecks areas B and C: [WP3_RECHECK_BC3](WP3_RECHECK_BC3.md). Evidence: `evidence/WP3-RECHECK-BC3/` (masked, LF; addresses `<email>`, account `<user>`; probe sources `*.mjs.txt`); command log [00-commands.txt](evidence/WP3-RECHECK-BC3/00-commands.txt).

- **Package/date/reviewer and observable model/effort:** WP3, area A, digest rebinding after the test-only fix round 3 (task WP3-RECHECK-A, attempt 3), 2026-10-05 (UTC). Reviewer: Claude Code subagent `timesheet-auditor`, agent `a4e5c209ddf7091f5` on the board, the same fresh auditor as WP3-RECHECK-BC3. Self-reported model `claude-opus-5-5`; requested opus/xhigh; effort is not observable from inside the session. The strongest WP3 author model is opus. The round-3 author (WP3-FIX3 `ab4bd2cde876c7ecb`), committer (WP3-FIX3-FREEZE `aca480339f4624b19`) and verifier (WP3-REGATE3 `a41152818099fb8d5`) ran on sonnet. The reviewer is not weaker. It is not the attempt 1 or 2 auditor (`a6f4a505bd38d735e`, `a6dd03dfdd2f440e9`) and none of the other WP3 auditors.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** commit `49651c8bb91d56bf6c6966405257537ec7ca474b` (the WP3-REGATE3 `freeze_commit`; `origin/main` is the same commit). Recorded as the first two commands after `node --version`: project HEAD `49651c8…` and the `git ls-tree` digest `c31c300c06ae4c750bf0080f304d3f87eae0a00280110d1a8eb6eb37ecf4ec72` (handoff/ excluded), equal to the regate digest of record. The private clone (detached at `49651c8`) gives the same digest by `scripts/source-digest.mjs` (721 files) and by `git ls-tree`. HEAD and digest at the end are the same (last lines of [00-commands.txt](evidence/WP3-RECHECK-BC3/00-commands.txt)). Source complete; no source edited. The 3 untracked files under `.claude/skills/readme-md/` in the project folder are outside the freeze and were not touched.
- **Decision: PASS / FIX REQUIRED / NOT VERIFIED:** **PASS.**
  - The delta `2d72d35..49651c8` touches one test file and handoff records only.
  - The race, HTTP and hint probes pass again on the new freeze with the same results as attempt 2.
  - The attempt 2 conclusions carry over unchanged.
  - No finding.
- **Scope actually inspected/executed (brief items 5–7):**
  - Item 5:
    - `git diff --stat` and `--name-status 2d72d35 49651c8` outside handoff/ gives one path, M `tests/integration/deadline.test.ts` (+65 −12).
    - The same diff over `src`, `docs`, `scripts`, `package.json`, `package-lock.json`, the tsconfig, eslint, vite, vitest and playwright configurations, `.gitattributes`, `.gitignore`, `.editorconfig`, `.npmrc`, AGENTS/CLAUDE, `.claude`, `.agents`, `reference` and README/DEVELOPMENT is empty.
    - 141 handoff paths changed.
    - The test diff was read line by line in the BC3 recheck: it adds 4 tests and removes no assertion.
  - Item 6: the race probe (20 rounds × 4 OS processes, run twice), the HTTP probe and the hint probe of attempt 2. Masked addresses were rebuilt at run time; otherwise the probes are unchanged, except a log line added to the HTTP probe's error path. They ran on the built production code of the clone at the freeze.
  - Item 7: each attempt 2 conclusion was compared with what the delta can reach and with the reruns.
- **Evidence table: command | result/exit | evidence:**

| Command | Result / exit | Evidence |
|---|---|---|
| `node --version` (portable, full path); `git rev-parse HEAD`; `git ls-tree … \| sha256sum` (project folder); `scripts/source-digest.mjs` and `git ls-tree` in the clone | `v24.21.0`; `49651c8…`; `c31c300c…ec72`; the same in the clone (721 files) | [00-commands.txt](evidence/WP3-RECHECK-BC3/00-commands.txt) |
| `git diff 2d72d35 49651c8` outside handoff/; over src, docs, scripts and configuration | one test file; empty | [17-delta.txt](evidence/WP3-RECHECK-BC3/17-delta.txt), [17b-test-diff.txt](evidence/WP3-RECHECK-BC3/17b-test-diff.txt) |
| `npm ci`; `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` (clone) | exit 0; exit 0, 62 files / 1420 tests, SMOKE PASSED with 40 `PASS` lines, no deprecation line | [01-npm-ci.txt](evidence/WP3-RECHECK-BC3/01-npm-ci.txt), [02-verify.txt](evidence/WP3-RECHECK-BC3/02-verify.txt) |
| `ROUNDS=20 node race-probe.mjs` (two identical manual sign-offs and two production `cli.js run-jobs` passes as four OS processes per round, then two drain passes), run twice | exit 0 both; manual won 11 / deadline won 9 / failed 0, then 9 / 11 / 0 | [10-race.txt](evidence/WP3-RECHECK-BC3/10-race.txt), [10b-race-rerun.txt](evidence/WP3-RECHECK-BC3/10b-race-rerun.txt) |
| `node http-probe.mjs` (built server, loopback, OS-chosen port, `JOB_RUNNER=off`, capture) | run 3: exit 0, HTTP PROBE PASSED, 84 PASS; run 1: exit 1 on a probe-client transport error after 25 PASS, 0 FAIL; run 2: my syntax error, not started | [12-http.txt](evidence/WP3-RECHECK-BC3/12-http.txt), [12a-http-earlier-runs.txt](evidence/WP3-RECHECK-BC3/12a-http-earlier-runs.txt) |
| `node hint-probe.mjs` | exit 0; HINT PROBE PASSED, 12 PASS | [13-hint.txt](evidence/WP3-RECHECK-BC3/13-hint.txt) |
| `npm run test:e2e` (Edge; shared with BC3) | exit 0; 127 passed, 5 skipped | [05-e2e.txt](evidence/WP3-RECHECK-BC3/05-e2e.txt) |

- **Verified behaviour (no defect found):**
  1. **Race, finalization and ledger.** Every round of both runs gives the following.
     - One revision, one ledger set (`+60` credit and `-240` deficit debit, `source_ref` = the revision), two revision lines, a succeeded PDF and send job, one accepted attempt, one capture, posted balance 120, `integrity_check` ok and no FK violation.
     - When the manual path wins: one `created` and one `replayed` sign-off, with `signed_at` = the injected instant 2026-09-30T00:30:05Z.
     - When the deadline wins: both manuals get 409 `already_finalized`; the review stays pending, there is no sign-off and no invented `signed_at`.
  2. **HTTP boundaries (84 PASS).**
     - Owner-only revisions, PDF and signatures. Another employee, the administrator, an upper-case id, a traversal id and a revoked shared path get 404; anonymous gets 401.
     - No static path serves a private file; `no-store` on owner answers; deliveries are owner-scoped.
     - Admin answers stay inside the allowlist and hold no timesheet detail.
     - C-01: the hint is owner-only and outside the payload, the hash, the PDF and the e-mail.
     - C-02: attribution exposes no other user's data.
     - RBC-01: `actor_is_system` equals "no actor" in the database for every History event of four users, with no identity on system events.
     - RBC-02: the pre-period grantee leave is listed only in the owner's review.
     - H-Q1 (a): E3, which never saved settings, gets no revision, line, ledger entry, job, attempt, system event or admin status row.
     - AC-14: the administrator's automatic send without a sender shows `failed_permanent`/`sender_missing`, never accepted.
     - No password, hash, session token or token hash appears in 198 collected texts.
     - The server stopped at the end (`SIGTERM`).
  3. **Hint and hash binding (12 PASS).**
     - With the hint shown and hidden on byte-identical data, these are identical: the reviewed hash and expected version, the stored `payload_sha256`/`reviewed_sha256` and payload JSON, the PDF bytes (SHA-256 `923d50ab…`), the ledger postings and the captured e-mail.
     - The payload holds no grantee name or field, and reading the review writes nothing.
     - The pre-period planned leave (2026-09-17) and the next-period change are listed; a day the owner took over is not; after the sign-off only a later grantee change is listed.
- **Attempt 2 conclusions (item 7): carried over unchanged.**
  - Fix round 3 changed no production, migration, document, script or configuration file, so the code that attempt 2 exercised is byte-identical.
  - The three rerun probes give the same results as attempt 2: race 0 failed (11/9 then 9/11 here, 11/9 twice there), HTTP 84 PASS, hint 12 PASS.
  - The attempt 2 results for crash K1–K7, PDF and Edge renders, the H-Q1 differential and migrations still describe this freeze. Their inputs (`src/server/db`, finalization, review payload, ledger, PDF, jobs, mail, automation) are unchanged, and no migration was added (`src/server/db` has no diff).
  - Those four probes were not rerun; they are outside the attempt 3 scope.
- **Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix:** none. No observed defect in area A.
- **Risks and optional improvements, separate from proven defects:**
  - R1, R2 and R4–R9 of WP3_RECHECK_A and WP3_RECHECK_A2 are unchanged, because no source changed. R3 stays closed by H-Q1 (a).
  - The new test-gap observations of this audit (in-loop activation recheck, redundant creation guards) concern area B and are recorded as R1–R4 in [WP3_RECHECK_BC3](WP3_RECHECK_BC3.md).
- **Required gates unrun/blocked and why:**
  - Real SMTP is forbidden before the owner's authorization.
  - The crash, PDF, H-Q1 differential and migration probes were not rerun: outside the attempt 3 scope, and their code is byte-identical (see item 7).
  - Nothing mandatory is blocked.
- **Disposition of previous findings:**
  - WP3_RECHECK_A2 (attempt 2, PASS at `2d72d35` / `0d513fca…ea92`) is rebound to `49651c8` / `c31c300c…ec72` by this attempt. No area-A finding existed or exists.
  - Process notes, not software:
    - HTTP probe run 1 stopped on a client transport error (ECONNRESET on the first request after seven blocking `spawnSync` passes, while the mutation suite loaded the machine).
    - Run 2 did not start because of my edit.
    - Both are kept as evidence; run 3 is the run of record.
    - One accidental interactive `cmd.exe` is described in WP3_RECHECK_BC3 "Process notes".
- **Software readiness, owner permission and pilot result separately:**
  - Software readiness of WP3 area A at `49651c8` / `c31c300c…ec72`: PASS.
  - Owner permission for real sending, activation or deployment: none requested or given. Capture mode only; `PRODUCTION_SENDING_ENABLED` never set.
  - Pilot result: none.
- **One next action/prompt:** the coordinator records this PASS for area A at `c31c300c…ec72` together with WP3-RECHECK-BC3 (PASS) and runs the WP3 accept step.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP3-RECHECK-A attempt 3, reviewer `a4e5c209ddf7091f5`. Reviewed authors: the WP3 authors listed in [WP3_REVIEW_A](WP3_REVIEW_A.md); fix rounds 1 and 2 as listed in [WP3_RECHECK_A](WP3_RECHECK_A.md) and [WP3_RECHECK_A2](WP3_RECHECK_A2.md); fix round 3 WP3-FIX3 `ab4bd2cde876c7ecb` with committer WP3-FIX3-FREEZE `aca480339f4624b19`; gate WP3-REGATE3 `a41152818099fb8d5`.
- **Fresh context; confirm reviewer did not author changes:** fresh context. This reviewer authored no WP3 change, fix rounds included, and is not an earlier area-A auditor. It edited no source. It wrote this file, its translation, the attempt 3 block of the brief, the WP3_RECHECK_BC3 pair, the BC3 Results and `evidence/WP3-RECHECK-BC3/`.
- **Source digest before/after; gate evidence for that snapshot:** before and after `c31c300c06ae4c750bf0080f304d3f87eae0a00280110d1a8eb6eb37ecf4ec72` on HEAD `49651c8bb91d56bf6c6966405257537ec7ca474b`; the WP3-REGATE3 results report the same digest on the same commit.
- **New report path preserving previous review history:** `handoff/delivery/WP3_RECHECK_A3.md` (new). WP3_REVIEW_A, WP3_RECHECK_A and WP3_RECHECK_A2 are unchanged.
- **Finding dispositions and next coordinator fix/recheck task:** no finding and no fix task. Next is the WP3 accept step.
