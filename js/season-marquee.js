(function () {
  const contentEls = document.querySelectorAll(".season-marquee-content");
  if (!contentEls.length) return;

  const fmt = (d) => d.toLocaleDateString("es-EC", { day: "numeric", month: "long" });

  const current = getSeasonInfo(currentSeasonIndex());
  const next = getSeasonInfo(current.index + 1);

  const text =
    `<i class="fa-solid fa-trophy"></i> TEMPORADA ACTUAL: ${current.name.toUpperCase()} — FINALIZA EL ${fmt(current.end).toUpperCase()} ` +
    `&nbsp;·&nbsp; SIGUIENTE TEMPORADA: ${next.name.toUpperCase()} — INICIA EL ${fmt(next.start).toUpperCase()} ` +
    `&nbsp;·&nbsp; COMPITE. GANA. ASCIENDE. <i class="fa-solid fa-crosshairs"></i>`;

  contentEls.forEach((el) => {
    el.innerHTML = text;
  });
})();
