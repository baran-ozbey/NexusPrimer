// ===== NexusPrimer — AK-11: Mobil Uyumluluk & Erişilebilirlik =====

describe('AK-11 — Mobil Uyumluluk (375px)', () => {
  beforeEach(() => {
    cy.viewport(375, 812); // iPhone X boyutu
    cy.visit('/');
  });

  it('AK-11: Onboarding 375px\'de düzgün görünür', () => {
    cy.get('#onboarding-screen').should('be.visible');
    cy.get('#start-button').should('be.visible');
  });

  it('AK-11: Seçenek butonları 375px\'de görünür ve tıklanabilir', () => {
    cy.get('#level-beginner').should('be.visible').click();
    cy.get('#role-developer').should('be.visible').click();
    cy.get('#goal-reliability').should('be.visible').click();
    cy.get('#start-button').click();
    cy.get('#scenario-intro-screen').should('be.visible');
  });

  it('AK-11: Karar ekranı 375px\'de kullanılabilir', () => {
    cy.completeOnboarding('beginner', 'developer', 'reliability');
    cy.get('#begin-scenario').click();
    cy.get('#decision-1-option-A').should('be.visible');
    cy.get('#decision-1-option-B').should('be.visible');
    cy.get('#tutor-panel').should('be.visible');
  });

  it('AK-11: Tüm akış 375px\'de tamamlanabilir', () => {
    cy.completeOnboarding('beginner', 'developer', 'reliability');
    cy.get('#begin-scenario').click();
    cy.makeAllDecisions(['A', 'A', 'A']);
    cy.get('#final-screen').should('be.visible');
    cy.get('#replay-button').should('be.visible');
  });

  it('Status bar 375px\'de görünür', () => {
    cy.completeOnboarding('beginner', 'developer', 'reliability');
    cy.get('#begin-scenario').click();
    cy.get('#status-bar').should('be.visible');
  });
});

describe('Erişilebilirlik', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Onboarding radio group\'ları aria-labelledby\'ye sahip', () => {
    cy.get('[aria-labelledby="level-label"]').should('exist');
    cy.get('[aria-labelledby="role-label"]').should('exist');
    cy.get('[aria-labelledby="goal-label"]').should('exist');
  });

  it('Seçenek butonları aria-checked özelliğine sahip', () => {
    cy.get('#level-beginner').should('have.attr', 'aria-checked', 'false');
    cy.get('#level-beginner').click();
    cy.get('#level-beginner').should('have.attr', 'aria-checked', 'true');
  });

  it('Hata mesajı role="alert" ile işaretli', () => {
    cy.get('#start-button').click();
    cy.get('#onboarding-error').should('have.attr', 'role', 'alert');
  });

  it('Tutor paneli role="complementary" ile işaretli', () => {
    cy.goToDecision('beginner', 'developer', 'reliability');
    cy.get('#tutor-panel').should('have.attr', 'role', 'complementary');
  });

  it('Outcome modal aria-modal ile işaretli', () => {
    cy.goToDecision('beginner', 'developer', 'reliability');
    cy.makeDecision(1, 'A');
    cy.get('#outcome-modal').should('have.attr', 'aria-modal', 'true');
  });

  it('Timer role="timer" ile işaretli (deneyimli)', () => {
    cy.goToDecision('experienced', 'developer', 'reliability');
    cy.get('#timer').should('have.attr', 'role', 'timer');
  });

  it('Progress bar role="progressbar" ile işaretli', () => {
    cy.goToDecision('beginner', 'developer', 'reliability');
    cy.get('#progress-bar').should('have.attr', 'role', 'progressbar');
  });
});

