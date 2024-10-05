import { drizzle } from "drizzle-orm/vercel-postgres"
import { sql } from "@vercel/postgres"
import './envConfig'
import * as schema from './schema'

export const db = drizzle(sql, { schema })

export const getUsers = async () => {
    return db.query.usersTable.findMany()
}
