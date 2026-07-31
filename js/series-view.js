// Shared public (read-only) view for any 2-team series (Duelos, Pug). Each
// page sets MODE in a small inline <script> before this file loads.

const liveBadgeRowEl = document.getElementById("live-badge-row");
const emptyStateEl = document.getElementById("empty-state");
const countdownScreenEl = document.getElementById("countdown-screen");
const countdownDateEl = document.getElementById("countdown-date");
const countdownClockEl = document.getElementById("countdown-clock");
const countdownTeamsEl = document.getElementById("countdown-teams");
const seriesSection = document.getElementById("series-section");
const tournamentFinishedBannerEl = document.getElementById("tournament-finished-banner");
const neoBracketScreenEl = document.getElementById("neo-bracket-screen");
const teamsListEl = document.getElementById("teams-list");
const seriesScoreEl = document.getElementById("series-score");
const seriesFormatLabelEl = document.getElementById("series-format-label");
const gameLogEl = document.getElementById("game-log");
const championBannerEl = document.getElementById("champion-banner");
const tournamentMetaEl = document.getElementById("tournament-meta");

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
let countdownTournament = null;

// Solicitudes confirmadas (inscripcion.html + dashboard de admin): se usan
// para ir revelando, jugador por jugador, quién ya confirmó su inscripción
// bajo el nombre de su equipo mientras se muestra el countdown.
let latestSolicitudes = [];
if (typeof fbSubscribeSolicitudes === "function") {
  fbSubscribeSolicitudes((list) => {
    latestSolicitudes = list;
    if (countdownTournament) renderCountdownTeams(countdownTournament);
  });
}

function isPlayerConfirmed(playerName) {
  const norm = (s) => (s || "").trim().toLowerCase();
  return latestSolicitudes.some((s) => s.status === "inscrito" && norm(s.name) === norm(playerName));
}

function countdownTeamHtml(team) {
  const playersHtml = (team.players || [])
    .filter((p) => isPlayerConfirmed(p))
    .map((p) => `<div class="countdown-player">${p}</div>`)
    .join("");
  return `
    <div class="countdown-team">
      <div class="countdown-team-name" style="color:${team.color}">${team.name}</div>
      <div class="countdown-team-players">${playersHtml}</div>
    </div>
  `;
}

function renderCountdownTeams(tournament) {
  if (!tournament.teams) {
    countdownTeamsEl.innerHTML = "";
    return;
  }
  countdownTeamsEl.innerHTML = tournament.teams.map(countdownTeamHtml).join("");
}

function stopCountdown() {
  if (countdownIntervalId) {
    clearInterval(countdownIntervalId);
    countdownIntervalId = null;
  }
  countdownTournament = null;
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

function formatTournamentDate(ts) {
  const d = new Date(ts);
  const dateStr = d.toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" });
  const timeStr = d.toLocaleTimeString("es-EC", { hour: "numeric", minute: "2-digit" });
  return `${dateStr.charAt(0).toUpperCase()}${dateStr.slice(1)} · ${timeStr}`;
}

function startCountdown(tournament) {
  stopCountdown();
  countdownTournament = tournament;
  countdownDateEl.textContent = formatTournamentDate(tournament.scheduledAt);
  renderCountdownTeams(tournament);
  const tick = () => {
    countdownClockEl.textContent = formatCountdown(tournament.scheduledAt - Date.now());
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
    if (liveBadgeRowEl) liveBadgeRowEl.hidden = true;
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
    if (liveBadgeRowEl) liveBadgeRowEl.hidden = true;
    emptyStateEl.hidden = true;
    seriesSection.hidden = true;
    countdownScreenEl.hidden = false;
    startCountdown(active);
    return;
  }

  if (!active.teams) {
    if (liveBadgeRowEl) liveBadgeRowEl.hidden = true;
    emptyStateEl.hidden = false;
    countdownScreenEl.hidden = true;
    seriesSection.hidden = true;
    return;
  }

  emptyStateEl.hidden = true;
  countdownScreenEl.hidden = true;
  seriesSection.hidden = false;
  // "EN VIVO" solo mientras el torneo está realmente en curso — no en
  // espera, no en cuenta regresiva, y no una vez finalizado.
  if (liveBadgeRowEl) liveBadgeRowEl.hidden = !!active.finalizedAt;
  tournamentFinishedBannerEl.hidden = !active.finalizedAt;
  if (active.finalizedAt) startFinishedTimer(active);

  // El ID del torneo se oculta en la vista pública por ahora (a pedido) —
  // #tournament-meta queda en el HTML sin usar, listo para reactivar.
  if (tournamentMetaEl) tournamentMetaEl.innerHTML = "";

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
      const label = t ? t.name : "Empate";
      const color = t ? t.color : "var(--text-dim)";
      return `<div class="game-row"><span class="game-label">Juego ${g.number}</span><span style="color:${color}">${label}</span></div>`;
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
