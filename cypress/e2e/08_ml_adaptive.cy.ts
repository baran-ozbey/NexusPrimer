// ===== NexusPrimer 2.0 — Makine Öğrenmesi & Veri Toplama E2E Testleri =====

describe('NexusPrimer 2.0 — Adaptive Machine Learning & Data Collection', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.completeOnboarding({
      level: 'beginner',
      role: 'developer',
      goal: 'reliability',
    });
    cy.get('#scenario-intro-screen').should('be.visible');
    cy.get('#begin-scenario').click();
  });

  it('AK-ML-01: Karar ekranında ONNX modeli yüklenir ve tahmin olasılığı gösterilir', () => {
    cy.get('#decision-screen').should('be.visible');
    // Model badge ve olasılık seçicisi kontrolü
    cy.get('[data-cy="ml-badge"]').should('be.visible');
    cy.get('[data-cy="p"]')
      .should('be.visible')
      .invoke('text')
      .then((val) => {
        const p = parseFloat(val);
        expect(p).to.be.within(0, 1);
      });
  });

  it('AK-ML-02: Tutor modu ONNX tahminine göre dinamik olarak belirlenir', () => {
    cy.get('#decision-screen').should('be.visible');
    cy.get('[data-cy="tutor-mode"]')
      .should('be.visible')
      .invoke('text')
      .should('match', /MOD: (DESTEK|MEYDAN OKUMA)/);
  });

  it('AK-ML-03: Tutor yanıtında ONNX adaptif ön eki ve pedagojik yönlendirme yer alır', () => {
    cy.get('#decision-screen').should('be.visible');
    cy.get('#tutor-input').type('Bu kararı nasıl vermeliyim?');
    cy.get('#tutor-send').click();

    // Tutor mesajlarında ONNX ibaresi yer almalıdır
    cy.get('.tutor-msg--tutor').last().should('contain.text', 'ONNX');
  });

  it('AK-ML-04: Veri toplama paneli açılır, oturum ID ve sayaçlar görünür', () => {
    cy.get('[data-cy="dc-toggle"]').click();
    cy.get('[data-cy="dc-panel"]').should('be.visible');
    cy.get('[data-cy="session-id"]').should('contain.text', 'oturum-');
    cy.get('[data-cy="dc-row-count"]').should('be.visible');
  });

  it('AK-ML-05: 3 karar tamamlandığında CSV dışa aktarma butonu aktifleşir', () => {
    // Karar 1
    cy.get('#decision-1-option-A').click();
    cy.get('#outcome-continue').click();

    // Karar 2
    cy.get('#decision-2-option-A').click();
    cy.get('#outcome-continue').click();

    // Karar 3
    cy.get('#decision-3-option-A').click();
    cy.get('#outcome-continue').click();

    // Final ekranında veri toplama paneli kontrolü
    cy.get('#final-screen').should('be.visible');
    cy.get('[data-cy="dc-toggle"]').click();
    cy.get('[data-cy="dc-panel"]').should('be.visible');
    cy.get('[data-cy="dc-gercek-count"]').should('contain.text', '3');
    cy.get('[data-cy="dc-export-btn"]').should('not.be.disabled');
  });
});

