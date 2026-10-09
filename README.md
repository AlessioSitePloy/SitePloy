# SitePloy — sito web

Sito in HTML, CSS e JavaScript, in italiano e inglese, con un modulo di contatto che salva le richieste nel backend.

Il progetto funziona **sia su Netlify che su Cloudflare** senza modifiche al sito: la logica del backend è in un unico file comune, e ogni piattaforma ha solo un piccolo adattatore.

| | Netlify (oggi) | Cloudflare (in futuro) |
|---|---|---|
| Sito statico | `public/` | `public/` |
| Backend | `netlify/functions/` | `functions/` (Pages Functions) |
| Dove salva | Netlify Blobs | D1 (database SQL) |
| Config | `netlify.toml` | `wrangler.toml` |

## Struttura

```
siteploy/
├── public/                    ← il sito (HTML, CSS, JS, immagini)
│   ├── index.html · chi-sono.html · servizi.html · contatti.html
│   └── assets/
│       ├── css/style.css      tutto lo stile (colori in cima, in :root)
│       ├── js/i18n.js         TUTTI i testi IT/EN
│       ├── js/main.js         menu mobile, animazioni, invio modulo
│       └── img/               logo/favicon (e la tua foto)
│
├── api/core.js                ← LOGICA COMUNE: validazione, anti-spam, accesso admin
│
├── netlify/                   ← adattatore Netlify
│   ├── storage.mjs            salvataggio su Netlify Blobs
│   └── functions/
│       ├── contact.mjs        POST /api/contact
│       └── submissions.mjs    GET  /api/submissions
├── netlify.toml
│
├── functions/                 ← adattatore Cloudflare Pages
│   ├── _storage.js            salvataggio su D1
│   └── api/
│       ├── contact.js         POST /api/contact
│       └── submissions.js     GET  /api/submissions
├── wrangler.toml
├── schema.sql                 tabella del database (D1 / SQLite / PostgreSQL)
│
└── package.json
```

Le due piattaforme espongono **gli stessi indirizzi** (`/api/contact`, `/api/submissions`), quindi il JavaScript del sito non cambia mai.

## Da completare prima di pubblicare

1. **Foto**: metti la tua foto in `public/assets/img/alessio.jpg` e in `chi-sono.html` segui il commento `FOTO`.
2. **Certificati**: in `chi-sono.html`, cerca il commento `CERTIFICATI` e sostituisci "Nome certificato" e "Anno".
3. **Privacy policy**: raccogliendo nome ed email, serve una pagina privacy (GDPR) collegata al modulo. Puoi generarla con un servizio come iubenda.

## Modificare i testi

Ogni testo ha un attributo `data-i18n="chiave"`. Il testo italiano nell'HTML è quello mostrato senza JavaScript, ma **la versione che conta è in `assets/js/i18n.js`**: lì cambi la chiave sia in `it` che in `en`.

---

## Netlify (uso attuale)

### Provarlo sul PC
```bash
npm install
npm install -g netlify-cli
npm run dev:netlify        # http://localhost:8888
```

### Pubblicarlo
> ⚠️ Il "trascina la cartella" di Netlify **non** pubblica le functions: il modulo non funzionerebbe. Usa GitHub oppure la CLI.

**Con GitHub (consigliato)**
1. Carica la cartella in un repository GitHub.
2. Su Netlify: *Add new site → Import an existing project* → scegli il repo. Le impostazioni arrivano da `netlify.toml`.
3. In *Site configuration → Environment variables* aggiungi `ADMIN_TOKEN` con una password lunga e casuale.
4. Ogni `git push` aggiorna il sito.

**Con la CLI**
```bash
netlify login
netlify init
netlify env:set ADMIN_TOKEN "una-password-lunga-e-casuale"
netlify deploy --prod
```

---

## Cloudflare (quando vorrai passare)

### 1. Crea il database D1
```bash
npm install
npx wrangler login
npx wrangler d1 create siteploy-db
```
Copia il `database_id` che ti restituisce dentro `wrangler.toml`, poi crea la tabella:
```bash
npx wrangler d1 execute siteploy-db --remote --file=schema.sql
```

### 2. Provarlo sul PC
```bash
npx wrangler d1 execute siteploy-db --local --file=schema.sql
echo ADMIN_TOKEN=test > .dev.vars
npm run dev:cloudflare     # http://localhost:8788
```

### 3. Pubblicarlo
**Con GitHub (consigliato):** nella dashboard Cloudflare → *Workers & Pages → Create → Pages → Connect to Git*, scegli il repo, lascia vuoto il comando di build e imposta come cartella di output `public`. Poi in *Settings → Bindings* collega il database D1 con il nome `DB`, e in *Settings → Variables and Secrets* aggiungi `ADMIN_TOKEN` come secret.

**Con la CLI:**
```bash
npx wrangler pages project create siteploy
npx wrangler pages secret put ADMIN_TOKEN --project-name siteploy
npx wrangler pages deploy
```

### 4. Portare le richieste già ricevute
Le richieste salvate su Netlify Blobs non si spostano da sole. Prima del passaggio scaricale da `/api/submissions` (vedi sotto) e, se ti servono, importale in D1.

---

## Collegare siteploy.com (dominio su Hostinger)

- **Netlify:** *Domain management → Add a domain* → `siteploy.com`, poi su Hostinger (*Domini → DNS*) imposta i record che Netlify ti indica.
- **Cloudflare:** per usare un dominio personalizzato su Pages, Cloudflare ti chiederà di spostare i nameserver da Hostinger ai suoi. Importa automaticamente i record esistenti, ma **controlla che i record MX di Hostinger ci siano**, altrimenti `alessio@siteploy.com` smette di ricevere posta.
- In entrambi i casi l'HTTPS si attiva da solo.

## Vedere le richieste ricevute

Da PowerShell (stesso comando su entrambe le piattaforme):
```powershell
curl.exe -H "Authorization: Bearer IL_TUO_ADMIN_TOKEN" https://siteploy.com/api/submissions
```

## Cambiare database in futuro

La logica in `api/core.js` usa solo due funzioni: `saveSubmission(entry)` e `listSubmissions()`. Per usare un altro database (es. PostgreSQL su Supabase o Neon) basta scrivere un nuovo file di storage con queste due funzioni e passarlo agli adattatori. `schema.sql` va bene anche per PostgreSQL, cambiando `consent` in `BOOLEAN`.
