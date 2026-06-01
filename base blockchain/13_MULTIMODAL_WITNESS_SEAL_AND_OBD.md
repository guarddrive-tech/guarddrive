# Vínculo Multimodal: O Selo Físico e a Telemetria OBD-II

Este documento formaliza a arquitetura de segurança contra fraudes logísticas e de seguros baseada na **Cooperação Multimodal entre o Selo Passivo (GuardTag™ V1) e a Telemetria Ativa (GuardTag™ V2 - OBD-II)**.

---

## 👁️ 1. O Problema da Fraude do Dongle Isolado (Spoofing)

Se o sistema dependesse **apenas** dos dados capturados da porta OBD-II via Dongle ativo (GuardTag V2), o protocolo estaria vulnerável ao **Ataque de Emulação de Chassi**:
1. Um motorista mal-intencionado desconecta o Dongle OBD-II do caminhão de carga de alto valor.
2. Ele conecta o Dongle em um simulador de ECU em sua própria bancada residencial ou em um veículo menor de passeio.
3. O Dongle transmite telemetria simulada perfeita de "condução segura", enquanto o caminhão real desvia da rota para desvio de carga sem monitoramento.

A união do **Selo Criptográfico Visual no Para-brisa (V1)** com o **Módulo OBD-II (V2)** cria a **Âncora de Incolumidade Física** definitiva.

---

## 📡 2. A Matriz de Vinculação Selo-Chassi (V1 ➔ V2)

Para garantir que o veículo monitorado é o mesmo que transporta a carga, o **Magistrado Themis™** executa uma auditoria de **Consistência de Coexistência**:

```
 [ Para-brisa: Selo Passivo V1 ]
   │  ▲
   │  │  (Ping de Proximidade BLE / IR a cada 50ms)
   ▼  │
 [ Painel: Dongle OBD-II V2 ] ──► (Transmite via 4G/Lora) ──► [ Magistrado Themis™ (L3) ]
   │
   └──► (Lê VIN e Ignicão do Chassi)
```

1. **Assinatura Espacial Contínua:** O Dongle OBD-II (V2) possui um emissor infravermelho (IR) e antena BLE direcional apontada para o para-brisa. Ele pinga continuamente o Selo V1 para garantir que a distância física entre a porta OBD-II e o vidro do carro é inferior a 1,5 metros.
2. **Criptografia NTAG 424 DNA:** O Selo V1 responde a cada leitura de NFC com uma chave criptográfica dinâmica (SUN - Secure Unique NFC) gerada internamente, impossível de ser clonada ou interceptada.
3. **Consenso de Chassi:** Se o Dongle OBD-II perder o sinal de proximidade do Selo V1, ou se a chave SUN do Selo divergir do banco de dados UEAP, o Magistrado Themis™ emite um alerta de **BREACHED (Quebra de Coexistência)** instantaneamente, invalidando o seguro de carga on-chain.

---

## 🚛 3. Expansão de Mercado: Telemetria Sem OBD-II

A integração com o **Selo Passivo (AOA + NFC)** permite ao GuardDrive™ estender seu mercado endereçável para **100% dos ativos móveis**, incluindo categorias de veículos sem entrada OBD-II ou sistemas eletrônicos complexos:

```
                  CATEGORIAS DE VALIDAÇÃO DE FLUXO
┌───────────────────────────────┬────────────────────────────────┐
│   Com Porta OBD-II (V1+V2)    │     Sem Porta OBD-II (V1)      │
├───────────────────────────────┼────────────────────────────────┤
│ • Caminhões e Carros Modernos │ • Carretas e Baús (Trailers)   │
│ • Telemetria de Motor/ECU     │ • Contêineres de Carga Seca    │
│ • Detecção Ativa de Desgaste  │ • Veículos Antigos/Colecionáveis│
│ • Pedágio Livre Autônomo      │ • Máquinas Agrícolas / Tratores│
└───────────────────────────────┴────────────────────────────────┘
```

### O Fluxo "Zero OBD-II" (Mobile-Gated Attestation)
Para ativos que utilizam apenas o **Selo GuardTag V1 (PET + DNA Criptográfico)**:
1. O operador da doca ou o motorista aproxima o celular do Selo V1 ao iniciar o frete.
2. O aplicativo nativo GuardDrive lê a assinatura óptica atômica (AOA) usando a câmera (validando a micro-geometria do adesivo para garantir que não é uma fotocópia) e faz o ping NFC.
3. O celular transmite o veredicto assinado localmente com a geolocalização do aparelho.
4. O Magistrado Themis™ registra uma atestação pontual de checkpoint na **UEAP**.
5. **Resultado:** Rastreabilidade total de contêineres e carretas desprovidas de bateria ativa por menos de US$ 1,50 por tag.

---

## 🏛️ 4. Impacto Legal e Forense (TRL-5 Defensivo)

Esta arquitetura confere ao GuardDrive™ a maior barreira de entrada técnica contra pirataria de dados automotivos do mundo:
* **Prova de Não-Repúdio:** O motorista não pode alegar que "o dongle falhou" ou "saiu do lugar", pois o Selo passivo possui tinta *Tamper-Evident* que se destrói ao ser removido do vidro, provando fisicamente a tentativa de burla.
* **Segurança Imune a Jammer:** Mesmo que um criminoso utilize bloqueadores de sinal celular (jammers) para mascarar o trajeto do caminhão, a comunicação local de silício (IR / BLE direcionados) entre o Dongle V2 e o Selo V1 grava localmente a Prova de Realidade Física (PoPE) na memória protegida da GuardTag. Assim que o caminhão entra em área com sinal, a cadeia de atestações é liquidada no blockchain retroativamente.
