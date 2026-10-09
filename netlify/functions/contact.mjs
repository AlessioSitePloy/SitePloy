/* Adattatore Netlify → POST /api/contact */
import { handleContact } from "../../api/core.js";
import { blobsStorage } from "../storage.mjs";

export default (req) => handleContact(req, blobsStorage);

export const config = { path: "/api/contact" };
