// Tono de la temporada: cada temporada lleva el color de su gema. Pinta las
// franjas .season-stripe (de la sombra más oscura a la más clara), deja el
// tono en --season-h / --season-s y el arte sin texto en --season-art para
// los escenarios con vidrio. Va después de seasons.js.

// Tono y saturación de cada gema de SEASON_GEMS (seasons.js).
const GEM_HUES = {
  Zafiro: [224, 82], Esmeralda: [152, 72], Amatista: [266, 100], Topacio: [37, 92],
  Rubí: [337, 86], Ópalo: [190, 60], Granate: [350, 64], Jade: [158, 100],
  Ónix: [240, 8], Diamante: [192, 85], Perla: [42, 45], Aguamarina: [174, 70],
  Citrino: [50, 80], Peridoto: [74, 55], Selenita: [220, 35], Turquesa: [175, 68],
};

// Arte de cada temporada sin texto horneado (el nombre lo pone la página).
// Las temporadas sin arte propio usan los tentáculos de la marca.
const SEASON_ART = {
  "Manhattan Amatista": "/img/seasons/manhattan-arte.webp",
  "Ibiza Topacio": "/img/seasons/ibiza.webp",
};
const SEASON_ART_FALLBACK = "/img/banners/octoframe.webp";

// Escenas de la leyenda de cada temporada, con un tentáculo en primer plano,
// para el hero de la portada. Sin escenas, el hero muestra los tentáculos.
const SEASON_SCENES = {
  "Manhattan Amatista": ["/img/seasons/manhattan-apagon.webp", "/img/seasons/manhattan-metro.webp", "/img/seasons/manhattan-puente.webp"],
  "Ibiza Topacio": ["/img/seasons/ibiza-muralla.webp", "/img/seasons/ibiza-cueva.webp", "/img/seasons/ibiza-vedra.webp"],
};

(function () {
  if (typeof getSeasonInfo !== "function") return;
  const info = getSeasonInfo(currentSeasonIndex());
  const name = info.name;
  const root = document.documentElement.style;
  root.setProperty("--season-art", `url("${SEASON_ART[name] || SEASON_ART_FALLBACK}")`);

  // Nombre y fechas de la temporada en las fichas de cada página.
  const fmt = (d) => d.toLocaleDateString("es-EC", { day: "numeric", month: "long" });
  document.querySelectorAll('[data-season="name"]').forEach((el) => (el.textContent = `Temporada ${name}`));
  document.querySelectorAll('[data-season="dates"]').forEach((el) => (el.textContent = `Del ${fmt(info.start)} al ${fmt(info.end)}`));

  // Las escenas del hero: las de la temporada, o una sola imagen de tentáculos.
  const scenes = SEASON_SCENES[name] || [SEASON_ART_FALLBACK];
  document.querySelectorAll(".room-scene").forEach((img, i) => {
    if (scenes[i]) img.src = scenes[i];
    else img.remove();
  });

  const hue = GEM_HUES[info.gem];
  if (!hue) return;
  root.setProperty("--season-h", hue[0]);
  root.setProperty("--season-s", `${hue[1]}%`);
  document.querySelectorAll(".season-stripe").forEach((stripe) => {
    const bars = stripe.querySelectorAll("span");
    const step = 56 / (bars.length - 1);
    bars.forEach((bar, i) => bar.style.setProperty("--c", `hsl(${hue[0]} ${hue[1]}% ${22 + i * step}%)`));
  });
})();
