from fastapi import FastAPI, HTTPException, Request, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
import uvicorn
import hashlib
import random
import json
from datetime import datetime

from database import (
    init_db, save_lead, save_telemetry,
    db_create_form, db_get_form_by_token, db_list_forms,
    db_save_response, db_list_responses, db_get_dashboard_stats
)
from routes.insights import router as insights_router
from telemetry.monitor_advanced import log_page_view

app = FastAPI(title="GuardDrive™ Advanced Landing API", version="2.5")

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

# ─── PYDANTIC MODELS ─────────────────────────────────────────────────────────

class LeadSubmission(BaseModel):
    nome: str
    empresa: str
    email: str
    segmento: str
    frota: Optional[str] = ""
    dor: Optional[str] = ""

class QuestionModel(BaseModel):
    q: str
    type: str
    options: Optional[List[str]] = None

class FormCreate(BaseModel):
    name: str
    target: str
    segment: str
    description: Optional[str] = ""
    questions: List[QuestionModel]

class ResponseSubmit(BaseModel):
    form_token: str
    company_name: str
    contact_name: str
    email: str
    phone_personal: Optional[str] = ""
    phone_corporate: Optional[str] = ""
    nda_accepted: bool
    answers: Dict[str, Any]

class TelemetryEvent(BaseModel):
    event: str
    path: str
    metadata: Optional[Dict[str, Any]] = None

# ─── API ENDPOINTS ────────────────────────────────────────────────────────────

# 1. Custom Forms Generator (Interviewer Portal)
@app.post("/api/forms")
async def create_custom_form(form: FormCreate):
    try:
        # Generate a unique token
        token_base = f"{form.target}-{form.segment}-{datetime.now().isoformat()}"
        token = hashlib.md5(token_base.encode('utf-8')).hexdigest()[:12].upper()
        
        # Serialize questions to JSON string
        questions_dict = [q.dict() for q in form.questions]
        questions_json = json.dumps(questions_dict)
        
        form_id = db_create_form(
            token=token,
            name=form.name,
            target=form.target,
            segment=form.segment,
            description=form.description,
            questions_json=questions_json
        )
        
        # Telemetry
        log_page_view("custom_form_created", "/api/forms", {
            "form_id": form_id,
            "token": token,
            "segment": form.segment,
            "target": form.target
        })
        
        return {
            "status": "success",
            "form_id": form_id,
            "token": token,
            "link": f"/r/{token}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/forms")
async def list_custom_forms():
    try:
        forms = db_list_forms()
        return forms
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/forms/{token}")
async def get_custom_form(token: str):
    form = db_get_form_by_token(token)
    if not form:
        raise HTTPException(status_code=404, detail="Formulário não encontrado")
    return form

@app.get("/r/{token}")
async def redirect_to_custom_form(token: str):
    form = db_get_form_by_token(token)
    if not form:
        raise HTTPException(status_code=404, detail="Formulário não encontrado")
    return RedirectResponse(url=f"/?r={token}")

# 2. Form Submissions (Leads Qualifiers)
@app.post("/api/leads/submit")
async def submit_form_response(response: ResponseSubmit):
    try:
        # Generate simulated blockchain attestation hash & block
        data_str = f"{response.email}-{response.form_token}-{datetime.now().isoformat()}"
        tx_hash = "0x" + hashlib.sha256(data_str.encode('utf-8')).hexdigest()
        block_num = random.randint(180000, 250000)
        
        answers_json = json.dumps(response.answers)
        
        res_id = db_save_response(
            form_token=response.form_token,
            company_name=response.company_name,
            contact_name=response.contact_name,
            email=response.email,
            phone_personal=response.phone_personal,
            phone_corporate=response.phone_corporate,
            nda_accepted=response.nda_accepted,
            answers_json=answers_json,
            tx_hash=tx_hash,
            block=block_num
        )
        
        # Also log to unified leads for legacy dashboards if needed
        # We find segment from form
        form_data = db_get_form_by_token(response.form_token)
        segment = form_data["segment"] if form_data else "desconhecido"
        
        save_lead(
            nome=response.contact_name,
            empresa=response.company_name,
            email=response.email,
            segmento=segment,
            frota=response.phone_corporate, # using phone as temporary metadata identifier or blank
            dor=next(iter(response.answers.values())) if response.answers else "Preenchido via formulário dinâmico",
            tx_hash=tx_hash,
            block=block_num
        )
        
        log_page_view("form_response_submitted", f"/r/{response.form_token}", {
            "response_id": res_id,
            "form_token": response.form_token,
            "company_name": response.company_name
        })
        
        return {
            "status": "success",
            "response_id": res_id,
            "hash": tx_hash,
            "block": block_num,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/leads")
async def list_leads_and_responses():
    try:
        responses = db_list_responses()
        return responses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Dashboard Analytics API
@app.get("/api/dashboard/stats")
async def get_dashboard_analytics():
    try:
        stats = db_get_dashboard_stats()
        # Mix in some dynamic calculations or mock values for ROI analytics if needed
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. Legacy simple lead creation (Direct landing page submission)
@app.post("/api/leads")
async def create_lead_legacy(submission: LeadSubmission):
    try:
        data_str = f"{submission.email}-{datetime.now().isoformat()}"
        tx_hash = "0x" + hashlib.sha256(data_str.encode('utf-8')).hexdigest()
        block_num = random.randint(180000, 250000)
        
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

# 5. Telemetry
@app.post("/api/telemetry/event")
async def telemetry_event(telemetry: TelemetryEvent):
    try:
        metadata_str = json.dumps(telemetry.metadata) if telemetry.metadata else ""
        save_telemetry(telemetry.event, telemetry.path, metadata_str)
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
