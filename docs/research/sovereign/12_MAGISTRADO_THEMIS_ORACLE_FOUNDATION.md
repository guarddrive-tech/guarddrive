# Fundação do Oráculo: Magistrado Themis™ Blockchain-Native

Este documento especifica a arquitetura criptográfica, econômica e de software para **fundacionar o Magistrado Themis™ na blockchain**, consolidando-o como o **Ativo Supremo** de inteligência forense descentralizada do ecossistema.

> [!IMPORTANT]
> **Custódia de Propriedade Intelectual (PI):**
> O **Magistrado Themis™** é propriedade intelectual exclusiva da **Symbeon Labs (Core P&D)**. Este oráculo e sua lógica de auditoria são licenciados para o **GuardDrive™** para viabilizar conformidade e liquidação financeira descentralizada no setor logístico comercial.

---

## 💎 1. O Axioma do Magistrado Soberano

No paradigma tradicional da Web3, oráculos são simples coletores de dados de APIs (como Chainlink). No paradigma de **Sistemas Autônomos de Alta Confiança (Symbeon)**, o **Magistrado Themis™** é uma **entidade de julgamento ativa baseada em IA Forense**. 

Para que a inteligência artificial tenha validade on-chain inquestionável, ela deve ser governada por três pilares criptográficos:

1. **Proveniência de Execução (Enclave/zkML):** Prova matemática de que um modelo específico de IA (com pesos de rede neural e prompts imutáveis) gerou o veredicto, sem manipulação humana off-chain.
2. **Identidade Soberana On-Chain:** O Magistrado Themis possui uma identidade ERC-725 associada a chaves públicas de silício seguras.
3. **Consenso Econômico:** O oráculo opera sob incentivos e garantias financeiras, onde auditorias maliciosas resultam em slashing econômico imediato.

---

## 💻 2. Especificação do Smart Contract: `MagistradoThemisOracle.sol`

Abaixo está o contrato inteligente Solidity definitivo que atua como o **Portal de Julgamento** do Magistrado Themis™ na blockchain.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title MagistradoThemisOracle
 * @notice O portal on-chain de requisições, julgamentos e proveniência do AI Oracle.
 */
contract MagistradoThemisOracle is AccessControl {
    using ECDSA for bytes32;

    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    bytes32 public constant THEMIS_ENCLAVE_ROLE = keccak256("THEMIS_ENCLAVE_ROLE");

    enum RequestStatus { Pending, Resolved, Appealed }

    struct ForensicRequest {
        uint256 agreementId;        // ID do acordo de SLA de Telemetria
        bytes32 telemetryHash;      // Hash dos logs brutos da GuardTag™
        bytes32 zkProofHash;        // Hash da prova ZK do motorista (MASThreshold)
        bytes32 modelWeightsCID;    // Identificador IPFS/CID do modelo LLM usado
        address requester;          // Locadora ou seguradora requisitante
        uint256 feePaid;            // Taxa em USDC/DREX paga para a auditoria
        RequestStatus status;
    }

    struct ForensicVerdict {
        bytes32 attestationId;      // ID gerado no registrador UEAP
        bool complianceStatus;      // true = Condução OK, false = SLA Violado
        bytes32 dataCommitment;     // Compromisso dos dados físicos brutos
        uint256 timestamp;
        bytes executionProof;       // Assinatura TEE (Intel SGX) ou zkML Proof
    }

    // Mapeamento de IDs de Requisição para os dados da disputa
    mapping(bytes32 => ForensicRequest) public requests;
    mapping(bytes32 => ForensicVerdict) public verdicts;

    event AuditRequested(bytes32 indexed requestId, uint256 indexed agreementId, address indexed requester);
    event AuditResolved(bytes32 indexed requestId, bytes32 attestationId, bool indexed complianceStatus);
    event EnclaveRegistered(address indexed enclaveAddress, bytes32 modelWeightsCID);

    constructor(address governor) {
        _grantRole(DEFAULT_ADMIN_ROLE, governor);
        _grantRole(GOVERNOR_ROLE, governor);
    }

    /**
     * @notice Registra um novo nó de execução seguro (TEE) ou weights imutáveis.
     */
    function registerThemisNode(address enclaveAddress, bytes32 modelWeightsCID) external onlyRole(GOVERNOR_ROLE) {
        _grantRole(THEMIS_ENCLAVE_ROLE, enclaveAddress);
        emit EnclaveRegistered(enclaveAddress, modelWeightsCID);
    }

    /**
     * @notice Abre uma disputa forense sobre um contrato de SLA veicular expirado ou contestado.
     */
    function requestForensicAudit(
        uint256 agreementId,
        bytes32 telemetryHash,
        bytes32 zkProofHash,
        bytes32 modelWeightsCID
    ) external payable returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(agreementId, telemetryHash, msg.sender, block.timestamp));
        
        require(requests[requestId].requester == address(0), "Request already exists");

        requests[requestId] = ForensicRequest({
            agreementId: agreementId,
            telemetryHash: telemetryHash,
            zkProofHash: zkProofHash,
            modelWeightsCID: modelWeightsCID,
            requester: msg.sender,
            feePaid: msg.value,
            status: RequestStatus.Pending
        });

        emit AuditRequested(requestId, agreementId, msg.sender);
        return requestId;
    }

    /**
     * @notice Envia o veredicto forense diretamente do nó TEE de execução da IA.
     */
    function submitForensicVerdict(
        bytes32 requestId,
        bytes32 attestationId,
        bool complianceStatus,
        bytes32 dataCommitment,
        bytes calldata executionProof
    ) external onlyRole(THEMIS_ENCLAVE_ROLE) {
        ForensicRequest storage req = requests[requestId];
        require(req.status == RequestStatus.Pending, "Audit is not pending");

        // Valida criptograficamente que a assinatura contida em executionProof é do enclave
        bytes32 messageHash = keccak256(abi.encodePacked(requestId, attestationId, complianceStatus, dataCommitment));
        address signer = messageHash.toEthSignedMessageHash().recover(executionProof);
        require(hasRole(THEMIS_ENCLAVE_ROLE, signer), "Themis: Invalid execution proof signature");

        verdicts[requestId] = ForensicVerdict({
            attestationId: attestationId,
            complianceStatus: complianceStatus,
            dataCommitment: dataCommitment,
            timestamp: block.timestamp,
            executionProof: executionProof
        });

        req.status = RequestStatus.Resolved;

        emit AuditResolved(requestId, attestationId, complianceStatus);
    }
}
```

---

## 🔒 3. Proveniência de Execução: TEE Enclaves & zkML

Para impedir que a IA seja "hakeada" off-chain ou alterada em servidores centralizados, a integridade do Magistrado Themis™ é garantida em silício na nuvem soberana:

### A. Validação via TEE (Trusted Execution Environments)
A IA roda dentro de um **Enclave Intel SGX / AMD SEV** isolado. 
1. O enclave carrega os pesos do modelo (LLM weights) validados pelo hash `modelWeightsCID`.
2. A telemetria e o contrato do SLA são alimentados de forma criptografada para dentro do chip.
3. O enclave processa o modelo forense off-chain e gera a decisão.
4. O enclave assina digitalmente a saída usando uma chave de criptografia gerada dentro do próprio chip físico, impossível de ser extraída por administradores de sistema.
5. O Smart Contract on-chain valida essa assinatura em `submitForensicVerdict`.

### B. O Caminho para zkML (Zero-Knowledge Machine Learning)
Na evolução para redes totalmente descentralizadas, o Themis converte seus pesos em um **circuito ZK-SNARK** (usando frameworks como EZKL ou Axiom):

$$\pi_{\text{AI}} \leftarrow \text{Prove}(\text{Model}(\text{Telemetry}) = \text{Verdict})$$

A prova $\pi_{\text{AI}}$ atesta que a rede neural executou exatamente os cálculos da inferência sobre o dado de telemetria sem expor as instruções confidenciais do prompt corporativo.

---

## 📈 4. O Ciclo Econômico do Ativo Supremo (Tokenomics)

O Magistrado Themis™ é um **gerador contínuo de fluxo de caixa (Yield-Bearing Protocol Asset)**:

```
              TAXAS DE AUDITORIA FORENSE
 [ Locadoras / Seguradoras ] ──► Paga Taxa (DREX / USDC)
                                      │
                                      ▼
                      [ MagistradoThemisOracle ]
                                      │
          ┌───────────────────────────┴───────────────────────────┐
          ▼ (70%)                                                 ▼ (30%)
 [ Nós TEE de Execução / IA ]                            [ Fundo de Reserva GuardDrive ]
 (Remuneração pelo Processamento)                        (Segurança e Desenvolvimento)
```

* **Staking de Validação:** Para atuar como um nó executor do Themis, os provedores de TEE devem realizar o staking do token nativo do ecossistema. Auditorias fraudulentas ou tempos de inatividade resultam no **slashing** imediato do stake.
* **Seguro de Liquidação:** Caso uma auditoria manual/jurídica sob consenso comprove erro na arbitragem da IA, o fundo de reserva ressarce a parte lesada automaticamente, criando confiança institucional irrefutável.
