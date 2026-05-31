from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import uvicorn
import hashlib
import random
from datetime import datetime

from database import init_db, save_lead, save_telemetry
from routes.insights import router as insights_router
from telemetry.monitor_advanced import log_page_view

app = FastAPI(title="GuardDrive™ Advanced Landing API", version="2.0")

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()
    print("Database initialized successfully.")

# Include insights router
app.include_router(insights_router)

class LeadSubmission(BaseModel):
    nome: str
    empresa: str
    email: str
    segmento: str
    frota: Optional[str] = ""
    dor: Optional[str] = ""

@app.post("/api/leads")
async def create_lead(submission: LeadSubmission):
    try:
        # Generate simulated blockchain attestation hash & block
        data_str = f"{submission.email}-{submission.timestamp if hasattr(submission, 'timestamp') else datetime.now().isoformat()}"
        tx_hash = "0x" + hashlib.sha256(data_str.encode('utf-8')).hexdigest()
        block_num = random.randint(180000, 250000)
        
        # Save to local db
        lead_id = save_lead(
            nome=submission.nome,
            empresa=submission.empresa,
            email=submission.email,
            segmento=submission.segmento,
            frota=submission.frota,
            dor=submission.dor,
            tx_hash=tx_hash,
            block=block_num
        )
        
        # Trigger telemetry event
        log_page_view("lead_captured", "/api/leads", {
            "lead_id": lead_id,
            "segmento": submission.segmento,
            "empresa": submission.empresa
        })
        
        return {
            "status": "success",
            "lead_id": lead_id,
            "hash": tx_hash,
            "block": block_num,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TelemetryEvent(BaseModel):
    event: str
    path: str
    metadata: Optional[Dict[str, Any]] = None

@app.post("/api/telemetry/event")
async def telemetry_event(telemetry: TelemetryEvent):
    try:
        # Save telemetry in sqlite
        metadata_str = str(telemetry.metadata) if telemetry.metadata else ""
        save_telemetry(telemetry.event, telemetry.path, metadata_str)
        
        # Write to advanced_page_views.log
        log_page_view(telemetry.event, telemetry.path, telemetry.metadata)
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount Frontend static files (dist folder built by Vite)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
else:
    # Also mount raw frontend directory as backup/dev option
    frontend_raw = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
    if os.path.exists(frontend_raw):
        app.mount("/", StaticFiles(directory=frontend_raw, html=True), name="frontend")
        print(f"Serving frontend from raw folder: {frontend_raw}")
    else:
        print(f"Warning: Neither dist nor frontend directory found.")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
