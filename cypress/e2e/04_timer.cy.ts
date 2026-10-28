// ===== NexusPrimer — AK-06: Deneyimli Kullanıcı Zamanlayıcısı =====

describe('AK-06 — Deneyimli Kullanıcı: 60 Saniyelik Zamanlayıcı', () => {
  beforeEach(() => {
    cy.visit('/');
    // Deneyimli kullanıcı → zamanlayıcı aktif olmalı
    cy.goToDecision('experienced', 'developer', 'reliability');
  });

  it('Deneyimli kullanıcıda timer görünür', () => {
    cy.get('#timer').should('be.visible');
  });

  it('Timer değeri görünür ve sayısal', () => {
    cy.get('#timer-value').should('be.visible').invoke('text').then((text) => {
      const val = parseInt(text.trim(), 10);
      expect(val).to.be.gte(1).and.lte(60);
    });
  });

  it('AK-06: Süre dolunca riskli seçenek (B) otomatik seçilir → outcome modal açılır', () => {
    // Saati hızlandır: 60 saniyeyi geç
    cy.clock();
    cy.visit('/');
    cy.clock();
    cy.goToDecision('experienced', 'developer', 'reliability');
    cy.tick(61000); // 61 saniye ileri
    cy.get('#outcome-modal').should('be.visible');
    // Riskli seçenek seçildiği için outcome riskli olmalı
    cy.get('#outcome-modal').should('contain', 'Riskli');
  });

  it('Yeni başlayan kullanıcıda timer görünmez', () => {
    cy.visit('/');
    cy.goToDecision('beginner', 'developer', 'reliability');
    cy.get('#timer').should('not.exist');
  });

  it('Orta seviyede timer görünmez', () => {
    cy.visit('/');
    cy.goToDecision('intermediate', 'tester', 'testing');
    cy.get('#timer').should('not.exist');
  });

  it('Karar yapılırsa timer durur (outcome açılır)', () => {
    cy.get('#decision-1-option-A').click();
    cy.get('#outcome-modal').should('be.visible');
    // Timer artık gözükmemeli (outcome üstünde)
    cy.get('#outcome-continue').click();
    // Sonraki kararda yeni timer başlar
    cy.get('#timer').should('be.visible');
    cy.get('#timer-value').invoke('text').then((text) => {
      const val = parseInt(text.trim(), 10);
      expect(val).to.be.gte(50); // taze başlamış olmalı
    });
  });
});

