#!/usr/bin/env python3
"""
NexusPrimer 2.0 — Diferansiyel Test (Parite Testi)
tests/parite.py

Python Oracle: model.onnx'i Python tarafında çalıştırır.
Referans girdiler tests/parite.json'dan okunur.
Tolerans: abs(p_python - p_web) < 1e-4

Kullanım:
  python tests/parite.py
"""

import sys
import json
import pathlib
import numpy as np

ROOT = pathlib.Path(__file__).parent.parent
MODEL_PATH = ROOT / "model" / "model.onnx"
PARITE_PATH = pathlib.Path(__file__).parent / "parite.json"

FEATURE_NAMES = [
    "karar_suresi_sn",
    "onceki_yanlis_sayisi",
    "ipucu_sayisi",
    "karar_degistirme_sayisi",
    "sahne_no",
    "seviye",
    "onceki_karar_suresi",
    "kararsizlik_suresi",
]

TOLERANCE = 1e-4


def run_onnx_inference(features: list) -> tuple[float, int]:
    """ONNX modelini çalıştır, (olasılık, sınıf) döndür."""
    try:
        import onnxruntime as rt
    except ImportError:
        print("[HATA] onnxruntime yüklü değil. pip install onnxruntime")
        sys.exit(1)

    sess = rt.InferenceSession(str(MODEL_PATH))
    input_name = sess.get_inputs()[0].name

    X = np.array([features], dtype=np.float32)
    outputs = sess.run(None, {input_name: X})

    # outputs[0] = sınıf tahmini, outputs[1] = olasılıklar
    predicted_class = int(outputs[0][0])
    probs = outputs[1]
    if isinstance(probs, np.ndarray):
        prob_positive = float(probs[0, 1])
    else:
        prob_positive = float(probs[0][1])

    return prob_positive, predicted_class


def main():
    print("=" * 60)
    print("NexusPrimer 2.0 — Diferansiyel Parite Testi")
    print(f"Tolerans: {TOLERANCE:.0e}")
    print("=" * 60)

    if not MODEL_PATH.exists():
        print(f"[HATA] model.onnx bulunamadı: {MODEL_PATH}")
        print("[INFO] Önce 'python train.py' çalıştırın.")
        sys.exit(1)

    if not PARITE_PATH.exists():
        print(f"[HATA] parite.json bulunamadı: {PARITE_PATH}")
        sys.exit(1)

    with open(PARITE_PATH, encoding="utf-8") as f:
        parite_data = json.load(f)

    referanslar = parite_data["referans_girdiler"]
    print(f"[OK] {len(referanslar)} referans girdi yüklendi.\n")

    passed = 0
    failed = 0

    for i, ref in enumerate(referanslar, 1):
        features = [ref["ozellikler"][f] for f in FEATURE_NAMES]
        p_oracle, pred_class = run_onnx_inference(features)
        expected_class = ref["beklenen_sinif"]
        p_web = ref["oracle_olasilik"]  # Web uygulamasından beklenen değer

        diff = abs(p_oracle - p_web)
        status = "[GECTI]" if diff < TOLERANCE else "[BASARISIZ]"

        if diff < TOLERANCE:
            passed += 1
        else:
            failed += 1

        print(f"[{i}] {ref.get('aciklama', 'Referans ' + str(i))}")
        print(f"     Özellikler: {features}")
        print(f"     Oracle P(1): {p_oracle:.6f} | Web P(1): {p_web:.6f} | Fark: {diff:.2e}")
        print(f"     Tahmin: {pred_class} | Beklenen: {expected_class}")
        print(f"     {status}\n")

    print("=" * 60)
    print(f"Sonuç: {passed}/{len(referanslar)} geçti | {failed} başarısız")

    if failed > 0:
        print("[HATA] Parite testleri başarısız! Lütfen modeli kontrol edin.")
        sys.exit(1)
    else:
        print("[OK] Tüm parite testleri geçti (tolerans < 1e-4).")
    print("=" * 60)


if __name__ == "__main__":
    main()
