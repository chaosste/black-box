
export enum Substance {
  '2CB' = '2CB',
  'Cannabis' = 'Cannabis',
  'Ketamine' = 'Ketamine',
  'LSD' = 'LSD',
  'MDMA' = 'MDMA',
  'Ritalin' = 'Ritalin',
  'Shrooms' = 'Shrooms'
}

export enum SocialEnvironment {
  ALONE = 'Alone',
  NOT_ALONE = 'Not Alone'
}

export enum PhysicalEnvironment {
  FAMILIAR = 'Familiar Environment',
  NEW = 'New Environment'
}

export interface SessionPhaseA {
  substance: Substance;
  dosage: number;
  selfEsteem: number; // 1-10
  intentions: boolean;
  intentionsText?: string;
  mood: number; // 1-10
  mindfulness: number; // 1-10
  stress: number; // 1-10
  responsibilities: number; // 1-10
  social: SocialEnvironment;
  physical: PhysicalEnvironment;
  timestamp: string;
}

export interface LogEntry {
  timestamp: string;
  content: string;
}

export interface SessionPhaseC {
  oneHour?: {
    mood: number;
    attention: number;
    wellBeing: number;
    energy: number;
  };
  oneDay?: {
    mood: number;
    attention: number;
    wellBeing: number;
    energy: number;
    lifeOrientation: number; // 1-10 (Optimism vs Pessimism)
  };
  oneWeek?: {
    mood: number;
    attention: number;
    wellBeing: number;
    energy: number;
  };
}

export interface QuestionnaireData {
  id: string;
  questionnaireId: string;
  name: string;
  responses: Record<string, number | string>;
  score?: number;
  completedAt: string;
}

export interface Baseline {
  timestamp: string;
  mood: number;
  stress: number;
  wellBeing: number;
  mindfulness: number;
  selfEsteem: number;
}

export interface Profile {
  id: string;
  name: string;
  age?: string;
  sex?: string;
  details?: string;
  sessions: FlightSession[];
  baselines: Baseline[];
  questionnaires: QuestionnaireData[];
}

export interface FlightSession {
  id: string;
  phaseA: SessionPhaseA;
  phaseB: LogEntry[];
  phaseC: SessionPhaseC;
  questionnaires: QuestionnaireData[];
  tags?: string[];
  isCompleted?: boolean;
  debriefText?: string;
}

export interface User {
  id: string;
  email: string;
  profiles: Profile[];
  currentProfileId?: string;
  tutorialCompleted?: boolean;
}

export interface DraftSession {
  phaseA: Partial<SessionPhaseA>;
  tags?: string[];
  lastSaved: string;
}
