# NexusPrimer 2.0 — Sürüm ve Dağıtım Yönetimi (RELEASE.md)

## 1. v2.0 Sürüm Özeti

NexusPrimer v2.0, kural tabanlı statik simülasyonu makine öğrenmesi destekli adaptif bir eğitsel sisteme dönüştürmektedir.

### Temel Yenilikler
1. **İstemci Tarafı ONNX Çıkarımı:** Tarayıcı içerisinde `onnxruntime-web` ile doğrudan çalışan tabular makine öğrenmesi modeli (`model.onnx`).
2. **Dinamik AI Tutor Davranışı:** Modelin kullanıcının tereddüt, süre ve geçmiş hatalarından çıkardığı `ipucu_gerekli` tahminine göre pedagojik rehberlik derinliğinin anlık değişmesi (`MOD: DESTEK` vs `MOD: MEYDAN OKUMA`).
3. **KVKK Uyumlu Veri Toplama Motoru:** Kullanıcının hassas kişisel verilerini toplamadan (yalnızca anonim oturum ve zamanlama davranışları) 15 gerçek oturum kaydeden ve CSV dışa aktarabilen altyapı.
4. **Diferansiyel Test & Parite Doğrulaması:** Python Oracle (`tests/parite.py`) ile web çıkarımı arasında `1e-4` altı matematiksel parite güvencesi.

### Model Performans Metrikleri & Konum
- **Model Türü:** Decision Tree Classifier (Pipeline: max_depth=4, class_weight='balanced')
- **Accuracy:** `0.9167`
- **Precision:** `1.0000`
- **Recall:** `0.8333`
- **F1-Score:** `0.9091` (Kabul eşiği: 0.65)
- **Model Konumu:** `model/model.onnx` ve `public/model/model.onnx`
- **Yapılandırma:** `model/config.json`
- **Hugging Face Repo Adı:** `nexusprimer-adaptive-model`
- **Commit SHA / Versiyon:** `v2.0.0-release` (Sabitlenmiş hash ile tüketim)

---

## 2. Dağıtım Stratejileri (Deployment Strategies)

### A. Shadow Deployment (Gölge Dağıtım)
Yeni ONNX modeli ilk aşamada kullanıcı arayüzünü değiştirmeden "sessiz modda" çalıştırılır:
- Kullanıcı simülasyonu oynarken arka planda model çıkarımı yapılır (`predictHintNeed`).
- Modelin ürettiği tahminler ve olasılıklar `sessionStorage` ve geliştirici loglarına yazılır; ancak Tutor davranışı eski kural tabanlı sistemle devam eder.
- **Hedef:** Modelin inferans gecikmesini (latency), bellek tüketimini ve tahmin stabilitesini gerçek kullanıcı oturumlarında sıfır kullanıcı riskiyle gözlemlemek.

### B. Canary Deployment (Kanarya Dağıtım)
Shadow aşamasından sonra yeni adaptif model toplam kullanıcı trafiğinin **%5**'ine açılır:
- Oturum ID'sinin hash değerine göre kullanıcılar A/B gruplarına ayrılır (`hash(oturum_id) % 100 < 5`).
- **İzlenen Metrikler:**
  - İstemci tarafı JavaScript hata oranları (`modelLoadFailed`, ONNX WASM runtime istisnaları).
  - Kullanıcı tamamlama oranları ve memnuniyet anketleri.
  - İpucu paneli etkileşim sıklığı.

### C. Progressive Rollout (Kademeli Geçiş Planı)
Kanarya aşamasında 48 saat boyunca kritik hata gözlemlenmezse trafik kademeli olarak artırılır:
1. **Aşama 1 (%25):** Küçük bir öğrenci grubunda test edilir; Tutor mod değişimlerinin kullanıcıyı rahatsız edip etmediği nitel olarak incelenir.
2. **Aşama 2 (%50):** Yarı yarıya A/B testi uygulanarak model destekli ve geleneksel akış arasındaki öğrenme çıktıları karşılaştırılır.
3. **Aşama 3 (%100):** Tüm kullanıcılar için tam geçiş sağlanır.

### D. Geri Alma (Rollback) Planı
Eğer ONNX modelinde bellek sızıntısı, tarayıcı kilitlenmesi veya pedagojik anomaliler tespit edilirse:
1. **Anlık Fallback:** `src/services/mlModel.ts` içerisindeki `modelLoadFailed` bayrağı tetiklenir veya ortam değişkeni `VITE_ENABLE_ML=false` yapılır.
2. Uygulama otomatik olarak `fallbackPredict` kural tabanlı moduna geçer; kullanıcı ekranı donmaz veya çökmez.
3. Git seviyesinde `git revert HEAD` ile bir önceki kararlı sürüme dönülür.

---

## 3. Mimari Seçenekler ve Trade-off Matrisi

| Kriter | Seçenek 1: Tarayıcıda ONNX Runtime Web | Seçenek 2: Mobil Cihazda ONNX Runtime React Native | Seçenek 3: Sunucuda ONNX Runtime / FastAPI |
|---|---|---|---|
| **1. İnternet zorunlu mu, gecikme nasıl?** | **İnternet ZORUNLU DEĞİL (Offline çalışır).** Model bir kez indirildikten sonra çıkarım istemci CPU/WASM üzerinde **~5-15 ms** gecikmeyle gerçekleşir. Sıfır ağ gecikmesi. | **İnternet ZORUNLU DEĞİL.** Doğrudan cihazın NPU/CPU'sunda çalışır. Gecikme **< 10 ms**. | **İnternet ZORUNLUDUR.** Her karar aşamasında HTTP/REST isteği atılır. Ağ gecikmesi **80-300 ms** arasındadır; bağlantı koparsa simülasyon aksar. |
| **2. Kullanıcı verisi cihazdan çıkar mı?** | **HAYIR (Maksimum Gizlilik).** Tüm tıklama, tereddüt ve karar verileri tarayıcının yerel hafızasında kalır. KVKK açısından sıfır veri sızıntısı riski. | **HAYIR.** Tüm veriler mobil cihazın yerel sandbox'ında işlenir. | **EVET.** Kullanıcının tüm tereddüt süreleri, kararları ve davranışları sunucuya iletilmek zorundadır. KVKK ve veri güvenliği yükümlülüğü doğurur. |
| **3. Model gizli kalır mı?** | **HAYIR.** `.onnx` dosyası istemciye indirildiği için tersine mühendislikle incelenebilir. | **KISMEN.** Uygulama paketi (APK/IPA) içine gömülüdür; ekstra obfuscation gerektirir. | **EVET.** Model sunucuda izole çalışır; ağırlıklar ve mimari dışarıya tamamen kapalıdır. |

### Projemiz İçin Yapılan Tercih ve Gerekçesi

**Seçilen Mimari:** **Seçenek 1 — Tarayıcıda ONNX Runtime Web**

**Nedenleri:**
1. **Sıfır Altyapı ve Sunucu Maliyeti:** YZM301 üniversite projesi kapsamında bağımsız bir backend sunucusu barındırma, bakım ve API maliyeti bulunmamaktadır.
2. **Kusursuz KVKK Uyumu:** Öğrencinin tereddüt süreleri ve davranışsal metrikleri tarayıcıdan dışarı çıkmadığı için yasal ve etik riskler tamamen elimine edilmiştir.
3. **Eğitim Odaklı Açık Kaynak:** Modelin gizli kalması ticari bir zorunluluk değildir; aksine öğrencilerin ve öğretim üyelerinin model kartı, ONNX ağırlıkları ve parite testlerini inceleyebilmesi eğitim kazanımını artırmaktadır.
4. **Çevrimdışı (Offline-first) Çalışma:** Ağ kopmalarında veya zayıf bağlantılarda bile simülasyon kesintisiz sürdürülebilir.
