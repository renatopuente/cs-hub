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
    tagline: "Entre yates y curvas de asfalto, una esmeralda que no se compra: se gana, o se paga con algo que no vuelve.",
    part1: [
      {
        title: "I. La ciudad que no duerme",
        text: "Mónaco no cierra los ojos. Ni siquiera de madrugada, cuando los casinos apagan las luces grandes y dejan solo las necesarias para que nadie tropiece con su propia suerte. Fue en una de esas madrugadas cuando el pulpo llegó por primera vez — nadie sabe bien cuándo —, y desde entonces la ciudad aprendió a no hacer preguntas.",
      },
      {
        title: "II. Ocho tratos, una sola noche",
        text: "Dicen los croupiers más viejos que un hombre de ocho brazos se sentó una vez en cada mesa del Casino de Montecarlo, la misma noche, a la misma hora. Ocho partidas. Ocho ganadores distintos. Ninguno volvió a jugar en Mónaco jamás. Algunos dicen que se retiraron ricos. Otros, que solo desaparecieron de las listas de invitados.",
      },
      {
        title: "III. La piedra que no se compra",
        text: "Corrió la voz de una esmeralda hundida en el puerto, tan verde como el fondo del Mediterráneo en sus zonas más profundas, donde ya no llega el sol. El pulpo la había tallado él mismo, con la paciencia de quien no envejece y la precisión de quien nunca se equivoca dos veces. No estaba en venta. No se heredaba. Solo se ganaba, ronda tras ronda, temporada tras temporada.",
      },
      {
        title: "IV. Los que llegaron por hambre",
        text: "Vinieron pilotos que ya habían apostado sus autos, herederos que ya habían apostado su apellido, y jugadores a quienes solo les quedaba apostar el orgullo. Todos miraron la esmeralda y pensaron lo mismo: esta vez sí. Ninguno se detuvo a preguntar qué fue de quienes la persiguieron la temporada anterior. En Mónaco esa pregunta se hace una sola vez, y solo antes de empezar.",
      },
      {
        title: "V. El primer sacrificio",
        text: "El primero en caer no perdió una partida. Perdió a su compañero de equipo, que una noche entendió que solo uno de los dos iba a sostener esa piedra bajo la luz, y decidió que sería él antes de que su amigo lo decidiera primero. No hubo traición gritada ni pelea. Solo un silencio nuevo entre dos personas que antes no lo tenían.",
      },
    ],
    part2: [
      {
        title: "VI. Lo que la codicia deja atrás",
        text: "Para cuando llegó el ecuador de la temporada, ya no quedaban equipos completos. Quedaban individuos calculando cuánto valía cada punto de más, cada ronda ganada, cada nombre que subía en la tabla mientras otro bajaba. El pulpo observaba sin intervenir. Nunca interviene. Su único trabajo es esconder la piedra; el precio de encontrarla lo pone cada quien.",
      },
      {
        title: "VII. La noche de las cuentas pendientes",
        text: "Hubo una noche — siempre hay una — en que dos finalistas se cruzaron fuera del Octágono, lejos de las cámaras y del marcador. Nadie sabe qué se dijeron. Lo que se sabe es que al día siguiente uno de los dos jugó la mejor serie de su vida, y el otro no volvió a jugar esa temporada.",
      },
      {
        title: "VIII. El costo de sostenerla",
        text: "Los que llegan a tocar la Monaco Emerald cuentan lo mismo: que pesa más de lo que parece. No en las manos — en la memoria. Se recuerda cada decisión que se tomó para llegar hasta ahí, cada nombre que quedó atrás en el camino, cada vez que la ambición ganó una discusión que la lealtad debería haber ganado.",
      },
      {
        title: "IX. Lo que queda cuando se apaga el brillo",
        text: "Al cierre de la temporada, el brillo de la gema se apaga — siempre se apaga — y el pulpo recoge sus tentáculos rumbo a la siguiente ciudad. Lo que deja atrás no es solo un nombre en el historial. Es la pregunta que cada campeón se lleva consigo, sin responder del todo: ¿valió la pena lo que costó llegar hasta aquí?",
      },
      {
        title: "X. La invitación",
        text: "Mónaco ya eligió su gema. Ahora te toca a ti decidir cuánto estás dispuesto a apostar para sostenerla. El Octágono no promete que sea fácil. Promete que, ganes o pierdas, quedará escrito.",
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
