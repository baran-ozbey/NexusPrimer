import { chromium } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * NexusPrimer v2.0 — Demo Kayıt Scripti (Güncellenmiş)
 * Yeni: AI Davranış Röntgeni kartı ve Paylaş butonu gösterimi dahil.
 * Hedef: ≤ 90 saniye
 */
async function recordDemo() {
  const outputDir = path.resolve(process.cwd(), 'recordings');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  // ── [1] Onboarding ──
  console.log('[1/8] Sayfa açılıyor...');
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('#onboarding-screen', { timeout: 15000 });
  await page.waitForTimeout(1800);

  // Seviye: Beginner
  await page.click('#level-beginner');
  await page.waitForTimeout(600);
  // Rol: Developer
  await page.click('#role-developer');
  await page.waitForTimeout(600);
  // Hedef: Reliability
  await page.click('#goal-reliability');
  await page.waitForTimeout(800);
  await page.click('#start-button');
  await page.waitForTimeout(1500);

  // ── [2] Senaryo Brifingi ──
  console.log('[2/8] Senaryo brifingi...');
  await page.waitForSelector('#begin-scenario');
  await page.waitForTimeout(1800);
  await page.click('#begin-scenario');
  await page.waitForSelector('#decision-screen');
  await page.waitForTimeout(2000);

  // ── [3] Karar 1 — Kararsız Kullanıcı: ONNX badge + Tutor göster ──
  console.log('[3/8] Karar 1: Kararsız kullanıcı (ONNX + Tutor)...');

  // ML badge görünmesini bekle
  await page.waitForSelector('[data-cy="ml-badge"]', { timeout: 15000 });
  await page.waitForTimeout(1500);

  // Veri Toplama Panelini kısaca göster
  await page.click('[data-cy="dc-toggle"]');
  await page.waitForTimeout(1800);
  await page.click('[data-cy="dc-toggle"]');
  await page.waitForTimeout(800);

  // Tutor ile etkileşim
  await page.fill('#tutor-input', 'Kritik veritabanı kilitlendi, hangi stratejiyi seçmeliyim?');
  await page.click('#tutor-send');
  await page.waitForTimeout(3500);

  // Kararsızlık: şıklar arası gidip gel
  await page.hover('#decision-1-option-A');
  await page.waitForTimeout(1200);
  await page.hover('#decision-1-option-B');
  await page.waitForTimeout(1000);
  await page.hover('#decision-1-option-A');
  await page.waitForTimeout(1000);

  // Karar 1: A seç (güvenli geri dönüş)
  await page.click('#decision-1-option-A');
  await page.waitForSelector('#outcome-modal', { timeout: 8000 });
  await page.waitForTimeout(2500);
  await page.click('#outcome-continue');
  await page.waitForTimeout(1500);

  // ── [4] Karar 2 — Hızlı / Emin Kullanıcı: MOD: MEYDAN OKUMA ──
  console.log('[4/8] Karar 2: Hızlı kullanıcı (Meydan Okuma modu)...');
  await page.waitForSelector('#decision-screen', { timeout: 8000 });
  await page.waitForTimeout(1200);

  // Hızlı hover + seçim (emin kullanıcı simülasyonu)
  await page.hover('#decision-2-option-A');
  await page.waitForTimeout(800);
  await page.click('#decision-2-option-A');
  await page.waitForSelector('#outcome-modal', { timeout: 8000 });
  await page.waitForTimeout(2500);
  await page.click('#outcome-continue');
  await page.waitForTimeout(1500);

  // ── [5] Karar 3 — Nihai Karar ──
  console.log('[5/8] Karar 3: Nihai karar (KVKK)...');
  await page.waitForSelector('#decision-screen', { timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.hover('#decision-3-option-A');
  await page.waitForTimeout(1000);
  await page.click('#decision-3-option-A');
  await page.waitForSelector('#outcome-modal', { timeout: 8000 });
  await page.waitForTimeout(2500);
  await page.click('#outcome-continue');

  // ── [6] Final Ekranı: AI Davranış Röntgeni Kartı ──
  console.log('[6/8] Final ekranı — AI Davranış Röntgeni kartı...');
  await page.waitForSelector('#final-screen', { timeout: 10000 });
  await page.waitForTimeout(2500);

  // Kartın tam görünmesi için scroll et
  const archetypeCard = page.locator('#ai-archetype-card');
  if (await archetypeCard.isVisible()) {
    await archetypeCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
  }

  // ── [7] Paylaş butonu vurgula ──
  console.log('[7/8] Paylaş butonu tıklanıyor...');
  const shareBtn = page.locator('#share-profile-btn');
  if (await shareBtn.isVisible()) {
    await shareBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await shareBtn.hover();
    await page.waitForTimeout(800);
    await shareBtn.click();
    await page.waitForTimeout(1500); // "Kopyalandı" feedback'ini göster
  }

  // ── [8] Veri Toplama CSV export ──
  console.log('[8/8] Veri Toplama Paneli ve CSV export...');
  await page.click('[data-cy="dc-toggle"]');
  await page.waitForTimeout(1800);
  const exportBtn = page.locator('[data-cy="dc-export-btn"]');
  if (await exportBtn.isVisible()) {
    await exportBtn.hover();
    await page.waitForTimeout(800);
    await exportBtn.click();
    await page.waitForTimeout(1200);
  }

  console.log('[TAMAMLANDI] Video kapatılıyor...');
  await page.waitForTimeout(1500);

  const video = page.video();
  const videoPath = await video?.path();
  await context.close();
  await browser.close();

  if (videoPath) {
    // Kayıt klasöründen proje köküne kopyala
    const destPath = path.resolve(process.cwd(), 'demo_v2_adaptive_60s.mp4');
    fs.copyFileSync(videoPath, destPath);
    console.log('Video kaydedildi ve kopyalandı:', destPath);
    console.log('Kaynak:', videoPath);
  } else {
    console.error('Video yolu alınamadı!');
  }
}

recordDemo().catch((err) => {
  console.error('Kayıt hatası:', err);
  process.exit(1);
});
