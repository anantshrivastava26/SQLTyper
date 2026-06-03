import { useState, useCallback } from 'react';
import axios from 'axios';
import { Challenge, RunResponse, Settings, Level } from '../types';

const API = '/api';

export function useChallenge() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<RunResponse | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const fetchChallenge = useCallback(async (settings: Settings) => {
    setLoading(true);
    setError(null);
    setRunResult(null);
    setRunError(null);

    try {
      const params: Record<string, string> = {};
      if (settings.selectedLevels.length > 0) {
        // Pick a random level from selected
        const lvl = settings.selectedLevels[Math.floor(Math.random() * settings.selectedLevels.length)];
        params.level = String(lvl);
      }
      if (settings.selectedConcepts.length > 0) {
        params.concepts = settings.selectedConcepts.join(',');
      }
      const res = await axios.get<Challenge>(`${API}/challenge`, { params });
      setChallenge(res.data);
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e) ? e.response?.data?.error ?? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const runQuery = useCallback(async (sql: string) => {
    if (!challenge) return;
    setRunning(true);
    setRunError(null);
    try {
      const res = await axios.post<RunResponse>(`${API}/run`, {
        sessionId: challenge.sessionId,
        sql,
      });
      setRunResult(res.data);
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e) ? e.response?.data?.error ?? e.message : String(e);
      setRunError(msg);
      setRunResult(null);
    } finally {
      setRunning(false);
    }
  }, [challenge]);

  return { challenge, loading, error, runResult, runError, running, fetchChallenge, runQuery };
}
