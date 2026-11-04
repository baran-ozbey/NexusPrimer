import { chromium } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

async function recordDemo() {
  const outputDir = path.resolve(process.cwd(), 'recordings');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  console.log('[1/7] Sayfa açılıyor: http://localhost:5173/');
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2500);

  // === ONBOARDING ===
  console.log('[2/7] Onboarding: Seviye, Rol ve Hedef seçiliyor...');
  await page.click('#level-beginner');
  await page.waitForTimeout(1000);
  await page.click('#role-developer');
  await page.waitForTimeout(1000);
  await page.click('#goal-reliability');
  await page.waitForTimeout(1500);
  await page.click('#start-button');
  await page.waitForTimeout(2500);

  // === SENARYO GİRİŞİ ===
  console.log('[3/7] Senaryo Brifingi gösteriliyor...');
  await page.waitForSelector('#begin-scenario');
  await page.waitForTimeout(2500);
  await page.click('#begin-scenario');
  await page.waitForSelector('#decision-screen');
  await page.waitForTimeout(2500);

  // === PROFİL 1: KARARSIZ KULLANICI (İPUCU İHTİYACI YÜKSEK) ===
  console.log('[4/7] Profil 1: Kararsız kullanıcı simülasyonu (Tereddüt, AI Tutor)...');
  // Veri toplama panelini aç ve incele
  await page.click('[data-cy="dc-toggle"]');
  await page.waitForTimeout(3000);
  // Paneli kapat
  await page.click('[data-cy="dc-toggle"]');
  await page.waitForTimeout(1500);

  // Tutor ile etkileşim (Sokratik İpucu İsteme)
  await page.fill('#tutor-input', 'Kritik veritabanı kilitlendi, hangi stratejiyi uygulamalıyım?');
  await page.waitForTimeout(1200);
  await page.click('#tutor-send');
  await page.waitForTimeout(5000);

  // Kararsızlık gösterisi: Seçenekler arasında gidip gelme
  await page.hover('#decision-1-option-A');
  await page.waitForTimeout(2000);
  await page.hover('#decision-1-option-B');
  await page.waitForTimeout(2500);
  await page.hover('#decision-1-option-A');
  await page.waitForTimeout(2000);

  // Karar 1 seçimi
  await page.click('#decision-1-option-A');
  await page.waitForSelector('#outcome-modal');
  await page.waitForTimeout(4000);
  await page.click('#outcome-continue');
  await page.waitForTimeout(2500);

  // === KARAR 2: HIZLI / EMİN KULLANICI (MEYDAN OKUMA MODU) ===
  console.log('[5/7] Profil 2: Hızlı ve kararlı kullanıcı (Mod: Meydan Okuma)...');
  await page.waitForTimeout(2000);
  // Seçenekler üzerinde hızlı inceleme
  await page.hover('#decision-2-option-B');
  await page.waitForTimeout(1500);
  // Hızlıca B seçeneğini tıkla
  await page.click('#decision-2-option-B');
  await page.waitForSelector('#outcome-modal');
  await page.waitForTimeout(3500);
  await page.click('#outcome-continue');
  await page.waitForTimeout(2500);

  // === KARAR 3: NİHAİ KARAR ===
  console.log('[6/7] Karar 3: Nihai kriz yönetimi kararı...');
  await page.waitForTimeout(2000);
  await page.hover('#decision-3-option-A');
  await page.waitForTimeout(1500);
  await page.click('#decision-3-option-A');
  await page.waitForSelector('#outcome-modal');
  await page.waitForTimeout(3500);
  await page.click('#outcome-continue');

  // === FİNAL EKRANI & VERİ TOPLAMA CSV İHRACI ===
  console.log('[7/7] Final Değerlendirme & Veri Toplama Paneli CSV İhracı...');
  await page.waitForSelector('#final-screen', { timeout: 10000 });
  await page.waitForTimeout(4000);

  // Veri Toplama Panelini aç ve oturum verilerini göster
  await page.click('[data-cy="dc-toggle"]');
  await page.waitForTimeout(3500);

  // CSV İndir butonunu vurgula/tıkla
  const exportBtn = page.locator('[data-cy="dc-export-btn"]');
  if (await exportBtn.isVisible()) {
    await exportBtn.hover();
    await page.waitForTimeout(1500);
    await exportBtn.click();
    await page.waitForTimeout(2000);
  }

  console.log('[TAMAMLANDI] Demo videosu kapatılıyor...');
  await page.waitForTimeout(2000);

  const video = page.video();
  const videoPath = await video?.path();
  await context.close();
  await browser.close();

  console.log('Video başarıyla kaydedildi:', videoPath);
}

recordDemo().catch((err) => {
  console.error('Kayıt hatası:', err);
  process.exit(1);
});
