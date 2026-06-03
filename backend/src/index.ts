import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { createSandboxDB, runQuery } from './database/engine.js';
import templates, { Level, LEVEL_NAMES } from './challenges/templates.js';
import { compareResults } from './validators/compareResults.js';
import Database from 'better-sqlite3';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store: sessionId -> { db, solution, description }
const sessions = new Map<string, { db: Database.Database; solution: string; description: string; level: Level; concept: string }>();

// Clean up old sessions every 10 minutes
setInterval(() => {
  if (sessions.size > 200) {
    const keys = [...sessions.keys()].slice(0, 100);
    for (const k of keys) {
      sessions.get(k)?.db.close();
      sessions.delete(k);
    }
  }
}, 10 * 60 * 1000);

function pickTemplate(level?: Level, conceptFilter?: string[]) {
  let pool = templates;
  if (level) pool = pool.filter(t => t.level === level);
  if (conceptFilter && conceptFilter.length > 0) {
    pool = pool.filter(t => conceptFilter.includes(t.concept));
  }
  if (pool.length === 0) pool = templates;
  return pool[Math.floor(Math.random() * pool.length)];
}

// GET /challenge?level=1&concepts=WHERE,GROUP BY
app.get('/challenge', (req, res) => {
  const level = req.query.level ? (parseInt(req.query.level as string) as Level) : undefined;
  const concepts = req.query.concepts ? (req.query.concepts as string).split(',') : undefined;

  const template = pickTemplate(level, concepts);
  const db = createSandboxDB();
  let result;
  try {
    result = template.generate(db);
  } catch (e) {
    db.close();
    return res.status(500).json({ error: 'Failed to generate challenge' });
  }

  // Get schema info
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
  const schema: Record<string, { columns: string[]; rows: unknown[][] }> = {};
  for (const { name } of tables) {
    const cols = db.prepare(`PRAGMA table_info(${name})`).all() as { name: string }[];
    const rows = db.prepare(`SELECT * FROM ${name} LIMIT 5`).all() as Record<string, unknown>[];
    schema[name] = {
      columns: cols.map(c => c.name),
      rows: rows.map(r => Object.values(r)),
    };
  }

  const sessionId = uuidv4();
  sessions.set(sessionId, {
    db,
    solution: result.solution,
    description: result.description,
    level: template.level,
    concept: template.concept,
  });

  res.json({
    sessionId,
    description: result.description,
    hints: result.hints,
    level: template.level,
    levelName: LEVEL_NAMES[template.level],
    concept: template.concept,
    difficulty: template.difficulty,
    schema,
  });
});

// POST /run { sessionId, sql }
app.post('/run', (req, res) => {
  const { sessionId, sql } = req.body as { sessionId: string; sql: string };
  const session = sessions.get(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found. Request a new challenge.' });

  if (!sql || sql.trim() === '') {
    return res.status(400).json({ error: 'No SQL provided.' });
  }

  // Safety: block DDL/DML writes on the main session DB
  const normalized = sql.trim().toUpperCase();
  const blocked = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE', 'TRUNCATE'];
  for (const kw of blocked) {
    if (normalized.startsWith(kw)) {
      return res.status(400).json({ error: `${kw} statements are not allowed in query mode.` });
    }
  }

  try {
    const userResult = runQuery(session.db, sql);
    const expectedResult = runQuery(session.db, session.solution);
    const comparison = compareResults(expectedResult, userResult);

    res.json({
      userResult,
      expectedResult,
      match: comparison.match,
      message: comparison.message,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(400).json({ error: msg });
  }
});

// GET /levels
app.get('/levels', (_req, res) => {
  res.json(LEVEL_NAMES);
});

// GET /concepts
app.get('/concepts', (_req, res) => {
  const concepts = [...new Set(templates.map(t => t.concept))];
  res.json(concepts);
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`SQL Trainer backend running on http://localhost:${PORT}`);
});
