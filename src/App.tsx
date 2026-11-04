/* ===== NexusPrimer 2.0 — Ana Uygulama ===== */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { AppState, UserProfile, Choice, Decision, TutorMessage } from './types';
import { DECISIONS, getOutcomeForDecision } from './data/scenario';
import { buildFinalData } from './logic/decisions';
import Onboarding from './components/Onboarding';
import ScenarioIntro from './components/ScenarioIntro';
import DecisionScreen from './components/DecisionScreen';
import OutcomeModal from './components/OutcomeModal';
import FinalScreen from './components/FinalScreen';
import DataCollectionPanel from './components/DataCollectionPanel';
import { useDataCollection, type SessionRow } from './hooks/useDataCollection';
import { predictHintNeed, preloadModel, type MLPrediction } from './services/mlModel';
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

  // ML tahmin state'i
  const [mlPrediction, setMlPrediction] = useState<MLPrediction | null>(null);
  const [dcPanelVisible, setDcPanelVisible] = useState(false);
  const [sessionRows, setSessionRows] = useState<SessionRow[]>([]);
  const prevDecisionDurationRef = useRef<number>(0);

  // Veri toplama hook
  const dataCollection = useDataCollection(state.profile, 'katilimci-anonim');

  // Model önceden yükle
  useEffect(() => {
    preloadModel();
  }, []);

  // Durum değiştiğinde kaydet
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Karar ekranı başladığında zamanlayıcıyı başlat ve ML tahmin çalıştır
  useEffect(() => {
    if (state.screen === 'decision' && !state.showOutcome && state.profile) {
      dataCollection.startDecisionTimer();
      dataCollection.resetForDecision();

      // Mevcut davranış özelliklerinden ML tahmin yap
      const wrongCount = state.decisions.filter((d) => d.choice === 'B').length;
      predictHintNeed({
        karar_suresi_sn: 0,
        onceki_yanlis_sayisi: wrongCount,
        ipucu_sayisi: 0,
        karar_degistirme_sayisi: 0,
        sahne_no: state.currentDecision,
        seviye: state.profile.level === 'experienced' ? 1 : 0,
        onceki_karar_suresi: prevDecisionDurationRef.current,
        kararsizlik_suresi: 0,
      }).then(setMlPrediction);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.screen, state.currentDecision, state.showOutcome]);

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

      // Veri toplama: satır oluştur
      const wrongCount = prev.decisions.filter((d) => d.choice === 'B').length;
      const row = dataCollection.finalizeRow({
        sahneNo: prev.currentDecision,
        oncekiYanlisSayisi: wrongCount,
        oncekiKararSuresi: prevDecisionDurationRef.current,
        karar: choice,
      });
      setSessionRows((r) => [...r, row]);
      prevDecisionDurationRef.current = row.karar_suresi_sn;

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
  }, [dataCollection]);

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

  // Tutor mesajları — ipucu sayısını kaydet
  const handleAddTutorMessages = useCallback((msgs: TutorMessage[]) => {
    // Her kullanıcı mesajı bir ipucu talebine eşdeğer
    const userMsgCount = msgs.filter((m) => m.role === 'user').length;
    for (let i = 0; i < userMsgCount; i++) {
      dataCollection.recordHintUsed();
    }

    setState((prev) => ({
      ...prev,
      tutorMessages: [...prev.tutorMessages, ...msgs],
    }));

    // ML tahminini güncelle
    if (state.profile) {
      const metrics = dataCollection.getMetrics();
      const wrongCount = state.decisions.filter((d) => d.choice === 'B').length;
      predictHintNeed({
        karar_suresi_sn: 0,
        onceki_yanlis_sayisi: wrongCount,
        ipucu_sayisi: metrics.ipucu_sayisi + userMsgCount,
        karar_degistirme_sayisi: metrics.karar_degistirme_sayisi,
        sahne_no: state.currentDecision,
        seviye: state.profile.level === 'experienced' ? 1 : 0,
        onceki_karar_suresi: prevDecisionDurationRef.current,
        kararsizlik_suresi: 0,
      }).then(setMlPrediction);
    }
  }, [dataCollection, state.profile, state.decisions, state.currentDecision]);

  // Tekrar oyna
  const handleReplay = useCallback(() => {
    clearState();
    setMlPrediction(null);
    setSessionRows([]);
    prevDecisionDurationRef.current = 0;
    setState({ ...INITIAL_STATE });
  }, []);

  // CSV dışa aktar
  const handleExport = useCallback(() => {
    dataCollection.exportCSV(sessionRows);
  }, [dataCollection, sessionRows]);

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
          mlPrediction={mlPrediction}
          onDecisionChange={dataCollection.recordDecisionChange}
          onFirstInteraction={dataCollection.recordFirstInteraction}
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
        <DataCollectionPanel
          rows={sessionRows}
          onExport={handleExport}
          sessionId={dataCollection.sessionId}
          isVisible={dcPanelVisible}
          onToggle={() => setDcPanelVisible((v) => !v)}
        />
      </>
    );
  }

  // Final
  if (screen === 'final' && profile && decisions.length === 3) {
    const finalData = buildFinalData(decisions, profile);
    return (
      <>
        <FinalScreen data={finalData} onReplay={handleReplay} />
        <DataCollectionPanel
          rows={sessionRows}
          onExport={handleExport}
          sessionId={dataCollection.sessionId}
          isVisible={dcPanelVisible}
          onToggle={() => setDcPanelVisible((v) => !v)}
        />
      </>
    );
  }

  // Fallback
  return <Onboarding onComplete={handleOnboardingComplete} />;
}
