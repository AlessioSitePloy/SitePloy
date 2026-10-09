/* Adattatore Cloudflare Pages → GET /api/submissions */
import { handleSubmissions } from "../../api/core.js";
import { d1Storage } from "../_storage.js";

export const onRequest = ({ request, env }) =>
  handleSubmissions(request, d1Storage(env.DB), env.ADMIN_TOKEN);
