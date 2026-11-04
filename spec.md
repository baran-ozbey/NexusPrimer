# NexusPrimer 2.0 — Şartname (spec.md)

## 1. Problem Tanımı

Yazılım mühendisliği öğrencileri, gerçek dünya senaryolarında karar verme deneyiminden yoksundur. Teorik bilgi ile pratik uygulama arasında köprü kuracak, kişiselleştirilmiş ve interaktif bir öğrenme deneyimi gereklidir. NexusPrimer 2.0 sürümünde, öğrencinin karar süreçlerindeki tereddüt ve zorlanmalarını gerçek zamanlı izleyerek ipucu ihtiyacını kestiren **Adaptif Makine Öğrenmesi Sistemi** eklenmiştir.

## 2. Hedef Kullanıcı

Samsun Üniversitesi YZM301 Yazılım Mühendisliği dersi öğrencileri. Farklı deneyim seviyelerine sahip lisans öğrencileri.

## 3. Kullanıcı İhtiyacı ve Çözülmek İstenen Problem

- Öğrenciler yazılım mühendisliği kararlarının teknik ve etik sonuçlarını güvenli bir ortamda deneyimleyememektedir.
- Kararların domino etkisini, zaman baskısını ve KVKK gibi yasal gereklilikleri pratik olarak öğrenme fırsatı yoktur.
- Tek tip öğretici (Tutor) yaklaşımı yetkin öğrencileri sıkmakta, zorlanan öğrencilere ise yetersiz kalmaktadır.
- Bu uygulama, hastane kriz senaryosu üzerinden interaktif karar verme ve davranışa göre adapte olan AI Tutor desteği sunar.

## 4. Proje Kapsamı

- Kişiselleştirilmiş giriş (3 soru).
- Hastane kriz senaryosu (3 karar aşaması).
- Sokratik yöntemle AI tutor (v2.0: ONNX destekli dinamik pedagojik derinlik).
- İki farklı final (başarılı / olumsuz).
- Karar özeti ve öğrenme raporu.
- Responsive, mobil öncelikli tasarım.
- Deneyimli kullanıcılar için 60 saniyelik zamanlayıcı.
- **v2.0:** Tarayıcı içi ONNX Runtime Web çıkarımı (`model.onnx`).
- **v2.0:** KVKK uyumlu anonim Veri Toplama Modu ve CSV dışa aktarımı.
- **v2.0:** Python Oracle ile diferansiyel parite testi (`tests/parite.py`).

## 5. Kapsam Dışı Özellikler

- Kullanıcı hesabı ve giriş sistemi yoktur.
- İkinci bir bölüm / senaryo geliştirilmeyecektir.
- Gerçek hasta verisi kullanılmayacaktır.
- Hukuki veya teknik konularda kesin ifadeler kullanılmayacaktır.
- Çok oyunculu veya çevrimiçi skor tablosu yoktur.
- Sunucu tarafında kullanıcı davranışlarını kaydeden merkezi bir veritabanı kurulmayacaktır (tüm veriler istemcide sessionStorage ve CSV olarak işlenir).

## 6. İşlevsel Gereksinimler

### FR-01: Kişiselleştirme
- Giriş ekranında tam olarak 3 soru sorulur: Seviye, Rol, Hedef.

### FR-02: Senaryo Sunumu
- Saat 08:00, hastane randevu sistemi çökmüş, 300 hasta bekliyor. Kriz durumu gösterilir.

### FR-03: Karar 1 — Sistem Mimarisi ve Geri Dönüş
- Eski sürüme geri dönmek (A) / Canlı sistemde yama yapmak (B).

### FR-04: Karar 2 — Test ve Yayına Alma
- Kısa kritik testler (A) / Test yapmadan hemen yayına almak (B).

### FR-05: Karar 3 — KVKK ve Log Güvenliği
- Kişisel verileri maskelemek (A) / Olduğu gibi göndermek (B).

### FR-06: Final Belirleme & Rapor
- Karar puanı ve KVKK durumuna göre Final A (Başarılı) veya Final B (Olumsuz).

### FR-07: Yeniden Oynama
- "Tekrar Oyna" butonu tüm simülasyon ve model durumunu sıfırlar.

### FR-08: AI Tutor & Prompt Injection Koruması
- 18 regex kalıbı ile koruma sağlanır, doğrudan cevap verilmez.

### FR-09: Zamanlayıcı
- Deneyimli kullanıcılar için her kararda 60 saniyelik süre.

### FR-10: Veri Toplama Modu (v2.0)
- Kullanıcının `karar_suresi_sn`, `ipucu_sayisi`, `karar_degistirme_sayisi`, `sahne_no`, `seviye`, `onceki_karar_suresi`, `kararsizlik_suresi` metriklerini ölçer.
- Gerçek isim, e-posta, konum ve cihaz kimliği KESİNLİKLE toplanmaz (KVKK uyumu).
- En az 1 tam oturum (3 karar) tamamlandığında CSV dışa aktarma aktifleşir.

### FR-11: ONNX İstemci Çıkarımı & Dinamik Tutor Davranışı (v2.0)
- Tarayıcıda `onnxruntime-web` ile `/model/model.onnx` modeli çalıştırılır.
- Tahmin olasılığı ekranda gösterilir (`data-cy="p"`).
- **Yüksek İpucu İhtiyacı (`P >= 0.5`):** Tutor pedagojik derinliği artırır, yönlendirici adımlar ve ek ipuçları sunar (`MOD: DESTEK`).
- **Düşük İpucu İhtiyacı (`P < 0.5`):** Tutor gereksiz yönlendirmeyi keser, zorlayıcı eleştirel mühendislik soruları sorar (`MOD: MEYDAN OKUMA`).
- Model yüklenemezse güvenli fallback devreye girer, uygulama çökmez.

## 7. Makine Öğrenmesi Şartnamesi ve Kabul Eşikleri

### 7.1. Model Hedefi ve Görevi
- **Görev:** İkili Sınıflandırma (Tabular Binary Classification)
- **Hedef:** `ipucu_gerekli` (0: İpucu gerekmez, 1: İpucu gerekir)
- **Girdi Özellikleri (8 Adet):** `karar_suresi_sn`, `onceki_yanlis_sayisi`, `ipucu_sayisi`, `karar_degistirme_sayisi`, `sahne_no`, `seviye`, `onceki_karar_suresi`, `kararsizlik_suresi`.

### 7.2. Kabul Eşiği (Eval Gate)
- **Minimum Test F1-Score Eşiği:** `0.65`
  - *Gerekçe:* 60 satırlık küçük örneklem kümesinde sınıf dengesizliği ve aşırı öğrenme (overfitting) riskleri göz önüne alındığında, 0.65 genel geçer istatistiksel anlamlılık için sağlam bir taban kabul eşiğidir.
- **Eğitim Kuralı:** Model test seti üzerinde F1 < 0.65 alırsa `train.py` hata koduyla durmalı ve model artefaktı yayınlanmamalıdır.
- **Gerçekleşen Başarı:** F1 = `0.9091`, Accuracy = `0.9167` (Kabul eşiği aşıldı).

### 7.3. Diferansiyel Parite Eşiği
- Python Oracle çıktısı ile Web ONNX Runtime çıktısı arasındaki fark:
  `abs(p_python - p_web) < 1e-4`
- 5 referans girdinin tamamında bu tolerans sağlanmalıdır. Gerçekleşen max fark: `3.19e-07`.

## 8. Kabul Kriterleri (AK-01 — AK-16)

- **AK-01..AK-11:** Önceki v1.0 kabul kriterleri aynen korunur.
- **AK-12 (Model Yüklenmesi):** Karar ekranında ONNX modeli başarıyla yüklenir ve `data-cy="ml-badge"` görünür.
- **AK-13 (Tahmin Olasılığı):** `data-cy="p"` seçicisi 0 ile 1 arasında geçerli bir olasılık değeri barındırır.
- **AK-14 (Dinamik Tutor):** Model çıktısına göre Tutor paneli mod değiştirir (`MOD: DESTEK` veya `MOD: MEYDAN OKUMA`).
- **AK-15 (Veri Toplama):** Oturum ID rastgele atanır, kararlar kaydedilir ve CSV çıktısı üretilir.
- **AK-16 (Parite Kontrolü):** `tests/parite.py` 5/5 referansta `< 1e-4` toleransla geçer.


### 7.4. Somut 3 Yeni Kabul Örneği (BDD / Senaryo Doğrulaması)

#### Kabul Örneği 1: Kararsız ve Tereddütlü Kullanıcı (İpucu İhtiyacı Yüksek)
- **Girdi / Durum:**
  - `karar_suresi_sn = 45.0`, `onceki_yanlis_sayisi = 2`, `ipucu_sayisi = 3`, `karar_degistirme_sayisi = 2`, `sahne_no = 2`, `seviye = 0 (beginner)`, `onceki_karar_suresi = 40.0`, `kararsizlik_suresi = 18.0`.
- **Beklenen Model Çıktısı:**
  - `ipucu_gerekli = 1` ve `P(1) >= 0.50` (Örnek: $P = 1.00$).
- **Uygulama İçi Davranış:**
  - Tutor paneli otomatik olarak `[MOD: DESTEK]` durumuna geçer.
  - Sokratik yönlendirme ipuçları daha detaylı ve cesaretlendirici hale gelir.

#### Kabul Örneği 2: Hızlı ve Emin Kullanıcı (İpucu İhtiyacı Düşük)
- **Girdi / Durum:**
  - `karar_suresi_sn = 8.0`, `onceki_yanlis_sayisi = 0`, `ipucu_sayisi = 0`, `karar_degistirme_sayisi = 0`, `sahne_no = 1`, `seviye = 1 (experienced)`, `onceki_karar_suresi = 0.0`, `kararsizlik_suresi = 2.0`.
- **Beklenen Model Çıktısı:**
  - `ipucu_gerekli = 0` ve `P(1) < 0.50` (Örnek: $P = 0.00$).
- **Uygulama İçi Davranış:**
  - Tutor paneli `[MOD: MEYDAN OKUMA]` moduna geçer.
  - Fazladan ipucu verilmez; öğrenciye alternatif kriz risklerini irdeleyen eleştirel sorular yöneltilir.

#### Kabul Örneği 3: Anonim Veri Toplama ve Dışa Aktarma
- **Girdi / Durum:**
  - Kullanıcı 3 karar aşamasını tamamlar (`sahne_no = 1, 2, 3`).
- **Beklenen Davranış:**
  - Her karar satırı KVKK kurallarına tam uyumlu şekilde (ad, e-posta, IP, konum olmadan) rastgele bir `oturum-*` ID'si ile yerel hafızaya kaydedilir.
  - "Veri Toplama Paneli" içindeki "CSV Olarak İndir" butonu aktifleşir ve `kaynak: "gercek"` etiketli veriler `oturumlar.csv` formatında dışa aktarılabilir.
