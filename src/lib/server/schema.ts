import { pgTable, serial, text, varchar, uuid, timestamp } from "drizzle-orm/pg-core"
import { sql } from "@vercel/postgres"
import { drizzle } from "drizzle-orm/vercel-postgres"

export const db = drizzle(sql)

export const usersTable = pgTable(
    'users', {
    uuid: uuid('uuid').primaryKey().unique().notNull(),
    id: serial('id').unique().notNull(),
    password: varchar('password').notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull(),
    phone: varchar('phone', { length: 10 }),
    street_address: varchar('street_address', { length: 100 }),
    street_address_two: varchar('street_address_two', { length: 100 }),
    city: text('city'),
    zipcode: varchar('zipcode', { length: 5 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})
