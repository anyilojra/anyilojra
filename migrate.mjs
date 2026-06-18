import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

const db = drizzle(pool)

async function runMigrations() {
  try {
    console.log('Starting database migrations...')
    await migrate(db, { migrationsFolder: './drizzle' })
    console.log('Migrations completed successfully!')
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    await pool.end()
    process.exit(1)
  }
}

runMigrations()
