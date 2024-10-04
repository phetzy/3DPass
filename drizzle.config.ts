import { defineConfig } from 'drizzle-kit'
import './src/lib/server/db/envConfig'

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './src/lib/server/db',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.POSTGRES_URL,
	}
})
