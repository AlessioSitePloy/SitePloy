/* Crea le tabelle su Neon leggendo schema.sql.
   Uso:  npm run db:setup   (legge DATABASE_URL da .env.local)
   Per avere .env.local:  vercel env pull .env.local
*/
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("Manca DATABASE_URL. Esegui prima: vercel env pull .env.local");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
const schema = await readFile(new URL("../schema.sql", import.meta.url), "utf8");
const statements = schema
  .split("\n").filter(l => !l.trim().startsWith("--")).join("\n")
  .split(";").map(s => s.trim()).filter(Boolean);

for (const stmt of statements) {
  await sql.query(stmt);
  console.log("✓", stmt.split("\n")[0]);
}
console.log("Database pronto.");
