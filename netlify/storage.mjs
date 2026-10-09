/* Storage per Netlify: Netlify Blobs (gratuito, zero configurazione). */
import { getStore } from "@netlify/blobs";

const store = () => getStore("richieste-contatto");

export const blobsStorage = {
  async saveSubmission(entry) {
    await store().setJSON(`${Date.now()}-${entry.id}`, entry);
  },
  async listSubmissions() {
    const s = store();
    const { blobs } = await s.list();
    const items = await Promise.all(blobs.map(b => s.get(b.key, { type: "json" })));
    return items.filter(Boolean).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
};
