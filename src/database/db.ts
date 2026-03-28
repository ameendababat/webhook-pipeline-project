import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import config from "../config";

// const config = readConfig();
const conn = postgres(config.databaseUrl);
const db = drizzle(conn, { schema });

export { db };
