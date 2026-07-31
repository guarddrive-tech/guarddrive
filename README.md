# GuardDrive™ — Operational Trust for Mobility

GuardDrive é uma camada de confiança operacional para empresas de
mobilidade — seguradoras, frotas, logística e plataformas — que precisam de
evidência confiável sobre eventos operacionais para decisões de negócio,
seguro e compliance.

Para entender o produto, a arquitetura e o que este repositório contém,
comece por `REPOSITORY_MANIFEST.md`. A fonte da verdade sobre o produto e a
arquitetura vive em `docs/architecture/`.

---

## Arquitetura & Stack
- **Frontend**: Vite (Vanilla JS), múltiplas entradas (landing, diagnóstico,
  portal de qualificação).
- **Backend**: Netlify Functions (TypeScript) + Drizzle ORM + Netlify
  Database (PostgreSQL gerenciado).
- **Deploy**: Netlify — build automatizado, publish em `dist/`. Esse é o
  único alvo de deploy suportado.

Não há backend Python, Vercel ou blockchain em produção. Detalhes sobre por
que essa é a arquitetura oficial estão em
`docs/architecture/ADR/ADR-0001-Current-Architecture.md`.

## Como Executar Localmente

### 1. Requisitos
- Node.js v18 ou superior.
- Netlify CLI (opcional, para desenvolvimento local de functions).

### 2. Frontend (Vite)
```bash
npm install
npm run dev
```

### 3. Backend (Netlify Functions)
```bash
npm install -g netlify-cli
netlify dev
```
Isso inicia o frontend e as serverless functions com proxy automático para
`/api/*`.

### 4. Database (Drizzle ORM)
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Estrutura de Pastas
```
guarddrive/
├─ REPOSITORY_MANIFEST.md    # comece por aqui
├─ docs/
│  ├─ governance/            # hierarquia documental e convenções
│  ├─ vision/                # para onde o produto pretende ir
│  ├─ architecture/          # fonte da verdade: canon, boundaries, ADRs
│  ├─ product/                # visão de produto resumida
│  ├─ research/               # pesquisa técnica viva (protocolo, ZK, oráculo)
│  ├─ knowledge/               # aprendizado comercial e competitivo
│  ├─ legal/                   # enquadramento jurídico
│  └─ archive/                 # material histórico, sem autoridade
├─ legacy/
│  └─ backend-python-vercel/  # código abandonado, isolado
├─ db/                         # Drizzle ORM (schema + client)
├─ netlify/
│  ├─ functions/               # serverless functions (.mts)
│  └─ database/migrations/     # migrations SQL
├─ frontend/                   # landing, diagnóstico, portal de qualificação
├─ netlify.toml
├─ vite.config.js
└─ package.json
```

## API (Netlify Functions)
- `GET/POST /api/forms` — criação e listagem de formulários de qualificação
- `GET /api/forms/:token` — detalhe de um formulário
- `GET /r/:token` — redirecionamento de link de qualificação
- `POST /api/leads/submit` — submissão de respostas do portal de qualificação
- `GET/POST /api/leads` — listagem e captura simples de leads
- `GET /api/dashboard/stats` — estatísticas do portal de qualificação
- `POST /api/telemetry/event` — telemetria de uso
- `GET /api/insights` — conteúdo de mercado estático

## Licença
Propriedade Intelectual Privada — GuardDrive™. Todos os direitos reservados.
