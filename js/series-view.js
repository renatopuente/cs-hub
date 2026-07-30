// Shared public (read-only) view for any 2-team series (Duelos, Pug). Each
// page sets MODE in a small inline <script> before this file loads.

const emptyStateEl = document.getElementById("empty-state");
const countdownScreenEl = document.getElementById("countdown-screen");
const countdownClockEl = document.getElementById("countdown-clock");
const seriesSection = document.getElementById("series-section");
const tournamentFinishedBannerEl = document.getElementById("tournament-finished-banner");
const neoBracketScreenEl = document.getElementById("neo-bracket-screen");
const teamsListEl = document.getElementById("teams-list");
const seriesScoreEl = document.getElementById("series-score");
const seriesFormatLabelEl = document.getElementById("series-format-label");
const gameLogEl = document.getElementById("game-log");
const championBannerEl = document.getElementById("champion-banner");

const FIVE_MIN_MS = 5 * 60 * 1000;

function teamInitial(team) {
  return (team.name || "?").trim().charAt(0).toUpperCase();
}

function teamById(tournament, id) {
  return tournament.teams.find((t) => t.id === id) || null;
}

function winsFor(tournament, teamId) {
  // Firebase RTDB strips empty arrays on write, so a fresh series arrives with no "games" key at all.
  return (tournament.games || []).filter((g) => g.winner === teamId).length;
}

function renderTeamChip(team) {
  return `
    <div class="team-chip" style="color: ${team.color}">
      <span class="team-color-dot" style="background:${team.color}"></span>
      <div>
        <div style="font-weight:700;">${team.name}</div>
        <div class="team-players">${team.players.join(", ")}</div>
      </div>
    </div>
  `;
}

/* ---------- Neon duel screen (Duelos/Pug are always a single 2-team series,
   which is inherently "the final" — both nodes blink until there's a
   winner, since there's no earlier round to have already eliminated anyone). */

function renderNeoDuel(tournament) {
  const [teamA, teamB] = tournament.teams;
  const winnerId = tournament.winner;

  const nodeHtml = (team) => {
    const dim = winnerId && winnerId !== team.id;
    const blink = !winnerId;
    const classes = ["neo-node"];
    if (dim) classes.push("neo-dim");
    if (blink) classes.push("neo-blink");
    return `
      <div class="neo-node-wrap">
        <div class="${classes.join(" ")}" style="--node-color:${team.color}">${teamInitial(team)}</div>
        <div class="neo-node-label">${team.name}</div>
      </div>
    `;
  };

  neoBracketScreenEl.innerHTML = `
    <div class="neo-bracket-title">Llave</div>
    <div class="neo-duel">
      ${nodeHtml(teamA)}
      <div class="neo-connector"></div>
      ${nodeHtml(teamB)}
    </div>
  `;
}

/* ---------- Countdown ---------- */

let countdownIntervalId = null;

function stopCountdown() {
  if (countdownIntervalId) {
    clearInterval(countdownIntervalId);
    countdownIntervalId = null;
  }
}

function formatCountdown(ms) {
  if (ms <= 0) return "¡Arrancamos!";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return days > 0 ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function startCountdown(targetTs) {
  stopCountdown();
  const tick = () => {
    countdownClockEl.textContent = formatCountdown(targetTs - Date.now());
  };
  tick();
  countdownIntervalId = setInterval(tick, 1000);
}

/* ---------- Banner "Torneo finalizado" (notificación warning + timer) ---------- */

let finishedIntervalId = null;

function stopFinishedTimer() {
  if (finishedIntervalId) {
    clearInterval(finishedIntervalId);
    finishedIntervalId = null;
  }
}

function startFinishedTimer(tournament) {
  stopFinishedTimer();
  const deadline = tournament.finalizedAt + FIVE_MIN_MS;
  const tick = () => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      stopFinishedTimer();
      render(tournament);
      return;
    }
    const totalSeconds = Math.ceil(remaining / 1000);
    const pad = (n) => String(n).padStart(2, "0");
    const mm = pad(Math.floor(totalSeconds / 60));
    const ss = pad(totalSeconds % 60);
    tournamentFinishedBannerEl.innerHTML = `
      <i class="fa-solid fa-triangle-exclamation"></i>
      <span>Torneo finalizado · esta pantalla se cierra en <span class="tfb-timer">${mm}:${ss}</span>.
      Puedes ver este y el resto de los torneos finalizados en el <a href="historial.html">historial</a>.</span>
    `;
  };
  tick();
  finishedIntervalId = setInterval(tick, 1000);
}

/* ---------- Main dispatch ---------- */

function render(tournament) {
  stopCountdown();
  stopFinishedTimer();

  const now = Date.now();
  const isStaleFinalized = tournament && tournament.finalizedAt && now - tournament.finalizedAt > FIVE_MIN_MS;
  const active = !tournament || isStaleFinalized ? null : tournament;

  if (!active) {
    emptyStateEl.hidden = false;
    countdownScreenEl.hidden = true;
    seriesSection.hidden = true;
    return;
  }

  // Un torneo agendado puede existir antes de que el admin arme los
  // equipos (solo scheduledAt, sin teams todavía) — el countdown se
  // muestra igual, sin requerir que el torneo ya tenga datos completos.
  const showCountdown = active.scheduledAt && !active.started && !active.finalizedAt;
  if (showCountdown) {
    emptyStateEl.hidden = true;
    seriesSection.hidden = true;
    countdownScreenEl.hidden = false;
    startCountdown(active.scheduledAt);
    return;
  }

  if (!active.teams) {
    emptyStateEl.hidden = false;
    countdownScreenEl.hidden = true;
    seriesSection.hidden = true;
    return;
  }

  emptyStateEl.hidden = true;
  countdownScreenEl.hidden = true;
  seriesSection.hidden = false;
  tournamentFinishedBannerEl.hidden = !active.finalizedAt;
  if (active.finalizedAt) startFinishedTimer(active);

  const [teamA, teamB] = active.teams;
  const scoreA = winsFor(active, teamA.id);
  const scoreB = winsFor(active, teamB.id);

  teamsListEl.innerHTML = active.teams.map(renderTeamChip).join("");
  renderNeoDuel(active);

  seriesFormatLabelEl.textContent = `Mejor de ${active.bestOf} · se necesitan ${active.winsNeeded} victorias`;

  seriesScoreEl.innerHTML = `
    <div class="series-team" style="color:${teamA.color}">
      <div class="score">${scoreA}</div>
      <div class="name">${teamA.name}</div>
    </div>
    <div class="series-vs">VS</div>
    <div class="series-team" style="color:${teamB.color}">
      <div class="score">${scoreB}</div>
      <div class="name">${teamB.name}</div>
    </div>
  `;

  gameLogEl.innerHTML = (active.games || [])
    .map((g) => {
      const t = teamById(active, g.winner);
      return `<div class="game-row"><span class="game-label">Juego ${g.number}</span><span style="color:${t.color}">${t.name}</span></div>`;
    })
    .join("");

  const champion = active.winner ? teamById(active, active.winner) : null;
  championBannerEl.innerHTML = champion
    ? `
      <div class="champion-banner">
        <div class="label">Campeón de la serie</div>
        <div class="name"><i class="fa-solid fa-trophy"></i> ${champion.name}</div>
        <div class="sub">${champion.players.join(", ")}</div>
      </div>
    `
    : "";
}

fbSubscribe(MODE, render);
