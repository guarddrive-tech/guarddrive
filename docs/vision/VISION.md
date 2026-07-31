---
category: architecture
---

# GuardDrive — Vision

> Camada: Vision → Mission → Product → Architecture → Implementation.
> Este documento descreve para onde o GuardDrive pretende ir. Não é o
> estado atual do produto — isso está em `PRODUCT_CANON.md`.

## Missão
Ser a camada de confiança operacional para mobilidade: a infraestrutura que
transforma eventos físicos (sinistros, uso de ativos, jornadas) em
evidência confiável para decisões de negócio, seguro e compliance.

## Visão de longo prazo
Uma infraestrutura soberana de confiança para mobilidade, combinando
identidade verificável de ativos (Selo Soberano™), atestação criptográfica
e um oráculo forense assistido por IA. O detalhamento técnico dessa visão
vive em `docs/research/sovereign/` e `docs/research/zk/`.

## Por que isso não é o produto de hoje
O produto vendido e demonstrado atualmente ("Operational Trust for
Mobility") é deliberadamente mais simples e mais fácil de validar em campo
do que esta visão de longo prazo — ver
`docs/architecture/ADR/ADR-0001-Current-Architecture.md`. A visão continua
válida como direção de pesquisa e como norte de produto; não deve ser
confundida com o roadmap confirmado nem com o que está implementado.

## Como este documento se relaciona com a pesquisa
Todo material em `docs/research/` é insumo para esta visão. Quando (e se)
um elemento de pesquisa for promovido a arquitetura real, isso é registrado
por um novo ADR em `docs/architecture/ADR/`, e só a partir desse ADR o
elemento pode aparecer em `PRODUCT_CANON.md` e em comunicação comercial.
