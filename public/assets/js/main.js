/* ============ Interazioni del sito ============ */
document.addEventListener("DOMContentLoaded", () => {
  // Menu mobile
  const menuBtn = document.querySelector(".menu-btn");
  const links = document.querySelector(".nav-links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open);
    });
  }

  // Link attivo nel menu
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === page || (page === "" && href === "index.html") || location.pathname.endsWith("/" + href.replace(".html", ""))) {
      a.classList.add("active");
    }
  });

  // Anno nel footer
  document.querySelectorAll("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));

  // Animazione all'ingresso delle sezioni
  const els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add("in"));
  }

  // Glow cards: il bordo e il riflesso seguono il mouse
  setupGlowCards();

  // Modulo di contatto
  const form = document.getElementById("contact-form");
  if (form) setupForm(form);
});

function setupForm(form) {
  const status = form.querySelector(".form-status");
  const button = form.querySelector('button[type="submit"]');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const showStatus = (type, msg) => {
    status.className = "form-status show " + type;
    status.textContent = msg;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    form.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));

    const data = Object.fromEntries(new FormData(form).entries());
    data.consent = form.consent.checked;
    data.lang = document.documentElement.lang;

    // Validazione lato browser (il server ricontrolla comunque tutto)
    const errors = [];
    if (!data.name || data.name.trim().length < 2) errors.push("name");
    if (!emailRe.test((data.email || "").trim())) errors.push("email");
    if (!data.service) errors.push("service");
    if (!data.message || data.message.trim().length < 10) errors.push("message");
    if (!data.consent) errors.push("consent");

    if (errors.length) {
      errors.forEach(name => {
        const el = form.querySelector(`[name="${name}"]`);
        (el.closest(".field") || el.closest(".consent"))?.classList.add("invalid");
      });
      showStatus("err", t("form.invalid"));
      return;
    }

    button.disabled = true;
    const label = button.querySelector("span");
    label.textContent = t("form.sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        form.reset();
        showStatus("ok", t("form.success"));
      } else if (res.status === 429) {
        showStatus("err", t("form.rateLimited"));
      } else if (res.status === 403) {
        showStatus("err", t("form.captcha"));
      } else {
        throw new Error("HTTP " + res.status);
      }
    } catch (err) {
      console.error(err);
      showStatus("err", t("form.error"));
    } finally {
      button.disabled = false;
      label.textContent = t("form.submit");
      // Il token del captcha vale una sola volta: ne serve uno nuovo per il prossimo invio
      if (window.turnstile) window.turnstile.reset();
    }
  });
}

function setupGlowCards() {
  // Solo su dispositivi con mouse
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  document.querySelectorAll(".card").forEach(card => {
    card.setAttribute("data-glow", "");
    const halo = document.createElement("div");
    halo.className = "glow-halo";
    halo.setAttribute("aria-hidden", "true");
    card.prepend(halo);
  });

  // Un solo listener per tutta la pagina: aggiorna la posizione del mouse
  const root = document.documentElement;
  let frame = null, mx = 0, my = 0;
  document.addEventListener("pointermove", (e) => {
    mx = e.clientX; my = e.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      root.style.setProperty("--x", mx.toFixed(1));
      root.style.setProperty("--y", my.toFixed(1));
      root.style.setProperty("--xp", (mx / window.innerWidth).toFixed(3));
      frame = null;
    });
  });
}
