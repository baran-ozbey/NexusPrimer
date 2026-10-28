/* ===== NexusPrimer — Onboarding (Kişiselleştirme) Bileşeni ===== */
import { useState, useEffect } from 'react';
import type { Level, Role, Goal, UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const LEVELS: { value: Level; label: string; icon: string }[] = [
  { value: 'beginner',      label: 'Yeni Başlayan', icon: '🌱' },
  { value: 'intermediate',  label: 'Orta Seviye',   icon: '📈' },
  { value: 'experienced',   label: 'Deneyimli',     icon: '🚀' },
];

const ROLES: { value: Role; label: string; icon: string }[] = [
  { value: 'developer', label: 'Yazılım Geliştirici', icon: '💻' },
  { value: 'tester',    label: 'Test Mühendisi',      icon: '🧪' },
  { value: 'sysadmin',  label: 'Sistem Yöneticisi',   icon: '🖥️' },
];

const GOALS: { value: Goal; label: string; icon: string }[] = [
  { value: 'reliability', label: 'Sistem Güvenilirliği',   icon: '🛡️' },
  { value: 'testing',     label: 'Test ve Hata Ayıklama',  icon: '🔍' },
  { value: 'privacy',     label: 'Veri Güvenliği / KVKK',  icon: '🔒' },
];

const BOOT_LINES = [
  '> INITIALIZING NEXUS PRIMER v2.0...',
  '> LOADING CRISIS SIMULATION ENGINE...',
  '> CONNECTING TO HOSPITAL NETWORK...',
  '> AI_TUTOR [SOKRATES_MOD] ONLINE...',
  '> SYSTEM READY. AWAITING OPERATOR...',
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [level, setLevel] = useState<Level | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [error, setError] = useState('');
  const [bootLine, setBootLine] = useState(0);

  // Cycle through boot lines
  useEffect(() => {
    const id = setInterval(() => {
      setBootLine((prev) => (prev + 1) % BOOT_LINES.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = () => {
    if (!level || !role || !goal) {
      setError('Lütfen tüm soruları yanıtlayın.');
      return;
    }
    setError('');
    onComplete({ level, role, goal });
  };

  return (
    <div className="onboarding" id="onboarding-screen">
      <div className="onboarding__card">
        <div className="onboarding__logo">
          <span className="onboarding__logo-icon">🏥</span>
          {/* Terminal boot text */}
          <div className="onboarding__boot-text">{BOOT_LINES[bootLine]}</div>
          <h1 className="onboarding__title">NEXUS PRIMER</h1>
          <p className="onboarding__subtitle">
            // Yazılım Mühendisliği Kriz Simülasyonu
          </p>
        </div>

        {/* Soru 1: Seviye */}
        <div className="onboarding__question">
          <label className="onboarding__question-label" id="level-label">
            [01] Deneyim seviyeniz?
          </label>
          <div
            className="onboarding__options"
            role="radiogroup"
            aria-labelledby="level-label"
          >
            {LEVELS.map((l) => (
              <button
                key={l.value}
                id={`level-${l.value}`}
                className={`onboarding__option ${
                  level === l.value ? 'onboarding__option--selected' : ''
                }`}
                onClick={() => { setLevel(l.value); setError(''); }}
                role="radio"
                aria-checked={level === l.value}
                type="button"
              >
                {l.icon} {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Soru 2: Rol */}
        <div className="onboarding__question">
          <label className="onboarding__question-label" id="role-label">
            [02] Rolünüz nedir?
          </label>
          <div
            className="onboarding__options"
            role="radiogroup"
            aria-labelledby="role-label"
          >
            {ROLES.map((r) => (
              <button
                key={r.value}
                id={`role-${r.value}`}
                className={`onboarding__option ${
                  role === r.value ? 'onboarding__option--selected' : ''
                }`}
                onClick={() => { setRole(r.value); setError(''); }}
                role="radio"
                aria-checked={role === r.value}
                type="button"
              >
                {r.icon} {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Soru 3: Hedef */}
        <div className="onboarding__question">
          <label className="onboarding__question-label" id="goal-label">
            [03] Öğrenme hedefiniz?
          </label>
          <div
            className="onboarding__options"
            role="radiogroup"
            aria-labelledby="goal-label"
          >
            {GOALS.map((g) => (
              <button
                key={g.value}
                id={`goal-${g.value}`}
                className={`onboarding__option ${
                  goal === g.value ? 'onboarding__option--selected' : ''
                }`}
                onClick={() => { setGoal(g.value); setError(''); }}
                role="radio"
                aria-checked={goal === g.value}
                type="button"
              >
                {g.icon} {g.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="onboarding__error" id="onboarding-error" role="alert">
            ⚠ {error}
          </div>
        )}

        <button
          className="btn btn-primary btn-lg btn-block"
          id="start-button"
          onClick={handleSubmit}
          type="button"
        >
          ▶ SİMÜLASYONA BAŞLA
        </button>

        <div className="onboarding__disclaimer" id="disclaimer">
          ⚕ Bu uygulama eğitim amaçlıdır. Gerçek bir hastane sisteminde
          kullanılmak üzere tasarlanmamıştır. İçerikler hukuki danışmanlık
          niteliği taşımaz.
        </div>
      </div>
    </div>
  );
}
