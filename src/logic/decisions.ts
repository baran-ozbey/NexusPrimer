/* ===== NexusPrimer — Karar ve Final Hesaplama Mantığı ===== */
import type { Decision, FinalResult, Choice, UserProfile } from '../types';
import { getOutcomeForDecision, FINAL_A, FINAL_B } from '../data/scenario';
import type { OutcomeData, FinalData } from '../types';

/**
 * Bir kararın "iyi" (güvenli) seçenek olup olmadığını belirler.
 * Her karar için A seçeneği güvenli seçenektir.
 */
export function isGoodChoice(choice: Choice): boolean {
  return choice === 'A';
}

/**
 * Kararların toplam puanını hesaplar.
 * Her güvenli karar (A) = 1 puan.
 */
export function calculateScore(decisions: Decision[]): number {
  return decisions.reduce((score, d) => score + (isGoodChoice(d.choice) ? 1 : 0), 0);
}

/**
 * KVKK ihlali olup olmadığını kontrol eder.
 * Karar 3'te B seçilmişse KVKK ihlali vardır.
 */
export function hasKvkkViolation(decisions: Decision[]): boolean {
  const decision3 = decisions.find((d) => d.id === 3);
  return decision3 ? decision3.choice === 'B' : false;
}

/**
 * Final sonucunu belirler.
 * Kurallar:
 * 1. KVKK ihlali varsa (Karar 3 = B) → FINAL_B (diğer kararlardan bağımsız)
 * 2. Toplam puan >= 2 → FINAL_A
 * 3. Toplam puan < 2 → FINAL_B
 */
export function calculateFinal(decisions: Decision[]): FinalResult {
  if (hasKvkkViolation(decisions)) {
    return 'FINAL_B';
  }
  const score = calculateScore(decisions);
  return score >= 2 ? 'FINAL_A' : 'FINAL_B';
}

/**
 * Final ekranı için tam veri setini oluşturur.
 */
export function buildFinalData(decisions: Decision[], profile: UserProfile): FinalData {
  const result = calculateFinal(decisions);
  const finalInfo = result === 'FINAL_A' ? FINAL_A : FINAL_B;

  const outcomes: OutcomeData[] = decisions.map((d) =>
    getOutcomeForDecision(profile, d.id, d.choice)
  );

  const strengths: string[] = [];
  const improvements: string[] = [];

  // Karar 1 analizi
  if (isGoodChoice(decisions[0]?.choice)) {
    strengths.push('Kontrollü geri dönüş stratejisi uyguladın — veritabanı şema uyumluluğunu kontrol etmek doğru bir mühendislik pratiğidir.');
  } else {
    improvements.push('Canlı sistemde doğrudan yama risklidir. Rollback stratejileri ve sürüm kontrol pratiklerini incele.');
  }

  // Karar 2 analizi
  if (isGoodChoice(decisions[1]?.choice)) {
    strengths.push('Test yapmadan yayına almamayı seçtin — bu kalite güvencesi bilincini gösterir.');
  } else {
    improvements.push('Zaman baskısı altında bile minimum smoke test yapmak önemlidir. Test piramidi ve regresyon testi kavramlarını gözden geçir.');
  }

  // Karar 3 analizi
  if (isGoodChoice(decisions[2]?.choice)) {
    strengths.push('Kişisel verileri maskeleyerek KVKK uyumunu sağladın — veri güvenliği bilinci güçlü.');
  } else {
    improvements.push('Kişisel verilerin maskelenmeden paylaşılması KVKK ihlalidir. Veri minimizasyonu ve güvenli loglama pratiklerini öğren.');
  }

  // Zaman aşımı analizi
  const timedOutDecisions = decisions.filter((d) => d.timedOut);
  if (timedOutDecisions.length > 0) {
    improvements.push(`${timedOutDecisions.length} kararda süre doldu. Zaman baskısı altında hızlı değerlendirme yapabilme becerisini geliştir.`);
  }

  return {
    result,
    title: finalInfo.title,
    time: finalInfo.time,
    summary: finalInfo.summary,
    decisions: outcomes,
    strengths,
    improvements,
  };
}
