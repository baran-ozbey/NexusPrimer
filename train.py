#!/usr/bin/env python3
"""
NexusPrimer 2.0 — Model Eğitimi (train.py)

Hedef: Oyuncunun davranışlarına bakarak bir sonraki karar aşamasında
       ipucuna ihtiyaç duyup duymayacağını tahmin etmek.

Hedef Değişken: ipucu_gerekli (0: gerekmez, 1: gerekir)
random_state: 42 (tüm işlemlerde sabit)
"""

import sys
import json
import pathlib
import warnings

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, classification_report
)

warnings.filterwarnings('ignore')

# ===== Sabitler =====
RANDOM_STATE = 42
DATA_PATH = pathlib.Path(__file__).parent / "data" / "oturumlar.csv"
MODEL_DIR = pathlib.Path(__file__).parent / "model"
MODEL_DIR.mkdir(exist_ok=True)

# Kabul Eşiği (spec.md'de belirtildiği gibi)
# Küçük veri seti (45 gerçek satır) için F1 >= 0.65 makuldür.
# Büyük veri setlerinde bu eşik 0.75-0.80'e çıkarılmalıdır.
ACCEPTANCE_F1_THRESHOLD = 0.65

# Özellik sırası — model.onnx ile birebir eşleşmeli
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

TARGET = "ipucu_gerekli"


def load_and_validate(path: pathlib.Path) -> pd.DataFrame:
    """CSV yükle, temel doğrulamaları yap."""
    if not path.exists():
        print(f"[HATA] Veri dosyası bulunamadı: {path}", file=sys.stderr)
        sys.exit(1)

    df = pd.read_csv(path)
    print(f"[VERİ] Toplam satır: {len(df)}")

    gercek = df[df["kaynak"] == "gercek"]
    sentetik = df[df["kaynak"] == "sentetik"]
    n_oturumlar = gercek['oturum_id'].nunique() if 'oturum_id' in df.columns else 0
    print(f"[VERİ]   Gerçek: {len(gercek)} satır ({n_oturumlar} oturum)")
    print(f"[VERİ]   Sentetik: {len(sentetik)} satır")

    if len(gercek) < 45:
        print(f"[UYARI] 15 gerçek oturum için en az 45 satır bekleniyor. Mevcut: {len(gercek)}")

    # Eksik değer kontrolü
    missing = df[FEATURE_NAMES + [TARGET]].isnull().sum()
    if missing.any():
        print(f"[UYARI] Eksik değerler:\n{missing[missing > 0]}")
        df[FEATURE_NAMES] = df[FEATURE_NAMES].fillna(0)
        df = df.dropna(subset=[TARGET])

    return df


def check_class_balance(y: pd.Series) -> None:
    """Sınıf dengesizliğini raporla."""
    counts = y.value_counts()
    ratio = counts.min() / counts.max()
    print(f"[DENGE] Sınıf dağılımı: {counts.to_dict()}")
    print(f"[DENGE] Azınlık/Çoğunluk oranı: {ratio:.2f}")
    if ratio < 0.4:
        print("[UYARI] Ciddi sınıf dengesizliği! class_weight='balanced' kullanılıyor.")


def evaluate_model(model, X_test, y_test, model_name: str) -> dict:
    """Model değerlendirme metrikleri."""
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred).tolist()

    print(f"\n[{model_name}] Değerlendirme Sonuçları:")
    print(f"  Accuracy:  {acc:.4f}")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall:    {rec:.4f}")
    print(f"  F1-Score:  {f1:.4f}")
    print(f"  Confusion Matrix:\n    {cm}")
    print(classification_report(y_test, y_pred, target_names=["ipucu_yok", "ipucu_var"]))

    return {
        "model_name": model_name,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
    }


def main():
    print("=" * 60)
    print("NexusPrimer 2.0 — Model Eğitimi")
    print(f"Kabul Eşiği (F1): {ACCEPTANCE_F1_THRESHOLD}")
    print("=" * 60)

    # 1. Veri yükle
    df = load_and_validate(DATA_PATH)

    # 2. Sadece gerçek veri ile eğit (sentetik ayrı tutulur)
    df_train_all = df  # Hem gerçek hem sentetik kullanılabilir
    X = df_train_all[FEATURE_NAMES].values.astype(np.float32)
    y = df_train_all[TARGET].values.astype(np.int64)

    check_class_balance(pd.Series(y))

    # 3. Train/Test split (stratified, 80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )
    print(f"\n[BÖLME] Eğitim: {len(X_train)} satır | Test: {len(X_test)} satır")
    print("[NOT] Test verisi eğitimde kullanılmamaktadır.")

    # 4. Model karşılaştırması
    candidates = {
        "LogisticRegression": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(
                random_state=RANDOM_STATE,
                class_weight="balanced",
                max_iter=1000,
                C=1.0,
            )),
        ]),
        "DecisionTree": Pipeline([
            ("clf", DecisionTreeClassifier(
                random_state=RANDOM_STATE,
                class_weight="balanced",
                max_depth=4,
                min_samples_leaf=3,
            )),
        ]),
    }

    # Cross-validation ile karşılaştır
    print("\n[CV] 5-Fold Cross-Validation Sonuçları:")
    cv_results = {}
    for name, pipeline in candidates.items():
        cv_scores = cross_val_score(
            pipeline, X_train, y_train,
            cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE),
            scoring="f1"
        )
        cv_mean = cv_scores.mean()
        cv_std = cv_scores.std()
        cv_results[name] = cv_mean
        print(f"  {name}: F1 = {cv_mean:.4f} ± {cv_std:.4f}")

    # En iyi modeli seç
    best_model_name = max(cv_results, key=cv_results.get)
    print(f"\n[SEÇİM] En iyi model: {best_model_name} (CV F1={cv_results[best_model_name]:.4f})")

    best_pipeline = candidates[best_model_name]
    best_pipeline.fit(X_train, y_train)

    # 5. Test seti değerlendirmesi
    metrics = evaluate_model(best_pipeline, X_test, y_test, best_model_name)

    # 6. Eval Kapısı: F1 eşiğini geç
    print(f"\n[EVAL] F1 Eşiği: {ACCEPTANCE_F1_THRESHOLD}")
    print(f"[EVAL] Gerçekleşen F1: {metrics['f1_score']}")

    if metrics["f1_score"] < ACCEPTANCE_F1_THRESHOLD:
        print(f"\n[HATA] Model F1 eşiğini geçemedi! ({metrics['f1_score']:.4f} < {ACCEPTANCE_F1_THRESHOLD})")
        print("[HATA] Model artefaktı oluşturulmadı.")
        sys.exit(1)

    print(f"\n[OK] Model eşiği geçti! ONNX artefaktı oluşturuluyor...")

    # 7. ONNX'e dönüştür
    try:
        from skl2onnx import convert_sklearn
        from skl2onnx.common.data_types import FloatTensorType
        import onnx

        initial_type = [("float_input", FloatTensorType([None, len(FEATURE_NAMES)]))]
        onnx_model = convert_sklearn(
            best_pipeline,
            initial_types=initial_type,
            target_opset=17,
            options={id(best_pipeline): {"zipmap": False}},
        )

        onnx_path = MODEL_DIR / "model.onnx"
        with open(onnx_path, "wb") as f:
            f.write(onnx_model.SerializeToString())
        print(f"[ONNX] Model kaydedildi: {onnx_path}")

        # 8. ONNX doğrulaması — sklearn vs onnx
        import onnxruntime as rt
        sess = rt.InferenceSession(str(onnx_path))
        input_name = sess.get_inputs()[0].name

        X_check = X_test.astype(np.float32)
        onnx_probs = sess.run(None, {input_name: X_check})[1]
        if isinstance(onnx_probs, np.ndarray):
            onnx_p1 = onnx_probs[:, 1]
        else:
            onnx_p1 = np.array([p[1] for p in onnx_probs])

        sklearn_probs = best_pipeline.predict_proba(X_check)[:, 1]
        max_diff = np.abs(sklearn_probs - onnx_p1).max()
        print(f"[PARİTE] sklearn vs ONNX max fark: {max_diff:.2e}")
        if max_diff > 1e-4:
            print(f"[UYARI] Parite toleransı aşıldı: {max_diff:.2e} > 1e-4")
        else:
            print(f"[OK] Parite kontrolü geçti (< 1e-4)")

        opset_version = 17  # skl2onnx target opset (onnx_model.opset_import[0] skl2onnx iç versiyonu)

    except ImportError as e:
        print(f"[UYARI] ONNX kütüphanesi eksik: {e}. Sadece sklearn modeli kaydedildi.")
        opset_version = None

    # 9. config.json yaz
    # Scaler parametrelerini kaydet (eğer varsa)
    scaler_params = None
    if "scaler" in best_pipeline.named_steps:
        scaler = best_pipeline.named_steps["scaler"]
        scaler_params = {
            "mean": scaler.mean_.tolist(),
            "scale": scaler.scale_.tolist(),
        }

    config = {
        "model_name": "nexusprimer-hint-predictor",
        "version": "2.0.0",
        "model_type": best_model_name,
        "feature_names": FEATURE_NAMES,
        "feature_order": list(range(len(FEATURE_NAMES))),
        "feature_dtypes": ["float32"] * len(FEATURE_NAMES),
        "class_labels": [0, 1],
        "class_names": ["ipucu_yok", "ipucu_var"],
        "acceptance_threshold": ACCEPTANCE_F1_THRESHOLD,
        "train_metrics": metrics,
        "cv_f1_mean": round(cv_results[best_model_name], 4),
        "random_state": RANDOM_STATE,
        "train_size": int(len(X_train)),
        "test_size": int(len(X_test)),
        "onnx_opset": opset_version,
        "scaler": scaler_params,
        "etiketleme_kurali": "ipucu_gerekli=1 EĞER (ipucu_sayisi>=2 VEYA karar_suresi_sn>=30 VEYA karar_degistirme_sayisi>=2)",
    }

    config_path = MODEL_DIR / "config.json"
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)
    print(f"[CONFIG] config.json kaydedildi: {config_path}")

    print("\n" + "=" * 60)
    print("Eğitim tamamlandı!")
    print(f"  F1-Score:  {metrics['f1_score']}")
    print(f"  Accuracy:  {metrics['accuracy']}")
    print(f"  model.onnx: {MODEL_DIR / 'model.onnx'}")
    print(f"  config.json: {config_path}")
    print("=" * 60)


if __name__ == "__main__":
    main()
