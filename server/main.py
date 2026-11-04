"""
NexusPrimer 2.0 — FastAPI Sunucu Tüketicisi (server/main.py)
YZM301 Bonus +10 Puan Görevi: Kendi sunucumuzda çalışan ONNX çıkarım servisi.

Bu servis:
1. 'model/model.onnx' dosyasını onnxruntime ile yükler.
2. JSON girdilerini kabul ederek tarayıcıdan bağımsız sunucu tarafı çıkarım yapar.
3. '/api/v1/parite' uç noktası üzerinden 5 referans girdi için parite farkının < 1e-4 olduğunu doğrular.
"""

import json
import pathlib
from typing import List, Optional
import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = pathlib.Path(__file__).parent.parent
MODEL_PATH = BASE_DIR / "model" / "model.onnx"
CONFIG_PATH = BASE_DIR / "model" / "config.json"
PARITE_PATH = BASE_DIR / "tests" / "parite.json"

app = FastAPI(
    title="NexusPrimer 2.0 Adaptive Inference API",
    version="2.0.0",
    description="ONNX Runtime tabanlı sunucu tarafı çıkarım ve diferansiyel parite servisi"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model ve yapılandırmayı yükle
try:
    session = ort.InferenceSession(str(MODEL_PATH))
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)
    print(f"[OK] ONNX modeli sunucuya yüklendi: {MODEL_PATH}")
except Exception as e:
    session = None
    config = {}
    print(f"[HATA] Model yüklenemedi: {e}")

class DecisionFeatures(BaseModel):
    karar_suresi_sn: float = Field(..., example=45.0, description="Kararı vermek için geçen süre (sn)")
    onceki_yanlis_sayisi: int = Field(..., example=2, description="Önceki kararlardaki hata sayısı")
    ipucu_sayisi: int = Field(..., example=3, description="Oyuncunun daha önce aldığı ipucu sayısı")
    karar_degistirme_sayisi: int = Field(..., example=2, description="Kararını kaç defa değiştirdiği")
    sahne_no: int = Field(..., example=2, description="Mevcut karar aşaması (1, 2 veya 3)")
    seviye: int = Field(..., example=0, description="Oyuncunun deneyim seviyesi (0: beginner, 1: experienced)")
    onceki_karar_suresi: float = Field(..., example=40.0, description="Bir önceki kararın süresi (sn)")
    kararsizlik_suresi: float = Field(..., example=18.0, description="Karar vermeden önce beklediği tereddüt süresi (sn)")

class PredictionResponse(BaseModel):
    ipucu_gerekli: int
    probability: float
    decision_mode: str
    model_version: str

@app.get("/")
def root():
    return {
        "service": "NexusPrimer Adaptive ML Server",
        "status": "online",
        "version": "2.0.0",
        "model_loaded": session is not None,
        "endpoints": {
            "predict": "POST /api/v1/predict",
            "parite": "GET /api/v1/parite",
            "docs": "/docs"
        }
    }

@app.post("/api/v1/predict", response_model=PredictionResponse)
def predict(features: DecisionFeatures):
    if session is None:
        raise HTTPException(status_code=503, detail="ONNX modeli sunucuda yüklü değil")

    input_vector = np.array([[
        features.karar_suresi_sn,
        features.onceki_yanlis_sayisi,
        features.ipucu_sayisi,
        features.karar_degistirme_sayisi,
        features.sahne_no,
        features.seviye,
        features.onceki_karar_suresi,
        features.kararsizlik_suresi
    ]], dtype=np.float32)

    input_name = session.get_inputs()[0].name
    outputs = session.run(None, {input_name: input_vector})

    pred = int(outputs[0][0])
    prob_dict = outputs[1][0] if len(outputs) > 1 else {}
    prob_1 = float(prob_dict.get(1, 0.0)) if isinstance(prob_dict, dict) else float(prob_dict[1])

    mode = "MOD: DESTEK" if prob_1 >= 0.50 else "MOD: MEYDAN OKUMA"

    return PredictionResponse(
        ipucu_gerekli=pred,
        probability=round(prob_1, 4),
        decision_mode=mode,
        model_version=config.get("version", "2.0.0")
    )

@app.get("/api/v1/parite")
def check_parity():
    """5 referans girdi üzerinde sunucu parite kontrolü (fark < 1e-4)"""
    if session is None or not PARITE_PATH.exists():
        raise HTTPException(status_code=500, detail="Model veya parite.json bulunamadı")

    with open(PARITE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    results = []
    max_diff = 0.0
    input_name = session.get_inputs()[0].name

    tolerance = data.get("meta", {}).get("tolerans", 1e-4)
    for ref in data["referans_girdiler"]:
        oz = ref["ozellikler"]
        vec = np.array([[
            oz["karar_suresi_sn"],
            oz["onceki_yanlis_sayisi"],
            oz["ipucu_sayisi"],
            oz["karar_degistirme_sayisi"],
            oz["sahne_no"],
            oz["seviye"],
            oz["onceki_karar_suresi"],
            oz["kararsizlik_suresi"]
        ]], dtype=np.float32)

        outputs = session.run(None, {input_name: vec})
        pred = int(outputs[0][0])
        prob_dict = outputs[1][0] if len(outputs) > 1 else {}
        prob_1 = float(prob_dict.get(1, 0.0)) if isinstance(prob_dict, dict) else float(prob_dict[1])

        oracle_p = ref["oracle_olasilik"]
        diff = abs(prob_1 - oracle_p)
        max_diff = max(max_diff, diff)

        passed = diff < tolerance
        results.append({
            "id": ref["id"],
            "oracle_p": oracle_p,
            "server_p": prob_1,
            "diff": diff,
            "passed": passed
        })

    all_passed = all(r["passed"] for r in results)

    return {
        "status": "success" if all_passed else "failed",
        "tolerance": tolerance,
        "max_diff": max_diff,
        "all_passed": all_passed,
        "results": results
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
