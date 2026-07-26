const MODE = "companero";
const TEAM_SIZE = 2;

fbInitAdmin();

const setupSection = document.getElementById("setup-section");
const resultSection = document.getElementById("result-section");
const teamCountSelect = document.getElementById("team-count");
const assignModeSelect = document.getElementById("assign-mode");
const playerInputsEl = document.getElementById("player-inputs");
const setupForm = document.getElementById("setup-form");
const teamsListEl = document.getElementById("teams-list");
const matchesTitleEl = document.getElementById("matches-title");
const matchesSubEl = document.getElementById("matches-sub");
const matchesViewEl = document.getElementById("matches-view");
const championBannerEl = document.getElementById("champion-banner");
const resetBtn = document.getElementById("reset-btn");

function buildPlayerInputs(numTeams, assignMode) {
  playerInputsEl.innerHTML = "";

  if (assignMode === "manual") {
    playerInputsEl.className = "manual-groups";
    for (let t = 0; t < numTeams; t++) {
      const group = document.createElement("div");
      group.className = "manual-team-group";
      let fieldsHtml = `<h3>Equipo ${t + 1}</h3>`;
      for (let p = 1; p <= TEAM_SIZE; p++) {
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
    for (let i = 1; i <= numTeams * TEAM_SIZE; i++) {
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

function collectTeams(numTeams, assignMode) {
  if (assignMode === "manual") {
    const groups = [];
    for (let t = 0; t < numTeams; t++) {
      groups.push(
        Array.from(playerInputsEl.querySelectorAll(`input[data-team="${t}"]`)).map((i) => i.value)
      );
    }
    return buildTeamsManual(groups);
  }
  const names = Array.from(playerInputsEl.querySelectorAll("input")).map((i) => i.value);
  return buildTeams(names, numTeams, TEAM_SIZE);
}

function createTournament(teams, numTeams) {
  let tournament;

  if (numTeams === 2) {
    tournament = { format: "series", teams, bestOf: 3, winsNeeded: 2, games: [], winner: "" };
  } else if (numTeams === 3) {
    tournament = {
      format: "roundrobin",
      teams,
      matches: [
        { id: "m1", a: teams[0].id, b: teams[1].id, winner: "" },
        { id: "m2", a: teams[0].id, b: teams[2].id, winner: "" },
        { id: "m3", a: teams[1].id, b: teams[2].id, winner: "" },
      ],
    };
  } else {
    tournament = {
      format: "bracket",
      teams,
      // Empty strings (not null) for "not decided yet" — Firebase Realtime Database
      // silently strips null/empty-array values, which would delete these whole
      // nested match objects and crash the public view on a fresh tournament.
      matches: {
        semi1: { a: teams[0].id, b: teams[1].id, winner: "" },
        semi2: { a: teams[2].id, b: teams[3].id, winner: "" },
        final: { a: "", b: "", winner: "" },
        third: { a: "", b: "", winner: "" },
      },
    };
  }

  saveTournament(MODE, tournament);
  return tournament;
}

function teamById(tournament, id) {
  return tournament.teams.find((t) => t.id === id) || null;
}

function renderTeamChip(team) {
  return `
    <div class="team-chip" style="color: ${team.color}">
      <span class="team-color-dot" style="background:${team.color}"></span>
      <div style="width:100%">
        <input class="team-name-input" data-team-id="${team.id}" value="${team.name}" />
        <div class="team-players">${team.players.join(" & ")}</div>
      </div>
    </div>
  `;
}

/* ---------- Bracket format (4 teams) ---------- */

function loserOf(match) {
  if (!match.winner) return "";
  return match.a === match.winner ? match.b : match.a;
}

function setBracketWinner(tournament, matchKey, teamId) {
  const match = tournament.matches[matchKey];
  match.winner = teamId;

  if (matchKey === "semi1" || matchKey === "semi2") {
    const s1 = tournament.matches.semi1;
    const s2 = tournament.matches.semi2;
    if (s1.winner) tournament.matches.final.a = s1.winner;
    if (s2.winner) tournament.matches.final.b = s2.winner;
    if (s1.winner) tournament.matches.third.a = loserOf(s1);
    if (s2.winner) tournament.matches.third.b = loserOf(s2);
  }

  saveTournament(MODE, tournament);
  render(tournament);
}

function renderMatchSlot(team, matchKey, isWinner, isDecided, clickable) {
  if (!team) {
    return `<div class="match-slot disabled"><span class="name">Por definir</span></div>`;
  }
  const classes = ["match-slot"];
  if (isDecided) classes.push(isWinner ? "winner" : "loser");
  if (!clickable) classes.push("disabled");
  return `
    <div class="${classes.join(" ")}" data-match="${matchKey}" data-team="${team.id}">
      <span class="name">${team.name}</span>
      ${isWinner ? '<span class="crown">&#9819;</span>' : ""}
    </div>
  `;
}

function renderBracketMatch(tournament, matchKey, title) {
  const match = tournament.matches[matchKey];
  const teamA = match.a ? teamById(tournament, match.a) : null;
  const teamB = match.b ? teamById(tournament, match.b) : null;
  const decided = !!match.winner;
  const clickable = !decided && teamA && teamB;

  return `
    <div class="match-title">${title}</div>
    <div class="match">
      ${renderMatchSlot(teamA, matchKey, match.winner === match.a, decided, clickable)}
      <div class="match-divider"></div>
      ${renderMatchSlot(teamB, matchKey, match.winner === match.b, decided, clickable)}
    </div>
  `;
}

function renderBracket(tournament) {
  matchesTitleEl.textContent = "Llaves";
  matchesSubEl.textContent = "Haz clic en el equipo ganador de cada partido.";

  matchesViewEl.innerHTML = `
    <div class="bracket">
      <div class="bracket-col">
        <div class="bracket-col-label">Semifinales</div>
        ${renderBracketMatch(tournament, "semi1", "Semifinal 1")}
        ${renderBracketMatch(tournament, "semi2", "Semifinal 2")}
      </div>
      <div class="bracket-col">
        <div class="bracket-col-label">Gran Final</div>
        ${renderBracketMatch(tournament, "final", "Final")}
      </div>
      <div class="bracket-col">
        <div class="bracket-col-label">3er Puesto</div>
        ${renderBracketMatch(tournament, "third", "Definición")}
      </div>
    </div>
  `;

  matchesViewEl.querySelectorAll(".match-slot[data-match]").forEach((slot) => {
    slot.addEventListener("click", () => {
      if (slot.classList.contains("disabled")) return;
      setBracketWinner(tournament, slot.dataset.match, slot.dataset.team);
    });
  });

  const champion = tournament.matches.final.winner ? teamById(tournament, tournament.matches.final.winner) : null;
  const third = tournament.matches.third.winner ? teamById(tournament, tournament.matches.third.winner) : null;

  championBannerEl.innerHTML = champion
    ? `
      <div class="champion-banner">
        <div class="label">Campeón</div>
        <div class="name">🏆 ${champion.name}</div>
        <div class="sub">${champion.players.join(" & ")}${third ? ` · 3er puesto: ${third.name}` : ""}</div>
      </div>
    `
    : "";
}

/* ---------- Series format (2 teams, mejor de 3) ---------- */

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

function renderSeries(tournament) {
  matchesTitleEl.textContent = "Marcador de la serie";
  matchesSubEl.textContent = `Mejor de ${tournament.bestOf} · se necesitan ${tournament.winsNeeded} victorias`;

  const [teamA, teamB] = tournament.teams;
  const scoreA = winsFor(tournament, teamA.id);
  const scoreB = winsFor(tournament, teamB.id);

  const actionsHtml = tournament.winner
    ? ""
    : `
      <div class="actions-row" style="justify-content:center;">
        <button class="btn btn-ghost" data-win="${teamA.id}">Ganó ${teamA.name}</button>
        <button class="btn btn-ghost" data-win="${teamB.id}">Ganó ${teamB.name}</button>
      </div>
    `;

  const logHtml = tournament.games
    .map((g) => {
      const t = teamById(tournament, g.winner);
      return `<div class="game-row"><span class="game-label">Juego ${g.number}</span><span style="color:${t.color}">${t.name}</span></div>`;
    })
    .join("");

  matchesViewEl.innerHTML = `
    <div class="neo-surface series-score">
      <div class="series-team" style="color:${teamA.color}">
        <div class="score">${scoreA}</div>
        <div class="name">${teamA.name}</div>
      </div>
      <div class="series-vs">VS</div>
      <div class="series-team" style="color:${teamB.color}">
        <div class="score">${scoreB}</div>
        <div class="name">${teamB.name}</div>
      </div>
    </div>
    ${actionsHtml}
    <div class="game-log">${logHtml}</div>
  `;

  matchesViewEl.querySelectorAll("[data-win]").forEach((btn) => {
    btn.addEventListener("click", () => recordGame(tournament, btn.dataset.win));
  });

  const champion = tournament.winner ? teamById(tournament, tournament.winner) : null;
  championBannerEl.innerHTML = champion
    ? `
      <div class="champion-banner">
        <div class="label">Campeón de la serie</div>
        <div class="name">🏆 ${champion.name}</div>
        <div class="sub">${champion.players.join(" & ")}</div>
      </div>
    `
    : "";
}

/* ---------- Round robin format (3 teams) ---------- */

function setRoundRobinWinner(tournament, matchId, teamId) {
  const match = tournament.matches.find((m) => m.id === matchId);
  match.winner = teamId;
  saveTournament(MODE, tournament);
  render(tournament);
}

function computeStandings(tournament) {
  const wins = {};
  tournament.teams.forEach((t) => (wins[t.id] = 0));
  tournament.matches.forEach((m) => {
    if (m.winner) wins[m.winner] += 1;
  });
  const ranked = tournament.teams
    .map((t) => ({ team: t, wins: wins[t.id] }))
    .sort((a, b) => b.wins - a.wins);
  const allDecided = tournament.matches.every((m) => m.winner);
  const topWins = ranked[0].wins;
  const leaders = ranked.filter((r) => r.wins === topWins);
  return { ranked, allDecided, leaders };
}

function renderRoundRobin(tournament) {
  matchesTitleEl.textContent = "Todos contra todos";
  matchesSubEl.textContent = "Haz clic en el equipo ganador de cada enfrentamiento.";

  const matchesHtml = tournament.matches
    .map((m) => {
      const teamA = teamById(tournament, m.a);
      const teamB = teamById(tournament, m.b);
      const decided = !!m.winner;
      return `
        <div>
          <div class="match-title">${teamA.name} vs ${teamB.name}</div>
          <div class="match">
            ${renderMatchSlot(teamA, m.id, m.winner === m.a, decided, !decided)}
            <div class="match-divider"></div>
            ${renderMatchSlot(teamB, m.id, m.winner === m.b, decided, !decided)}
          </div>
        </div>
      `;
    })
    .join("");

  const { ranked, allDecided } = computeStandings(tournament);
  const standingsRows = ranked
    .map(
      (r, i) => `
      <tr>
        <td class="rank">#${i + 1}</td>
        <td style="color:${r.team.color}">${r.team.name}</td>
        <td>${r.wins}</td>
      </tr>
    `
    )
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

  matchesViewEl.querySelectorAll(".match-slot[data-match]").forEach((slot) => {
    slot.addEventListener("click", () => {
      if (slot.classList.contains("disabled")) return;
      setRoundRobinWinner(tournament, slot.dataset.match, slot.dataset.team);
    });
  });

  if (!allDecided) {
    championBannerEl.innerHTML = "";
    return;
  }

  const { leaders } = computeStandings(tournament);
  if (leaders.length === 1) {
    const champion = leaders[0].team;
    championBannerEl.innerHTML = `
      <div class="champion-banner">
        <div class="label">Campeón</div>
        <div class="name">🏆 ${champion.name}</div>
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

/* ---------- Shared render dispatch ---------- */

function render(tournament) {
  setupSection.hidden = true;
  resultSection.hidden = false;

  teamsListEl.innerHTML = tournament.teams.map(renderTeamChip).join("");

  if (tournament.format === "bracket") renderBracket(tournament);
  else if (tournament.format === "series") renderSeries(tournament);
  else if (tournament.format === "roundrobin") renderRoundRobin(tournament);

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

/* ---------- Setup wiring ---------- */

function refreshPlayerInputs() {
  buildPlayerInputs(parseInt(teamCountSelect.value, 10), assignModeSelect.value);
}

teamCountSelect.addEventListener("change", refreshPlayerInputs);
assignModeSelect.addEventListener("change", refreshPlayerInputs);

setupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const numTeams = parseInt(teamCountSelect.value, 10);
  const teams = collectTeams(numTeams, assignModeSelect.value);
  const tournament = createTournament(teams, numTeams);
  render(tournament);
});

resetBtn.addEventListener("click", () => {
  clearTournament(MODE);
  resultSection.hidden = true;
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
