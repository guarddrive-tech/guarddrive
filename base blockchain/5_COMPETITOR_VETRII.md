# Análise de Benchmarking: Vetrii (Passaporte Veicular Passivo)

Este documento detalha a operação, infraestrutura tecnológica, parcerias e regras de negócio da **Vetrii**, o principal player local no ecossistema brasileiro de blockchain automotiva.

---

## 🔍 1. Visão Geral (O que fazem)
A Vetrii desenvolveu uma solução de **Passaporte Veicular Digital** baseada em blockchain. O objetivo primário é registrar de forma imutável o ciclo de vida completo de veículos e suas peças no Brasil, combatendo fraudes de hodômetro, roubo de autopeças e facilitando a revenda e concessão de crédito.

---

## ⚙️ 2. Arquitetura Tecnológica (Como fazem)
- **Infraestrutura Blockchain:** Operam em uma Layer 1 própria (Appchain) implantada no ecossistema **Tanssi Network** (ligada à rede Polkadot). Essa escolha permite taxas previsíveis, customização de regras de consenso e interoperabilidade cross-chain.
- **Tecnologia de Parceria:** Desenvolvido em conjunto com a software house **HOUS3** para a implementação da infraestrutura Web3.
- **Ecossistema Financeiro:** Integração nativa projetada para o **DREX** (Real Digital do Banco Central do Brasil) e parcerias com bancos tradicionais (como o **Banco BV**) para oferecer linhas de financiamento facilitadas com base na pontuação/procedência do veículo registrado.
- **Ecossistema Governamental:** Integração regulatória com o **Tecpar** (Instituto de Tecnologia do Paraná) e **Detran-PR** para validar vistorias e transferências de propriedade diretamentamente na rede.

---

## 📜 3. Regras de Negócio e Mecânica de Captura
O maior ponto crítico da Vetrii é a natureza **passiva e baseada em checkpoints** do seu modelo de captura:

1. **Entrada de Dados:** A coleta ocorre através de uploads manuais ou via integrações de sistemas legados de concessionárias, oficinas autorizadas e laudos de vistoria física.
2. **Ponto de Falha (A Vulnerabilidade):** Como a captura não é em tempo real na borda, a integridade da origem dos dados é fraca. Exemplo: um proprietário pode rodar 50.000 km sem manutenção, voltar o hodômetro manualmente para 20.000 km e, em seguida, fazer uma vistoria para emitir o passaporte da Vetrii. A blockchain registrará "20.000 km" como a verdade oficializada de forma imutável.
3. **Mecanismo de Tokenização:** Peças e chassis são tokenizados como ativos digitais únicos, associando o histórico de sinistros, revisões e recalls diretamente ao token daquele veículo.

---

## ⚖️ 4. Posicionamento de Defesa do GuardDrive™
Frente à Vetrii, o GuardDrive™ se posiciona como a evolução do **Testemunho Forense Ativo**:

- **Da Passividade para a Atividade:** Enquanto a Vetrii registra o passado documental (checkpoints históricos), o GuardDrive™ registra o presente físico (**telemetria contínua OBD-II + IMU 6-axis a cada 50ms via GuardTag™**).
- **Assinatura na Borda (Hardware Inviolável):** O dado do GuardDrive™ não depende de laudos de terceiros sujeitos a adulteração humana. Ele é gerado e assinado criptograficamente na origem pelo hardware blindado L1, sendo impossível de burlar.
- **Consenso Trinário e IA:** Integramos auditoria automatizada por IA na rede L3 (**Magistrado Themis™**), permitindo a detecção ativa de anomalias e tentativas de fraude em tempo real, gerando provas ZK (ZK-Membrane) de alto impacto corporativo.
