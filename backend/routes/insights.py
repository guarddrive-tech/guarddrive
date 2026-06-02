from fastapi import APIRouter
import os

router = APIRouter()

# Paths relative to this backend file (guarddrive-advanced-landing/backend/routes/insights.py)
# These work in local dev but fallback to embedded data on Vercel/serverless
TELEMETRY_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "tools", "telemetry"))
ADRIANO_PATH = os.path.join(TELEMETRY_DIR, "adriano_directives.txt")
GOVERNANCE_DIR = os.path.join(TELEMETRY_DIR, "governance_txt")

# Embedded commercial intelligence (from Adriano's validated directives)
# This ensures the API always returns meaningful data even on serverless/Vercel
EMBEDDED_PAIN_POINTS = [
    "Fraude de hodômetro prejudicando valor residual de locadoras — perdas invisíveis de até 15% do valor do ativo.",
    "Seguradoras com custos elevados em perícias de sinistros duvidosos — tempo médio de resolução superior a 45 dias.",
    "Ausência de prova criptográfica com validade jurídica para litígios patrimoniais em frota.",
    "Bloqueadores de sinal (jammers) invalidam rastreadores convencionais, gerando vulnerabilidade crítica.",
    "Instalação invasiva de dispositivos de segurança causa perda de garantia e depreciação do ativo.",
    "Compliance com LGPD para telemetria contínua sem framework de anonimização adequado."
]

EMBEDDED_DIRECTIVES_SUMMARY = """
GUARDDRIVE TECH — Diretrizes de Uso de Materiais Técnicos em Estruturas Comerciais e Operacionais (2026)

Critérios de Organização:
- Priorizar fatores de impacto operacional e mercadológico em comunicações externas.
- Foco em mapeamento de dores reais do mercado de frotas e locação.
- Redução de perdas invisíveis e fraudes em ativos como benefício principal.
- Conformidade operacional com regras atuais do setor de mobilidade.

Segmentação Documental:
- Material Comercial: Propostas de valor e dores operacionais.
- Material de Validação: Questionários investigativos para campo.
- Material Técnico: Restrito a engenharia e integrações API.
- Material Estratégico: Segredos industriais e propriedade intelectual.

Formulários de Campo:
- Instrumentos de descoberta de gargalos e validação de hipóteses de valor.
- Guiar o entrevistado para expor vulnerabilidades operacionais atuais.
- Nunca antecipar diferenciais estratégicos internos da tecnologia.

Segurança e Blindagem:
- Princípio do mínimo acesso necessário.
- Ocultação completa de patentes em fases de validação de rua.
- Separação entre narrativa comercial e núcleo técnico.
- Rastreabilidade documental e coerência institucional.
"""

EMBEDDED_GOVERNANCE = [
    {
        "title": "Diretrizes de Uso de Materiais Técnicos",
        "snippet": "Regras de conformidade e NDA para compartilhamento de dados comerciais com frotistas e seguradoras. Preservação de propriedade intelectual e blindagem do modelo de negócio."
    },
    {
        "title": "Política de Compartimentalização",
        "snippet": "Segmentação documental por finalidade: Material Institucional, Comercial, Jurídico, Técnico, Estratégico e de Validação de Mercado. Cada categoria com linguagem calibrada para o público-alvo."
    },
    {
        "title": "Diretriz para Formulários de Validação",
        "snippet": "Formulários de campo como instrumentos de descoberta de gargalos operacionais. O formulário nunca deve expor diferenciais estratégicos internos ou arquiteturas de dados."
    }
]


@router.get("/api/insights")
def get_insights():
    insights = {
        "commercial": {},
        "governance": []
    }
    
    # 1. Read Adriano's commercial directives (local file or embedded fallback)
    if os.path.exists(ADRIANO_PATH):
        try:
            with open(ADRIANO_PATH, "r", encoding="utf-8") as f:
                content = f.read()
                insights["commercial"] = {
                    "source": "adriano_directives.txt",
                    "content": content[:8000],
                    "pain_points": EMBEDDED_PAIN_POINTS
                }
        except Exception as e:
            insights["commercial"] = {
                "source": "embedded_fallback",
                "content": EMBEDDED_DIRECTIVES_SUMMARY,
                "pain_points": EMBEDDED_PAIN_POINTS,
                "note": f"Leitura do arquivo falhou: {str(e)}"
            }
    else:
        # Production/Vercel fallback — serve embedded intelligence
        insights["commercial"] = {
            "source": "embedded_sovereign",
            "content": EMBEDDED_DIRECTIVES_SUMMARY,
            "pain_points": EMBEDDED_PAIN_POINTS
        }

    # 2. Read Governance Documents (local or embedded fallback)
    if os.path.exists(GOVERNANCE_DIR):
        try:
            files = os.listdir(GOVERNANCE_DIR)
            for file in files:
                if file.endswith(".txt"):
                    file_path = os.path.join(GOVERNANCE_DIR, file)
                    with open(file_path, "r", encoding="utf-8") as f:
                        insights["governance"].append({
                            "title": file.replace("#", "").replace(".txt", "").replace("_", " "),
                            "snippet": f.read()[:500]
                        })
        except Exception as e:
            insights["governance"] = EMBEDDED_GOVERNANCE
    else:
        # Production/Vercel fallback
        insights["governance"] = EMBEDDED_GOVERNANCE

    return insights
