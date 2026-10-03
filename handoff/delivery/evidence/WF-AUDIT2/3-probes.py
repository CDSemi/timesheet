"""WF-AUDIT2 own negative/positive probes against validate_orchestration.py (in memory only).

Usage: python handoff/delivery/evidence/WF-AUDIT2/3-probes.py
Loads the validator, STATE and the nine profiles from the checkout; builds boards in memory from
the working-tree board (coordinator copy during the audit). Never writes the real board.
Each probe prints ACCEPT or REJECT(<message>) next to the expected outcome; exit 1 on any mismatch.
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
DIGEST = "d4d49149221e45459937d26bdd1258d681341b73712d8564a852c9131c5429d2"
EVIDENCE = "handoff/delivery/evidence/WF-AUDIT2/0-identity-before.txt"
F01_REPORT = "handoff/delivery/WP1_HANDOFF.md"  # existing owned file; the real brief is written at dispatch
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


def base():
    """Working-tree board with WF-GATE2 closed (its decision is already PASS) and WF-AUDIT2 still running."""
    board = copy.deepcopy(BOARD)
    task(board, "WF-GATE2")["status"] = "done"
    return board


def passed_audit():
    """Hypothetical done GOV audit PASS on the freeze commit by a non-author Opus auditor."""
    board = base()
    task(board, "WF-AUDIT2").update(status="done", decision="PASS", actual_model="claude-opus-5-5",
                                    actual_source="self_reported", source_digest=DIGEST, reviewed_digest=DIGEST,
                                    evidence=[EVIDENCE])
    board["next_task_id"] = "WP1-F01-FIX"
    return board


print("# A. Real-board controls")
probe("A1 working-tree board as written (WF-GATE2 still 'running' while WF-AUDIT2 runs)", copy.deepcopy(BOARD),
      "REJECT", "Unfinished dependency: WF-AUDIT2")
probe("A2 same board with only WF-GATE2 status set to done", base(), "ACCEPT")

print("# B. Audit strength (WF-A-01)")
board = base()
task(board, "WF-FIX1").update(actual_model="claude-opus-5-5")
task(board, "WF-AUDIT2").update(requested_model="sonnet", model_override_reason="fallback_unavailable",
                                actual_model="claude-sonnet-5-5", actual_source="self_reported")
probe("B1 running Sonnet auditor, fallback_unavailable, Opus fix author", board, "REJECT", "Audit model weaker")
board = passed_audit()
task(board, "WF-FIX1").update(actual_model="claude-opus-5-5")
task(board, "WF-AUDIT2").update(requested_model="sonnet", model_override_reason="fallback_unavailable",
                                actual_model="claude-sonnet-5-5")
probe("B2 done Sonnet audit PASS, fallback_unavailable, Opus fix author", board, "REJECT", "Audit model weaker")
board = base()
task(board, "WF-IMPL-DOCS").update(actual_model="claude-opus-5-5")
task(board, "WF-AUDIT2").update(requested_model="sonnet", model_override_reason="fallback_unavailable")
probe("B3 Sonnet fallback auditor, Opus documentation author (requested model only)", board, "REJECT",
      "Audit model weaker")
board = base()
task(board, "WF-AUDIT2").update(requested_model="sonnet", model_override_reason="fallback_unavailable")
probe("B4 Sonnet fallback auditor when every GOV author is Sonnet (rule's permitted case)", board, "ACCEPT")
board = base()
task(board, "WF-AUDIT2").update(requested_model="haiku", model_override_reason="size_risk")
probe("B5 Haiku auditor over Sonnet authors", board, "REJECT", "Audit model weaker")
board = base()
task(board, "WF-GATE2").update(actual_model="claude-opus-5-5")
task(board, "WF-AUDIT2").update(requested_model="sonnet", model_override_reason="fallback_unavailable")
probe("B6 Opus verifier is not an author (gate kind), Sonnet fallback auditor", board, "ACCEPT")

print("# C. Author separation (WF-A-05)")
board = passed_audit()
task(board, "WF-AUDIT2").update(agent_id=task(board, "WF-IMPL-DOCS")["agent_id"], author_agent_ids=[])
probe("C1 documentation author (WF-IMPL-DOCS attempt 2) audits its own change, author_agent_ids empty", board,
      "REJECT", "Auditor is author")
board = passed_audit()
task(board, "WF-AUDIT2").update(agent_id=task(board, "WF-IMPL-DOCS")["previous_agent_ids"][0], author_agent_ids=[])
probe("C2 documentation author of attempt 1 (previous_agent_ids) audits, author_agent_ids empty", board,
      "REJECT", "Auditor is author")
board = passed_audit()
task(board, "WF-AUDIT2").update(agent_id=task(board, "WF-REVIEW")["agent_id"], author_agent_ids=[])
probe("C3 planner (WF-REVIEW) audits the governance change, author_agent_ids empty", board, "REJECT",
      "Auditor is author")
board = passed_audit()
task(board, "WF-AUDIT2").update(agent_id=None)
probe("C4 done audit without auditor identity", board, "REJECT", "identity unknown")
board = passed_audit()
probe("C5 positive control: done GOV PASS by a non-author Opus auditor", board, "ACCEPT")

print("# D. GOV scope (WF-A-02)")
board = passed_audit()
task(board, "WF-AUDIT2").pop("reviewed_commit")
probe("D1 done GOV audit without reviewed_commit", board, "REJECT", "Governance audit needs reviewed_commit")
board = passed_audit()
task(board, "WF-AUDIT2")["reviewed_commit"] = FREEZE2[:12]
probe("D2 done GOV audit with abbreviated reviewed_commit", board, "REJECT", "reviewed_commit")
board = passed_audit()
board["current_source_digest"] = "e" * 64
probe("D3 WF-A-02 probe 8 replay: F-01 fix changes current_source_digest; GOV PASS stays valid", board, "ACCEPT")
board = passed_audit()
board["current_source_digest"] = "e" * 64
task(board, "WP1-F01-FIX").update(status="running", attempt=1, agent_id="synthetic-f01-worker", report=F01_REPORT,
                                  actual_model="claude-sonnet-5-5", actual_source="self_reported")
probe("D4 WP1-F01-FIX runs on its cross-package dependency WF-AUDIT2 PASS", board, "ACCEPT")
board = base()
task(board, "WP1-F01-FIX").update(status="running", attempt=1, agent_id="synthetic-f01-worker", report=F01_REPORT)
probe("D5 WP1-F01-FIX cannot run while WF-AUDIT2 is unfinished", board, "REJECT", "Unfinished dependency")
board = passed_audit()
task(board, "WF-AUDIT2")["decision"] = "FIX REQUIRED"
task(board, "WP1-F01-FIX").update(status="running", attempt=1, agent_id="synthetic-f01-worker", report=F01_REPORT)
probe("D6 WP1-F01-FIX cannot run on a FIX REQUIRED governance audit", board, "REJECT", "Dependency audit not PASS")
board = passed_audit()
task(board, "WF-FIX1")["depends_on"] = ["WF-AUDIT"]
probe("D7 why addresses_audit exists: a done fix depending on its FIX REQUIRED audit", board, "REJECT",
      "Dependency audit not PASS")
board = passed_audit()
task(board, "WF-FIX1")["addresses_audit"] = "NO-SUCH-AUDIT"
probe("D8 addresses_audit is not validated (dangling reference accepted)", board, "ACCEPT")
board = passed_audit()
task(board, "WF-GATE2")["freeze_commit"] = "f" * 40
probe("D9 GOV gate freeze_commit differs from the audit reviewed_commit (same digest)", board, "ACCEPT")

print("# E. Effort max (WF-A-04)")
board = base()
task(board, "WP1-F01-FIX")["requested_effort"] = "max"
probe("E1 pending task requesting effort max", board, "REJECT", "Requested profile settings differ")
expert = (ROOT / ".claude/agents/timesheet-expert.md").read_text(encoding="utf-8")
try:
    v.parse_profile(expert.replace("effort: xhigh", "effort: max"), "timesheet-expert.md")
    outcome = "ACCEPT"
except ValueError as error:
    outcome = f"REJECT({error})"
ok = outcome.startswith("REJECT") and "Unexpected effort" in outcome
results.append(ok)
print(f"{'ok ' if ok else 'BAD'} | E2 expert profile with effort: max (WF-AUDIT probe 4 replay) | expected "
      f"REJECT(Unexpected effort) | got {outcome}")

print(f"# {sum(results)}/{len(results)} probes behaved as expected")
sys.exit(0 if all(results) else 1)
