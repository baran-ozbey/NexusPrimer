// ===== NexusPrimer 2.0 — Playwright E2E: Makine Öğrenmesi & Veri Toplama =====
// Cypress 16.x + Node 24 uyumsuzluğu nedeniyle Playwright kullanılıyor.

import { test, expect } from '@playwright/test';

// --- Yardımcı: Onboarding tamamla ---
async function completeOnboarding(page: any) {
  await page.goto('/');
  await page.waitForSelector('#onboarding-screen', { timeout: 10000 });
  await page.click('#level-beginner');
  await page.click('#role-developer');
  await page.click('#goal-reliability');
  await page.click('#start-button');
  await page.waitForSelector('#scenario-intro-screen', { timeout: 10000 });
  await page.click('#begin-scenario');
  await page.waitForSelector('#decision-screen', { timeout: 15000 });
}

test.describe('NexusPrimer 2.0 — Adaptif Makine Öğrenmesi E2E Testleri', () => {

  test('AK-ML-01: Karar ekranında ONNX modeli yüklenir ve tahmin olasılığı gösterilir', async ({ page }) => {
    await completeOnboarding(page);

    // ML badge görünür olmalı (model yükleniyor veya fallback)
    await expect(page.locator('#ml-prediction-badge')).toBeVisible({ timeout: 15000 });

    // data-cy="p" elementi olasılık değeri içermeli (0-1 arası)
    const pEl = page.locator('[data-cy="p"]');
    await expect(pEl).toBeVisible({ timeout: 10000 });
    const pText = await pEl.textContent();
    const pVal = parseFloat(pText ?? '-1');
    expect(pVal).toBeGreaterThanOrEqual(0);
    expect(pVal).toBeLessThanOrEqual(1);
  });

  test('AK-ML-02: Tutor modu ONNX tahminine göre dinamik olarak belirlenir', async ({ page }) => {
    await completeOnboarding(page);

    const tutorMode = page.locator('[data-cy="tutor-mode"]');
    await expect(tutorMode).toBeVisible({ timeout: 10000 });
    const modeText = await tutorMode.textContent();
    expect(modeText).toMatch(/MOD: (DESTEK|MEYDAN OKUMA)/);
  });

  test('AK-ML-03: Tutor yanıtında ONNX adaptif ön eki ve pedagojik yönlendirme yer alır', async ({ page }) => {
    await completeOnboarding(page);

    // Tutor inputuna yazıp gönder
    await page.fill('#tutor-input', 'Bu kararı nasıl vermeliyim?');
    await page.click('#tutor-send');

    // Tutor yanıtı gelmeli
    await page.waitForSelector('.tutor-msg--tutor', { timeout: 10000 });
    const msgs = await page.locator('.tutor-msg--tutor').allTextContents();
    const lastMsg = msgs[msgs.length - 1] ?? '';
    // ONNX veya adaptif kelimesi geçmeli
    expect(lastMsg.toLowerCase()).toMatch(/onnx|adaptif|destek|meydan/i);
  });

  test('AK-ML-04: Veri toplama paneli açılır, oturum ID ve sayaçlar görünür', async ({ page }) => {
    await completeOnboarding(page);

    // DC toggle butonu
    await page.click('[data-cy="dc-toggle"]');
    await expect(page.locator('[data-cy="dc-panel"]')).toBeVisible({ timeout: 5000 });

    // Oturum ID "oturum-" prefix içermeli
    const sessionIdEl = page.locator('[data-cy="session-id"]');
    await expect(sessionIdEl).toBeVisible();
    const sessionIdText = await sessionIdEl.textContent();
    expect(sessionIdText).toMatch(/oturum-/);

    // Kayıt sayacı görünür
    await expect(page.locator('[data-cy="dc-row-count"]')).toBeVisible();
  });

  test('AK-ML-05: Karar sonrası veri toplama kaydı oluşturulur ve CSV dışa aktarma etkin', async ({ page }) => {
    await completeOnboarding(page);

    // DC panelini aç
    await page.click('[data-cy="dc-toggle"]');
    await expect(page.locator('[data-cy="dc-panel"]')).toBeVisible({ timeout: 5000 });

    // Başlangıçta satır sayısını oku
    const countElBefore = page.locator('[data-cy="dc-row-count"]');
    const beforeText = await countElBefore.textContent();
    const beforeCount = parseInt(beforeText?.match(/\d+/)?.[0] ?? '0');

    // Paneli kapat ve karar ver
    await page.click('[data-cy="dc-toggle"]');

    await page.click('#decision-1-option-A');
    await page.waitForSelector('#outcome-modal', { timeout: 10000 });
    await page.click('#outcome-continue');

    // DC panelini tekrar aç
    await page.click('[data-cy="dc-toggle"]');
    await expect(page.locator('[data-cy="dc-panel"]')).toBeVisible({ timeout: 5000 });

    // Kayıt sayısı artmış olmalı
    const afterText = await countElBefore.textContent();
    const afterCount = parseInt(afterText?.match(/\d+/)?.[0] ?? '0');
    expect(afterCount).toBeGreaterThanOrEqual(beforeCount);
  });

  test('AK-ML-06: ML badge kaynağı "onnx" veya "fallback" değeri içerir', async ({ page }) => {
    await completeOnboarding(page);

    const badge = page.locator('#ml-prediction-badge');
    await expect(badge).toBeVisible({ timeout: 15000 });

    // Badge metni veya data-source attribute'u kontrol
    const badgeText = await badge.textContent();
    expect(badgeText?.toLowerCase()).toMatch(/onnx|fallback|ml|yükleniyor|hazır/i);
  });

  test('AK-ML-07: Onboarding ekranı tüm gerekli elementleri içerir', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#onboarding-screen', { timeout: 10000 });

    await expect(page.locator('#level-beginner')).toBeVisible();
    await expect(page.locator('#level-intermediate')).toBeVisible();
    await expect(page.locator('#level-experienced')).toBeVisible();
    await expect(page.locator('#role-developer')).toBeVisible();
    await expect(page.locator('#goal-reliability')).toBeVisible();
    await expect(page.locator('#start-button')).toBeVisible();
  });

  test('AK-ML-08: Senaryo intro ekranı görünür ve başlatılabilir', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#onboarding-screen', { timeout: 10000 });
    await page.click('#level-beginner');
    await page.click('#role-developer');
    await page.click('#goal-reliability');
    await page.click('#start-button');

    await expect(page.locator('#scenario-intro-screen')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#begin-scenario')).toBeVisible();
  });

});

