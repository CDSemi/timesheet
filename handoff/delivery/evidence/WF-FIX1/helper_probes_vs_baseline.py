"""WF-FIX1 evidence helper: run the working-tree check_recovery.py probes statement by statement against the
validator at git HEAD (before WF-FIX1) and list which probes the baseline fails to catch (regression value).
Read-only; the real board is blanked in memory for WF-FIX1's dependency on the FIX REQUIRED audit.
"""
import ast
import json
import subprocess
import sys
import types
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[4]
baseline = types.ModuleType("baseline")
source = subprocess.check_output(["git", "show", "HEAD:handoff/delivery/validate_orchestration.py"], cwd=ROOT).decode()
source = source.replace("ROOT = Path(__file__).resolve().parents[2]", f"ROOT = Path({str(ROOT)!r})")
exec(compile(source, "baseline-validator", "exec"), baseline.__dict__)
path = ROOT / "handoff/delivery/check_recovery.py"
tree = ast.parse(path.read_text(encoding="utf-8"))
scope = {"__file__": str(path), "__name__": "__main__", "module": baseline}
failed, ok = [], 0
for node in tree.body:
    text = ast.unparse(node)
    if text.startswith("module = importlib") or text.startswith("spec.loader.exec_module"):
        continue  # keep the baseline validator as `module`
    code = compile(ast.Module([node], []), str(path), "exec")
    try:
        exec(code, scope)
        ok += 1
    except BaseException as error:  # noqa: BLE001 - evidence helper records every failure
        failed.append((node.lineno, f"{type(error).__name__}: {error}"))
    if text.startswith("real_board ="):
        for task in scope["real_board"]["tasks"]:
            if task["id"] == "WF-FIX1":
                task["depends_on"] = []
print(f"statements run: {ok} ok, {len(failed)} failed against the baseline validator")
for line, message in failed:
    print(f"  check_recovery.py:{line}: {message}")
sys.exit(0 if failed else 1)  # exit 0 = the new probes do detect the baseline gaps
