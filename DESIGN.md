# NexusPrimer — Tasarım Rehberi (DESIGN.md)

> **Tema:** Karanlık Kriz Merkezi / Terminal UI  
> Uygulama, bir hastane kriz senaryosunu yönettiği için tasarım dili
> aciliyet, gerilim ve teknik yetkinlik hissini vermektedir.

---

## 1. Renk Paleti

### Ana Renkler (Kriz Teması)

| Renk | Token | HEX | Kullanım |
|------|-------|-----|----------|
| Neon Cyan | `--color-primary` | `#00d4ff` | Butonlar, vurgular, aktif öğeler |
| Alarm Kırmızısı | `--color-secondary` | `#ff3860` | Hata, riskli karar, uyarı |
| Neon Yeşil | `--color-success` | `#00ff88` | Başarılı karar, Final A |
| Amber | `--color-warning` | `#ffab00` | Zamanlayıcı uyarısı |
| Koyu Lacivert | `--color-bg` | `#0a0e1a` | Sayfa arka planı |
| Yüzey | `--color-surface` | `#0f1526` | Kart arka planı |
| Açık Mavi-Beyaz | `--color-text` | `#e0e6ff` | Ana metin |
| Soluk Mavi | `--color-text-light` | `#8899bb` | Yardımcı metin |

### Glow Efektleri

| Değişken | Değer |
|----------|-------|
| `--glow-cyan` | `0 0 12px rgba(0,212,255,0.4), 0 0 24px rgba(0,212,255,0.15)` |
| `--glow-red` | `0 0 12px rgba(255,56,96,0.5), 0 0 24px rgba(255,56,96,0.2)` |
| `--glow-green` | `0 0 12px rgba(0,255,136,0.4), 0 0 24px rgba(0,255,136,0.15)` |

### Eski/Yeni Palet Karşılaştırması

| Öğe | Eski | Yeni |
|-----|------|------|
| Arka plan | `#F0F4F8` (açık gri) | `#0a0e1a` (koyu uzay siyahı) |
| Primary | `#0F2B46` (lacivert) | `#00d4ff` (neon cyan) |
| Success | `#2E7D32` (koyu yeşil) | `#00ff88` (neon yeşil) |
| Error | `#C62828` (koyu kırmızı) | `#ff3860` (alarm kırmızısı) |

---

## 2. Tipografi

### Font Ailesi
- **Sans-serif:** `'Inter', system-ui, sans-serif` — UI metinleri
- **Monospace:** `'JetBrains Mono', 'Fira Code', monospace` — Terminal çıktıları, kod, zamanlayıcı, status bar

### Boyutlar

| Eleman | Masaüstü | Mobil |
|--------|----------|-------|
| H1 Sayfa başlığı | 32px / 700 | 24px |
| H2 Bölüm başlığı | 24px / 700 | 20px |
| Gövde metni | 16px / 400 | 15px |
| Küçük metin | 14px | 12px |
| Buton | 16px / 600 | 14px |
| Terminal/Mono | 14px / 500 | 12px |

---

## 3. Aralık Sistemi (4px tabanlı)

| Token | Değer | Kullanım |
|-------|-------|----------|
| `--sp-xs` | 4px | İkon-metin arası |
| `--sp-sm` | 8px | İç eleman arası |
| `--sp-md` | 16px | Bileşen padding |
| `--sp-lg` | 24px | Bölümler arası |
| `--sp-xl` | 32px | Sayfa kenar |
| `--sp-2xl` | 48px | Büyük bölüm ayrımı |

---

## 4. Bileşen Tasarımları

### 4.1 Kart Bileşeni — Glassmorphism

```css
background: rgba(255, 255, 255, 0.03);
border: 1px solid rgba(0, 212, 255, 0.15);
border-radius: 12px;
backdrop-filter: blur(10px);
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
```

### 4.2 Ana Buton (btn-primary)

```css
background: transparent;
border: 2px solid var(--color-primary);   /* #00d4ff */
color: var(--color-primary);
box-shadow: var(--glow-cyan);
/* hover: background dolar, glow artar */
```

### 4.3 Durum Çubuğu (Status Bar)

- Yapışkan üst çubuk (`position: sticky; top: 0`)
- Arka plan: `#0a0e1a` + `backdrop-filter: blur(12px)`
- Alt kenarlık: `1px solid rgba(0,212,255,0.2)`
- Font: JetBrains Mono
- Sol: yanıp sönen `⚠` + kriz saati (neon cyan)
- Orta: `SYS: Çökmüş` (alarm kırmızısı) / `SYS: Kısmi` (amber)
- Sağ: hasta sayısı + `KRİZ: KRİTİK` badge (yanıp sönen kırmızı)

### 4.4 Karar Seçenek Butonu

```
┌─────────────────────────────────┐
│ [A]  Eski sürüme geri dönmek    │
│      Veritabanı şema uyumunu    │
│      kontrol ettikten sonra...  │
└─────────────────────────────────┘
```

- Sol kenar: `5px solid var(--color-primary)`
- Hover: `translateX(4px)` + neon glow box-shadow
- `[A]` / `[B]` etiketi: monospace, kırmızı, bold

### 4.5 Zamanlayıcı (Deneyimli Kullanıcı)

- Dairesel SVG progress ring
- Renk geçişi: `#00ff88` (60s) → `#ffab00` (30s) → `#ff3860` (10s)
- Son 10s: `countdownPulse` animasyonu (titreşim)
- Pozisyon: kart sağ üst köşesinde `position: absolute`

### 4.6 AI Tutor Paneli — Terminal Teması

```
┌─────────────────────────────────┐
│ > AI_TUTOR v1.0 [SOKRATES_MOD] │
│ ─────────────────────────────── │
│ [TUTOR] > Rollback yapmadan     │
│           önce şema uyumunu...  │
│                                 │
│ [SEN]   > Şema değişmişse ne   │
│           olur?                 │
│ ─────────────────────────────── │
│ $ _                             │
└─────────────────────────────────┘
```

- Arka plan: `#091220` (terminal siyahı)
- Kenarlık: `1px solid rgba(0,212,255,0.1)`
- Mesaj prefix: `[TUTOR] >` (cyan) / `[SEN] >` (kırmızı)

### 4.7 İlerleme Göstergesi

```
  ✓           ●           ○
Mimari ─── Test ─────── KVKK
(tamamlandı) (aktif)  (bekliyor)
```

- Tamamlanan: neon yeşil dolgu + `✓`
- Aktif: neon cyan + sayı
- Bekleyen: soluk gri

### 4.8 Onboarding — Boot Ekranı

```
> INITIALIZING NEXUS PRIMER v2.0...
> LOADING SCENARIO DATA... OK
> CONNECTING AI TUTOR... OK
> SYSTEM READY

🏥 NexusPrimer
Yazılım Mühendisliği Kriz Simülasyonu
```

- Arka planda CRT scanline efekti
- Kart: glassmorphism, neon cyan kenarlık
- Seçenekler `[01]` `[02]` `[03]` format

---

## 5. Ekran Wireframe'leri (ASCII)

### Ekran 1 — Onboarding

```
╔══════════════════════════════════════╗
║  > INITIALIZING NEXUS PRIMER v2.0...   ║
║  > SYSTEM READY                     ║
║                                     ║
║  ┌─────────────────────────────┐    ║
║  │  🏥  NexusPrimer              │    ║
║  │  Yazılım Mühendisliği       │    ║
║  │  Kriz Simülasyonu           │    ║
║  │                             │    ║
║  │  📊 Deneyim seviyeniz?      │    ║
║  │  [01] Yeni  [02] Orta  [03] │    ║
║  │                             │    ║
║  │  👤 Rolünüz?                │    ║
║  │  [01] Dev  [02] Test [03]   │    ║
║  │                             │    ║
║  │  🎯 Hedefiniz?              │    ║
║  │  [01] Güv. [02]Test [03]    │    ║
║  │                             │    ║
║  │   > BAŞLAT_SİMÜLASYON      │    ║
║  └─────────────────────────────┘    ║
╚══════════════════════════════════════╝
```

### Ekran 2 — Kriz Girişi

```
╔══════════════════════════════════════╗
║ ⚠ KRİZ SAATİ 08:00 | SYS:ÇÖKMÜŞ   ║
║              | 👥300 | KRİZ:KRİTİK ║
╠══════════════════════════════════════╣
║                                     ║
║  ⚠ KRİZ ALARMI AKTİF ⚠            ║
║                                     ║
║  > Hastane Randevu Sistemi Krizi    ║
║  > Saat 08:00, sistem erişilemez    ║
║  > 300 hasta bekliyor               ║
║  > Sen: Nöbetçi Yazılım Mühendisi  ║
║                                     ║
║  📋 GÖREV: 3 kritik karar           ║
║                                     ║
║   > KRİZE_MÜDAHALE_ET →            ║
╚══════════════════════════════════════╝
```

### Ekran 3 — Karar Ekranı

```
╔══════════════════════════════════════╗
║ ⚠ KRİZ SAATİ 08:00  SYS:ÇÖKMÜŞ  ⏱║
╠══════════════════════════════════════╣
║  ✓ Mimari ─── ● Test ─── ○ KVKK    ║
║  ┌──────────────────────────── [45] ║
║  │ [01] Karar 1: Sistem Mimarisi   ║
║  │                                  ║
║  │ Gece yayımlanan sürüm sonrası... ║
║  │                                  ║
║  │ ℹ BAĞLAM: Şema uyumu kritik...  ║
║  │                                  ║
║  │ 💡 Rollback nedir: önceki...    ║
║  │                                  ║
║  │ > [A] Eski sürüme geri dön       ║
║  │   Veritabanı şeması kontrol...  ║
║  │                                  ║
║  │ > [B] Canlı sistem yamala        ║
║  │   Üretimde hata ayıklama...     ║
║  └──────────────────────────────────║
║  ┌──────────────────────────────────║
║  │ > AI_TUTOR v1.0 [SOKRATES_MOD] ║
║  │ [TUTOR] > Hangi bilgilere...    ║
║  │ $ _                             ║
║  └──────────────────────────────────║
╚══════════════════════════════════════╝
```

### Ekran 4 — Outcome Modal

```
╔══════════════════════════════════════╗
║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ║
║  ░  ┌───────────────────────────┐ ░ ║
║  ░  │ ✓ Güvenli Geri Dönüş     │ ░ ║
║  ░  │                           │ ░ ║
║  ░  │ Veritabanı şema uyumunu   │ ░ ║
║  ░  │ kontrol ettikten sonra... │ ░ ║
║  ░  │                           │ ░ ║
║  ░  │ // Teknik Gerekçe         │ ░ ║
║  ░  │ Rollback stratejisi,      │ ░ ║
║  ░  │ migration uyumluluğu...   │ ░ ║
║  ░  │                           │ ░ ║
║  ░  │    DEVAM_ET →             │ ░ ║
║  ░  └───────────────────────────┘ ░ ║
║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ║
╚══════════════════════════════════════╝
```

### Ekran 5 — Final (Başarılı)

```
╔══════════════════════════════════════╗
║                                     ║
║         ✓ BAŞARILI SONUÇ            ║
║         🕐 Saat 08:25               ║
║         KARAR SKORU: 3/3            ║
║                                     ║
║  Sistem güvenli çalışıyor...        ║
║                                     ║
║  ✓ Karar 1: Güvenli Geri Dönüş     ║
║    Şema uyumu doğrulayarak rollback ║
║                                     ║
║  ✓ Karar 2: Test Yapıldı            ║
║    Smoke test geçti, yayına alındı  ║
║                                     ║
║  ✓ Karar 3: KVKK Uyumu             ║
║    Veriler maskelendi, uyumlu       ║
║                                     ║
║  💪 Güçlü Yönlerin                 ║
║  • Kontrollü geri dönüş             ║
║  • Kalite güvencesi bilinci         ║
║                                     ║
║      > TEKRAR_OYNA                  ║
╚══════════════════════════════════════╝
```

---

## 6. Animasyonlar

| Animasyon | Kullanım | Süre | Easing |
|-----------|----------|------|--------|
| `fadeIn` | Sayfa/bileşen geçişi | 0.5s | ease-out |
| `slideInRight` | Tutor mesajı | 0.3s | ease-out |
| `scanline` | Arka plan CRT efekti | 8s | linear (döngü) |
| `neonPulse` | Cyan öğeler titremesi | 3s | ease-in-out |
| `neonPulseRed` | Alarm durumu | 2s | ease-in-out |
| `alarmBlink` | Final B başlık | 1s | step-end |
| `countdownPulse` | Timer son 10s | 1s | ease-in-out |
| `glitch` | Hata durumu | 0.3s | step-end |
| `blink` | Terminal cursor | 1s | step-end |
| `borderGlow` | Kart vurgusu | 2s | ease-in-out |

---

## 7. Responsive Kurallar

### Breakpoints

| İsim | Min Genişlik | Değişiklik |
|------|-------------|------------|
| Mobil (default) | 320px | Tek sütun, tam genişlik |
| Tablet | 768px | Geniş padding |
| Masaüstü | 1024px | Büyük padding |

### Mobil Öncelikli Kurallar

- Onboarding seçenekleri dikey sıralanır
- Status bar font küçülür
- Kart padding: 16px
- Buton tam genişlik
- Timer kart içinde ortalanır

---

## 8. Erişilebilirlik (WCAG 2.1 AA)

| Kriter | Uygulama |
|--------|----------|
| Kontrast | `#00d4ff` / `#0a0e1a` = 8.5:1 ✅ |
| Focus | `outline: 2px solid #00d4ff; outline-offset: 2px` |
| ARIA | `role="progressbar"`, `role="timer"`, `role="complementary"`, `aria-modal` |
| Klavye | Tab navigasyonu, Enter ile seçim |
| Motion | `prefers-reduced-motion: reduce` desteklenir |
| Screen reader | `aria-live="polite"` tutor mesajları için |
