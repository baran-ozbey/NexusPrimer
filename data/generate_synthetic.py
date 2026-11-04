#!/usr/bin/env python3
"""
NexusPrimer 2.0 — Sentetik Oturum Verisi Üretici (generate_synthetic.py)

Bu betik, ödev gereksinimleri doğrultusunda belirlenen sabit rastgele tohum (random_state=42)
ve açıkça tanımlanmış üretim kuralları ile sentetik kullanıcı karar oturumları üretir.

Üretim Kuralları ve Mantığı:
- Seed: 42 (Tamamen tekrarlanabilir)
- Dağılım:
  * Kararsız Kullanıcı Profili: Yüksek bekleme süresi (30-65s), çoklu karar değişikliği (1-4), ipucu talebi (2-5)
  * Hızlı/Emin Kullanıcı Profili: Düşük bekleme süresi (5-18s), 0 karar değişikliği, 0 ipucu talebi
  * Orta/Dengeli Kullanıcı Profili: Normal bekleme süresi (15-28s), 0-1 karar değişikliği, 0-1 ipucu
- Hedef Değişken (ipucu_gerekli):
  1 EĞER (ipucu_sayisi >= 2 VEYA karar_suresi_sn >= 30.0 VEYA karar_degistirme_sayisi >= 2) ELSE 0
- Kaynak Etiketi: 'sentetik' (Zorunlu sütun, gerçek verilerle asla karıştırılmaz)
"""

import numpy as np
import pandas as pd
import pathlib

RANDOM_SEED = 42

def generate_synthetic_sessions(n_sessions: int = 5) -> pd.DataFrame:
    np.random.seed(RANDOM_SEED)
    rows = []

    for session_idx in range(1, n_sessions + 1):
        oturum_id = f"oturum-sentetik-{session_idx:03d}"
        katilimci_no = f"sentetik-{session_idx}"
        seviye = np.random.choice([0, 1], p=[0.6, 0.4]) # 0: beginner, 1: experienced
        
        onceki_sure = 0.0
        onceki_yanlis = 0
        ipucu_kumulatif = 0

        for sahne_no in [1, 2, 3]:
            # Profil tipini belirle
            profil_tipi = np.random.choice(["kararsiz", "hizli", "dengeli"], p=[0.4, 0.35, 0.25])
            
            if profil_tipi == "kararsiz":
                karar_suresi = float(np.round(np.random.uniform(30.0, 65.0), 1))
                ipucu_artisi = int(np.random.choice([2, 3]))
                karar_degistirme = int(np.random.choice([2, 3, 4]))
                kararsizlik_suresi = float(np.round(karar_suresi * np.random.uniform(0.35, 0.55), 1))
                yanlis_artisi = int(np.random.choice([0, 1]))
            elif profil_tipi == "hizli":
                karar_suresi = float(np.round(np.random.uniform(6.0, 15.0), 1))
                ipucu_artisi = 0
                karar_degistirme = 0
                kararsizlik_suresi = float(np.round(karar_suresi * np.random.uniform(0.05, 0.20), 1))
                yanlis_artisi = 0
            else: # dengeli
                karar_suresi = float(np.round(np.random.uniform(16.0, 29.0), 1))
                ipucu_artisi = int(np.random.choice([0, 1]))
                karar_degistirme = int(np.random.choice([0, 1]))
                kararsizlik_suresi = float(np.round(karar_suresi * np.random.uniform(0.15, 0.30), 1))
                yanlis_artisi = int(np.random.choice([0, 1]))

            ipucu_sayisi = ipucu_kumulatif + ipucu_artisi
            
            # Etiketleme kuralı (Ground Truth)
            ipucu_gerekli = 1 if (ipucu_sayisi >= 2 or karar_suresi >= 30.0 or karar_degistirme >= 2) else 0

            rows.append({
                "oturum_id": oturum_id,
                "katilimci_no": katilimci_no,
                "kaynak": "sentetik",
                "sahne_no": sahne_no,
                "karar_suresi_sn": karar_suresi,
                "onceki_yanlis_sayisi": onceki_yanlis,
                "ipucu_sayisi": ipucu_sayisi,
                "karar_degistirme_sayisi": karar_degistirme,
                "seviye": seviye,
                "onceki_karar_suresi": onceki_sure,
                "kararsizlik_suresi": kararsizlik_suresi,
                "ipucu_gerekli": ipucu_gerekli
            })

            onceki_sure = karar_suresi
            onceki_yanlis += yanlis_artisi
            ipucu_kumulatif = ipucu_sayisi

    df = pd.DataFrame(rows)
    return df

if __name__ == "__main__":
    df = generate_synthetic_sessions(5)
    out_path = pathlib.Path(__file__).parent / "sentetik_oturumlar.csv"
    df.to_csv(out_path, index=False)
    print(f"[OK] {len(df)} satırlık sentetik veri üretildi: {out_path}")
    print(df.head())

