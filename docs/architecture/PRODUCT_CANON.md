---
category: architecture
---

# GuardDrive — Product Canon

> Última revisão: 2026-07-30
> Este é o documento de segundo nível na hierarquia de autoridade — ver
> `docs/governance/DOCUMENT_HIERARCHY.md`. Antes deste, só
> `docs/architecture/SYSTEM_BOUNDARIES.md` tem precedência.

## O que é o GuardDrive?
GuardDrive é uma camada de confiança operacional ("Operational Trust for
Mobility") para empresas que dependem de evidência confiável sobre eventos
físicos de mobilidade — sinistros, uso de ativos, auditoria de frota — para
tomar decisões de negócio, seguro e compliance.

## Qual problema resolve?
A dificuldade de seguradoras, frotistas, operadoras de logística e
plataformas de mobilidade em obter evidência rápida e confiável sobre o que
de fato aconteceu com um ativo ou uma operação, hoje resolvida por
processos manuais, lentos e sujeitos a fraude ou disputa.

## Quem é o cliente?
Empresas B2B nos segmentos de seguradoras, frotas, logística e mobilidade
— não o consumidor final. O funil comercial começa pela landing pública e é
qualificado no portal de diagnóstico antes de qualquer detalhe técnico ser
compartilhado.

## Qual é o produto atual?
- Landing page pública (`frontend/index.html`) com diagnóstico de dor por
  quiz e captura de lead.
- Página de diagnóstico executivo (`frontend/diagnostico.html`).
- Portal de qualificação comercial interno, hoje chamado "Portal do
  Entrevistador" e em processo de reposicionamento para "Operational
  Discovery Workspace" (`frontend/index2.html`) — ver
  `docs/architecture/ADR/ADR-0002-Interviewer-Portal-Reframing.md`.
- API serverless em Netlify Functions + Drizzle ORM + Postgres
  (`netlify/functions/`, `db/`).

## Quais componentes fazem parte da arquitetura oficial?
- Frontend: Vite (Vanilla JS), múltiplas entradas (`main`, `interviewer`,
  `diagnostico`).
- Backend: Netlify Functions em TypeScript (`.mts`).
- Dados: Drizzle ORM sobre Netlify Database (Postgres gerenciado).
- Deploy: Netlify — build automatizado, publish em `dist/`.
- Nenhum outro alvo de deploy é suportado. Ver
  `docs/architecture/ADR/ADR-0001-Current-Architecture.md`.

## Quais componentes são pesquisa (não implementados)?
Todo o protocolo de blockchain, zero-knowledge proofs, oráculo forense
("Magistrado Themis™") e especificações de hardware avançado (NTAG 424 DNA,
CMAC) vivem em `docs/research/protocol/`, `docs/research/zk/` e
`docs/research/sovereign/`. São pesquisa técnica viva, não implementada e
não comunicada publicamente — ver `docs/vision/VISION.md` e
`docs/architecture/SYSTEM_BOUNDARIES.md`.

## Quais componentes estão em legado (abandonados)?
O backend Python (FastAPI + Mangum, deploy via Vercel) e tudo que dependia
dele estão isolados em `legacy/backend-python-vercel/`. Esse backend gerava
hashes e números de bloco simulados apresentados como "atestação
blockchain" — uma prática que este canon proíbe explicitamente. Não deve
ser reativado; ver
`docs/architecture/ADR/ADR-0001-Current-Architecture.md`.

## Como novos desenvolvedores devem entender o projeto?
1. Leia `REPOSITORY_MANIFEST.md` na raiz.
2. Leia `docs/architecture/SYSTEM_BOUNDARIES.md` antes de escrever qualquer
   copy voltada ao público.
3. Leia este documento (`PRODUCT_CANON.md`) para saber o que está em
   produção hoje.
4. Só depois, se necessário, explore `docs/research/` e `docs/vision/` —
   e trate o que encontrar lá como direção futura, não como produto atual.
