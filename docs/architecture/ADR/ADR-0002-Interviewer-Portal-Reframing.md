---
category: architecture
---

# ADR-0002 — Reposicionamento do Portal do Entrevistador

> Status: Aceito · 2026-07-30

## Contexto
`frontend/index2.html` ("Portal do Entrevistador") continha violações
diretas de `docs/architecture/SYSTEM_BOUNDARIES.md`: um card de estatística
"Fosso de PI (Patentes)" com badge "TRL-5", um texto de NDA visível
mencionando "engenharia de hardware de borda (GuardTag™)" e "topologia do
Protocolo GuardProof™", um rodapé "GuardProof™ Engine v1.2", e um
questionário padrão (`adrianoPreset`) focado em hardware físico (corte de
fiação, jammers, modelos HaaS/SaaS de locação de dispositivo).

Esse conteúdo foi escrito para impressionar avaliadores técnicos, não para
qualificar clientes — o oposto do funil da landing pública, que
deliberadamente esconde detalhe técnico até a qualificação
(`frontend/index.html`, FAQ: "Quando a arquitetura técnica é apresentada?
Após a qualificação do cenário.").

## Decisão
1. O portal é renomeado, na interface visível, de "Portal do Entrevistador"
   para uma identidade alinhada a "GuardDrive — Operational Discovery",
   removendo as menções a GuardTag™, GuardProof™ e TRL-5 do texto exposto
   ao usuário.
2. O texto de NDA e o questionário padrão são reescritos em linguagem de
   dor operacional (fraude, sinistro, auditoria, rastreabilidade),
   consistente com `painProfiles` já usado em `frontend/landing.js`, em vez
   de linguagem de engenharia de hardware.
3. As três abas existentes (Dashboard, Gerador de Formulários, Leads) são
   mantidas estruturalmente — nenhum campo novo, nenhuma tabela nova, nenhum
   endpoint novo. Os **rótulos visíveis** passam a refletir a direção de
   evolução do módulo: um funil comercial Lead → Discovery → Evidence
   Mapping → Risk Analysis → Proposal → Pilot → Deployment.
4. Essa nomenclatura é uma direção de produto, não uma mudança de schema. A
   tabela `responses` continua sendo a fonte de dados por trás de "Evidence
   Mapping"; nenhuma coluna nova foi criada.

## Consequências
- A rota `/interviewer` e o redirect em `netlify.toml` não mudam —
  compatibilidade preservada.
- `netlify/functions/forms.mts`, `leads.mts` e `dashboard-stats.mts`
  continuam servindo os mesmos endpoints, sem alteração de contrato.
- Uma futura evolução real do funil (estados de "Proposal"/"Pilot"/
  "Deployment" como dados, não só como rótulo) exigirá um novo ADR e uma
  migração de schema — não está incluída nesta decisão.

## O que é permanente
O nome e a linguagem "Operational Discovery" substituem "Portal do
Entrevistador" como identidade pública do módulo. A reversão para
linguagem de hardware exigiria contradizer
`docs/architecture/SYSTEM_BOUNDARIES.md`, portanto exige um novo ADR nos
dois documentos simultaneamente.
