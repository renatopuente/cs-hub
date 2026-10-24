// Portada: el tablero "La arena ahora" (estado en vivo de cada modo leyendo
// tournaments/{mode}), la placa de la temporada actual y el fundido lento de
// las imágenes del hero. Sin JS la página queda con los enlaces planos.

(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Tablero de la arena -------------------------------------------------

  const boardStates = document.querySelectorAll(".board-state[data-mode]");
  const boardData = {};

  function championOf(tournament) {
    const teamById = (id) => (tournament.teams || []).find((t) => t.id === id);
    if (tournament.winner) return teamById(tournament.winner);
    // Duos en llaves: el campeón sale de la final.
    if (tournament.format === "bracket" && Array.isArray(tournament.matches)) {
      const finalRound = tournament.matches[tournament.matches.length - 1];
      const finalMatch = Array.isArray(finalRound) ? finalRound[0] : null;
      if (finalMatch && finalMatch.winner) return teamById(finalMatch.winner);
    }
    return null;
  }

  function startsIn(ms) {
    const totalMin = Math.max(1, Math.round(ms / 60000));
    if (totalMin < 60) return `Empieza en ${totalMin} min`;
    const h = Math.floor(totalMin / 60);
    if (h >= 48) {
      const when = new Date(Date.now() + ms).toLocaleString("es-EC", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
      return `Empieza el ${when}`;
    }
    const min = totalMin % 60;
    return min ? `Empieza en ${h} h ${min} min` : `Empieza en ${h} h`;
  }

  function renderState(el, tournament) {
    const row = el.closest("li");
    row.classList.remove("is-live", "is-scheduled");
    // Un solo bloque de texto junto al punto, para que no se parta en columnas.
    const text = document.createElement("span");
    el.replaceChildren(text);

    if (!tournament || !tournament.teams) {
      text.textContent = "Próximo torneo por anunciar";
      return;
    }

    if (tournament.finalizedAt) {
      const champion = championOf(tournament);
      if (!champion) {
        text.textContent = "Último torneo finalizado";
        return;
      }
      const swatch = document.createElement("span");
      swatch.className = "team-swatch";
      swatch.style.setProperty("--c", champion.color || "currentColor");
      text.append("Último campeón: ", swatch, champion.name);
      return;
    }

    if (tournament.scheduledAt && !tournament.started) {
      row.classList.add("is-scheduled");
      const left = tournament.scheduledAt - Date.now();
      text.textContent = left > 0 ? startsIn(left) : "Por empezar";
      return;
    }

    row.classList.add("is-live");
    text.textContent = "En curso ahora";
  }

  if (boardStates.length && typeof fbSubscribe === "function") {
    boardStates.forEach((el) => {
      const mode = el.dataset.mode;
      fbSubscribe(mode, (tournament) => {
        boardData[mode] = tournament;
        renderState(el, tournament);
      });
    });

    // La cuenta regresiva de los programados avanza sola.
    setInterval(() => {
      boardStates.forEach((el) => {
        const tournament = boardData[el.dataset.mode];
        if (tournament && tournament.scheduledAt && !tournament.started && !tournament.finalizedAt) renderState(el, tournament);
      });
    }, 30000);
  }

  // --- Placa de la temporada -----------------------------------------------

  const seasonNameEl = document.getElementById("season-name");
  const seasonDatesEl = document.getElementById("season-dates");
  if (seasonNameEl && typeof getSeasonInfo === "function") {
    const current = getSeasonInfo(currentSeasonIndex());
    const fmt = (d) => d.toLocaleDateString("es-EC", { day: "numeric", month: "long" });
    seasonNameEl.textContent = `Temporada ${current.name}`;
    if (seasonDatesEl) seasonDatesEl.textContent = `Del ${fmt(current.start)} al ${fmt(current.end)}. Al cerrar, el ranking vuelve a cero.`;

    // El arte sin texto de la temporada (js/season-tone.js); el nombre va escrito debajo.
    const plateImg = document.querySelector(".season-plate img");
    const art = typeof SEASON_ART !== "undefined" ? SEASON_ART[current.name] : null;
    if (plateImg) {
      plateImg.src = art || "img/banners/octobanner.webp";
      plateImg.alt = `Arte de la temporada ${current.name}`;
    }
  }

  // --- Fundido lento de la sala --------------------------------------------

  const roomImgs = document.querySelectorAll(".hero-room .room-img");
  if (roomImgs.length > 1 && !reducedMotion) {
    const HOLD_MS = 5500;
    let current = 0;
    let timer = null;

    const advance = () => {
      roomImgs[current].classList.remove("is-on");
      current = (current + 1) % roomImgs.length;
      roomImgs[current].classList.add("is-on");
    };
    const start = () => {
      if (!timer) timer = setInterval(advance, HOLD_MS);
    };
    const stop = () => {
      clearInterval(timer);
      timer = null;
    };

    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    start();
  }

  // --- El clip de Dust2 de la carta ----------------------------------------

  // Se reproduce solo mientras está en pantalla; con menos movimiento pedido
  // se queda en su imagen fija.
  const clip = document.querySelector(".letter-clip");
  if (clip && !reducedMotion && "IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) clip.play().catch(() => {});
        else clip.pause();
      });
    }).observe(clip);
  }

  // --- Entradas al hacer scroll --------------------------------------------

  const revealEls = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || reducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        // Lo que entra junto aparece en cascada, 60 ms entre cada parte.
        let order = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.style.transitionDelay = `${order++ * 60}ms`;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }
})();
