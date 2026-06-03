import Database from 'better-sqlite3';

export function createSandboxDB(): Database.Database {
  // In-memory DB for each challenge session
  return new Database(':memory:');
}

export function runQuery(db: Database.Database, sql: string): { rows: Record<string, unknown>[]; columns: string[] } {
  const stmt = db.prepare(sql);
  const rows = stmt.all() as Record<string, unknown>[];
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { rows, columns };
}

export function execSQL(db: Database.Database, sql: string): void {
  db.exec(sql);
}
