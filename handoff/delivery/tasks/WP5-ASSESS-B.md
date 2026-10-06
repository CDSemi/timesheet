# WP5-ASSESS-B dispatch brief

- Mission/task: timesheet-software-readiness / WP5-ASSESS-B; package WP5; kind audit;
  attempt 1; depends on WP4-REGATE4 (PASS, gate of the same freeze) and WP5-PLAN.
- Scope: the first WP5 step, a fresh independent assessment of the WP1–WP4 release
  candidate, area B: **reproducible release, verified restore and operations.**
- Profile/routing: timesheet-auditor (xhigh), model opus, override reason `size_risk`.
  docs/08 says an audit is never below the strongest author model. Routing: size L,
  risk H, novelty yes.
- Fresh context: you authored no WP1–WP5 change and ran none of the WP4 or WP5 audits.
  WP5-ASSESS-A runs at the same time in its own folder; share nothing with it.
- Language: the task record is in English. `WP5_REVIEW_B.md` and its `.vi.md` follow the
  REVIEW form.
- Target: `reviewed_commit` = 546cddaf6747aef85e8b6d9b7712de9e28f138bf, the WP4-REGATE4
  `freeze_commit`. Gate digest of record:
  26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081 (775 files). HEAD is
  e7fe514, which changes only handoff/. Record HEAD and the digest before and after: in
  the repository, in the `git ls-tree` form and on your export.

## Read

- AGENTS.md, from disk.
- [WP5_REVIEW](../../prompts/WP5_REVIEW.md) and the documents it names: docs/02, docs/05,
  docs/06, docs/07 and docs/09. Also docs/10 and docs/11 (restore, runbook).
- [WP5-PLAN](WP5-PLAN.md), sections A, B ("WP5-ASSESS-B" and the shared rules), C, F and
  G. The plan defines your scope and checks. It is not evidence, and its triage is not
  an audit.
- The WP4 acceptance record in [WP4_HANDOFF](../WP4_HANDOFF.md), and the WP4-REGATE4
  drill evidence. Inspect prior evidence; do not trust summaries.

## Scope

Follow WP5-PLAN section B, "WP5-ASSESS-B", items 1–6:
1. a complete reproducible release:
   - two clean exports;
   - the `dist/` hash comparison;
   - image pinning, a non-root user and forbidden-file scans;
   - `.env.example` and the Compose example free of secrets;
   - the release identity;
2. a verified restore:
   - the drill `--wp3`, stages 1–6;
   - an independent restore of a dataset holding a finalized period, a correction and
     an OT reservation;
3. operations privacy;
4. runbook fidelity;
5. pilot readiness from the operations side (facts only, never production values);
6. the overall verdict.

Use synthetic data and local capture only.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-ASSESS-B`, with `drill/`, `wp3/`, `src/`,
  `src2/` and `scratch/` under it. Ports 47720–47739.
- Docker:
  - Compose project `ts-wp5-assess-b`; one-off containers use the same prefix.
  - Use non-TTY flags only.
  - At the end, remove the image `ts-wp5-assess-b-timesheet:drill` by exact tag, and the
    project by name.
  - Record the `docker ps --all --filter name=ts-wp5-assess-b` listing; it must be
    empty.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Follow every rule in WP5-PLAN section G. In particular:
  - **NEVER feed anything to python or node through stdin.**
  - Never pipe into head or tail.
  - Use Git Bash only, never cmd.exe, and never an interactive shell.
  - Stop only servers you spawned, through their own handle. Never kill by PID.
  - Never redirect to /dev/null or nul. Never remove anything recursively.
- If a permission check denies a call, stop and report.
- Do not fix anything, send real mail or set `PRODUCTION_SENDING_ENABLED`.

## Output

- `handoff/delivery/WP5_REVIEW_B.md` and `.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence in `handoff/delivery/evidence/WP5-ASSESS-B/`:
  - the drill summary per stage;
  - the image ID and size;
  - the forbidden-file scan count;
  - the `dist/` hash comparison;
  - probes as `*.mjs.txt`;
  - the final Docker and process listings.
  - Run the precommit check over your evidence before hand-back.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED. List findings separately, each
  with file and function, reproduction, expected and actual results, rule or AC ID, and
  a bounded fix. Keep risks and optional improvements apart from defects. NAS-specific
  checks stay NOT VERIFIED and do not by themselves fail the area.
- Separate software readiness, owner permission and the real pilot outcome.
- Leave nothing running.

Return at most 200 words, beginning with your self-reported model.

## Results

### Auditor result (attempt 1) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (profile timesheet-auditor; effort not observable). The strongest author model of the
snapshot is claude-opus-5-5, so the audit-strength rule holds. Fresh context; this agent authored no WP1–WP5 change and is
not the WP5-ASSESS-A auditor. Report: [WP5_REVIEW_B](../WP5_REVIEW_B.md) (and `.vi.md`). Evidence:
`handoff/delivery/evidence/WP5-ASSESS-B/` (00-README.txt maps 46 files). Raw output: `D:\.claude-tmp\timesheet\WP5-ASSESS-B`.

**Baseline and digest.**
- HEAD = origin/main = e7fe5144dc62f5047c79dd5ef69d973f60dfd14d, before and after. The reviewed commit is
  546cddaf6747aef85e8b6d9b7712de9e28f138bf.
- Digest 26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081 (775 files), before and after, matched in:
  - the repository (`scripts/source-digest.mjs`);
  - the `git ls-tree` form of HEAD and of 546cdda;
  - three clean `git archive` exports (raw blob IDs of the tar listing, `export-digest.mjs`).
- No source change outside `handoff/`.

**Runtime.**
- Git Bash only; Node v24.21.0 portable first on PATH; npm 11.18.0 with script-shell Git Bash, so no `cmd.exe`.
- `DATA_DIR` and `DATABASE_PATH` inside the task folder for every run. Ports 47721–47725 and 47730. Compose project
  `ts-wp5-assess-b`. Synthetic data, capture only; `PRODUCTION_SENDING_ENABLED` never set.

| Item | Result |
|---|---|
| 1 Reproducible release | Two exports from identical tar files. `npm ci` exit 0 in both, lockfile unchanged, 0 deprecation lines. `npm audit --omit=dev` 0 (full audit: the dev-only `source-map-js` high). `npm run build` in both: 230 `dist/` files byte-identical. `npm run verify` on export 1: exit 0, 76 files, 1,758 tests, smoke 41 PASS, 0 deprecation lines. Image pinned by index digest, User 10001:10001. Independent forbidden-file scan: total 0 (12 rules, 10,331 paths); 0 dev packages. `<compose> build --no-cache`: `/app/dist` byte-identical to a local image-style build (116 files), no `sourceMappingURL`. `.env.example` and `compose.example.yaml` hold no secret. Release identity: commit, digest and image ID; the image ID differs per build (75f50c10… cached, 62fb1101… no-cache), version 0.1.0 unchanged since WP3 (R-B5-1) |
| 2 Verified restore | Drill `--wp3` exit 0: 208 PASS, 0 FAIL (33/31/57/35/27/23). Independent host restore of a finalized period, a correction revision, an OT reservation and a partial OT use (posted 870, reserved 300, available 570): balances, ledger, leave, revisions and both PDF SHA-256 equal; point in time proven; pause logged and reported. Uncertain path: resume refused, release refused, decision "resend", one capture with the revision-2 PDF, no ledger movement. Runs 2/4/5: 48/0, 63/0, 50/0; runs 1 and 3 failed on probe errors only (kept). The image restored the same host backup identically (one-off container form) and the restored instance ran through Compose: healthy, paused, resume refused |
| 3 Operations privacy | `/api/health`, `/api/ready`, the administrator operations JSON, backup/restore/outbound CLI output and the server logs carry no name, password, token, path or timesheet detail (recipient addresses only where docs/07 allows) |
| 4 Runbook fidelity | Executed the non-NAS commands the drill does not cover: `bootstrap --new-token`, `backup --prune`, the uncertain reconciliation, the previous build with `JOB_RUNNER=off` (no job moved in 25 s), `imagetools inspect`, `build --no-cache`, the restore container on a host backup, the Section 6 step 3 start and the host alert. Findings B-01 and B-02 below. `outbound drop` was not executed (no held reminder arose); it is covered by `restore.test.ts` in verify |
| 5 Pilot readiness (operations facts) | Missing for the packet: the Compose binding and per-release tags (B-01); env-file retention (B-02); activation and deactivation steps and a first-install rollback card (planned in WP5-REL); a release record with the NAS-built image ID and the base-image refresh decision (the pin is one Debian rebuild behind the tag, R-B5-2); the NAS restore proof and host alert (owner steps) |
| 6 Verdict | FIX REQUIRED. There is no blocking integrity, privacy or recovery defect in the software; two runbook defects |

**Findings** (details in the report):
- **WP5-B-01, Medium.** `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md` never name the Compose variables `TIMESHEET_ENV_FILE`,
  `TIMESHEET_DATA_DIR`, `TIMESHEET_IMAGE` and `TIMESHEET_PORT` that `compose.example.yaml` reads and every drill step sets,
  and `<image>` is undefined. Effects:
  - the verbatim `<compose>` fails (env file not found) or binds `<project-dir>/data`, `timesheet:local` and port 3000;
  - section 6 step 3 cannot point `/data` at `<restore-dir>`;
  - an upgrade rebuild re-tags `timesheet:local`, and the previous image was "No such image".
  - Rules: AC-11, AC-15, docs/07. Bounded docs-only fix in EN and VI: define the variables and `<image>`, use one tag per
    release, and set `TIMESHEET_DATA_DIR=<restore-dir>` in section 6 step 3.
- **WP5-B-02, Low.** No runbook step keeps the protected env file or the release identity with the separate-device copy.
  docs/07 says to "retain needed secret configuration securely". Bounded docs fix in section 4 step 3 and the section 2
  checklist.

Risks (not defects): R-B5-1 to R-B5-7 in the report. NAS: NOT VERIFIED.

**End state.**
- `docker ps --all --filter name=ts-wp5-assess-b`: empty. The image `ts-wp5-assess-b-timesheet:drill` was removed by exact tag;
  no network or volume is left.
- No listener on 47720–47739 and no portable Node 24 process left; both background runs (drill and verify) completed.
- Precommit check, run in a temporary git repository outside the project over copies of this audit's files (the reports, this
  brief and the evidence):
  - `precommit-check.mjs --self-test`: PASS.
  - The check itself: PASS, 51 staged files (47 evidence files, the two reports, this brief and `.gitattributes`), 0
    blocking, 0 warnings; `git diff --cached --check` clean (`97-precommit.txt`).
  - A final rerun after adding `97-precommit.txt` and this block: PASS, 51 files (all 48 evidence files, the two reports and
    this brief). It is recorded in the raw task folder (`raw/97-precommit-final.txt`).

**Next action.** A bounded docs fix for B-01 and B-02 (or folded into WP5-REL), with `addresses_audit: WP5-ASSESS-B`; then a
freeze, a gate and a recheck of this area on the new digest.
