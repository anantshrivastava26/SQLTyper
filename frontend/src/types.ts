export type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface SchemaTable {
  columns: string[];
  rows: unknown[][];
}

export interface Challenge {
  sessionId: string;
  description: string;
  hints: string[];
  level: Level;
  levelName: string;
  concept: string;
  difficulty: string;
  schema: Record<string, SchemaTable>;
}

export interface QueryResult {
  rows: Record<string, unknown>[];
  columns: string[];
}

export interface RunResponse {
  userResult: QueryResult;
  expectedResult: QueryResult;
  match: boolean;
  message: string;
}

export interface Stats {
  attempted: number;
  correct: number;
  streak: number;
  bestStreak: number;
  levelProgress: Record<number, { attempted: number; correct: number }>;
  unlockedLevels: number[];
}

export interface Settings {
  selectedLevels: Level[];
  selectedConcepts: string[];
  mode: 'learning' | 'exam' | 'speed';
  timeLimit: number | null; // seconds, null = unlimited
}
