import React from 'react';
import { Stats, Level } from '../types';

const LEVEL_NAMES: Record<number, string> = {
  1: 'SELECT', 2: 'WHERE', 3: 'ORDER BY', 4: 'LIMIT', 5: 'GROUP BY',
  6: 'HAVING', 7: 'INNER JOIN', 8: 'LEFT JOIN', 9: 'Subqueries',
  10: 'Window Fns', 11: 'CTEs', 12: 'Advanced',
};

interface Props {
  stats: Stats;
  currentLevel: Level | null;
  onSelectLevel: (l: Level) => void;
}

const s: Record<string, React.CSSProperties> = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  card: {
    padding: '8px 10px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  lvlNum: { fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 },
  lvlName: { fontSize: 12, fontWeight: 600, fontFamily: 'var(--mono)' },
  bar: { height: 3, borderRadius: 2, background: 'var(--border)', marginTop: 2 },
  fill: { height: '100%', borderRadius: 2, background: 'var(--accent)', transition: 'width 0.3s' },
  stats: { fontSize: 10, color: 'var(--text-muted)' },
};

export function LevelProgress({ stats, currentLevel, onSelectLevel }: Props) {
  return (
    <div style={s.grid}>
      {(Array.from({ length: 12 }, (_, i) => i + 1) as Level[]).map(lvl => {
        const unlocked = stats.unlockedLevels.includes(lvl);
        const lp = stats.levelProgress[lvl];
        const acc = lp && lp.attempted > 0 ? Math.round((lp.correct / lp.attempted) * 100) : 0;
        const isActive = currentLevel === lvl;

        return (
          <div
            key={lvl}
            style={{
              ...s.card,
              background: isActive ? 'var(--accent)' : unlocked ? 'var(--surface2)' : 'var(--surface)',
              opacity: unlocked ? 1 : 0.45,
              borderColor: isActive ? 'var(--accent)' : 'var(--border)',
            }}
            onClick={() => unlocked && onSelectLevel(lvl)}
            title={unlocked ? `Level ${lvl}: ${LEVEL_NAMES[lvl]}` : 'Locked — complete previous level'}
          >
            <div style={{ ...s.lvlNum, color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>
              LVL {lvl} {!unlocked && '🔒'}
            </div>
            <div style={{ ...s.lvlName, color: isActive ? '#fff' : 'var(--text)' }}>{LEVEL_NAMES[lvl]}</div>
            {lp && (
              <>
                <div style={s.bar}>
                  <div style={{ ...s.fill, width: `${acc}%`, background: isActive ? '#fff' : 'var(--accent)' }} />
                </div>
                <div style={{ ...s.stats, color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>
                  {lp.correct}/{lp.attempted} · {acc}%
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
