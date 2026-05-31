from fastapi import APIRouter, HTTPException
import os

router = APIRouter()

# Paths relative to this backend file (guarddrive-advanced-landing/backend/routes/insights.py)
TELEMETRY_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "tools", "telemetry"))
ADRIANO_PATH = os.path.join(TELEMETRY_DIR, "adriano_directives.txt")
GOVERNANCE_DIR = os.path.join(TELEMETRY_DIR, "governance_txt")

@router.get("/api/insights")
def get_insights():
    insights = {
        "commercial": {},
        "governance": []
    }
    
    # 1. Read Adriano's commercial directives
    if os.path.exists(ADRIANO_PATH):
        try:
            with open(ADRIANO_PATH, "r", encoding="utf-8") as f:
                content = f.read()
                # Parse or clean
                insights["commercial"] = {
                    "source": "adriano_directives.txt",
                    "content": content[:8000], # Limit payload
                    "pain_points": [
                        "Fraude de hodômetro prejudicando valor residual de locadoras.",
                        "Seguradoras com custos elevados em perícias de sinistros duvidosos.",
                        "Ausência de prova criptográfica com validade jurídica."
                    ]
                }
        except Exception as e:
            insights["commercial"] = {"error": f"Erro ao ler diretrizes: {str(e)}"}
    else:
        # Fallback offline mode insights
        insights["commercial"] = {
            "source": "fallback",
            "content": "Diretrizes comerciais não encontradas localmente. Usando dados offline padrão.",
            "pain_points": [
                "Fraude estrutural em locadoras de veículos",
                "Sinistros não rastreáveis para seguradoras",
                "Ausência de prova criptográfica com validade jurídica"
            ]
        }

    # 2. Read Governance Documents
    if os.path.exists(GOVERNANCE_DIR):
        try:
            files = os.listdir(GOVERNANCE_DIR)
            for file in files:
                if file.endswith(".txt"):
                    file_path = os.path.join(GOVERNANCE_DIR, file)
                    with open(file_path, "r", encoding="utf-8") as f:
                        insights["governance"].append({
                            "title": file.replace("#", "").replace(".txt", "").replace("_", " "),
                            "snippet": f.read()[:500] # Get first 500 chars as preview
                        })
        except Exception as e:
            insights["governance"].append({"error": f"Erro ao ler governança: {str(e)}"})
    else:
        # Fallback offline mode governance
        insights["governance"] = [
            {"title": "Diretrizes de Uso de Materiais Técnicos", "snippet": "Regras de conformidade e NDA para compartilhamento de dados comerciais com frotistas e seguradoras."}
        ]

    return insights
