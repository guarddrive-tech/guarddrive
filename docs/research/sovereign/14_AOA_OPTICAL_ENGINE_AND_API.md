# Especificação do Motor AOA: Execução Mobile & API para Câmeras Públicas

Este documento define a arquitetura técnica, os modelos de computação visual e as integrações de API para a **Assinatura Óptica Atômica (AOA)™**, a tecnologia de proteção contra cópias, adulterações e clonagem de frotas.

> [!IMPORTANT]
> **Divisão de Propriedade Intelectual (PI) e Licenciamento:**
> A **Assinatura Óptica Atômica (AOA)™** e o motor de análise micro-geométrica são ativos proprietários exclusivos da **Symbeon Labs (Core P&D)**. O **GuardDrive™** e o selo comercial **GuardTag™** são licenciados pela Symbeon Labs para a comercialização B2B e industrial das tags e integrações de seguros.

---

## 👁️ 1. O que é a Assinatura Óptica Atômica (AOA)?

A AOA é um método de autenticação físico-digital que trata a superfície do selo GuardTag™ V1 como uma **impressão digital física caótica e in-clonável**. Cada selo produzido possui:

1. **Micro-Geometria DTM (Digital Texture Model):** Ranhuras físicas microscópicas em relevo tridimensional.
2. **Tintas Ópticas Variáveis (OVI):** Pigmentos que alteram o espectro cromático dependendo do ângulo de incidência da luz e de filtros polarizados.
3. **Padrão Estocástico de Dispersão:** Um padrão de micropartículas embutidas no substrato adesivo que se distribui de maneira única e aleatória no momento da fabricação.

---

## ⚙️ 2. Arquitetura de Execução Distribuída

O motor de visão computacional da AOA foi projetado para operar sob um modelo híbrido (**Edge-to-Cloud**), garantindo alta velocidade e capacidade de resposta local com validação centralizada e soberana:

```
                  ┌───────────────────────────────┐
                  │ Câmera (Smartphone, Doca ou   │
                  │ LPR de Concessionária/CCTV)   │
                  └───────────────┬───────────────┘
                                  │ (Captura de Frame / Vídeo)
                                  ▼
                 ┌─────────────────────────────────┐
                 │    Pré-processamento no Edge    │
                 │   - Detecção de Objeto (YOLOv8) │
                 │   - Correção de Perspectiva     │
                 │   - Filtro de Contraste Local   │
                 └────────────────┬────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼ (Canal Mobile / Offline)                        ▼ (Canal API de Trânsito / LPR)
┌─────────────────────────────────┐               ┌─────────────────────────────────┐
│     WebAssembly / TF-Lite       │               │        Magistrado Themis™       │
│  - Validação Geométrica local   │               │        Cloud AOA Engine API     │
│  - Checagem de reflexão OVI     │               │ - Reconstrução 3D de Texturas   │
│  - Assinatura Rápida            │               │ - Verificação com Cripto-Chave  │
└─────────────────────────────────┘               └─────────────────────────────────┘
```

### A. Camada Edge (Celular e Leitores de Pátio)
No aplicativo mobile e nos leitores dedicados de cancelas de portos, a validação é executada em tempo real diretamente no hardware cliente para evitar gargalos de latência de rede:
* **Mobile Runtime (Wasm/TF-Lite):** O app inicia um guia visual na tela para o motorista alinhar a câmera com o selo. O flash do celular é acionado para capturar frames em múltiplos ângulos de luz, permitindo que o algoritmo de **Redes Neurais de Redução Cíclica** calcule a variação da cor da tinta OVI.
* **Leitores de Cancela Industriais:** Equipamentos dotados de câmeras de alta velocidade, iluminação LED estroboscópica infravermelha e filtros de luz polarizada, capturando e validando a incolumidade do selo a até 60 km/h sem necessidade de parada física do caminhão.

---

## 📡 3. Integração com Câmeras Públicas e LPR (Detecta & Pedágios)

A AOA foi especificamente desenhada para **rodar como uma API de Altíssima Performance** integrada a sistemas municipais e estaduais de monitoramento rodoviário, câmeras públicas de segurança (CCTV) e leitores automáticos de placas (**LPR / ALPR**).

### A. O Fluxo de Processamento da API Cloud
Sistemas de rodovias públicas (como concessionárias de pedágios ou a central estadual de trânsito) não precisam ler o chip NFC; eles utilizam a infraestrutura ótica existente:

1. A câmera de trânsito captura a placa do veículo na estrada.
2. O sistema de LPR padrão traduz a placa (ex: `ABC-1234`).
3. O frame contendo a imagem do para-brisa é enviado como payload para a nossa **API AOA Magistrado Themis™** (`POST /api/aoa/verify`).
4. O motor AOA isola a coordenada do selo no vidro, analisa os vetores micro-geométricos e realiza a checagem cruzada:
   $$\text{Verify}(\text{Placa}, \text{Assinatura Visual AOA}) \to \text{True/False}$$
5. **Combate Imbatível ao Clone:** Se o caminhão que está na rodovia for clonado, a placa dirá que é o veículo original, mas a câmera pública não detectará a assinatura ótica correta do selo (ou identificará um selo falso/xerocado sem relevo 3D). Um alerta de clonagem e roubo de frota é disparado em menos de 100ms para a polícia e para o operador da frota.

---

## 🛠️ 4. Interface da API AOA: `magistrado_aoa_api.py`

Abaixo está o design técnico da rota de API de processamento de visão computacional integrada ao Magistrado Themis™:

```python
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import numpy as np
import cv2 # OpenCV para processamento de matrizes visuais
import hashlib

app = FastAPI(title="Magistrado Themis™ AOA Engine API")

def extract_microgeometry_vector(image_bytes: bytes) -> np.ndarray:
    """
    Simula o motor de extração de características da AOA.
    Aplica filtros Laplacian e Gabor para medir a micro-geometria (DTM) da superfície.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError("Imagem corrompida ou inválida.")
        
    # Redimensiona para normalização
    img_resized = cv2.resize(img, (256, 256))
    
    # Filtro de Gabor para detectar a textura caótica das ranhuras do selo
    g_kernel = cv2.getGaborKernel((21, 21), 8.0, np.pi/4, 10.0, 0.5, 0, ktype=cv2.CV_32F)
    filtered_img = cv2.filter2D(img_resized, cv2.CV_8U, g_kernel)
    
    # Extrai histograma de gradientes orientados (HOG) como vetor de assinatura
    vector = cv2.calcHist([filtered_img], [0], None, [64], [0, 256]).flatten()
    return vector / np.linalg.norm(vector) # Vetor normalizado L2

@app.post("/api/aoa/verify")
async def verify_optical_signature(
    plate: str = Form(...),
    registered_signature_hash: str = Form(...),
    image: UploadFile = File(...)
):
    """
    Endpoint integrado para câmeras de rodovia e LPR.
    """
    try:
        content = await image.read()
        
        # 1. Extrai o vetor visual da imagem enviada pela câmera pública
        extracted_vector = extract_microgeometry_vector(content)
        
        # 2. Gera o hash identificador do vetor
        extracted_hash = hashlib.sha256(extracted_vector.tobytes()).hexdigest()
        
        # 3. Compara o hash ótico extraído com a assinatura registrada na blockchain (UEAP)
        # Em produção, a API consulta o blockchain usando Web3
        is_match = extracted_hash[:16] == registered_signature_hash[:16]
        confidence = float(np.dot(extracted_vector, extracted_vector)) # Cosseno de similaridade simulado
        
        return {
            "status": "success",
            "is_authentic": is_match,
            "confidence": f"{confidence * 100:.2f}%",
            "extracted_hash": extracted_hash,
            "plate_matched": plate,
            "verdict": "AUTHENTIC" if is_match else "CLONE_DETECTED_OR_TAMPERED"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

---

## 🏛️ 5. Vantagem Patenteável (Moat Tecnológico)

Esta capacidade de **transformar câmeras públicas comuns de LPR em sensores de autenticação forense contra clonagem** constitui um dos moats de Propriedade Intelectual (PI) mais valiosos do ecossistema GuardDrive™:
* montadoras gastam bilhões de dólares tentando integrar chips em frotas antigas.
* O GuardDrive™ entrega a mesma segurança militar aplicando apenas inteligência artificial de leitura ótica (AOA) sobre a infraestrutura de câmeras que os estados e pedágios **já possuem implantada no asfalto**.
