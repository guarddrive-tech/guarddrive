---
category: architecture
---

# System Boundaries — O que é e o que não é o GuardDrive

> Última revisão: 2026-07-30

Este documento existe para impedir que, no futuro, alguém reintroduza uma
narrativa antiga por desconhecimento do histórico. Em caso de dúvida sobre
se algo pertence à comunicação pública do GuardDrive, este documento
decide — ele está no topo da hierarquia definida em
`docs/governance/DOCUMENT_HIERARCHY.md`.

## GuardDrive é
- ✔ **Operational Trust** — camada de confiança operacional
- ✔ **Evidence** — evidência confiável de eventos operacionais, aceitável
  como prova (Arts. 434/435 CPC)
- ✔ **Mobility** — foco em operações de mobilidade: seguradoras, frotas,
  logística, plataformas
- ✔ **Decision Layer** — infraestrutura que acelera e protege decisões de
  negócio (liquidação de sinistro, auditoria, due diligence)

## GuardDrive NÃO é (hoje, em comunicação pública)
- ✘ **Blockchain Platform** — não vendemos nem demonstramos blockchain
  como parte do produto atual. Nenhuma tela, proposta ou material comercial
  deve mencionar blockchain, ledger, smart contract, token ou mineração.
- ✘ **IoT Company** — não somos uma empresa de dispositivos conectados.
- ✘ **GPS Tracker** — não somos um rastreador veicular convencional.
- ✘ **Hardware Manufacturer** — não fabricamos nem vendemos hardware como
  proposta de valor central; o hardware (Selo Soberano™) é um meio, não o
  produto.

## Nota importante
Os itens marcados como "NÃO é" podem existir como **pesquisa** (ver
`docs/research/`) ou **visão de futuro** (ver `docs/vision/VISION.md`).
Isso não os torna parte do produto ou da comunicação comercial atual. Um
documento de pesquisa sobre ZK-proofs não viola esta regra; um slide de
vendas, uma tela de portal ou um texto de landing mencionando "blockchain"
viola.

## Como usar este documento
- Antes de publicar qualquer copy nova (landing, portal de qualificação,
  proposta comercial, apresentação, FAQ), confira contra esta lista.
- Se um item do lado "✘" precisar voltar a fazer parte da comunicação
  pública, isso exige um novo ADR em `docs/architecture/ADR/` — não uma
  decisão de copy isolada.
