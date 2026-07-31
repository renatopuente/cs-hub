const MODE = "duelos";

const setupSection = document.getElementById("setup-section");
const seriesSection = document.getElementById("series-section");
const playerInputsEl = document.getElementById("player-inputs");
const setupForm = document.getElementById("setup-form");
const entryFeeSelect = document.getElementById("entry-fee");
const bestOfSelect = document.getElementById("best-of");
const teamsListEl = document.getElementById("teams-list");
const seriesScoreEl = document.getElementById("series-score");
const seriesFormatLabelEl = document.getElementById("series-format-label");
const gameActionsEl = document.getElementById("game-actions");
const gameLogEl = document.getElementById("game-log");
const championBannerEl = document.getElementById("champion-banner");
const resetBtn = document.getElementById("reset-btn");
const finalizeBtn = document.getElementById("finalize-btn");
const scheduleInput = document.getElementById("schedule-input");
const scheduleSaveBtn = document.getElementById("schedule-save-btn");
const scheduleClearBtn = document.getElementById("schedule-clear-btn");
const startTournamentBtn = document.getElementById("start-tournament-btn");
const tournamentMetaEl = document.getElementById("tournament-meta");

let currentTournament = null;

// ID corto y legible (sin 0/O/1/I para no confundir por WhatsApp) para
// poder identificar un torneo puntual — al jugador y al admin — y saber
// a qué admin corresponde retomarlo si quedó agendado a medias.
function generateTournamentId(prefix) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${code}`;
}

function currentAdminName() {
  const user = firebase.auth().currentUser;
  return (user && adminName(user.uid)) || "Admin";
}

// Los jugadores se eligen de la lista de inscritos (confirmados en el
// dashboard de inscripciones), no se escriben a mano.
let inscritosNicknames = [];
if (typeof fbSubscribeSolicitudes === "function") {
  fbSubscribeSolicitudes((list) => {
    inscritosNicknames = list
      .filter((item) => item.status === "inscrito" && item.name)
      .map((item) => item.name)
      .filter((name, idx, arr) => arr.indexOf(name) === idx)
      .sort((a, b) => a.localeCompare(b));
  });
}

function playerSelectOptionsHtml() {
  return inscritosNicknames.map((n) => `<option value="${n}">${n}</option>`).join("");
}

// Duelos is always exactly 2 players, auto-assigned, best of 3 or 5.
function buildPlayerInputs() {
  playerInputsEl.innerHTML = "";
  playerInputsEl.className = "player-grid";
  for (let i = 1; i <= 2; i++) {
    const wrap = document.createElement("div");
    wrap.className = "field";
    wrap.innerHTML = `
      <label>Jugador ${i}</label>
      <select name="player-${i}" required>
        <option value="" disabled selected>Selecciona un jugador inscrito</option>
        ${playerSelectOptionsHtml()}
      </select>
    `;
    playerInputsEl.appendChild(wrap);
  }
}

function collectTeams() {
  const names = Array.from(playerInputsEl.querySelectorAll("select")).map((s) => s.value);
  return buildTeams(names, 2, 1);
}

function createTournament(teams, bestOf, entryFee) {
  const tournament = {
    tournamentId: generateTournamentId("DUE"),
    createdBy: currentAdminName(),
    teams,
    bestOf,
    winsNeeded: Math.floor(bestOf / 2) + 1,
    games: [],
    winner: "", // "" not null: Firebase RTDB strips null values on write
    entryFee,
  };
  // Si ya había una fecha agendada (armada antes que el roster), se conserva.
  if (currentTournament && currentTournament.scheduledAt) {
    tournament.scheduledAt = currentTournament.scheduledAt;
    tournament.started = currentTournament.started || false;
  }
  saveTournament(MODE, tournament);
  return tournament;
}

function teamById(tournament, id) {
  return tournament.teams.find((t) => t.id === id) || null;
}

function winsFor(tournament, teamId) {
  return tournament.games.filter((g) => g.winner === teamId).length;
}

function recomputeSeriesWinner(tournament) {
  const [teamA, teamB] = tournament.teams;
  if (winsFor(tournament, teamA.id) >= tournament.winsNeeded) tournament.winner = teamA.id;
  else if (winsFor(tournament, teamB.id) >= tournament.winsNeeded) tournament.winner = teamB.id;
  else tournament.winner = "";
}

function recordGame(tournament, teamId) {
  if (tournament.winner) return;
  tournament.games.push({ number: tournament.games.length + 1, winner: teamId });
  recomputeSeriesWinner(tournament);
  saveTournament(MODE, tournament);
  render(tournament);
}

function removeGame(tournament, gameNumber) {
  tournament.games = tournament.games.filter((g) => g.number !== gameNumber);
  tournament.games.forEach((g, i) => (g.number = i + 1));
  recomputeSeriesWinner(tournament);
  saveTournament(MODE, tournament);
  render(tournament);
}

function renderTeamChip(team) {
  return `
    <div class="team-chip" style="color: ${team.color}">
      <span class="team-color-dot" style="background:${team.color}"></span>
      <div style="width:100%">
        <input class="team-name-input" data-team-id="${team.id}" value="${team.name}" />
        <div class="team-players">${team.players.join(", ")}</div>
      </div>
    </div>
  `;
}

function computeFinalResults(tournament) {
  const [teamA, teamB] = tournament.teams;
  const scoreA = winsFor(tournament, teamA.id);
  const scoreB = winsFor(tournament, teamB.id);
  // Winner listed first (if decided), loser after — undecided series keep creation order.
  const ordered = tournament.winner
    ? [...tournament.teams].sort((a, b) => (a.id === tournament.winner ? -1 : b.id === tournament.winner ? 1 : 0))
    : tournament.teams;
  return ordered.map((t) => {
    const own = t.id === teamA.id ? scoreA : scoreB;
    const other = t.id === teamA.id ? scoreB : scoreA;
    let result = `En curso (${own}-${other})`;
    if (tournament.winner) result = t.id === tournament.winner ? `Ganó la serie (${own}-${other})` : `Perdió la serie (${own}-${other})`;
    return { name: t.name, players: t.players, result };
  });
}

function finalizeTournament(tournament) {
  const record = {
    tournamentId: tournament.tournamentId,
    createdBy: tournament.createdBy,
    finalizedAt: Date.now(),
    format: "series",
    entryFee: tournament.entryFee || "Gratuito",
    teams: computeFinalResults(tournament),
  };
  archiveTournament(MODE, record);
  // No se borra el nodo en vivo al instante: se marca finalizado y se
  // mantiene 30 minutos para que la vista pública muestre "Torneo
  // finalizado" con el resultado congelado. El próximo "Crear duelo"
  // sobrescribe este nodo igual, así que no hace falta limpiarlo aquí.
  saveTournament(MODE, { ...tournament, finalizedAt: Date.now() });
  currentTournament = null;
  seriesSection.hidden = true;
  setupSection.hidden = false;
  updateScheduleUI();
  refreshPlayerInputs();
}

function render(tournament) {
  currentTournament = tournament;
  setupSection.hidden = true;
  seriesSection.hidden = false;
  updateScheduleUI();
  startTournamentBtn.hidden = !(tournament.scheduledAt && !tournament.started);

  if (tournamentMetaEl) {
    tournamentMetaEl.innerHTML = tournament.tournamentId
      ? `<i class="fa-solid fa-hashtag"></i> ${tournament.tournamentId} <span class="tournament-meta-sep">·</span> creado por ${tournament.createdBy || "Admin"}`
      : "";
  }

  const [teamA, teamB] = tournament.teams;
  const scoreA = winsFor(tournament, teamA.id);
  const scoreB = winsFor(tournament, teamB.id);

  teamsListEl.innerHTML = tournament.teams.map(renderTeamChip).join("");

  seriesFormatLabelEl.textContent = `Mejor de ${tournament.bestOf} · se necesitan ${tournament.winsNeeded} victorias`;

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

  if (tournament.winner) {
    gameActionsEl.innerHTML = "";
  } else {
    gameActionsEl.innerHTML = `
      <button class="btn btn-ghost" data-win="${teamA.id}">Ganó ${teamA.name}</button>
      <button class="btn btn-ghost" data-win="${teamB.id}">Ganó ${teamB.name}</button>
      <button class="btn btn-ghost" data-win="draw">Empate</button>
    `;
    gameActionsEl.querySelectorAll("[data-win]").forEach((btn) => {
      btn.addEventListener("click", () => recordGame(tournament, btn.dataset.win));
    });
  }

  gameLogEl.innerHTML = tournament.games
    .map((g) => {
      // Un empate no cuenta victoria para nadie (recomputeSeriesWinner lo
      // ignora vía winsFor), así que la serie sigue hasta desempatar.
      const t = teamById(tournament, g.winner);
      const label = t ? t.name : "Empate";
      const color = t ? t.color : "var(--text-dim)";
      return `
        <div class="game-row">
          <span class="game-label">Juego ${g.number}</span>
          <span style="color:${color}">${label}</span>
          <button class="game-delete-btn" data-remove-game="${g.number}" title="Eliminar / corregir"><i class="fa-solid fa-xmark"></i></button>
        </div>
      `;
    })
    .join("");

  gameLogEl.querySelectorAll("[data-remove-game]").forEach((btn) => {
    btn.addEventListener("click", () => removeGame(tournament, parseInt(btn.dataset.removeGame, 10)));
  });

  const champion = tournament.winner ? teamById(tournament, tournament.winner) : null;
  championBannerEl.innerHTML = champion
    ? `
      <div class="champion-banner">
        <div class="label">Campeón de la serie</div>
        <div class="name"><i class="fa-solid fa-trophy"></i> ${champion.name}</div>
        <div class="sub">${champion.players.join(", ")}</div>
      </div>
    `
    : "";

  teamsListEl.querySelectorAll(".team-name-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const team = teamById(tournament, e.target.dataset.teamId);
      team.name = e.target.value;
      saveTournament(MODE, tournament);
      render(tournament);
      e.target.focus();
      e.target.setSelectionRange(e.target.value.length, e.target.value.length);
    });
  });
}

function refreshPlayerInputs() {
  buildPlayerInputs();
}

setupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const bestOf = parseInt(bestOfSelect.value, 10);
  const teams = collectTeams();
  const tournament = createTournament(teams, bestOf, entryFeeSelect.value);
  render(tournament);
});

resetBtn.addEventListener("click", () => {
  clearTournament(MODE);
  currentTournament = null;
  seriesSection.hidden = true;
  setupSection.hidden = false;
  updateScheduleUI();
  refreshPlayerInputs();
});

finalizeBtn.addEventListener("click", () => {
  if (currentTournament && confirm("¿Finalizar este torneo y guardarlo en el historial?")) {
    finalizeTournament(currentTournament);
  }
});

startTournamentBtn.addEventListener("click", () => {
  if (!currentTournament) return;
  currentTournament.started = true;
  saveTournament(MODE, currentTournament);
  render(currentTournament);
});

/* ---------- Agenda (fecha/hora + countdown en la vista pública) ---------- */

function tsToScheduleInput(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function updateScheduleUI() {
  const scheduledAt = currentTournament && currentTournament.scheduledAt;
  scheduleClearBtn.hidden = !scheduledAt;
  scheduleInput.value = scheduledAt ? tsToScheduleInput(scheduledAt) : "";
}

scheduleSaveBtn.addEventListener("click", () => {
  if (!scheduleInput.value) return;
  const ts = new Date(scheduleInput.value).getTime();
  if (Number.isNaN(ts)) return;
  const base = currentTournament || {};
  const updated = { ...base, scheduledAt: ts, started: base.started || false };
  currentTournament = updated;
  saveTournament(MODE, updated);
  updateScheduleUI();
  if (updated.teams) render(updated);
});

scheduleClearBtn.addEventListener("click", () => {
  if (!currentTournament) return;
  const { scheduledAt, started, ...rest } = currentTournament;
  currentTournament = Object.keys(rest).length ? rest : null;
  if (currentTournament) {
    saveTournament(MODE, currentTournament);
  } else {
    clearTournament(MODE);
  }
  updateScheduleUI();
  if (currentTournament && currentTournament.teams) {
    render(currentTournament);
  } else {
    seriesSection.hidden = true;
    setupSection.hidden = false;
    refreshPlayerInputs();
  }
});

(function init() {
  fbLoadOnce(MODE, (existing) => {
    if (existing && existing.finalizedAt) {
      // Ya finalizado: el público lo sigue mostrando un rato (30 min), pero
      // el admin ya sigue de largo hacia un torneo nuevo.
      currentTournament = null;
    } else if (existing) {
      currentTournament = existing;
    } else {
      currentTournament = null;
    }
    updateScheduleUI();
    if (currentTournament && currentTournament.teams) {
      render(currentTournament);
    } else {
      refreshPlayerInputs();
    }
  });
})();
