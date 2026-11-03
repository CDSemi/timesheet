WP5-CALDEF-AUDIT evidence (independent audit of the R-UX5I2-3 round on b810ba942c608e058bd8c146de6f076734c48bf2 / 59e2ec3f)

Auditor: claude-opus-5-5 (self-reported), board agent a4507aa2a7bba058d. Review: handoff/delivery/WP5_CALDEF_REVIEW.md (+ .vi.md).
Task folder <task> (outside the repository). Every file here is masked LF text written by mask.mjs.txt (ANSI, CR, <user>, <task>, <repo>,
<claude-tmp>, and any email address that is not a full synthetic @example.invalid one). Node v24.21.0 (portable) for every check
(03-node-version.txt); see 99-slips.txt for two count/version calls that ran on the system Node. Scripts and probes are kept as *.sh.txt,
*.mjs.txt and *.ts.txt; the task-folder copies ran. Exports: export (clean target, mandatory checks), export-acc (a54061f, dist compare),
export-probe (target copy for probes), export-mut (target copy for mutants).

Identity
- 00-head-before.txt, 00-head-after.txt; 00-nonhandoff-status-before.txt, 00-nonhandoff-status-after.txt (empty).
- 01-digest-{export,lstree,npm}-{before,after}.txt: 59e2ec3f...0770a, 885 files, in the three forms (digest.sh.txt).
- 01-author-models.txt: actual_model values on the board (claude-opus-5-5 the strongest).
- 20-*.txt, 21-diff-check.txt, 22-diff-*.txt: name-status, diffstat and the diffs a54061f..target (src, tests, docs, scripts, the
  classic-scrollbar and day-editor spec changes), 300d61f..target (one test path), diff --check exit 0.

Mandatory checks (chain-main.sh.txt, progress in chain-main-progress.txt)
- 03-core-exits.txt, 03-ci.txt, 03-typecheck.txt, 03-lint.txt, 03-npmtest.txt (103 files, 2,425 tests), 03-build.txt (no advisory).
- 04-e2e-full-real.txt, 04-e2e-counts.txt: real-clock FULL, both projects, --workers=6: desktop 508/37/0, mobile 429/116/0.
- 05-ac13-pacific-chatham.txt: AC-13 under Pacific/Chatham (run-tz.mjs.txt, tzprobe.mjs.txt), 1/1.
- 08-seven-1027.txt, 08-seven-counts.txt: seven files at 2026-10-27T06:58:30Z through the FIX10 wrapper (shiftclock.mjs.txt;
  30-shiftclock-identity.txt: byte-equal to evidence/WP5-UX-FIX10/shiftclock.mjs.txt), --workers=6: desktop 234/16/0, mobile 166/84/0.
- 10-census-*.txt: inline read-only process samples (names, ids, CPU times only; census.sh.txt, census.mjs.txt, cens.sh.txt).

Probes (probe.sh.txt, probe-r2.sh.txt; progress in probe-progress.txt)
- zz-audit-caldef.test.ts.txt (API, vitest, 10 tests): 40-vitest-probe*.txt and the observations 40-vitest-obs.txt (process zone of the
  host) and 40-vitest-obs-kiritimati.txt (Pacific/Kiritimati, UTC+14); 40-probe-exits.txt.
- zz-audit-caldef.spec.ts.txt (browser, private servers, axe-core 4.14.0 from the task folder, axe.min.js SHA-256 in 46-axe-identity.txt):
  41-e2e-probe.txt (first run; E2 and desktop E4 failed on probe mistakes, see 99-slips.txt), 41-e2e-probe-run2.txt (E2 and desktop E4
  after the fix), observations 41-obs.txt and 41-obs-run2.txt.
- 42-classic-scrollbar-left-1106.txt and -right-1104.txt: the whole classic-scrollbar spec at 2026-11-06T18:00Z (left dock) and
  2026-11-04T18:00Z (right dock), desktop: 3/3 each.
- 43-caldef-la-midnight.txt (2026-11-03T07:58:30Z, crossing LA midnight) and 43-caldef-dst-end.txt (2026-11-01T08:50Z): the round's
  calendar-default spec, both projects: 45 passed / 5 skipped / 0 failed each. 44-probe-counts.txt.
- 45-dist-compare-a54061f-target.txt, 45-dist-exits.txt: clean builds of a54061f and the target (distcmp.mjs.txt).
- 60-smoke-proof-target.txt, 60-smoke-proof-a54061f.txt: recentMonday() against an Intl oracle every 15 minutes over 2026-2027
  (smoke-proof.mjs.txt).

Mutants (mutate.mjs.txt, mutrun.sh.txt, mutsum.mjs.txt)
- 50-mut-apply.txt (each applied once and restored byte-equal), 50-mut-exits.txt, mut-progress.txt, 51-mut-summary.txt (per mutant
  and log: the counts and the failing tests), 52-log-mut-*.txt (the suite, the API probe, the e2e runs, and the observations of the E2
  probe under S7), 53-mut-restored.txt (export-mut src/tests/scripts equal to the clean export and its rebuilt dist equal to the target
  build). The readings are in the review, section 8.

Other
- finalize.sh.txt: the identity after, the restore proof, the summaries and this masked copy.
- 99-slips.txt: rule slips.
