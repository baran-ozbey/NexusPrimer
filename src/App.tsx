/* ===== NexusPrimer — Ana Uygulama ===== */
import { useState, useEffect, useCallback } from 'react';
import type { AppState, UserProfile, Choice, Decision, TutorMessage } from './types';
import { DECISIONS, getOutcomeForDecision } from './data/scenario';
import { buildFinalData } from './logic/decisions';
import Onboarding from './components/Onboarding';
import ScenarioIntro from './components/ScenarioIntro';
import DecisionScreen from './components/DecisionScreen';
import OutcomeModal from './components/OutcomeModal';
import FinalScreen from './components/FinalScreen';
import './index.css';

const STORAGE_KEY = 'nexus-primer-state';

function loadState(): AppState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

function saveState(state: AppState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage kullanılamıyorsa sessizce devam et
  }
}

function clearState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

const INITIAL_STATE: AppState = {
  screen: 'onboarding',
  profile: null,
  decisions: [],
  currentDecision: 1,
  showOutcome: false,
  tutorMessages: [],
  finalResult: null,
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = loadState();
    return saved ?? INITIAL_STATE;
  });

  // Durum değiştiğinde kaydet
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Kişiselleştirme tamamlandı
  const handleOnboardingComplete = useCallback((profile: UserProfile) => {
    setState((prev) => ({
      ...prev,
      screen: 'scenario-intro',
      profile,
    }));
  }, []);

  // Senaryo giriş ekranından devam
  const handleScenarioStart = useCallback(() => {
    const initialTutorMsg: TutorMessage = {
      role: 'tutor',
      content:
        '👋 Merhaba! Ben senin AI tutor\'unum. Kararlarını değerlendirmene yardımcı olacağım. Doğrudan cevap vermeyeceğim — birlikte düşüneceğiz. Bana istediğin soruyu sorabilirsin.\n\n⚠️ Not: Bu bir simülasyondur, gerçek bir LLM kullanılmamaktadır.',
    };

    setState((prev) => ({
      ...prev,
      screen: 'decision',
      tutorMessages: [initialTutorMsg],
    }));
  }, []);

  // Karar verildi (manuel seçim)
  const handleChoice = useCallback((choice: Choice) => {
    setState((prev) => {
      if (prev.showOutcome) return prev; // çift tıklamayı önle
      const decision: Decision = {
        id: prev.currentDecision as 1 | 2 | 3,
        choice,
        timedOut: false,
      };
      return {
        ...prev,
        decisions: [...prev.decisions, decision],
        showOutcome: true,
      };
    });
  }, []);

  // Zamanlayıcı doldu → riskli seçenek (timedOut: true)
  const handleTimeout = useCallback(() => {
    setState((prev) => {
      if (prev.showOutcome) return prev; // zaten seçim yapılmış
      const decision: Decision = {
        id: prev.currentDecision as 1 | 2 | 3,
        choice: 'B',
        timedOut: true,
      };
      return {
        ...prev,
        decisions: [...prev.decisions, decision],
        showOutcome: true,
      };
    });
  }, []);

  // Sonuç ekranından devam
  const handleOutcomeContinue = useCallback(() => {
    setState((prev) => {
      const nextDecision = prev.currentDecision + 1;

      if (nextDecision > 3) {
        // Tüm kararlar tamamlandı - Final
        return {
          ...prev,
          showOutcome: false,
          screen: 'final',
        };
      }

      return {
        ...prev,
        showOutcome: false,
        currentDecision: nextDecision,
        tutorMessages: [
          {
            role: 'tutor' as const,
            content: `Karar ${nextDecision} için hazırlan. Senaryoyu dikkatlice oku ve bana sormak istediğin bir şey olursa yaz.`,
          },
        ],
      };
    });
  }, []);

  // Tutor mesajları
  const handleAddTutorMessages = useCallback((msgs: TutorMessage[]) => {
    setState((prev) => ({
      ...prev,
      tutorMessages: [...prev.tutorMessages, ...msgs],
    }));
  }, []);

  // Tekrar oyna
  const handleReplay = useCallback(() => {
    clearState();
    setState({ ...INITIAL_STATE });
  }, []);

  // ===== Render =====
  const { screen, profile, decisions, currentDecision, showOutcome } = state;

  // Onboarding
  if (screen === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Senaryo giriş
  if (screen === 'scenario-intro') {
    return <ScenarioIntro onStart={handleScenarioStart} />;
  }

  // Karar ekranı
  if (screen === 'decision' && profile) {
    const decisionData = DECISIONS[currentDecision - 1];

    return (
      <>
        <DecisionScreen
          key={currentDecision}
          decision={decisionData}
          profile={profile}
          onChoose={handleChoice}
          onTimeout={handleTimeout}
          tutorMessages={state.tutorMessages}
          onAddTutorMessage={handleAddTutorMessages}
        />
        {showOutcome && (
          <OutcomeModal
            outcome={getOutcomeForDecision(
              profile,
              currentDecision as 1 | 2 | 3,
              decisions[decisions.length - 1].choice
            )}
            onContinue={handleOutcomeContinue}
          />
        )}
      </>
    );
  }

  // Final
  if (screen === 'final' && profile && decisions.length === 3) {
    const finalData = buildFinalData(decisions, profile);
    return <FinalScreen data={finalData} onReplay={handleReplay} />;
  }

  // Fallback
  return <Onboarding onComplete={handleOnboardingComplete} />;
}
