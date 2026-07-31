# Política de Versionamento Documental

## ADRs
Numerados sequencialmente (`ADR-0001`, `ADR-0002`, ...) em
`docs/architecture/ADR/`. Nunca editados retroativamente. Uma decisão
revertida ou substituída gera um novo ADR que referencia explicitamente o
anterior ("Substitui ADR-000X"), preservando o histórico de raciocínio.

## `PRODUCT_CANON.md` e `SYSTEM_BOUNDARIES.md`
Versionados por data de última revisão declarada no topo do arquivo
(`> Última revisão: AAAA-MM-DD`), não por número. São documentos vivos que
devem sempre refletir o presente — diferente dos ADRs, que registram uma
decisão pontual no tempo em que foi tomada.

## `docs/knowledge/`
Cada entrada deve ter data. Aprendizados não se sobrescrevem — se um
aprendizado for invalidado por um evento posterior, isso vira uma nova
entrada em `docs/knowledge/invalidated-hypotheses/`, referenciando a
entrada original.

## `docs/archive/`
Congelado. Não recebe novas versões — recebe, no máximo, novas pastas
datadas quando um novo material se tornar histórico.
