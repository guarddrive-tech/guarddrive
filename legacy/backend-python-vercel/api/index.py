"""
Vercel Serverless Function Entry Point
Wraps the entire FastAPI app via Mangum (ASGI → AWS Lambda/Vercel adapter).
All /api/* and /r/* routes are handled by this single function.
"""
import sys
import os

# Add backend directory to Python path so imports resolve correctly
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Also add telemetry dir
telemetry_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "telemetry"))
if telemetry_dir not in sys.path:
    sys.path.insert(0, telemetry_dir)

from mangum import Mangum
from main import app

# Mangum handler for Vercel serverless
handler = Mangum(app, lifespan="off")
