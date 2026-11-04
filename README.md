# NexusPrimer 2.0 — Adaptif Makine Öğrenmesi Destekli Kriz Simülasyonu

> **Samsun Üniversitesi YZM301 Yazılım Mühendisliği Dersi**  
> Geliştirici: **Baran Özbey** | Danışman: **Dr. Öğr. Üyesi Nurettin Şenyer**  
> GitHub: [github.com/baran-ozbey/NexusPrimer](https://github.com/baran-ozbey/NexusPrimer) | Demo Video: [demo_v2_adaptive_60s.mp4](https://github.com/baran-ozbey/NexusPrimer/blob/main/demo_v2_adaptive_60s.mp4)

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

1. **Diferansiyel Parite Testi (Python Oracle vs ONNX):**
   ```bash
   python tests/parite.py
   # veya hf_cli ile:
   python hf_cli.py parite
   ```

2. **FastAPI Sunucu Testi (Bonus +10 Kazanımı):**
   ```bash
   python tests/test_server.py
   ```

3. **Sentetik Veri Üretimi ve Doğrulama:**
   ```bash
   python data/generate_synthetic.py
   ```

4. **Linter:**
   ```bash
   npm run lint
   ```

5. **TypeScript & Production Build:**
   ```bash
   npm run build
   ```

6. **E2E Kabul Testleri (8/8 Playwright):**
   ```bash
   npm run test:e2e
   ```

### `hf_cli.py` Komut Referansı

| Komut | Açıklama |
|---|---|
| `python hf_cli.py predict` | Yerel ONNX modeliyle örnek tahmin yap |
| `python hf_cli.py hub-predict` | Hugging Face'ten commit SHA'ya sabitlenmiş modeli çek ve tahmin yap |
| `python hf_cli.py parite` | Python Oracle vs ONNX parite testi (5/5 referans, < 1e-4 tolerans) |
| `python hf_cli.py server` | FastAPI sunucusunu başlat (Bonus, port 8000) |
| `python hf_cli.py deploy` | Modeli Hugging Face Hub'a yükle (HF token gerekir) |

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


---

## 📹 11. v2.0 Adaptif Makine Öğrenmesi Demo Videosu

- **Dosya Adı:** `demo_v2_adaptive_60s.mp4` (Repo kök dizininde yer almaktadır)
- **Süre:** 73 saniye (60–90 saniye şartnamesine tam uyumlu)
- **Çözünürlük:** 1280x720 HD (H.264 / AAC)
- **İçerik:**
  1. Onboarding aşaması (Seviye, Rol, Güvenilirlik hedefi seçimi)
  2. Gerçek zamanlı anonim Veri Toplama Paneli (`oturum-*` oturum kimliği ile)
  3. **Profil 1 (Kararsız Kullanıcı):** Yüksek karar süresi, AI Tutor'a tereddütlü soru sorma, Sokratik pedagojik destek, $p \ge 0.5$ ve **MOD: DESTEK** adaptif geçişi
  4. **Profil 2 (Hızlı ve Emin Kullanıcı):** Hızlı karar alma, $p < 0.5$ ve **MOD: MEYDAN OKUMA** adaptif geçişi
  5. Final değerlendirme ekranı ve toplanan oturum verilerinin CSV olarak dışa aktarımı


---

## 📚 12. Akademik Kaynaklar ve Mühendislik Referansları

Bu projede uygulanan mimari kararlar ve test metodolojisi aşağıdaki akademik literatüre ve endüstri standartlarına dayanmaktadır:

1. **Andrew Ng'nin 4 Mühendislik Başlığı:**
   - (1) Yazılım mühendisliği temelleri (test, diferansiyel doğrulama, modüler mimari).
   - (2) Coding agent yönetim becerisi (Antigravity'nin pair programmer olarak yönetilmesi).
   - (3) Yapay zekâda Development · Deployment · Inference yaşam döngüsü.
   - (4) Vizyon Mühendisliği (küçük, amaca yönelik adaptif karar modellemesi).
2. **Amershi vd. (2019) — *Software Engineering for Machine Learning: A Case Study* (Microsoft):**
   - Makine öğrenmesi yaşam döngüsünün doğrusal değil, veri toplama, yerel eğitim, dağıtım ve sürekli çıkarım gözlemi arasında dönen "yaşayan bir döngü" olduğu prensibi uygulandı.
3. **Shankar vd. (2022) — *Operationalizing Machine Learning (3V Problemi)*:**
   - **Velocity (Hız):** Tek komutla eğitim (`python train.py`) ve Playwright E2E testleri.
   - **Validation (Doğrulama):** Kabul eşiği ($F1 \ge 0.65$) ve diferansiyel parite toleransı ($< 10^{-4}$).
   - **Versioning (Sürümleme):** Hugging Face Hub üzerinde commit SHA (`99ab6675`) ile dondurulmuş model URL'si.
4. **Mitchell vd. (2019) — *Model Cards for Model Reporting*:**
   - [`model/README.md`](model/README.md) içerisinde modelin amacı, veri seti sınırları, etik değerlendirmesi ve kullanılmaması gereken durumlar şeffafça belgelendi.
5. **Breck vd. (2017) — *The ML Test Score: A Rubric for ML Production Readiness*:**
   - Modelin yalnızca eğitim metrikleriyle değil, Python Oracle ile tarayıcı ortamı arasındaki diferansiyel testlerle doğrulanması sağlandı.
6. **Stanford HAI (2025) & Gartner (2025) Raporları:**
   - Çıkarım maliyetlerindeki 300x düşüş ve göreve özel küçük modellerin genel LLM'lere göre hız ve gizlilik avantajı nedeniyle istemci tarafında çalışan ONNX Runtime Web tercih edildi.
7. **Sommerville — *Software Engineering* (10. Baskı):**
   - Bölüm 8 (Yazılım Testi: Doğrulama ve Geçerleme - V&V) ve Bölüm 25 (Konfigürasyon ve Değişiklik Yönetimi - Rollback planları).

---

## 📋 13. Teslim Formu Bilgileri (Google Forms)

- **1. GitHub Repo Linki:**  
  `https://github.com/baran-ozbey/NexusPrimer`
- **2. Hugging Face Model Linki (Commit'e Sabitlenmiş):**  
  `https://huggingface.co/baranozbey/nexusprimer-adaptive-model/resolve/99ab6675dc0d48471aad19f2e79706d83e46af29/model.onnx`
- **3. Canlı Uygulama Linki (GitHub Pages):**  
  `https://baran-ozbey.github.io/NexusPrimer/`
- **4. Demo Video Linki:**  
  `https://github.com/baran-ozbey/NexusPrimer/blob/main/demo_v2_adaptive_60s.mp4` (veya repo içindeki `demo_v2_adaptive_60s.mp4`)
