WP5-UX5-RECHECK-RN evidence index (recheck of F-UX5RN-1 after WP5-UX5-FIX20)

Target: reviewed_commit a54061f6afc1fda00d4ee2cca4553a5916af24ec (WP5-UX5-FIX20-FREEZE), digest
690fd8fd588c902f03cbc9c6efeb63cd58f5c9246579dda0473a190a230c1c4f, 882 files, handoff/ excluded. Previous commit dc487c6. Decision: PASS.
All files are masked LF text: user profile paths and the account name are written <user>. Raw logs stay in the task folder
D:\.claude-tmp\timesheet\WP5-UX5-RECHECK-RN. Node 24.21.0 (portable) for every node and npm call; workflow Python for the preflight.

01-identity-before.txt, 01-identity-after.txt   HEAD, local origin/main, git ls-remote main, status and diff outside handoff/,
                                                 ls-tree digest form, npm run digest in the repository (18:27:58Z and 18:41:28Z)
01-digest-export-before.txt, -after.txt          export-form digest of fresh git archive exports (sorted lines equal to the ls-tree form)
01-digest-npm-clean-clone.txt                    npm run digest in a clean clone of the target
02-builds.txt                                    git archive, npm ci and npm run build of the target and of dc487c6
03-core.txt                                      exits, typecheck, lint, build and npm test logs in the target export (101 files, 2,397 tests)
04-node-npm.txt                                  node/npm resolution with Node 24 first on PATH; the repository .npmrc and allowScripts
10-scope.txt                                     name-status, stat and check of dc487c6..target; package/build/source paths; Dockerfile and
                                                 vite.config.ts since 1fe5ad3
11-diff-dc487c6-target.txt                       the FIX20 diff outside handoff/
12-diff-0b45781-target.txt                       name-status and diff of 0b45781..target outside handoff/ (RELNOTES plus FIX20)
20-dist-compare.txt                              dist/ of dc487c6 vs target: after the builds and after the core build, identical, 250 files
30-doccheck.txt                                  links and EN/VI parity of the six changed files (pristine export)
31-stale-search.txt                              own search for stale package or round status statements (git grep on the target tree)
32-consistency.txt                               SHAs and digests named in docs, readers of the changed files, docs/10 gate wording, docs/08
                                                 freeze and accept commits
33-board-lines.txt                               board lines: ids, freeze and reviewed commits, decisions, superseded_by
40-samples-and-packet.txt                        REGATE15 sample PDF hashes and names, pilot packet and WP5 handoff lines for ACCEPT-DOCS
60-leftover-check.txt                            node and browser processes after the work: names, IDs and CPU seconds only
62-preflight.txt                                 validate_package.py --preflight after writing the review pair
90-*.txt                                         the scripts used (90-mask.mjs.txt shows its own account-name pattern masked)
99-slips.txt                                     rule slips
