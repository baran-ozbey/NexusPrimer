#!/usr/bin/env python3
"""
NexusPrimer 2.0 — Hugging Face Hub Model Yayınlama Betiği
upload_to_hf.py

Kullanım:
  pip install huggingface_hub
  python upload_to_hf.py --username <HF_KULLANICI_ADINIZ> --token <HF_TOKENINIZ>

Bu betik:
1. 'nexusprimer-adaptive-model' reposunu oluşturur (public).
2. model/model.onnx, model/config.json ve model/README.md dosyalarını yükler.
3. Yüklenen commit SHA değerini terminale basar.
4. Sabitlenmiş URL formatını üretir:
   https://huggingface.co/<USER>/nexusprimer-adaptive-model/resolve/<COMMIT_SHA>/model.onnx
"""

import argparse
import pathlib
import sys

def main():
    parser = argparse.ArgumentParser(description="NexusPrimer ONNX modelini Hugging Face Hub'a yükle")
    parser.add_argument("--username", required=True, help="Hugging Face kullanıcı adınız")
    parser.add_argument("--token", required=True, help="Hugging Face write yetkili Access Token")
    parser.add_argument("--repo-name", default="nexusprimer-adaptive-model", help="Repo adı")
    args = parser.parse_args()

    try:
        from huggingface_hub import HfApi, create_repo
    except ImportError:
        print("[HATA] huggingface_hub kütüphanesi eksik. Lütfen çalıştırın: pip install huggingface_hub")
        sys.exit(1)

    repo_id = f"{args.username}/{args.repo_name}"
    model_dir = pathlib.Path(__file__).parent / "model"

    print(f"[HF] Hedef Repo: {repo_id}")
    api = HfApi(token=args.token)

    # 1. Repoyu oluştur (varsa hata vermez)
    try:
        create_repo(repo_id=repo_id, token=args.token, repo_type="model", exist_ok=True)
        print(f"[HF] Repo hazır: https://huggingface.co/{repo_id}")
    except Exception as e:
        print(f"[UYARI] Repo oluşturulurken: {e}")

    # 2. Dosyaları yükle
    print("[HF] Dosyalar yükleniyor (model.onnx, config.json, README.md)...")
    commit_info = api.upload_folder(
        folder_path=str(model_dir),
        repo_id=repo_id,
        repo_type="model",
        commit_message="feat: NexusPrimer v2.0 adaptive ONNX model release",
    )

    commit_sha = commit_info.oid if hasattr(commit_info, 'oid') else "latest"
    print("\n" + "=" * 60)
    print("✅ HUGGING FACE YAYINI BAŞARIYLA TAMAMLANDI!")
    print(f"Repo URL:       https://huggingface.co/{repo_id}")
    print(f"Commit SHA:     {commit_sha}")
    print(f"Sabitlenmiş URL:\nhttps://huggingface.co/{repo_id}/resolve/{commit_sha}/model.onnx")
    print("=" * 60)

if __name__ == "__main__":
    main()
