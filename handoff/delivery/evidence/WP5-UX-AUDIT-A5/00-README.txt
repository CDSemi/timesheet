WP5-UX-AUDIT-A5 evidence index (area A recheck of WP5 on 5e104e14dad71268a9185920c04ed0ee2a4b31c2)

Auditor: self-reported model claude-opus-5-5 (board agent ac1e9366098766ce1); fresh context; authored nothing in
the redesign round and ran no gate or earlier audit of it. The strongest author model of the snapshot is
claude-opus-5-5 (WP5-UX-PLAN, T02, T04, FIX5); FIX6 ran on claude-sonnet-5-5.
Masking: <task> = the task folder, <project> = the repository, <user-home> = the user profile, <scratch> = the
harness scratch folder. All text is LF (38-evidence-check.txt).
Data: synthetic accounts on example.invalid only; the shared-path UUIDs are ids of throwaway test databases. No
screenshot was taken by this audit (the mandatory focus-ring e2e wrote its own six *-synthetic.png into <task>/shots;
they are not copied here).
Runtime: Node v24.21.0 portable first on PATH; Git Bash; TEMP/TMP/DATA_DIR/DATABASE_PATH in <task>. The e2e
fixtures start each built server on a free loopback port chosen by the OS (the harness's own choice, as in earlier
gates and audits); I started no server of my own. Each harness work folder was removed by the harness after its
server exited; nothing is left running.
Slips: one wait loop of mine used "2>/dev/null" on a grep of a task-folder file (no file written; against the
no-/dev/null rule). The first two runs of probe-a5-focus failed on probe design (the "Open day" button is disabled
until a date is typed and cannot take focus; neighbours under the sticky header were counted as covered); the probe
was corrected (date typed first; neighbours compared with and without the ring) and the logs here are the final run.

Digest (digest of record 07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635, 790 files)
  00-digest.txt               before (first commands: ls-tree of 5e104e1 and HEAD, npm run digest, clean git-archive
                              export hashed with git hash-object --no-filters, path/blob list equal to ls-tree) and
                              after (export re-hashed and unchanged, ls-tree of HEAD, npm run digest, no change outside
                              handoff/)
Mandatory checks (clean git-archive export of 5e104e1)
  01-npm-ci.txt  02-npm-test.txt  03-build.txt  04-e2e.txt  04b-e2e-per-spec.txt  05-ac13.txt  06-npm-audit.txt
  07-typecheck-lint.txt
Delta proof (edaaa85..5e104e1, FIX6) and the business boundary since 014bd47
  10-delta.txt                commits, non-handoff paths per commit, full diff outside handoff/
  11-boundary.txt             src/server, src/domain, api.ts, pdf, package, config, scripts, fixtures diffs
  11b-dist-server.txt         built dist/server and dist/domain hashed for 014bd47, edaaa85 and 5e104e1
  12-delta-proof.txt          auditor notes: zone note, requests/bodies, CSS, tests, each with its evidence
  12a-css-rules.txt           declaration-level CSS diff (css-rules.mjs)
  12b-due-zone-probe.txt      20316 instant/zone checks incl. 59 DST transitions, 7 device zones (due-zone-probe.ts)
  12c-tests-delta.txt         removed test lines; formatter users at both commits
  13-callsites.txt  14-body-builders.txt  16-client-arith.txt
Builds for comparison
  20-export014-build.txt  21-exporteda-build.txt
Own probes (sources: common.ts.txt, *.config.ts.txt, probe-a5-*.spec.ts.txt, probe014-a5-*.spec.ts.txt,
probeeda-a5-*.spec.ts.txt, zonenote-body.ts.txt)
  30-bodies-5e1.txt           bodies of clock, sign-off, batch, picker, day fields, session: 3 passed (1280/1024/390)
  31-probe-5e1-main.txt       A-01 leave, AC-04, AC-16/AC-01, R-07 (with the zone-note due time), privacy: 15 passed
  32-bodies-014.txt  32b-leave-014.txt   the same flows on 014bd47: 2 + 2 passed
  33-focus-5e1.txt  33b-focus-eda.txt    focus-ring probe on 5e104e1 and on the edaaa85 build: 6 + 6 passed
  34-zonenote-5e1.txt  35-zonenote-eda.txt   zone-note due time, 8 zones x 7 periods: 3 + 3 passed
  36-compare.txt              bodies 5e104e1 vs 014bd47 and zone notes 5e104e1 vs edaaa85: mismatches=0
  36b-focus-compare.txt       focus probe 5e104e1 vs edaaa85: mismatches=0 (one hover-only note)
  37-summary.txt              per-layout facts (AC-04, AC-16/AC-01, R-07, privacy, focus)
  38-evidence-check.txt       CR and sensitive-content check of this folder
  *.json.txt                  raw probe results
Scripts
  env.sh.txt exdigest.sh.txt run-checks.sh.txt run-e2e.sh.txt run-probe.sh.txt tree-hash.sh.txt css-rules.mjs.txt
  due-zone-probe.ts.txt callsites.mjs.txt body-builders.mjs.txt client-arith.mjs.txt compare.mjs.txt
  focus-compare.mjs.txt summary.mjs.txt mask.mjs.txt check-evidence.mjs.txt package.json.txt
  (callsites, body-builders and client-arith are the WP5-UX-AUDIT-A4 scripts, reused unchanged as a method)
