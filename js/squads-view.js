// Public (read-only) view for Duos: series, bracket (any power-of-2 team
// count), or round-robin. MODE is set in a small inline <script> in
// duos-view.html before this file loads.

const liveBadgeRowEl = document.getElementById("live-badge-row");
const emptyStateEl = document.getElementById("empty-state");
const countdownScreenEl = document.getElementById("countdown-screen");
const countdownDateEl = document.getElementById("countdown-date");
const countdownClockEl = document.getElementById("countdown-clock");
const countdownTeamsEl = document.getElementById("countdown-teams");
const resultSection = document.getElementById("result-section");
const tournamentFinishedBannerEl = document.getElementById("tournament-finished-banner");
const neoBracketScreenEl = document.getElementById("neo-bracket-screen");
const teamsListEl = document.getElementById("teams-list");
const matchesTitleEl = document.getElementById("matches-title");
const matchesSubEl = document.getElementById("matches-sub");
const matchesViewEl = document.getElementById("matches-view");
const championBannerEl = document.getElementById("champion-banner");
const tournamentMetaEl = document.getElementById("tournament-meta");
const seasonBannerImgEl = document.getElementById("season-banner-img");
const seasonHeadingNameEl = document.getElementById("season-heading-name");

// Estado "por defecto" del banner de temporada (arte propio o texto), tal
// como lo dejó season-heading.js antes de que este archivo cargue — para
// poder volver exactamente a eso cuando no haya torneo.
const defaultSeasonBannerSrc = seasonBannerImgEl ? seasonBannerImgEl.src : "";
const defaultSeasonBannerHidden = seasonBannerImgEl ? seasonBannerImgEl.hidden : true;
const defaultSeasonHeadingHidden = seasonHeadingNameEl ? seasonHeadingNameEl.hidden : true;

// Con un torneo programado o en curso se prioriza el bannerlite genérico
// de temporada (más compacto) por encima del arte especial, para no
// competir visualmente con el countdown/la serie.
function updateSeasonBannerForTournament(hasTournament) {
  if (!seasonBannerImgEl) return;
  if (hasTournament) {
    seasonBannerImgEl.src = "img/banners/bannerlite.webp";
    seasonBannerImgEl.hidden = false;
    if (seasonHeadingNameEl) seasonHeadingNameEl.hidden = true;
  } else {
    seasonBannerImgEl.src = defaultSeasonBannerSrc;
    seasonBannerImgEl.hidden = defaultSeasonBannerHidden;
    if (seasonHeadingNameEl) seasonHeadingNameEl.hidden = defaultSeasonHeadingHidden;
  }
}

const FIVE_MIN_MS = 5 * 60 * 1000;

function teamInitial(team) {
  return (team.name || "?").trim().charAt(0).toUpperCase();
}

function teamById(tournament, id) {
  return tournament.teams.find((t) => t.id === id) || null;
}

function renderTeamChip(team) {
  return `
    <div class="team-chip" style="color: ${team.color}">
      <span class="team-color-dot" style="background:${team.color}"></span>
      <div>
        <div style="font-weight:700;">${team.name}</div>
        <div class="team-players">${team.players.join(" & ")}</div>
      </div>
    </div>
  `;
}

function renderMatchSlot(team, isWinner, isDecided) {
  if (!team) return `<div class="match-slot disabled"><span class="name">Por definir</span></div>`;
  const classes = ["match-slot"];
  if (isDecided) classes.push(isWinner ? "winner" : "loser");
  return `
    <div class="${classes.join(" ")}">
      <span class="name">${team.name}</span>
      ${isWinner ? '<span class="win-star">&#9733;</span>' : ""}
    </div>
  `;
}

// How many rounds "from the end" a round is decides its label — the final
// is always the last round regardless of how many rounds came before it.
function roundLabel(totalRounds, roundIdx) {
  const fromEnd = totalRounds - roundIdx;
  if (fromEnd === 1) return "Final";
  if (fromEnd === 2) return "Semifinales";
  if (fromEnd === 3) return "Cuartos de final";
  return `Ronda ${roundIdx + 1}`;
}

function renderBracketMatch(tournament, roundIdx, matchIdx, title) {
  const match = tournament.matches[roundIdx][matchIdx];
  const teamA = match.a ? teamById(tournament, match.a) : null;
  const teamB = match.b ? teamById(tournament, match.b) : null;
  const decided = !!match.winner;
  return `
    <div class="match-title">${title}</div>
    <div class="match">
      ${renderMatchSlot(teamA, match.winner === match.a, decided)}
      <div class="match-divider"></div>
      ${renderMatchSlot(teamB, match.winner === match.b, decided)}
    </div>
  `;
}

function renderBracket(tournament) {
  matchesTitleEl.textContent = "Llaves";
  matchesSubEl.textContent = "";

  const totalRounds = tournament.matches.length;
  const columnsHtml = tournament.matches
    .map((round, r) => {
      const label = roundLabel(totalRounds, r);
      const matchesHtml = round
        .map((_, i) => renderBracketMatch(tournament, r, i, round.length > 1 ? `${label} ${i + 1}` : label))
        .join("");
      return `
        <div class="bracket-col">
          <div class="bracket-col-label">${label}</div>
          ${matchesHtml}
        </div>
      `;
    })
    .join("");

  matchesViewEl.innerHTML = `<div class="bracket">${columnsHtml}</div>`;

  const finalMatch = tournament.matches[totalRounds - 1][0];
  const champion = finalMatch.winner ? teamById(tournament, finalMatch.winner) : null;

  championBannerEl.innerHTML = champion
    ? `
      <div class="champion-banner">
        <div class="label">Campeón</div>
        <div class="name"><i class="fa-solid fa-trophy"></i> ${champion.name}</div>
        <div class="sub">${champion.players.join(" & ")}</div>
      </div>
    `
    : "";
}

function renderSeries(tournament) {
  matchesTitleEl.textContent = "Marcador de la serie";
  // Firebase RTDB strips empty arrays on write, so a fresh series arrives with no "games" key at all.
  const games = tournament.games || [];
  const winsFor = (teamId) => games.filter((g) => g.winner === teamId).length;
  const [teamA, teamB] = tournament.teams;
  matchesSubEl.textContent = `Mejor de ${tournament.bestOf} · se necesitan ${tournament.winsNeeded} victorias`;

  const logHtml = games
    .map((g) => {
      const t = teamById(tournament, g.winner);
      const label = t ? t.name : "Empate";
      const color = t ? t.color : "var(--text-dim)";
      return `<div class="game-row"><span class="game-label">Juego ${g.number}</span><span style="color:${color}">${label}</span></div>`;
    })
    .join("");

  matchesViewEl.innerHTML = `
    <div class="neo-surface series-score">
      <div class="series-team" style="color:${teamA.color}">
        <div class="score">${winsFor(teamA.id)}</div>
        <div class="name">${teamA.name}</div>
      </div>
      <div class="series-vs">VS</div>
      <div class="series-team" style="color:${teamB.color}">
        <div class="score">${winsFor(teamB.id)}</div>
        <div class="name">${teamB.name}</div>
      </div>
    </div>
    <div class="game-log">${logHtml}</div>
  `;

  const champion = tournament.winner ? teamById(tournament, tournament.winner) : null;
  championBannerEl.innerHTML = champion
    ? `
      <div class="champion-banner">
        <div class="label">Campeón de la serie</div>
        <div class="name"><i class="fa-solid fa-trophy"></i> ${champion.name}</div>
        <div class="sub">${champion.players.join(" & ")}</div>
      </div>
    `
    : "";
}

function renderRoundRobin(tournament) {
  matchesTitleEl.textContent = "Todos contra todos";
  matchesSubEl.textContent = "";

  const matchesHtml = tournament.matches
    .map((m) => {
      const teamA = teamById(tournament, m.a);
      const teamB = teamById(tournament, m.b);
      const decided = !!m.winner;
      return `
        <div>
          <div class="match-title">${teamA.name} vs ${teamB.name}</div>
          <div class="match">
            ${renderMatchSlot(teamA, m.winner === m.a, decided)}
            <div class="match-divider"></div>
            ${renderMatchSlot(teamB, m.winner === m.b, decided)}
          </div>
        </div>
      `;
    })
    .join("");

  const wins = {};
  tournament.teams.forEach((t) => (wins[t.id] = 0));
  tournament.matches.forEach((m) => {
    if (m.winner) wins[m.winner] += 1;
  });
  const ranked = tournament.teams.map((t) => ({ team: t, wins: wins[t.id] })).sort((a, b) => b.wins - a.wins);
  const allDecided = tournament.matches.every((m) => m.winner);

  const standingsRows = ranked
    .map((r, i) => `<tr><td class="rank" data-label="Posición">#${i + 1}</td><td data-label="Equipo" style="color:${r.team.color}">${r.team.name}</td><td data-label="Victorias">${r.wins}</td></tr>`)
    .join("");

  matchesViewEl.innerHTML = `
    <div class="bento-grid" style="margin-bottom: 24px;">${matchesHtml}</div>
    <div class="neo-surface">
      <table class="standings-table">
        <thead><tr><th>Posición</th><th>Equipo</th><th>Victorias</th></tr></thead>
        <tbody>${standingsRows}</tbody>
      </table>
    </div>
  `;

  if (!allDecided) {
    championBannerEl.innerHTML = "";
    return;
  }

  const topWins = ranked[0].wins;
  const leaders = ranked.filter((r) => r.wins === topWins);
  if (leaders.length === 1) {
    const champion = leaders[0].team;
    championBannerEl.innerHTML = `
      <div class="champion-banner">
        <div class="label">Campeón</div>
        <div class="name"><i class="fa-solid fa-trophy"></i> ${champion.name}</div>
        <div class="sub">${champion.players.join(" & ")}</div>
      </div>
    `;
  } else {
    championBannerEl.innerHTML = `
      <div class="champion-banner">
        <div class="label">Empate en el primer puesto</div>
        <div class="name">${leaders.map((l) => l.team.name).join(" · ")}</div>
        <div class="sub">${leaders[0].wins} victorias cada uno</div>
      </div>
    `;
  }
}

/* ---------- Neon screen (llaves/conexiones con inicial + color neón) ---------- */

function neoNodeHtml(team, dim, blink, nodeId) {
  if (!team) {
    return `<div class="neo-node-wrap"><div class="neo-node neo-dim" id="${nodeId}" style="--node-color:#666">?</div></div>`;
  }
  const classes = ["neo-node"];
  if (dim) classes.push("neo-dim");
  if (blink) classes.push("neo-blink");
  return `
    <div class="neo-node-wrap">
      <div class="${classes.join(" ")}" id="${nodeId}" style="--node-color:${team.color}">${teamInitial(team)}</div>
      <div class="neo-node-label">${team.name}</div>
    </div>
  `;
}

function neoIsEliminated(tournament, teamId) {
  return tournament.matches.some((round) => round.some((m) => (m.a === teamId || m.b === teamId) && m.winner && m.winner !== teamId));
}

function renderNeoDuel(tournament) {
  const [teamA, teamB] = tournament.teams;
  const winnerId = tournament.winner;
  neoBracketScreenEl.innerHTML = `
    <div class="neo-bracket-title">Llave</div>
    <div class="neo-duel">
      ${neoNodeHtml(teamA, winnerId && winnerId !== teamA.id, !winnerId, "neo-node-a")}
      <div class="neo-connector"></div>
      ${neoNodeHtml(teamB, winnerId && winnerId !== teamB.id, !winnerId, "neo-node-b")}
    </div>
  `;
}

// Cada equipo llega de un lado contrario de la pantalla y avanza ronda por
// ronda hacia el centro, donde se juega la final. Se arma un lado a la vez
// (izquierdo/derecho) con la mitad de los partidos de cada ronda previa a
// la final; el lado derecho se dibuja en espejo vía CSS (row-reverse).
function neoBracketSideHtml(tournament, side, finalMatch, finalPending) {
  const totalRounds = tournament.matches.length;
  const preRounds = tournament.matches.slice(0, totalRounds - 1);

  const columnsHtml = preRounds
    .map((round, r) => {
      const half = round.length / 2;
      const start = side === "left" ? 0 : half;
      const end = side === "left" ? half : round.length;
      const label = roundLabel(totalRounds, r);

      const duelsHtml = [];
      for (let m = start; m < end; m++) {
        const match = round[m];
        const teamA = match.a ? teamById(tournament, match.a) : null;
        const teamB = match.b ? teamById(tournament, match.b) : null;
        const dimA = teamA && neoIsEliminated(tournament, teamA.id);
        const dimB = teamB && neoIsEliminated(tournament, teamB.id);
        const blinkA = finalPending && teamA && (finalMatch.a === teamA.id || finalMatch.b === teamA.id);
        const blinkB = finalPending && teamB && (finalMatch.a === teamB.id || finalMatch.b === teamB.id);
        duelsHtml.push(`
          <div class="neo-bracket-duel-pair">
            ${neoNodeHtml(teamA, dimA, blinkA, `neo-node-r${r}-m${m}-a`)}
            ${neoNodeHtml(teamB, dimB, blinkB, `neo-node-r${r}-m${m}-b`)}
          </div>
        `);
      }

      return `
        <div class="neo-bracket-col">
          <div class="neo-bracket-round-label">${label}</div>
          <div class="neo-bracket-column">${duelsHtml.join("")}</div>
        </div>
      `;
    })
    .join("");

  return `<div class="neo-bracket-side neo-side-${side}">${columnsHtml}</div>`;
}

function neoFinalColumnHtml(tournament, finalMatch, finalPending) {
  const teamA = finalMatch.a ? teamById(tournament, finalMatch.a) : null;
  const teamB = finalMatch.b ? teamById(tournament, finalMatch.b) : null;
  const dimA = teamA && neoIsEliminated(tournament, teamA.id);
  const dimB = teamB && neoIsEliminated(tournament, teamB.id);
  return `
    <div class="neo-bracket-col">
      <div class="neo-bracket-round-label">Final</div>
      <div class="neo-bracket-final-column">
        ${neoNodeHtml(teamA, dimA, finalPending, "neo-node-final-a")}
        ${neoNodeHtml(teamB, dimB, finalPending, "neo-node-final-b")}
      </div>
    </div>
  `;
}

function neoNodeCenter(canvasRect, nodeId) {
  const el = document.getElementById(nodeId);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2 - canvasRect.left, y: r.top + r.height / 2 - canvasRect.top };
}

// Dibuja los canales/conexiones de la llave con líneas SVG (stroke), midiendo
// la posición real de cada nodo ya renderizado — más confiable que intentar
// alinear todo por CSS puro, y se recalcula en cada resize.
function drawNeoBracketLines(tournament) {
  const canvas = document.getElementById("neo-bracket-canvas");
  const svg = document.getElementById("neo-bracket-lines");
  if (!canvas || !svg) return;

  const canvasRect = canvas.getBoundingClientRect();
  svg.setAttribute("width", canvasRect.width);
  svg.setAttribute("height", canvasRect.height);

  const totalRounds = tournament.matches.length;
  const preRounds = tournament.matches.slice(0, totalRounds - 1);
  const paths = [];

  preRounds.forEach((round, r) => {
    for (let m = 0; m < round.length; m++) {
      const nextRoundIdx = r + 1;
      const nextMatchIdx = Math.floor(m / 2);
      const nextSlot = m % 2 === 0 ? "a" : "b";
      const nextNodeId =
        nextRoundIdx === totalRounds - 1
          ? `neo-node-final-${nextSlot}`
          : `neo-node-r${nextRoundIdx}-m${nextMatchIdx}-${nextSlot}`;

      const a = neoNodeCenter(canvasRect, `neo-node-r${r}-m${m}-a`);
      const b = neoNodeCenter(canvasRect, `neo-node-r${r}-m${m}-b`);
      const next = neoNodeCenter(canvasRect, nextNodeId);
      if (!a || !b || !next) continue;

      paths.push(`M ${a.x},${a.y} H ${next.x} V ${next.y}`);
      paths.push(`M ${b.x},${b.y} H ${next.x} V ${next.y}`);
    }
  });

  svg.innerHTML = paths.map((d) => `<path d="${d}"></path>`).join("");
}

let neoBracketResizeHandler = null;

function renderNeoBracket(tournament) {
  const totalRounds = tournament.matches.length;
  const finalMatch = tournament.matches[totalRounds - 1][0];
  const finalPending = !!(finalMatch.a && finalMatch.b && !finalMatch.winner);

  const leftHtml = neoBracketSideHtml(tournament, "left", finalMatch, finalPending);
  const rightHtml = neoBracketSideHtml(tournament, "right", finalMatch, finalPending);
  const finalHtml = neoFinalColumnHtml(tournament, finalMatch, finalPending);

  neoBracketScreenEl.innerHTML = `
    <div class="neo-bracket-title">Llave del torneo</div>
    <div class="neo-bracket-canvas" id="neo-bracket-canvas">
      ${leftHtml}
      ${finalHtml}
      ${rightHtml}
      <svg class="neo-bracket-lines" id="neo-bracket-lines"></svg>
    </div>
  `;

  drawNeoBracketLines(tournament);

  if (neoBracketResizeHandler) window.removeEventListener("resize", neoBracketResizeHandler);
  neoBracketResizeHandler = () => drawNeoBracketLines(tournament);
  window.addEventListener("resize", neoBracketResizeHandler);
}

function renderNeoRoundRobin(tournament) {
  const wins = {};
  tournament.teams.forEach((t) => (wins[t.id] = 0));
  tournament.matches.forEach((m) => {
    if (m.winner) wins[m.winner] += 1;
  });
  const allDecided = tournament.matches.every((m) => m.winner);
  const maxWins = Math.max(...tournament.teams.map((t) => wins[t.id]));

  const nodesHtml = tournament.teams
    .map((team) => {
      const isLeader = allDecided && wins[team.id] === maxWins;
      const dim = allDecided && !isLeader;
      return neoNodeHtml(team, dim, false, `neo-node-rr-${team.id}`);
    })
    .join("");

  neoBracketScreenEl.innerHTML = `
    <div class="neo-bracket-title">Todos contra todos</div>
    <div class="neo-roundrobin-row">${nodesHtml}</div>
  `;
}

function renderNeoScreen(tournament) {
  if (tournament.format === "series") renderNeoDuel(tournament);
  else if (tournament.format === "bracket") renderNeoBracket(tournament);
  else if (tournament.format === "roundrobin") renderNeoRoundRobin(tournament);
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
    updateSeasonBannerForTournament(false);
    emptyStateEl.hidden = false;
    countdownScreenEl.hidden = true;
    resultSection.hidden = true;
    return;
  }

  // Un torneo agendado puede existir antes de que el admin arme los
  // equipos (solo scheduledAt, sin teams todavía) — el countdown se
  // muestra igual, sin requerir que el torneo ya tenga datos completos.
  const showCountdown = active.scheduledAt && !active.started && !active.finalizedAt;
  if (showCountdown) {
    if (liveBadgeRowEl) liveBadgeRowEl.hidden = false;
    updateSeasonBannerForTournament(true);
    emptyStateEl.hidden = true;
    resultSection.hidden = true;
    countdownScreenEl.hidden = false;
    startCountdown(active);
    return;
  }

  if (!active.teams) {
    if (liveBadgeRowEl) liveBadgeRowEl.hidden = true;
    updateSeasonBannerForTournament(false);
    emptyStateEl.hidden = false;
    countdownScreenEl.hidden = true;
    resultSection.hidden = true;
    return;
  }

  updateSeasonBannerForTournament(true);
  emptyStateEl.hidden = true;
  countdownScreenEl.hidden = true;
  resultSection.hidden = false;
  // "EN VIVO" se muestra mientras haya un torneo programado o en curso —
  // solo se oculta en espera (sin torneo) y una vez finalizado.
  if (liveBadgeRowEl) liveBadgeRowEl.hidden = !!active.finalizedAt;
  tournamentFinishedBannerEl.hidden = !active.finalizedAt;
  if (active.finalizedAt) startFinishedTimer(active);

  // El ID del torneo se oculta en la vista pública por ahora (a pedido) —
  // #tournament-meta queda en el HTML sin usar, listo para reactivar.
  if (tournamentMetaEl) tournamentMetaEl.innerHTML = "";

  teamsListEl.innerHTML = active.teams.map(renderTeamChip).join("");
  renderNeoScreen(active);

  if (active.format === "bracket") renderBracket(active);
  else if (active.format === "series") renderSeries(active);
  else if (active.format === "roundrobin") renderRoundRobin(active);
}

fbSubscribe(MODE, render);
