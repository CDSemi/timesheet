"""WF-FIX1 evidence helper (read-only, in-memory): run validate_orchestration variants against the real board.

Usage: python helper_validate_variants.py baseline|dependency-blanked
  baseline          validator at git HEAD (before WF-FIX1) on the real board
  dependency-blanked  working-tree validator on the real board with WF-FIX1 depends_on cleared in memory
"""
import json
import subprocess
import sys
import types
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
mode = sys.argv[1]
board = json.loads((ROOT / "handoff/delivery/ORCHESTRATION.json").read_text(encoding="utf-8"))
state = json.loads((ROOT / "handoff/delivery/STATE.json").read_text(encoding="utf-8"))
module = types.ModuleType("variant")
if mode == "baseline":
    source = subprocess.check_output(["git", "show", "HEAD:handoff/delivery/validate_orchestration.py"], cwd=ROOT).decode()
    source = source.replace("ROOT = Path(__file__).resolve().parents[2]", f"ROOT = Path({str(ROOT)!r})")
    exec(compile(source, "baseline-validator", "exec"), module.__dict__)
else:
    module.__dict__["__file__"] = str(ROOT / "handoff/delivery/validate_orchestration.py")
    exec(compile((ROOT / "handoff/delivery/validate_orchestration.py").read_text(encoding="utf-8"),
                 module.__dict__["__file__"], "exec"), module.__dict__)
    for task in board["tasks"]:
        if task["id"] == "WF-FIX1":
            task["depends_on"] = []
try:
    print(json.dumps(module.validate(board, state, module.profiles()), indent=2))
except ValueError as error:
    print(f"VALIDATION FAILED: {error}")
    sys.exit(1)
