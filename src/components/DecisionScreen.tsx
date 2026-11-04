/* ===== NexusPrimer 2.0 — Karar Ekranı (ML Adaptif) ===== */
import { useState } from 'react';
import type { DecisionData, UserProfile, Choice, TutorMessage } from '../types';
import StatusBar from './StatusBar';
import ProgressBar from './ProgressBar';
import Timer from './Timer';
import TutorPanel from './TutorPanel';
import { getPersonalizedHints } from '../data/scenario';
import type { MLPrediction } from '../services/mlModel';

interface DecisionScreenProps {
  decision: DecisionData;
  profile: UserProfile;
  onChoose: (choice: Choice) => void;
  onTimeout: () => void;
  tutorMessages: TutorMessage[];
  onAddTutorMessage: (msgs: TutorMessage[]) => void;
  mlPrediction?: MLPrediction | null;
  onDecisionChange?: () => void;
  onFirstInteraction?: () => void;
}

const STEP_LABELS = ['Mimari', 'Test', 'KVKK'];

export default function DecisionScreen({
  decision,
  profile,
  onChoose,
  onTimeout,
  tutorMessages,
  onAddTutorMessage,
  mlPrediction,
  onDecisionChange,
  onFirstInteraction,
}: DecisionScreenProps) {
  const isExperienced = profile.level === 'experienced';
  const hints = getPersonalizedHints(profile, decision.id);
  const [selectedTemp, setSelectedTemp] = useState<Choice | null>(null);

  const handleOptionClick = (optId: Choice) => {
    onFirstInteraction?.();
    if (selectedTemp && selectedTemp !== optId) {
      onDecisionChange?.();
    }
    setSelectedTemp(optId);
    onChoose(optId);
  };

  return (
    <div id="decision-screen" className="animate-fade-in">
      <StatusBar
        clock={decision.clock}
        systemStatus={decision.systemStatus}
        waitingPatients={decision.waitingPatients}
      />

      <div className="page-container">
        <ProgressBar current={decision.id} total={3} labels={STEP_LABELS} />

        {/* ML Inference Teşhis Barı (Şartnamedeki data-cy="p" gereksinimi) */}
        {mlPrediction && (
          <div
            id="ml-prediction-badge"
            data-cy="ml-badge"
            style={{
              background: 'rgba(0, 255, 170, 0.08)',
              border: '1px solid var(--color-primary)',
              borderRadius: '6px',
              padding: '6px 12px',
              marginBottom: 'var(--sp-sm)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>🧠 ONNX ADAPTIVE MODEL: </span>
              <span>İpucu İhtiyacı: </span>
              <strong style={{ color: mlPrediction.ipucu_gerekli ? '#ffcc00' : 'var(--color-success)' }}>
                {mlPrediction.ipucu_gerekli ? 'YÜKSEK (İpucu Gerekli)' : 'DÜŞÜK (Bağımsız)'}
              </strong>
            </div>
            <div>
              <span>P(İpucu): </span>
              <span
                id="ml-probability"
                data-cy="p"
                style={{ fontWeight: 700, color: 'var(--color-secondary)' }}
              >
                {mlPrediction.olasilik.toFixed(4)}
              </span>
              <span style={{ opacity: 0.6, marginLeft: '6px', fontSize: '0.68rem' }}>
                [{mlPrediction.source.toUpperCase()}]
              </span>
            </div>
          </div>
        )}

        <div className="card" style={{ marginBottom: 'var(--sp-md)', position: 'relative' }}>
          {/* Timer — sağ üst köşede float */}
          {isExperienced && (
            <div style={{ position: 'absolute', top: 'var(--sp-md)', right: 'var(--sp-md)' }}>
              <Timer
                duration={60}
                onTimeout={onTimeout}
                isActive={true}
              />
            </div>
          )}

          {/* Karar başlığı */}
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-primary)',
              marginBottom: 'var(--sp-sm)',
              letterSpacing: '0.04em',
              paddingRight: isExperienced ? '100px' : '0',
            }}
          >
            <span style={{ color: 'var(--color-text-dim)', marginRight: '8px' }}>
              [{String(decision.id).padStart(2, '0')}]
            </span>
            {decision.title}
          </h2>

          <p
            style={{
              fontSize: '0.9rem',
              lineHeight: 1.75,
              color: 'var(--color-text-light)',
              marginBottom: 'var(--sp-md)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {decision.scenario}
          </p>

          {/* Bağlam paneli */}
          <div
            className="hints-panel"
            style={{ marginBottom: 'var(--sp-md)' }}
          >
            <div className="hints-panel__title">ℹ BAĞLAM</div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.6, fontFamily: 'var(--font-mono)', color: 'var(--color-text-light)' }}>
              {decision.context}
            </p>
          </div>

          {/* Kişiselleştirilmiş ipuçları */}
          {hints.length > 0 && (
            <div className="hints-panel" id="personalized-hints">
              <div className="hints-panel__title">
                💡 KİŞİSELLEŞTİRİLMİŞ İPUÇLARI
              </div>
              <ul className="hints-panel__list">
                {hints.map((hint, i) => (
                  <li key={i}>{hint}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Karar seçenekleri */}
          <div style={{ marginTop: 'var(--sp-md)' }}>
            {decision.options.map((opt) => (
              <button
                key={opt.id}
                className="decision-option"
                id={`decision-${decision.id}-option-${opt.id}`}
                onClick={() => handleOptionClick(opt.id)}
                type="button"
              >
                <div className="decision-option__label">
                  <span className="decision-option__tag">{opt.id.toUpperCase()}</span>
                  {opt.title}
                </div>
                <div className="decision-option__desc">{opt.description}</div>
              </button>
            ))}
          </div>
        </div>

        <TutorPanel
          profile={profile}
          currentDecision={decision.id}
          messages={tutorMessages}
          onAddMessage={onAddTutorMessage}
          mlPrediction={mlPrediction}
          onFirstInteraction={onFirstInteraction}
        />
      </div>
    </div>
  );
}
