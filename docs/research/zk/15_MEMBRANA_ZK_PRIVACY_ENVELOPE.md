# Membrana ZK: O Envelope Criptográfico de Privacidade

Este documento define a arquitetura criptográfica e as especificações de hardware/software da **Membrana ZK (ZK-Membrane)™**, o envelope de privacidade em conhecimento zero proprietário da **Symbeon Labs (Core P&D)**, licenciado para o ecossistema GuardDrive™ para conformidade estrita com a LGPD e o GDPR corporativo.

---

## 🔒 1. O Conceito de Membrana Criptográfica

Frotas corporativas, seguradoras e bancos necessitam de auditoria de conformidade física, mas a coleta de logs brutos de telemetria (especialmente rotas GPS segundo a segundo, velocidades brutas e paradas) expõe dados pessoais sensíveis e segredos comerciais logísticos altamente estratégicos.

A **Membrana ZK** atua como uma barreira cega e matemática de silício:

```
    [ DADOS FÍSICOS BRUTOS ] (Privado)
    ├── Coordenadas GPS (Lat, Long)
    ├── Velocidade contínua (50ms)
    └── Histograma de Aceleração (IMU)
                  │
                  ▼
   ===================================
   ║   MEMBRANA ZK: Circom Prover    ║ ◄─── Lógica do Contrato SLA (Público)
   ===================================
                  │
                  ▼ (Gera Prova Criptográfica Cega)
        [ PROVA ZK-SNARK (π) ] ──► [ Magistrado Themis™ / Blockchain ]
```

A Membrana ZK garante o **Axioma da Validação Efêmera**: os dados brutos são consumidos na borda, processados pelo provador matemático da Symbeon Labs, transformados em uma prova $\pi$ e destruídos localmente. A blockchain e os servidores centrais recebem apenas a prova matemática booleana de conformidade e o hash de compromisso dos dados.

---

## 📐 2. Formalização Matemática e Prova ZK-SNARK

A Membrana ZK compila o comportamento de condução em um circuito aritmético de restrições (R1CS).

### A. Entradas do Sistema (Inputs)
1. **Entradas Privadas (w - Witness):**
   * $S = [s_1, s_2, \dots, s_t]$: Vetor das velocidades instantâneas capturadas via OBD-II.
   * $G = [g_1, g_2, \dots, g_t]$: Vetor de forças inerciais laterais (IMU 6-axis).
   * $P = [p_1, p_2, \dots, p_t]$: Rota completa de coordenadas GPS (Latitude, Longitude).
2. **Entradas Públicas (x):**
   * $S_{\text{limit}}$: Limite máximo de velocidade permitido pelo contrato (ex: 120 km/h).
   * $G_{\text{limit}}$: Limite máximo de aceleração lateral (ex: 0.6g).
   * $C_{\text{data}}$: O compromisso criptográfico (Hash dos dados brutos) assinado pelo chip GuardTag™.

### B. O Circuito de Restrição (Constraint System)
O provador local executa as seguintes restrições lógicas dentro do circuito matemático:

$$\forall s_i \in S, \quad (s_i - S_{\text{limit}}) \cdot (s_i > S_{\text{limit}} ? 0 : 1) = 0$$

$$\forall g_i \in G, \quad (g_i - G_{\text{limit}}) \cdot (g_i > G_{\text{limit}} ? 0 : 1) = 0$$

Se alguma velocidade ou aceleração exceder o limite, o witness falha e a prova gerada atesta a violação contratual.

---

## ⚙️ 3. Pipeline de Execução na Borda (Edge Prover)

A Membrana ZK é executada localmente no dispositivo cliente (smartphone do motorista ou computador de bordo da GuardTag™ Pro) utilizando um runtime WebAssembly ou biblioteca nativa em Rust optimizada:

```typescript
import { zkMembrane } from '@symbeon/membrane-sdk';

async function generateComplianceProof(rawTelemetry: any, contractSLA: any) {
    console.log("[Membrana ZK] Iniciando compilação do witness criptográfico...");
    
    // 1. Prepara inputs para o circuito
    const inputs = {
        speeds: rawTelemetry.speeds,
        gForces: rawTelemetry.gForces,
        speedLimit: contractSLA.speedLimit,
        gForceLimit: contractSLA.gForceLimit,
        dataCommitment: rawTelemetry.hash
    };

    // 2. Executa a geração da prova ZK off-chain (Groth16/Plonk)
    const { proof, publicSignals } = await zkMembrane.prove(
        "circuits/MASThreshold.wasm", 
        "circuits/MASThreshold.zkey", 
        inputs
    );
    
    console.log("[Membrana ZK] Prova de conformidade de rota gerada com sucesso!");
    return { proof, publicSignals };
}
```

---

## 🏛️ 4. Custódia de PI e Licenciamento (Symbeon Labs)

* **Propriedade:** A propriedade intelectual sobre os compiladores de circuitos, os esquemas de prova ZK-SNARK e o SDK de geração de witness pertence inteiramente à **Symbeon Labs**.
* **Licença Comercial:** O GuardDrive™ licencia a Membrana ZK para prover a camada de privacidade exigida pelos grandes bancos integradores do DREX (Real Digital), garantindo conformidade regulatória sem expor trajetos comerciais confidenciais.
