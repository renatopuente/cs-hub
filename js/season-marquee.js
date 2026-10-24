// Las dos cintas de la temporada en la portada. La de arriba anuncia la
// temporada y sus fechas; la de abajo, el cierre, cuánto falta y cuándo
// empieza la siguiente. La siguiente no se nombra: su ciudad y su gema son la
// respuesta de los crípticos de la leyenda. Los colores salen de la gema de la
// temporada (--season-h/-s, en css/home.css). Va después de seasons.js.
(function () {
  const ribbons = document.querySelectorAll(".season-ribbon[data-ribbon]");
  if (!ribbons.length || typeof getSeasonInfo !== "function") return;

  const fmt = (d) => d.toLocaleDateString("es-EC", { day: "numeric", month: "long" });
  const current = getSeasonInfo(currentSeasonIndex());
  const next = getSeasonInfo(current.index + 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.max(1, Math.round((current.end - today) / 86400000) + 1); // cuenta el último día

  const phrases = {
    inicio: [`Temporada ${current.name}`, `Empezó el ${fmt(current.start)}`, `Termina el ${fmt(current.end)}`, "Compite. Gana. Asciende."],
    cierre: [
      daysLeft === 1 ? "Último día de la temporada" : `Quedan ${daysLeft} días de temporada`,
      `Cierra el ${fmt(current.end)}`,
      `La siguiente empieza el ${fmt(next.start)}`,
      "Su nombre está en clave en la leyenda",
    ],
  };

  ribbons.forEach((el) => {
    const list = phrases[el.dataset.ribbon];
    if (!list) return;
    el.setAttribute("aria-label", list.map((p) => (p.endsWith(".") ? p : `${p}.`)).join(" "));
    // Dos mitades iguales: la cinta corre media vuelta y vuelve a empezar sin salto.
    const run = list.map((p) => `<span>${p}</span><i class="ribbon-gem"></i>`).join("");
    const half = `<span class="ribbon-run">${run.repeat(3)}</span>`;
    el.innerHTML = `<span class="ribbon-track" aria-hidden="true">${half}${half}</span>`;
  });
})();
