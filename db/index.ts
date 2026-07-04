import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const tursoDbUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

function createDb() {
  if (tursoDbUrl) {
    // Production — Turso hosted SQLite
    const client = createClient({
      url: tursoDbUrl,
      authToken: tursoAuthToken,
    });
    return drizzle(client, { schema });
  }

  // Development / local — file-based SQLite via libsql
  const client = createClient({
    url: "file:local.db",
  });
  return drizzle(client, { schema });
}

export const db = createDb();