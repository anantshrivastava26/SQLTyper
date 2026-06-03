import React from 'react';
import { QueryResult } from '../types';

interface Props {
  result: QueryResult;
  label: string;
  highlight?: boolean;
}

const s: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' },
  scroll: { overflowX: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--border)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th: {
    padding: '5px 10px',
    textAlign: 'left',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-muted)',
    fontFamily: 'var(--mono)',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '4px 10px',
    borderBottom: '1px solid var(--border)',
    fontFamily: 'var(--mono)',
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  empty: { padding: '12px', color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' },
  count: { fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' },
};

export function ResultTable({ result, label }: Props) {
  return (
    <div style={s.wrap}>
      <div style={s.label}>{label}</div>
      {result.rows.length === 0 ? (
        <div style={{ ...s.scroll, background: 'var(--surface2)' }}>
          <div style={s.empty}>No rows returned</div>
        </div>
      ) : (
        <>
          <div style={s.scroll}>
            <table style={s.table}>
              <thead>
                <tr>{result.columns.map(c => <th key={c} style={s.th}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {result.rows.slice(0, 50).map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'var(--surface2)' : 'var(--surface)' }}>
                    {result.columns.map(c => (
                      <td key={c} style={s.td}>
                        {row[c] === null ? <span style={{ color: 'var(--text-muted)' }}>NULL</span> : String(row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={s.count}>{result.rows.length} row{result.rows.length !== 1 ? 's' : ''}</div>
        </>
      )}
    </div>
  );
}
