"""WF-AUDIT3 own negative/positive probes against validate_orchestration.py at the freeze commit (in memory only).

Usage: python handoff/delivery/evidence/WF-AUDIT3/3-probes.py
Loads the validator, STATE and the nine profiles from the checkout and builds boards in memory from the
working-tree board (coordinator copy during the audit). Never writes the real board.
Each probe prints ACCEPT or REJECT(<message>) next to the expected outcome; exit 1 on any mismatch.
Section D replays WF-AUDIT2 probe D9 (gate/audit commit binding) on the WF-GATE3/WF-AUDIT3 pair.
"""
import copy
import importlib.util
import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[4]
spec = importlib.util.spec_from_file_location("workflow", ROOT / "handoff/delivery/validate_orchestration.py")
v = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v)
BOARD = json.loads((ROOT / "handoff/delivery/ORCHESTRATION.json").read_text(encoding="utf-8"))
STATE = json.loads((ROOT / "handoff/delivery/STATE.json").read_text(encoding="utf-8"))
PROFILES = v.profiles()
FREEZE2 = "c219d79a2c202861b719473cdffb0efb59f14290"
FREEZE3 = "6578df8f81e8c0ead5ec09444b7bd8fa081d1ff7"
DIGEST2 = "d4d49149221e45459937d26bdd1258d681341b73712d8564a852c9131c5429d2"
DIGEST3 = "2f50be649666c785f9fd3db99f67c6d9115ad75b3dda089c36fbfb8d460af7b3"
EVIDENCE = "handoff/delivery/evidence/WF-AUDIT3/0-identity-before.txt"
F01_REPORT = "handoff/delivery/WP1_HANDOFF.md"  # existing file; the real brief is written at dispatch
results = []


def task(board, name):
    return next(item for item in board["tasks"] if item["id"] == name)


def run(board):
    try:
        v.validate(board, STATE, PROFILES)
    except ValueError as error:
        return f"REJECT({error})"
    return "ACCEPT"


def probe(name, board, expected, needle=""):
    outcome = run(board)
    ok = outcome == "ACCEPT" if expected == "ACCEPT" else outcome.startswith("REJECT") and needle in outcome
    results.append(ok)
    print(f"{'ok ' if ok else 'BAD'} | {name} | expected {expected}{'(' + needle + ')' if needle else ''} | got {outcome}")


def passed_audit3():
    """Hypothetical done WF-AUDIT3 PASS on the WF-FREEZE3 commit by a non-author Opus auditor."""
    board = copy.deepcopy(BOARD)
    task(board, "WF-AUDIT3").update(status="done", decision="PASS", actual_model="claude-opus-5-5",
                                    actual_source="self_reported", source_digest=DIGEST3, reviewed_digest=DIGEST3,
                                    evidence=[EVIDENCE])
    board["next_task_id"] = "WP1-F01-FIX"
    return board


print("# A. Real-board controls")
probe("A1 working-tree board as written (WF-AUDIT3 running, reviewed_commit = WF-GATE3 freeze_commit)",
      copy.deepcopy(BOARD), "ACCEPT")
probe("A2 positive control: done WF-AUDIT3 PASS bound to WF-GATE3 (same commit, same digest)", passed_audit3(),
      "ACCEPT")
board = copy.deepcopy(BOARD)
probe("A3 committed history binding: WF-AUDIT/WF-GATE and WF-AUDIT2/WF-GATE2 commits equal",
      board, "ACCEPT")
for audit, gate in [("WF-AUDIT", "WF-GATE"), ("WF-AUDIT2", "WF-GATE2"), ("WF-AUDIT3", "WF-GATE3")]:
    same = task(board, audit).get("reviewed_commit") == task(board, gate).get("freeze_commit")
    results.append(same)
    print(f"{'ok ' if same else 'BAD'} | A4 real board {audit}.reviewed_commit == {gate}.freeze_commit | {same}")

print("# D. Gate/audit commit binding (WF-R-01; WF-AUDIT2 probe D9 replay)")
board = passed_audit3()
task(board, "WF-GATE3")["freeze_commit"] = "f" * 40
probe("D9 replay: done GOV audit PASS, gate freeze_commit differs from reviewed_commit (same digest)", board,
      "REJECT", "Gate freeze_commit differs from audit reviewed_commit")
board = passed_audit3()
task(board, "WF-AUDIT3").update(depends_on=["WF-GATE2"], source_digest=DIGEST2, reviewed_digest=DIGEST2)
probe("D9a WF-R-01 scenario: handoff-only GOV change keeps the digest; new audit reuses the old WF-GATE2", board,
      "REJECT", "Gate freeze_commit differs from audit reviewed_commit")
board = passed_audit3()
task(board, "WF-AUDIT3").update(depends_on=["WF-FREEZE3"], gate_included=True)
probe("D9b done GOV audit with gate_included and no gate dependency", board, "REJECT",
      "Governance audit needs a gate dependency whose freeze_commit equals reviewed_commit")
board = passed_audit3()
task(board, "WF-GATE3").pop("freeze_commit")
probe("D9c done GOV audit whose only gate lacks freeze_commit", board, "REJECT",
      "Governance audit needs a gate dependency whose freeze_commit equals reviewed_commit")
board = passed_audit3()
task(board, "WF-AUDIT3")["decision"] = "FIX REQUIRED"
task(board, "WF-GATE3")["freeze_commit"] = FREEZE2
probe("D9d binding also applies to a done GOV FIX REQUIRED audit (gate on the older commit)", board, "REJECT",
      "Gate freeze_commit differs")
board = copy.deepcopy(BOARD)
task(board, "WF-GATE3")["freeze_commit"] = FREEZE2
probe("D9e running GOV audit already rejects a mismatching gate commit (any status)", board, "REJECT",
      "Gate freeze_commit differs")
board = passed_audit3()
task(board, "WF-AUDIT3")["depends_on"] = ["WF-GATE3", "WF-GATE2"]
probe("D9f0 two gate dependencies, the older one on another digest (digest binding fires first)", board, "REJECT",
      "Gate/audit snapshot mismatch")
board = passed_audit3()
task(board, "WF-AUDIT3")["depends_on"] = ["WF-GATE3", "WF-GATE2"]
task(board, "WF-GATE2")["source_digest"] = DIGEST3  # handoff-only change: same digest, older commit
probe("D9f two gate dependencies with the same digest, one on an older commit", board, "REJECT",
      "WF-AUDIT3 / WF-GATE2")
board = copy.deepcopy(BOARD)
task(board, "WP1-F01-GATE")["freeze_commit"] = "a" * 40
task(board, "WP1-F01-AUDIT")["reviewed_commit"] = "b" * 40
probe("D9g pending WP1 audit and gate with different recorded commits (any package, any status)", board,
      "REJECT", "Gate freeze_commit differs")
board = passed_audit3()
task(board, "WF-FREEZE3")["commit_sha"] = "c" * 40
probe("D9h known limit: gate freeze_commit is not cross-checked against its freeze task commit_sha", board,
      "ACCEPT")
board = passed_audit3()
task(board, "WF-GATE3")["freeze_commit"] = FREEZE3.upper()
task(board, "WF-AUDIT3")["reviewed_commit"] = FREEZE3.upper()
probe("D9i upper-case SHA is not 40-hex lower case", board, "REJECT", "Invalid freeze_commit")

print("# F. addresses_audit")
board = copy.deepcopy(BOARD)
task(board, "WF-FIX2")["addresses_audit"] = "WF-AUDIT3"
probe("F1 done fix addressing the running WF-AUDIT3", board, "REJECT",
      "must name a done FIX REQUIRED or NOT VERIFIED audit")
board = copy.deepcopy(BOARD)
task(board, "WF-FIX2")["addresses_audit"] = "WF-GATE3"
probe("F2 addresses_audit naming a gate", board, "REJECT", "must name an existing audit task")
board = copy.deepcopy(BOARD)
task(board, "WF-FIX2")["addresses_audit"] = ["WF-AUDIT2"]
probe("F3 addresses_audit as a list", board, "REJECT", "must name an existing audit task")
board = copy.deepcopy(BOARD)
task(board, "WF-FIX2")["addresses_audit"] = ""
probe("F4 addresses_audit empty string", board, "REJECT", "must name an existing audit task")
board = copy.deepcopy(BOARD)
task(board, "WF-IMPL-DOCS")["addresses_audit"] = "WF-AUDIT"
probe("F5 addresses_audit on a documentation task", board, "REJECT", "addresses_audit is only for fix tasks")
board = copy.deepcopy(BOARD)
task(board, "WP1-F01-FIX").update(addresses_audit="WF-AUDIT2", depends_on=["WF-AUDIT3", "WF-AUDIT2"])
probe("F6 pending fix that also depends on the audit it addresses", board, "REJECT",
      "Fix must not depend on its addresses_audit")
board = copy.deepcopy(BOARD)
task(board, "WP1-F01-FIX")["addresses_audit"] = "WF-AUDIT2"
probe("F7 cross-package traceability: pending WP1 fix addressing a done GOV FIX REQUIRED audit", board, "ACCEPT")
board = copy.deepcopy(BOARD)
task(board, "WF-FIX2")["addresses_audit"] = None
probe("F8 explicit null addresses_audit is treated as absent", board, "ACCEPT")

print("# G. Unchanged protections still hold on the new board")
board = passed_audit3()
task(board, "WF-AUDIT3").update(agent_id=task(board, "WF-FIX2")["agent_id"])
probe("G1 WF-FIX2 author audits its own fix (author_agent_ids lacks it; package membership catches it)", board,
      "REJECT", "Auditor is author")
board = passed_audit3()
task(board, "WF-AUDIT3").update(requested_model="sonnet", model_override_reason="fallback_unavailable",
                                actual_model="claude-sonnet-5-5")
probe("G2 Sonnet fallback auditor over the Opus WF-FIX2 author", board, "REJECT", "Audit model weaker")
board = copy.deepcopy(BOARD)
task(board, "WF-AUDIT3").update(requested_model="haiku", model_override_reason="size_risk")
probe("G5 running Haiku auditor (requested model only) over Sonnet/Opus authors", board, "REJECT",
      "Audit model weaker")
board = copy.deepcopy(BOARD)
task(board, "WF-AUDIT3").update(requested_model="sonnet", model_override_reason="fallback_unavailable")
probe("G6 running Sonnet fallback auditor (requested model only) over the Opus WF-FIX2 author", board, "REJECT",
      "Audit model weaker")
board = passed_audit3()
board["current_source_digest"] = "e" * 64
task(board, "WP1-F01-FIX").update(status="running", attempt=1, agent_id="synthetic-f01-worker", report=F01_REPORT,
                                  actual_model="claude-sonnet-5-5", actual_source="self_reported")
probe("G3 WP1-F01-FIX may run on WF-AUDIT3 PASS; the F-01 digest change does not stale the GOV PASS", board,
      "ACCEPT")
board = copy.deepcopy(BOARD)
task(board, "WP1-F01-FIX").update(status="running", attempt=1, agent_id="synthetic-f01-worker", report=F01_REPORT)
probe("G4 WP1-F01-FIX cannot run while WF-AUDIT3 is unfinished", board, "REJECT", "Unfinished dependency")

print(f"# {sum(results)}/{len(results)} probes behaved as expected")
sys.exit(0 if all(results) else 1)
