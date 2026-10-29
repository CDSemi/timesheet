# Recheck of F-UX5RN-1 after WP5-UX5-FIX20 on a54061f (WP5-UX5-RECHECK-RN)

[Tiếng Việt](WP5_UX5_RECHECK_RN.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5, the documentation-only fix WP5-UX5-FIX20 (frozen as WP5-UX5-FIX20-FREEZE)
  of finding F-UX5RN-1 of [WP5-UX5-AUDIT-RN](WP5_UX5_REVIEW_RN.md); task WP5-UX5-RECHECK-RN, attempt 1, 2026-10-29 from about 18:27Z to
  18:45Z. Reviewer self-reported model `claude-opus-5-5` (board agent `a099171a27b8df25c`), profile timesheet-auditor (effort set by
  the profile, not observable from inside). The author models on the board are `claude-opus-5-5`, `claude-sonnet-5-5` and one
  `claude-haiku-4-5-20251001`; FIX20, its freeze and REGATE16 are `claude-sonnet-5-5`; the strongest is `claude-opus-5-5`, so the
  reviewer is not weaker. The board names this agent id only on this task.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `reviewed_commit`
  `a54061f6afc1fda00d4ee2cca4553a5916af24ec` (WP5-UX5-FIX20-FREEZE, pushed; WP5-UX5-REGATE16's `freeze_commit`). HEAD, the local
  `origin/main` and the remote `main` (`git ls-remote`, read only) are that commit before (18:27:58Z) and after (18:41:28Z); no status
  line outside `handoff/`. Digest `690fd8fd588c902f03cbc9c6efeb63cd58f5c9246579dda0473a190a230c1c4f`, 882 files, `handoff/` excluded,
  equal before and after in three forms (a clean `git archive` export hashed with `git hash-object`, whose sorted lines are byte-identical
  to the `git ls-tree` form; the `git ls-tree` form of the target; `npm run digest` in the repository) and in `npm run digest` in a clean
  clone of the target. No unpushed commit. Source complete: `npm ci` exit 0 in both build exports.
- **Decision: PASS.** F-UX5RN-1 is fixed, R-UX5RN-1, -2, -3 and -5 are done and accurate, and there is no new finding:
  - the diff from dc487c6 outside `handoff/` is exactly FIX20's six documentation files (8 lines in, 8 out); no source, test or build file
    reads them, and clean builds of dc487c6 and the target give an identical `dist/` (250 files), so AUDIT-INT3's product verdict and
    AUDIT-RN's verdict on the samples carry forward;
  - DEVELOPMENT line 3 (EN and VI) states the README's status word for word and names the WP5 handoff; my own search finds no tracked
    document outside `handoff/` that says a package or round still awaits its gate or audit or is not accepted;
  - docs/12:7 gives one release rule; docs/12:119 restores the slices' checks and names the Dockerfile and `vite.config.ts`, which are
    unchanged since 1fe5ad3; README step 3 reads naturally and the VI list has its comma;
  - AUDIT-RN's other verdicts hold on the diff 0b45781..a54061f outside `handoff/`; EN and VI agree and every link resolves.

  The mandatory checks pass. This PASS supersedes WP5-UX5-AUDIT-INT3 (PASS on 0b45781 / 67aa715c) as the current acceptance of WP5, and
  the release is the FIX20 freeze commit a54061f. Section 5 lists what ACCEPT-DOCS must make true.

## Scope actually inspected and executed

1. Read as claims, not proof: the brief; AGENTS.md from disk; the AUDIT-RN review pair (finding, risks, section 6); the FIX20,
   FIX20-FREEZE and REGATE16 briefs, Results and evidence; the board entries of REGATE11 to REGATE16, AUDIT-INT3, AUDIT-RN, RELNOTES,
   FIX20, FIX20-FREEZE and the `superseded_by` of RECHECK-A2 and RECHECK-B3; DEVELOPMENT, README, docs/12 and their VI pairs at 0b45781,
   dc487c6 and the target (full text and diffs); docs/04, 05, 06, 07, 09, 10 and 11 for status statements and docs/08 for the meaning of
   a freeze commit; the pilot packet (sections 0 to 11) and the WP5 handoff (outline and records) at HEAD; REGATE15's sample files;
   REGATE11's drill log; the name-status records of REGATE12 to REGATE14; the round-5 slice records T03 and T05B (spot check).
2. Clean `git archive` exports of the target and of dc487c6, each with its own `npm ci` and `npm run build`; two pristine exports of the
   target for the export-form digest before and after (the first also for the link check); a clean clone of the target for
   `npm run digest`.
3. The mandatory checks in the target export, one after another: typecheck, lint, build, `npm test`; the `dist/` comparison after the two
   builds and again after the core build.
4. After writing this pair, `validate_package.py --preflight` with the workflow Python (PASS, exit 0: 142 pairs, 2,420 local links).

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX5-RECHECK-RN/` (index `00-README.txt`); my scripts are `90-*.txt`,
my rule slips `99-slips.txt`.

| Command or probe | Result / exit | Evidence |
|---|---|---|
| HEAD, local `origin/main`, `git ls-remote origin refs/heads/main`, status outside `handoff/`; digest before and after (ls-tree, `npm run digest`, export); `npm run digest` in a clean clone | a54061f everywhere; 0 lines; `690fd8fd…1c4f`, 882 files, every form, before and after | `01-*` |
| `git diff --name-status`, `--stat` and `--check` of dc487c6..a54061f outside `handoff/`; the same range on the package files, `.npmrc`, Dockerfile, `vite.config.ts`, `src`, `tests`, `scripts`, `migrations` | exactly the six documentation files, 8+/8-; check exit 0; no other path | `10-scope.txt`, `11-diff-dc487c6-target.txt` |
| `git diff --stat 1fe5ad3 a54061f -- Dockerfile vite.config.ts` (with the compose and package files); `git log 1fe5ad3..a54061f -- Dockerfile vite.config.ts` | empty, exit 0; no commit | `10-scope.txt` |
| readers of the six files in `src`, `tests`, `scripts`, `package.json` and the build files | none (the hits name other README files) | `32-consistency.txt` |
| clean `npm ci` and `npm run build` of a54061f and dc487c6 | all exit 0; no chunk advisory, deprecation or warning line except the npm notice below | `02-builds.txt` |
| `dist/` dc487c6 vs a54061f | 250 files each (client 18, domain 48, server 184), every path and SHA-256 equal, after the builds and after the core build | `20-dist-compare.txt` |
| typecheck, lint, build, `npm test` in the target export | 0, 0, 0, 0; 101 files, 2,397 tests | `03-core.txt` |
| links and EN/VI parity of the six files (pristine export) | 13/13, 35/36 and 51/51 local links, 0 missing; headings 9/9, 4/4, 11/11; SHAs and IDs equal; link sets equal except the README.vi.md back-link | `30-doccheck.txt` |
| stale-status search of the 58 project Markdown files outside `handoff/` (373 with the vendored skills) | no package or round status claim; only decision-time wording in docs/10 (R-UX5RN2-3) | `31-stale-search.txt` |
| target digest or SHA in a tracked file outside `handoff/` | absent; the only 64-hex value is the historical `1e59ad31…` in docs/12:7 | `32-consistency.txt` |
| board: gates, audits, supersession | REGATE11 FAIL on 1fe5ad3; REGATE12, 13, 14 PASS on a5cbc91, d96df5d, 0b45781; AUDIT-INT3 PASS on 0b45781; RECHECK-A2 and B3 `superseded_by` AUDIT-INT3; REGATE15 PASS on dc487c6; AUDIT-RN FIX REQUIRED; REGATE16 PASS on a54061f | `33-board-lines.txt` |
| REGATE11's drill log; REGATE12 to 14 name-status | 209 PASS, 0 FAIL (33/32/57/35/27/23); no Dockerfile or `vite.config.ts` in any of the three lists | `evidence/WP5-UX5-REGATE11/log-drill.txt` line 233; `evidence/WP5-UX5-REGATE1[234]/20-namestatus.txt` |
| REGATE15's samples against pilot packet section 3 | the six PDF SHA-256 values and the file names are those AUDIT-RN listed; the packet still names T06 | `40-samples-and-packet.txt` |
| the `npm ci` notice "allow-scripts setting is being ignored" | from a user-level npm configuration: the repository `.npmrc` holds only `engine-strict` and `save-exact`; not a deprecation; the same in REGATE14 to REGATE16 | `04-node-npm.txt`, `02-builds.txt` |
| `validate_package.py --preflight` after writing this pair | PASS, exit 0; 142 pairs, 2,420 local links | `62-preflight.txt` |
| leftover check | no node process runs from the portable Node 24 build this task used; this task started no browser or server | `60-leftover-check.txt` |

## 1. Identity and scope

`git diff --name-status dc487c6..a54061f -- . ':!handoff'` lists exactly `DEVELOPMENT.md`, `DEVELOPMENT.vi.md`, `README.md`,
`README.vi.md`, `docs/12_RELEASE_NOTES.md` and `docs/12_RELEASE_NOTES.vi.md`, the paths FIX20 owns. No package, lockfile, `.npmrc`,
Dockerfile, `vite.config.ts`, source, test, script or migration changed, and no source, test or build file reads the six files. Clean builds
of both commits are byte-identical (250 files). So:
- AUDIT-INT3's verdict on the product (0b45781 / 67aa715c) carries forward, through dc487c6 (AUDIT-RN, identical build) to a54061f;
- AUDIT-RN's verdict on the samples carries forward: they were generated from dc487c6, whose tree differs from the release only in these
  six Markdown files and whose build is identical, so they represent the release without regeneration;
- REGATE14's runtime items and REGATE11's drill and `npm audit` carry forward as REGATE16 recorded.

Confirmed.

## 2. F-UX5RN-1

- **Line 3.** `DEVELOPMENT.md:3` now reads "Status: **WP1 to WP4 independently accepted; WP5 software ready (independently accepted, and
  re-accepted after UI change rounds 1 to 5); pilot pending and NAS NOT VERIFIED.**" This is README.md:3's status character for character,
  and it agrees with README.md:12 and :54. `DEVELOPMENT.vi.md:3` is README.vi.md:3's status word for word. Both name the WP5 handoff first
  (`.vi.md` in VI); the rest of the line is unchanged.
- **Against the board.** WP1 to WP4 accepted (WP4-RECHECK-A and B4 PASS on 546cdda, as AUDIT-RN recorded), WP5 accepted (WP5-RECHECK PASS
  on 014bd47) and re-accepted after rounds 1 to 5 (AB9, UX2-AUDIT2, UX3-AUDIT-INT and AUDIT-INT3 PASS); the pilot has not run and every
  gate keeps the NAS NOT VERIFIED. Correct.
- **My own search.** Over the target tree, every tracked Markdown file outside `handoff/` (58 project files; with the vendored skill
  folders 373): "not accepted", "awaiting", "not yet gated", "needs its own gate", "in progress", "refreshed only after", "do not begin",
  the VI forms ("chưa được chấp nhận", "đang chờ", "đang diễn ra", "cần cổng kiểm", "chỉ được làm mới sau") and wider combinations of
  gate or audit with a pending word. No line states that a work package or UI round awaits its gate or audit or is not accepted. The only
  near hits are the decision records docs/10:183, :187 and :221 (and VI :184, :188, :222), which say what a round needed before its release
  identity was refreshed; that requirement was met and the lines do not claim it is still open (R-UX5RN2-3). REGATE16's two hits
  (docs/07:36, docs/10:163) are mail acceptance and restore rules, as it said.

F-UX5RN-1 is closed.

## 3. The other FIX20 changes

- **R-UX5RN-1, docs/12:7.** One rule: "The release is the last WP5 freeze commit, gated and audited." "The release is that commit" is gone,
  and so is "the WP5 package-final freeze commit". docs/08:73 separates a freeze commit (after an implementation or fix task, before its gate
  and audit) from an accept commit (after the audit PASS), so the later ACCEPT-DOCS and ACCEPT commits are not candidates. 0b45781 is named
  only as the commit on which REGATE14 and AUDIT-INT3 passed, followed by "documentation-only commits, each gated and audited again"; no
  reading makes it the last freeze commit. No digest of the tree is written; the historical `8e99d2c` / `1e59ad31…` / 777 sentence and the
  rule that a document cannot hold its own digest stay. "Each gated and audited again" is true: dc487c6 (REGATE15 PASS, AUDIT-RN FIX
  REQUIRED) and a54061f (REGATE16 PASS, this recheck). The sentence names the notes and the README but not DEVELOPMENT, which a54061f also
  changed; true but incomplete (R-UX5RN2-1). VI states the same.
- **R-UX5RN-2, docs/12:119.** "they ran typecheck, lint, unit, integration, the full e2e and the built-server smoke" is the clause of
  0b45781 word for word (VI the same facts), joined to "The slices of round 5 did not run it", which is true. The old claim that the drill
  had not run is not back. The slice records agree (T03 and T05B: verify with tests, build and smoke, then the full e2e on both projects).
- **R-UX5RN-3, docs/12:119.** "`package.json`, the lockfile, the Dockerfile and `vite.config.ts` did not change in those commits":
  `git diff --stat 1fe5ad3 a54061f` on these files is empty and `git log 1fe5ad3..a54061f` on the Dockerfile and `vite.config.ts` lists no
  commit. The sentence attributes the showing to REGATE12, 13 and 14: their complete name-status lists (1fe5ad3..a5cbc91, a5cbc91..d96df5d,
  d96df5d..0b45781) contain neither file, and each recorded zero package or lockfile diff lines. Accurate.
- **R-UX5RN-5, README step 3.** EN: "the WP1 handoff, the WP2 handoff, the WP3 handoff, the WP4 handoff and the WP5 handoff"; VI has the
  comma between the WP2 and WP3 links. Every link is kept.

Nothing true was lost: the 8 removed lines are replaced one for one, and every fact of the old lines is in the new ones, apart from the
removed "The release is that commit" and "WP4 … awaiting … not accepted".

## 4. AUDIT-RN's other verdicts at the target

The diff I checked is `git diff 0b45781..a54061f -- . ':!handoff'`: DEVELOPMENT, README and docs/12, each EN and VI (it contains RELNOTES'
diff and FIX20's).
- **Every changed statement** against the board: the round lines (WP5-UX-REGATE8 and AB9; WP5-UX2-REGATE2 and AUDIT2; WP5-UX3-REGATE5 and
  AUDIT-INT; round 4 folded into REGATE14 and AUDIT-INT3 by Q0 a; round 5 REGATE14 and AUDIT-INT3 on 0b45781, superseding RECHECK-A2 and
  B3); the drill line (REGATE11 on 1fe5ad3, decision FAIL, 209 PASS / 0 FAIL in its log; REGATE12 to 14 on a5cbc91, d96df5d and 0b45781);
  the README status lines. All hold.
- **No limit lost.** The only hunk under "Known limits" is the drill and samples pair at :119-120; every other limit line is unchanged
  since 0b45781. The dropped "the drill, the clean-export verification and the independent audits belong to the package-final gate" was a
  plan, now replaced by what happened.
- **Consistency.** docs/04 and 05 hold no release or acceptance status; docs/06 and 09 state rules ("software ready/pilot pending") that
  agree; docs/11:289 keeps the NAS NOT VERIFIED; docs/10 holds decision records only. The pilot packet and the WP5 handoff are stale in the
  places listed in section 5; that is ACCEPT-DOCS's scheduled work, not a defect of this change. One pre-existing loose pointer in docs/11:34
  is R-UX5RN2-2.
- **EN/VI and links.** Headings, SHAs, IDs and link targets agree in the three pairs; none of the 199 local links is missing.

## 5. Forward references and pilot packet statements for ACCEPT-DOCS

**Sentences at the target that ACCEPT-DOCS must make true** (R-UX5RN-4, updated):

1. docs/12:7 (EN/VI): "Its SHA, its source digest … and its file count are recorded in the WP5 handoff and in the gate record." The gate
   record (REGATE16) has them; the WP5 handoff must record `a54061f6afc1fda00d4ee2cca4553a5916af24ec`,
   `690fd8fd588c902f03cbc9c6efeb63cd58f5c9246579dda0473a190a230c1c4f` and 882 files.
2. docs/12:7 "documentation-only commits, each gated and audited again" with docs/12:20 "the current acceptance is the one named in
   'Release identity'": the WP5 handoff should name dc487c6 (REGATE15 PASS, AUDIT-RN FIX REQUIRED) and a54061f (REGATE16 PASS,
   WP5-UX5-RECHECK-RN), and say that this recheck is the current acceptance and carries AUDIT-INT3's product verdict.
3. docs/12:19 ("The acceptance record of WP5 is in the WP5 handoff"), README.md:12 / README.vi.md:12 ("re-accepted after UI change rounds 1
   to 5 (see their handoffs)"), README:54 ("see DEVELOPMENT and the handoffs") and DEVELOPMENT:3 ("See the WP5 handoff"): the WP5 handoff
   needs a "Re-acceptance after UI change rounds 4 and 5" section (it ends at round 3 today).
4. README:12 "The next step is the owner's review of the pilot packet": the packet must name the release (item 6 below).
5. docs/12:120 (EN/VI) "The pilot samples and their provenance are in the pilot packet section 3": section 3 must describe REGATE15's
   samples (items below).

**Pilot packet section 3.** AUDIT-RN's section 6 is still the complete list for section 3, with one change: the samples were generated from
dc487c6 (WP5-UX5-RELNOTES-FREEZE, REGATE15), which is not the release. Items 1 and 2 should therefore say that the release a54061f differs
from dc487c6 only in six Markdown files and builds byte-identically (REGATE16 and this recheck), so the samples represent the release
without regeneration; the old "freeze of the round-5 slices … regenerated from the release commit" sentence goes. I checked items 3 to 6
against REGATE15's files: the six SHA-256 values (S1 `430344dc…`, S2 `19e8268e…`, S3 `bdafd3e1…`, S4 `fe1778e0…`, S5 `01fede20…`, S6
`04500ec2…`), S3 `msg-10`, S4 `msg-08`, S5 `msg-07`, N1/N2 `msg-02`/`msg-03` and N3/N4 `msg-06`/`msg-09` (note off/on), and the folder
`evidence/WP5-UX5-REGATE15/samples/` are right. R-UX5RN-6 applies (the hashes and some Date headers are values of that run).

**Pilot packet statements outside section 3** (AUDIT-RN named :28, :40, :53 and :84; the full list at HEAD, EN with the same lines in VI):

6. :14-24, the release identity table (round 3: `8e557100…`, `507de97c…`, 833 files, the WP5-UX3-REGATE3 reference image), and :28.
7. :36 and :38, rounds 4 and 5 "in progress", "still needs its gate", "the record will be in WP5 handoff".
8. :40 and :365 (section 11), the evidence index that calls `WP5-UX5-T06/` "the current samples".
9. :53, the section 1 ready check (REGATE15's ready check on dc487c6 gives the same answers), and :84, "the round-5 freeze build".
10. :187 and :191, section 5 restore proof: "refreshed after the round-5 gate, whose drill runs the schema 15 build" and the provenance that
    names 8e55710 and the 208-check drill; the round-5 drill is REGATE11's on 1fe5ad3 (209 PASS, 33/32/57/35/27/23, schema 15), carried
    forward by REGATE12 to REGATE16.
11. :238-240 and :246, the rollback card identity rows.
12. :259 (section 7), :281, :303 and :307 (section 8), "refreshed after the round-5 gate (ACCEPT-DOCS)" and "the release identity waits
    for it".
13. :355 and :356 (section 10): "come from the round-5 slice freeze `69d6340` … regenerated … if the product changes" and "the container
    drill and the independent audits of round 5 belong to the gate and have not run", both no longer true.

## 6. Mandatory checks

All were run in the clean export of the target, one at a time: typecheck exit 0; lint exit 0; build exit 0 with no chunk advisory and no
deprecation warning; `npm test` exit 0 with 101 files and 2,397 tests. The `dist/` comparison with dc487c6 is identical (250 files). No
e2e was run because `dist/` is identical.

## Findings

None. No new finding (F-UX5RN2-n) is raised.

## Risks and optional improvements (not proven defects)

- **R-UX5RN2-1, docs/12:7 names the refreshed files only in part.** "These notes and the README status were then refreshed in
  documentation-only commits" leaves out DEVELOPMENT, which a54061f changed. True but incomplete. Changing it would move the release; let
  the WP5 handoff list what each documentation-only commit changed, and fix the wording in the next source-changing round if wanted.
- **R-UX5RN2-2, docs/11:34 (pre-existing).** The placeholders `<release-commit>`, `<source-digest>` and `<image-id>` are "the release
  identity recorded in section 1 step 8 and in 12 Release notes", while docs/12:7 records only the rule and points to the WP5 handoff and
  the gate record for the values. A loose pointer, not false. Optional, next source-changing round.
- **R-UX5RN2-3, decision-time wording in docs/10.** docs/10:183, :187 and :221 (VI :184, :188, :222) say a round "needs its own gate and a
  fresh independent audit before the release identity is refreshed". It is a requirement of the decision, now met, not a status claim;
  a later round may add "(met; see docs/12)". Optional.
- R-UX5RN-4 (forward references) and R-UX5RN-6 (run-specific sample values) stay with ACCEPT-DOCS, as in section 5.

AUDIT-INT3's optional risks and backlog (R-UX5I3-1..4, R-UX5I2-3 as an owner decision best before the pilot, and the earlier items) are
unchanged, because the product is byte-identical.

## Required gates unrun or blocked

None of the mandatory checks was skipped. Not run by the brief's scope, carried forward on an identical `dist/`: the e2e suites, sweeps,
stress, mutants and axe (REGATE14); the container drill and `npm audit` (REGATE11); the samples and the ready check (REGATE15). The NAS
items stay NOT VERIFIED.

## Disposition of previous findings

- F-UX5RN-1 (Low): closed (section 2).
- R-UX5RN-1, R-UX5RN-2, R-UX5RN-3, R-UX5RN-5: done and accurate (section 3).
- R-UX5RN-4, R-UX5RN-6: open for ACCEPT-DOCS (section 5).
- AUDIT-INT3's PASS on 0b45781 / 67aa715c stays valid for the product; this PASS supersedes it as the current acceptance of WP5.

## Software readiness, owner permission and pilot result

Software readiness of WP1 to WP5 is accepted on a54061f / 690fd8fd (product verdict of AUDIT-INT3 and REGATE14 on a byte-identical
build), with the NAS NOT VERIFIED. Owner permission: not requested or given. Pilot result: none. Nothing was deployed or sent; no server
was started in this recheck.

## One next action

WP5-UX5-ACCEPT-DOCS (handoff only): the rounds 4 and 5 section of the WP5 handoff with the release `a54061f` / `690fd8fd` / 882 files and
the gates and audits of section 5 item 2, and the pilot packet refresh of section 5 (section 3 as AUDIT-RN's section 6 with the dc487c6
note, items 6 to 13), each with its VI pair; then WP5-UX5-ACCEPT.

## Independent subagent provenance

- **Review task, reviewer and authors.** WP5-UX5-RECHECK-RN, attempt 1; reviewer agent `a099171a27b8df25c` (board). The authors of the
  reviewed change are WP5-UX5-FIX20 `af419ae1ef31a1c90` and WP5-UX5-FIX20-FREEZE `af50217df778c8e50`, gated by WP5-UX5-REGATE16
  `a53c375e016629927`, on top of RELNOTES `a68b03f4d8089f7a5` and the WP5-UX4 and WP5-UX5 authors of the product.
- **Fresh context.** I wrote none of the reviewed changes and no WP5-UX4 or WP5-UX5 task or audit. I changed nothing outside this review
  pair, the brief's Results and the evidence folder, and staged or committed nothing.
- **Digest.** `690fd8fd…1c4f` (882 files) before and after, equal in every form (above). Gate evidence for this snapshot: WP5-UX5-REGATE16
  PASS.
- **Report path.** `handoff/delivery/WP5_UX5_RECHECK_RN.md` (+ `.vi.md`); every earlier review is untouched.
- **Finding dispositions and the next coordinator task.** F-UX5RN-1 closed; no new finding; next WP5-UX5-ACCEPT-DOCS, then WP5-UX5-ACCEPT.
