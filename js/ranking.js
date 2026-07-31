const podiumGridEl = document.getElementById("podium-grid");
const podiumSeasonBadgeEl = document.getElementById("podium-season-badge");
const podiumRankingTitleEl = document.getElementById("podium-ranking-title");
const rankingBodyEl = document.getElementById("ranking-body");
const rankingEmptyEl = document.getElementById("ranking-empty");
const rankingTableCard = document.getElementById("ranking-table-card");
const rankingPaginationEl = document.getElementById("ranking-pagination");
const rankingPrevBtn = document.getElementById("ranking-prev-btn");
const rankingNextBtn = document.getElementById("ranking-next-btn");
const rankingPageLabelEl = document.getElementById("ranking-page-label");

// Sesión del jugador (Google, player-auth.js): solo el dueño de un puesto
// del podio ve su propio botón "Reclamar premio" — a cualquier otro
// visitante (sin sesión, o logueado con otro Nickname) se le muestra un
// CTA para inscribirse en su lugar.
let currentPlayerNickname = "";
firebase.auth().onAuthStateChanged((user) => {
  currentPlayerNickname = "";
  if (user && typeof loadUserProfile === "function") {
    loadUserProfile(user.uid).then((profile) => {
      currentPlayerNickname = (profile.nickname || user.displayName || "").trim().toLowerCase();
      renderRanking();
    });
  } else {
    renderRanking();
  }
});

// Tamaño de página tal que la primera página siga mostrando exactamente
// los puestos 4 al 10 (7 filas), igual que antes de tener paginación —
// recién a partir del puesto 11 aparecen más páginas.
const RANKING_PAGE_SIZE = 7;
let rankingPage = 0;

rankingPrevBtn.addEventListener("click", () => {
  if (rankingPage <= 0) return;
  rankingPage -= 1;
  renderRanking();
});
rankingNextBtn.addEventListener("click", () => {
  rankingPage += 1;
  renderRanking();
});

const GENERIC_AVATAR = "img/icons/icono_app-192.png";

// Avatar por jugador: se arma con la foto de Google que quedó guardada en
// sus solicitudes de inscripción (públicas), la más reciente por Nickname.
// Solo funciona para quienes se inscribieron logueados después de este
// cambio — el resto (o quien nunca se inscribió) usa el avatar genérico.
let avatarByName = {};
if (typeof fbSubscribeSolicitudes === "function") {
  fbSubscribeSolicitudes((list) => {
    const sorted = [...list].sort((a, b) => (a.requestedAt || 0) - (b.requestedAt || 0));
    avatarByName = {};
    sorted.forEach((item) => {
      if (item.name && item.photoURL) {
        avatarByName[item.name.trim().toLowerCase()] = item.photoURL;
      }
    });
    renderRanking();
  });
}

function avatarForName(name) {
  return avatarByName[(name || "").trim().toLowerCase()] || GENERIC_AVATAR;
}

// Líneas de ASCII art a los costados de "Ranking": un solo carácter
// repetido muchas veces, recortado por overflow:hidden a lo que quepa
// en el ancho disponible (flex:1) a cada lado.
document.querySelectorAll(".podium-title-ascii").forEach((el) => {
  el.textContent = "═".repeat(300);
});

/* ---------- Scramble: "Ranking" y el nombre de temporada alternan 4s de
   lectura normal (con 1-2 glitches breves de un par de letras) con 2s de
   glitch completo (letras al azar, nunca todas a la vez para poder
   deducir el texto), en bucle. ---------- */

const SCRAMBLE_CHARS = "0123456789!@#$%^&*_+-=<>?/[]{}~";
const SCRAMBLE_PHASE_MS = 2000;
const STEADY_PHASE_MS = 4000;
const SCRAMBLE_TICK_MS = 120;
const STEADY_GLITCH_DURATION_MS = 120;

function randomScrambleChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

// Cada tick elige una sola estrategia (pares, impares o mixta) para todo
// el texto, así siempre queda al menos la mitad de las letras reales
// visibles y se puede deducir el titular durante el glitch.
function scrambledOnce(chars) {
  const strategy = ["even", "odd", "mixed"][Math.floor(Math.random() * 3)];
  return chars
    .map((ch, i) => {
      if (ch === " ") return ch;
      const hit = strategy === "even" ? i % 2 === 0 : strategy === "odd" ? i % 2 === 1 : Math.random() < 0.5;
      return hit ? randomScrambleChar() : ch;
    })
    .join("");
}

// Un solo reloj maestro controla la fase (glitch/legible) de TODOS los
// textos registrados a la vez, en vez de que cada uno corra su propio
// setTimeout — así "Ranking" y el nombre de temporada siempre entran y
// salen del glitch completo exactamente juntos, sin desfase posible.
const scrambleTargets = [];
let masterTickId = null;
let masterPhaseId = null;

// Una vez que el ranking ya cargó datos reales, el ciclo termina su fase
// legible en curso y se detiene ahí — nunca vuelve a entrar en glitch.
// Mientras no haya datos (o tarde en cargar), sigue en bucle como
// indicador de carga.
let rankingDataLoaded = false;

function makeScrambleTarget(el, text) {
  const chars = text.split("");
  return { el, original: text, chars, nonSpaceIdx: chars.map((_, i) => i).filter((i) => chars[i] !== " "), glitchTimeouts: [] };
}

function clearGlitchTimeouts(target) {
  target.glitchTimeouts.forEach(clearTimeout);
  target.glitchTimeouts = [];
}

// Aunque el texto se lee normal en esta fase, se cuelan 2 o 3 chispazos
// breves (un par de letras al azar por un instante) para darle vida sin
// afectar la legibilidad general.
function scheduleSteadyGlitches(target) {
  if (!target.nonSpaceIdx.length) return;
  const glitchCount = 2 + Math.floor(Math.random() * 2);
  for (let g = 0; g < glitchCount; g++) {
    const at = 200 + Math.random() * (STEADY_PHASE_MS - STEADY_GLITCH_DURATION_MS - 400);
    target.glitchTimeouts.push(
      setTimeout(() => {
        const count = Math.random() < 0.5 ? 1 : 2;
        const picked = new Set();
        while (picked.size < Math.min(count, target.nonSpaceIdx.length)) {
          picked.add(target.nonSpaceIdx[Math.floor(Math.random() * target.nonSpaceIdx.length)]);
        }
        target.el.textContent = target.chars.map((ch, i) => (picked.has(i) ? randomScrambleChar() : ch)).join("");
        target.glitchTimeouts.push(
          setTimeout(() => {
            target.el.textContent = target.original;
          }, STEADY_GLITCH_DURATION_MS)
        );
      }, at)
    );
  }
}

function runMasterScramblePhase() {
  scrambleTargets.forEach(clearGlitchTimeouts);
  masterTickId = setInterval(() => {
    scrambleTargets.forEach((t) => {
      t.el.textContent = scrambledOnce(t.chars);
    });
  }, SCRAMBLE_TICK_MS);
  masterPhaseId = setTimeout(runMasterSteadyPhase, SCRAMBLE_PHASE_MS);
}

function stopMasterScramble() {
  clearInterval(masterTickId);
  clearTimeout(masterPhaseId);
  masterTickId = null;
  masterPhaseId = null;
  scrambleTargets.forEach((t) => {
    clearGlitchTimeouts(t);
    t.el.textContent = t.original;
  });
}

function runMasterSteadyPhase() {
  clearInterval(masterTickId);
  scrambleTargets.forEach((t) => {
    t.el.textContent = t.original;
  });
  scrambleTargets.forEach(scheduleSteadyGlitches);

  // Esta fase legible (con sus chispazos) siempre se reproduce completa;
  // recién al terminar se decide si se detiene para siempre (datos ya
  // cargados) o si vuelve a entrar en glitch (todavía cargando).
  masterPhaseId = setTimeout(() => {
    if (rankingDataLoaded) {
      stopMasterScramble();
    } else {
      runMasterScramblePhase();
    }
  }, STEADY_PHASE_MS);
}

function ensureMasterScrambleRunning() {
  if (rankingDataLoaded) return;
  if (masterTickId || masterPhaseId) return;
  runMasterScramblePhase();
}

function removeScrambleTarget(target) {
  if (!target) return;
  clearGlitchTimeouts(target);
  const idx = scrambleTargets.indexOf(target);
  if (idx !== -1) scrambleTargets.splice(idx, 1);
}

let rankingTitleTarget = null;
if (podiumRankingTitleEl) {
  rankingTitleTarget = makeScrambleTarget(podiumRankingTitleEl, podiumRankingTitleEl.textContent);
  scrambleTargets.push(rankingTitleTarget);
  ensureMasterScrambleRunning();
}

let seasonBadgeTarget = null;

function scrambleSeasonBadge(name) {
  if (seasonBadgeTarget && seasonBadgeTarget.original === name) return;
  if (seasonBadgeTarget) removeScrambleTarget(seasonBadgeTarget);
  seasonBadgeTarget = makeScrambleTarget(podiumSeasonBadgeEl, name);
  scrambleTargets.push(seasonBadgeTarget);
  podiumSeasonBadgeEl.textContent = name;
  ensureMasterScrambleRunning();
}

const PODIUM_ICONS = [
  '<i class="fa-solid fa-trophy icon-gold"></i>',
  '<i class="fa-solid fa-medal icon-silver"></i>',
  '<i class="fa-solid fa-medal icon-bronze"></i>',
];

// Premio en efectivo de fin de temporada — adicional a lo que cada quien
// ya gana torneo por torneo. Se paga al cierre de la temporada (último
// día, cuando el podio queda definitivo); al día siguiente arranca la
// temporada nueva y el ranking se reinicia.
const PODIUM_PRIZES = [20, 15, 10];

// Matches both current plain-text results and any legacy record still
// carrying the old 🏆 prefix — no Firebase migration needed.
function isWinningResult(result) {
  return typeof result === "string" && (result.includes("Ganó") || result.includes("Campeón") || /^#1\b/.test(result));
}

// Ranking points per win, weighted by tournament tier (matches the fee
// stored on each history entry). Falls back to 1 for anything unexpected
// or missing so older records don't break the tally.
const TIER_WEIGHTS = {
  "Gratuito": 0.5, // Amistoso
  "$1 USD": 1, // Casual
  "$2 USD": 2, // Competitivo
  "$5 USD": 3, // Premier
  "$10 USD": 5, // Élite
};
function tierWeight(entryFee) {
  return TIER_WEIGHTS[entryFee] ?? 1;
}

function formatPoints(points) {
  return Number.isInteger(points) ? String(points) : points.toFixed(1);
}

// The last day of a season closes (Finalizado) at 8am and stays closed
// the rest of that day. The following day the season resets at midnight,
// but any tournaments played that first day are Amistoso-only and don't
// count — so the board keeps showing the previous season's results for
// one extra day before actually flipping over.
function getDisplaySeason() {
  const now = new Date();
  let index = currentSeasonIndex();
  let info = getSeasonInfo(index);

  if (info.start.toDateString() === now.toDateString()) {
    index -= 1;
    info = getSeasonInfo(index);
  }

  const isLastDay = info.end.toDateString() === now.toDateString();
  const closed = (isLastDay && now.getHours() >= 8) || (!isLastDay && now > info.end);

  return { index, info, closed };
}

let duelosHistory = [];
let duosHistory = [];
let pugHistory = [];
let rankingResetAt = 0;

// cutoff (opcional): si se pasa, solo cuenta resultados finalizados ANTES
// de ese instante — así se puede reconstruir el ranking "como estaba"
// justo antes de la última tanda de resultados, para comparar puestos.
function buildRanking(seasonIdx, cutoff) {
  const stats = {};
  const inSeason = (entry) =>
    entry.finalizedAt &&
    seasonIndexForDate(new Date(entry.finalizedAt)) === seasonIdx &&
    entry.finalizedAt > rankingResetAt &&
    (cutoff == null || entry.finalizedAt < cutoff);

  [...duelosHistory, ...duosHistory, ...pugHistory].filter(inSeason).forEach((entry) => {
    const weight = tierWeight(entry.entryFee);
    (entry.teams || []).forEach((t) => {
      const won = isWinningResult(t.result);
      (t.players || []).forEach((rawName) => {
        const name = (rawName || "").trim();
        if (!name) return;
        if (!stats[name]) stats[name] = { name, wins: 0, played: 0, points: 0 };
        stats[name].played += 1;
        if (won) {
          stats[name].wins += 1;
          stats[name].points += weight;
        }
      });
    });
  });

  return Object.values(stats).sort(
    (a, b) => b.points - a.points || b.wins - a.wins || b.played - a.played || a.name.localeCompare(b.name)
  );
}

// Tendencia por jugador: compara el puesto actual contra el puesto que
// tenía justo antes de la última tanda de resultados finalizados en la
// temporada. Positivo = subió puestos (ganó y ascendió), negativo =
// bajó puestos, 0/undefined = sin cambio o sin datos previos (recién
// entra al ranking esta temporada).
function computeTrends(seasonIdx, ranked) {
  const entries = [...duelosHistory, ...duosHistory, ...pugHistory].filter(
    (e) => e.finalizedAt && seasonIndexForDate(new Date(e.finalizedAt)) === seasonIdx && e.finalizedAt > rankingResetAt
  );
  if (!entries.length) return {};

  const lastFinalizedAt = Math.max(...entries.map((e) => e.finalizedAt));
  const previousRanked = buildRanking(seasonIdx, lastFinalizedAt);
  const previousPositions = {};
  previousRanked.forEach((r, idx) => {
    previousPositions[r.name] = idx + 1;
  });

  const trends = {};
  ranked.forEach((r, idx) => {
    const prevPos = previousPositions[r.name];
    trends[r.name] = prevPos == null ? 0 : prevPos - (idx + 1);
  });
  return trends;
}

// Flecha verde arriba (subió puestos), roja abajo (bajó), o guion neutro
// (sin cambio o sin datos previos) — toda fila, podio incluido, muestra
// siempre uno de los tres.
function trendIconHtml(trend) {
  if (trend > 0) return '<i class="fa-solid fa-arrow-up rank-trend-up" title="Subió puestos"></i>';
  if (trend < 0) return '<i class="fa-solid fa-arrow-down rank-trend-down" title="Bajó puestos"></i>';
  return '<i class="fa-solid fa-minus rank-trend-flat" title="Sin cambios"></i>';
}

function renderRanking() {
  const displaySeason = getDisplaySeason();
  const ranked = buildRanking(displaySeason.index);

  if (!ranked.length) {
    removeScrambleTarget(seasonBadgeTarget);
    seasonBadgeTarget = null;
    podiumSeasonBadgeEl.hidden = true;
    podiumGridEl.innerHTML = "";
    rankingBodyEl.innerHTML = "";
    rankingTableCard.hidden = true;
    rankingPaginationEl.hidden = true;
    rankingEmptyEl.hidden = false;
    return;
  }

  rankingDataLoaded = true;
  scrambleSeasonBadge(displaySeason.info.name);
  podiumSeasonBadgeEl.hidden = false;

  const statusClass = displaySeason.closed ? "season-status-ended" : "season-status-active";
  const statusLabel = displaySeason.closed ? "Finalizado" : "En curso";
  const trends = computeTrends(displaySeason.index, ranked);

  podiumGridEl.innerHTML = ranked
    .slice(0, 3)
    .map((r, i) => {
      const rate = r.played ? Math.round((r.wins / r.played) * 100) : 0;
      const isOwnCard = !!currentPlayerNickname && r.name.trim().toLowerCase() === currentPlayerNickname;
      const prizeActionHtml = isOwnCard
        ? `
          <button type="button" class="podium-claim-btn" data-claim-id="${i}">
            <i class="fa-solid fa-gift"></i> Reclamar premio
          </button>
        `
        : `
          <a href="inscripcion.html" class="podium-participate-cta">
            <i class="fa-solid fa-ticket"></i> ¡Participa tú también!
          </a>
        `;
      return `
        <div class="glass-card podium-card flip-card" data-podium-id="${i}">
          <div class="flip-card-inner">
            <div class="flip-card-front">
              <div class="podium-card-banner"></div>
              <button class="share-btn" data-share-id="${i}" title="Compartir">
                <i class="fa-solid fa-share-nodes"></i>
              </button>
              <button class="podium-flip-btn" data-flip-id="${i}" title="Conocer mi premio">
                <i class="fa-solid fa-rotate"></i>
              </button>
              <img class="podium-avatar" src="${avatarForName(r.name)}" alt="" />
              <div class="icon">${PODIUM_ICONS[i]}</div>
              <span class="podium-rank-row">
                <span class="podium-rank">#${i + 1}</span>
                ${trendIconHtml(trends[r.name] || 0)}
              </span>
              <div class="podium-name-row">
                <h2>${r.name}</h2>
                <span class="season-status-chip ${statusClass}">${statusLabel}</span>
              </div>
              <div class="podium-stats-row">
                <p class="section-sub podium-season"><i class="fa-solid fa-calendar"></i> ${displaySeason.info.name}</p>
                <div class="fee-price">${formatPoints(r.points)} <span class="unit">puntos</span></div>
              </div>
              <div class="podium-stats-row">
                <p><span class="podium-stat-num">${r.played}</span> torneos jugados</p>
                <p><span class="podium-stat-num">${rate}%</span> efectividad</p>
              </div>
            </div>
            <div class="flip-card-back">
              <div class="podium-prize-amount">$${PODIUM_PRIZES[i]} <span class="unit">USD</span></div>
              <p class="podium-prize-label">Premio de temporada</p>
              <p class="podium-prize-note">Adicional a lo que ganas en cada torneo. Se entrega al cierre de la temporada.</p>
              ${prizeActionHtml}
              <a href="terminos.html" class="podium-terms-link">Términos y condiciones</a>
              <button type="button" class="podium-flip-btn podium-flip-back-btn" data-flip-id="${i}">
                <i class="fa-solid fa-rotate"></i> Volver
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  podiumGridEl.querySelectorAll("[data-share-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".podium-card");
      shareAsImage(card, "podio-el-octagono.png", "Mi puesto en la tabla de posiciones de El Octágono 🐙");
    });
  });

  podiumGridEl.querySelectorAll("[data-claim-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      alert("El premio se habilita para reclamar al finalizar la temporada.");
    });
  });

  podiumGridEl.querySelectorAll("[data-flip-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".flip-card")?.classList.toggle("is-flipped");
    });
  });

  const restOfTable = ranked.slice(3);

  if (!restOfTable.length) {
    rankingTableCard.hidden = true;
    rankingPaginationEl.hidden = true;
    rankingEmptyEl.hidden = false;
    return;
  }

  rankingTableCard.hidden = false;
  rankingEmptyEl.hidden = true;

  const totalPages = Math.ceil(restOfTable.length / RANKING_PAGE_SIZE);
  if (rankingPage >= totalPages) rankingPage = totalPages - 1;
  if (rankingPage < 0) rankingPage = 0;

  const pageStart = rankingPage * RANKING_PAGE_SIZE;
  const pageItems = restOfTable.slice(pageStart, pageStart + RANKING_PAGE_SIZE);

  rankingBodyEl.innerHTML = pageItems
    .map((r, idx) => {
      const i = pageStart + idx + 3;
      const rate = r.played ? Math.round((r.wins / r.played) * 100) : 0;
      // Puestos 4 y 5: mención honorífica, un peldaño debajo del podio.
      const honorable = i === 3 || i === 4;
      return `
        <tr class="${honorable ? "rank-honorable" : ""}">
          <td class="rank" data-label="Posición">${trendIconHtml(trends[r.name] || 0)}#${i + 1}</td>
          <td data-label="Jugador">
            <span class="ranking-player">
              <img class="ranking-player-avatar" src="${avatarForName(r.name)}" alt="" />
              ${r.name}
            </span>
          </td>
          <td data-label="Torneos jugados">${r.played}</td>
          <td data-label="Puntos">${formatPoints(r.points)}</td>
          <td data-label="Efectividad">${rate}%</td>
        </tr>
      `;
    })
    .join("");

  rankingPaginationEl.hidden = totalPages <= 1;
  rankingPageLabelEl.textContent = `Página ${rankingPage + 1} de ${totalPages}`;
  rankingPrevBtn.disabled = rankingPage === 0;
  rankingNextBtn.disabled = rankingPage >= totalPages - 1;
}

async function shareAsImage(el, filename, shareText) {
  if (typeof html2canvas === "undefined") {
    alert("No se pudo cargar el generador de capturas. Intenta de nuevo en un momento.");
    return;
  }

  let canvas;
  try {
    canvas = await html2canvas(el, {
      backgroundColor: "#0b0910",
      scale: 2,
      ignoreElements: (node) => node.classList && node.classList.contains("share-btn"),
    });
  } catch (err) {
    console.error("No se pudo generar la captura", err);
    alert("No se pudo generar la captura.");
    return;
  }

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], filename, { type: "image/png" });
    const shareUrl = `${location.origin}/ranking.html`;

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "El Octágono", text: shareText, url: shareUrl });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return; // user cancelled, don't fall through
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: "El Octágono", text: shareText, url: shareUrl });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }

    // Desktop / unsupported browsers: download the image so it can be shared manually.
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }, "image/png");
}

document.getElementById("ranking-share-btn")?.addEventListener("click", () => {
  shareAsImage(rankingTableCard, "ranking-el-octagono.png", "Tabla de posiciones de El Octágono 🐙");
});

fbSubscribeHistory("duelos", (list) => {
  duelosHistory = list;
  renderRanking();
});
fbSubscribeHistory("duos", (list) => {
  duosHistory = list;
  renderRanking();
});
fbSubscribeHistory("pug", (list) => {
  pugHistory = list;
  renderRanking();
});
fbSubscribeRankingReset((ts) => {
  rankingResetAt = ts;
  renderRanking();
});
