/* ============ Traduzioni IT / EN ============
   Per aggiungere un testo: metti data-i18n="chiave" nell'HTML
   e la stessa chiave qui sotto in entrambe le lingue.
   - data-i18n            -> sostituisce il testo
   - data-i18n-html       -> sostituisce l'HTML (per <span>, <br>, ecc.)
   - data-i18n-placeholder-> sostituisce il placeholder di un campo
   - <body data-title="..."> -> titolo della scheda del browser
*/
const translations = {
  it: {
    "nav.home": "Home",
    "nav.about": "Chi sono",
    "nav.services": "Servizi",
    "nav.contact": "Contatti",
    "nav.cta": "Preventivo",
    "nav.menu": "Apri il menu",
    "footer.tagline": "Automazioni n8n, siti web e webapp su misura per aziende e agenzie.",
    "footer.pages": "Pagine",
    "footer.contact": "Contatti",
    "footer.rights": "Tutti i diritti riservati.",
    "footer.based": "Torino, Italia",

    "title.home": "SitePloy — Automazioni n8n, siti web e webapp",
    "title.about": "Chi sono — SitePloy",
    "title.services": "Servizi — SitePloy",
    "title.contact": "Contatti — SitePloy",

    "home.badge": "Automazioni · Siti web · Webapp",
    "home.title": "Automatizzo il lavoro ripetitivo e costruisco la tua <span class=\"grad-text\">presenza online</span>.",
    "home.lead": "Sono Alessio, lo sviluppatore dietro SitePloy. Creo automazioni con n8n e siti e webapp su misura, per aziende e agenzie che vogliono lavorare meglio, non di più.",
    "home.ctaPrimary": "Richiedi un preventivo",
    "home.ctaSecondary": "Scopri i servizi",
    "wf.1": "Nuovo contatto dal sito",
    "wf.2": "Dati arricchiti con l'AI",
    "wf.3": "Salvato nel CRM",
    "wf.4": "Email di benvenuto inviata",
    "wf.done": "Flusso completato · nessun intervento manuale",
    "home.servicesKicker": "Cosa faccio",
    "home.servicesTitle": "Due servizi, un obiettivo: farti risparmiare tempo.",
    "svc.auto.title": "Automazioni con n8n",
    "svc.auto.text": "Collego le app che usi già — email, CRM, fogli di calcolo, moduli — e le faccio lavorare da sole. Meno copia-incolla, meno errori.",
    "svc.web.title": "Siti web e webapp",
    "svc.web.text": "Siti veloci e curati, landing page e webapp con database, pensati per essere facili da gestire e pronti a crescere.",
    "svc.more": "Scopri di più →",
    "home.processKicker": "Come lavoro",
    "home.processTitle": "Dal problema alla soluzione, in quattro passi.",
    "step1.title": "Analisi",
    "step1.text": "Capiamo insieme dove perdi tempo e cosa ti serve davvero.",
    "step2.title": "Preventivo",
    "step2.text": "Ricevi una proposta chiara con tempi e costi, senza sorprese.",
    "step3.title": "Sviluppo",
    "step3.text": "Costruisco la soluzione e ti aggiorno a ogni passaggio.",
    "step4.title": "Consegna e supporto",
    "step4.text": "Metto tutto online, ti spiego come usarlo e resto disponibile.",
    "cta.title": "Hai un processo da automatizzare o un sito da creare?",
    "cta.text": "Raccontami il tuo progetto: ti rispondo con un preventivo su misura.",

    "about.kicker": "Chi sono",
    "about.title": "Ciao, sono <span class=\"grad-text\">Alessio</span>.",
    "about.p1": "Ho appena concluso il diploma a indirizzo informatico e sto per iniziare Ingegneria Informatica. Nel frattempo ho fondato SitePloy, il mio progetto da sviluppatore freelance.",
    "about.p2": "Mi appassiona trovare il modo più semplice per far funzionare le cose: un flusso n8n che elimina ore di lavoro manuale, un sito che si carica in un attimo, una webapp che fa esattamente quello che serve.",
    "about.p3": "Studio e lavoro in parallelo: ogni progetto è un'occasione per imparare qualcosa di nuovo e portarlo ai miei clienti.",
    "about.location": "Torino, Italia",
    "about.study": "Studente di Ingegneria Informatica",
    "about.status": "Disponibile per nuovi progetti",
    "about.skillsKicker": "Competenze",
    "about.skillsTitle": "Gli strumenti che uso ogni giorno.",
    "about.certsKicker": "Certificazioni",
    "about.certsTitle": "Formazione continua.",
    "about.certsText": "Oltre agli studi, ho conseguito diversi certificati Google e altre certificazioni tecniche.",
    "about.valuesKicker": "Il mio approccio",
    "about.valuesTitle": "Come lavoro con i clienti.",
    "value1.title": "Chiarezza",
    "value1.text": "Ti spiego cosa faccio e perché, senza tecnicismi inutili.",
    "value2.title": "Concretezza",
    "value2.text": "Soluzioni che risolvono problemi reali, non tecnologia fine a sé stessa.",
    "value3.title": "Curiosità",
    "value3.text": "Imparo ogni giorno e porto nei progetti strumenti sempre aggiornati.",
    "about.cta": "Lavoriamo insieme",

    "services.kicker": "Servizi",
    "services.title": "Soluzioni su misura per <span class=\"grad-text\">lavorare meglio</span>.",
    "services.lead": "Ogni progetto parte dalle tue esigenze: niente pacchetti preconfezionati.",
    "auto.title": "Automazioni con n8n",
    "auto.text": "Il tuo team passa ore a copiare dati da un'app all'altra, inviare le stesse email o compilare report? Con n8n costruisco flussi che fanno questo lavoro al posto vostro, 24 ore su 24.",
    "auto.li1": "Integrazioni tra app e servizi (Gmail, Google Sheets, CRM e molto altro)",
    "auto.li2": "Gestione automatica di contatti e lead",
    "auto.li3": "Report e notifiche generati in automatico",
    "auto.li4": "Flussi con intelligenza artificiale per testi, email e classificazione dei dati",
    "web.title": "Siti web e webapp",
    "web.text": "Dal sito vetrina alla webapp con database e area riservata: sviluppo in codice, senza template pesanti, per avere prestazioni alte e la libertà di crescere.",
    "web.li1": "Siti vetrina e landing page",
    "web.li2": "Webapp con database e area riservata",
    "web.li3": "Design responsive, veloce e ottimizzato per Google",
    "web.li4": "Messa online, dominio e manutenzione",
    "pricing.kicker": "Prezzi",
    "pricing.title": "Prezzo su preventivo",
    "pricing.text": "Ogni progetto è diverso, quindi preferisco darti un prezzo preciso dopo aver capito cosa ti serve. Raccontami il progetto e ti invio una proposta su misura, con tempi e costi chiari.",
    "pricing.cta": "Richiedi un preventivo",
    "faq.kicker": "FAQ",
    "faq.title": "Domande frequenti",
    "faq1.q": "Devo già avere un sito o degli strumenti?",
    "faq1.a": "No. Posso partire da zero oppure lavorare con quello che usi già.",
    "faq2.q": "Quanto tempo serve?",
    "faq2.a": "Dipende dalla complessità del progetto: nel preventivo trovi sempre una stima dei tempi.",
    "faq3.q": "Cosa succede dopo la consegna?",
    "faq3.a": "Ti spiego come usare tutto e posso occuparmi di manutenzione e aggiornamenti.",

    "contact.kicker": "Contatti",
    "contact.title": "Parliamo del tuo <span class=\"grad-text\">progetto</span>.",
    "contact.lead": "Compila il modulo per richiedere un preventivo oppure scrivimi direttamente via email.",
    "contact.emailLabel": "Email",
    "contact.locationLabel": "Dove sono",
    "contact.replyLabel": "Risposta",
    "contact.reply": "Ti rispondo il prima possibile",
    "form.name": "Nome e cognome",
    "form.email": "Email",
    "form.company": "Azienda (facoltativo)",
    "form.service": "Di cosa hai bisogno?",
    "form.service.choose": "Seleziona un'opzione",
    "form.service.automation": "Automazione n8n",
    "form.service.website": "Sito web",
    "form.service.webapp": "Webapp",
    "form.service.other": "Altro",
    "form.message": "Raccontami il progetto",
    "form.messagePh": "Cosa vorresti realizzare? Quali strumenti usi oggi?",
    "form.consent": "Acconsento al trattamento dei miei dati per essere ricontattato.",
    "form.submit": "Invia richiesta",
    "form.sending": "Invio in corso…",
    "form.success": "Grazie! Ho ricevuto la tua richiesta e ti risponderò al più presto.",
    "form.error": "Qualcosa è andato storto. Riprova oppure scrivimi a alessio@siteploy.com.",
    "form.invalid": "Controlla i campi evidenziati."
  },

  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.services": "Services",
    "nav.contact": "Contact",
    "nav.cta": "Get a quote",
    "nav.menu": "Open menu",
    "footer.tagline": "Custom n8n automations, websites and web apps for businesses and agencies.",
    "footer.pages": "Pages",
    "footer.contact": "Contact",
    "footer.rights": "All rights reserved.",
    "footer.based": "Turin, Italy",

    "title.home": "SitePloy — n8n automations, websites and web apps",
    "title.about": "About — SitePloy",
    "title.services": "Services — SitePloy",
    "title.contact": "Contact — SitePloy",

    "home.badge": "Automations · Websites · Web apps",
    "home.title": "I automate repetitive work and build your <span class=\"grad-text\">online presence</span>.",
    "home.lead": "I'm Alessio, the developer behind SitePloy. I build n8n automations and custom websites and web apps for businesses and agencies that want to work smarter, not harder.",
    "home.ctaPrimary": "Request a quote",
    "home.ctaSecondary": "Explore services",
    "wf.1": "New lead from the website",
    "wf.2": "Data enriched with AI",
    "wf.3": "Saved to the CRM",
    "wf.4": "Welcome email sent",
    "wf.done": "Workflow completed · zero manual work",
    "home.servicesKicker": "What I do",
    "home.servicesTitle": "Two services, one goal: saving you time.",
    "svc.auto.title": "n8n automations",
    "svc.auto.text": "I connect the tools you already use — email, CRM, spreadsheets, forms — and make them work on their own. Less copy-paste, fewer mistakes.",
    "svc.web.title": "Websites and web apps",
    "svc.web.text": "Fast, polished websites, landing pages and database-backed web apps, built to be easy to manage and ready to grow.",
    "svc.more": "Learn more →",
    "home.processKicker": "How I work",
    "home.processTitle": "From problem to solution in four steps.",
    "step1.title": "Discovery",
    "step1.text": "We figure out together where you're losing time and what you really need.",
    "step2.title": "Proposal",
    "step2.text": "You get a clear proposal with timeline and costs, no surprises.",
    "step3.title": "Build",
    "step3.text": "I build the solution and keep you updated at every step.",
    "step4.title": "Launch & support",
    "step4.text": "I put everything live, show you how to use it and stay available.",
    "cta.title": "Got a process to automate or a website to build?",
    "cta.text": "Tell me about your project and I'll get back to you with a tailored quote.",

    "about.kicker": "About me",
    "about.title": "Hi, I'm <span class=\"grad-text\">Alessio</span>.",
    "about.p1": "I've just graduated from a computer science high school and I'm about to start a degree in Computer Engineering. In the meantime I founded SitePloy, my freelance development studio.",
    "about.p2": "I love finding the simplest way to make things work: an n8n workflow that removes hours of manual work, a website that loads in an instant, a web app that does exactly what's needed.",
    "about.p3": "I study and work at the same time: every project is a chance to learn something new and bring it to my clients.",
    "about.location": "Turin, Italy",
    "about.study": "Computer Engineering student",
    "about.status": "Available for new projects",
    "about.skillsKicker": "Skills",
    "about.skillsTitle": "The tools I use every day.",
    "about.certsKicker": "Certifications",
    "about.certsTitle": "Always learning.",
    "about.certsText": "Alongside my studies, I've earned several Google certificates and other technical certifications.",
    "about.valuesKicker": "My approach",
    "about.valuesTitle": "How I work with clients.",
    "value1.title": "Clarity",
    "value1.text": "I explain what I do and why, without needless jargon.",
    "value2.title": "Practicality",
    "value2.text": "Solutions that solve real problems, not tech for its own sake.",
    "value3.title": "Curiosity",
    "value3.text": "I learn every day and bring up-to-date tools into every project.",
    "about.cta": "Let's work together",

    "services.kicker": "Services",
    "services.title": "Tailored solutions to help you <span class=\"grad-text\">work better</span>.",
    "services.lead": "Every project starts from your needs: no one-size-fits-all packages.",
    "auto.title": "n8n automations",
    "auto.text": "Does your team spend hours copying data between apps, sending the same emails or putting together reports? With n8n I build workflows that do that work for you, around the clock.",
    "auto.li1": "Integrations between apps and services (Gmail, Google Sheets, CRMs and more)",
    "auto.li2": "Automatic contact and lead management",
    "auto.li3": "Automatically generated reports and notifications",
    "auto.li4": "AI-powered workflows for text, email and data classification",
    "web.title": "Websites and web apps",
    "web.text": "From business websites to web apps with a database and private area: hand-coded, without heavy templates, for top performance and room to grow.",
    "web.li1": "Business websites and landing pages",
    "web.li2": "Web apps with database and private area",
    "web.li3": "Responsive, fast, search-engine-friendly design",
    "web.li4": "Deployment, domain and maintenance",
    "pricing.kicker": "Pricing",
    "pricing.title": "Pricing on request",
    "pricing.text": "Every project is different, so I'd rather give you an accurate price once I understand what you need. Tell me about your project and I'll send you a tailored proposal with clear timeline and costs.",
    "pricing.cta": "Request a quote",
    "faq.kicker": "FAQ",
    "faq.title": "Frequently asked questions",
    "faq1.q": "Do I need an existing website or tools?",
    "faq1.a": "No. I can start from scratch or work with what you already use.",
    "faq2.q": "How long does it take?",
    "faq2.a": "It depends on the project's complexity: every quote includes a time estimate.",
    "faq3.q": "What happens after launch?",
    "faq3.a": "I show you how to use everything and can take care of maintenance and updates.",

    "contact.kicker": "Contact",
    "contact.title": "Let's talk about your <span class=\"grad-text\">project</span>.",
    "contact.lead": "Fill in the form to request a quote, or email me directly.",
    "contact.emailLabel": "Email",
    "contact.locationLabel": "Location",
    "contact.replyLabel": "Reply",
    "contact.reply": "I'll get back to you as soon as possible",
    "form.name": "Full name",
    "form.email": "Email",
    "form.company": "Company (optional)",
    "form.service": "What do you need?",
    "form.service.choose": "Choose an option",
    "form.service.automation": "n8n automation",
    "form.service.website": "Website",
    "form.service.webapp": "Web app",
    "form.service.other": "Other",
    "form.message": "Tell me about your project",
    "form.messagePh": "What would you like to build? Which tools do you use today?",
    "form.consent": "I agree to the processing of my data so I can be contacted.",
    "form.submit": "Send request",
    "form.sending": "Sending…",
    "form.success": "Thanks! I've received your request and will get back to you soon.",
    "form.error": "Something went wrong. Please try again or email me at alessio@siteploy.com.",
    "form.invalid": "Please check the highlighted fields."
  }
};

const I18N_KEY = "siteploy-lang";

function getLang() {
  try {
    const saved = localStorage.getItem(I18N_KEY);
    if (saved && translations[saved]) return saved;
  } catch (e) { /* storage non disponibile */ }
  return (navigator.language || "it").toLowerCase().startsWith("it") ? "it" : "en";
}

function t(key) {
  const lang = document.documentElement.lang in translations ? document.documentElement.lang : "it";
  return translations[lang][key] ?? translations.it[key] ?? key;
}

function applyLang(lang) {
  const dict = translations[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const v = dict[el.dataset.i18n]; if (v !== undefined) el.textContent = v;
  });
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    const v = dict[el.dataset.i18nHtml]; if (v !== undefined) el.innerHTML = v;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const v = dict[el.dataset.i18nPlaceholder]; if (v !== undefined) el.placeholder = v;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    const v = dict[el.dataset.i18nAria]; if (v !== undefined) el.setAttribute("aria-label", v);
  });
  const titleKey = document.body.dataset.title;
  if (titleKey && dict[titleKey]) document.title = dict[titleKey];
  document.querySelectorAll(".lang-toggle").forEach(btn => {
    btn.textContent = lang === "it" ? "EN" : "IT";
    btn.setAttribute("aria-label", lang === "it" ? "Switch to English" : "Passa all'italiano");
  });
  try { localStorage.setItem(I18N_KEY, lang); } catch (e) { /* ok */ }
}

document.addEventListener("DOMContentLoaded", () => {
  applyLang(getLang());
  document.querySelectorAll(".lang-toggle").forEach(btn =>
    btn.addEventListener("click", () => applyLang(document.documentElement.lang === "it" ? "en" : "it"))
  );
});

window.t = t;
