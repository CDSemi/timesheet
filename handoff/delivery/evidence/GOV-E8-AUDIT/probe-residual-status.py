"""Residual live-board dependency probe: the synthetic suite still inherits board fields other than active_package."""
import sys
from pathlib import Path
script = Path(sys.argv[1])
src = script.read_text(encoding="utf-8").split("# One acceptance probe validates the live board")[0]
for status in ["running", "paused_usage", "blocked", "software_ready"]:
    ns = {"__file__": str(script), "__name__": "residual"}
    exec(compile(src, str(script), "exec"), ns)
    ns["real_board"]["status"] = status
    ns["use_base"]("WP1")
    try:
        ns["suite"]()
        print(f"live status {status}: suite PASS ({len(ns['passed'])} probes)")
    except Exception as error:  # noqa: BLE001 - report the first failure
        print(f"live status {status}: suite FAIL after {len(ns['passed'])} probes: {type(error).__name__}: {error}")
