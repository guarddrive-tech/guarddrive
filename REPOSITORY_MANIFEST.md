# GuardDrive — Repository Manifest

Este repositório contém:
- ✔ Produto ativo (landing, diagnóstico, portal de qualificação, API)
- ✔ Documentação de arquitetura e governança
- ✔ Pesquisa técnica viva (protocolo, ZK, oráculo soberano)
- ✔ Conhecimento comercial e estratégico
- ✔ Histórico arquivado

## Por onde começar
1. `docs/governance/DOCUMENT_HIERARCHY.md` — quem tem autoridade sobre o quê.
2. `docs/architecture/SYSTEM_BOUNDARIES.md` — o que o GuardDrive é e não é.
3. `docs/architecture/PRODUCT_CANON.md` — o que o produto é hoje, de fato.
4. `docs/architecture/ADR/` — por que a arquitetura é a que é.

A arquitetura oficial está descrita nesses quatro documentos. O restante do
repositório (`docs/research/`, `docs/knowledge/`, `docs/archive/`,
`legacy/`) **não deve ser usado como referência primária** sobre o que o
GuardDrive é hoje — ver `docs/governance/DOCUMENT_HIERARCHY.md` para a
ordem de precedência completa.

## Mapa de pastas
```
docs/
├── governance/   convenções e hierarquia documental
├── vision/        para onde o produto pretende ir (não é o estado atual)
├── architecture/  fonte da verdade do produto e da arquitetura atuais
├── product/       visão de produto derivada do canon
├── research/      pesquisa técnica viva (protocolo, ZK, oráculo soberano)
├── knowledge/     aprendizado comercial e estratégico
├── legal/         obrigações e enquadramento jurídico
└── archive/       material histórico, sem autoridade sobre o presente

legacy/
└── backend-python-vercel/   código abandonado, isolado para nunca ser
                              reativado por acidente em um deploy futuro
```
