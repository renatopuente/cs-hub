const podiumGridEl = document.getElementById("podium-grid");
const podiumSeasonBadgeEl = document.getElementById("podium-season-badge");
const podiumRankingTitleEl = document.getElementById("podium-ranking-title");
const rankingBodyEl = document.getElementById("ranking-body");
const rankingEmptyEl = document.getElementById("ranking-empty");
const rankingTableCard = document.getElementById("ranking-table-card");

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

function makeScrambleTarget(el, text) {
  const chars = text.split("");
  return { el, original: text, chars, nonSpaceIdx: chars.map((_, i) => i).filter((i) => chars[i] !== " "), glitchTimeouts: [] };
}

function clearGlitchTimeouts(target) {
  target.glitchTimeouts.forEach(clearTimeout);
  target.glitchTimeouts = [];
}

// Aunque el texto se lee normal en esta fase, se cuelan 1 o 2 chispazos
// breves (un par de letras al azar por un instante) para darle vida sin
// afectar la legibilidad general.
function scheduleSteadyGlitches(target) {
  if (!target.nonSpaceIdx.length) return;
  const glitchCount = Math.random() < 0.5 ? 1 : 2;
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

function runMasterSteadyPhase() {
  clearInterval(masterTickId);
  scrambleTargets.forEach((t) => {
    t.el.textContent = t.original;
    scheduleSteadyGlitches(t);
  });
  masterPhaseId = setTimeout(runMasterScramblePhase, STEADY_PHASE_MS);
}

function ensureMasterScrambleRunning() {
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

function buildRanking(seasonIdx) {
  const stats = {};
  const inSeason = (entry) =>
    entry.finalizedAt &&
    seasonIndexForDate(new Date(entry.finalizedAt)) === seasonIdx &&
    entry.finalizedAt > rankingResetAt;

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
    rankingEmptyEl.hidden = false;
    return;
  }

  scrambleSeasonBadge(displaySeason.info.name);
  podiumSeasonBadgeEl.hidden = false;

  const statusClass = displaySeason.closed ? "season-status-ended" : "season-status-active";
  const statusLabel = displaySeason.closed ? "Finalizado" : "En curso";

  podiumGridEl.innerHTML = ranked
    .slice(0, 3)
    .map((r, i) => {
      const rate = r.played ? Math.round((r.wins / r.played) * 100) : 0;
      return `
        <div class="glass-card podium-card" data-podium-id="${i}">
          <div class="podium-card-banner"></div>
          <button class="share-btn" data-share-id="${i}" title="Compartir">
            <i class="fa-solid fa-share-nodes"></i>
          </button>
          <div class="icon">${PODIUM_ICONS[i]}</div>
          <span class="podium-rank">#${i + 1}</span>
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
      `;
    })
    .join("");

  podiumGridEl.querySelectorAll("[data-share-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".podium-card");
      shareAsImage(card, "podio-el-octagono.png", "Mi puesto en la tabla de posiciones de El Octágono 🐙");
    });
  });

  const restOfTable = ranked.slice(3, 10);

  if (!restOfTable.length) {
    rankingTableCard.hidden = true;
    rankingEmptyEl.hidden = false;
    return;
  }

  rankingTableCard.hidden = false;
  rankingEmptyEl.hidden = true;

  rankingBodyEl.innerHTML = restOfTable
    .map((r, idx) => {
      const i = idx + 3;
      const rate = r.played ? Math.round((r.wins / r.played) * 100) : 0;
      return `
        <tr>
          <td class="rank" data-label="Posición">#${i + 1}</td>
          <td data-label="Jugador">${r.name}</td>
          <td data-label="Torneos jugados">${r.played}</td>
          <td data-label="Puntos">${formatPoints(r.points)}</td>
          <td data-label="Efectividad">${rate}%</td>
        </tr>
      `;
    })
    .join("");
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
