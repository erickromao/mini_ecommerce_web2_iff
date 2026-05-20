import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH =
  process.env.NODE_ENV === "production"
    ? "/tmp/database.db"
    : path.join(process.cwd(), "database.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const isNew = !fs.existsSync(DB_PATH);
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  if (isNew) {
    initSchema(db);
    seedData(db);
  }

  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function seedData(db: Database.Database) {
  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, stock, category, active)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const products = [
    ["Notebook Dell Inspiron", "Notebook 15\" Intel i7, 16GB RAM, SSD 512GB", 4299.99, 15, "Eletrônicos", 1],
    ["Mouse Logitech MX Master", "Mouse sem fio ergonômico para profissionais", 349.90, 42, "Periféricos", 1],
    ["Teclado Mecânico Keychron", "Teclado mecânico TKL com switches Brown", 599.00, 28, "Periféricos", 1],
    ["Monitor 27\" LG UltraWide", "Monitor 27\" IPS 4K 144Hz HDR400", 2199.00, 8, "Monitores", 1],
    ["Cadeira Gamer ThunderX3", "Cadeira ergonômica com suporte lombar ajustável", 1450.00, 5, "Mobiliário", 0],
  ];

  for (const p of products) {
    insertProduct.run(...p);
  }

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role, active)
    VALUES (?, ?, ?, ?, ?)
  `);

  // passwords are "senha123" hashed — but for seed we store a fixed bcrypt hash
  const hash = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"; // "senha123"
  insertUser.run("Admin", "admin@loja.com", hash, "admin", 1);
  insertUser.run("João Silva", "joao@email.com", hash, "user", 1);
  insertUser.run("Maria Santos", "maria@email.com", hash, "user", 1);
}
