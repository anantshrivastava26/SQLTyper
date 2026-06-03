export interface QueryResult {
  rows: Record<string, unknown>[];
  columns: string[];
}

function normalizeValue(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(Math.round(v * 10000) / 10000);
  return String(v).trim().toLowerCase();
}

function normalizeRow(row: Record<string, unknown>): string[] {
  return Object.values(row).map(normalizeValue).sort();
}

export function compareResults(
  expected: QueryResult,
  actual: QueryResult
): { match: boolean; message: string } {
  if (actual.rows.length === 0 && expected.rows.length === 0) {
    return { match: true, message: 'Both queries returned no rows.' };
  }

  if (actual.rows.length !== expected.rows.length) {
    return {
      match: false,
      message: `Row count mismatch: expected ${expected.rows.length} rows, got ${actual.rows.length}.`,
    };
  }

  // Compare as multisets (order-independent)
  const expectedStrings = expected.rows.map(r => normalizeRow(r).join('|')).sort();
  const actualStrings = actual.rows.map(r => normalizeRow(r).join('|')).sort();

  for (let i = 0; i < expectedStrings.length; i++) {
    if (expectedStrings[i] !== actualStrings[i]) {
      return {
        match: false,
        message: 'Result data does not match. Check your values and conditions.',
      };
    }
  }

  return { match: true, message: 'Correct!' };
}
