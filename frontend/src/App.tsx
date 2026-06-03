import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useChallenge } from './hooks/useChallenge';
import { useStats } from './hooks/useStats';
import { SchemaViewer } from './components/SchemaViewer';
import { ResultTable } from './components/ResultTable';
import { StatsBar } from './components/StatsBar';
import { LevelProgress } from './components/LevelProgress';
import { SettingsPanel } from './components/SettingsPanel';
import { Level, Settings } from './types';

const DEFAULT_SETTINGS: Settings = {
  selectedLevels: [1],
  selectedConcepts: [],
  mode: 'learning',
  timeLimit: null,
};

const STARTER_SQL = '-- Write your SQL query here\nSELECT ';

export default function App() {
  const { challenge, loading, error, runResult, runError, running, fetchChallenge, runQuery } = useChallenge();
  const { stats, accuracy, recordAttempt, resetStats } = useStats();
  const [sql, setSql] = useState(STARTER_SQL);
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const s = localStorage.getItem('sql-trainer-settings');
      return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'schema' | 'progress'>('schema');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const saveSettings = (s: Settings) => {
    setSettings(s);
    localStorage.setItem('sql-trainer-settings', JSON.stringify(s));
  };

  const nextChallenge = useCallback(() => {
    setSubmitted(false);
    setShowHints(false);
    setSql(STARTER_SQL);
    if (timerRef.current) clearInterval(timerRef.current);
    if (settings.timeLimit) {
      setTimeLeft(settings.timeLimit);
    } else {
      setTimeLeft(null);
    }
    fetchChallenge(settings);
  }, [settings, fetchChallenge]);

  // Load first challenge on mount
  useEffect(() => {
    fetchChallenge(settings);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (settings.timeLimit && challenge && !submitted) {
      setTimeLeft(settings.timeLimit);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t === null) return null;
          if (t <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [challenge, settings.timeLimit, submitted]);

  // Record result when runResult arrives
  useEffect(() => {
    if (runResult && !submitted && challenge) {
      setSubmitted(true);
      recordAttempt(challenge.level, runResult.match);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [runResult, submitted, challenge, recordAttempt]);

  const handleRun = () => {
    if (!sql.trim() || running || !challenge) return;
    runQuery(sql);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  };

  const maxLevel = Math.max(...stats.unlockedLevels) as Level;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <StatsBar stats={stats} accuracy={accuracy} />

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{
          width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--border)', background: 'var(--surface)',
        }}>
          {/* Sidebar tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {(['schema', 'progress'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em',
                  background: sidebarTab === tab ? 'var(--surface2)' : 'transparent',
                  color: sidebarTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                  borderBottom: sidebarTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                {tab === 'schema' ? '📋 Schema' : '📊 Progress'}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {sidebarTab === 'schema' ? (
              challenge ? <SchemaViewer schema={challenge.schema} /> : (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading schema…</div>
              )
            ) : (
              <LevelProgress
                stats={stats}
                currentLevel={challenge?.level ?? null}
                onSelectLevel={(l) => {
                  if (!stats.unlockedLevels.includes(l)) return;
                  saveSettings({ ...settings, selectedLevels: [l] });
                  setTimeout(() => fetchChallenge({ ...settings, selectedLevels: [l] }), 0);
                }}
              />
            )}
          </div>
          {/* Sidebar footer */}
          <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowSettings(true)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                background: 'var(--surface2)', color: 'var(--text)', fontSize: 12, fontWeight: 600,
              }}
            >⚙️ Settings</button>
            <button
              onClick={() => { if (confirm('Reset all stats?')) resetStats(); }}
              style={{
                padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text-muted)', fontSize: 12,
              }}
              title="Reset stats"
            >↺</button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Challenge header */}
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid var(--border)',
            background: 'var(--surface)', flexShrink: 0,
          }}>
            {loading ? (
              <div style={{ color: 'var(--text-muted)' }}>⏳ Generating challenge…</div>
            ) : error ? (
              <div style={{ color: 'var(--red)' }}>⚠️ {error}</div>
            ) : challenge ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'var(--accent)', color: '#fff', borderRadius: 999,
                    padding: '2px 10px', fontSize: 11, fontWeight: 700,
                  }}>
                    LVL {challenge.level} · {challenge.levelName}
                  </span>
                  <span className={`badge badge-${challenge.difficulty}`}>{challenge.difficulty}</span>
                  {timeLeft !== null && (
                    <span style={{
                      fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 14,
                      color: timeLeft <= 10 ? 'var(--red)' : timeLeft <= 30 ? 'var(--yellow)' : 'var(--text)',
                    }}>
                      ⏱ {timeLeft}s
                    </span>
                  )}
                </div>
                {/* Render markdown-ish description */}
                <div style={{ fontSize: 15, lineHeight: 1.6 }} dangerouslySetInnerHTML={{
                  __html: challenge.description
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/`(.+?)`/g, '<code style="font-family:var(--mono);background:var(--surface2);padding:1px 5px;border-radius:4px">$1</code>')
                }} />
                {settings.mode === 'learning' && (
                  <div>
                    <button
                      onClick={() => setShowHints(h => !h)}
                      style={{
                        border: 'none', background: 'none', color: 'var(--accent)',
                        fontSize: 12, cursor: 'pointer', padding: 0, fontWeight: 600,
                      }}
                    >
                      {showHints ? '▼ Hide hints' : '▶ Show hints'}
                    </button>
                    {showHints && (
                      <ul style={{ marginTop: 6, marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {challenge.hints.map((h, i) => (
                          <li key={i} style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Editor */}
          <div style={{ height: 180, flexShrink: 0, borderBottom: '1px solid var(--border)' }} onKeyDown={handleKeyDown}>
            <Editor
              height="100%"
              defaultLanguage="sql"
              value={sql}
              onChange={v => setSql(v ?? '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: 'var(--mono)',
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                renderLineHighlight: 'line',
                padding: { top: 10, bottom: 10 },
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
              }}
            />
          </div>

          {/* Action bar */}
          <div style={{
            padding: '10px 16px', borderBottom: '1px solid var(--border)',
            background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
          }}>
            <button
              onClick={handleRun}
              disabled={running || loading || !challenge}
              style={{
                padding: '8px 20px', borderRadius: 'var(--radius)', border: 'none',
                background: running ? 'var(--surface2)' : 'var(--accent)', color: '#fff',
                fontSize: 14, fontWeight: 700, transition: 'all 0.15s',
                opacity: running || loading ? 0.6 : 1,
              }}
            >
              {running ? '⏳ Running…' : '▶ Run Query'}
            </button>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ctrl+Enter</span>

            {submitted && (
              <button
                onClick={nextChallenge}
                style={{
                  padding: '8px 20px', borderRadius: 'var(--radius)', border: 'none',
                  background: 'var(--green)', color: '#fff', fontSize: 14, fontWeight: 700,
                  marginLeft: 'auto',
                }}
              >
                Next Challenge →
              </button>
            )}
            {!submitted && (
              <button
                onClick={nextChallenge}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text-muted)', fontSize: 13, marginLeft: 'auto',
                }}
              >
                Skip
              </button>
            )}
          </div>

          {/* Results area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Feedback banner */}
            {runResult && (
              <div style={{
                padding: '12px 16px', borderRadius: 'var(--radius)',
                background: runResult.match ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${runResult.match ? 'var(--green)' : 'var(--red)'}`,
                display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
              }}>
                <span style={{ fontSize: 24 }}>{runResult.match ? '✅' : '❌'}</span>
                <div>
                  <div style={{ fontWeight: 700, color: runResult.match ? 'var(--green)' : 'var(--red)' }}>
                    {runResult.match ? 'Correct!' : 'Not quite'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{runResult.message}</div>
                </div>
                {stats.streak > 1 && runResult.match && (
                  <div style={{ marginLeft: 'auto', fontSize: 20, fontWeight: 700, color: 'var(--yellow)' }}>
                    🔥 {stats.streak} streak
                  </div>
                )}
              </div>
            )}

            {runError && (
              <div style={{
                padding: '12px 16px', borderRadius: 'var(--radius)',
                background: 'rgba(239,68,68,0.12)', border: '1px solid var(--red)',
              }}>
                <div style={{ fontWeight: 700, color: 'var(--red)', marginBottom: 4 }}>SQL Error</div>
                <code style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)' }}>{runError}</code>
              </div>
            )}

            {/* Result tables */}
            {runResult && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <ResultTable result={runResult.userResult} label="Your Output" />
                {(submitted || settings.mode !== 'exam') && (
                  <ResultTable result={runResult.expectedResult} label="Expected Output" />
                )}
              </div>
            )}

            {!runResult && !runError && !loading && challenge && (
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ fontSize: 40 }}>💻</div>
                <div style={{ fontSize: 14 }}>Write your SQL query above and press <strong>Run Query</strong></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={saveSettings}
          onClose={() => setShowSettings(false)}
          unlockedLevels={stats.unlockedLevels}
        />
      )}
    </div>
  );
}
