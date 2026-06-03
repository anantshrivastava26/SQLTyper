import React, { useState } from 'react';
import { SchemaTable } from '../types';

interface Props {
  schema: Record<string, SchemaTable>;
}

const s: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  tableCard: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
  },
  header: {
    padding: '6px 12px',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    userSelect: 'none',
  },
  tableName: { fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--blue)' },
  tableBody: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th: {
    padding: '5px 10px',
    textAlign: 'left',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text-muted)',
    fontWeight: 600,
    fontFamily: 'var(--mono)',
    whiteSpace: 'nowrap',
    background: 'var(--surface)',
  },
  td: {
    padding: '4px 10px',
    borderBottom: '1px solid var(--border)',
    fontFamily: 'var(--mono)',
    color: 'var(--text)',
    whiteSpace: 'nowrap',
  },
  caption: { padding: '4px 10px', color: 'var(--text-muted)', fontSize: 11, borderTop: '1px solid var(--border)' },
};

export function SchemaViewer({ schema }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div style={s.wrap}>
      {Object.entries(schema).map(([name, table]) => (
        <div key={name} style={s.tableCard}>
          <div style={s.header} onClick={() => setCollapsed(c => ({ ...c, [name]: !c[name] }))}>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{collapsed[name] ? '▶' : '▼'}</span>
            <span style={s.tableName}>{name}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({table.columns.join(', ')})</span>
          </div>
          {!collapsed[name] && (
            <div style={s.tableBody}>
              <table style={s.table}>
                <thead>
                  <tr>{table.columns.map(c => <th key={c} style={s.th}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {table.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} style={s.td}>
                          {cell === null ? <span style={{ color: 'var(--text-muted)' }}>NULL</span> : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={s.caption}>Showing up to 5 sample rows</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
