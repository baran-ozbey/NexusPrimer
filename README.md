# YZM301 NexusPrimer — Yazılım Mühendisliği Kriz Simülasyonu

> Samsun Üniversitesi YZM301 Yazılım Mühendisliği dersi öğrencileri için
> interaktif, kişiselleştirilmiş karar verme simülasyonu.

## 🎯 Proje Hakkında

**NexusPrimer**, öğrencilerin gerçek bir hastane kriz senaryosunda 3 kritik yazılım mühendisliği kararı aldığı, AI tutor desteğiyle desteklenen eğitim amaçlı bir web simülasyonudur.

- **Konu:** Saat 08:00 — Hastane randevu sistemi çökmüş, 300 hasta bekliyor
- **Roller:** Yazılım geliştirici / Test mühendisi / Sistem yöneticisi
- **Kararlar:** Sistem mimarisi, test stratejisi, KVKK & log güvenliği
- **Final:** 2 farklı sonuç (başarılı / olumsuz) + öğrenme raporu

## 📹 60 Saniyelik Cypress Demo Videosu

Cypress ile baştan sona tüm simülasyon adımlarını (Onboarding, Kriz Alarmı, Karar 1-2-3, AI Tutor etkileşimi, Teknik Gerekçeler ve Final Öğrenme Raporu) kaydeden **52 saniyelik E2E demo videosu** oluşturulmuştur:
- **Video Dosyası Konumu:** `demo_video_60s.mp4` ve `cypress/videos/00_demo_video_60s.cy.js.mp4`

## 🚀 Kurulum & Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build

# Build önizlemesi
npm run preview
```

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| UI Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | CSS (Custom Properties, Glassmorphism) |
| State | React useState + sessionStorage |
| Linter | Oxlint |

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── Onboarding.tsx       # Kişiselleştirme ekranı (3 soru)
│   ├── ScenarioIntro.tsx    # Kriz giriş ekranı
│   ├── DecisionScreen.tsx   # Karar ekranı (1-2-3)
│   ├── OutcomeModal.tsx     # Karar sonucu modal
│   ├── FinalScreen.tsx      # Final ekranı + öğrenme raporu
│   ├── StatusBar.tsx        # Kriz durumu çubuğu
│   ├── ProgressBar.tsx      # Adım göstergesi
│   ├── Timer.tsx            # 60 sn zamanlayıcı (deneyimli)
│   └── TutorPanel.tsx       # AI Tutor chat paneli
├── data/
│   └── scenario.ts          # Tüm senaryo, karar ve outcome verileri
├── logic/
│   └── decisions.ts         # Puan ve final hesaplama mantığı
├── services/
│   └── tutor.ts             # Tutor simülasyonu (Sokratik + injection koruma)
└── types/
    └── index.ts             # TypeScript tip tanımları
```

## 🗂️ Özellik Matrisi

| Özellik | Durum | Açıklama |
|---------|-------|----------|
| Kişiselleştirme (3 soru) | ✅ | Seviye / Rol / Hedef |
| Senaryo sunumu | ✅ | Saat, sistem durumu, hasta sayısı |
| 3 karar aşaması | ✅ | Mimari, Test, KVKK |
| Karar sonucu modal | ✅ | Teknik gerekçe ile |
| 2 farklı final | ✅ | FINAL_A (başarı) / FINAL_B (olumsuz) |
| Öğrenme raporu | ✅ | Güçlü yönler + geliştirilecekler |
| AI Tutor (Sokratik) | ✅ | Kural tabanlı simülasyon |
| Zamanlayıcı (deneyimli) | ✅ | 60 sn, timeout → B seçeneği |
| Prompt injection koruması | ✅ | 18 pattern, güvenli fallback |
| sessionStorage kalıcılık | ✅ | Sayfa yenilemede durum korunur |
| Responsive tasarım | ✅ | 320px – 1920px |
| WCAG 2.1 AA | ✅ | Kontrast oranı, aria etiketleri |
| Klavye erişilebilirliği | ✅ | Focus visible, role=radiogroup |

## ❌ Ürün Kararları — Kapsam Dışı Bırakılan 3 Özellik ve Nedenleri

1. **Gerçek LLM API Entegrasyonu:** İstemci tarafında API anahtarı güvenliğini sağlamak mümkün olmadığından ve ders kapsamında bağımsız bir backend sunucusu bulunmadığından kural tabanlı simülasyon tercih edilmiştir.
2. **Çoklu Senaryo / İkinci Bölüm:** Kısıtlı geliştirme süresinde iki yüzeysel senaryo yerine tek bir hastane kriz senaryosunu derinlemesine ve pedagojik açıdan eksiksiz kurgulamak hedeflenmiştir.
3. **Kullanıcı Kayıt Sistemi ve Çevrimiçi Skor Tablosu:** Kalıcı kullanıcı verisi saklamanın ek KVKK yükümlülükleri ve veritabanı altyapısı gerektirmesi nedeniyle oturum bazlı (sessionStorage) yerel mimari seçilmiştir.

## 🔒 Güvenlik & Gizlilik

- Gerçek hasta verisi kullanılmamaktadır
- Tüm veriler yalnızca tarayıcı `sessionStorage`'ında tutulur
- Prompt injection koruması aktiftir (18 regex pattern)
- Eğitim uyarısı tüm ekranlarda görünürdür

## 📄 Lisans

Eğitim amaçlı proje — Samsun Üniversitesi YZM301 2024-2025
