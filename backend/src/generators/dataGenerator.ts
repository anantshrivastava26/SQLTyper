import { execSQL } from '../database/engine.js';
import Database from 'better-sqlite3';

const FIRST_NAMES = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Hank', 'Iris', 'Jack', 'Karen', 'Leo', 'Maya', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rosa', 'Sam', 'Tina'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore'];
const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Legal', 'Design'];
const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Books', 'Sports', 'Toys', 'Home', 'Beauty'];
const STATUSES = ['active', 'inactive', 'pending', 'completed', 'cancelled'];
const PRODUCTS = ['Laptop', 'Phone', 'Tablet', 'Monitor', 'Keyboard', 'Mouse', 'Headphones', 'Camera', 'Printer', 'Speaker'];

export function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function uniqueNames(n: number): string[] {
  const shuffled = shuffle(FIRST_NAMES);
  return shuffled.slice(0, n).map(f => `${f} ${pick(LAST_NAMES)}`);
}

export interface GeneratedData {
  setupSQL: string;
  params: Record<string, unknown>;
}

export function generateEmployeeTable(db: Database.Database, count = 10): void {
  execSQL(db, `
    CREATE TABLE employees (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      salary INTEGER NOT NULL,
      department TEXT NOT NULL,
      city TEXT NOT NULL,
      hire_year INTEGER NOT NULL
    )
  `);
  const names = uniqueNames(count);
  const depts = shuffle(DEPARTMENTS).slice(0, rand(3, 5));
  const insert = db.prepare('INSERT INTO employees VALUES (?, ?, ?, ?, ?, ?)');
  for (let i = 0; i < count; i++) {
    insert.run(i + 1, names[i], rand(30000, 150000), pick(depts), pick(CITIES), rand(2015, 2024));
  }
}

export function generateProductTable(db: Database.Database, count = 10): void {
  execSQL(db, `
    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL,
      rating REAL NOT NULL
    )
  `);
  const cats = shuffle(CATEGORIES).slice(0, rand(3, 5));
  const insert = db.prepare('INSERT INTO products VALUES (?, ?, ?, ?, ?, ?)');
  for (let i = 0; i < count; i++) {
    const name = `${pick(PRODUCTS)} ${String.fromCharCode(65 + i)}`;
    insert.run(i + 1, name, Math.round(rand(10, 999) * 100) / 100, pick(cats), rand(0, 500), Math.round(rand(10, 50)) / 10);
  }
}

export function generateOrderTables(db: Database.Database): void {
  execSQL(db, `
    CREATE TABLE customers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      email TEXT NOT NULL
    )
  `);
  execSQL(db, `
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      order_date TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  const custCount = rand(5, 8);
  const names = uniqueNames(custCount);
  const custInsert = db.prepare('INSERT INTO customers VALUES (?, ?, ?, ?)');
  for (let i = 0; i < custCount; i++) {
    custInsert.run(i + 1, names[i], pick(CITIES), `user${i + 1}@example.com`);
  }

  const orderInsert = db.prepare('INSERT INTO orders VALUES (?, ?, ?, ?, ?)');
  const orderCount = rand(8, 15);
  for (let i = 0; i < orderCount; i++) {
    const year = rand(2022, 2024);
    const month = String(rand(1, 12)).padStart(2, '0');
    const day = String(rand(1, 28)).padStart(2, '0');
    orderInsert.run(i + 1, rand(1, custCount), Math.round(rand(50, 2000) * 100) / 100, pick(STATUSES), `${year}-${month}-${day}`);
  }
}

export function generateSalesTables(db: Database.Database): void {
  execSQL(db, `
    CREATE TABLE departments (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      budget INTEGER NOT NULL
    )
  `);
  execSQL(db, `
    CREATE TABLE employees (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      department_id INTEGER NOT NULL,
      salary INTEGER NOT NULL,
      manager_id INTEGER,
      FOREIGN KEY (department_id) REFERENCES departments(id)
    )
  `);

  const deptNames = shuffle(DEPARTMENTS).slice(0, rand(3, 5));
  const deptInsert = db.prepare('INSERT INTO departments VALUES (?, ?, ?)');
  for (let i = 0; i < deptNames.length; i++) {
    deptInsert.run(i + 1, deptNames[i], rand(100000, 1000000));
  }

  const empCount = rand(8, 12);
  const names = uniqueNames(empCount);
  const empInsert = db.prepare('INSERT INTO employees VALUES (?, ?, ?, ?, ?)');
  for (let i = 0; i < empCount; i++) {
    const managerId = i === 0 ? null : rand(1, Math.max(1, i));
    empInsert.run(i + 1, names[i], rand(1, deptNames.length), rand(40000, 150000), managerId);
  }
}

export function generateScoresTable(db: Database.Database): void {
  execSQL(db, `
    CREATE TABLE scores (
      id INTEGER PRIMARY KEY,
      student TEXT NOT NULL,
      subject TEXT NOT NULL,
      score INTEGER NOT NULL,
      exam_date TEXT NOT NULL
    )
  `);
  const subjects = ['Math', 'Science', 'English', 'History', 'Art'];
  const students = uniqueNames(rand(4, 6));
  const insert = db.prepare('INSERT INTO scores VALUES (?, ?, ?, ?, ?)');
  let id = 1;
  for (const student of students) {
    for (const subject of shuffle(subjects).slice(0, rand(2, 5))) {
      const year = rand(2023, 2024);
      const month = String(rand(1, 12)).padStart(2, '0');
      const day = String(rand(1, 28)).padStart(2, '0');
      insert.run(id++, student, subject, rand(50, 100), `${year}-${month}-${day}`);
    }
  }
}
