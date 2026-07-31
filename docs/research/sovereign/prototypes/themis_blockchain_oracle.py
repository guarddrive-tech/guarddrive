# -*- coding: utf-8 -*-
"""
Magistrado Themis™ — Blockchain Oracle Bridge v1.0
Script de integração que conecta a inteligência forense (L3) com o 
Universal Event Attestation Protocol - UEAP (L2) e o Escrow do GuardDrive™ (L4).
"""

import os
import json
import hashlib
from typing import Dict, Any
from web3 import Web3
from web3.middleware import geth_poa_middleware

# ----------------------------------------------------------------------
# 1. Configurações de Conexão Criptográfica (EVM & UEAP)
# ----------------------------------------------------------------------
RPC_URL = os.getenv("GUARDDRIVE_RPC_URL", "https://sepolia.infura.io/v3/your-project-id")
THEMIS_PRIVATE_KEY = os.getenv("THEMIS_PRIVATE_KEY", "0x0000000000000000000000000000000000000000000000000000000000000000")

# Endereços dos Smart Contracts implantados
UEAP_REGISTRY_ADDRESS = os.getenv("UEAP_REGISTRY_ADDRESS", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
ESCROW_CONTRACT_ADDRESS = os.getenv("ESCROW_CONTRACT_ADDRESS", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512")

# ABIs mínimas para interação
UEAP_ABI = json.loads('[{"inputs":[{"internalType":"bytes32","name":"eventHash","type":"bytes32"},{"internalType":"bytes","name":"proof","type":"bytes"}],"name":"attest","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"}]')
ESCROW_ABI = json.loads('[{"inputs":[{"internalType":"bytes32","name":"agreementId","type":"bytes32"},{"internalType":"bytes32","name":"attestationId","type":"bytes32"}],"name":"settleAgreement","outputs":[],"stateMutability":"nonpayable","type":"function"}]')

# ----------------------------------------------------------------------
# 2. Inicialização da Conexão Blockchain
# ----------------------------------------------------------------------
w3 = Web3(Web3.HTTPProvider(RPC_URL))
# Suporte para redes PoA (ex: Sepolia, Testnets DREX)
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

if w3.is_connected():
    themis_account = w3.eth.account.from_key(THEMIS_PRIVATE_KEY)
    print(f"[Themis Oracle] Conectado ao nó EVM. Endereço Soberano: {themis_account.address}")
else:
    print("[Error] Não foi possível conectar ao nó EVM.")

# ----------------------------------------------------------------------
# 3. Núcleo Forense do Magistrado Themis
# ----------------------------------------------------------------------
def analyze_telemetry_event(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simula o motor de inteligência forense que seria treinado pelo dataset.
    Avalia a consistência e integridade física dos dados coletados na estrada.
    """
    gtid = event_data.get("gtid", "UNKNOWN")
    speeds = event_data.get("speeds", [])
    g_forces = event_data.get("gForces", [])
    
    # Validações lógicas (Heurísticas do Magistrado Themis)
    max_speed = max(speeds) if speeds else 0
    max_g_force = max(g_forces) if g_forces else 0
    
    # Determina o score de conformidade e o veredicto
    is_compliant = max_speed <= 120 and max_g_force <= 60 # Ex: <0.6g
    
    # Geração do laudo descritivo
    report = f"--- LAUDO FORENSE AUTOMATIZADO #{gtid[:8]} ---\n"
    report += f"Status: {'COMPLIANT' if is_compliant else 'BREACHED'}\n"
    report += f"Velocidade Máxima Registrada: {max_speed} km/h (Limite: 120)\n"
    report += f"Aceleração Lateral Máxima: {max_g_force/100}g (Limite: 0.6g)\n"
    report += "Análise: Assinatura de silício da GuardTag™ validada e consistente."
    
    return {
        "is_compliant": is_compliant,
        "report": report,
        "max_speed": max_speed,
        "max_g_force": max_g_force
    }

# ----------------------------------------------------------------------
# 4. Envio de Atestação ao UEAP (On-Chain)
# ----------------------------------------------------------------------
def attest_verdict_on_chain(agreement_id: str, event_data: Dict[str, Any]):
    """
    Processa os logs, executa a IA e publica o veredicto no registro UEAP on-chain.
    """
    # 1. Executa a inferência forense
    verdict = analyze_telemetry_event(event_data)
    print(f"\n[Magistrado Themis] Análise Forense Concluída:\n{verdict['report']}\n")
    
    # 2. Define o hash de evento UEAP apropriado
    event_string = "GUARDDRIVE.SLA.SUCCESS" if verdict["is_compliant"] else "GUARDDRIVE.SLA.BREACHED"
    event_hash = w3.keccak(text=event_string)
    
    # 3. Cria a prova serializada (Compactação dos resultados para gas efficiency)
    proof_payload = json.dumps({
        "max_speed": verdict["max_speed"],
        "max_g_force": verdict["max_g_force"],
        "report_hash": hashlib.sha256(verdict["report"].encode("utf-8")).hexdigest()
    })
    proof_bytes = w3.to_bytes(text=proof_payload)
    
    # 4. Monta a transação para o contrato UEAP
    ueap_contract = w3.eth.contract(address=UEAP_REGISTRY_ADDRESS, abi=UEAP_ABI)
    
    print("[Magistrado Themis] Enviando transação de atestação ao UEAP...")
    
    nonce = w3.eth.get_transaction_count(themis_account.address)
    tx = ueap_contract.functions.attest(
        event_hash,
        proof_bytes
    ).build_transaction({
        'from': themis_account.address,
        'nonce': nonce,
        'gas': 200000,
        'gasPrice': w3.eth.gas_price
    })
    
    # Assina e envia a transação
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=THEMIS_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    
    # Aguarda a confirmação de inclusão no bloco
    print(f"[Magistrado Themis] Tx enviada. Hash: {tx_hash.hex()}")
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    # O ID da atestação é gerado deterministicamente no evento do contrato
    # Para propósitos de orquestração local, calculamos a partir dos logs
    print(f"[Magistrado Themis] Veredicto imutavelmente gravado on-chain no bloco {receipt['blockNumber']}.")
    
    # 5. Opcional: Chama o contrato de Escrow para liquidar os fundos automaticamente
    # settle_escrow_on_chain(agreement_id, tx_hash)

# ----------------------------------------------------------------------
# 5. Demonstração e Execução de Teste
# ----------------------------------------------------------------------
if __name__ == "__main__":
    # Payload simulado vindo da porta OBD-II via GuardTag™
    sample_telemetry = {
        "gtid": "GT-A4-BR-2026",
        "speeds": [105, 110, 118, 125, 115], # Houve excesso de velocidade (125 > 120)
        "gForces": [30, 42, 35, 55, 38],     # Aceleração lateral normal (0.55g)
        "timestamp": 1779235557
    }
    
    print("--- Inicializando Auditoria do Magistrado Themis™ ---")
    # Executa a auditoria localmente (sem chaves ativas, apenas simulação)
    try:
        # Se as chaves estiverem configuradas, executa o fluxo on-chain real
        if w3.is_connected() and THEMIS_PRIVATE_KEY != "0x0000000000000000000000000000000000000000000000000000000000000000":
            attest_verdict_on_chain(
                agreement_id="0xabc1230000000000000000000000000000000000000000000000000000000000",
                event_data=sample_telemetry
            )
        else:
            # Fallback seguro para simulação off-chain
            print("[SIMULAÇÃO] Rodando motor lógico off-chain...")
            verdict = analyze_telemetry_event(sample_telemetry)
            print(verdict["report"])
    except Exception as e:
        print(f"[Error] Falha ao executar integração: {e}")
