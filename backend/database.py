import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "advanced_leads.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Leads table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        empresa TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        segmento TEXT NOT NULL,
        frota TEXT,
        dor TEXT,
        hash TEXT,
        block INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Telemetry events table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        path TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT
    )
    """)
    
    conn.commit()
    conn.close()

def save_lead(nome, empresa, email, segmento, frota, dor, tx_hash, block):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("""
        INSERT INTO leads (nome, empresa, email, segmento, frota, dor, hash, block)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (nome, empresa, email, segmento, frota, dor, tx_hash, block))
        conn.commit()
        return cursor.lastrowid
    except sqlite3.IntegrityError:
        # Update existing
        cursor.execute("""
        UPDATE leads
        SET nome = ?, empresa = ?, segmento = ?, frota = ?, dor = ?, hash = ?, block = ?
        WHERE email = ?
        """, (nome, empresa, segmento, frota, dor, tx_hash, block, email))
        conn.commit()
        cursor.execute("SELECT id FROM leads WHERE email = ?", (email,))
        return cursor.fetchone()[0]
    finally:
        conn.close()

def save_telemetry(event_type, path, metadata_str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("""
        INSERT INTO telemetry (event_type, path, metadata)
        VALUES (?, ?, ?)
        """, (event_type, path, metadata_str))
        conn.commit()
    finally:
        conn.close()
