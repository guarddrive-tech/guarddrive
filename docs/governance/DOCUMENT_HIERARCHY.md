# Hierarquia Documental do GuardDrive

Este documento define quem tem autoridade sobre o quê dentro de `docs/`.
Em caso de contradição entre dois documentos, o de nível mais alto prevalece
— e a contradição deve ser corrigida no documento de nível mais baixo,
nunca ignorada ou deixada para depois.

## Ordem de autoridade (sobre o que é verdade hoje)

1. **`docs/architecture/SYSTEM_BOUNDARIES.md`** — o que o GuardDrive é e não
   é. Muda raramente; qualquer mudança aqui é uma decisão de posicionamento,
   não uma edição de copy.
2. **`docs/architecture/PRODUCT_CANON.md`** — fonte da verdade sobre o
   produto atual: o que existe, quem é o cliente, o que está em produção.
3. **`docs/architecture/ADR/`** — por que a arquitetura atual é a que é.
   Cada decisão vive em um arquivo numerado sequencialmente
   (`ADR-0001-...`, `ADR-0002-...`) e nunca é editada retroativamente —
   uma decisão revertida gera um novo ADR que referencia o anterior.
4. **`docs/architecture/`** (demais documentos técnicos) — como o sistema
   está construído.
5. **`docs/research/`** — pesquisa técnica viva (protocolo, ZK, oráculo
   soberano). Não define o produto atual, mas não é descartável: é o que
   pode vir a ser o produto, se e quando um novo ADR decidir isso.
6. **`docs/knowledge/`** — aprendizado comercial e estratégico. Informa
   decisões de negócio; não define arquitetura nem produto.
7. **`docs/legal/`** — obrigações e enquadramento jurídico. Autoritativo no
   seu próprio domínio; não tem autoridade sobre produto ou arquitetura.
8. **`docs/archive/`** — sem autoridade nenhuma. Material histórico,
   mantido como referência. Nunca deve ser citado como representando o
   estado atual do produto, da arquitetura ou do posicionamento comercial.

## Camada separada — Vision

`docs/vision/VISION.md` não entra nesta escada de autoridade sobre "o que é
verdade hoje". Ele descreve para onde o GuardDrive pretende ir, não o que
existe agora. Vision não pode contradizer `SYSTEM_BOUNDARIES.md` ou
`PRODUCT_CANON.md` sobre o presente, mas tem liberdade total para descrever
ambições futuras (blockchain, hardware, protocolo) sem que isso seja lido
como "já implementado".

Todo documento em `docs/research/` deve deixar claro se é:
- **(a)** insumo para a Vision — ainda não implementado; ou
- **(b)** parte da arquitetura já implementada — nesse caso ele deveria
  estar em `docs/architecture/`, não em `docs/research/`.

## Regra prática de uso

Nenhum documento em `docs/research/`, `docs/knowledge/` ou `docs/archive/`
pode ser citado em comunicação externa (landing, propostas comerciais,
apresentações, portal de qualificação) sem passar antes pelo filtro de
`docs/architecture/SYSTEM_BOUNDARIES.md`. Se um item hoje classificado como
pesquisa ou arquivado precisar voltar a fazer parte da comunicação pública,
isso exige um novo ADR — não uma decisão de copy isolada.

## Documentos relacionados
- `docs/governance/REPOSITORY_CONVENTIONS.md`
- `docs/governance/VERSIONING_POLICY.md`
- `REPOSITORY_MANIFEST.md` (raiz do repositório)
