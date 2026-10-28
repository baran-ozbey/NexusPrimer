/* ===== NexusPrimer — Tip Tanımları ===== */

export type Level = 'beginner' | 'intermediate' | 'experienced';
export type Role = 'developer' | 'tester' | 'sysadmin';
export type Goal = 'reliability' | 'testing' | 'privacy';
export type Choice = 'A' | 'B';
export type FinalResult = 'FINAL_A' | 'FINAL_B';
export type AppScreen = 'onboarding' | 'scenario-intro' | 'decision' | 'outcome' | 'final';

export interface UserProfile {
  level: Level;
  role: Role;
  goal: Goal;
}

export interface Decision {
  id: 1 | 2 | 3;
  choice: Choice;
  timedOut: boolean;
}

export interface DecisionOption {
  id: Choice;
  title: string;
  description: string;
}

export interface DecisionData {
  id: 1 | 2 | 3;
  title: string;
  scenario: string;
  context: string;
  options: DecisionOption[];
  clock: string;
  systemStatus: string;
  waitingPatients: number;
}

export interface OutcomeData {
  decisionId: 1 | 2 | 3;
  choice: Choice;
  title: string;
  description: string;
  technicalReason: string;
  isGood: boolean;
}

export interface FinalData {
  result: FinalResult;
  title: string;
  time: string;
  summary: string;
  decisions: OutcomeData[];
  strengths: string[];
  improvements: string[];
}

export interface TutorMessage {
  role: 'tutor' | 'user';
  content: string;
}

// Tutor JSON Schema çıktı tipi
export interface TutorResponse {
  message: string;
  hint_level: number; // 1-3
  answer_revealed: boolean;
  reasoning_question: string;
  status: 'success' | 'fallback' | 'injection_blocked';
}

export interface AppState {
  screen: AppScreen;
  profile: UserProfile | null;
  decisions: Decision[];
  currentDecision: number; // 1, 2, 3
  showOutcome: boolean;
  tutorMessages: TutorMessage[];
  finalResult: FinalResult | null;
}
