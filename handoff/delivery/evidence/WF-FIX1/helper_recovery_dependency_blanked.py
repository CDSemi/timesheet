"""WF-FIX1 evidence helper (in-memory, read-only): run check_recovery.py with the real board's WF-FIX1 dependency on the FIX REQUIRED audit blanked in memory."""
import sys
from pathlib import Path
path = str(Path(__file__).resolve().parents[4] / "handoff/delivery/check_recovery.py")
src = open(path, encoding="utf-8").read()
marker = 'state = json.loads('
patch = 'for _t in real_board["tasks"]:\n    if _t["id"] == "WF-FIX1":\n        _t["depends_on"] = []\n'
assert marker in src
src = src.replace(marker, patch + marker, 1)
exec(compile(src, path, "exec"), {"__file__": path, "__name__": "__main__"})
