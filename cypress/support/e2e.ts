// ===== NexusPrimer — Cypress E2E Support =====
import './commands';

// sessionStorage'ı her testten önce temizle
beforeEach(() => {
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

