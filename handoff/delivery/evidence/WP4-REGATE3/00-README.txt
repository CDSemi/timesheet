WP4-REGATE3 evidence (verifier, claude-sonnet-5-5). Freeze 972ccda6409a7521a008c55c35a5b5cf416daf1e.
Node v24.21.0 portable (PATH first), Git Bash, Python from the codex runtime (has tzdata) for validators.
DATA_DIR and DATABASE_PATH were set under <task> for every CLI/server run (env.sh.txt). Compose project ts-wp4-regate3.
Files by item: 00-head-*/99-* digest and HEAD before/after; 01 install/audit; 02 verify; 03 e2e; 04 drill (+04a WP3 prep);
07 migrations; 08 races (races.sh.txt); 11 validators; 12 r1/r3/p1b/p7 and HTTP r2/p6/b02; 13 round-1 checks;
14 RB2 probe (E7, Y7 and the RB2 catalogue); 15 FIXB3 search; 15b repeats; 15c E7/Y7 through the FIXB3 probe; 16 RB2 HTTP;
17-18 R-B2-1/R-B2-2 tests and probe; 19-20 differential vs WP4-T09 (13a258d); diffscope; precommit.
Probes are stored as *.mjs.txt: the REGATE2 probes unchanged (r1-cost, r3-bypass, p1b, p6, p7, r2-http, b02, a03, ra1, mig);
new in this run: rb2, strip, mask3. The RB2 and FIXB3 probes (b2-cost, b2-cases, b2-http, b2-diff, cost, cases, b2cases,
search, diff) are the files already tracked under evidence/WP4-RECHECK-B2 and evidence/WP4-FIXB3, used unchanged.
