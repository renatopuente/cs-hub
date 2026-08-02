// Leyenda/transfondo de cada temporada, para temporada-actual.html. Canon
// compartido: un pulpo gigante recorre ciudades del mundo escondiendo una
// gema distinta cada 3 meses — de ahí sale el nombre de cada temporada
// (ciudad + gema) que ya arma seasonName() en js/seasons.js. Se cuenta a
// modo de historieta: capítulos cortos, en dos partes separadas por el
// bannerlite de temporada.
//
// Agrega una entrada nueva acá al arrancar cada temporada — la clave debe
// calzar EXACTO con el nombre que produce seasonName(index). heroArt es
// opcional (arte propio de esa temporada, ver img/seasons/); si falta, se
// usa bannerlite.webp también arriba. Si una temporada no tiene entrada
// todavía, se usa SEASON_LORE_FALLBACK.
const SEASON_LORE = {
  "Monaco Emerald": {
    heroArt: "img/seasons/monaco.webp",
    tagline: "Una frecuencia pirata, un satélite que nadie reclama, y una cuenta regresiva verde que ya empezó.",
    part1: [
      {
        title: "I. La señal que nadie debía captar",
        text: "Ocurrió a las 3:14 de la madrugada, en un cuarto de control frente al puerto de Mónaco: un técnico de guardia sintonizó por accidente una frecuencia que no estaba en ningún registro. En la pantalla, entre líneas de estática, un temporizador verde corría hacia atrás. Nadie en la sala reconoció el protocolo. Todos reconocieron el sonido: el mismo pitido de una bomba plantada, sitio B, cuarenta segundos.",
      },
      {
        title: "II. Ocho monitores, una sola marca",
        text: "La señal no venía de un solo lugar. Venía de ocho, transmitiendo en simultáneo, cada una mostrando una partida distinta desde un ángulo que ninguna cámara oficial podía tener. En la esquina inferior de cada feed, la misma marca de agua: un pulpo de ocho tentáculos, cada uno conectado a un cable distinto, cada cable a un servidor que nadie había firmado.",
      },
      {
        title: "III. El color del temporizador",
        text: "Los ingenieros que lograron aislar un fragmento de la señal coincidieron en un detalle: el verde del contador no era el verde estándar de ningún HUD conocido. Era más profundo, casi mineral — el mismo verde, dirían después los que llegaron a jugar esa temporada, de una esmeralda cortada para reflejar la luz de una mira. Alguien, en algún reporte interno, ya la había bautizado: Monaco Emerald.",
      },
      {
        title: "IV. Los que decodificaron las coordenadas",
        text: "Bastaron dos semanas para que la señal dejara de ser un rumor de ingenieros y se convirtiera en una dirección: una arena improvisada en la costa, sin nombre en ningún mapa turístico. Llegaron equipos que ya se conocían de otros torneos, y llegaron también nombres nuevos que nadie había visto competir antes. Todos traían la misma pregunta sin decirla en voz alta: ¿quién más descifró esto?",
      },
      {
        title: "V. El primer error de cálculo",
        text: "La primera baja de la temporada no fue una eliminación en el marcador. Fue un rotate mal calculado: un jugador dejó su sitio dos segundos antes de tiempo, confiado en que su compañero cubriría el hueco, y su compañero — por primera vez en meses — dudó. El round se perdió por eso. El equipo, poco después, también.",
      },
    ],
    part2: [
      {
        title: "VI. La economía no perdona",
        text: "Para el ecuador de la temporada, ya nadie jugaba solo por ganar la ronda: jugaba por sobrevivir a la siguiente. Un force-buy mal calculado podía dejar a un equipo entero sin rifles durante tres rounds seguidos, y en esa frecuencia, tres rounds sin rifles equivalían a tres semanas fuera de la tabla. Se ahorraba, se apostaba, se perdía. La señal seguía transmitiendo, indiferente.",
      },
      {
        title: "VII. Silencio de radio en sitio B",
        text: "Hubo una final regional en la que el equipo favorito cortó su propia comunicación interna durante los últimos diez segundos de un round decisivo — una jugada calculada para que el rival, que llevaba semanas interceptando su frecuencia, no escuchara el plan. Funcionó. Ganaron el sitio. Pero dos jugadores del equipo, los que ejecutaron la jugada a ciegas y en silencio, no volvieron a confiar del todo en el resto del roster.",
      },
      {
        title: "VIII. Lo que cuesta un clutch",
        text: "Los que llegaron a jugar un 1vs3 en esa frecuencia describen lo mismo después: el sonido de la propia respiración tapando el resto del audio, el temporizador verde en la esquina bajando más rápido de lo que debería ser posible, y una claridad extraña — como si el resto de la temporada, hasta ese punto, hubiera sido solo el entrenamiento para ese round exacto.",
      },
      {
        title: "IX. La última transmisión",
        text: "Cuando se acerca el final de la temporada, los ocho monitores empiezan a sincronizarse en un solo feed: la gran final. La marca del pulpo se queda fija en pantalla hasta el último disparo, y luego — siempre así, sin excepción — la señal se corta. No hay despedida, no hay créditos. Solo estática, y un nombre nuevo grabado en el historial.",
      },
      {
        title: "X. Sintoniza tu frecuencia",
        text: "Nadie ha logrado rastrear el origen real de la señal, ni por qué elige Mónaco esta vez, ni quién programó ese temporizador verde que ya está corriendo. Lo único seguro es que la próxima transmisión ya tiene fecha. La pregunta es si tu equipo va a estar del otro lado de la pantalla, o dentro de ella.",
      },
    ],
  },
};

const SEASON_LORE_FALLBACK = {
  heroArt: "",
  tagline: "El pulpo todavía está tallando la gema de esta temporada.",
  part1: [{ title: "Capítulo perdido", text: "Vuelve pronto — el Octágono todavía no ha escrito la leyenda de esta temporada." }],
  part2: [],
};

(function () {
  const heroImgEl = document.getElementById("season-lore-hero-img");
  const titleEl = document.getElementById("season-lore-title");
  const taglineEl = document.getElementById("season-lore-tagline");
  const part1El = document.getElementById("season-lore-part1");
  const dividerEl = document.getElementById("season-lore-divider");
  const part2El = document.getElementById("season-lore-part2");
  if (!titleEl && !taglineEl && !part1El && !part2El) return;

  const info = getSeasonInfo(currentSeasonIndex());
  const lore = SEASON_LORE[info.name] || SEASON_LORE_FALLBACK;

  if (titleEl) titleEl.textContent = info.name;
  if (taglineEl) taglineEl.textContent = lore.tagline;
  if (heroImgEl) {
    heroImgEl.src = lore.heroArt || "img/banners/bannerlite.webp";
    heroImgEl.alt = `Temporada actual: ${info.name}`;
  }

  function renderPanels(list) {
    return (list || [])
      .map(
        (p) => `
        <div class="lore-panel">
          <div class="lore-panel-title">${p.title}</div>
          <p class="lore-panel-text">${p.text}</p>
        </div>
      `
      )
      .join("");
  }

  if (part1El) part1El.innerHTML = renderPanels(lore.part1);
  if (part2El) part2El.innerHTML = renderPanels(lore.part2);
  if (dividerEl) dividerEl.hidden = !(lore.part2 && lore.part2.length);
})();
