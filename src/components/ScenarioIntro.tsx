/* ===== NexusPrimer — Senaryo Giriş Ekranı ===== */
import { useState, useEffect } from 'react';
import { SCENARIO_INTRO } from '../data/scenario';
import StatusBar from './StatusBar';

interface ScenarioIntroProps {
  onStart: () => void;
}

export default function ScenarioIntro({ onStart }: ScenarioIntroProps) {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setBlink((b) => !b), 700);
    return () => clearInterval(id);
  }, []);

  return (
    <div id="scenario-intro-screen" className="animate-fade-in">
      <StatusBar
        clock={SCENARIO_INTRO.time}
        systemStatus={SCENARIO_INTRO.systemStatus}
        waitingPatients={SCENARIO_INTRO.waitingPatients}
      />
      <div className="page-container">
        <div className="card">
          <div className="scenario-intro">
            {/* Büyük yanıp sönen alarm başlığı */}
            <span className="scenario-intro__icon">🚨</span>

            <div
              className="scenario-intro__alert-badge"
              style={{ opacity: blink ? 1 : 0.55 }}
            >
              ⚠ KRİZ ALARMI AKTİF ⚠
            </div>

            <h1 className="scenario-intro__title">{SCENARIO_INTRO.title}</h1>

            {/* Senaryo açıklaması — terminal çıktısı gibi */}
            <p className="scenario-intro__text">
              {SCENARIO_INTRO.description}
            </p>

            {/* Görev kutusu */}
            <div className="scenario-intro__mission">
              <strong>📋 GÖREV:</strong>{' '}
              Nöbetçi yazılım mühendisi olarak bu krizi yönet.
              3 kritik karar vereceksin. Her kararın teknik ve etik sonuçları olacak.
            </div>

            <button
              className="btn btn-primary btn-lg"
              id="begin-scenario"
              onClick={onStart}
              type="button"
            >
              ▶ KRİZE MÜDAHALE ET
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
