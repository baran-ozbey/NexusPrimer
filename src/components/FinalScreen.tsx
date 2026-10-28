/* ===== NexusPrimer — Final Ekranı ===== */
import type { FinalData } from '../types';

interface FinalScreenProps {
  data: FinalData;
  onReplay: () => void;
}

export default function FinalScreen({ data, onReplay }: FinalScreenProps) {
  const isSuccess = data.result === 'FINAL_A';

  // Kaç iyi karar verildi?
  const goodCount = data.decisions.filter((d) => d.isGood).length;
  const totalCount = data.decisions.length;

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
