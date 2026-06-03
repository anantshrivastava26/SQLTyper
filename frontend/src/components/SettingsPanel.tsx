import React from 'react';
import { Settings, Level } from '../types';

const ALL_LEVELS = Array.from({ length: 12 }, (_, i) => (i + 1) as Level);
const LEVEL_NAMES: Record<Level, string> = {
  1: 'SELECT', 2: 'WHERE', 3: 'ORDER BY', 4: 'LIMIT', 5: 'GROUP BY',
  6: 'HAVING', 7: 'INNER JOIN', 8: 'LEFT JOIN', 9: 'Subqueries',
  10: 'Window Fns', 11: 'CTEs', 12: 'Advanced',
};
const ALL_CONCEPTS = ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT', 'GROUP BY', 'HAVING', 'INNER JOIN', 'LEFT JOIN', 'Subqueries', 'Window Functions', 'CTEs', 'Advanced Analytics'];
const TIME_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Unlimited', value: null },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '120s', value: 120 },
];

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
  onClose: () => void;
  unlockedLevels: number[];
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  panel: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 12, padding: 24, width: 480, maxHeight: '80vh', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 20,
  },
  title: { fontSize: 18, fontWeight: 700 },
  section: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  chip: {
    padding: '4px 12px', borderRadius: 999, border: '1px solid var(--border)',
    fontSize: 12, cursor: 'pointer', transition: 'all 0.15s', background: 'var(--surface2)',
  },
  chipOn: { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' },
  chipOff: { color: 'var(--text)' },
  row: { display: 'flex', gap: 8 },
  modeBtn: {
    flex: 1, padding: '8px 0', borderRadius: 'var(--radius)',
    border: '1px solid var(--border)', fontSize: 13, fontWeight: 600,
    background: 'var(--surface2)', color: 'var(--text)', transition: 'all 0.15s',
  },
  actions: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  btn: {
    padding: '8px 20px', borderRadius: 'var(--radius)', border: 'none',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
};

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

export function SettingsPanel({ settings, onChange, onClose, unlockedLevels }: Props) {
  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.panel} onClick={e => e.stopPropagation()}>
        <div style={s.title}>⚙️ Settings</div>

        <div style={s.section}>
          <div style={s.label}>Levels (unlocked)</div>
          <div style={s.chips}>
            {ALL_LEVELS.map(l => {
              const unlocked = unlockedLevels.includes(l);
              const on = settings.selectedLevels.includes(l);
              return (
                <div
                  key={l}
                  style={{
                    ...s.chip,
                    ...(on ? s.chipOn : s.chipOff),
                    opacity: unlocked ? 1 : 0.35,
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                  }}
                  onClick={() => unlocked && onChange({ ...settings, selectedLevels: toggle(settings.selectedLevels, l) })}
                >
                  {LEVEL_NAMES[l]}
                </div>
              );
            })}
          </div>
        </div>

        <div style={s.section}>
          <div style={s.label}>Mode</div>
          <div style={s.row}>
            {(['learning', 'exam', 'speed'] as const).map(m => (
              <button
                key={m}
                style={{
                  ...s.modeBtn,
                  ...(settings.mode === m ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' } : {}),
                }}
                onClick={() => onChange({ ...settings, mode: m })}
              >
                {m === 'learning' ? '📚 Learning' : m === 'exam' ? '📝 Exam' : '⚡ Speed'}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {settings.mode === 'learning' && 'Hints visible. No time pressure.'}
            {settings.mode === 'exam' && 'No hints. Compare results only after submit.'}
            {settings.mode === 'speed' && 'Timer active. Fastest correct answers score highest streak.'}
          </div>
        </div>

        <div style={s.section}>
          <div style={s.label}>Time Limit</div>
          <div style={s.row}>
            {TIME_OPTIONS.map(opt => (
              <button
                key={String(opt.value)}
                style={{
                  ...s.modeBtn,
                  ...(settings.timeLimit === opt.value ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' } : {}),
                }}
                onClick={() => onChange({ ...settings, timeLimit: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={s.actions}>
          <button style={{ ...s.btn, background: 'var(--accent)', color: '#fff' }} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
