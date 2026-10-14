/* POST /api/contact — Vercel Function (Node.js, firma Web standard) */
import { handleContact } from "../lib/core.js";
import { db } from "../lib/db.js";

export function POST(request) {
  return handleContact(request, { db, env: process.env });
}
