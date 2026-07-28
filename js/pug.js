const MODE = "pug";

const setupSection = document.getElementById("setup-section");
const seriesSection = document.getElementById("series-section");
const playerInputsEl = document.getElementById("player-inputs");
const setupForm = document.getElementById("setup-form");
const teamASizeSelect = document.getElementById("team-a-size");
const teamBSizeSelect = document.getElementById("team-b-size");
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

// Pug is always manual (uneven squads like 5v3 can't be auto-shuffled evenly)
// and always exactly 2 teams, each independently sized 1-5.
function buildPlayerInputs(sizeA, sizeB) {
  playerInputsEl.innerHTML = "";
  playerInputsEl.className = "manual-groups";

  [sizeA, sizeB].forEach((size, t) => {
    const group = document.createElement("div");
    group.className = "manual-team-group";
    let fieldsHtml = `<h3>Equipo ${t + 1} (${size} jugador${size > 1 ? "es" : ""})</h3>`;
    for (let p = 1; p <= size; p++) {
      fieldsHtml += `
        <div class="field">
          <label>Jugador ${p}</label>
          <input type="text" data-team="${t}" name="team-${t}-player-${p}" required />
        </div>
      `;
    }
    group.innerHTML = fieldsHtml;
    playerInputsEl.appendChild(group);
  });
}

function collectTeams() {
  const groups = [0, 1].map((t) =>
    Array.from(playerInputsEl.querySelectorAll(`input[data-team="${t}"]`)).map((i) => i.value)
  );
  return buildTeamsManual(groups);
}

function createTournament(teams, bestOf, entryFee) {
  const tournament = {
    teams,
    bestOf,
    winsNeeded: Math.floor(bestOf / 2) + 1,
    games: [],
    winner: "", // "" not null: Firebase RTDB strips null values on write
    entryFee,
  };
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
    if (tournament.winner) result = t.id === tournament.winner ? `🏆 Ganó la serie (${own}-${other})` : `Perdió la serie (${own}-${other})`;
    return { name: t.name, players: t.players, result };
  });
}

function finalizeTournament(tournament) {
  const record = {
    finalizedAt: Date.now(),
    format: "series",
    entryFee: tournament.entryFee || "Gratuito",
    teams: computeFinalResults(tournament),
  };
  archiveTournament(MODE, record);
  clearTournament(MODE);
  currentTournament = null;
  seriesSection.hidden = true;
  setupSection.hidden = false;
  refreshPlayerInputs();
}

let currentTournament = null;

function render(tournament) {
  currentTournament = tournament;
  setupSection.hidden = true;
  seriesSection.hidden = false;

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
    `;
    gameActionsEl.querySelectorAll("[data-win]").forEach((btn) => {
      btn.addEventListener("click", () => recordGame(tournament, btn.dataset.win));
    });
  }

  gameLogEl.innerHTML = tournament.games
    .map((g) => {
      const t = teamById(tournament, g.winner);
      return `
        <div class="game-row">
          <span class="game-label">Juego ${g.number}</span>
          <span style="color:${t.color}">${t.name}</span>
          <button class="game-delete-btn" data-remove-game="${g.number}" title="Eliminar / corregir">✕</button>
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
        <div class="name">🏆 ${champion.name}</div>
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
  buildPlayerInputs(parseInt(teamASizeSelect.value, 10), parseInt(teamBSizeSelect.value, 10));
}

teamASizeSelect.addEventListener("change", refreshPlayerInputs);
teamBSizeSelect.addEventListener("change", refreshPlayerInputs);

setupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const bestOf = parseInt(bestOfSelect.value, 10);
  const teams = collectTeams();
  const tournament = createTournament(teams, bestOf, entryFeeSelect.value);
  render(tournament);
});

resetBtn.addEventListener("click", () => {
  clearTournament(MODE);
  seriesSection.hidden = true;
  setupSection.hidden = false;
  refreshPlayerInputs();
});

finalizeBtn.addEventListener("click", () => {
  if (currentTournament && confirm("¿Finalizar este torneo y guardarlo en el historial?")) {
    finalizeTournament(currentTournament);
  }
});

(function init() {
  fbLoadOnce(MODE, (existing) => {
    if (existing) {
      render(existing);
    } else {
      refreshPlayerInputs();
    }
  });
})();
