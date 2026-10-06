# WP5 handoff — Independent acceptance and pilot preparation (pre-gate snapshot)

Completed from [HANDOFF](../templates/HANDOFF.md). Translation: [WP5_HANDOFF.vi.md](WP5_HANDOFF.vi.md). This is a snapshot taken before the WP5 package-final gate WP5-GATE. It records what exists and what is open. The acceptance record at the end is empty on purpose; WP5-ACCREC fills it after the final audit passes. Nothing here is an acceptance, and no figure was re-run to write it.

## Handoff record

- **Package/scope, date and author:** WP5 only, per [WP5-PLAN](tasks/WP5-PLAN.md), [WP5_IMPLEMENT](../prompts/WP5_IMPLEMENT.md) and [09 Roadmap](../../docs/09_IMPLEMENTATION_ROADMAP.md). Snapshot of 2026-10-06, written by the WP5-REL task ([brief](tasks/WP5-REL.md)).
- **Actual model/effort/speed, or not observable:** WP5-REL: self-reported `claude-sonnet-5-5` (profile timesheet-worker); effort and speed are not observable from inside the session. Other tasks self-report in their own briefs.
- **Commit SHA, source digest and unpushed commits, or complete source archive:**
  - Base of WP5-REL: commit `8e99d2c6375f71ac94faff9eb859b9b7bcf3e741` (WP5-AC13-FREEZE), equal to `origin/main`, digest `1e59ad31d9af2a3f4a3aa5711647ea8742e1534b3d4f8ba4f2210beee44a3d2c` over 777 files (`handoff/` excluded).
  - WP5-REL is uncommitted at the time of this snapshot. Its source digest, after the new documents, is in the [WP5-REL brief](tasks/WP5-REL.md) Results; the package-final freeze commit and digest are recorded by WP5-GATE.
  - Commits of the accepted candidate: WP1 to WP4 accepted at `546cddaf6747aef85e8b6d9b7712de9e28f138bf`, digest `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081` (775 files); WP4 accept record `e7fe5144dc62f5047c79dd5ef69d973f60dfd14d`.
- **Implementation status; independent review status:**
  - Done and frozen: the independent assessment (area A PASS, area B with two low documentation findings), the runbook fix WP5-FIXB (commit `85838b515a86b3cca40cfbba189ba290ec06de58`) and the integrated AC-13 test WP5-AC13 (commit `8e99d2c6375f71ac94faff9eb859b9b7bcf3e741`).
  - Written, not yet frozen or gated: WP5-REL (release notes, pilot activation, deactivation, rollback card, operator notes).
  - Not yet run: WP5-GATE, WP5-PILOT, the final independent audit. No independent recheck of the WP5-FIXB runbook fix exists yet; the area B report names it as a recheck item.
- **Implemented behavior and changed files:**
  - WP5-FIXB (`85838b5`): `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md` (the Compose binding, per-release image tags and the env-file copy), one comment in `.env.example` and one in `compose.example.yaml`.
  - WP5-AC13 (`8e99d2c`): `tests/integration/ac13-two-week.test.ts` and `tests/integration/ac13-support.ts`; no application source changed.
  - WP5-REL (this snapshot, documentation only): new `docs/12_RELEASE_NOTES.md` and `.vi.md`; `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md` (sections 13 to 16, new placeholders, command-map rows); a link row in `README.md` and `README.vi.md`; this handoff pair. No application source, test, Compose behaviour or migration changed.
- **Migrations/schema compatibility:** unchanged by WP5. Latest schema 13 (migrations 0007 to 0013 are WP4's; see [WP4 handoff](WP4_HANDOFF.md)).
- **Changed canonical contracts and reason, or none:** none. `docs/11` gains sections 13 to 16 as the runbook that [11](../../docs/11_OPERATIONS_RUNBOOK.md) deferred to the pilot; no rule of docs/01 to 10 changed.
- **Verification table:**

  | Command | Environment | Exit status | Observed result | Evidence path |
  |---|---|---|---|---|
  | Assessment area A: clean export of `546cdda`, integrated workflow probe | Node 24.21.0, capture mode, synthetic | not restated | PASS: 77 of 77 checks, fault instance 12 of 12 | `evidence/WP5-ASSESS-A/` |
  | Assessment area B: reproducible release, drill stages 1 to 6, independent restore | Docker Desktop, linux/amd64, synthetic | not restated | findings WP5-B-01 and WP5-B-02 (low, documentation) | `evidence/WP5-ASSESS-B/` |
  | WP5-AC13 `npm run verify` | Node 24.21.0 | 0 | 77 test files, 1,759 tests, smoke passed | `evidence/WP5-AC13/verify.txt` |
  | WP5-REL checks | Node 24.21.0 | see the WP5-REL brief | EN/VI parity, env-key check, verify, precommit, preflight, digest | `evidence/WP5-REL/` |

  The exact figures are in the named evidence; WP5-GATE reproduces them on the package-final freeze.
- **AC IDs covered; genuinely unrun/blocked paths:**
  - AC-13 has an integrated test (WP5-AC13) and an independent probe (area A). AC-14 and AC-15 are covered in capture mode and by the WP4 drill and the area B restore.
  - Unrun: real SMTP (reminder repeat, certificate failure, send before the PDF), the NAS target (NOT VERIFIED), the owner's real pilot period, and the section 13 to 16 steps of the runbook (written from the code; no drill stage covers them).
- **Synthetic screenshots/PDF/mail-capture evidence:** PDF renders `*-synthetic.png` and masked capture listings are in `evidence/WP5-ASSESS-A/`. The exact pilot email and PDF samples belong to WP5-PILOT and do not exist yet.
- **Findings resolved, remaining defects and optional backlog:**
  - Resolved: WP5-B-01 (Compose binding) and WP5-B-02 (env file kept with off-device backups) by WP5-FIXB, pending the independent recheck.
  - Risks carried into the release notes ([12 Release notes](../../docs/12_RELEASE_NOTES.md)): R-WA1 to R-WA3 and R-WA8, R-B5-1, R-B5-2, R-B5-4, and the pilot-relevant items of [WP5-PLAN](tasks/WP5-PLAN.md) section F.
  - Governance backlog before the mission status `software_ready`: GOV-RECOVERY (`check_recovery.py` independent of the live status).
- **Owner setup inputs needed, excluding secrets:** the NAS model, DSM version and `uname -m`; data and backup paths; UID and GID; the HTTPS host name and the proxy address; the SMTP provider and mode and the sender address; payroll recipient addresses and the owner's own address for the first send; the 2027 company holiday list; an opening balance with evidence, if any. Real values stay in the owner's private copy outside git.
- **Open owner decisions (all pending; each is recommended, none is decided):** the full table is in [WP5-PLAN](tasks/WP5-PLAN.md) section D.

  | ID | Recommended option (owner decision pending) |
  |---|---|
  | D-1 (R-A3) | Keep the rule: an older build runs with `JOB_RUNNER=off` until reconciliation |
  | D-2 (WP4-I-1) | A draft period never receives imported days (current) |
  | D-3 (WP4-I-2) | Import "Off day (overtime used)" as Off with no ledger effect, if history is imported before the pilot; otherwise keep skip |
  | D-4 (WP4-I-3) | An unended period is not imported (current) |
  | D-5 (WP4-I-4) | Allow a reasoned correction of the opening balance to a net zero, if one is recorded |
  | D-6 (WP4-I-5) | A quota of 20 uncommitted previews per person, after the pilot (before it if others are onboarded) |
  | D-7 (WP3 carry 1) | Accept at-least-once reminders after a crash on real SMTP |
  | D-8 (WP3 carry 2) | Classify a TLS certificate failure as a permanent configuration fault (subject to the assessment) |
  | D-9 (E-11) | Owner-only pilot, temporary password out of band; a change-password route before anyone else |
  | D-10 | One evidence-backed opening balance or zero; no historical import for the pilot |
  | D-11 | Tracked documents hold placeholders; real values in the owner's private copy |
  | D-12 | Staged first period: manual sign-off, first real send to the owner's own address, auto-submit off, no activation instant; automation from the next period |
  | D-13 | The NAS host stays NOT VERIFIED until the owner ticks the docs/11 checklist |
  | D-14 | Declare the first release at the owner's pilot authorization; fixes then go through branches and pull requests; agents create no tag |
  | D-15 (F-Q6) | Keep the removed holiday-preview counts removed |
- **Production actions and explicit authorization, normally none:** none. No deployment, no real email, no real data. `PRODUCTION_SENDING_ENABLED` is never set and the activation instant is empty. Owner authorization is not requested and not given.
- **Usage/credits only if actually observable:** not observable in this session.
- **One next action and matching prompt:** run WP5-GATE (verifier) on the WP5-REL freeze commit as in [WP5-PLAN](tasks/WP5-PLAN.md) section E, using [WP5_REVIEW](../prompts/WP5_REVIEW.md) for the later audits.

## Orchestration provenance

- **Mission/task IDs and board/checkpoint:** mission `timesheet-software-readiness`, package WP5; tasks WP5-PLAN, WP5-ASSESS-A, WP5-ASSESS-B, WP5-FIXB, WP5-FIXB-FREEZE, WP5-AC13, WP5-AC13-FREEZE and WP5-REL. Board: [ORCHESTRATION.json](ORCHESTRATION.json); checkpoint: [WORKFLOW_REVISION_CHECKPOINT.md](WORKFLOW_REVISION_CHECKPOINT.md).
- **Implementer and independent auditor identities; separate contexts:** every task ran in its own subagent context. The two assessment auditors authored no change. The final audit must be a fresh context that authored no WP5 change, including this one.
- **Current verified/reviewed digest; review report and decision:** reviews of the candidate: [WP5_REVIEW_A](WP5_REVIEW_A.md) (PASS) and [WP5_REVIEW_B](WP5_REVIEW_B.md) at `546cdda`, digest `26fcc969…`. No review of the package-final freeze yet.
- **Remaining tasks/dependencies; one next coordinator action:** WP5-REL freeze, WP5-GATE, WP5-PILOT, WP5-FINAL-AUDIT, WP5-ACCREC, WP5-ACCEPT, then GOV-RECOVERY. Next coordinator action: dispatch the freeze of WP5-REL, then WP5-GATE.
- **Software readiness and pending owner pilot authorization separately:** software readiness of WP5: written and not yet gated or finally audited. Owner pilot authorization: not requested and not given. The NAS is NOT VERIFIED.

## Acceptance record

(Empty. WP5-ACCREC fills this section after WP5-FINAL-AUDIT passes.)
