WP5-UX3-REGATE5 evidence (masked LF text). Target 8e557100d16b6b6eb86a48e00276835761aabfdf, digest 507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6 (833 files). Decision: PASS.
Index:
- digest-lstree-before, digest-export-before, digest-npm-before, digest-export-after, digest-npm-after: digest from git ls-tree, clean git archive export (no .git), npm run digest; all equal, before and after.
- scope-names, scope-stat: git diff 5c101c1..8e557100 outside handoff/ = tests/e2e/hover.spec.ts only (2 insertions, 1 deletion).
- cmp-dist, dist-hashes-target, ci-old, build-old: clean builds of 5c101c1 and 8e55710, 236 dist files each, byte-identical.
- ci, lint, test, build, deprecation-count, 10-exits: item 2 install/lint/unit tests (94 files, 2141 tests) /build, all exit 0, 0 deprecation lines.
- full-real, e2e-times: one real-clock full e2e, desktop 329 passed, mobile 322 passed, 67 skipped, 0 failed, exit 0, 16.7 min; no ERR_NO_BUFFER_SPACE line; no rerun needed.
- ring-x30: keyboard focus ring test, desktop, repeat-each 30, 2 workers: 60 passed (2 matching tests x 30), exit 0.
- validate_package, validate_orchestration, check_recovery (count 106), validate-exits: all exit 0.
- procs: leftovers (only the shell's own bash/powershell mention the task folder).
Slips: first npm attempt used the Program Files npm shim (Node 26, EBADENGINE, exit 1); rerun with Node 24 first and the user-level npm dir on PATH. One `npm exec node --version` probe fetched a node@26 package into the npx cache. Earlier probe lines used `| head -0` in two commands. No stdin to node or python, no heredoc, no rm -r, no PID kill.
