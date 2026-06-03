import { rand, pick } from '../generators/dataGenerator.js';
import Database from 'better-sqlite3';
import {
  generateEmployeeTable,
  generateProductTable,
  generateOrderTables,
  generateSalesTables,
  generateScoresTable
} from '../generators/dataGenerator.js';

export type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface ChallengeTemplate {
  id: string;
  level: Level;
  concept: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  generate: (db: Database.Database) => { description: string; solution: string; hints: string[] };
}

export const LEVEL_NAMES: Record<Level, string> = {
  1: 'SELECT',
  2: 'WHERE',
  3: 'ORDER BY',
  4: 'LIMIT',
  5: 'GROUP BY',
  6: 'HAVING',
  7: 'INNER JOIN',
  8: 'LEFT JOIN',
  9: 'Subqueries',
  10: 'Window Functions',
  11: 'CTEs',
  12: 'Advanced Analytics',
};

const templates: ChallengeTemplate[] = [
  // ─── LEVEL 1: SELECT ─────────────────────────────────────────────────────
  {
    id: 'select_all',
    level: 1,
    concept: 'SELECT',
    difficulty: 'beginner',
    generate(db) {
      generateEmployeeTable(db);
      return {
        description: 'Retrieve all columns and rows from the `employees` table.',
        solution: 'SELECT * FROM employees',
        hints: ['Use SELECT * to get all columns', 'FROM specifies the table'],
      };
    },
  },
  {
    id: 'select_columns',
    level: 1,
    concept: 'SELECT',
    difficulty: 'beginner',
    generate(db) {
      generateEmployeeTable(db);
      const cols = pick([
        ['name', 'salary'],
        ['name', 'department'],
        ['name', 'city'],
        ['id', 'name', 'salary'],
      ]);
      return {
        description: `Select only the **${cols.join(', ')}** columns from the \`employees\` table.`,
        solution: `SELECT ${cols.join(', ')} FROM employees`,
        hints: ['List column names separated by commas after SELECT'],
      };
    },
  },
  {
    id: 'select_products',
    level: 1,
    concept: 'SELECT',
    difficulty: 'beginner',
    generate(db) {
      generateProductTable(db);
      return {
        description: 'Retrieve all products with their names and prices.',
        solution: 'SELECT name, price FROM products',
        hints: ['SELECT specific columns: name and price'],
      };
    },
  },

  // ─── LEVEL 2: WHERE ───────────────────────────────────────────────────────
  {
    id: 'where_salary_gt',
    level: 2,
    concept: 'WHERE',
    difficulty: 'beginner',
    generate(db) {
      generateEmployeeTable(db);
      const threshold = pick([50000, 60000, 70000, 80000, 90000]);
      return {
        description: `Find all employees with a salary **greater than ${threshold.toLocaleString()}**.`,
        solution: `SELECT * FROM employees WHERE salary > ${threshold}`,
        hints: ['Use WHERE salary > value', 'No quotes needed for numbers'],
      };
    },
  },
  {
    id: 'where_department',
    level: 2,
    concept: 'WHERE',
    difficulty: 'beginner',
    generate(db) {
      generateEmployeeTable(db);
      const dept = pick(['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']);
      // Make sure at least one row matches
      db.prepare("INSERT INTO employees VALUES (99, 'Test User', 75000, ?, 'Chicago', 2020)").run(dept);
      return {
        description: `Find all employees who work in the **${dept}** department.`,
        solution: `SELECT * FROM employees WHERE department = '${dept}'`,
        hints: ["String values need single quotes", "Use = for exact match"],
      };
    },
  },
  {
    id: 'where_salary_between',
    level: 2,
    concept: 'WHERE',
    difficulty: 'beginner',
    generate(db) {
      generateEmployeeTable(db);
      const lo = pick([40000, 50000, 60000]);
      const hi = lo + rand(20000, 40000);
      return {
        description: `Find employees with salary **between ${lo.toLocaleString()} and ${hi.toLocaleString()}** (inclusive).`,
        solution: `SELECT * FROM employees WHERE salary BETWEEN ${lo} AND ${hi}`,
        hints: ['BETWEEN x AND y is inclusive on both ends', 'You can also use >= and <='],
      };
    },
  },
  {
    id: 'where_product_price',
    level: 2,
    concept: 'WHERE',
    difficulty: 'beginner',
    generate(db) {
      generateProductTable(db);
      const maxPrice = pick([100, 200, 300, 500]);
      return {
        description: `Find all products with a price **less than ${maxPrice}**.`,
        solution: `SELECT * FROM products WHERE price < ${maxPrice}`,
        hints: ['Use the < operator for less than'],
      };
    },
  },

  // ─── LEVEL 3: ORDER BY ────────────────────────────────────────────────────
  {
    id: 'order_salary_desc',
    level: 3,
    concept: 'ORDER BY',
    difficulty: 'beginner',
    generate(db) {
      generateEmployeeTable(db);
      return {
        description: 'List all employees **ordered by salary from highest to lowest**.',
        solution: 'SELECT * FROM employees ORDER BY salary DESC',
        hints: ['ORDER BY column DESC for descending', 'Default is ASC (ascending)'],
      };
    },
  },
  {
    id: 'order_name_asc',
    level: 3,
    concept: 'ORDER BY',
    difficulty: 'beginner',
    generate(db) {
      generateEmployeeTable(db);
      return {
        description: 'List all employees **alphabetically by name**.',
        solution: 'SELECT * FROM employees ORDER BY name ASC',
        hints: ['ORDER BY name ASC sorts A to Z'],
      };
    },
  },
  {
    id: 'order_multi',
    level: 3,
    concept: 'ORDER BY',
    difficulty: 'beginner',
    generate(db) {
      generateEmployeeTable(db);
      return {
        description: 'List all employees **ordered by department (A-Z), then by salary (highest first)** within each department.',
        solution: 'SELECT * FROM employees ORDER BY department ASC, salary DESC',
        hints: ['You can ORDER BY multiple columns separated by commas'],
      };
    },
  },

  // ─── LEVEL 4: LIMIT ───────────────────────────────────────────────────────
  {
    id: 'limit_top',
    level: 4,
    concept: 'LIMIT',
    difficulty: 'beginner',
    generate(db) {
      generateEmployeeTable(db);
      const n = pick([3, 5]);
      return {
        description: `Find the **top ${n} highest-paid employees**.`,
        solution: `SELECT * FROM employees ORDER BY salary DESC LIMIT ${n}`,
        hints: ['ORDER BY salary DESC first, then LIMIT'],
      };
    },
  },
  {
    id: 'limit_products',
    level: 4,
    concept: 'LIMIT',
    difficulty: 'beginner',
    generate(db) {
      generateProductTable(db);
      const n = pick([3, 5]);
      return {
        description: `Retrieve the **${n} cheapest products** (by price).`,
        solution: `SELECT * FROM products ORDER BY price ASC LIMIT ${n}`,
        hints: ['ORDER BY price ASC for cheapest, then LIMIT'],
      };
    },
  },

  // ─── LEVEL 5: GROUP BY ────────────────────────────────────────────────────
  {
    id: 'group_avg_salary',
    level: 5,
    concept: 'GROUP BY',
    difficulty: 'intermediate',
    generate(db) {
      generateEmployeeTable(db);
      return {
        description: 'Show the **average salary per department**.',
        solution: 'SELECT department, AVG(salary) AS avg_salary FROM employees GROUP BY department',
        hints: ['GROUP BY department', 'AVG() is an aggregate function'],
      };
    },
  },
  {
    id: 'group_count_dept',
    level: 5,
    concept: 'GROUP BY',
    difficulty: 'intermediate',
    generate(db) {
      generateEmployeeTable(db);
      return {
        description: 'Show how many employees are in **each department**.',
        solution: 'SELECT department, COUNT(*) AS employee_count FROM employees GROUP BY department',
        hints: ['COUNT(*) counts all rows in each group'],
      };
    },
  },
  {
    id: 'group_max_salary',
    level: 5,
    concept: 'GROUP BY',
    difficulty: 'intermediate',
    generate(db) {
      generateEmployeeTable(db);
      return {
        description: 'Find the **highest salary in each department**.',
        solution: 'SELECT department, MAX(salary) AS max_salary FROM employees GROUP BY department',
        hints: ['Use MAX() aggregate function'],
      };
    },
  },
  {
    id: 'group_products_category',
    level: 5,
    concept: 'GROUP BY',
    difficulty: 'intermediate',
    generate(db) {
      generateProductTable(db);
      return {
        description: 'Show the **total stock and average price per category**.',
        solution: 'SELECT category, SUM(stock) AS total_stock, ROUND(AVG(price), 2) AS avg_price FROM products GROUP BY category',
        hints: ['SUM() for total, AVG() for average', 'ROUND(value, 2) for 2 decimal places'],
      };
    },
  },

  // ─── LEVEL 6: HAVING ─────────────────────────────────────────────────────
  {
    id: 'having_avg_salary',
    level: 6,
    concept: 'HAVING',
    difficulty: 'intermediate',
    generate(db) {
      generateEmployeeTable(db);
      const threshold = pick([60000, 70000, 80000]);
      return {
        description: `Find departments where the **average salary exceeds ${threshold.toLocaleString()}**.`,
        solution: `SELECT department, AVG(salary) AS avg_salary FROM employees GROUP BY department HAVING AVG(salary) > ${threshold}`,
        hints: ['HAVING filters after GROUP BY', 'WHERE filters before grouping'],
      };
    },
  },
  {
    id: 'having_count',
    level: 6,
    concept: 'HAVING',
    difficulty: 'intermediate',
    generate(db) {
      generateEmployeeTable(db);
      const minCount = pick([2, 3]);
      return {
        description: `Find departments that have **at least ${minCount} employees**.`,
        solution: `SELECT department, COUNT(*) AS employee_count FROM employees GROUP BY department HAVING COUNT(*) >= ${minCount}`,
        hints: ['Use COUNT(*) in both SELECT and HAVING'],
      };
    },
  },

  // ─── LEVEL 7: INNER JOIN ─────────────────────────────────────────────────
  {
    id: 'join_orders_customers',
    level: 7,
    concept: 'INNER JOIN',
    difficulty: 'intermediate',
    generate(db) {
      generateOrderTables(db);
      return {
        description: 'List all orders with the **customer name, order amount, and status**. Only include orders that have a matching customer.',
        solution: 'SELECT customers.name, orders.amount, orders.status FROM orders INNER JOIN customers ON orders.customer_id = customers.id',
        hints: ['INNER JOIN returns rows matching in both tables', 'ON specifies the join condition'],
      };
    },
  },
  {
    id: 'join_employee_dept',
    level: 7,
    concept: 'INNER JOIN',
    difficulty: 'intermediate',
    generate(db) {
      generateSalesTables(db);
      return {
        description: 'Show each employee\'s **name, salary, and department name** (join employees with departments).',
        solution: 'SELECT employees.name, employees.salary, departments.name AS department FROM employees INNER JOIN departments ON employees.department_id = departments.id',
        hints: ['Join on department_id = departments.id', 'Alias the department name column'],
      };
    },
  },

  // ─── LEVEL 8: LEFT JOIN ──────────────────────────────────────────────────
  {
    id: 'left_join_customers_orders',
    level: 8,
    concept: 'LEFT JOIN',
    difficulty: 'intermediate',
    generate(db) {
      generateOrderTables(db);
      // Add a customer with no orders
      db.prepare("INSERT INTO customers VALUES (99, 'No Orders Person', 'Boston', 'none@example.com')").run();
      return {
        description: 'List **all customers** and their order amounts. Include customers who have **no orders** (show NULL for amount).',
        solution: 'SELECT customers.name, orders.amount FROM customers LEFT JOIN orders ON customers.id = orders.customer_id',
        hints: ['LEFT JOIN keeps all rows from the left table', 'Non-matching rows show NULL'],
      };
    },
  },
  {
    id: 'left_join_count_orders',
    level: 8,
    concept: 'LEFT JOIN',
    difficulty: 'intermediate',
    generate(db) {
      generateOrderTables(db);
      db.prepare("INSERT INTO customers VALUES (99, 'No Orders Person', 'Boston', 'none@example.com')").run();
      return {
        description: 'Show **each customer and the number of orders** they have placed. Include customers with zero orders.',
        solution: 'SELECT customers.name, COUNT(orders.id) AS order_count FROM customers LEFT JOIN orders ON customers.id = orders.customer_id GROUP BY customers.id, customers.name',
        hints: ['COUNT(orders.id) counts non-NULL values (0 for customers with no orders)', 'GROUP BY customers.id'],
      };
    },
  },

  // ─── LEVEL 9: SUBQUERIES ─────────────────────────────────────────────────
  {
    id: 'subquery_above_avg',
    level: 9,
    concept: 'Subqueries',
    difficulty: 'advanced',
    generate(db) {
      generateEmployeeTable(db);
      return {
        description: 'Find all employees whose salary is **above the overall average salary**.',
        solution: 'SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)',
        hints: ['Use a subquery in the WHERE clause', 'The subquery calculates the average salary'],
      };
    },
  },
  {
    id: 'subquery_max_per_dept',
    level: 9,
    concept: 'Subqueries',
    difficulty: 'advanced',
    generate(db) {
      generateEmployeeTable(db);
      return {
        description: 'Find employees who earn the **maximum salary in their department**.',
        solution: `SELECT e1.* FROM employees e1
WHERE e1.salary = (
  SELECT MAX(e2.salary) FROM employees e2
  WHERE e2.department = e1.department
)`,
        hints: ['Use a correlated subquery referencing the outer query', 'Match on department'],
      };
    },
  },
  {
    id: 'subquery_in',
    level: 9,
    concept: 'Subqueries',
    difficulty: 'advanced',
    generate(db) {
      generateOrderTables(db);
      const status = pick(['completed', 'active']);
      return {
        description: `Find the **names of customers** who have placed at least one **${status}** order.`,
        solution: `SELECT DISTINCT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = '${status}')`,
        hints: ['Use IN with a subquery', 'DISTINCT prevents duplicate names'],
      };
    },
  },

  // ─── LEVEL 10: WINDOW FUNCTIONS ──────────────────────────────────────────
  {
    id: 'window_rank_salary',
    level: 10,
    concept: 'Window Functions',
    difficulty: 'advanced',
    generate(db) {
      generateEmployeeTable(db);
      return {
        description: 'Rank employees by salary within each department using **RANK()** (highest salary = rank 1). Show name, department, salary, and rank.',
        solution: `SELECT name, department, salary,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS salary_rank
FROM employees`,
        hints: ['RANK() OVER (PARTITION BY ... ORDER BY ...)', 'PARTITION BY splits into groups'],
      };
    },
  },
  {
    id: 'window_row_number',
    level: 10,
    concept: 'Window Functions',
    difficulty: 'advanced',
    generate(db) {
      generateScoresTable(db);
      return {
        description: 'For each student, number their exam scores **from highest to lowest** using **ROW_NUMBER()**. Show student, subject, score, and row number.',
        solution: `SELECT student, subject, score,
  ROW_NUMBER() OVER (PARTITION BY student ORDER BY score DESC) AS rn
FROM scores`,
        hints: ['ROW_NUMBER() assigns unique sequential integers', 'PARTITION BY student resets the count per student'],
      };
    },
  },
  {
    id: 'window_running_total',
    level: 10,
    concept: 'Window Functions',
    difficulty: 'advanced',
    generate(db) {
      generateOrderTables(db);
      return {
        description: 'Calculate the **running total of order amounts** ordered by order id. Show order id, amount, and running total.',
        solution: `SELECT id, amount,
  SUM(amount) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM orders`,
        hints: ['SUM() OVER (ORDER BY ...) creates a running total', 'ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is explicit but optional here'],
      };
    },
  },
  {
    id: 'window_dense_rank',
    level: 10,
    concept: 'Window Functions',
    difficulty: 'advanced',
    generate(db) {
      generateEmployeeTable(db);
      return {
        description: 'Use **DENSE_RANK()** to rank all employees by salary (highest first). Unlike RANK(), dense rank has no gaps. Show name, salary, and dense rank.',
        solution: `SELECT name, salary,
  DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rank
FROM employees`,
        hints: ['DENSE_RANK() vs RANK(): no gaps in dense rank', 'No PARTITION BY means global ranking'],
      };
    },
  },

  // ─── LEVEL 11: CTEs ──────────────────────────────────────────────────────
  {
    id: 'cte_above_avg',
    level: 11,
    concept: 'CTEs',
    difficulty: 'advanced',
    generate(db) {
      generateEmployeeTable(db);
      return {
        description: 'Using a **CTE**, find employees earning above the average salary. Name the CTE `avg_sal`.',
        solution: `WITH avg_sal AS (
  SELECT AVG(salary) AS avg_salary FROM employees
)
SELECT e.* FROM employees e, avg_sal
WHERE e.salary > avg_sal.avg_salary`,
        hints: ['WITH cte_name AS (SELECT ...) defines the CTE', 'Reference it like a table in the main query'],
      };
    },
  },
  {
    id: 'cte_dept_stats',
    level: 11,
    concept: 'CTEs',
    difficulty: 'advanced',
    generate(db) {
      generateEmployeeTable(db);
      return {
        description: 'Using a **CTE** named `dept_stats`, compute average and max salary per department, then select all departments where the max salary is more than double the average salary.',
        solution: `WITH dept_stats AS (
  SELECT department, AVG(salary) AS avg_salary, MAX(salary) AS max_salary
  FROM employees
  GROUP BY department
)
SELECT * FROM dept_stats WHERE max_salary > avg_salary * 2`,
        hints: ['CTE first computes aggregates per department', 'Main query filters on the computed values'],
      };
    },
  },
  {
    id: 'cte_top_per_dept',
    level: 11,
    concept: 'CTEs',
    difficulty: 'advanced',
    generate(db) {
      generateEmployeeTable(db);
      return {
        description: 'Using a **CTE with a window function**, find the highest-paid employee in each department. Name the CTE `ranked`.',
        solution: `WITH ranked AS (
  SELECT *, RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rnk
  FROM employees
)
SELECT * FROM ranked WHERE rnk = 1`,
        hints: ['Use RANK() inside the CTE', 'Filter WHERE rnk = 1 in the outer query'],
      };
    },
  },

  // ─── LEVEL 12: ADVANCED ANALYTICS ───────────────────────────────────────
  {
    id: 'adv_lag_lead',
    level: 12,
    concept: 'Advanced Analytics',
    difficulty: 'expert',
    generate(db) {
      generateOrderTables(db);
      return {
        description: 'For each order (ordered by id), show the **current amount**, the **previous order amount** (LAG), and the **next order amount** (LEAD). Use NULL for missing values.',
        solution: `SELECT id, amount,
  LAG(amount) OVER (ORDER BY id) AS prev_amount,
  LEAD(amount) OVER (ORDER BY id) AS next_amount
FROM orders`,
        hints: ['LAG() gets previous row value', 'LEAD() gets next row value'],
      };
    },
  },
  {
    id: 'adv_percent_rank',
    level: 12,
    concept: 'Advanced Analytics',
    difficulty: 'expert',
    generate(db) {
      generateEmployeeTable(db);
      return {
        description: 'Calculate the **percentile rank** of each employee\'s salary using **PERCENT_RANK()**. Show name, salary, and percent rank (as a decimal 0–1).',
        solution: `SELECT name, salary,
  ROUND(PERCENT_RANK() OVER (ORDER BY salary), 4) AS pct_rank
FROM employees`,
        hints: ['PERCENT_RANK() returns values 0 to 1', 'ROUND to 4 decimal places'],
      };
    },
  },
  {
    id: 'adv_ntile',
    level: 12,
    concept: 'Advanced Analytics',
    difficulty: 'expert',
    generate(db) {
      generateEmployeeTable(db);
      const n = pick([4, 5]);
      return {
        description: `Divide employees into **${n} salary buckets** using **NTILE(${n})** ordered by salary ascending. Show name, salary, and bucket number.`,
        solution: `SELECT name, salary,
  NTILE(${n}) OVER (ORDER BY salary ASC) AS bucket
FROM employees`,
        hints: [`NTILE(${n}) splits rows into ${n} roughly equal groups`, 'ORDER BY salary ASC puts lowest earners in bucket 1'],
      };
    },
  },
];

export default templates;
