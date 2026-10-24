// Leyenda/transfondo de cada temporada, para temporada-actual.html. Canon
// compartido: un pulpo gigante recorre ciudades del mundo escondiendo una
// gema distinta cada 3 meses — de ahí sale el nombre de cada temporada
// (ciudad + gema) que ya arma seasonName() en js/seasons.js. Se cuenta a
// modo de historieta: capítulos cortos, en dos partes, con dos crípticos de
// la temporada siguiente: la ciudad a la mitad y la gema al final. El último
// capítulo de cada parte prepara su críptico.
//
// Agrega una entrada nueva acá al arrancar cada temporada — la clave debe
// calzar EXACTO con el nombre que produce seasonName(index). heroArt es
// opcional (arte propio de esa temporada, ver img/seasons/). Si una
// temporada no tiene entrada todavía, se usa SEASON_LORE_FALLBACK. Los
// crípticos se escriben aparte, en CRYPTICS (más abajo).
const SEASON_LORE = {
  "Mónaco Esmeralda": {
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
        text: "Los ingenieros que lograron aislar un fragmento de la señal coincidieron en un detalle: el verde del contador no era el verde estándar de ningún HUD conocido. Era más profundo, casi mineral — el mismo verde, dirían después los que llegaron a jugar esa temporada, de una esmeralda cortada para reflejar la luz de una mira. Alguien, en algún reporte interno, ya la había bautizado: Mónaco Esmeralda.",
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
  "Manhattan Amatista": {
    heroArt: "img/seasons/manhattan-arte.webp",
    tagline: "Un apagón en toda la isla, una sola torre encendida en morado y cristales que crecen donde nadie mira.",
    part1: [
      {
        title: "I. El apagón de las 3:14",
        text: "Tres meses después de que la señal se cortara en Mónaco, Manhattan se quedó a oscuras. A las 3:14 de la madrugada se apagó la isla entera, de Harlem a Battery Park, menos un edificio: el Empire State, encendido de arriba abajo en un morado que ningún ingeniero de la ciudad había programado. En las pantallas muertas de Times Square apareció, por un segundo, un temporizador del mismo color.",
      },
      {
        title: "II. Cristales en el metro",
        text: "Los primeros en verlos fueron los trabajadores de una línea de metro cerrada hace décadas. En las paredes del túnel crecían cristales de amatista, grandes como un rifle, y vibraban todos al mismo ritmo. El capataz grabó el sonido con su teléfono y lo subió esa misma noche. Medio internet lo reconoció en segundos: era el pitido de una bomba plantada, acelerando.",
      },
      {
        title: "III. La marca vuelve",
        text: "Cuando volvió la luz, ocho pantallas de Times Square mostraban la misma imagen: el pulpo de ocho tentáculos, ahora morado, enroscado alrededor de la aguja del Empire State. Cada tentáculo apuntaba a una azotea distinta de Midtown. Siete eran edificios abandonados. La octava tenía mesas, monitores y un cartel escrito a mano: la arena estaba lista.",
      },
      {
        title: "IV. Los que llegaron desde Mónaco",
        text: "Volvieron caras conocidas de la temporada pasada, ahora con rencores nuevos: dúos que habían ganado juntos llegaron en equipos rivales, y rivales de Mónaco llegaron compartiendo micrófono. Desde el Bronx y Brooklyn aparecieron nombres que nadie había visto competir. Todos coincidían en una sola regla no escrita: en esta frecuencia no se confía en las comunicaciones de nadie.",
      },
      {
        title: "V. Una frase en Times Square",
        text: "La primera eliminación de la temporada fue culpa de un smoke lanzado un segundo tarde sobre la entrada al sitio A. Pero lo que todos recuerdan de esa noche no es la ronda perdida. Cuando el humo se disipó, las ocho pantallas de Times Square dejaron de mostrar al pulpo y, durante un segundo, mostraron una frase que no tenía ningún sentido. Alguien la copió en el chat del torneo con una sola nota debajo: el pulpo nunca dice las cosas de frente.",
      },
    ],
    part2: [
      {
        title: "VI. La ciudad que nunca duerme",
        text: "A mitad de la temporada, Manhattan ya cobraba cada ronda. Los equipos ahorraban en bodegas de Brooklyn y jugaban rondas eco con lo justo, esperando el momento de comprar rifles para todos. Un force-buy a destiempo podía hundir a un equipo durante tres rondas seguidas. Los cristales del metro, decían los que bajaban a verlos, brillaban un poco más cada vez que alguien perdía su economía.",
      },
      {
        title: "VII. Defuse en el puente",
        text: "La final regional se jugó con el puente de Brooklyn de fondo. La bomba quedó plantada a cuarenta segundos del final y el último jugador vivo empezó a desactivarla sin kit, con dos rivales buscándolo entre el humo. Le alcanzó con dos décimas. En ese instante todas las luces del puente se volvieron moradas, y se quedaron así hasta el amanecer.",
      },
      {
        title: "VIII. El color de la amatista",
        text: "Los que llegaron a ganar un clutch esa temporada describen lo mismo: el último segundo antes de que la bomba explote tiene un color, y es morado. Dicen que los cristales se encienden justo ahí, cuando una sola persona decide la ronda. Un reporte interno ya los había bautizado desde el primer apagón, sin que nadie supiera quién lo escribió: Manhattan Amatista.",
      },
      {
        title: "IX. Ocho torres, un solo feed",
        text: "Al acercarse el cierre, las ocho azoteas empezaron a transmitir lo mismo: la gran final. El pulpo apareció completo por primera vez, abrazando la ciudad desde el río, con los ojos encendidos en morado sobre el skyline. Cuando cayó la última ronda, la marca se quedó fija en pantalla un segundo de más, y luego la señal se cortó, igual que en Mónaco.",
      },
      {
        title: "X. La próxima gema",
        text: "Nadie sabe todavía qué pasó con los cristales del metro ni quién encendió el Empire State aquella noche. Los que descifraron la frase de Times Square ya saben dónde va a reaparecer la señal. Pero la última transmisión de Manhattan guardó algo más: entre la estática, justo antes del corte, otra frase, tan torcida como la primera. Dicen que esconde el nombre de la próxima gema. La pregunta es si tu equipo va a estar ahí cuando se encienda.",
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

// Los dos crípticos de cada leyenda: la ciudad (a la mitad) y la gema (al
// final) de la temporada siguiente, para jugar (js/lore-cipher.js).
const CIPHERS = {
  city: {
    pick: (season) => season.city,
    intro: "A mitad de la temporada, la señal soltó una frase torcida. Esconde la ciudad donde el pulpo guardará la próxima gema.",
    solved: (word) => `Descifrado: el pulpo va a ${word}.`,
  },
  gem: {
    pick: (season) => season.gem,
    intro: "Antes de cortarse, la señal soltó una última frase. Esconde el nombre de la próxima gema.",
    solved: (word) => `Descifrado: la próxima gema es ${word}.`,
  },
};

// Un críptico por palabra, escrito a mano, con la clave tal como está en
// SEASON_CITIES o SEASON_GEMS (js/seasons.js). La frase tiene la definición
// (al principio o al final) y un juego de palabras: indicadores (qué hacer)
// y materiales (con qué). Las pistas de Significado, Indicador y Materiales
// muestran definition, indicator y materials; solution se lee al resolver o
// al rendirse. Una palabra sin críptico acá deja su transmisión oculta:
// escribir los de la temporada siguiente antes de que empiece.
const CRYPTICS = {
  // Para Manhattan Amatista (oct–dic 2026)
  Ibiza: {
    clue: "Un Dalí bizarro esconde la isla de la fiesta",
    definition: "la isla de la fiesta",
    indicator: "«Esconde» avisa que la respuesta está escrita, seguida, dentro de otras palabras de la frase.",
    materials: "Las letras están en «Dalí bizarro». No cuentan los espacios ni las tildes.",
    solution: "«esconde» marca una palabra escondida: dal·IBIZA·rro.",
  },
  Topacio: {
    clue: "La óptica revuelta con una o da la gema amarilla",
    definition: "la gema amarilla",
    indicator: "«Revuelta» avisa un anagrama: las mismas letras en otro orden. «Con» suma lo que sigue; «da» solo une con la definición.",
    materials: "«La óptica» y «una o», que es una sola letra.",
    solution: "ÓPTICA + O, revueltas: TOPACIO.",
  },
  // Para Ibiza Topacio (ene–mar 2027)
  Osaka: {
    clue: "Una osa con las dos primeras del kárate: la ciudad japonesa",
    definition: "la ciudad japonesa",
    indicator: "«Las dos primeras de» se queda con las dos primeras letras de lo que sigue. «Con» pega una parte detrás de la otra.",
    materials: "«Una osa», tal cual, y «kárate».",
    solution: "OSA más KA, las dos primeras de kárate: OSAKA.",
  },
  Rubí: {
    clue: "Un querubín esconde la gema roja",
    definition: "la gema roja",
    indicator: "«Esconde» avisa que la respuesta está escrita, seguida, dentro de otra palabra de la frase.",
    materials: "Las letras están en «querubín». No cuentan las tildes.",
    solution: "«esconde» marca una palabra escondida: que·RUBÍ·n.",
  },
  // Para Osaka Rubí (abr–jun 2027)
  Viena: {
    clue: "Nieva de otra manera en la ciudad del vals",
    definition: "la ciudad del vals",
    indicator: "«De otra manera» avisa un anagrama: las mismas letras en otro orden. «En» solo une con la definición.",
    materials: "Las cinco letras de «nieva».",
    solution: "NIEVA revuelto: VIENA.",
  },
  Diamante: {
    clue: "Un día con el mantel cortado: la piedra más dura",
    definition: "la piedra más dura",
    indicator: "«Cortado» quita la última letra. «Con» pega una parte detrás de la otra.",
    materials: "«Un día», tal cual, y «el mantel».",
    solution: "DÍA más MANTE(L): DIAMANTE.",
  },
  // Para Viena Diamante (jul–sep 2027)
  Miami: {
    clue: "Una nota y luego a mí: la ciudad de Florida",
    definition: "la ciudad de Florida",
    indicator: "«Y luego» pone una parte detrás de la otra.",
    materials: "«Una nota» es una nota musical de dos letras; «a mí» se usa tal cual, sin la tilde.",
    solution: "MI, la nota, más A MÍ: MIAMI.",
  },
  Granate: {
    clue: "Tánger revuelto con una a: la gema rojo vino",
    definition: "la gema rojo vino",
    indicator: "«Revuelto» avisa un anagrama: las mismas letras en otro orden. «Con» suma lo que sigue.",
    materials: "Las seis letras de «Tánger» y «una a», que es una sola letra.",
    solution: "TÁNGER + A, revueltos: GRANATE.",
  },
  // Para Miami Granate (oct–dic 2027)
  Marrakech: {
    clue: "Ciudad roja de Marruecos: karma y Che revueltos con otra erre",
    definition: "ciudad roja de Marruecos",
    indicator: "«Revueltos» avisa un anagrama: las mismas letras en otro orden. «Y» y «con» suman las partes.",
    materials: "«Karma», «Che» y «otra erre», que es una sola letra (karma ya trae la primera).",
    solution: "KARMA + CHE + R, revueltos: MARRAKECH.",
  },
  Jade: {
    clue: "Una risa de la piedra verde",
    definition: "la piedra verde",
    indicator: "No hay indicador escrito: las partes se pegan en el orden de la frase.",
    materials: "«Una risa» se escribe como suena, en dos letras; «de» se usa tal cual.",
    solution: "JA, una risa, más DE: JADE.",
  },
};

(function () {
  const heroImgEl = document.getElementById("season-lore-hero-img");
  const titleEl = document.getElementById("season-lore-title");
  const taglineEl = document.getElementById("season-lore-tagline");
  const part1El = document.getElementById("season-lore-part1");
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

  const next = getSeasonInfo(info.index + 1);
  document.querySelectorAll(".lore-cipher[data-cipher]").forEach((el) => {
    const cipher = CIPHERS[el.dataset.cipher];
    if (!cipher) return;
    const word = cipher.pick(next);
    const cryptic = CRYPTICS[word];
    if (!cryptic) return;
    el.querySelector(".lore-cipher-intro").textContent = cipher.intro;
    mountCipherGame(el.querySelector(".cipher-game"), {
      word,
      cryptic,
      solvedText: cipher.solved,
      shareTitle: `${el.querySelector("h2").textContent.trim()} · ${info.name}`,
      storageKey: `octagono.criptico.${info.name}.${el.dataset.cipher}`,
    });
    el.hidden = false;
  });
})();
