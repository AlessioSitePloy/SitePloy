/* Adattatore Netlify → GET /api/submissions */
import { handleSubmissions } from "../../api/core.js";
import { blobsStorage } from "../storage.mjs";

export default (req) => handleSubmissions(req, blobsStorage, process.env.ADMIN_TOKEN);

export const config = { path: "/api/submissions" };
