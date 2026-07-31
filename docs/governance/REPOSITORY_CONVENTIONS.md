# Convenções do Repositório

## Nomenclatura de pastas
`kebab-case` para todas as pastas dentro de `docs/`, `legacy/` e `apps/`
(quando essa reorganização acontecer — ver
`docs/architecture/ADR/ADR-0001-Current-Architecture.md`).

## Fronteira entre código ativo e código legado
Código dentro de `legacy/` nunca é importado por código ativo
(`frontend/`, `netlify/functions/`, `db/`). Essa regra existe para que
nenhum deploy futuro reative acidentalmente o backend Python/Vercel — o
próprio motivo pelo qual esse código foi isolado.

## `docs/archive/` é somente leitura
Não se edita histórico. Se algo em `docs/archive/` precisar ser atualizado
para refletir o presente, isso significa que a informação correta pertence
a outro lugar da hierarquia (`docs/architecture/`, `docs/knowledge/`) — o
arquivo em `archive/` permanece como estava, como registro do que se pensava
naquele momento.

## Categoria declarada em cada novo documento
Todo novo arquivo `.md` criado fora de `docs/architecture/` deve declarar
sua categoria no topo do arquivo, como front-matter simples:

```markdown
---
category: research | knowledge | legal | archive
---
```

Isso permite auditar a árvore de `docs/` programaticamente no futuro, sem
depender de a pessoa ter posto o arquivo na pasta certa.

## Onde algo novo deve entrar
- Pesquisa técnica ainda não implementada (protocolo, ZK, oráculo) →
  `docs/research/`
- Aprendizado comercial, competitivo ou de piloto → `docs/knowledge/`
- Decisão de arquitetura → novo ADR em `docs/architecture/ADR/`
- Qualquer coisa datada que descreve um estado passado e já superado →
  `docs/archive/`
