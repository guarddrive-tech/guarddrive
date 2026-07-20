# 🔍 Revisão da Landing Page — GuardDrive™
**Análise Crítica e Recomendações de Atualização · Julho 2026**

---

## Status Atual: O Que Está Bom ✅

- Estrutura de navegação clara (Problema → Como Funciona → Benefícios → Ecossistema → Piloto)
- Identidade visual sólida (dark mode, tipografia Inter + JetBrains Mono)
- SEO bem configurado (meta tags, OG, keywords relevantes)
- Scroll animado (reveal-on-scroll) implementado
- Marquee de credibilidade (LGPD Compliant, TRL-5, etc.)
- Formulário de captura de leads conectado à API backend

---

## Problemas Identificados e Atualizações Necessárias ⚠️

### 🔴 CRÍTICO — Mensagem desatualizada (não reflete o novo posicionamento)

**Problema:** A landing page ainda posiciona o GuardDrive™ como um produto de **hardware OBD+IMU** (instalação física no veículo). O novo posicionamento — **Selo Soberano™ NFC adesivo** — não aparece em nenhum lugar.

**Impacto:** Clientes em potencial veem "Fixação rápida do hardware criptográfico GuardTag™ no veículo" e imaginam uma instalação complexa e cara — exatamente a objeção que o Selo Soberano™ resolve.

**Ação:** Atualizar a Seção 03 (Como Funciona) para apresentar o Selo Soberano™ como ponto de entrada.

---

**Texto atual (Passo 1 — Como Funciona):**
```
"Fixação rápida do hardware criptográfico GuardTag™ no veículo da frota,
sem interferir na garantia original."
```

**Texto proposto (reflete o novo posicionamento):**
```
"Instalação em minutos: o Selo Soberano™ é um adesivo NFC que vai direto
no para-brisa ou chassi do veículo. Sem obra, sem OBD, sem risco à garantia."
```

---

### 🔴 CRÍTICO — "Programa Piloto · SP" desatualizado

**Problema:** Badge no Hero diz "Programa Piloto Ativo · 2026" sem localização. O piloto ativo é em **Salvador-BA**, não São Paulo (como mencionado no `sovereign_positioning_report.md`).

**Ação:** Ajustar badge para:
```
Programa Piloto Ativo · Salvador-BA · 2026
```

---

### 🟠 IMPORTANTE — Seção GuardTag™ no Ecossistema ainda é genérica

**Problema:** O nó "GuardTag™" descreve "Dispositivo instalado em frotas para gerar assinaturas criptográficas..." — linguagem de hardware pesado.

**Ação:** Atualizar para incluir a dualidade V1 (Selo NFC) / V2 (OBD+IMU):
```
GuardTag™ — Identidade Verificável
Disponível em dois formatos:
• V1 Passivo: Selo Soberano™ NFC (adesivo — implantação imediata)
• V2 Ativo: Dongle OBD+IMU (telemetria contínua a 50ms)
```

---

### 🟠 IMPORTANTE — Falta seção de Tiers/Preços

**Problema:** Não há nenhuma indicação de preço ou plano na landing page. Para o público B2B (gestores de frota), isso gera fricção — eles precisam saber se está no range antes de pedir uma demo.

**Ação sugerida:** Adicionar seção de "Planos" simples antes do formulário de contato:

| Plano | Descrição | Preço |
|---|---|---|
| **Standard** | Selo NFC V1 · Score ~95% · App | A partir de R$ 9,90/veículo/mês |
| **Premium** | Selo NFC V2 (CMAC) · Score 100% · Laudo Forense | A partir de R$ 25/veículo/mês |
| **Enterprise** | OBD+IMU · Telemetria contínua · API dedicada | Sob consulta |

---

### 🟡 ATENÇÃO — Score de Confiança não comunicado comercialmente

**Problema:** O Score de Confiança (0–100%) é um diferencial técnico forte que não aparece em nenhuma seção da landing page.

**Ação:** Adicionar como destaque na seção de Benefícios:
```
Score de Integridade em Tempo Real
Cada verificação gera um score de 0 a 100% que quantifica a
confiabilidade do ativo. Transparência total para seguradoras.
```

---

### 🟡 ATENÇÃO — Nenhuma menção a DREX e regulação

**Problema:** O `sovereign_positioning_report.md` cita compatibilidade com DREX e MOBI VID como diferencial. Nenhuma dessas referências aparece na landing page atual.

**Ação:** Adicionar badge/chip de compatibilidade na seção Ecossistema:
```
Compatible with: DREX · MOBI VID · LGPD · ISO 27001
```

---

### 🟢 MELHORIAS — Baixa prioridade

- [ ] Adicionar **vídeo de demonstração** do app (check-in NFC → Laudo) — aumenta conversão dramaticamente
- [ ] Substituir imagem `hero_dashboard.png` por screenshot real do guardtag-app
- [ ] Adicionar seção de **FAQ** com as 5 perguntas mais comuns (instalação, dados, LGPD, preço, seguro)
- [ ] Adicionar contador de **selos ativos** e **laudos gerados** (live stats da API `/api/dashboard/stats`)
- [ ] Link para verificação de Selo via QR Code: `verify.guarddrive.tech/v/{GTID}` (demonstrável ao vivo)

---

## Resumo das Prioridades

| Prioridade | Item | Esforço |
|---|---|---|
| 🔴 1 | Atualizar Passo 1 "Como Funciona" para mencionar Selo Soberano™ | 15 min |
| 🔴 2 | Corrigir localização do piloto (Salvador-BA) | 5 min |
| 🟠 3 | Atualizar nó GuardTag™ com dualidade V1/V2 | 20 min |
| 🟠 4 | Adicionar seção de Planos/Preços | 1h |
| 🟡 5 | Incluir Score de Confiança nos Benefícios | 30 min |
| 🟡 6 | Adicionar badges DREX/MOBI na seção Ecossistema | 15 min |
| 🟢 7 | Substituir hero_dashboard.png por screenshot real | 30 min |
| 🟢 8 | Live stats (selos ativos, laudos gerados) | 2h |

---

*Revisão realizada em Julho de 2026 · GuardDrive Tech*
