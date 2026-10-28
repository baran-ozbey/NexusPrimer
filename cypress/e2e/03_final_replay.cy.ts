// ===== NexusPrimer — AK-04 & AK-05: Final Ekranı ve Yeniden Oynama =====

describe('AK-04 — Final Ekranı: Tüm Yollar', () => {
  const BASE = '/';

  // Yardımcı: tam akışı tamamla
  function runFullFlow(choices: ['A' | 'B', 'A' | 'B', 'A' | 'B']) {
    cy.visit(BASE);
    cy.goToDecision('beginner', 'developer', 'reliability');
    cy.makeAllDecisions(choices);
  }

  it('AAA → FINAL_A (Başarılı Sonuç)', () => {
    runFullFlow(['A', 'A', 'A']);
    cy.get('#final-title').should('contain', 'Başarılı');
    cy.get('#final-screen').should('be.visible');
    cy.get('#final-summary').should('be.visible');
    cy.get('#final-decisions').should('be.visible');
  });

  it('ABA → FINAL_A (puan=2, KVKK yok)', () => {
    runFullFlow(['A', 'B', 'A']);
    cy.get('#final-title').should('contain', 'Başarılı');
  });

  it('BAA → FINAL_A (puan=2, KVKK yok)', () => {
    runFullFlow(['B', 'A', 'A']);
    cy.get('#final-title').should('contain', 'Başarılı');
  });

  it('BBA → FINAL_B (puan=1, KVKK yok)', () => {
    runFullFlow(['B', 'B', 'A']);
    cy.get('#final-title').should('contain', 'Olumsuz');
  });

  it('AAB → FINAL_B (KVKK ihlali)', () => {
    runFullFlow(['A', 'A', 'B']);
    cy.get('#final-title').should('contain', 'Olumsuz');
  });

  it('ABB → FINAL_B (KVKK ihlali)', () => {
    runFullFlow(['A', 'B', 'B']);
    cy.get('#final-title').should('contain', 'Olumsuz');
  });

  it('BAB → FINAL_B (KVKK ihlali)', () => {
    runFullFlow(['B', 'A', 'B']);
    cy.get('#final-title').should('contain', 'Olumsuz');
  });

  it('BBB → FINAL_B (puan=0, KVKK ihlali)', () => {
    runFullFlow(['B', 'B', 'B']);
    cy.get('#final-title').should('contain', 'Olumsuz');
  });

  it('AK-04: Final ekranında 3 kararın özeti gösterilir', () => {
    runFullFlow(['A', 'A', 'A']);
    cy.get('#final-decision-1').should('be.visible');
    cy.get('#final-decision-2').should('be.visible');
    cy.get('#final-decision-3').should('be.visible');
  });

  it('AK-04: Final ekranında güçlü yönler veya geliştirme alanları gösterilir', () => {
    runFullFlow(['A', 'A', 'A']);
    cy.get('#final-feedback').should('be.visible');
  });

  it('Final saati gösterilir', () => {
    runFullFlow(['A', 'A', 'A']);
    cy.get('#final-screen').should('contain', '08:25');
  });
});

describe('AK-05 — Yeniden Oynama', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.goToDecision('beginner', 'developer', 'reliability');
    cy.makeAllDecisions(['A', 'A', 'A']);
    cy.get('#final-screen').should('be.visible');
  });

  it('AK-05: "Tekrar Oyna" butonu onboarding\'e döndürür', () => {
    cy.get('#replay-button').click();
    cy.get('#onboarding-screen').should('be.visible');
  });

  it('AK-05: Yeniden oynayınca önceki kararlar sıfırlanır', () => {
    cy.get('#replay-button').click();
    cy.get('#onboarding-screen').should('be.visible');
    // Yeni profil seçilebilir
    cy.get('#level-experienced').click();
    cy.get('#level-experienced').should('have.class', 'onboarding__option--selected');
  });
});

