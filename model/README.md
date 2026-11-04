---
language: tr
license: mit
tags:
- tabular-classification
- scikit-learn
- onnx
- edtech
- software-engineering
- adaptive-learning
datasets:
- custom-nexusprimer-sessions
metrics:
- f1: 0.9091
- accuracy: 0.9167
- precision: 1.0000
- recall: 0.8333
---

# Model Kartı: NexusPrimer Adaptive Hint Predictor v2.0

Bu model, **Samsun Üniversitesi YZM301 Yazılım Mühendisliği** dersi kapsamında geliştirilen **NexusPrimer** interaktif kriz simülasyonunda öğrencilerin karar verme davranışlarını analiz ederek bir sonraki aşamada ipucuna ihtiyaç duyup duymayacağını tahmin etmek için eğitilmiştir.

## 1. Model Detayları

- **Model Adı:** `nexusprimer-hint-predictor`
- **Sürüm:** `2.0.0`
- **Model Türü:** Karar Ağacı Sınıflandırıcı (`DecisionTreeClassifier`)
- **Format:** ONNX (Opset 17) & Scikit-learn Pipeline
- **Rastgele Tohum (Random State):** `42` (tüm aşamalarda sabitlenmiş ve tekrarlanabilir)
- **Hedef Değişken:** `ipucu_gerekli` (Binary: `0` = Gerekmez, `1` = Gerekir)

## 2. Modelin Amacı ve Çözdüğü Problem

Eğitim simülasyonlarında tüm öğrencilere tek tip ipucu vermek pedagojik olarak verimsizdir:
- Yetkin öğrencilere sürekli ipucu vermek onları tembelliğe alıştırır ve simülasyonun zorlayıcılığını azaltır.
- Zorlanan öğrencilere yeterli destek vermemek ise öğrenme kaybına yol açar.

**Çözüm:** Model, kullanıcının gerçek zamanlı davranış metriklerini analiz ederek ipucu ihtiyacını tahmin eder ve **AI Tutor**'un pedagojik derinliğini (Sokratik / Destekleyici mod) dinamik olarak ayarlar.

## 3. Kullanılan Veri Seti

- **Kaynak Dosya:** `data/oturumlar.csv`
- **Toplam Veri:** 60 karar satırı (20 oturum × 3 karar aşaması)
- **Gerçek Oturum Sayısı:** 15 oturum (3 farklı kişi × 5 oturum = 45 satır)
- **Sentetik Oturum Sayısı:** 5 oturum (15 satır, `numpy.random` seed=42)
- **Sınıf Dağılımı:**
  - Sınıf 0 (`ipucu_yok`): 31 örnek (%51.7)
  - Sınıf 1 (`ipucu_var`): 29 örnek (%48.3)
  - Azınlık/Çoğunluk Oranı: 0.94 (dengeli dağılım)

### Etiketleme Metodolojisi
Etiketler objektif kullanıcı davranış kurallarına göre türetilmiştir:
```text
ipucu_gerekli = 1 EĞER:
  - ipucu_sayisi >= 2  VEYA
  - karar_suresi_sn >= 30  VEYA
  - karar_degistirme_sayisi >= 2
Aksi halde 0.
```

## 4. Girdi Özellikleri (Feature Schema)

Model tam olarak 8 sayısal özellik alır (`float32`):

| Sıra | Özellik Adı | Tip | Açıklama |
|---|---|---|---|
| 0 | `karar_suresi_sn` | float32 | Karar verme süresi (saniye) |
| 1 | `onceki_yanlis_sayisi` | float32 | Önceki kararlardaki hatalı seçim sayısı |
| 2 | `ipucu_sayisi` | float32 | Mevcut kararda istenen ipucu sayısı |
| 3 | `karar_degistirme_sayisi`| float32 | Karar değiştirme/tereddüt sayısı |
| 4 | `sahne_no` | float32 | Mevcut sahne numarası (1, 2, 3) |
| 5 | `seviye` | float32 | Deneyim seviyesi (0: Başlangıç/Orta, 1: Deneyimli) |
| 6 | `onceki_karar_suresi` | float32 | Bir önceki kararın tamamlanma süresi |
| 7 | `kararsizlik_suresi` | float32 | İlk aksiyona kadar geçen bekleme süresi |

## 5. Değerlendirme ve Performans Ölçümleri

- **Veri Bölme:** %80 Eğitim (48 örnek), %20 Test (12 örnek) — Stratified Split.
- **5-Fold Cross-Validation F1:** `0.9351 ± 0.0563`
- **Test Seti Sonuçları:**
  - **F1-Score:** `0.9091` (Kabul eşiği: `0.65` — BAŞARILI)
  - **Accuracy:** `0.9167`
  - **Precision:** `1.0000`
  - **Recall:** `0.8333`
- **Confusion Matrix:**
  ```text
  [[6, 0],
   [1, 5]]
  ```

### ONNX - Scikit-Learn Paritesi
- Test seti üzerinde Sklearn olasılıkları ile ONNX Runtime Web çıktısı arasındaki maksimum fark:
  **`4.62e-09`** (Tolerans sınırı: `1e-4` — TAM GEÇERLİ).

## 6. Bilinen Sınırlılıklar ve Kullanılmaması Gereken Durumlar

1. **Küçük Örneklem:** Veri seti 60 satırdan oluşmaktadır. Hastane dışındaki genel yazılım mühendisliği bağlamlarına genellenemez.
2. **Kural Bağımlılığı:** Etiketler davranışsal bir sezgisel (heuristic) kurala dayandığından, kullanıcının dalgınlık veya dış etkenlerden ötürü ekranda beklemesi yanlış pozitif (false positive) üretebilir.
3. **Kullanılmaması Gereken Alanlar:** Bu model gerçek tıbbi teşhis, personel performans değerlendirmesi veya kritik sınav notlandırmasında KESİNLİKLE kullanılamaz. Sadece pedagojik simülasyon içi adaptasyon amaçlıdır.

## 7. Etik ve Gizlilik Değerlendirmesi

- Model eğitiminde ve uygulamasında **KVKK 6698** sayılı kanuna tam uyulmuştur.
- Gerçek isim, T.C. kimlik no, e-posta, IP adresi, coğrafi konum veya cihaz parmak izi KESİNLİKLE toplanmamıştır.
- Oturum kimlikleri istemci tarafında rastgele üretilmiştir.
