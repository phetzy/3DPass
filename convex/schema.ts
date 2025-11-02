import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
  ...authTables,
  // Add app-specific tables here later (e.g., prints, materials, subscriptions)
});

export default schema;
