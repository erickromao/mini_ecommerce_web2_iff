import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

let initPromise: Promise<void> | null = null;

async function init() {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price FLOAT8 NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      image TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM users`;
  if ((n as number) === 0) {
    const hash = "$2b$10$.Ed82tIUCYmED3cI4TGaKO2r5jLyRIPw8UZgZ5m/hJn1LUMEsSsHK";
    await sql`
      INSERT INTO products (name, description, price, stock, category, active) VALUES
        ('Notebook Dell Inspiron', 'Notebook 15" Intel i7, 16GB RAM, SSD 512GB', 4299.99, 15, 'Eletrônicos', 1),
        ('Mouse Logitech MX Master', 'Mouse sem fio ergonômico para profissionais', 349.90, 42, 'Periféricos', 1),
        ('Teclado Mecânico Keychron', 'Teclado mecânico TKL com switches Brown', 599.00, 28, 'Periféricos', 1),
        ('Monitor 27" LG UltraWide', 'Monitor 27" IPS 4K 144Hz HDR400', 2199.00, 8, 'Monitores', 1),
        ('Cadeira Gamer ThunderX3', 'Cadeira ergonômica com suporte lombar ajustável', 1450.00, 5, 'Mobiliário', 0)
    `;
    await sql`
      INSERT INTO users (name, email, password, role, active) VALUES
        ('Admin', 'admin@loja.com', ${hash}, 'admin', 1),
        ('João Silva', 'joao@email.com', ${hash}, 'user', 1),
        ('Maria Santos', 'maria@email.com', ${hash}, 'user', 1)
    `;
  }
}

export function ensureDb(): Promise<void> {
  if (!initPromise) initPromise = init();
  return initPromise;
}

// Helper for dynamic queries (WHERE clauses built at runtime)
export async function rawSql<T = Record<string, unknown>>(
  queryString: string,
  params: (string | number)[] = []
): Promise<T[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (sql as any).query(queryString, params);
}
