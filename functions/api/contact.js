/* Adattatore Cloudflare Pages → POST /api/contact */
import { handleContact } from "../../api/core.js";
import { d1Storage } from "../_storage.js";

export const onRequest = ({ request, env }) => handleContact(request, d1Storage(env.DB));
