// ===== NexusPrimer — AK-02: Karar Ekranı ve Sonuç Gösterimi =====

describe('AK-02 — Karar Ekranı ve Seçenek Sonuçları', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.goToDecision('beginner', 'developer', 'reliability');
  });

  it('Karar 1 ekranı görünür — başlık, seçenekler, tutor', () => {
    cy.get('#decision-screen').should('be.visible');
    cy.get('#decision-1-option-A').should('be.visible');
    cy.get('#decision-1-option-B').should('be.visible');
    cy.get('#tutor-panel').should('be.visible');
    cy.get('#progress-bar').should('be.visible');
    cy.get('#status-bar').should('be.visible');
  });

  it('AK-02: Seçenek A seçilince outcome modal açılır — teknik gerekçe görünür', () => {
    cy.makeDecision(1, 'A');
    cy.get('#outcome-modal').should('be.visible');
    // Başarılı sonuç içeriği
    cy.get('#outcome-modal').should('contain', 'Güvenli');
    cy.get('#outcome-continue').should('be.visible');
  });

  it('Seçenek B seçilince outcome modal açılır — riskli sonuç', () => {
    cy.makeDecision(1, 'B');
    cy.get('#outcome-modal').should('be.visible');
    cy.get('#outcome-modal').should('contain', 'Riskli');
  });

  it('Outcome devam butonuna basınca Karar 2 açılır', () => {
    cy.makeDecision(1, 'A');
    cy.continueFromOutcome();
    cy.get('#decision-2-option-A').should('be.visible');
    cy.get('#decision-2-option-B').should('be.visible');
  });

  it('Progress bar Karar 2'de güncellenir', () => {
    cy.makeDecision(1, 'A');
    cy.continueFromOutcome();
    cy.get('#progress-bar').should('be.visible');
  });

  it('Kişiselleştirilmiş ipuçları yeni başlayan için gösterilir', () => {
    cy.get('#personalized-hints').should('be.visible');
  });

  it('Tüm 3 karar tamamlanınca final ekranı açılır', () => {
    cy.makeAllDecisions(['A', 'A', 'A']);
    cy.get('#final-screen').should('be.visible');
  });
});

describe('Karar 2 — Test ve Yayına Alma', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.goToDecision('beginner', 'developer', 'reliability');
    cy.makeDecision(1, 'A');
    cy.continueFromOutcome();
  });

  it('Karar 2 ekranı seçenekleri görünür', () => {
    cy.get('#decision-2-option-A').should('be.visible');
    cy.get('#decision-2-option-B').should('be.visible');
  });

  it('Karar 2 A seçilince başarılı outcome gösterilir', () => {
    cy.makeDecision(2, 'A');
    cy.get('#outcome-modal').should('contain', 'Kritik Testler');
  });

  it('Karar 2 B seçilince riskli outcome gösterilir', () => {
    cy.makeDecision(2, 'B');
    cy.get('#outcome-modal').should('contain', 'Test Atlandı');
  });
});

describe('AK-03 — Karar 3: KVKK ve Log Güvenliği', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.goToDecision('beginner', 'developer', 'reliability');
    cy.makeDecision(1, 'A');
    cy.continueFromOutcome();
    cy.makeDecision(2, 'A');
    cy.continueFromOutcome();
  });

  it('Karar 3 ekranı görünür', () => {
    cy.get('#decision-3-option-A').should('be.visible');
    cy.get('#decision-3-option-B').should('be.visible');
  });

  it('AK-03: Seçenek B (log olduğu gibi) → KVKK ihlal uyarısı gösterilir', () => {
    cy.makeDecision(3, 'B');
    cy.get('#outcome-modal').should('be.visible');
    cy.get('#outcome-modal').should('contain', 'KVKK');
  });

  it('Seçenek A (maskeleme) → güvenli loglama outcome gösterilir', () => {
    cy.makeDecision(3, 'A');
    cy.get('#outcome-modal').should('contain', 'KVKK Uyumlu');
  });
});

