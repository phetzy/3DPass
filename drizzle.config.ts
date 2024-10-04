import { defineConfig } from 'drizzle-kit'
import './drizzle/envConfig'

export default defineConfig({
	schema: './src/lib/server/schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.POSTGRES_URL,
	}
})
