import { Pool, PoolClient, QueryResultRow } from "pg";

let pool: Pool;

function getPool(): Pool {
    if (!pool) {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL environment variable is not set.");
        }
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            max: 10,
            idleTimeoutMillis: 30_000,
            connectionTimeoutMillis: 5_000,
        });

        pool.on("error", (err) => {
            console.error("Unexpected PostgreSQL pool error:", err);
        });
    }
    return pool;
}

/** Execute a parameterised query and return all rows. */
export async function query<T extends QueryResultRow = Record<string, unknown>>(
    text: string,
    values?: unknown[]
): Promise<T[]> {
    const client: PoolClient = await getPool().connect();
    try {
        const result = await client.query<T>(text, values);
        return result.rows;
    } finally {
        client.release();
    }
}

/** Execute a parameterised query and return the first row or null. */
export async function queryOne<T extends QueryResultRow = Record<string, unknown>>(
    text: string,
    values?: unknown[]
): Promise<T | null> {
    const rows = await query<T>(text, values);
    return rows[0] ?? null;
}
