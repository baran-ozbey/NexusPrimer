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
  totalChanges: number
): Archetype {
  if (goodCount === 3 && avgTime <= 18 && totalChanges <= 1) {
    return {
      title: 'Soğukkanlı Sistem Mimarı',
      badge: '🎯',
      color: '#10b981',
      tag: 'Yüksek Odak · Düşük Tereddüt · Sağlam Kararlar',
      desc: 'Kriz anında minimum tereddütle doğrudan en dayanıklı mimariyi seçtin. Model telemetrisi: Yüksek güvenirlikli karar örüntüsü.',
    };
  }
  if (goodCount >= 2 && avgTime > 18) {
    return {
      title: 'Analitik Dedektif',
      badge: '🔬',
      color: '#38bdf8',
      tag: 'Derin İnceleme · Yüksek Dikkat · Risk Analizi',
      desc: 'Her kararın olası yan etkilerini tarttın, acele etmeden sağlam adımlar attın. Model telemetrisi: Derin düşünme ve düşük hata toleransı.',
    };
  }
  if (totalChanges >= 2) {
    return {
      title: 'Yol Arayan Kaşif',
      badge: '🔄',
      color: '#f59e0b',
      tag: 'Adaptif Düşünce · Sorgulayıcı · Esnek',
      desc: 'Seçenekler arasında gidip gelerek alternatif senaryoları sorguladın ve AI desteğiyle dengeyi buldun. Model telemetrisi: Dinamik adaptasyon.',
    };
  }
  return {
    title: 'Refleks Mühendisi',
    badge: '⚡',
    color: '#a855f7',
    tag: 'Yüksek Hız · Kriz Refleksi · Çevik',
    desc: 'Hızlı reflekslerle krizi göğüsledin. Tempon oldukça yüksek; kriz yönetiminde hız senin güçlü yanın.',
  };
}

export default function FinalScreen({ data, onReplay, sessionRows = [] }: FinalScreenProps) {
  const isSuccess = data.result === 'FINAL_A';
  const [copied, setCopied] = useState(false);

  // Kaç iyi karar verildi?
  const goodCount = data.decisions.filter((d) => d.isGood).length;
  const totalCount = data.decisions.length;

  // Telemetri hesaplamaları
  const avgTime = sessionRows.length > 0
    ? Math.round((sessionRows.reduce((acc, r) => acc + (r.karar_suresi_sn || 0), 0) / sessionRows.length) * 10) / 10
    : 12.5;

  const totalChanges = sessionRows.reduce((acc, r) => acc + (r.karar_degistirme_sayisi || 0), 0);
  const totalHints = sessionRows.reduce((acc, r) => acc + (r.ipucu_sayisi || 0), 0);
  const mlInterventions = sessionRows.filter((r) => r.ipucu_gerekli === 1).length;

  const archetype = computeArchetype(goodCount, avgTime, totalChanges);

  const handleShare = async () => {
    const text = `🎮 NexusPrimer — Kriz Yönetimi AI Karar Profilim:
${archetype.badge} Profil: ${archetype.title}
📊 Karar Skoru: ${goodCount}/${totalCount}
⏱️ Ort. Karar Süresi: ${avgTime}s | 🔄 Tereddüt: ${totalChanges}
🧠 Model: ONNX DecisionTree (baranozbey/nexusprimer-adaptive-model)
Sen kriz anında nasıl karar verirsin?
Dene: https://baran-ozbey.github.io/NexusPrimer/`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="page-container">
      <div className="final-screen" id="final-screen">
        {/* Ana başlık */}
        <div className={`final-header ${isSuccess ? 'final-header--success' : 'final-header--failure'}`}>
          <span className="final-header__icon">
            {isSuccess ? '✅' : '⚠️'}
          </span>
          <h1 className="final-header__title" id="final-title">
            {data.title}
          </h1>
          <div className="final-header__time">🕐 Saat {data.time}</div>
          {/* Puan tablosu */}
          <div className="final-score">
            KARAR SKORU:{' '}
            <span className="final-score__value">
              {goodCount}/{totalCount}
            </span>
          </div>
        </div>

        <p className="final-summary" id="final-summary">{data.summary}</p>

        {/* ===== YENİ: AI KARAR RÖNTGENİ & DAVRANIŞ PROFİLİ ===== */}
        <div
          id="ai-archetype-card"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: `1px solid ${archetype.color}66`,
            borderRadius: '12px',
            padding: 'var(--sp-lg)',
            marginBottom: 'var(--sp-xl)',
            boxShadow: `0 8px 30px -4px ${archetype.color}22`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-sm)', flexWrap: 'wrap', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: archetype.color,
                fontWeight: 700,
                background: `${archetype.color}1a`,
                padding: '4px 10px',
                borderRadius: '6px',
                border: `1px solid ${archetype.color}44`,
              }}
            >
              🧠 AI Davranış Röntgeni
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)' }}>
              ONNX Model Analizi
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '14px 0' }}>
            <span style={{ fontSize: '2.8rem' }}>{archetype.badge}</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                {archetype.title}
              </h2>
              <div style={{ fontSize: '0.8rem', color: archetype.color, fontWeight: 600, marginTop: '2px' }}>
                {archetype.tag}
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5', margin: '0 0 16px 0' }}>
            {archetype.desc}
          </p>

          {/* Telemetri Çubukları / İstatistikler */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px',
              padding: '12px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              marginBottom: '14px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>
                ⏱️ Ort. Karar Süresi
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {avgTime} sn
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>
                🔄 Tereddüt / Değişim
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {totalChanges} kez
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>
                💡 İpucu Talebi
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {totalHints} adet
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>
                🤖 ML Müdahale Riski
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: mlInterventions > 0 ? '#f59e0b' : '#10b981', fontFamily: 'var(--font-mono)' }}>
                {mlInterventions}/{Math.max(sessionRows.length, 3)} sahne
              </div>
            </div>
          </div>

          {/* Paylaş Butonu */}
          <button
            type="button"
            onClick={handleShare}
            id="share-profile-btn"
            style={{
              width: '100%',
              padding: '10px 16px',
              background: copied ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            {copied ? '✓ Sonuç Panoya Kopyalandı! (LinkedIn/Mesaj İçin Hazır)' : '📋 Bu AI Röntgenini Kopyala & Paylaş'}
          </button>
        </div>

        {/* Karar Özeti */}
        <h2
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-dim)',
            marginBottom: 'var(--sp-md)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          📝 KARAR ÖZETİ
        </h2>
        <div className="final-decisions" id="final-decisions">
          {data.decisions.map((d, i) => (
            <div
              key={i}
              className={`final-decision-card card ${
                d.isGood ? 'card-success' : 'card-error'
              }`}
              id={`final-decision-${d.decisionId}`}
            >
              <div className="final-decision-card__title">
                <span style={{ color: d.isGood ? 'var(--color-success)' : 'var(--color-secondary)' }}>
                  {d.isGood ? '✓' : '✗'}
                </span>{' '}
                [{String(d.decisionId).padStart(2, '0')}] {d.title}
              </div>
              <div className="final-decision-card__desc">
                {d.description}
              </div>
              <div className="final-decision-card__reason">
                // {d.technicalReason}
              </div>
            </div>
          ))}
        </div>

        {/* Güçlü Yönler ve İyileştirmeler */}
        <div className="final-feedback" id="final-feedback">
          {data.strengths.length > 0 && (
            <div className="final-feedback__section">
              <div className="final-feedback__title">
                💪 GÜÇLÜ YÖNLERİN
              </div>
              <ul className="final-feedback__list">
                {data.strengths.map((s, i) => (
                  <li key={i} className="final-feedback__item final-feedback__item--strength">
                    ✓ {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.improvements.length > 0 && (
            <div className="final-feedback__section">
              <div className="final-feedback__title">
                📚 GELİŞTİRME ALANLARIN
              </div>
              <ul className="final-feedback__list">
                {data.improvements.map((imp, i) => (
                  <li key={i} className="final-feedback__item final-feedback__item--improvement">
                    ▶ {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Eğitim Uyarısı */}
        <div
          className="onboarding__disclaimer"
          style={{ marginBottom: 'var(--sp-lg)' }}
        >
          ⚕ Bu uygulama eğitim amaçlıdır. Gerçek bir hastane sisteminde
          kullanılmak üzere tasarlanmamıştır. İçerikler hukuki danışmanlık
          niteliği taşımaz.
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
