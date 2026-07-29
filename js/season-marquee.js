(function () {
  const contentEls = document.querySelectorAll(".season-marquee-content");
  if (!contentEls.length) return;

  const fmt = (d) => d.toLocaleDateString("es-EC", { day: "numeric", month: "long" });

  const current = getSeasonInfo(currentSeasonIndex());
  const next = getSeasonInfo(current.index + 1);

  const text =
    `<i class="fa-solid fa-trophy"></i> TEMPORADA ACTUAL: <strong>${current.name.toUpperCase()}</strong> — FINALIZA EL <strong>${fmt(current.end).toUpperCase()}</strong> ` +
    `&nbsp;·&nbsp; SIGUIENTE TEMPORADA: <strong class="season-marquee-next-name">${next.name.toUpperCase()}</strong> — INICIA EL <strong class="season-marquee-next-name">${fmt(next.start).toUpperCase()}</strong> ` +
    `&nbsp;·&nbsp; <strong>COMPITE. GANA. ASCIENDE.</strong> <i class="fa-solid fa-crosshairs"></i>`;

  contentEls.forEach((el) => {
    el.innerHTML = text;
  });
})();
