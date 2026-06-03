import React from 'react';
import { Stats } from '../types';

interface Props {
  stats: Stats;
  accuracy: number;
}

const s: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    padding: '10px 20px',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  logo: { fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 16, color: 'var(--accent)', marginRight: 8 },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: 700, lineHeight: 1.2 },
  statLabel: { fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  streak: { color: 'var(--yellow)' },
  spacer: { flex: 1 },
};

export function StatsBar({ stats, accuracy }: Props) {
  return (
    <div style={s.bar}>
      <span style={s.logo}>sql.train</span>
      <div style={s.stat}>
        <span style={s.statVal}>{stats.attempted}</span>
        <span style={s.statLabel}>attempted</span>
      </div>
      <div style={s.stat}>
        <span style={{ ...s.statVal, color: 'var(--green)' }}>{stats.correct}</span>
        <span style={s.statLabel}>correct</span>
      </div>
      <div style={s.stat}>
        <span style={s.statVal}>{accuracy}%</span>
        <span style={s.statLabel}>accuracy</span>
      </div>
      <div style={s.stat}>
        <span style={{ ...s.statVal, ...s.streak }}>🔥 {stats.streak}</span>
        <span style={s.statLabel}>streak</span>
      </div>
      <div style={s.stat}>
        <span style={{ ...s.statVal, color: 'var(--text-muted)' }}>{stats.bestStreak}</span>
        <span style={s.statLabel}>best streak</span>
      </div>
    </div>
  );
}
