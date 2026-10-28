// ===== NexusPrimer — Cypress E2E Support (JS) =====
require('./commands.js');

beforeEach(() => {
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

