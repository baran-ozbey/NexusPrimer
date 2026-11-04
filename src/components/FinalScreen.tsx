/* ===== NexusPrimer — Final Ekranı ===== */
import { useState } from 'react';
import type { FinalData } from '../types';
import type { SessionRow } from '../hooks/useDataCollection';

interface FinalScreenProps {
  data: FinalData;
  onReplay: () => void;
  sessionRows?: SessionRow[];
}

interface Archetype {
  title: string;
  badge: string;
  color: string;
  desc: string;
  tag: string;
}

function computeArchetype(
  goodCount: number,
  avgTime: number,
  totalChanges: number,
): Archetype {
  if (goodCount === 3 && avgTime <= 18 && totalChanges <= 1) {
    return {
      title: 'Soğukkanlı Sistem Mimarı',
      badge: '🎯',
      color: 'var(--color-success)',
      tag: 'Yüksek Odak · Düşük Tereddüt · Sağlam Kararlar',
      desc: 'Kriz anında minimum tereddütle doğrudan en dayanıklı mimariyi seçtin. Model telemetrisi yüksek güvenirlikli bir karar örüntüsü gösteriyor.',
    };
  }
  if (goodCount >= 2 && avgTime > 18) {
    return {
      title: 'Analitik Dedektif',
      badge: '🔬',
      color: '#38bdf8',
      tag: 'Derin İnceleme · Yüksek Dikkat · Risk Analizi',
      desc: 'Her kararın olası yan etkilerini tarttın, acele etmeden sağlam adımlar attın. Derin düşünme ve düşük hata toleransı senin güçlü yanın.',
    };
  }
  if (totalChanges >= 2) {
    return {
      title: 'Yol Arayan Kaşif',
      badge: '🔄',
      color: 'var(--color-warning)',
      tag: 'Adaptif Düşünce · Sorgulayıcı · Esnek',
      desc: 'Seçenekler arasında gidip gelerek alternatifleri sorguladın. Dinamik adaptasyon ve esnek karar yapısı seni öne çıkarıyor.',
    };
  }
  return {
    title: 'Refleks Mühendisi',
    badge: '⚡',
    color: '#a855f7',
    tag: 'Yüksek Hız · Kriz Refleksi · Çevik',
    desc: 'Hızlı reflekslerle krizi göğüsledin. Yüksek tempo ve sezgisel kararlar kriz yönetiminde belirgin bir güçlü yanın.',
  };
}

export default function FinalScreen({ data, onReplay, sessionRows = [] }: FinalScreenProps) {
  const isSuccess = data.result === 'FINAL_A';
  const [copied, setCopied] = useState(false);

  const goodCount = data.decisions.filter((d) => d.isGood).length;
  const totalCount = data.decisions.length;

  /* Telemetri */
  const avgTime = sessionRows.length > 0
    ? Math.round(
        (sessionRows.reduce((acc, r) => acc + (r.karar_suresi_sn || 0), 0) / sessionRows.length) * 10,
      ) / 10
    : 12.5;
  const totalChanges    = sessionRows.reduce((acc, r) => acc + (r.karar_degistirme_sayisi || 0), 0);
  const totalHints      = sessionRows.reduce((acc, r) => acc + (r.ipucu_sayisi || 0), 0);
  const mlInterventions = sessionRows.filter((r) => r.ipucu_gerekli === 1).length;
  const totalScenes     = Math.max(sessionRows.length, 3);

  const archetype = computeArchetype(goodCount, avgTime, totalChanges);

  const handleShare = async () => {
    const text = [
      `🎮 NexusPrimer — Kriz Yönetimi AI Karar Profilim`,
      `${archetype.badge} Profil: ${archetype.title}`,
      `📊 Karar Skoru: ${goodCount}/${totalCount}`,
      `⏱️ Ort. Karar Süresi: ${avgTime}s  |  🔄 Tereddüt: ${totalChanges}`,
      `🧠 Model: ONNX DecisionTree (baranozbey/nexusprimer-adaptive-model)`,
      ``,
      `Sen kriz anında nasıl karar verirsin?`,
      `Dene: https://baran-ozbey.github.io/NexusPrimer/`,
    ].join('\n');

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      /* sessiz hata */
    }
  };

  return (
    <div className="page-container">
      <div className="final-screen" id="final-screen">

        {/* ── Ana Başlık ── */}
        <div className={`final-header ${isSuccess ? 'final-header--success' : 'final-header--failure'}`}>
          <span className="final-header__icon">{isSuccess ? '✅' : '⚠️'}</span>
          <h1 className="final-header__title" id="final-title">{data.title}</h1>
          <div className="final-header__time">🕐 Saat {data.time}</div>
          <div className="final-score">
            KARAR SKORU:{' '}
            <span className="final-score__value">{goodCount}/{totalCount}</span>
          </div>
        </div>

        <p className="final-summary" id="final-summary">{data.summary}</p>

        {/* ══════════════════════════════════════════
            AI DAVRANIŞ RÖNTGENİ
        ══════════════════════════════════════════ */}
        <div
          className="archetype-card"
          id="ai-archetype-card"
          style={{ '--archetype-color': archetype.color } as React.CSSProperties}
        >
          <div className="archetype-card__inner">

            {/* Üst Etiket Satırı */}
            <div className="archetype-card__header">
              <span className="archetype-card__label">
                🧠 AI Davranış Röntgeni
              </span>
              <span className="archetype-card__model-tag">
                ONNX · DecisionTree · v2.0
              </span>
            </div>

            {/* Arketip Profili */}
            <div className="archetype-card__profile">
              <span className="archetype-card__badge">{archetype.badge}</span>
              <div className="archetype-card__info">
                <h2 className="archetype-card__title">{archetype.title}</h2>
                <div className="archetype-card__tag">{archetype.tag}</div>
              </div>
            </div>

            {/* Açıklama */}
            <p className="archetype-card__desc">{archetype.desc}</p>

            {/* Telemetri İstatistikleri */}
            <div className="archetype-card__stats">
              <div className="archetype-stat">
                <div className="archetype-stat__label">⏱️ Ort. Karar Süresi</div>
                <div className="archetype-stat__value">{avgTime} sn</div>
              </div>
              <div className="archetype-stat">
                <div className="archetype-stat__label">🔄 Tereddüt / Değişim</div>
                <div className="archetype-stat__value">{totalChanges} kez</div>
              </div>
              <div className="archetype-stat">
                <div className="archetype-stat__label">💡 İpucu Talebi</div>
                <div className="archetype-stat__value">{totalHints} adet</div>
              </div>
              <div className="archetype-stat">
                <div className="archetype-stat__label">🤖 ML Müdahale Riski</div>
                <div className={`archetype-stat__value ${mlInterventions > 0 ? 'archetype-stat__value--warn' : 'archetype-stat__value--ok'}`}>
                  {mlInterventions}/{totalScenes} sahne
                </div>
              </div>
            </div>

            <div className="archetype-card__divider" />

            {/* Paylaş */}
            <button
              id="share-profile-btn"
              type="button"
              onClick={handleShare}
              className={`archetype-card__share-btn ${copied ? 'archetype-card__share-btn--copied' : ''}`}
            >
              {copied
                ? <><span>✓</span><span>Panoya Kopyalandı — LinkedIn veya mesaj için hazır!</span></>
                : <><span>📋</span><span>Bu AI Röntgenini Kopyala &amp; Paylaş</span></>}
            </button>

          </div>
        </div>

        {/* ── Karar Özeti ── */}
        <h2 className="final-feedback__title" style={{ marginBottom: 'var(--sp-md)' }}>
          📝 KARAR ÖZETİ
        </h2>
        <div className="final-decisions" id="final-decisions">
          {data.decisions.map((d, i) => (
            <div
              key={i}
              className={`final-decision-card card ${d.isGood ? 'card-success' : 'card-error'}`}
              id={`final-decision-${d.decisionId}`}
            >
              <div className="final-decision-card__title">
                <span style={{ color: d.isGood ? 'var(--color-success)' : 'var(--color-secondary)' }}>
                  {d.isGood ? '✓' : '✗'}
                </span>{' '}
                [{String(d.decisionId).padStart(2, '0')}] {d.title}
              </div>
              <div className="final-decision-card__desc">{d.description}</div>
              <div className="final-decision-card__reason">// {d.technicalReason}</div>
            </div>
          ))}
        </div>

        {/* ── Güçlü Yönler ve İyileştirmeler ── */}
        <div className="final-feedback" id="final-feedback">
          {data.strengths.length > 0 && (
            <div className="final-feedback__section">
              <div className="final-feedback__title">💪 GÜÇLÜ YÖNLERİN</div>
              <ul className="final-feedback__list">
                {data.strengths.map((s, i) => (
                  <li key={i} className="final-feedback__item final-feedback__item--strength">✓ {s}</li>
                ))}
              </ul>
            </div>
          )}
          {data.improvements.length > 0 && (
            <div className="final-feedback__section">
              <div className="final-feedback__title">📚 GELİŞTİRME ALANLARIN</div>
              <ul className="final-feedback__list">
                {data.improvements.map((imp, i) => (
                  <li key={i} className="final-feedback__item final-feedback__item--improvement">▶ {imp}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Disclaimer ── */}
        <div className="onboarding__disclaimer" style={{ marginBottom: 'var(--sp-lg)' }}>
          ⚕ Bu uygulama eğitim amaçlıdır. Gerçek bir hastane sisteminde kullanılmak üzere
          tasarlanmamıştır. İçerikler hukuki danışmanlık niteliği taşımaz.
        </div>

        <button
          className="btn btn-primary btn-lg btn-block"
          id="replay-button"
          onClick={onReplay}
          type="button"
        >
          🔄 TEKRAR OYNA
        </button>

      </div>
    </div>
  );
}
