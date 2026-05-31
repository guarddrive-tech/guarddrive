# GuardDrive™ Advanced Landing Page
> Sovereign Mobility Infrastructure — TRL-5 Active Pilot

Esta é a Landing Page Avançada do GuardDrive™, estruturada seguindo o **Textura Premium Pipeline** (Rich Aesthetics) e isolada como um repositório independente.

## 🚀 Arquitetura & Stack
- **Frontend**: Vite (Vanilla JS) + GSAP (animações staggered, micro-interações, timelines fluidas).
- **Design System**: Dark Cyber Theme com glassmorphism, Outfit font e gradiente neon personalizado.
- **Backend**: FastAPI (Python) com banco SQLite embarcado para captação de Leads e logs de Telemetria local.
- **Segurança**: NDA Modal Protocol embarcado e integrado com verificação no Backend.
- **Telemetria**: Log local via SQLite e logs formatados como JSON-L em `logs/advanced_page_views.log`.
- **Deploy**: GitHub Actions configurado para build automatizado e deploy na Vercel.

---

## 🛠️ Como Executar Localmente

### 1. Requisitos
- Node.js v18 ou superior.
- Python 3.10 ou superior.

### 2. Frontend (Vite)
Navegue até a raiz do projeto e execute:
```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento (porta 5173)
npm run dev
```

### 3. Backend (FastAPI)
Instale as dependências e rode o servidor uvicorn:
```bash
# Criar/ativar ambiente virtual
python -m venv venv
source venv/bin/activate # ou venv\Scripts\activate no Windows

# Instalar dependências
pip install fastapi uvicorn pydantic

# Iniciar servidor (porta 8000)
python backend/main.py
```

Acesse `http://localhost:5173` no seu navegador. O Vite fará o proxy das chamadas `/api` automaticamente para o backend na porta 8000.

---

## 📂 Estrutura de Pastas
```
guarddrive-advanced-landing/
├─ .github/
│  └─ workflows/deploy.yml   # Deploy automatizado Vercel
├─ backend/
│  ├─ database.py            # SQLite helper
│  ├─ main.py                # FastAPI entry-point
│  └─ routes/
│     └─ insights.py         # Consome insights do Adriano & Governança
├─ frontend/
│  ├─ index.html             # Marcação HTML premium
│  ├─ style.css              # Custom Design System
│  └─ app.js                 # Controladores e timelines GSAP
├─ telemetry/
│  └─ monitor_advanced.py    # Log de telemetria
├─ logs/
│  └─ advanced_page_views.log
├─ access_matrix.json        # Permissões do ecossistema
├─ package.json
└─ README.md
```

## 📝 Licença
Propriedade Intelectual Privada — GuardDrive™ e Symbeon Labs. Todos os direitos reservados.
