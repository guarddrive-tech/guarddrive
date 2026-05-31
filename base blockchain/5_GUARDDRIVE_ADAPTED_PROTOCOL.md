# Adaptação de Protocolo: TrueDeal para GuardDrive™ Sovereign Witness

Este documento descreve como adaptamos os conceitos de **Acordos de Desempenho (Escrow)**, **Regras On-Chain (BFT)** e **Modelagem Econômica** desenvolvidos originalmente para o *TrueDeal (Risk Guardian Core)* para a realidade industrial e corporativa do **GuardDrive™**.

---

## 📐 1. Tradução Conceitual de Arquitetura

| Pilar de Engenharia | TrueDeal (Social/B2C) | GuardDrive™ (Enterprise Forensics B2B) |
| :--- | :--- | :--- |
| **Escopo do Acordo** | Aposta de desempenho entre pessoas (ex: perda de peso, acordar cedo). | **SLA de Telemetria Ativa** (ex: contrato de locação de frota ou financiamento veicular). |
| **Garantia (Collateral)** | Depósito voluntário em USDC/SOL por usuários da comunidade. | **Performance Deposit / Garantia de Franquia** retida no ato do aluguel ou leasing. |
| **Garantia Física (L1)** | APIs de terceiros (Strava, Apple Fitness) sujeito a dados manuais. | **GuardTag™ OBD-II + IMU 6-axis** capturando telemetria contínua blindada a cada 50ms. |
| **Camada de Oráculo (L2)** | Oráculos BFT humanos ou de terceiros (DealGuard). | **Consenso Trinário Symbeon**: Físico (GuardTag), Jurídico (Themis AI), Ético (SEVE Framework). |
| **Privacidade** | Pública / Pseudônima. | **ZK-Membrane (Conhecimento Zero)**: Prova conformidade de condução (SLA) sem vazar rota/GPS. |
| **Finalidade Financeira** | Divisão do pote de apostas entre vencedores. | Liberação automática de depósito de garantia, reajuste de prêmio de seguro ou **integração DREX**. |

---

## ⚖️ 2. Adaptação da Máquina de Estados (On-Chain Rules Engine)

O programa Anchor (ou EVM Solidity) original que regia os estados do TrueDeal foi adaptado para a mecânica de **SLA de Custódia Física de Veículos**:

1. **Formation (Formação):** O veículo é cadastrado on-chain como um NFT (Digital Twin) com seus parâmetros de SLA definidos (ex: velocidade máx: 120km/h, torque máx: 350Nm, aceleração g-force máx: 0.6g). O motorista deposita o valor da franquia/garantia no cofre digital.
2. **Active (Ativo):** O veículo está em trânsito. O hardware **GuardTag™** inicia a transmissão local e envia hashes das atestações criptográficas periodicamente. O capital na blockchain está congelado.
3. **Settled (Liquidado - Condução Perfeita):** O veículo é devolvido. Os dados mostram que os parâmetros de condução segura foram mantidos (Consenso Trinário 3/3). O depósito de garantia é liberado integralmente para o motorista, e o protocolo gera/minta **Créditos de Carbono (SEVE ESG)** para a frota.
4. **Breached (Violado - Abuso Detectado):** A IA **Magistrado Themis™** valida uma violação (ex: o carro esportivo andou a 180km/h na rodovia ou sofreu impacto severo de g-force). O contrato on-chain aciona a **"Taxa de Abuso" (Abuse Penalty)**, retendo e transferindo parte da garantia para a locadora de forma instantânea e incontestável, liquidando a taxa de auditoria do GuardDrive™.

---

## 💸 3. Modelo de Monetização: Do "Slacker Tax" ao "Wear & Tear Fee"

No TrueDeal, criamos o inovador **Slacker Tax (3% sobre os perdedores)**. Para o GuardDrive™, traduzimos este conceito para um modelo B2B extremamente atraente para locadoras e frotistas:

### O Modelo: **The Perfect-Drive Subsidy & Wear Fee**
1. **Taxa Zero para Bom Comportamento (Eco-Driver):** Se o motorista respeitar o carro, o GuardDrive™ não cobra taxa de transação sobre a devolução da garantia. O frotista fica satisfeito (veículo conservado) e o cliente também.
2. **A "Taxa de Desgaste" (Wear Tax):** Se o motorista abusar do carro (exceder limites físicos de giro, temperatura de motor ou g-force de suspensão), o contrato executa uma **multa automática on-chain**:
   - **Exemplo:** Franquia retida = $500 USDC.
   - **Abuso detectado:** Telemetria provou frenagem brusca contínua e excesso de velocidade.
   - **Cálculo da Multa:** Dedução automática de $100 USDC da garantia do cliente.
   - **Taxa GuardDrive™ (5%):** Extraímos 5% do valor da multa aplicada ($5 USDC) para a tesouraria do protocolo como taxa de validação forense ativa. O restante ($95 USDC) vai direto para a locadora para cobrir a depreciação acelerada.
3. **Efeito de Rede B2B:** Locadoras passam a exigir motoristas com alta reputação atestada on-chain para alugar veículos premium, gerando demanda orgânica massiva pelo selo **GuardDrive™ Verified**.

---

## 🛠️ 4. Próximo Passo: Integrando os Smart Contracts

Para colocar este protocolo on-chain, o próximo passo lógico é consolidar a estrutura dos contratos no repositório de execuções do Symbeon/GuardDrive, mapeando as interfaces do **Membrane SDK** para ler os dados das transações de atestação.
