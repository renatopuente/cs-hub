// Leyenda/transfondo de cada temporada, para temporada-actual.html. Canon
// compartido: un pulpo gigante recorre ciudades del mundo escondiendo una
// gema distinta cada 3 meses — de ahí sale el nombre de cada temporada
// (ciudad + gema) que ya arma seasonName() en js/seasons.js.
//
// Agrega una entrada nueva acá al arrancar cada temporada — la clave debe
// calzar EXACTO con el nombre que produce seasonName(index). Si una
// temporada no tiene entrada todavía, se usa SEASON_LORE_FALLBACK.
const SEASON_LORE = {
  "Monaco Emerald": {
    tagline: "Entre yates y curvas de asfalto, una esmeralda tallada en el fondo del puerto.",
    story: [
      "Cuentan los jugadores más veteranos que El Octágono no nació de la nada: un pulpo gigante — ocho brazos, ocho torneos posibles a la vez — recorre las grandes ciudades del mundo buscando la gema perfecta para cada temporada. Donde se posa, monta su arena. Ahí compiten Duelos, Duos y Pug durante tres meses por el derecho a reclamar esa gema y grabar su nombre en el historial de la temporada.",
      "Esta vez, el pulpo ancló sus tentáculos en Mónaco. Entre yates, casinos y el Mediterráneo, escondió una Esmeralda tan verde como las aguas profundas de donde él viene — dicen que la talló él mismo, en una noche sin torneos, en el fondo del puerto. Pero aquí no gana el más rico ni el más famoso: gana quien mejor lea el juego, ronda tras ronda, hasta quedarse con la gema.",
      "Cada duelo, cada dúo y cada pug de esta temporada es una apuesta silenciosa por el brillo de Monaco Emerald.",
    ],
  },
};

const SEASON_LORE_FALLBACK = {
  tagline: "El pulpo todavía está tallando la gema de esta temporada.",
  story: ["Vuelve pronto — el Octágono todavía no ha escrito la leyenda de esta temporada."],
};

(function () {
  const titleEl = document.getElementById("season-lore-title");
  const taglineEl = document.getElementById("season-lore-tagline");
  const storyEl = document.getElementById("season-lore-story");
  if (!titleEl && !taglineEl && !storyEl) return;

  const info = getSeasonInfo(currentSeasonIndex());
  const lore = SEASON_LORE[info.name] || SEASON_LORE_FALLBACK;

  if (titleEl) titleEl.textContent = info.name;
  if (taglineEl) taglineEl.textContent = lore.tagline;
  if (storyEl) {
    storyEl.innerHTML = lore.story
      .map((p) => `<p style="color: var(--text-dim); font-size: 0.95rem; margin: 0 0 14px;">${p}</p>`)
      .join("");
  }
})();
