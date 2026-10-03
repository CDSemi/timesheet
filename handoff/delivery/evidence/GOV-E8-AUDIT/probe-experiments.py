"""GOV-E8-AUDIT scratch experiments on check_recovery.py (old 393779d vs new ed92cb7).

Runs only in scratch copies of .claude/{settings.json,agents} and handoff/; never writes the repository.
Usage: <workflow-python> experiments.py <repo> <scratch>
"""
import copy
import json
import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(sys.argv[1])
SCRATCH = Path(sys.argv[2])
PY = sys.executable
PACKAGES = ["WP1", "WP2", "WP3", "WP4", "WP5"]


def git_show(rev, path):
    return subprocess.run(["git", "-C", str(REPO), "show", f"{rev}:{path}"], check=True,
                          capture_output=True).stdout


OLD = git_show("393779d", "handoff/delivery/check_recovery.py")
NEW = git_show("ed92cb7", "handoff/delivery/check_recovery.py")
assert NEW.replace(b"\r\n", b"\n") == (REPO / "handoff/delivery/check_recovery.py").read_bytes().replace(b"\r\n", b"\n")
LIVE_BOARD = json.loads((REPO / "handoff/delivery/ORCHESTRATION.json").read_text(encoding="utf-8"))
LIVE_STATE = json.loads((REPO / "handoff/delivery/STATE.json").read_text(encoding="utf-8"))


def make_root(name, board, state, script):
    root = SCRATCH / name
    if root.exists():
        shutil.rmtree(root)
    (root / ".claude").mkdir(parents=True)
    shutil.copy2(REPO / ".claude/settings.json", root / ".claude/settings.json")
    shutil.copytree(REPO / ".claude/agents", root / ".claude/agents")
    shutil.copytree(REPO / "handoff", root / "handoff",
                    ignore=shutil.ignore_patterns("__pycache__"))
    (root / "handoff/delivery/ORCHESTRATION.json").write_text(json.dumps(board, indent=2), encoding="utf-8")
    (root / "handoff/delivery/STATE.json").write_text(json.dumps(state, indent=2), encoding="utf-8")
    (root / "handoff/delivery/check_recovery.py").write_bytes(script)
    return root


def run(name, board, state, script):
    root = make_root(name, board, state, script)
    proc = subprocess.run([PY, "handoff/delivery/check_recovery.py"], cwd=root, capture_output=True,
                          text=True, encoding="utf-8", env={"PYTHONDONTWRITEBYTECODE": "1", "PYTHONIOENCODING": "utf-8",
                                                            "SYSTEMROOT": "C:\\Windows"})
    result = {"name": name, "exit": proc.returncode}
    if proc.returncode == 0:
        out = json.loads(proc.stdout)
        result.update(count=out["count"], checks=out["synthetic_checks"])
    else:
        result["error"] = (proc.stderr.strip().splitlines() or ["<none>"])[-1]
    return result


def board_with(active, tasks=None, status=None):
    board = copy.deepcopy(LIVE_BOARD)
    board["active_package"] = active
    if tasks is not None:
        board["tasks"] = tasks
        board["next_task_id"] = tasks[0]["id"]
    if status:
        board["status"] = status
    return board


def state_with(active, passed_before=True):
    state = copy.deepcopy(LIVE_STATE)
    state["active_work_package"] = active
    state["phases"] = [{"id": p, "independent_review": "passed" if passed_before and PACKAGES.index(p) < PACKAGES.index(active)
                        else "not_started"} for p in PACKAGES]
    return state


# A minimal valid WP1-era board: the conditions the historical probes were written for
# (active WP1, WP1 not yet independently passed).
MINIMAL_TASK = {"id": "X-PLAN", "package": "WP1", "kind": "plan", "status": "pending", "depends_on": [],
                "profile": "timesheet-planner", "requested_model": "opus", "requested_effort": "xhigh",
                "model_override_reason": None, "actual_model": None, "actual_source": None,
                "actual_effort": None, "agent_id": None, "attempt": 0,
                "owned_paths": ["handoff/delivery/WP1_HANDOFF.md"], "prompt": "handoff/prompts/ORCHESTRATE.md",
                "report": "handoff/delivery/WP1_HANDOFF.md", "evidence": [], "next_action": "synthetic"}
planner = (REPO / ".claude/agents/timesheet-planner.md").read_text(encoding="utf-8")
for line in planner.split("---")[1].splitlines():  # frontmatter only
    if line.startswith("model:"):
        MINIMAL_TASK["requested_model"] = line.split(":", 1)[1].strip()
    if line.startswith("effort:"):
        MINIMAL_TASK["requested_effort"] = line.split(":", 1)[1].strip()

results = []
wp1_board = board_with("WP1", tasks=[MINIMAL_TASK])
wp1_state = state_with("WP1")
results.append(run("old-live-WP2", LIVE_BOARD, LIVE_STATE, OLD))
results.append(run("old-minimal-WP1", wp1_board, wp1_state, OLD))
results.append(run("new-live-WP2", LIVE_BOARD, LIVE_STATE, NEW))
results.append(run("new-minimal-WP1", wp1_board, wp1_state, NEW))
for active in ["WP3", "WP4", "WP5"]:
    results.append(run(f"new-live-tasks-{active}", board_with(active), state_with(active), NEW))
# Mutation: restore the original defect (synthetic tasks default to WP1 instead of BASE).
mutant = NEW.replace(b'"package": package or BASE', b'"package": package or "WP1"')
assert mutant != NEW
results.append(run("mutant-default-WP1-live-WP2", LIVE_BOARD, LIVE_STATE, mutant))
mutant2 = NEW.replace(b'auxiliary_lookups=[], active_package=BASE,', b'auxiliary_lookups=[],')
assert mutant2 != NEW
results.append(run("mutant-inherit-live-active-WP2", LIVE_BOARD, LIVE_STATE, mutant2))

summary = []
for item in results:
    summary.append({key: item[key] for key in ("name", "exit", "count", "error") if key in item})
print(json.dumps(summary, indent=2))

old_names = next(r for r in results if r["name"] == "old-minimal-WP1").get("checks", [])
new_names = next(r for r in results if r["name"] == "new-live-WP2").get("checks", [])
print("OLD_COUNT", len(old_names), "NEW_COUNT", len(new_names))
print("ONLY_IN_OLD", [n for n in old_names if n not in new_names])
print("ONLY_IN_NEW", [n for n in new_names if n not in old_names])
common_old = [n for n in old_names if n in new_names]
common_new = [n for n in new_names if n in old_names]
print("COMMON", len(common_old), "SAME_ORDER", common_old == common_new)
print("LIVE_ACCEPTANCE_PROBES", [n for n in new_names if n == "current board is valid"])
for r in results:
    if r["name"].startswith("new-") and r["exit"] == 0:
        print(r["name"], "checks identical to new-live-WP2:", r["checks"] == new_names)
