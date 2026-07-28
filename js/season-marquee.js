(function () {
  const contentEls = document.querySelectorAll(".season-marquee-content");
  if (!contentEls.length) return;

  const fmt = (d) => d.toLocaleDateString("es-EC", { day: "numeric", month: "long" });

  const current = getSeasonInfo(currentSeasonIndex());
  const next = getSeasonInfo(current.index + 1);

  const text =
    `🏆 TEMPORADA ACTUAL: ${current.name.toUpperCase()} — FINALIZA EL ${fmt(current.end).toUpperCase()} ` +
    `&nbsp;·&nbsp; SIGUIENTE TEMPORADA: ${next.name.toUpperCase()} — INICIA EL ${fmt(next.start).toUpperCase()} ` +
    `&nbsp;·&nbsp; COMPITE. GANA. ASCIENDE. 🐙`;

  contentEls.forEach((el) => {
    el.innerHTML = text;
  });
})();
