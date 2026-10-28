/* ===== NexusPrimer — AI Tutor (Simülasyon) ===== */
/*
 * ÖNEMLİ: Bu bir simülasyondur. Gerçek bir LLM API'si kullanılmamaktadır.
 * Tutor yanıtları kural tabanlı bir sistemle oluşturulmaktadır.
 * Gerçek bir LLM entegrasyonu için API anahtarları sunucu tarafında tutulmalıdır.
 */

import type { TutorResponse, UserProfile } from '../types';

// ===== JSON Schema Tanımı =====
export const TUTOR_RESPONSE_SCHEMA = {
  type: 'object',
  required: ['message', 'hint_level', 'answer_revealed', 'reasoning_question', 'status'],
  properties: {
    message: { type: 'string', minLength: 1, maxLength: 500 },
    hint_level: { type: 'integer', minimum: 1, maximum: 3 },
    answer_revealed: { type: 'boolean' },
    reasoning_question: { type: 'string', maxLength: 300 },
    status: { type: 'string', enum: ['success', 'fallback', 'injection_blocked'] },
  },
} as const;

// ===== Prompt injection detection =====
const INJECTION_PATTERNS = [
  /yok\s*say/i,
  /ignore/i,
  /önceki\s*talimat/i,
  /previous\s*instruction/i,
  /gizli\s*talimat/i,
  /secret\s*instruction/i,
  /system\s*prompt/i,
  /sistem\s*talimat/i,
  /doğru\s*cevab[ıi]\s*(söyle|ver|açıkla)/i,
  /tell\s*me\s*the\s*(correct|right)\s*answer/i,
  /reveal/i,
  /jailbreak/i,
  /DAN/i,
  /roleplay\s*as/i,
  /act\s*as\s*if/i,
  /forget\s*everything/i,
  /her\s*şeyi\s*unut/i,
  /admin\s*mode/i,
  /override/i,
];

export function detectPromptInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

// ===== Doğrudan cevap isteme tespiti =====
const DIRECT_ANSWER_PATTERNS = [
  /doğru\s*(cevap|seçenek|şık)/i,
  /hangisi\s*(doğru|iyi|güvenli)/i,
  /(A|B)\s*m[ıiuü]\s*seçmeliyim/i,
  /ne\s*yapmal[ıi]y[ıi]m/i,
  /söyle\s*bana/i,
  /cevab[ıi]\s*(ne|ver|söyle)/i,
  /which\s*(one|option)/i,
  /tell\s*me\s*what\s*to/i,
];

function isDirectAnswerRequest(input: string): boolean {
  return DIRECT_ANSWER_PATTERNS.some((pattern) => pattern.test(input));
}

// ===== Tutor yanıt üretimi =====
const SAFE_INJECTION_RESPONSE: TutorResponse = {
  message:
    'Bu tür bir talebe yanıt veremem. Amacım sana doğru düşünme yollarını göstermek, cevapları doğrudan vermek değil. Senaryo hakkında düşünmeye devam edelim.',
  hint_level: 1,
  answer_revealed: false,
  reasoning_question: 'Şu anki karar hakkında hangi teknik faktörlerin önemli olduğunu düşünüyorsun?',
  status: 'injection_blocked',
};

const FALLBACK_RESPONSE: TutorResponse = {
  message:
    'İlginç bir bakış açısı. Bu kararın teknik sonuçlarını birlikte düşünelim.',
  hint_level: 1,
  answer_revealed: false,
  reasoning_question: 'Bu kararın sistemin güvenilirliği üzerindeki etkisini nasıl değerlendirirsin?',
  status: 'fallback',
};

// Karar bazlı Sokratik sorular
const SOCRATIC_QUESTIONS: Record<string, Record<string, string[]>> = {
  '1': {
    beginner: [
      'Bir yazılımın önceki sürümüne geri dönmek ne anlama gelir, biliyor musun?',
      'Veritabanı şeması değiştiğinde neden geri dönüş sorun yaratabilir?',
      'Hangi bilgilere ihtiyacın var bu kararı güvenle verebilmek için?',
    ],
    intermediate: [
      'Rollback yapmadan önce hangi kontrolleri yapman gerekir?',
      'Canlı yama ile rollback arasındaki risk farkını düşündün mü?',
    ],
    experienced: [
      'Veritabanı migration geçmişi ve şema uyumluluğunu nasıl doğrularsın?',
      'Bu durumda blue-green deployment stratejisi uygulanabilir miydi?',
    ],
  },
  '2': {
    beginner: [
      'Smoke test nedir ve neden önemlidir?',
      'Test yapmadan yayına almanın riskleri neler olabilir?',
      'Hasta verileri gibi kritik bilgilerin bütünlüğünü nasıl koruyabilirsin?',
    ],
    intermediate: [
      'Bu durumda hangi test türü en hızlı geri bildirim verir?',
      'Regresyon riski ile zaman baskısını nasıl dengeleyebilirsin?',
    ],
    experienced: [
      'Test piramidinin bu kriz anında hangi katmanı en uygun?',
      'Canary release ile riski azaltabilir miydin?',
    ],
  },
  '3': {
    beginner: [
      'Kişisel veri nedir ve neden korunmalıdır?',
      'KVKK kapsamında loglarla ilgili sorumlulukların ne olabilir?',
      'Veri maskeleme ne anlama gelir?',
    ],
    intermediate: [
      'Loglardan kişisel verileri çıkarmanın teknik yöntemleri nelerdir?',
      'Veri minimizasyonu ilkesi bu durumda nasıl uygulanır?',
    ],
    experienced: [
      'KVKK madde 12 kapsamında veri sorumlusunun yükümlülükleri nelerdir?',
      'Log yönetim sisteminiz PII filtrelemeyi otomatik olarak yapabilir mi?',
    ],
  },
};

// Karar bazlı genel ipuçları
const GENERAL_HINTS: Record<string, string[]> = {
  '1': [
    'Geri dönüş yapmadan önce kontrol etmen gereken teknik detaylar var.',
    'Her iki seçeneğin de avantajları ve riskleri mevcut — önemli olan bilinçli bir karar vermek.',
    'Şema uyumluluğu, veri tutarlılığı için kritik bir kontrol noktasıdır.',
  ],
  '2': [
    'Zaman baskısı gerçek bir faktör, ancak riskleri de değerlendirmen gerekiyor.',
    'Veri bütünlüğü, özellikle sağlık sistemlerinde kritik öneme sahiptir.',
    'Her test atlandığında, potansiyel bir hatanın canlıya geçme riski artar.',
  ],
  '3': [
    'Kişisel verilerle çalışırken yasal yükümlülüklerini düşün.',
    'Hata ayıklama önemli, ama bunu güvenli bir şekilde yapmak da mümkün.',
    'Maskeleme, veri işlevselliğini korurken kişisel bilgileri gizler.',
  ],
};

function getLevelKey(level: string): string {
  switch (level) {
    case 'beginner':
      return 'beginner';
    case 'intermediate':
      return 'intermediate';
    case 'experienced':
      return 'experienced';
    default:
      return 'beginner';
  }
}

function getHintLevel(level: string): number {
  switch (level) {
    case 'beginner':
      return 3;
    case 'intermediate':
      return 2;
    case 'experienced':
      return 1;
    default:
      return 2;
  }
}

export function generateTutorResponse(
  userInput: string,
  profile: UserProfile,
  currentDecision: number
): TutorResponse {
  // 1. Prompt injection kontrolü
  if (detectPromptInjection(userInput)) {
    return SAFE_INJECTION_RESPONSE;
  }

  // 2. Boş girdi
  if (!userInput || userInput.trim().length === 0) {
    return FALLBACK_RESPONSE;
  }

  const decisionKey = String(currentDecision);
  const levelKey = getLevelKey(profile.level);
  const hintLevel = getHintLevel(profile.level);

  // 3. Doğrudan cevap isteme
  if (isDirectAnswerRequest(userInput)) {
    const questions =
      SOCRATIC_QUESTIONS[decisionKey]?.[levelKey] ?? [];
    const randomQ =
      questions[Math.floor(Math.random() * questions.length)] ??
      'Bu kararı vermeden önce hangi faktörleri değerlendirmen gerektiğini düşün.';

    return {
      message:
        'Doğrudan cevap vermek yerine birlikte düşünelim. Karar verirken tüm faktörleri değerlendirmek önemlidir.',
      hint_level: hintLevel,
      answer_revealed: false,
      reasoning_question: randomQ,
      status: 'success',
    };
  }

  // 4. Normal soru/yorum — Sokratik yanıt
  const questions =
    SOCRATIC_QUESTIONS[decisionKey]?.[levelKey] ?? [];
  const hints = GENERAL_HINTS[decisionKey] ?? [];

  const randomQuestion =
    questions[Math.floor(Math.random() * questions.length)] ??
    'Bu konuyu biraz daha derinlemesine düşünelim.';
  const randomHint =
    hints[Math.floor(Math.random() * hints.length)] ??
    'Her kararın teknik sonuçlarını değerlendir.';

  return {
    message: randomHint,
    hint_level: hintLevel,
    answer_revealed: false,
    reasoning_question: randomQuestion,
    status: 'success',
  };
}

// ===== JSON Schema doğrulaması =====
export function validateTutorResponse(response: unknown): {
  valid: boolean;
  errors: string[];
  sanitized: TutorResponse;
} {
  const errors: string[] = [];

  if (typeof response !== 'object' || response === null) {
    return {
      valid: false,
      errors: ['Yanıt bir obje değil'],
      sanitized: FALLBACK_RESPONSE,
    };
  }

  const r = response as Record<string, unknown>;

  // message kontrolü
  if (typeof r.message !== 'string' || r.message.length === 0) {
    errors.push('message alanı eksik veya geçersiz');
  } else if (r.message.length > 500) {
    errors.push('message 500 karakteri aşıyor');
  }

  // hint_level kontrolü
  if (typeof r.hint_level !== 'number' || r.hint_level < 1 || r.hint_level > 3) {
    errors.push('hint_level 1-3 arasında olmalı');
  }

  // answer_revealed kontrolü
  if (typeof r.answer_revealed !== 'boolean') {
    errors.push('answer_revealed boolean olmalı');
  } else if (r.answer_revealed === true) {
    errors.push('answer_revealed true — cevap ifşa edilmiş olabilir');
  }

  // reasoning_question kontrolü
  if (typeof r.reasoning_question !== 'string') {
    errors.push('reasoning_question eksik');
  } else if (r.reasoning_question.length > 300) {
    errors.push('reasoning_question 300 karakteri aşıyor');
  }

  // status kontrolü
  const validStatuses = ['success', 'fallback', 'injection_blocked'];
  if (typeof r.status !== 'string' || !validStatuses.includes(r.status)) {
    errors.push('status geçersiz');
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      sanitized: FALLBACK_RESPONSE,
    };
  }

  return {
    valid: true,
    errors: [],
    sanitized: r as unknown as TutorResponse,
  };
}
