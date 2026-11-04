#!/usr/bin/env python3
"""
NexusPrimer 2.0 — Hugging Face & ML CLI (hf_cli.py)
Nurettin Şenyer hocamızın 'huggingface-hello-web' referans mimarisine tam uyumlu CLI aracı.

Kullanım:
  python hf_cli.py train        # Modeli eğit, eval gate kontrol et ve ONNX'e dönüştür
  python hf_cli.py predict      # Yerel modelle duman testi (smoke test)
  python hf_cli.py deploy       # Modeli eğit ve Hugging Face Hub'a yükle
  python hf_cli.py hub-predict  # Hugging Face'e yüklenen model ile çıkarım yap
  python hf_cli.py parite       # Diferansiyel parite testini (Python Oracle vs ONNX) çalıştır
"""

import sys
import os
import json
import pathlib
import argparse
import numpy as np

BASE_DIR = pathlib.Path(__file__).parent
MODEL_DIR = BASE_DIR / "model"
CONFIG_PATH = MODEL_DIR / "config.json"
ONNX_PATH = MODEL_DIR / "model.onnx"

HF_REPO = "baranozbey/nexusprimer-adaptive-model"
HF_COMMIT_SHA = "99ab6675dc0d48471aad19f2e79706d83e46af29"
HF_MODEL_URL = f"https://huggingface.co/{HF_REPO}/resolve/{HF_COMMIT_SHA}/model.onnx"

def cmd_train(args):
    print("[CLI] 'python train.py' çalıştırılıyor...")
    import train
    train.main()

def cmd_predict(args):
    print("[CLI] Yerel model ile duman testi (Inference Smoke Test)...")
    try:
        import onnxruntime as ort
    except ImportError:
        print("[HATA] onnxruntime kurulu değil. 'pip install onnxruntime' çalıştırın.")
        sys.exit(1)

    if not ONNX_PATH.exists():
        print(f"[HATA] Model bulunamadı: {ONNX_PATH}. Önce 'python hf_cli.py train' çalıştırın.")
        sys.exit(1)

    session = ort.InferenceSession(str(ONNX_PATH))
    # Örnek test girdisi: [karar_suresi_sn, onceki_yanlis_sayisi, ipucu_sayisi, karar_degistirme_sayisi, sahne_no, seviye, onceki_karar_suresi, kararsizlik_suresi]
    sample_input = np.array([[45.0, 2, 3, 2, 2, 0, 40.0, 18.0]], dtype=np.float32)
    input_name = session.get_inputs()[0].name
    
    outputs = session.run(None, {input_name: sample_input})
    prediction = int(outputs[0][0])
    probabilities = outputs[1][0] if len(outputs) > 1 else {}
    
    prob_1 = probabilities.get(1, probabilities.get(prediction, 0.0)) if isinstance(probabilities, dict) else float(probabilities[1])

    print("\n" + "=" * 55)
    print("Yerel ONNX Modeli Tahmin Sonucu:")
    print(f"  Girdi Özellikleri: {sample_input.tolist()[0]}")
    print(f"  Tahmin (ipucu_gerekli): {prediction} ({'İPUCU GEREKLİ' if prediction == 1 else 'İPUCU GEREKMEZ'})")
    print(f"  İpucu Olasılığı P(1):   {prob_1:.4f}")
    print("=" * 55)

def cmd_hub_predict(args):
    print(f"[CLI] Hugging Face Hub üzerindeki commit sabitli model çekiliyor...")
    print(f"  URL: {HF_MODEL_URL}")
    try:
        import urllib.request
        import tempfile
        import onnxruntime as ort

        with tempfile.NamedTemporaryFile(suffix=".onnx", delete=False) as tmp:
            urllib.request.urlretrieve(HF_MODEL_URL, tmp.name)
            tmp_path = tmp.name

        session = ort.InferenceSession(tmp_path)
        sample_input = np.array([[8.0, 0, 0, 0, 1, 1, 0.0, 2.0]], dtype=np.float32)
        input_name = session.get_inputs()[0].name
        outputs = session.run(None, {input_name: sample_input})
        
        prediction = int(outputs[0][0])
        probabilities = outputs[1][0] if len(outputs) > 1 else {}
        prob_1 = probabilities.get(1, 0.0) if isinstance(probabilities, dict) else float(probabilities[1])

        print("\n" + "=" * 55)
        print("Hugging Face Hub Modeli Tahmin Sonucu:")
        print(f"  Kaynak: {HF_REPO} (Commit: {HF_COMMIT_SHA[:8]})")
        print(f"  Girdi:  {sample_input.tolist()[0]} (Emin/Hızlı Kullanıcı)")
        print(f"  Tahmin: {prediction} | P(1): {prob_1:.4f}")
        print("  [OK] Hub modeli canlıda başarıyla çalışıyor!")
        print("=" * 55)

        os.remove(tmp_path)
    except Exception as e:
        print(f"[HATA] Hub predict sırasında hata: {e}")

def cmd_deploy(args):
    print("[CLI] Model deploy ediliyor...")
    # Önce eğit
    cmd_train(args)
    # Sonra HF'ye yükle
    import upload_to_hf
    if not args.token:
        print("[UYARI] --token verilmedi. Eğer huggingface-cli ile login olduysanız token gerekmez.")
    token = args.token or os.environ.get("HF_TOKEN")
    if not token:
        print("[HATA] Lütfen token belirtin: python hf_cli.py deploy --token <TOKEN>")
        sys.exit(1)
    
    # upload_to_hf çağır
    sys.argv = ["upload_to_hf.py", "--username", args.username or "baranozbey", "--token", token]
    upload_to_hf.main()

def cmd_parite(args):
    print("[CLI] Diferansiyel parite testi çalıştırılıyor...")
    import subprocess
    subprocess.run([sys.executable, str(BASE_DIR / "tests" / "parite.py")], check=True)

def cmd_server(args):
    print(f"[CLI] FastAPI Sunucu Tüketicisi başlatılıyor (Port: {args.port})...")
    import uvicorn
    sys.path.insert(0, str(BASE_DIR))
    uvicorn.run("server.main:app", host="0.0.0.0", port=args.port, reload=False)

def main():
    parser = argparse.ArgumentParser(description="NexusPrimer 2.0 — Hugging Face & ML CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    p_train = subparsers.add_parser("train", help="Modeli eğit ve ONNX'e dönüştür")
    p_train.set_defaults(func=cmd_train)

    p_predict = subparsers.add_parser("predict", help="Yerel model ile duman testi")
    p_predict.set_defaults(func=cmd_predict)

    p_hub = subparsers.add_parser("hub-predict", help="Hugging Face'teki model ile tahmin yap")
    p_hub.set_defaults(func=cmd_hub_predict)

    p_deploy = subparsers.add_parser("deploy", help="Modeli eğit ve Hugging Face'e yükle")
    p_deploy.add_argument("--token", help="Hugging Face write token")
    p_deploy.add_argument("--username", default="baranozbey", help="Hugging Face kullanıcı adı")
    p_deploy.set_defaults(func=cmd_deploy)

    p_parite = subparsers.add_parser("parite", help="Diferansiyel parite testini çalıştır")
    p_parite.set_defaults(func=cmd_parite)

    p_server = subparsers.add_parser("server", help="FastAPI sunucusunu başlat (Bonus +10)")
    p_server.add_argument("--port", type=int, default=8000, help="Sunucu portu")
    p_server.set_defaults(func=cmd_server)

    args = parser.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()
