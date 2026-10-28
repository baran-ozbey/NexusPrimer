/* ===== NexusPrimer — Karar Sonucu Modal ===== */
import type { OutcomeData } from '../types';

interface OutcomeModalProps {
  outcome: OutcomeData;
  onContinue: () => void;
}

export default function OutcomeModal({ outcome, onContinue }: OutcomeModalProps) {
  const isGood = outcome.isGood;

  return (
    <div
      className="outcome-overlay"
      id="outcome-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Karar Sonucu"
    >
      <div className={`card outcome-card ${isGood ? 'card-success' : 'card-error'}`}>
        {/* Başlık */}
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            marginBottom: 'var(--sp-sm)',
            color: isGood ? 'var(--color-success)' : 'var(--color-error)',
            letterSpacing: '0.04em',
            textShadow: isGood
              ? '0 0 10px rgba(0,255,136,0.4)'
              : '0 0 10px rgba(255,56,96,0.4)',
          }}
        >
          {isGood ? '✓ ' : '✗ '}{outcome.title}
        </h3>

        {/* Açıklama */}
        <p
          style={{
            fontSize: '0.92rem',
            lineHeight: 1.65,
            marginBottom: 'var(--sp-md)',
            color: 'var(--color-text-light)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {outcome.description}
        </p>

        {/* Teknik gerekçe — kod bloğu gibi */}
        <div className="outcome-technical-reason">
          <div className="outcome-technical-reason__label">
            // Teknik Gerekçe
          </div>
          <p style={{ margin: 0 }}>{outcome.technicalReason}</p>
        </div>

        <button
          className="btn btn-primary btn-block"
          id="outcome-continue"
          onClick={onContinue}
          type="button"
        >
          ▶ DEVAM ET
        </button>
      </div>
    </div>
  );
}
