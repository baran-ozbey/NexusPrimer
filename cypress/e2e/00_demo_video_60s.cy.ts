// ===== NexusPrimer — 60 Saniyelik Kapsamlı Showcase Demo Videosu =====

describe('NexusPrimer — 60 Saniyelik Kriz Simülasyonu Demosu', () => {
  it('Baştan Sona Kriz Simülasyonu ve Karar Süreci (60s Demo)', () => {
    // 1. Onboarding & Kişiselleştirme Ekranı
    cy.visit('/');
    cy.wait(2000); // Karşılama ve boot metinlerini göster
    
    // Seviye Seçimi
    cy.get('#level-beginner').click();
    cy.wait(1000);
    
    // Rol Seçimi
    cy.get('#role-developer').click();
    cy.wait(1000);
    
    // Hedef Seçimi
    cy.get('#goal-reliability').click();
    cy.wait(1500);
    
    // Simülasyonu Başlat
    cy.get('#start-button').click();
    cy.wait(2000);

    // 2. Kriz Alarmı & Senaryo Tanıtımı
    cy.get('#scenario-intro-screen').should('be.visible');
    cy.wait(3500); // Kriz saati, yanıp sönen alarm ve hasta sayısını göster
    cy.get('#begin-scenario').click();
    cy.wait(2000);

    // 3. Karar 1: Sistem Mimarisi & Geri Dönüş
    cy.get('#decision-screen').should('be.visible');
    cy.wait(2000);
    
    // AI Tutor ile Sokratik Etkileşim
    cy.get('#tutor-input').type('Rollback yapmadan önce ne kontrol etmeliyim?');
    cy.wait(1000);
    cy.get('#tutor-send').click();
    cy.wait(3500); // Tutor yanıtını incele
    
    // Karar 1 Seçimini Yap (A: Rollback)
    cy.get('#decision-1-option-A').click();
    cy.wait(2500); // Outcome Modal'daki teknik gerekçeyi göster
    cy.get('#outcome-continue').click();
    cy.wait(2000);

    // 4. Karar 2: Test ve Yayına Alma
    cy.get('#decision-screen').should('be.visible');
    cy.wait(2500);
    cy.get('#decision-2-option-A').click();
    cy.wait(2500); // Test sonucu modalı
    cy.get('#outcome-continue').click();
    cy.wait(2000);

    // 5. Karar 3: KVKK ve Log Güvenliği
    cy.get('#decision-screen').should('be.visible');
    cy.wait(2500);
    cy.get('#decision-3-option-A').click();
    cy.wait(2500); // KVKK başarı modalı
    cy.get('#outcome-continue').click();
    cy.wait(2000);

    // 6. Final Ekranı & Öğrenme Raporu
    cy.get('#final-screen').should('be.visible');
    cy.get('#final-title').should('contain', 'Başarılı');
    cy.wait(3000); // 3/3 Karar skoru ve özet
    cy.scrollTo('bottom', { duration: 1500 });
    cy.wait(3000); // Güçlü yönler ve geri bildirimler
    cy.scrollTo('top', { duration: 1000 });
    cy.wait(2000);
  });
});

