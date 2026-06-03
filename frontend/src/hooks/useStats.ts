import { useState, useCallback } from 'react';
import { Stats, Level } from '../types';

const STORAGE_KEY = 'sql-trainer-stats';
const UNLOCK_THRESHOLD_CORRECT = 5; // correct answers to unlock next level
const UNLOCK_THRESHOLD_ACCURACY = 0.8; // 80% accuracy to unlock next level

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Stats;
  } catch {}
  return {
    attempted: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    levelProgress: {},
    unlockedLevels: [1],
  };
}

function saveStats(s: Stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function computeUnlocked(lp: Stats['levelProgress']): number[] {
  const unlocked = [1];
  for (let lvl = 1; lvl <= 11; lvl++) {
    const p = lp[lvl];
    if (!p) break;
    const accuracy = p.attempted > 0 ? p.correct / p.attempted : 0;
    if (p.correct >= UNLOCK_THRESHOLD_CORRECT || accuracy >= UNLOCK_THRESHOLD_ACCURACY) {
      unlocked.push(lvl + 1);
    } else {
      break;
    }
  }
  return unlocked;
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(loadStats);

  const recordAttempt = useCallback((level: Level, correct: boolean) => {
    setStats(prev => {
      const lp = { ...prev.levelProgress };
      const entry = lp[level] ?? { attempted: 0, correct: 0 };
      lp[level] = {
        attempted: entry.attempted + 1,
        correct: entry.correct + (correct ? 1 : 0),
      };
      const streak = correct ? prev.streak + 1 : 0;
      const next: Stats = {
        attempted: prev.attempted + 1,
        correct: prev.correct + (correct ? 1 : 0),
        streak,
        bestStreak: Math.max(prev.bestStreak, streak),
        levelProgress: lp,
        unlockedLevels: computeUnlocked(lp),
      };
      saveStats(next);
      return next;
    });
  }, []);

  const resetStats = useCallback(() => {
    const fresh: Stats = {
      attempted: 0,
      correct: 0,
      streak: 0,
      bestStreak: 0,
      levelProgress: {},
      unlockedLevels: [1],
    };
    saveStats(fresh);
    setStats(fresh);
  }, []);

  const accuracy = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;

  return { stats, accuracy, recordAttempt, resetStats };
}
