import os
import json
import sqlite3
from datetime import datetime

DATABASE_URL = os.environ.get("DATABASE_URL")

def get_db_connection():
    if DATABASE_URL:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    else:
        db_path = os.path.join(os.path.dirname(__file__), "..", "advanced_leads.db")
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    is_postgres = DATABASE_URL is not None
    
    # Auto-increment keyword differences
    serial_primary_key = "SERIAL PRIMARY KEY" if is_postgres else "INTEGER PRIMARY KEY AUTOINCREMENT"
    text_type = "TEXT"
    timestamp_default = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    
    # 1. Leads table (legacy fallback / direct public submissions)
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS leads (
        id {serial_primary_key},
        nome {text_type} NOT NULL,
        empresa {text_type} NOT NULL,
        email {text_type} NOT NULL UNIQUE,
        segmento {text_type} NOT NULL,
        frota {text_type},
        dor {text_type},
        hash {text_type},
        block INTEGER,
        created_at {timestamp_default}
    )
    """)
    
    # 2. Custom Interviewer Forms
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS forms (
        id {serial_primary_key},
        token {text_type} NOT NULL UNIQUE,
        name {text_type} NOT NULL,
        target {text_type} NOT NULL,
        segment {text_type} NOT NULL,
        description {text_type},
        questions {text_type} NOT NULL, -- JSON string
        status {text_type} DEFAULT 'active', -- active, draft, closed
        created_at {timestamp_default}
    )
    """)
    
    # 3. Custom Form Responses (Leads qualified via portal links)
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS responses (
        id {serial_primary_key},
        form_token {text_type} NOT NULL,
        company_name {text_type} NOT NULL,
        contact_name {text_type} NOT NULL,
        email {text_type} NOT NULL,
        phone_personal {text_type},
        phone_corporate {text_type},
        nda_accepted INTEGER DEFAULT 0,
        answers {text_type} NOT NULL, -- JSON string of {question: answer}
        hash {text_type},
        block INTEGER,
        created_at {timestamp_default}
    )
    """)
    
    # 4. Telemetry events table
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS telemetry (
        id {serial_primary_key},
        event_type {text_type} NOT NULL,
        path {text_type} NOT NULL,
        timestamp {timestamp_default},
        metadata {text_type}
    )
    """)
    
    conn.commit()
    conn.close()

# Forms management
def db_create_form(token, name, target, segment, description, questions_json):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if DATABASE_URL:
            cursor.execute("""
            INSERT INTO forms (token, name, target, segment, description, questions)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
            """, (token, name, target, segment, description, questions_json))
            form_id = cursor.fetchone()[0]
        else:
            cursor.execute("""
            INSERT INTO forms (token, name, target, segment, description, questions)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (token, name, target, segment, description, questions_json))
            form_id = cursor.lastrowid
        conn.commit()
        return form_id
    finally:
        conn.close()

def db_get_form_by_token(token):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if DATABASE_URL:
            cursor.execute("SELECT id, token, name, target, segment, description, questions, status, created_at FROM forms WHERE token = %s", (token,))
            row = cursor.fetchone()
            if row:
                return {
                    "id": row[0], "token": row[1], "name": row[2], "target": row[3],
                    "segment": row[4], "description": row[5], "questions": json.loads(row[6]),
                    "status": row[7], "created_at": row[8].isoformat() if hasattr(row[8], 'isoformat') else row[8]
                }
        else:
            cursor.execute("SELECT * FROM forms WHERE token = ?", (token,))
            row = cursor.fetchone()
            if row:
                return {
                    "id": row["id"], "token": row["token"], "name": row["name"], "target": row["target"],
                    "segment": row["segment"], "description": row["description"], "questions": json.loads(row["questions"]),
                    "status": row["status"], "created_at": row["created_at"]
                }
        return None
    finally:
        conn.close()

def db_list_forms():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if DATABASE_URL:
            cursor.execute("""
                SELECT f.id, f.token, f.name, f.target, f.segment, f.description, f.status, f.created_at,
                       COALESCE(COUNT(r.id), 0) as response_count
                FROM forms f
                LEFT JOIN responses r ON f.token = r.form_token
                GROUP BY f.id, f.token, f.name, f.target, f.segment, f.description, f.status, f.created_at
                ORDER BY f.created_at DESC
            """)
            rows = cursor.fetchall()
            return [{
                "id": r[0], "token": r[1], "name": r[2], "target": r[3],
                "segment": r[4], "description": r[5], "status": r[6],
                "created_at": r[7].isoformat() if hasattr(r[7], 'isoformat') else r[7],
                "responses": r[8]
            } for r in rows]
        else:
            cursor.execute("""
                SELECT f.*, COALESCE(count_table.cnt, 0) as responses
                FROM forms f
                LEFT JOIN (SELECT form_token, COUNT(*) as cnt FROM responses GROUP BY form_token) count_table
                ON f.token = count_table.form_token
                ORDER BY f.created_at DESC
            """)
            rows = cursor.fetchall()
            return [dict(r) for r in rows]
    finally:
        conn.close()

# Responses management
def db_save_response(form_token, company_name, contact_name, email, phone_personal, phone_corporate, nda_accepted, answers_json, tx_hash, block):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if DATABASE_URL:
            cursor.execute("""
            INSERT INTO responses (form_token, company_name, contact_name, email, phone_personal, phone_corporate, nda_accepted, answers, hash, block)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """, (form_token, company_name, contact_name, email, phone_personal, phone_corporate, int(nda_accepted), answers_json, tx_hash, block))
            res_id = cursor.fetchone()[0]
        else:
            cursor.execute("""
            INSERT INTO responses (form_token, company_name, contact_name, email, phone_personal, phone_corporate, nda_accepted, answers, hash, block)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (form_token, company_name, contact_name, email, phone_personal, phone_corporate, int(nda_accepted), answers_json, tx_hash, block))
            res_id = cursor.lastrowid
        conn.commit()
        return res_id
    finally:
        conn.close()

def db_list_responses():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if DATABASE_URL:
            cursor.execute("SELECT id, form_token, company_name, contact_name, email, phone_personal, phone_corporate, nda_accepted, answers, hash, block, created_at FROM responses ORDER BY created_at DESC")
            rows = cursor.fetchall()
            return [{
                "id": r[0], "form_token": r[1], "company_name": r[2], "contact_name": r[3],
                "email": r[4], "phone_personal": r[5], "phone_corporate": r[6],
                "nda_accepted": bool(r[7]), "answers": json.loads(r[8]), "hash": r[9], "block": r[10],
                "created_at": r[11].isoformat() if hasattr(r[11], 'isoformat') else r[11]
            } for r in rows]
        else:
            cursor.execute("SELECT * FROM responses ORDER BY created_at DESC")
            rows = cursor.fetchall()
            res = []
            for r in rows:
                d = dict(r)
                d["nda_accepted"] = bool(d["nda_accepted"])
                d["answers"] = json.loads(d["answers"])
                res.append(d)
            return res
    finally:
        conn.close()

def db_get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if DATABASE_URL:
            cursor.execute("SELECT COUNT(*) FROM forms WHERE status = 'active'")
            active_forms = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM responses")
            total_responses = cursor.fetchone()[0]
            
            # Qualified counts segmentations
            cursor.execute("SELECT segment, COUNT(*) FROM forms GROUP BY segment")
            segment_counts = dict(cursor.fetchall())
        else:
            cursor.execute("SELECT COUNT(*) FROM forms WHERE status = 'active'")
            active_forms = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM responses")
            total_responses = cursor.fetchone()[0]
            
            cursor.execute("SELECT segment, COUNT(*) FROM forms GROUP BY segment")
            segment_counts = dict(cursor.fetchall())
            
        return {
            "active_forms": active_forms,
            "total_responses": total_responses,
            "segment_counts": segment_counts
        }
    finally:
        conn.close()

# Legacy Lead save for backward compatibility
def save_lead(nome, empresa, email, segmento, frota, dor, tx_hash, block):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if DATABASE_URL:
            cursor.execute("""
            INSERT INTO leads (nome, empresa, email, segmento, frota, dor, hash, block)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (email) DO UPDATE
            SET nome = EXCLUDED.nome, empresa = EXCLUDED.empresa, segmento = EXCLUDED.segmento,
                frota = EXCLUDED.frota, dor = EXCLUDED.dor, hash = EXCLUDED.hash, block = EXCLUDED.block
            RETURNING id
            """, (nome, empresa, email, segmento, frota, dor, tx_hash, block))
            res = cursor.fetchone()
            lead_id = res[0] if res else None
        else:
            cursor.execute("""
            INSERT INTO leads (nome, empresa, email, segmento, frota, dor, hash, block)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (nome, empresa, email, segmento, frota, dor, tx_hash, block))
            lead_id = cursor.lastrowid
        conn.commit()
        return lead_id
    except sqlite3.IntegrityError:
        cursor.execute("""
        UPDATE leads
        SET nome = ?, empresa = ?, segmento = ?, frota = ?, dor = ?, hash = ?, block = ?
        WHERE email = ?
        """, (nome, empresa, segmento, frota, dor, tx_hash, block, email))
        conn.commit()
        cursor.execute("SELECT id FROM leads WHERE email = ?", (email,))
        row = cursor.fetchone()
        return row[0] if row else None
    finally:
        conn.close()

def save_telemetry(event_type, path, metadata_str):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if DATABASE_URL:
            cursor.execute("""
            INSERT INTO telemetry (event_type, path, metadata)
            VALUES (%s, %s, %s)
            """, (event_type, path, metadata_str))
        else:
            cursor.execute("""
            INSERT INTO telemetry (event_type, path, metadata)
            VALUES (?, ?, ?)
            """, (event_type, path, metadata_str))
        conn.commit()
    finally:
        conn.close()
