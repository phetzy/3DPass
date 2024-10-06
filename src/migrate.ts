import 'dotenv/config'
import { migrate } from 'drizzle-orm/vercel-postgres/migrator'
import { db, pool } from './lib/server/db/schema'

await migrate(db, { migrationsFolder: './lib/server/db/' })

await pool.end()
