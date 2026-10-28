/* ===== NexusPrimer — Senaryo Verileri ===== */
import type { DecisionData, OutcomeData, UserProfile, Choice } from '../types';

export const SCENARIO_INTRO = {
  title: 'Hastane Randevu Sistemi Krizi',
  time: '08:00',
  description:
    'Saat 08:00. Bir hastanenin randevu sistemi çökmüş durumda. 300 hasta randevuları için bekliyor. Gece boyunca yeni bir yazılım sürümü yayımlanmış ancak sistem şu anda tamamen erişilemez. Sen nöbetçi yazılım mühendisisin ve bu krizi çözmen gerekiyor.',
  systemStatus: 'Çökmüş',
  waitingPatients: 300,
};

export const DECISIONS: DecisionData[] = [
  {
    id: 1,
    title: 'Sistem Mimarisi ve Geri Dönüş',
    scenario:
      'Gece yayımlanan yeni sürüm sonrası sistem tamamen çöktü. Log kayıtlarına göre yeni sürümde veritabanı sorguları zaman aşımına uğruyor. Eski sürüme geri dönme ya da canlı sistem üzerinde hızlı bir yama yapma kararı vermen gerekiyor.',
    context:
      'Dikkat: Yeni sürümde veritabanı şeması değiştirilmiş olabilir. Geri dönüş öncesinde şema uyumluluğunu kontrol etmek kritik önem taşır.',
    options: [
      {
        id: 'A',
        title: 'Eski sürüme geri dönmek',
        description:
          'Önceki kararlı sürüme rollback yapmak. Veritabanı şema uyumluluğunu kontrol ettikten sonra geri dönüş işlemini başlatmak.',
      },
      {
        id: 'B',
        title: 'Canlı sistem üzerinde doğrudan yama yapmak',
        description:
          'Üretim ortamında doğrudan hata ayıklama yaparak sorunu hızlıca çözmek. Daha riskli ancak potansiyel olarak daha hızlı.',
      },
    ],
    clock: '08:00',
    systemStatus: 'Çökmüş',
    waitingPatients: 300,
  },
  {
    id: 2,
    title: 'Test ve Yayına Alma',
    scenario:
      'Sistem kısmen düzeltildi. Ancak yayına almadan önce bir karar daha vermen gerekiyor: düzeltmeyi doğrudan yayına mı alacaksın, yoksa önce kritik testleri mi çalıştıracaksın?',
    context:
      'Hasta randevu verileri kritik öneme sahip. Regresyon testi yapılmadan yayına almak, veri bütünlüğünü riske atabilir. Ancak hastalar beklemeye devam ediyor.',
    options: [
      {
        id: 'A',
        title: 'Önce kısa ve kritik testleri çalıştırmak',
        description:
          'Smoke test ve kritik yol testlerini çalıştırmak. Yaklaşık 10 dakika sürecek ancak veri bütünlüğünü doğrulayacak.',
      },
      {
        id: 'B',
        title: 'Test yapmadan hemen yayına almak',
        description:
          'Zaman baskısı nedeniyle testleri atlayarak düzeltmeyi doğrudan yayına almak. Hastalar daha hızlı hizmet alabilir.',
      },
    ],
    clock: '08:10',
    systemStatus: 'Kısmi Çalışıyor',
    waitingPatients: 300,
  },
  {
    id: 3,
    title: 'KVKK ve Log Güvenliği',
    scenario:
      'Hata ayıklama sürecinde log dosyalarını inceliyorsun. Loglardan birinde hasta adları açık metin olarak görünüyor: "Hasta: A*** Y***, Randevu ID: 4521". Bu logları ekiple paylaşman gerekiyor.',
    context:
      'KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında kişisel veriler yalnızca gerekli ölçüde ve güvenli yöntemlerle işlenmelidir. Logların ekiple paylaşımı hata ayıklama için önemli, ancak kişisel verilerin korunması yasal zorunluluktur.',
    options: [
      {
        id: 'A',
        title: 'Kişisel verileri maskeleyerek güvenli loglama',
        description:
          'Hasta adlarını, TC kimlik numaralarını ve diğer kişisel verileri maskeleyerek (ör: "Hasta: H***, Randevu ID: 4521") güvenli şekilde paylaşmak.',
      },
      {
        id: 'B',
        title: 'Log dosyasını olduğu gibi ekibe göndermek',
        description:
          'Zaman baskısı nedeniyle log dosyasını herhangi bir düzenleme yapmadan doğrudan ekiple paylaşmak.',
      },
    ],
    clock: '08:18',
    systemStatus: 'Kısmi Çalışıyor',
    waitingPatients: 300,
  },
];

function getOutcomes(
  _profile: UserProfile
): Record<string, OutcomeData> {
  return {
    '1-A': {
      decisionId: 1,
      choice: 'A',
      title: 'Güvenli Geri Dönüş ✅',
      description:
        'Veritabanı şema uyumluluğunu kontrol ettikten sonra eski sürüme başarıyla geri döndün. Sistem 5 dakika içinde tekrar çalışmaya başladı.',
      technicalReason:
        'Rollback stratejisi, veritabanı migration uyumluluğu doğrulandıktan sonra güvenli bir geri dönüş sağlar. Sürüm kontrol sistemi ve CI/CD pipeline bu işlemi destekler. Şema uyumluluğu kontrolü, veri kaybını ve tutarsızlıkları önler.',
      isGood: true,
    },
    '1-B': {
      decisionId: 1,
      choice: 'B',
      title: 'Riskli Canlı Yama ⚠️',
      description:
        'Canlı sistem üzerinde doğrudan yama yapmaya çalıştın. Sorunu kısmen çözdün ancak beklenmeyen yan etkiler oluştu ve debugging süreci uzadı.',
      technicalReason:
        'Canlı sistemde hotfix uygulamak, test edilmemiş değişiklikleri üretim ortamına taşır. Bağımlılık çatışmaları, race condition ve veri tutarsızlıkları riski artar. Kontrollü bir rollback stratejisi genellikle daha güvenlidir.',
      isGood: false,
    },
    '2-A': {
      decisionId: 2,
      choice: 'A',
      title: 'Kritik Testler Başarılı ✅',
      description:
        'Smoke test ve kritik yol testlerini çalıştırdın. Testler 8 dakikada tamamlandı ve bir regresyon hatası yakalandı. Düzeltme sonrası sistem güvenle yayına alındı.',
      technicalReason:
        'Smoke test ve kritik yol testleri, ana iş akışlarındaki regresyon hatalarını yakalar. 10 dakikalık test süresi, potansiyel veri kaybı riskine karşı küçük bir maliyettir. Test piramidinin en üst katmanı olan E2E testler, entegrasyon sorunlarını erken tespit eder.',
      isGood: true,
    },
    '2-B': {
      decisionId: 2,
      choice: 'B',
      title: 'Test Atlandı — Veri Riski ⚠️',
      description:
        'Test yapmadan yayına aldın. Sistem çalışmaya başladı ancak bazı hasta randevuları yanlış doktora atandı. Veri bütünlüğü sorunu sonradan fark edildi.',
      technicalReason:
        'Test atlama, regresyon hatalarının üretim ortamına geçmesine neden olur. Hasta randevu verileri gibi kritik verilerde bütünlük hataları ciddi operasyonel ve hukuki sorunlara yol açabilir. Zaman baskısı altında bile minimum düzeyde smoke test yapılmalıdır.',
      isGood: false,
    },
    '3-A': {
      decisionId: 3,
      choice: 'A',
      title: 'KVKK Uyumlu Güvenli Loglama ✅',
      description:
        'Kişisel verileri maskeleyerek logları güvenli şekilde paylaştın. Ekip hata ayıklamayı maskelenmiş loglarla başarıyla tamamladı.',
      technicalReason:
        'KVKK madde 4 gereği kişisel veriler yalnızca gerekli ölçüde işlenmelidir (veri minimizasyonu). Loglarda kişisel verilerin maskelenmesi, hem yasal uyumu sağlar hem de güvenli hata ayıklama pratiğidir. Maskeleme araçları ve regex tabanlı temizleme yöntemleri bu süreci otomatikleştirebilir.',
      isGood: true,
    },
    '3-B': {
      decisionId: 3,
      choice: 'B',
      title: 'KVKK İhlali — Kişisel Veri Sızıntısı ❌',
      description:
        'Log dosyasını kişisel veriler maskelenmeden paylaştın. Hasta adları ve randevu bilgileri yetkisiz kişilerin erişimine açıldı. Bu durum KVKK kapsamında bir veri ihlali oluşturur.',
      technicalReason:
        'KVKK madde 12 kapsamında veri sorumlusu, kişisel verilerin güvenliğini sağlamak zorundadır. Maskelenmemiş logların paylaşılması veri ihlali sayılır ve 72 saat içinde Kişisel Verileri Koruma Kurulu\'na bildirilmesi gerekir. Olası yaptırımlar arasında idari para cezası ve itibar kaybı yer alır.',
      isGood: false,
    },
  };
}

export function getOutcomeForDecision(
  profile: UserProfile,
  decisionId: 1 | 2 | 3,
  choice: Choice
): OutcomeData {
  const outcomes = getOutcomes(profile);
  const key = `${decisionId}-${choice}`;
  return outcomes[key];
}

export const FINAL_A = {
  title: 'Başarılı Sonuç',
  time: '08:25',
  summary:
    'Saat 08:25. Sistem güvenli biçimde çalışıyor ve hasta verileri korunmuş durumda. Hastalar randevularına sorunsuz devam edebiliyor. Kriz başarıyla yönetildi.',
};

export const FINAL_B = {
  title: 'Olumsuz Sonuç',
  time: '08:25',
  summary:
    'Saat 08:25. Sistem tekrar çalışıyor ancak kriz yönetimi sırasında yapılan bazı kararlar ciddi sonuçlar doğurdu. Kişisel verilerin korunması açısından riskler oluştu veya operasyonel sorunlar yaşandı.',
};



export function getPersonalizedHints(
  profile: UserProfile,
  decisionId: 1 | 2 | 3
): string[] {
  const hints: string[] = [];

  // Seviye bazlı ipuçları
  if (profile.level === 'beginner') {
    if (decisionId === 1) {
      hints.push(
        'Rollback, bir yazılımın önceki kararlı sürümüne geri dönme işlemidir.',
        'Veritabanı şeması değiştiyse, eski sürümün yeni şemayla uyumlu olmayabileceğini unutma.'
      );
    } else if (decisionId === 2) {
      hints.push(
        'Smoke test, yazılımın temel işlevlerinin çalışıp çalışmadığını hızlıca kontrol eden kısa bir testtir.',
        'Regresyon, daha önce düzgün çalışan bir özelliğin yeni bir değişiklik sonrası bozulmasıdır.'
      );
    } else {
      hints.push(
        'KVKK, kişisel verilerin korunmasına ilişkin Türkiye\'deki yasal düzenlemedir.',
        'Veri minimizasyonu, yalnızca gerekli kadar verinin işlenmesi ilkesidir.'
      );
    }
  }

  // Rol bazlı ipuçları
  if (profile.role === 'tester' && decisionId === 2) {
    hints.push('Test piramidinin hangi katmanının bu durumda en uygun olduğunu düşün.');
  } else if (profile.role === 'sysadmin' && decisionId === 1) {
    hints.push('Altyapı seviyesinde blue-green deployment veya canary release gibi stratejiler bu riski nasıl azaltır?');
  } else if (profile.role === 'developer' && decisionId === 1) {
    hints.push('Sürüm kontrol sistemi ve CI/CD pipeline bu geri dönüşü nasıl kolaylaştırabilir?');
  }

  // Hedef bazlı ipuçları
  if (profile.goal === 'privacy' && decisionId === 3) {
    hints.push('KVKK madde 4 ve madde 12\'nin bu durumda nasıl uygulanacağını düşün.');
  } else if (profile.goal === 'reliability' && decisionId === 1) {
    hints.push('Yüksek erişilebilirlik (high availability) tasarımı bu tür kesintileri nasıl önleyebilir?');
  } else if (profile.goal === 'testing' && decisionId === 2) {
    hints.push('Hata ayıklama sürecinde hangi test türlerinin en hızlı geri bildirim vereceğini düşün.');
  }

  return hints;
}
