const MODE = "fourvfour";
const NUM_TEAMS = 2;

fbInitAdmin();

const setupSection = document.getElementById("setup-section");
const seriesSection = document.getElementById("series-section");
const playerInputsEl = document.getElementById("player-inputs");
const setupForm = document.getElementById("setup-form");
const teamSizeSelect = document.getElementById("team-size");
const assignModeSelect = document.getElementById("assign-mode");
const bestOfSelect = document.getElementById("best-of");
const teamsListEl = document.getElementById("teams-list");
const seriesScoreEl = document.getElementById("series-score");
const seriesFormatLabelEl = document.getElementById("series-format-label");
const gameActionsEl = document.getElementById("game-actions");
const gameLogEl = document.getElementById("game-log");
const championBannerEl = document.getElementById("champion-banner");
const resetBtn = document.getElementById("reset-btn");

function buildPlayerInputs(teamSize, assignMode) {
  playerInputsEl.innerHTML = "";

  if (assignMode === "manual") {
    playerInputsEl.className = "manual-groups";
    for (let t = 0; t < NUM_TEAMS; t++) {
      const group = document.createElement("div");
      group.className = "manual-team-group";
      let fieldsHtml = `<h3>Equipo ${t + 1}</h3>`;
      for (let p = 1; p <= teamSize; p++) {
        fieldsHtml += `
          <div class="field">
            <label>Jugador ${p}</label>
            <input type="text" data-team="${t}" name="team-${t}-player-${p}" required />
          </div>
        `;
      }
      group.innerHTML = fieldsHtml;
      playerInputsEl.appendChild(group);
    }
  } else {
    playerInputsEl.className = "player-grid";
    for (let i = 1; i <= NUM_TEAMS * teamSize; i++) {
      const wrap = document.createElement("div");
      wrap.className = "field";
      wrap.innerHTML = `
        <label>Jugador ${i}</label>
        <input type="text" name="player-${i}" required />
      `;
      playerInputsEl.appendChild(wrap);
    }
  }
}

function collectTeams(teamSize, assignMode) {
  if (assignMode === "manual") {
    const groups = [];
    for (let t = 0; t < NUM_TEAMS; t++) {
      groups.push(
        Array.from(playerInputsEl.querySelectorAll(`input[data-team="${t}"]`)).map((i) => i.value)
      );
    }
    return buildTeamsManual(groups);
  }
  const names = Array.from(playerInputsEl.querySelectorAll("input")).map((i) => i.value);
  return buildTeams(names, NUM_TEAMS, teamSize);
}

function createTournament(teams, bestOf) {
  const tournament = {
    teams,
    bestOf,
    winsNeeded: Math.floor(bestOf / 2) + 1,
    games: [],
    winner: "", // "" not null: Firebase RTDB strips null values on write
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

function recordGame(tournament, teamId) {
  if (tournament.winner) return;
  tournament.games.push({ number: tournament.games.length + 1, winner: teamId });

  const [teamA, teamB] = tournament.teams;
  if (winsFor(tournament, teamA.id) >= tournament.winsNeeded) tournament.winner = teamA.id;
  if (winsFor(tournament, teamB.id) >= tournament.winsNeeded) tournament.winner = teamB.id;

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

function render(tournament) {
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
      return `<div class="game-row"><span class="game-label">Juego ${g.number}</span><span style="color:${t.color}">${t.name}</span></div>`;
    })
    .join("");

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
  buildPlayerInputs(parseInt(teamSizeSelect.value, 10), assignModeSelect.value);
}

teamSizeSelect.addEventListener("change", refreshPlayerInputs);
assignModeSelect.addEventListener("change", refreshPlayerInputs);

setupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const teamSize = parseInt(teamSizeSelect.value, 10);
  const bestOf = parseInt(bestOfSelect.value, 10);
  const teams = collectTeams(teamSize, assignModeSelect.value);
  const tournament = createTournament(teams, bestOf);
  render(tournament);
});

resetBtn.addEventListener("click", () => {
  clearTournament(MODE);
  seriesSection.hidden = true;
  setupSection.hidden = false;
  refreshPlayerInputs();
});

(function init() {
  const existing = loadTournament(MODE);
  if (existing) {
    render(existing);
  } else {
    refreshPlayerInputs();
  }
})();
