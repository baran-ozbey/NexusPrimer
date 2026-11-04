# NexusPrimer 2.0 — Adaptif Makine Öğrenmesi Destekli Kriz Simülasyonu

> **Samsun Üniversitesi YZM301 Yazılım Mühendisliği Dersi**  
> Geliştirici: **Baran Özbey** | Danışman: **Prof. Dr. Nurettin Şenyer**  
> GitHub: [github.com/baran-ozbey/NexusPrimer](https://github.com/baran-ozbey/NexusPrimer) | Canlı Demo Video: [YouTube Linki](https://youtu.be/L7HYXA_F1kc)

---

## 🎯 1. Proje Amacı ve Genel Bakış

**NexusPrimer**, yazılım mühendisliği öğrencilerinin kritik kriz senaryolarında sistem mimarisi, test stratejisi ve veri güvenliği (KVKK) kararları alarak deneyim kazandığı pedagojik bir simülasyondur.

**Senaryo:** Saat 08:00 — Hastane randevu sistemi çökmüş, 300 hasta sırada beklemektedir. Kullanıcı nöbetçi mühendis rolünde 3 kritik karar aşamasından geçer.

### v1.0 ile v2.0 Arasındaki Farklar

| Özellik | NexusPrimer v1.0 | NexusPrimer v2.0 (Yeni) |
|---|---|---|
| **AI Tutor Mantığı** | Statik kural tabanlı yönlendirme | **ONNX Destekli Adaptif Makine Öğrenmesi** |
| **Kullanıcı Analizi** | Yok (yalnızca seçilen role göre statik ipucu) | **Gerçek zamanlı karar süresi, tereddüt ve hata analizi** |
| **Model Çalışma Alanı** | Model yok | **Tarayıcı içi ONNX Runtime Web (`onnxruntime-web`)** |
| **Veri Toplama** | Yok | **KVKK uyumlu anonim veri toplama motoru ve CSV export** |
| **Kalite Güvence** | E2E UI Testleri | **Python Oracle Diferansiyel Parite Testi ($< 10^{-4}$)** |

---

## 🏗️ 2. Sistem Mimarisi ve Veri Akışı

```
[Kullanıcı Etkileşimi]
       │
       ▼ (Zamanlama, Tereddüt, İpucu Talebi)
[DataCollection Hook] ───► [Anonim CSV Dışa Aktarımı (data/oturumlar.csv)]
       │
       ▼ (8 Boyutlu Davranış Vektörü)
[onnxruntime-web] ◄────── [public/model/model.onnx]
       │
       ▼ (P(ipucu_gerekli) Olasılık Çıktısı)
[AI Tutor Adaptasyon Motoru]
       ├── P >= 0.50 ──► [MOD: DESTEK]       (Derin anlatım, adım adım rehberlik)
       └── P <  0.50 ──► [MOD: MEYDAN OKUMA] (Zorlayıcı sorular, bağımsız analiz)
```

---

## 📊 3. Veri Toplama Süreci ve Veri Seti

- **Veri Dosyası:** `data/oturumlar.csv` (Veri sözlüğü: `data/SOZLUK.md`)
- **Gerçek Oturumlar:** Tam **15 gerçek kullanıcı oturumu** toplanmıştır (3 farklı katılımcı × 5 oturum = 45 karar satırı).
- **Sentetik Veri:** `random_state=42` ile 5 oturum (15 satır) üretilmiştir.
  - *Üretim Yöntemi:* Gerçek verinin ortalama ve standart sapması korunarak `numpy.random.normal` ve kural bazlı etiketleyici ile türetilmiştir.
  - Gerçek ve sentetik veriler CSV içindeki `kaynak` sütunuyla (`gercek` / `sentetik`) birbirinden kesin olarak ayrılmıştır.
- **KVKK Uyumu:** Gerçek isim, e-posta, konum veya cihaz kimliği **kesinlikle toplanmaz**. Oturum kimlikleri istemcide rastgele atanır (`oturum-xxxx`).

---

## 🧠 4. Model Eğitimi, Değerlendirme ve Eval Kapısı

- **Eğitim Kodu:** `train.py` (`random_state=42` ile tekrarlanabilir).
- **Karşılaştırılan Modeller:** Logistic Regression vs. Decision Tree.
- **Seçilen Model:** Karar Ağacı (`DecisionTreeClassifier`, max_depth=4).
- **Kabul Eşiği (Eval Gate):** `spec.md` gereğince **F1 $\ge$ 0.65** şartı konulmuştur. Eşiğin altında kalınırsa eğitim hata kodu ile sonlanır ve model artefaktı yayınlanmaz.

### Test Seti Ölçüm Sonuçları (Gerçek)
- **F1-Score:** `0.9091` (Kabul eşiğini başarıyla geçti)
- **Accuracy:** `0.9167`
- **Precision:** `1.0000`
- **Recall:** `0.8333`
- **5-Fold CV F1:** `0.9351 ± 0.0563`
- **Confusion Matrix:**
  $$\begin{bmatrix} 6 & 0 \\ 1 & 5 \end{bmatrix}$$

---

## 🔄 5. ONNX İstemci Çıkarımı ve Diferansiyel Parite Testi

Eğitilen model `skl2onnx` ile ONNX Opset 17 formatına dönüştürülmüş (`model/model.onnx`) ve tarayıcıda `onnxruntime-web` kütüphanesi ile çalıştırılmaktadır.

### Python Oracle ile Parite Testi (`tests/parite.py`)
Python tarafında çalışan model ile web'e aktarılan modelin aynı girdiler için ürettiği olasılık farkı:
$$\mid P_{\text{python}} - P_{\text{web}} \mid < 10^{-4}$$
`tests/parite.json` içindeki 5 referans girdinin tamamında test edilmiş ve **5/5 BAŞARIYLA GEÇMİŞTİR** (Gözlenen maksimum fark: `3.19e-07`).

---

## 🚀 6. Hugging Face Model Yayını ve Sürümleme

Model artefaktları Hugging Face Hub üzerinde yayınlanmaya hazırdır:
- **Repo Adı:** `nexusprimer-adaptive-model`
- **Model Dosyaları:** `model/model.onnx`, `model/config.json`, `model/README.md` (Model kartı)
- **Yayınlama Betiği:** `python upload_to_hf.py --username <HF_USER> --token <HF_TOKEN>`
- **Commit Sabitleme Biçimi:**
  `https://huggingface.co/<USER>/nexusprimer-adaptive-model/resolve/<COMMIT_SHA>/model.onnx`

---

## 🛡️ 7. Dağıtım ve Rollback Stratejisi (RELEASE.md Özeti)

- **Shadow Deployment:** Model ilk aşamada UI'ı etkilemeden arka planda çalıştırılıp gecikmesi izlenir.
- **Canary Deployment:** Kullanıcı trafiğinin %5'ine açılır.
- **Progressive Rollout:** %25 $\rightarrow$ %50 $\rightarrow$ %100 kademeli geçiş.
- **Rollback:** Model arızalanırsa `src/services/mlModel.ts` otomatik fallback moduna geçer (`fallbackPredict`), uygulama asla çökmez.
- **Mimari Tercih:** Gizlilik (KVKK) ve sıfır sunucu maliyeti için **Tarayıcıda ONNX Runtime Web** seçilmiştir.

---

## 🧪 8. Testler ve Doğrulama

1. **Parite Testi:**
   ```bash
   python tests/parite.py
   ```
2. **Linter:**
   ```bash
   npm run lint
   ```
3. **TypeScript & Production Build:**
   ```bash
   npm run build
   ```
4. **Cypress E2E Testleri:**
   ```bash
   npm run cy:run
   ```

---

## ⚡ 9. Kurulum ve Çalıştırma (3 Adımda)

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Python ML paketlerini yükle (model eğitimi ve parite için)
pip install scikit-learn skl2onnx onnxruntime pandas numpy

# 3. Geliştirme sunucusunu başlat
npm run dev
```

---

## 🤖 10. AI Coding Agent (Antigravity) Kullanım Açıklaması

Bu projenin v2.0 adaptif makine öğrenmesi dönüşümünde **Antigravity** yapay zeka kodlama asistanı aktif bir çift programcı (pair programmer) olarak kullanılmıştır:

1. **Otomatik Oluşturulan Bölümler:**
   - Scikit-learn eğitim boru hattı (`train.py`) ve ONNX dönüşüm kodu.
   - `useDataCollection` React hook'u ve `onnxruntime-web` entegrasyon katmanı.
   - 5 referans girdili diferansiyel parite test betiği (`tests/parite.py`, `tests/parite.json`).
   - Sınav tasarımı (`SINAV_TASARIMI.md`) ve sürüm yönetim dokümanı (`RELEASE.md`).

2. **Elle Kontrol Edilen ve Düzeltilen Bölümler:**
   - Cypress test dosyalarındaki Türkçe karakter ve kesme işareti kaçış dizileri (`oxlint` kontrolü ile düzeltildi).
   - Gerçek ve sentetik verilerin istatistiksel dağılım tutarlılığı manuel olarak incelendi.
   - React hook render optimizasyonu ve referans erişim kuralları elle refactor edildi.
   - Parite testindeki floating-point tolerans payı ($\le 10^{-4}$) deneysel olarak teyit edildi.
