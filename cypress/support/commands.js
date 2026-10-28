// ===== NexusPrimer — Cypress Custom Commands (JS) =====

Cypress.Commands.add('completeOnboarding', (level = 'beginner', role = 'developer', goal = 'reliability') => {
  cy.get(`#level-${level}`).click();
  cy.get(`#role-${role}`).click();
  cy.get(`#goal-${goal}`).click();
  cy.get('#start-button').click();
});

Cypress.Commands.add('startScenario', () => {
  cy.get('#begin-scenario').click();
});

Cypress.Commands.add('goToDecision', (level = 'beginner', role = 'developer', goal = 'reliability') => {
  cy.completeOnboarding(level, role, goal);
  cy.get('#begin-scenario').click();
});

Cypress.Commands.add('makeDecision', (decisionId, choice) => {
  cy.get(`#decision-${decisionId}-option-${choice}`).click();
});

Cypress.Commands.add('continueFromOutcome', () => {
  cy.get('#outcome-modal').should('be.visible');
  cy.get('#outcome-continue').click();
});

Cypress.Commands.add('makeAllDecisions', (choices) => {
  cy.makeDecision(1, choices[0]);
  cy.continueFromOutcome();
  cy.makeDecision(2, choices[1]);
  cy.continueFromOutcome();
  cy.makeDecision(3, choices[2]);
  cy.continueFromOutcome();
});

