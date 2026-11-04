# NexusPrimer — Veri Sözlüğü (SOZLUK.md)

Versiyon: 2.0 | Tarih: 2026-11-04 | Kaynak Dosya: `data/oturumlar.csv`

## Veri Seti Genel Bilgisi

| Özellik | Değer |
|---------|-------|
| Toplam satır (gerçek) | 45 satır (15 oturum × 3 karar) |
| Toplam satır (sentetik) | 15 satır (5 oturum × 3 karar) |
| Toplam | 60 satır |
| Hedef değişken | `ipucu_gerekli` |
| Kayıt yöntemi | KVKK-uyumlu anonim gözlem |

## Sütun Tanımları

### oturum_id
- **Veri Tipi:** string
- **Açıklama:** Tekil oturum kimliği. `oturum-NNN` (gerçek) veya `oturum-sNNN` (sentetik) formatında rastgele üretilir.
- **Ölçü Birimi:** yok
- **Örnek Değer:** `oturum-001`, `oturum-s003`
- **İzin Verilen Değerler:** `oturum-[0-9]{3}` veya `oturum-s[0-9]{3}`
- **Türetilmiş mi?** Hayır — uygulama tarafından oturum başında UUID v4'ten atanır.
- **Eksik Değer:** İzin verilmez. Eksikse satır çıkarılır.

---

### katilimci_no
- **Veri Tipi:** string
- **Açıklama:** Katılımcının anonim kod adı. Gerçek isim, e-posta veya cihaz kimliği **kesinlikle toplanmaz** (KVKK md. 6).
- **Ölçü Birimi:** yok
- **Örnek Değer:** `katilimci-1`, `sentetik-3`
- **İzin Verilen Değerler:** `katilimci-[1-9]+` (gerçek), `sentetik-[1-9]+` (sentetik)
- **Türetilmiş mi?** Hayır — oturum başında manuel/otomatik atanır.
- **Eksik Değer:** İzin verilmez.

---

### karar_suresi_sn
- **Veri Tipi:** float / int (≥ 0)
- **Açıklama:** Kullanıcının seçenekler görüntülendiği andan karar verdiği ana kadar geçen süre (saniye). `performance.now()` ile ölçülür.
- **Ölçü Birimi:** saniye
- **Örnek Değer:** `45.2`
- **İzin Verilen Değerler:** 0 – 300 (600 üstü zaman aşımı sayılır)
- **Türetilmiş mi?** Hayır — gerçek zamanlama ölçümü.
- **Eksik Değer:** 0 ile doldurulur ve `eksik_veri=True` işaretlenir.

---

### onceki_yanlis_sayisi
- **Veri Tipi:** int (≥ 0)
- **Açıklama:** Mevcut karar aşamasından önce yapılan "riskli" (B) seçim sayısı. İlk karar için daima 0.
- **Ölçü Birimi:** adet
- **Örnek Değer:** `2`
- **İzin Verilen Değerler:** 0 – 2 (3 karar olduğundan en fazla 2 önceki yanlış olabilir)
- **Türetilmiş mi?** Evet — önceki kararların sonuçlarından hesaplanır.
- **Eksik Değer:** 0 ile doldurulur.
- **⚠️ Veri Sızıntısı Notu:** Bu özellik mevcut kararın sonucunu değil, geçmiş kararları temsil eder. Hedef değişkenle doğrudan veri sızıntısı yoktur.

---

### ipucu_sayisi
- **Veri Tipi:** int (≥ 0)
- **Açıklama:** Mevcut karar aşamasında kullanıcının tutor paneline gönderdiği toplam mesaj sayısı (her mesaj bir ipucu talebi sayılır).
- **Ölçü Birimi:** adet
- **Örnek Değer:** `3`
- **İzin Verilen Değerler:** 0 – 20
- **Türetilmiş mi?** Hayır — TutorPanel bileşeninde sayılır.
- **Eksik Değer:** 0 ile doldurulur.

---

### karar_degistirme_sayisi
- **Veri Tipi:** int (≥ 0)
- **Açıklama:** Kullanıcının bir seçeneği seçip ardından başka bir seçeneği seçme sayısı (nihai karardan önceki değişim sayısı).
- **Ölçü Birimi:** adet
- **Örnek Değer:** `2`
- **İzin Verilen Değerler:** 0 – 10
- **Türetilmiş mi?** Hayır — UI etkileşiminden gerçek zamanlı sayılır.
- **Eksik Değer:** 0 ile doldurulur.

---

### sahne_no
- **Veri Tipi:** int
- **Açıklama:** Mevcut karar sahnesinin sırası. 1 = Mimari, 2 = Test, 3 = KVKK.
- **Ölçü Birimi:** yok
- **Örnek Değer:** `2`
- **İzin Verilen Değerler:** 1, 2, 3
- **Türetilmiş mi?** Hayır — uygulama state'inden alınır.
- **Eksik Değer:** İzin verilmez.

---

### seviye
- **Veri Tipi:** int (kategorik kodlamalı)
- **Açıklama:** Kullanıcının onboarding'de seçtiği deneyim seviyesi. Sayısal kodlama: 0 = Yeni Başlayan, 1 = Deneyimli.
- **Ölçü Birimi:** yok
- **Örnek Değer:** `0`
- **İzin Verilen Değerler:** 0 (beginner/intermediate), 1 (experienced)
- **Türetilmiş mi?** Evet — orijinal string seviye ikili (binary) olarak kodlanır.
- **Eksik Değer:** 0 (varsayılan: yeni başlayan) ile doldurulur.

---

### onceki_karar_suresi
- **Veri Tipi:** float (≥ 0)
- **Açıklama:** Bir önceki kararın alınması için geçen süre (saniye). İlk karar için 0.
- **Ölçü Birimi:** saniye
- **Örnek Değer:** `30.5`
- **İzin Verilen Değerler:** 0 – 300
- **Türetilmiş mi?** Evet — önceki karar kaydından alınır.
- **Eksik Değer:** 0 ile doldurulur (ilk karar).

---

### kararsizlik_suresi
- **Veri Tipi:** float (≥ 0)
- **Açıklama:** Kullanıcının sayfayı açıp ilk etkileşime (tutor, seçenek hover vb.) kadar geçen "bekleme süresi" (saniye). Yüksek değer kararsızlık göstergesidir.
- **Ölçü Birimi:** saniye
- **Örnek Değer:** `12.3`
- **İzin Verilen Değerler:** 0 – 120
- **Türetilmiş mi?** Hayır — UI ilk etkileşim zamanlamasından ölçülür.
- **Eksik Değer:** 0 ile doldurulur.

---

### ipucu_gerekli (🎯 Hedef Değişken)
- **Veri Tipi:** int (binary)
- **Açıklama:** Kullanıcının bu karar aşamasında ipucuna ihtiyaç duyup duymadığının etiketi. Model bu değeri tahmin eder.
- **Ölçü Birimi:** yok
- **Örnek Değer:** `1`
- **İzin Verilen Değerler:** 0 (ipucu gerekmez), 1 (ipucu gerekir)
- **Türetilmiş mi?** Evet — aşağıdaki **etiketleme kuralı** ile türetilir.
- **Eksik Değer:** İzin verilmez, satır çıkarılır.

**Etiketleme Kuralı (İpucu Gerekli mi?):**
```
ipucu_gerekli = 1 EĞER:
  - ipucu_sayisi >= 2  VE/VEYA
  - karar_suresi_sn >= 30  VE/VEYA
  - karar_degistirme_sayisi >= 2

ipucu_gerekli = 0 DİĞER DURUMLARDA
```
Bu kural, gerçek kullanıcı davranışından tutarlı ve tekrarlanabilir biçimde etiket üretir.
Hedef değişken **gelecekteki** bir karar için tahmin edildiğinden veri sızıntısı yoktur.

---

### kaynak
- **Veri Tipi:** string (kategorik)
- **Açıklama:** Verinin kaynağını belirtir. Gerçek ve sentetik veriler birbirinden ayrı tutulur.
- **Ölçü Birimi:** yok
- **Örnek Değer:** `gercek`
- **İzin Verilen Değerler:** `gercek`, `sentetik`
- **Türetilmiş mi?** Hayır — veri toplama modunda manuel/otomatik olarak atanır.
- **Eksik Değer:** İzin verilmez.

---

## Eksik Değer Politikası

| Sütun | Eksik Değer Davranışı |
|-------|----------------------|
| oturum_id | Satır çıkarılır |
| katilimci_no | Satır çıkarılır |
| karar_suresi_sn | 0.0 ile doldurulur |
| onceki_yanlis_sayisi | 0 ile doldurulur |
| ipucu_sayisi | 0 ile doldurulur |
| karar_degistirme_sayisi | 0 ile doldurulur |
| sahne_no | Satır çıkarılır |
| seviye | 0 (beginner) varsayılır |
| onceki_karar_suresi | 0.0 ile doldurulur |
| kararsizlik_suresi | 0.0 ile doldurulur |
| ipucu_gerekli | Satır çıkarılır |
| kaynak | Satır çıkarılır |

## Sentetik Veri Üretim Yöntemi

Sentetik veriler `random_state=42` ile Python `numpy.random` kullanılarak oluşturulmuştur.

**Üretim Kuralları:**
- Gerçek verinin istatistiksel dağılımı (ortalama, std) korunmuştur.
- Etiketler aynı kural tablosuna (etiketleme kuralı) göre türetilmiştir.
- Gerçek katılımcı verisi sentetikten **hiçbir şekilde** karıştırılmamıştır.
- README'de gerçek ve sentetik ayrımı açıkça raporlanmıştır.

