"""Synthetic in-memory workflow checks; no Claude dispatch or real board changes."""
import copy
import importlib.util
import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[4]
spec = importlib.util.spec_from_file_location("workflow", ROOT / "handoff/delivery/validate_orchestration.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
board = json.loads((ROOT / "handoff/delivery/ORCHESTRATION.json").read_text(encoding="utf-8"))
state = json.loads((ROOT / "handoff/delivery/STATE.json").read_text(encoding="utf-8"))
configured = module.profiles()
passed = []


def accepts(name, value):
    module.validate(value, state, configured)
    passed.append(name)


def rejects(name, value, expected):
    try:
        module.validate(value, state, configured)
    except ValueError as error:
        if expected not in str(error):
            raise AssertionError(f"{name}: unexpected failure: {error}") from error
        passed.append(name)
        return
    raise AssertionError(f"{name}: invalid workflow accepted")


accepts("initial pending board", board)
value = copy.deepcopy(board)
value["tasks"][0].update(status="interrupted", attempt=1, agent_id="synthetic-old-agent")
accepts("hard-stop recovery preserves interrupted task identity", value)
value["tasks"][0].update(status="running", attempt=2, agent_id="synthetic-replacement-agent")
accepts("replacement attempt keeps same task ID", value)
previous = json.loads((ROOT / "handoff/delivery/ORCHESTRATION.previous.json").read_text(encoding="utf-8"))
accepts("previous board is recoverable", previous)
try:
    json.loads('{"tasks":[')
except json.JSONDecodeError:
    passed.append("truncated board detected before previous-copy recovery")
else:
    raise AssertionError("truncated state accepted")

value = copy.deepcopy(board)
value["tasks"][1]["depends_on"] = ["MISSING"]
rejects("unknown dependency", value, "Unknown/self dependency")
value = copy.deepcopy(board)
value["tasks"][0]["depends_on"] = [value["tasks"][1]["id"]]
rejects("dependency cycle", value, "Dependency cycle")
value = copy.deepcopy(board)
value["tasks"][0]["owned_paths"].append("../outside")
rejects("path traversal", value, "Unsafe path")
value = copy.deepcopy(board)
value["tasks"][0]["owned_paths"].append("handoff/delivery/STATE.json")
rejects("worker writes shared state", value, "Task owns shared state")
value = copy.deepcopy(board)
value["tasks"][0]["requested_effort"] = "max"
rejects("unconfigured effort", value, "Requested profile settings differ")


def materialized():
    value = copy.deepcopy(board)
    for index, task in enumerate(value["tasks"]):
        if index > 0:
            task["report"] = "handoff/delivery/WP1_HANDOFF.md"
            task["owned_paths"] = [task["report"]]
    return value


value = materialized()
value["tasks"][1]["status"] = "running"
rejects("dispatch before dependency completion", value, "Unfinished dependency")
value = materialized()
value["tasks"][0]["status"] = "done"
value["tasks"][1].update(status="running", depends_on=[])
extra = copy.deepcopy(value["tasks"][1])
extra.update(id="WP1-SECOND-WRITER", depends_on=[])
value["tasks"].append(extra)
rejects("two source writers", value, "More than one source writer")
value = materialized()
value["tasks"][1].update(status="running", depends_on=[])
value["tasks"][2].update(status="running", depends_on=[])
rejects("source changes during gate", value, "Source writer overlaps")
value = copy.deepcopy(board)
value["tasks"][0].update(status="running", depends_on=[])
extra = copy.deepcopy(value["tasks"][0])
extra.update(id="WP1-SECOND-PLAN", depends_on=[])
value["tasks"].append(extra)
rejects("colliding parallel report ownership", value, "Concurrent ownership conflict")

value = materialized()
for task in value["tasks"]:
    task.update(status="done", attempt=1, agent_id=f"synthetic-{task['kind']}")
for task in value["tasks"][2:]:
    task.update(source_digest="a" * 64, decision="PASS",
                evidence=["handoff/delivery/evidence/WP1-review-codex/typecheck.txt"])
value["tasks"][3].update(reviewed_digest="a" * 64, author_agent_ids=["synthetic-fix"])
extra = copy.deepcopy(board["tasks"][0])
extra.update(id="WP1-NEXT-PLAN", depends_on=[value["tasks"][3]["id"]])
value["tasks"].append(extra)
value.update(current_source_digest="a" * 64, next_task_id=extra["id"])
accepts("synthetic separate author/auditor and matching evidence identity", value)
invalid = copy.deepcopy(value)
invalid["tasks"][3]["agent_id"] = "synthetic-fix"
rejects("self audit", invalid, "Auditor is author")
invalid = copy.deepcopy(value)
invalid["current_source_digest"] = "b" * 64
rejects("stale audit PASS", invalid, "Stale PASS")
invalid = copy.deepcopy(value)
invalid["tasks"][2]["decision"] = "FAIL"
rejects("failed gate cannot unlock audit", invalid, "Dependency gate not PASS")
invalid = copy.deepcopy(value)
invalid["tasks"][2]["source_digest"] = "b" * 64
rejects("gate and audit on different snapshots", invalid, "Gate/audit snapshot mismatch")
invalid = copy.deepcopy(value)
invalid["tasks"][3]["evidence"] = []
rejects("audit PASS without execution evidence", invalid, "lacks digest/execution evidence")
invalid = copy.deepcopy(value)
invalid["tasks"][3]["decision"] = "NOT VERIFIED"
invalid["tasks"][4]["status"] = "running"
rejects("unverified audit cannot unlock dependent task", invalid, "Dependency audit not PASS")
invalid = copy.deepcopy(board)
invalid.update(active_package="WP2")
invalid_state = copy.deepcopy(state)
invalid_state["active_work_package"] = "WP2"
try:
    module.validate(invalid, invalid_state, configured)
except ValueError as error:
    assert "Prior package not independently passed" in str(error)
    passed.append("WP2 blocked by unresolved WP1")
else:
    raise AssertionError("WP2 advanced past failed WP1")

print(json.dumps({"status": "PASS", "synthetic_checks": passed, "count": len(passed),
                  "actual_board_modified": False, "claude_dispatch_executed": False}, indent=2))
