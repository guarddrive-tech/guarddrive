# GuardDrive™ Advanced Landing Page
> Sovereign Mobility Infrastructure — TRL-5 Active Pilot

Esta é a Landing Page Avançada do GuardDrive™, estruturada seguindo o **Textura Premium Pipeline** (Rich Aesthetics) e isolada como um repositório independente.

## 🚀 Arquitetura & Stack
- **Frontend**: Vite (Vanilla JS) + GSAP (animações staggered, micro-interações, timelines fluidas).
- **Design System**: Dark Cyber Theme com glassmorphism, Outfit font e gradiente neon personalizado.
- **Backend**: Netlify Functions (TypeScript) + Drizzle ORM + PostgreSQL para captação de Leads e telemetria.
- **Segurança**: NDA Modal Protocol embarcado e integrado com verificação no Backend.
- **Telemetria**: Log via serverless functions e banco PostgreSQL com schema estruturado.
- **Deploy**: Netlify com build automatizado e edge functions.

---

## 🛠️ Como Executar Localmente

### 1. Requisitos
- Node.js v18 ou superior.
- Netlify CLI (opcional, para desenvolvimento local de functions).
- PostgreSQL (para desenvolvimento local) ou usar Netlify Database.

### 2. Frontend (Vite)
Navegue até a raiz do projeto e execute:
```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento (porta 5173)
npm run dev
```

### 3. Backend (Netlify Functions)
Para desenvolvimento local com Netlify Functions:
```bash
# Instalar Netlify CLI globalmente
npm install -g netlify-cli

# Rodar Netlify Dev (simula ambiente de produção)
netlify dev
```

Isso iniciará o frontend na porta 5173 e as serverless functions com proxy automático para `/api/*`.

### 4. Database (Drizzle ORM)
Para desenvolvimento local com PostgreSQL:
```bash
# Gerar migrations
npx drizzle-kit generate

# Aplicar migrations
npx drizzle-kit migrate
```

Acesse `http://localhost:8888` no seu navegador.

---

## 📂 Estrutura de Pastas
```
guarddrive-advanced-landing/
├─ .github/
│  └─ workflows/             # CI/CD workflows
├─ db/
│  ├─ index.ts               # Drizzle ORM client
│  ├─ schema.ts              # Database schema
│  └─ drizzle.config.ts      # Drizzle configuration
├─ migrations/               # SQL migrations
│  └─ 20260721114924_init_schema/
├─ netlify/
│  └─ functions/             # Serverless functions
│     ├─ dashboard-stats.mts # Dashboard statistics
│     ├─ forms.mts           # Form handling
│     ├─ insights.mts        # Market insights API
│     ├─ leads.mts           # Lead management
│     └─ telemetry.mts      # Telemetry logging
├─ frontend/
│  ├─ index.html             # Marcação HTML premium
│  ├─ index2.html            # Versão alternativa
│  ├─ style.css              # Custom Design System
│  ├─ app.js                 # Controladores e timelines GSAP
│  └─ assets/                # Imagens e recursos estáticos
├─ base blockchain/          # Documentação técnica blockchain
│  ├─ 1_CONTRACT_RULES_TEMPLATE.md
│  ├─ 4_GUARDDRIVE_PROTOCOL_ARCHITECTURE.md
│  ├─ 12_MAGISTRADO_THEMIS_ORACLE_FOUNDATION.md
│  └─ ... (documentação completa)
├─ access_matrix.json        # Permissões do ecossistema
├─ netlify.toml              # Netlify configuration
├─ package.json
└─ README.md
```

## � API Endpoints (Serverless Functions)

### `/api/dashboard-stats`
- **Método**: GET
- **Descrição**: Retorna estatísticas em tempo real do dashboard
- **Resposta**: JSON com contadores de leads, visualizações, score de integridade

### `/api/forms`
- **Método**: GET
- **Descrição**: Retorna configurações de formulários e planos disponíveis
- **Resposta**: JSON com planos (R$14.90, R$29.90, R$80+), validações LGPD

### `/api/insights`
- **Método**: GET
- **Descrição**: Retorna insights de mercado (protegido por NDA)
- **Autenticação**: Requer token de NDA assinado
- **Resposta**: JSON com dados comerciais sensíveis

### `/api/leads`
- **Método**: POST
- **Descrição**: Submete novos leads com validação LGPD
- **Body**: JSON com nome, email, telefone, plano selecionado
- **Resposta**: Confirmação de cadastro com ID único

### `/api/telemetry`
- **Método**: POST
- **Descrição**: Registra eventos de telemetria forense
- **Body**: JSON com tipo de evento, timestamp, metadados
- **Resposta**: Confirmação de registro

## 🎯 Funcionalidades Principais

- **Hero Panel Sandbox**: Modo simulação com números realistas do pilot
- **Intelligence Hub Animation**: Visualização ao vivo com NFC pulse rings, score gauge, contadores animados
- **NDA Modal Protocol**: Proteção de dados sensíveis com assinatura digital
- **B2B Accordion**: FAQ estratégico para gestores de frota
- **Pricing Tiers**: Planos R$14.90 (Starter), R$29.90 (Pro), R$80+ (Enterprise)
- **Badges DREX/MOBI**: Integração com padrões brasileiros de mobilidade
- **Score de Integridade**: Métrica de confiança operacional em tempo real
- **Telemetria Forense**: Auditoria completa da jornada do usuário

## �📝 Licença
Propriedade Intelectual Privada — GuardDrive™ e Symbeon Labs. Todos os direitos reservados.
