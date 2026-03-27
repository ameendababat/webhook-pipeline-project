import { defineConfig } from "drizzle-kit";
// import { readConfig } from "./src/config";
import "dotenv/config.js";

// const cfg = readConfig();

export default defineConfig({
    schema: "src/database/schema.ts",
    out: "src/database/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
