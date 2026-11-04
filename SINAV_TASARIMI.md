# Samsun Üniversitesi Mühendislik Fakültesi — Yazılım Mühendisliği Bölümü
## YZM301 Yazılım Mühendisliği Dersi | 2024-2025 Güz Dönemi Vize Sınavı Sorusu

---

### 📋 Sınav Senaryosu

Bir sağlık teknolojileri girişimi, hastane triyaj ve acil servis yönlendirmesinde hemşirelere yardımcı olmak amacıyla Python ortamında (scikit-learn) bir makine öğrenmesi sınıflandırıcısı geliştirmiştir. Geliştirilen bu model, hasta gizliliği (KVKK) ve sıfır gecikme gereksinimi nedeniyle sunucu yerine **ONNX** formatına dönüştürülmüş ve tarayıcıda çalışan bir web uygulamasına (**ONNX Runtime Web - WebAssembly**) gömülmüştür.

Ancak Kalite Güvence (QA) ekibi, Python ortamında eğitilen model ile tarayıcıda çalışan ONNX modelinin bazı sınır vakalarda (edge cases) farklı çıktılar üretebileceğinden endişelenmektedir.

---

### ❓ Klasik Sınav Sorusu (100 Puan)

> *"Bir yazılım mühendisi olarak, Python (eğitim) ortamında geliştirilen makine öğrenmesi modelinin, tarayıcı ortamında (ONNX WebAssembly) birebir aynı sonucu verdiğini matematiksel ve metodolojik olarak nasıl kanıtlarsınız? Tasarlayacağınız test mimarisini, kullanacağınız test türlerini, referans oracle yaklaşımını ve tolerans kriterlerinizi detaylandırarak açıklayınız."*

---

### 🎯 Beklenen Temel Cevap Anahtarı ve Değerlendirme Kriterleri (Rubrik)

| Kavram | Açıklama ve Beklenen Cevap İçeriği | Puan |
|---|---|---|
| **1. Doğrulama ve Geçerleme (Verification & Validation)** | **Doğrulama (Verification):** *"Modeli doğru mu inşa ettik/dönüştürdük?"* sorusunun yanıtıdır; Python çıktısı ile ONNX çıktısının matematiksel özdeşliğini kanıtlar. **Geçerleme (Validation):** *"Doğru modeli mi inşa ettik?"* sorusudur; modelin gerçek hayattaki hemşire kararlarını ne kadar doğru yansıttığını (klinik başarı) inceler. | 15 P |
| **2. Test Oracle ve Diferansiyel Test (Differential Testing)** | İki farklı ortamın (Python vs Web) aynı girdiler altında davranışını kıyaslamak için **Diferansiyel Test** kurulur. Burada scikit-learn/Python ortamı altın standart (**Test Oracle**) kabul edilir. Web çıktısı ile Oracle çıktısı ikili karşılaştırılır. | 20 P |
| **3. Hata Toleransı ($\epsilon$ / Tolerance)** | Kayan noktalı sayı (floating-point) aritmetiği farklı donanım ve derleyicilerde (x86 Python vs WASM SIMD) mikro düzeyde farklılıklar gösterebilir. Bu nedenle kesin eşitlik (`p1 == p2`) yerine $\mid p_{\text{python}} - p_{\text{web}} \mid < \epsilon$ (örn. $\epsilon = 10^{-4}$) kabul kriteri uygulanmalıdır. | 15 P |
| **4. 300 Girdilik Test Kümesi (Temsili & Sentetik Test)** | Yalnızca 3-5 örnekle yetinilmemeli; sınıf sınırlarını, uç değerleri (aşırı bekleme süresi, sıfır tıklama vb.) kapsayan en az **300 temsili girdi** her iki motorda koşturulmalı ve parite matrisi çıkarılmalıdır. | 15 P |
| **5. Karakterizasyon Testi (Characterization Testing)** | Dönüştürme öncesi Python modelinin tüm davranışsal özellikleri ve olasılık dağılımları bir "parmak izi" gibi kaydedilir (Golden Master). ONNX dönüşümü sonrasında modelin bu karakteristiği bozmadığı doğrulanır. | 15 P |
| **6. Regresyon Testi ve Sürekli Entegrasyon (CI/CD)** | Modelin her yeni sürümünde veya web kütüphanesinin güncellenmesinde parite testlerinin otomatik çalışması için CI/CD hattına `tests/parite.py` gibi bir otomatik adım eklenir. | 20 P |

---

### ⚠️ Yaygın Öğrenci Hataları ve Çeldiriciler

1. **Çeldirici 1 (Yalnızca Accuracy Karşılaştırmak):** *"İki ortamda da test verisini çalıştırırım, ikisi de %90 doğruluk verirse aynıdır."*  
   *Hata Nedeni:* İki model aynı test verisinde %90 alabilir ancak tamamen farklı 10 örneği yanlış bilmiş olabilirler. Tek tek girdi bazında diferansiyel test şarttır.
2. **Çeldirici 2 (Kayan Noktalı Sayılarda `==` Kullanmak):** Float32 hassasiyet farkları nedeniyle doğrudan eşitlik (`1.00000001 == 1.0`) kontrolü hatalı başarısızlıklara yol açar. $\epsilon$ toleransı zorunludur.
3. **Çeldirici 3 (Doğrulama ile Geçerlemeyi Karıştırmak):** Sayısal pariteyi kanıtlamak yalnızca doğrulamadır; modelin klinik olarak doğru çalıştığını tek başına kanıtlamaz.
