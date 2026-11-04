// ===== NexusPrimer 2.0 — ONNX Web Runtime ML Servisi =====
// src/services/mlModel.ts
//
// Bu servis tarayıcıda onnxruntime-web kullanarak ipucu_gerekli tahminini yapar.
// Model yüklenemezse güvenli fallback davranışı devreye girer.

export interface BehaviorFeatures {
  karar_suresi_sn: number;
  onceki_yanlis_sayisi: number;
  ipucu_sayisi: number;
  karar_degistirme_sayisi: number;
  sahne_no: number;
  seviye: number; // 0=beginner/intermediate, 1=experienced
  onceki_karar_suresi: number;
  kararsizlik_suresi: number;
}

export interface MLPrediction {
  ipucu_gerekli: boolean;    // Model tahmini
  olasilik: number;          // P(ipucu_gerekli=1) [0-1]
  confidence: 'high' | 'medium' | 'low'; // Güven düzeyi
  source: 'onnx' | 'fallback'; // Tahmin kaynağı
}

// Özellik sırası — config.json ile birebir eşleşmeli
const FEATURE_ORDER = [
  'karar_suresi_sn',
  'onceki_yanlis_sayisi',
  'ipucu_sayisi',
  'karar_degistirme_sayisi',
  'sahne_no',
  'seviye',
  'onceki_karar_suresi',
  'kararsizlik_suresi',
] as const;

// Model URL — Hugging Face'e yayınlandıktan sonra commit SHA ile sabitlenecek
// Şu an: yerel public/ dizininden yükle
const MODEL_URL = '/model/model.onnx';

let session: unknown = null;
let modelLoadAttempted = false;
let modelLoadFailed = false;

/**
 * ONNX modelini bir kez yükle (lazy singleton).
 * Yüklenemezse null döndürür — uygulama fallback kullanır.
 */
async function loadModel(): Promise<unknown> {
  if (session) return session;
  if (modelLoadFailed) return null;
  if (modelLoadAttempted) return null;

  modelLoadAttempted = true;

  try {
    // onnxruntime-web dinamik import
    const ort = await import('onnxruntime-web');
    const sess = await ort.InferenceSession.create(MODEL_URL);
    session = sess;
    console.log('[ML] ONNX modeli başarıyla yüklendi:', MODEL_URL);
    return sess;
  } catch (err) {
    modelLoadFailed = true;
    console.warn('[ML] ONNX modeli yüklenemedi, fallback aktif:', err);
    return null;
  }
}

/**
 * Fallback tahmin — model yüklenemediğinde kural tabanlı tahmin.
 * Bu ONNX modelinin yerini TUTMAZ, sadece crash önler.
 */
function fallbackPredict(features: BehaviorFeatures): MLPrediction {
  const score =
    (features.ipucu_sayisi >= 2 ? 1 : 0) +
    (features.karar_suresi_sn >= 30 ? 1 : 0) +
    (features.karar_degistirme_sayisi >= 2 ? 1 : 0);

  const olasilik = Math.min(0.3 + score * 0.25, 0.95);
  return {
    ipucu_gerekli: score >= 2,
    olasilik,
    confidence: 'low',
    source: 'fallback',
  };
}

/**
 * Ana tahmin fonksiyonu.
 * ONNX modeliyle gerçek çıkarım yapar.
 * Model yoksa fallback.
 */
export async function predictHintNeed(features: BehaviorFeatures): Promise<MLPrediction> {
  const sess = await loadModel();

  if (!sess) {
    return fallbackPredict(features);
  }

  try {
    const ort = await import('onnxruntime-web');

    // Özellik vektörünü doğru sırada oluştur
    const featureVector = Float32Array.from(
      FEATURE_ORDER.map((key) => features[key])
    );
    const tensor = new ort.Tensor('float32', featureVector, [1, FEATURE_ORDER.length]);

    // Çıkarım
    const typedSess = sess as { run: (inputs: Record<string, unknown>) => Promise<Record<string, { data: Float32Array | number[] }>> };
    const feeds: Record<string, unknown> = { float_input: tensor };
    const results = await typedSess.run(feeds);

    // Olasılık çıktısı (output[1] = probabilities)
    const probKey = Object.keys(results).find((k) => k.includes('prob') || k.includes('output_1')) ?? Object.keys(results)[1];
    const probData = results[probKey]?.data;
    const p1 = Array.isArray(probData) ? probData[1] : (probData as Float32Array)?.[1];

    const olasilik = typeof p1 === 'number' ? p1 : 0.5;

    const confidence: MLPrediction['confidence'] =
      olasilik > 0.75 || olasilik < 0.25 ? 'high' :
      olasilik > 0.60 || olasilik < 0.40 ? 'medium' : 'low';

    return {
      ipucu_gerekli: olasilik >= 0.5,
      olasilik,
      confidence,
      source: 'onnx',
    };
  } catch (err) {
    console.warn('[ML] ONNX çıkarımı başarısız, fallback:', err);
    return fallbackPredict(features);
  }
}

/** Model yükleme durumunu sorgula */
export function getModelStatus(): 'loaded' | 'loading' | 'failed' | 'not_started' {
  if (session) return 'loaded';
  if (modelLoadFailed) return 'failed';
  if (modelLoadAttempted) return 'loading';
  return 'not_started';
}

/** Önden model yükle (uygulama başlangıcında çağrılabilir) */
export function preloadModel(): void {
  loadModel();
}

