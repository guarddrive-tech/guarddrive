import os
import json
from datetime import datetime

LOG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "logs"))
LOG_FILE = os.path.join(LOG_DIR, "advanced_page_views.log")

def log_page_view(event_type: str, path: str, metadata: dict = None):
    """
    Log telemetry page view or interaction event to a JSON-L log file.
    """
    os.makedirs(LOG_DIR, exist_ok=True)
    
    log_entry = {
        "event": event_type,
        "path": path,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "metadata": metadata or {}
    }
    
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
        print(f"[Telemetry Logged] {event_type} on {path}")
    except Exception as e:
        print(f"[Telemetry Error] Failed to write log: {str(e)}")
