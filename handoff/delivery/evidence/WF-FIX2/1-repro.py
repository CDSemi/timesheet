"""WF-FIX2 reproduction/regression probes for WF-R-01 and addresses_audit (in memory only).

Usage: python handoff/delivery/evidence/WF-FIX2/1-repro.py
Builds boards in memory from the working-tree board; never writes it. Prints ACCEPT or
REJECT(<message>) next to the expected outcome after the fix; exit 1 on any mismatch.
Before the fix the mismatches reproduce the findings (probe D8/D9 of WF-AUDIT2).
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
DIGEST = "d4d49149221e45459937d26bdd1258d681341b73712d8564a852c9131c5429d2"
EVIDENCE = "handoff/delivery/evidence/WF-AUDIT2/0-identity-before.txt"
results = []


def task(board, name):
    return next(item for item in board["tasks"] if item["id"] == name)


def probe(name, board, expected, needle=""):
    try:
        v.validate(board, STATE, PROFILES)
        outcome = "ACCEPT"
    except ValueError as error:
        outcome = f"REJECT({error})"
    ok = outcome == "ACCEPT" if expected == "ACCEPT" else outcome.startswith("REJECT") and needle in outcome
    results.append(ok)
    print(f"{'ok ' if ok else 'BAD'} | {name} | expected {expected}{'(' + needle + ')' if needle else ''} | got {outcome}")


def passed_audit(keep_address=False):
    """Hypothetical done GOV audit PASS (WF-AUDIT2) on the freeze commit of WF-GATE2. WF-FIX2 keeps its
    addresses_audit only when asked, because a fix cannot address a PASS audit."""
    board = copy.deepcopy(BOARD)
    task(board, "WF-AUDIT2").update(decision="PASS", source_digest=DIGEST, reviewed_digest=DIGEST,
                                    evidence=[EVIDENCE])
    if not keep_address:
        task(board, "WF-FIX2").pop("addresses_audit", None)
    return board


print("# WF-R-01: gate freeze_commit / audit reviewed_commit binding")
probe("R1 real board", copy.deepcopy(BOARD), "ACCEPT")
board = passed_audit()
probe("R2 GOV audit PASS whose gate freeze_commit equals reviewed_commit", board, "ACCEPT")
board = passed_audit()
task(board, "WF-GATE2")["freeze_commit"] = "f" * 40
probe("R3 (= D9) GOV audit PASS, gate freeze_commit differs, same digest", board, "REJECT", "freeze_commit")
board = copy.deepcopy(BOARD)
task(board, "WF-GATE2")["freeze_commit"] = "f" * 40
probe("R4 GOV audit FIX REQUIRED, gate freeze_commit differs", board, "REJECT", "freeze_commit")
board = passed_audit()
task(board, "WF-GATE2")["freeze_commit"] = None
probe("R5 done GOV audit whose gate has no freeze_commit", board, "REJECT", "freeze_commit")
board = copy.deepcopy(BOARD)
gate = task(board, "WP1-F01-GATE")
audit = task(board, "WP1-F01-AUDIT")
gate["freeze_commit"] = "a" * 40
audit["reviewed_commit"] = "b" * 40
probe("R6 WP1 pending audit and gate with different commits", board, "REJECT", "freeze_commit")
audit["reviewed_commit"] = "a" * 40
probe("R7 WP1 pending audit and gate with equal commits", board, "ACCEPT")

print("# addresses_audit on fix tasks")
board = copy.deepcopy(BOARD)
task(board, "WF-FIX2")["addresses_audit"] = "NO-SUCH-AUDIT"
probe("A1 (= D8) dangling addresses_audit", board, "REJECT", "addresses_audit")
board = copy.deepcopy(BOARD)
task(board, "WF-FIX2")["addresses_audit"] = "WF-GATE2"
probe("A2 addresses_audit names a gate", board, "REJECT", "addresses_audit")
board = passed_audit(keep_address=True)
probe("A3 addresses_audit names a PASS audit", board, "REJECT", "addresses_audit")
board = copy.deepcopy(BOARD)
task(board, "WF-AUDIT3")["addresses_audit"] = "WF-AUDIT2"
probe("A4 addresses_audit on a non-fix task", board, "REJECT", "addresses_audit")
board = copy.deepcopy(BOARD)
task(board, "WP1-F01-FIX").update(addresses_audit="WF-AUDIT2", depends_on=["WF-AUDIT3", "WF-AUDIT2"])
probe("A5 pending fix also depending on the audit it addresses", board, "REJECT", "addresses_audit")
board = copy.deepcopy(BOARD)
task(board, "WF-AUDIT2")["decision"] = "NOT VERIFIED"
probe("A6 addresses_audit names a NOT VERIFIED audit", board, "ACCEPT")
board = copy.deepcopy(BOARD)
task(board, "WF-AUDIT2")["status"] = "interrupted"
task(board, "WF-AUDIT2").pop("decision")
probe("A7 addresses_audit names an unfinished audit", board, "REJECT", "addresses_audit")

print(f"# {sum(results)}/{len(results)} as expected")
sys.exit(0 if all(results) else 1)
