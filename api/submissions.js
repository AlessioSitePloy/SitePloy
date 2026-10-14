/* GET / PATCH / DELETE /api/submissions — solo admin (vedi lib/core.js) */
import { handleSubmissions } from "../lib/core.js";
import { db } from "../lib/db.js";

const handler = (request) => handleSubmissions(request, { db, env: process.env });
export { handler as GET, handler as PATCH, handler as DELETE };
