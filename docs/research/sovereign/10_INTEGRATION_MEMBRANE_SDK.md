# Manual de Integração: Membrane SDK & GuardDrive™

Este documento descreve como desenvolvedores de software, dispositivos de hardware (**GuardTag™**) e agentes autônomos de inteligência artificial integram o **Membrane SDK** para orquestrar e auditar contratos inteligentes on-chain.

---

## 🛠️ 1. Inicialização do Membrane SDK

O `MembraneSDK` encapsula toda a complexidade de conexões com nós de blockchain (EVM/DREX), compilação de ABIs, assinaturas e criptografia de conhecimento zero.

```typescript
import { MembraneSDK, Wallet, Network } from '@symbeon/membrane-sdk';

// Inicialização da carteira soberana do agente/frotista
const agentPrivateKey = process.env.GUARDDRIVE_AGENT_PRIVATE_KEY;
const wallet = new Wallet(agentPrivateKey);

// Inicializa o SDK conectado à camada de liquidação (ex: Sepolia / DREX Testnet)
const sdk = new MembraneSDK({
    network: Network.SEPOLIA_TESTNET,
    providerUrl: 'https://eth-sepolia.g.alchemy.com/v2/your-api-key',
    wallet: wallet
});

console.log('Membrane SDK operacional. Endereço do Agente:', wallet.address);
```

---

## 🔒 2. Fluxo Completo de Código: Criação de SLA e Escrow

Abaixo está o script completo para cadastrar um novo veículo e criar um **Contrato de Telemetria Gated** com retenção de Performance Deposit.

```typescript
async function createVehicleSLA() {
    const vehicleNFTAddress = '0x1234567890123456789012345678901234567890';
    const escrowContractAddress = '0x0987654321098765432109876543210987654321';
    
    const tokenId = 42; // ID correspondente ao NFT do carro
    const depositUSDC = sdk.utils.toWei('500', 'mwei'); // $500 USDC (6 casas decimais)
    
    // Parâmetros do SLA acordados contratualmente
    const slaParams = {
        maxSpeedLimit: 120, // 120 km/h
        maxGForceLimit: 60,  // 0.6g
        durationSeconds: 3 * 24 * 60 * 60 // 3 dias de vigência do aluguel
    };

    console.log('Iniciando criação de SLA On-Chain...');
    
    // 1. Aprova a transferência de depósito pelo motorista
    await sdk.contracts.erc20.approve(escrowContractAddress, depositUSDC);

    // 2. Chama o Smart Contract para criar e registrar o Escrow
    const tx = await sdk.contracts.telemetryEscrow.createAgreement(
        escrowContractAddress,
        tokenId,
        depositUSDC,
        slaParams.maxSpeedLimit,
        slaParams.maxGForceLimit,
        slaParams.durationSeconds
    );

    const receipt = await tx.wait();
    const agreementId = receipt.events['AgreementCreated'].args.agreementId;
    
    console.log(`SLA criada com sucesso! ID do Acordo: ${agreementId}`);
    return agreementId;
}
```

---

## 🛡️ 3. Processamento de Telemetria e Envio de Prova ZK

Uma vez encerrado o contrato de SLA, o agente coleta os logs do **GuardTag™**, gera a prova ZK localmente off-chain e dispara a liquidação imediata dos fundos retidos no Escrow.

```typescript
async function settleVehicleSLA(agreementId: string, rawTelemetryData: any) {
    console.log('Processando telemetria final do GuardTag...');
    
    // 1. Gera o compromisso SHA-256 e o ZK-Proof off-chain via Membrane SDK
    const { proof, publicSignals } = await sdk.crypto.zk.generateProof({
        circuitPath: './circuits/MASThreshold.wasm',
        zkeyPath: './circuits/MASThreshold_final.zkey',
        inputs: {
            speedArray: rawTelemetryData.speeds,
            gForceArray: rawTelemetryData.gForces,
            latitudeArray: rawTelemetryData.latitudes,
            longitudeArray: rawTelemetryData.longitudes,
            maxAllowedSpeed: 120,
            maxAllowedGForce: 60
        }
    });

    const proofHash = sdk.crypto.hash(proof);

    // 2. Coleta as assinaturas do Consenso Trinário (Physical + Juridical + Ethical)
    const trinitySignatures = await sdk.consensus.collectSignatures({
        agreementId,
        proofHash,
        complianceStatus: publicSignals.isValid // 1 = OK, 0 = Violação
    });

    console.log('Enviando liquidação de Escrow para a Blockchain...');

    // 3. Executa a liquidação on-chain. O contrato inteligente roda a validação
    const tx = await sdk.contracts.telemetryEscrow.settleAgreement(
        agreementId,
        proofHash,
        trinitySignatures
    );

    await tx.wait();
    console.log(`Escrow do Acordo ${agreementId} liquidado com sucesso!`);
}
```

---

## 📡 4. Escuta de Eventos em Tempo Real (Real-time Governance)

Os frotistas e seguradoras podem subscrever aos eventos gerados na blockchain para automação de painéis administrativos.

```typescript
sdk.contracts.telemetryEscrow.on('AgreementBreached', (agreementId, penaltyAmount, fee) => {
    console.warn(`[ALERTA DE SEGURANÇA] SLA Violação Detectada!`);
    console.warn(`Acordo: ${agreementId}`);
    console.warn(`Multa Retida: ${sdk.utils.fromWei(penaltyAmount, 'mwei')} USDC`);
    console.warn(`Taxa GuardDrive cobrada: ${sdk.utils.fromWei(fee, 'mwei')} USDC`);
});
```
