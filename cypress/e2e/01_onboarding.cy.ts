// ===== NexusPrimer — AK-01 & AK-07: Kişiselleştirme Testleri =====

describe('AK-01 & AK-07 — Kişiselleştirme (Onboarding)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('AK-07: Eksik giriş → hata mesajı gösterilir, senaryoya geçilemez', () => {
    // Hiçbir şey seçmeden başla
    cy.get('#start-button').click();
    cy.get('#onboarding-error').should('be.visible');
    cy.get('#onboarding-screen').should('exist'); // hâlâ onboarding'de
  });

  it('AK-07: Yalnızca 1 soru cevaplanmış → hata gösterilir', () => {
    cy.get('#level-beginner').click();
    cy.get('#start-button').click();
    cy.get('#onboarding-error').should('be.visible');
    cy.get('#onboarding-screen').should('exist');
  });

  it('AK-07: 2 soru cevaplanmış → hata gösterilir', () => {
    cy.get('#level-intermediate').click();
    cy.get('#role-tester').click();
    cy.get('#start-button').click();
    cy.get('#onboarding-error').should('be.visible');
  });

  it('AK-01: 3 soruyu cevaplayınca senaryo giriş ekranı açılır', () => {
    cy.completeOnboarding('beginner', 'developer', 'reliability');
    cy.get('#scenario-intro-screen').should('exist');
    cy.get('#status-bar').should('be.visible');
  });

  it('AK-01: Yeni başlayan seçince senaryo-intro gösterilir', () => {
    cy.completeOnboarding('beginner', 'developer', 'reliability');
    cy.get('#scenario-intro-screen').should('be.visible');
    cy.get('#begin-scenario').should('be.visible');
  });

  it('Orta seviye: senaryo-intro gösterilir', () => {
    cy.completeOnboarding('intermediate', 'tester', 'testing');
    cy.get('#scenario-intro-screen').should('be.visible');
  });

  it('Deneyimli: senaryo-intro gösterilir', () => {
    cy.completeOnboarding('experienced', 'sysadmin', 'privacy');
    cy.get('#scenario-intro-screen').should('be.visible');
  });

  it('Seçili buton görsel olarak işaretlenir', () => {
    cy.get('#level-beginner').click();
    cy.get('#level-beginner').should('have.class', 'onboarding__option--selected');
    cy.get('#level-intermediate').should('not.have.class', 'onboarding__option--selected');
  });

  it('Disclaimer metni görünür', () => {
    cy.get('#disclaimer').should('be.visible').and('contain', 'eğitim amaçlı');
  });
});

