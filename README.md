# SitePloy — sito web

Sito in HTML, CSS e JavaScript (italiano/inglese) pubblicato su **Vercel**, con un modulo di contatto che salva le richieste in un database **PostgreSQL su Neon**.

## Struttura

```
siteploy/
├── public/                    ← il sito (HTML, CSS, JS, immagini) — l'unica cartella pubblica
│   ├── index.html · chi-sono.html · servizi.html · contatti.html
│   └── assets/
│       ├── css/style.css
│       ├── js/i18n.js         TUTTI i testi IT/EN
│       ├── js/main.js         menu, animazioni, invio modulo
│       └── js/analytics.js    Google Analytics (file esterno per la CSP)
│
├── api/                       ← Vercel Functions (diventano /api/...)
│   ├── contact.js             POST   /api/contact
│   └── submissions.js         GET/PATCH/DELETE /api/submissions (solo admin)
│
├── lib/
│   ├── core.js                logica: validazione, anti-spam, rate limit, captcha, admin, notifiche
│   └── db.js                  query PostgreSQL (Neon)
│
├── schema.sql                 tabelle del database
├── scripts/setup-db.js        crea le tabelle (npm run db:setup)
├── tests/core.test.js         test del backend (npm test)
└── vercel.json                URL puliti + header di sicurezza (CSP, HSTS, …)
```

> ⚠️ Non mettere file di utilità dentro `api/`: su Vercel **ogni file** in quella cartella diventa un endpoint pubblico. La logica va in `lib/`.

## Sicurezza in breve

| Protezione | Dove |
|---|---|
| Captcha invisibile Cloudflare Turnstile | `contatti.html` + verifica in `lib/core.js` |
| Rate limit: 5 invii/ora per IP sul modulo, 10 token errati/ora sull'admin | tabella `tentativi` |
| IP mai salvati in chiaro (solo hash HMAC, cancellati dopo 1 giorno) | `lib/core.js`, `lib/db.js` |
| Solo richieste da siteploy.com (controllo `Origin`), solo JSON, max 20 KB | `lib/core.js` |
| Token admin di almeno 32 caratteri, confronto a tempo costante | `lib/core.js` |
| Campo trappola anti-bot + pulizia caratteri di controllo | `lib/core.js` |
| Vincoli `CHECK` nel database | `schema.sql` |
| CSP, HSTS, X-Frame-Options, Permissions-Policy, … | `vercel.json` |
| Prova del consenso GDPR (`consent_at`, `privacy_version`) | `schema.sql` |

---

## Messa online (una volta sola)

### 1. Progetto Vercel
Su vercel.com → *Add New → Project* → importa il repo GitHub `SitePloy`. Framework: **Other**, nessun comando di build (le impostazioni arrivano da `vercel.json`).

### 2. Database Neon
Nel progetto Vercel → *Storage → Create Database → Neon* (piano Free), regione **Frankfurt (eu-central-1)**, e collegalo al progetto. Vercel aggiunge da solo `DATABASE_URL`.

Poi dal PC, nella cartella del progetto:
```bash
npm install
npm install -g vercel
vercel link
vercel env pull .env.local
npm run db:setup
```

### 3. Captcha Cloudflare Turnstile (gratis)
1. dash.cloudflare.com → *Turnstile → Add widget*, dominio `siteploy.com`, modalità **Managed**.
2. Copia la **Site Key** in `public/contatti.html` al posto di `1x00000000000000000000AA` (è una chiave di test che passa sempre).
3. Copia la **Secret Key** nella variabile `TURNSTILE_SECRET_KEY` (sotto).

### 4. Variabili d'ambiente
Vercel → *Settings → Environment Variables*. Per generare valori casuali:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

| Variabile | Obbligatoria | Valore |
|---|---|---|
| `DATABASE_URL` | sì | la mette l'integrazione Neon |
| `ADMIN_TOKEN` | sì | casuale, **almeno 32 caratteri** |
| `IP_HASH_SECRET` | sì | casuale |
| `TURNSTILE_SECRET_KEY` | sì | Secret Key di Turnstile (senza, il captcha è disattivato) |
| `RESEND_API_KEY` | per le email | API key di resend.com |
| `NOTIFY_EMAIL` | per le email | `alessio@siteploy.com` |
| `NOTIFY_FROM` | per le email | es. `SitePloy <notifiche@siteploy.com>` (dominio verificato su Resend) |
| `N8N_WEBHOOK_URL` | facoltativa | webhook n8n che riceve ogni nuova richiesta |
| `N8N_WEBHOOK_SECRET` | facoltativa | inviato nell'header `X-Webhook-Secret` |
| `ALLOWED_ORIGINS` | facoltativa | default `https://siteploy.com,https://www.siteploy.com` |

Dopo aver cambiato le variabili fai un nuovo deploy (*Deployments → Redeploy*).

**Email con Resend:** crea l'account, *Domains → Add domain* `siteploy.com` e aggiungi su Hostinger (*Domini → DNS*) i record che ti indica. Non toccano i record MX esistenti, quindi la posta di `alessio@siteploy.com` continua a funzionare.

### 5. Dominio
Vercel → *Settings → Domains* → `siteploy.com` e `www.siteploy.com`, poi su Hostinger imposta i record DNS indicati da Vercel. L'HTTPS si attiva da solo.

---

## Lavorare in locale
```bash
npm run dev        # http://localhost:3000 (usa le variabili di .env.local)
npm test           # test del backend, non serve il database
```

## Gestire le richieste (PowerShell)
```powershell
$h = @{ Authorization = "Bearer IL_TUO_ADMIN_TOKEN" }

# elenco (filtri facoltativi: ?status=nuova&limit=50)
Invoke-RestMethod https://siteploy.com/api/submissions -Headers $h

# cambia stato: nuova | risposta | chiusa | spam
Invoke-RestMethod https://siteploy.com/api/submissions -Method Patch -Headers $h `
  -ContentType "application/json" -Body '{"id":"ID-RICHIESTA","status":"risposta"}'

# cancella (richiesta di cancellazione GDPR)
Invoke-RestMethod "https://siteploy.com/api/submissions?id=ID-RICHIESTA" -Method Delete -Headers $h
```
Dopo 10 token sbagliati in un'ora l'IP viene bloccato per un'ora.

## Modificare i testi
Ogni testo ha `data-i18n="chiave"`: la versione che conta è in `assets/js/i18n.js` (sia `it` che `en`).

## Se aggiungi script o servizi esterni
La Content-Security-Policy in `vercel.json` blocca tutto ciò che non è esplicitamente permesso (niente `<script>` inline). Se aggiungi un servizio esterno (es. un banner cookie) aggiungi il suo dominio alla CSP, altrimenti non verrà caricato.

## Privacy policy
Quando aggiorni la privacy policy, cambia `PRIVACY_VERSION` in `lib/core.js`: viene salvata con ogni consenso.

## Da completare
- Foto in `chi-sono.html` (commento `FOTO`) e certificati (commento `CERTIFICATI`).
- Pagine privacy e cookie policy + consenso per Google Analytics.
