// ===== NexusPrimer — AK-10: Sayfa Yenileme Dayanıklılığı =====

describe('AK-10 — sessionStorage Kalıcılığı', () => {

  it('AK-10: Karar 2 ekranında sayfa yenilenince Karar 2 geri yüklenir', () => {
    cy.visit('/');
    cy.goToDecision('beginner', 'developer', 'reliability');
    cy.makeDecision(1, 'A');
    cy.continueFromOutcome();

    // Karar 2 ekranındayız
    cy.get('#decision-2-option-A').should('be.visible');

    // Sayfayı yenile
    cy.reload();

    // Hâlâ Karar 2 ekranında olmalıyız
    cy.get('#decision-screen').should('be.visible');
    cy.get('#decision-2-option-A').should('be.visible');
  });

  it('Onboarding tamamlanmışsa sayfa yenilenince senaryo devam eder', () => {
    cy.visit('/');
    cy.completeOnboarding('beginner', 'developer', 'reliability');
    cy.reload();
    // Senaryo intro veya önceki ekrana dönmeli (onboarding değil)
    cy.get('#onboarding-screen').should('not.exist');
  });

  it('Karar 3 ekranında sayfa yenilenince Karar 3 geri yüklenir', () => {
    cy.visit('/');
    cy.goToDecision('beginner', 'developer', 'reliability');
    cy.makeDecision(1, 'A');
    cy.continueFromOutcome();
    cy.makeDecision(2, 'A');
    cy.continueFromOutcome();

    // Karar 3 ekranındayız
    cy.get('#decision-3-option-A').should('be.visible');

    cy.reload();

    cy.get('#decision-screen').should('be.visible');
    cy.get('#decision-3-option-A').should('be.visible');
  });

  it('Final ekranında sayfa yenilenince final geri yüklenir', () => {
    cy.visit('/');
    cy.goToDecision('beginner', 'developer', 'reliability');
    cy.makeAllDecisions(['A', 'A', 'A']);

    cy.get('#final-screen').should('be.visible');

    cy.reload();

    cy.get('#final-screen').should('be.visible');
    cy.get('#final-title').should('contain', 'Başarılı');
  });
});

