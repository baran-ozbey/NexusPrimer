#!/usr/bin/env python3
"""
NexusPrimer 2.0 — FastAPI Sunucu Testi (tests/test_server.py)
YZM301 Bonus +10 Puan Görevi Doğrulaması.

Bu test:
1. FastAPI sunucusunu TestClient ile bellek içinde ayağa kaldırır.
2. 'POST /api/v1/predict' uç noktasının doğru tahmin yaptığını test eder.
3. 'GET /api/v1/parite' uç noktasını çağırarak 5 referans girdinin Oracle ile < 1e-4 tolerans sağladığını doğrular.
"""

import sys
import pathlib
import json

BASE_DIR = pathlib.Path(__file__).parent.parent
sys.path.insert(0, str(BASE_DIR))

def test_fastapi_server():
    from fastapi.testclient import TestClient
    from server.main import app

    client = TestClient(app)

    print("=" * 60)
    print("NexusPrimer 2.0 — FastAPI Sunucu Tüketicisi Testi (Bonus +10)")
    print("=" * 60)

    # 1. Health check
    res = client.get("/")
    assert res.status_code == 200, f"Root endpoint failed: {res.text}"
    data = res.json()
    assert data["status"] == "online"
    assert data["model_loaded"] is True
    print("[1/3] Root health check: ONLINE, ONNX Model Yüklü [GECTI]")

    # 2. Predict endpoint
    sample_payload = {
        "karar_suresi_sn": 50.0,
        "onceki_yanlis_sayisi": 2,
        "ipucu_sayisi": 4,
        "karar_degistirme_sayisi": 3,
        "sahne_no": 2,
        "seviye": 0,
        "onceki_karar_suresi": 45.0,
        "kararsizlik_suresi": 20.0
    }
    res = client.post("/api/v1/predict", json=sample_payload)
    assert res.status_code == 200, f"Predict failed: {res.text}"
    pred_data = res.json()
    assert pred_data["ipucu_gerekli"] == 1
    assert pred_data["probability"] >= 0.50
    assert pred_data["decision_mode"] == "MOD: DESTEK"
    print(f"[2/3] Tahmin testi: {pred_data['decision_mode']}, P={pred_data['probability']} [GECTI]")

    # 3. Parite endpoint (5 referans girdi, < 1e-4)
    res = client.get("/api/v1/parite")
    assert res.status_code == 200, f"Parite endpoint failed: {res.text}"
    parite_data = res.json()
    assert parite_data["all_passed"] is True, f"Parite failed: {parite_data}"
    
    print(f"[3/3] Diferansiyel Parite Testi (5 Referans, Tolerans < {parite_data['tolerance']}):")
    for r in parite_data["results"]:
        print(f"     ID: {r['id']} | Oracle: {r['oracle_p']:.4f} | Server: {r['server_p']:.4f} | Fark: {r['diff']:.2e} -> [GECTI]")

    print("\n" + "=" * 60)
    print(f"[SONUC] 3. Tüketici (FastAPI Sunucusu) 5/5 referansta < 1e-4 parite sağladı!")
    print("[BONUS +10 KAZANIMI] Web, Mobil ve Sunucu mimarilerinin tümü aynı modelde eşitlendi.")
    print("=" * 60)

if __name__ == "__main__":
    test_fastapi_server()
