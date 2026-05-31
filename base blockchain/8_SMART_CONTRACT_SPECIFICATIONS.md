# Especificação Técnica: Smart Contracts GuardDrive™

Este documento formaliza as especificações de engenharia de software Web3 para os smart contracts do ecossistema **GuardDrive™**, operando na camada de liquidação (Settlement Layer).

---

## 💻 1. Arquitetura do Contrato: Solidity Interfaces

Abaixo estão descritas as interfaces Solidity definitivas para a implementação do NFT de Identidade (Digital Twin) e do motor de Escrow de Telemetria.

### A. IGuardDriveVehicleNFT.sol
Este contrato gerencia a identidade soberana do veículo como um token ERC-721 estendido para conter atestações dinâmicas.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGuardDriveVehicleNFT {
    struct VehicleIdentity {
        string vin;               // Vehicle Identification Number (Chassis)
        address manufacturer;     // Endereço da montadora (OEM)
        uint256 birthTimestamp;   // Timestamp de fabricação / registro inicial
        bool isActive;            // Status operacional do gêmeo digital
    }

    event VehicleRegistered(uint256 indexed tokenId, string vin, address indexed owner);
    event AttestationUpdated(uint256 indexed tokenId, bytes32 indexed attestationHash);

    function registerVehicle(address to, string calldata vin) external returns (uint256);
    function updateVehicleAttestation(uint256 tokenId, bytes32 attestationHash) external;
    function getVehicle(uint256 tokenId) external view returns (VehicleIdentity memory);
}
```

### B. IGuardDriveTelemetryEscrow.sol
O núcleo financeiro que retém a garantia da franquia e liquida disputas baseadas na validação do Consenso Trinário.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGuardDriveTelemetryEscrow {
    enum AgreementStatus { Formation, Active, Settled, Breached }

    struct TelemetrySLA {
        uint256 tokenId;           // ID do veículo associado
        uint256 depositAmount;     // Valor da garantia (USDC/DREX)
        uint32 maxSpeedLimit;      // Parâmetros de SLA (ex: km/h)
        int32 maxGForceLimit;      // Limite g-force em centésimos de g (ex: 60 = 0.6g)
        uint256 startTimestamp;
        uint256 endTimestamp;
        AgreementStatus status;
    }

    event AgreementCreated(bytes32 indexed agreementId, uint256 indexed tokenId, uint256 depositAmount);
    event AgreementSettled(bytes32 indexed agreementId, uint256 refundAmount);
    event AgreementBreached(bytes32 indexed agreementId, uint256 penaltyAmount, uint256 verificationFee);

    function createAgreement(
        uint256 tokenId,
        uint256 depositAmount,
        uint32 maxSpeedLimit,
        int32 maxGForceLimit,
        uint256 durationSeconds
    ) external payable returns (bytes32);

    function triggerActiveSLA(bytes32 agreementId) external;

    function settleAgreement(
        bytes32 agreementId,
        bytes32 proofHash,
        bytes calldata trinitySignatures
    ) external;
}
```

---

## 📊 2. Estrutura de Dados e Eventos

### TelemetryPayload (Atestação Física L1)
Para evitar inchaço de dados on-chain (Gas Bloat), os dados brutos de telemetria nunca são armazenados na blockchain. Em vez disso, o contrato valida a assinatura criptográfica de um payload estruturado gerado pelo **GuardTag™**:

```solidity
struct TelemetryProof {
    bytes32 dataHash;         // Hash SHA-256 dos dados brutos offline
    uint256 sequenceNumber;   // Contador para evitar ataques de replay
    uint256 timestamp;        // Data do evento no hardware
    bytes signature;          // Assinatura do chip criptográfico (GuardTag)
}
```

---

## 🛡️ 3. Tratamento de Erros e Exceções

Os contratos inteligentes do GuardDrive™ utilizam **Custom Errors** para economia severa de gas e auditoria transparente:

```solidity
error SLAAlreadyActive();
error SLANotActive();
error DepositDivergent();
error SLAExpired();
error SLANotExpired();
error TrinityConsensusFailed();
error InvalidZKProof();
error ZeroAddressDetected();
```
