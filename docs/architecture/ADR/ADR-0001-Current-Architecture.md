---
category: architecture
---

# ADR-0001 — Arquitetura Atual e Desacoplamento do Legado

> Status: Aceito · 2026-07-30

## Contexto
O repositório acumulou duas gerações de arquitetura: um backend Python
(FastAPI + Mangum, deploy via Vercel, `api/index.py`, `backend/`) e o
backend atual em Netlify Functions + Drizzle ORM + Postgres. Apenas o
segundo está em produção — confirmado por consulta ao banco de dados ativo
(branch `agent-6a6b6acacf75b07e3569d306`), que só contém as tabelas usadas
pelo schema Drizzle atual (`leads`, `forms`, `responses`, `telemetry`).

O backend Python, além de não estar em uso, gerava artefatos enganosos:
`backend/main.py` produzia hashes SHA-256 e números de bloco aleatórios
apresentados ao usuário como "atestação blockchain" — quando na verdade não
existia nenhuma blockchain real. `backend/routes/provision.py` mantinha um
banco de dados em memória (`_selos_db: dict`) para o "Selo Soberano™", nunca
conectado a Postgres.

A landing pública e o portal de qualificação também continham linguagem
técnica (blockchain, hardware, GuardProof™ Engine, TRL-5) incompatível com
o posicionamento atual do produto ("Operational Trust for Mobility"),
voltado a qualificar clientes B2B antes de expor detalhe técnico.

## Decisão
1. O backend Python, `api/index.py`, `vercel.json` e as dependências Python
   duplicadas (`requirements.txt` na raiz e em `backend/`) são isolados em
   `legacy/backend-python-vercel/`. Nenhum código ativo importa desse
   diretório.
2. A arquitetura oficial e única suportada para deploy é: Vite (frontend) +
   Netlify Functions em TypeScript + Drizzle ORM + Netlify Database
   (Postgres). Nenhum outro alvo de deploy é mantido.
3. Blockchain, hashes simulados e linguagem de hardware avançado saem da
   comunicação pública (landing, portal de qualificação, FAQs). A checksum
   de integridade real gerada em `netlify/functions/leads-submit.mts` é
   comunicada como "referência interna de registro", nunca como atestação
   blockchain.
4. A pesquisa de protocolo (blockchain, ZK, oráculo soberano) permanece
   descrita em `docs/vision/VISION.md` e `docs/research/` — este ADR não a
   revoga, apenas a desacopla da comunicação e da implementação atuais.

## Consequências
- Um novo desenvolvedor que ler `legacy/backend-python-vercel/` sabe, pelo
  próprio caminho, que aquele código não deve ser reativado nem usado como
  referência para o comportamento atual da API.
- `vercel.json` sai da raiz do repositório, eliminando a ambiguidade de
  deploy (Netlify vs. Vercel).
- A visão de protocolo continua viva como pesquisa, sem risco de ser lida
  como parte do produto entregue hoje.

## O que é permanente
A remoção de blockchain/hardware da comunicação pública não é uma etapa
temporária de "esconder até validar" — é a posição atual de produto. Uma
reversão dessa decisão exige um novo ADR, não uma alteração pontual de
copy.
