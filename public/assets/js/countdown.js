/* ============ Timer della pagina di lancio ============
   Legge la data da <div class="countdown" data-launch="...">.
   Se data-launch è vuoto (o la data è passata) mostra 00 ovunque.
*/
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));

  const box = document.querySelector(".countdown");
  if (!box) return;
  const target = box.dataset.launch ? new Date(box.dataset.launch).getTime() : NaN;
  const units = {};
  box.querySelectorAll("[data-unit]").forEach(el => (units[el.dataset.unit] = el));
  const pad = n => String(n).padStart(2, "0");

  let timer = null;
  function render() {
    const left = Number.isNaN(target) ? 0 : Math.max(0, target - Date.now());
    const s = Math.floor(left / 1000);
    units.days.textContent = pad(Math.floor(s / 86400));
    units.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    units.minutes.textContent = pad(Math.floor((s % 3600) / 60));
    units.seconds.textContent = pad(s % 60);
    if (left === 0 && timer) clearInterval(timer);
  }
  render();
  if (!Number.isNaN(target) && target > Date.now()) timer = setInterval(render, 1000);
});
