// ===== NexusPrimer — Cypress Custom Commands =====

// Onboarding'i hızlıca tamamlayan yardımcı komut
Cypress.Commands.add('completeOnboarding', (level = 'beginner', role = 'developer', goal = 'reliability') => {
  cy.get(`#level-${level}`).click();
  cy.get(`#role-${role}`).click();
  cy.get(`#goal-${goal}`).click();
  cy.get('#start-button').click();
});

// Senaryo introyu geç
Cypress.Commands.add('startScenario', () => {
  cy.get('#begin-scenario').click();
});

// Onboarding + intro'yu atlayarak doğrudan karar ekranına git
Cypress.Commands.add('goToDecision', (level = 'beginner', role = 'developer', goal = 'reliability') => {
  cy.completeOnboarding(level, role, goal);
  cy.get('#begin-scenario').click();
});

// Karar ver (A veya B)
Cypress.Commands.add('makeDecision', (decisionId: number, choice: 'A' | 'B') => {
  cy.get(`#decision-${decisionId}-option-${choice}`).click();
});

// Outcome modal'ı kapat
Cypress.Commands.add('continueFromOutcome', () => {
  cy.get('#outcome-modal').should('be.visible');
  cy.get('#outcome-continue').click();
});

// Tüm 3 kararı ver ve outcome'ları geç
Cypress.Commands.add('makeAllDecisions', (choices: ['A' | 'B', 'A' | 'B', 'A' | 'B']) => {
  cy.makeDecision(1, choices[0]);
  cy.continueFromOutcome();
  cy.makeDecision(2, choices[1]);
  cy.continueFromOutcome();
  cy.makeDecision(3, choices[2]);
  cy.continueFromOutcome();
});

declare global {
  namespace Cypress {
    interface Chainable {
      completeOnboarding(level?: string, role?: string, goal?: string): Chainable<void>;
      startScenario(): Chainable<void>;
      goToDecision(level?: string, role?: string, goal?: string): Chainable<void>;
      makeDecision(decisionId: number, choice: 'A' | 'B'): Chainable<void>;
      continueFromOutcome(): Chainable<void>;
      makeAllDecisions(choices: ['A' | 'B', 'A' | 'B', 'A' | 'B']): Chainable<void>;
    }
  }
}

export {};

