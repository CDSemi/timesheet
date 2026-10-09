WP5-UX-AUDIT-A4 evidence index (area A recheck of WP5 on edaaa852370128ca9bdf206d730f3849346ba994)

Auditor: self-reported model claude-opus-5-5 (board agent a093657a860461489); fresh context; authored
nothing in the redesign round and ran no gate or earlier audit of it.
Masking: <task> = the task folder, <project> = the repository, <user-home> = the user profile,
<scratch> = the harness scratch folder. All text is LF (38-evidence-check.txt, final run over the whole
folder: 85 files, 0 CR bytes, 0 user-profile paths, 0 user names, 0 e-mail addresses outside
example.invalid; the 8 path-pattern hits are the rule texts inside mask.mjs.txt and check-evidence.mjs.txt).
Data: synthetic accounts on example.invalid only; no screenshot was taken.
Runtime: Node v24.21.0 portable first on PATH; Git Bash; TEMP/TMP/DATA_DIR/DATABASE_PATH in <task>.
The e2e fixtures start each built server on a free loopback port chosen by the OS (the harness's own
choice, as in earlier gates and audits); I started no server of my own. Every harness work folder
(timesheet-e2e-*) was removed by the harness after its server exited; nothing is left running.

Digest (digest of record b7bbcbc0a5bbb097a5547b441d1228f20963445e86b0429169cb7ab47980a873, 789 files)
  00-digest.txt               before (first commands: ls-tree of edaaa85, npm run digest in the repository,
                              clean git-archive export hashed with git hash-object --no-filters, path/blob
                              list equal to ls-tree) and after (export re-hashed, ls-tree of HEAD,
                              scripts/source-digest.mjs; repository unchanged outside handoff/)
Mandatory checks (clean git-archive export of edaaa85)
  01-npm-ci.txt  02-npm-test.txt  03-build.txt  04-e2e.txt  04b-e2e-per-spec.txt  05-ac13.txt
  06-npm-audit.txt  07-typecheck-lint.txt
Delta proof (a2ea7a4..edaaa85, FIX5) and the business boundary since 014bd47
  10-delta.txt                full diff outside handoff/ (6 files)
  11-boundary.txt             src/server, src/domain, api.ts, pdf, package, config and scripts diffs
  12-delta-proof.txt          DayEditor.tsx identical outside the mode-switch effect and the new helper;
                              apply() = the old effect body; added lines call no request, setter, callback,
                              submit, click, load, reason or timer; CSS: two token values, only min-width
                              and flex-basis users in the phone .tools .open-day rules; tests: day-editor
                              spec pure insertion, timesheet spec 3 phone-layout lines changed
  13-callsites.txt            client API call sites 014bd47 vs edaaa85 and a2ea7a4 vs edaaa85
  14-body-builders.txt        request-body builders 014bd47 vs edaaa85 and a2ea7a4 vs edaaa85
  15-client-files.txt  16-client-arith.txt   client files changed since 014bd47; arithmetic scan
Builds for comparison
  20-export014-build.txt      npm ci and build of a clean 014bd47 export
Own probes (sources: common.ts.txt, probe.config.ts.txt, probe-a4-*.spec.ts.txt, probe014*.txt)
  30-deferred-run1.txt        probe-a4-deferred, desktop: 13 passed (saves after a deferred switch,
                              controls, unmount, R2)
  30-deferred-run2.txt        the same, rerun with the request sequences of the controls recorded: 13 passed
  31-probe-edaaa85-run1.txt   all probe-a4-* specs on 1280, 1024 and 390: 31 passed, 26 skipped by design
                              (the 13 desktop-only deferral tests in the tablet and mobile projects)
  32-probe-014bd47-run1.txt   probe014-a4-* on the 014bd47 build (desktop, mobile): 4 passed
  33-probe-phone.txt          phone controls with the FIX5 tokens at 390/375/360/320: 1 passed
  36-compare.txt              bodies edaaa85 vs 014bd47 and deferred vs control: mismatches=0
  37-summary.txt              per-layout facts (AC-04, AC-16/AC-01, R-07, privacy, phone controls)
  38-evidence-check.txt       CR and sensitive-content check of this folder
  deferred-*.json.txt         scenarios A, A0, A1, B, C, D, D0, E, F, G, H-deferred, H0-control
  r2-desktop.json.txt         A2/A3 risk R2 re-judged
  bodies-*.json.txt  leave-*.json.txt  ac04-*.json.txt  sharing-*.json.txt  r07-*.json.txt
  privacy-*.json.txt  phone-controls-mobile.json.txt
Scripts
  env.sh.txt exdigest.sh.txt delta-proof.mjs.txt callsites.mjs.txt body-builders.mjs.txt
  client-arith.mjs.txt compare.mjs.txt summary.mjs.txt mask.mjs.txt check-evidence.mjs.txt
  package.json.txt (probe folder: "type": "module")
