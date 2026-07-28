// Shared admin logic for Duelos (1 vs 1) and Duos (2 vs 2): 2, 3, or 4
// teams, format is series / bracket / round-robin depending on team count.
// Each page sets MODE and TEAM_SIZE in a small inline <script> before this
// file loads (see duelos.html / duos.html).

const setupSection = document.getElementById("setup-section");
const resultSection = document.getElementById("result-section");
const teamCountSelect = document.getElementById("team-count");
const formatChoiceField = document.getElementById("format-choice-field");
const formatChoiceSelect = document.getElementById("format-choice");
const assignModeSelect = document.getElementById("assign-mode");
const entryFeeSelect = document.getElementById("entry-fee");
const playerInputsEl = document.getElementById("player-inputs");
const setupForm = document.getElementById("setup-form");
const teamsListEl = document.getElementById("teams-list");
const matchesTitleEl = document.getElementById("matches-title");
const matchesSubEl = document.getElementById("matches-sub");
const matchesViewEl = document.getElementById("matches-view");
const championBannerEl = document.getElementById("champion-banner");
const resetBtn = document.getElementById("reset-btn");
const finalizeBtn = document.getElementById("finalize-btn");

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

function buildRoundRobinMatches(teams) {
  const matches = [];
  let counter = 1;
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({ id: `m${counter}`, a: teams[i].id, b: teams[j].id, winner: "" });
      counter++;
    }
  }
  return matches;
}

function createTournament(teams, numTeams, formatChoice, entryFee) {
  let tournament;

  if (numTeams === 2) {
    tournament = { format: "series", teams, bestOf: 3, winsNeeded: 2, games: [], winner: "" };
  } else if (numTeams === 4 && formatChoice === "bracket") {
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
  } else {
    // numTeams === 3, or numTeams === 4 with "todos contra todos" chosen.
    tournament = { format: "roundrobin", teams, matches: buildRoundRobinMatches(teams) };
  }

  tournament.entryFee = entryFee;
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
    const final = tournament.matches.final;
    const third = tournament.matches.third;

    final.a = s1.winner || "";
    final.b = s2.winner || "";
    third.a = loserOf(s1);
    third.b = loserOf(s2);

    // A corrected semifinal result can invalidate an already-decided final/3rd
    // place if that team is no longer in the matchup — clear it for a re-pick.
    if (final.winner && final.winner !== final.a && final.winner !== final.b) final.winner = "";
    if (third.winner && third.winner !== third.a && third.winner !== third.b) third.winner = "";
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
      ${isWinner ? '<span class="win-star">&#9733;</span>' : ""}
    </div>
  `;
}

function renderBracketMatch(tournament, matchKey, title) {
  const match = tournament.matches[matchKey];
  const teamA = match.a ? teamById(tournament, match.a) : null;
  const teamB = match.b ? teamById(tournament, match.b) : null;
  const decided = !!match.winner;
  const clickable = !!(teamA && teamB); // stays clickable after deciding, to allow corrections

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
  matchesSubEl.textContent = "Haz clic en el equipo ganador de cada partido. Puedes volver a hacer clic para corregir.";

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

/* ---------- Series format (2 teams) ---------- */

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
      return `
        <div class="game-row">
          <span class="game-label">Juego ${g.number}</span>
          <span style="color:${t.color}">${t.name}</span>
          <button class="game-delete-btn" data-remove-game="${g.number}" title="Eliminar / corregir">✕</button>
        </div>
      `;
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

  matchesViewEl.querySelectorAll("[data-remove-game]").forEach((btn) => {
    btn.addEventListener("click", () => removeGame(tournament, parseInt(btn.dataset.removeGame, 10)));
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
  matchesSubEl.textContent = "Haz clic en el equipo ganador de cada enfrentamiento. Puedes volver a hacer clic para corregir.";

  const matchesHtml = tournament.matches
    .map((m) => {
      const teamA = teamById(tournament, m.a);
      const teamB = teamById(tournament, m.b);
      const decided = !!m.winner;
      return `
        <div>
          <div class="match-title">${teamA.name} vs ${teamB.name}</div>
          <div class="match">
            ${renderMatchSlot(teamA, m.id, m.winner === m.a, decided, true)}
            <div class="match-divider"></div>
            ${renderMatchSlot(teamB, m.id, m.winner === m.b, decided, true)}
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
        <td class="rank" data-label="Posición">#${i + 1}</td>
        <td data-label="Equipo" style="color:${r.team.color}">${r.team.name}</td>
        <td data-label="Victorias">${r.wins}</td>
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

/* ---------- Finalize / archive to historial ---------- */

function bracketResultFor(tournament, teamId) {
  const m = tournament.matches;
  if (m.final.winner === teamId) return "🏆 Campeón";
  if (m.third.winner === teamId) return "3er puesto";
  if (m.final.winner && (m.final.a === teamId || m.final.b === teamId)) return "2do puesto";
  if (m.third.winner && (m.third.a === teamId || m.third.b === teamId)) return "4to puesto";
  const inLostSemi = [m.semi1, m.semi2].some(
    (s) => s.winner && (s.a === teamId || s.b === teamId) && s.winner !== teamId
  );
  if (inLostSemi) return "Eliminado en semifinales";
  return "Sin definir";
}

function bracketPlacementRank(tournament, teamId) {
  const m = tournament.matches;
  if (m.final.winner === teamId) return 1;
  if (m.third.winner === teamId) return 3;
  if (m.final.winner && (m.final.a === teamId || m.final.b === teamId)) return 2;
  if (m.third.winner && (m.third.a === teamId || m.third.b === teamId)) return 4;
  return 5;
}

function computeFinalResults(tournament) {
  if (tournament.format === "series") {
    const [teamA, teamB] = tournament.teams;
    const scoreA = tournament.games.filter((g) => g.winner === teamA.id).length;
    const scoreB = tournament.games.filter((g) => g.winner === teamB.id).length;
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

  if (tournament.format === "roundrobin") {
    // computeStandings already ranks by wins descending — winner first.
    const { ranked } = computeStandings(tournament);
    return ranked.map((r, i) => ({ name: r.team.name, players: r.team.players, result: `#${i + 1} (${r.wins} victorias)` }));
  }

  const ordered = [...tournament.teams].sort(
    (a, b) => bracketPlacementRank(tournament, a.id) - bracketPlacementRank(tournament, b.id)
  );
  return ordered.map((t) => ({ name: t.name, players: t.players, result: bracketResultFor(tournament, t.id) }));
}

function finalizeTournament(tournament) {
  const record = {
    finalizedAt: Date.now(),
    format: tournament.format,
    entryFee: tournament.entryFee || "Gratuito",
    teams: computeFinalResults(tournament),
  };
  archiveTournament(MODE, record);
  clearTournament(MODE);
  currentTournament = null;
  resultSection.hidden = true;
  setupSection.hidden = false;
  refreshPlayerInputs();
}

/* ---------- Shared render dispatch ---------- */

let currentTournament = null;

function render(tournament) {
  currentTournament = tournament;
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
  const numTeams = parseInt(teamCountSelect.value, 10);
  formatChoiceField.hidden = numTeams !== 4;
  buildPlayerInputs(numTeams, assignModeSelect.value);
}

teamCountSelect.addEventListener("change", refreshPlayerInputs);
assignModeSelect.addEventListener("change", refreshPlayerInputs);

setupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const numTeams = parseInt(teamCountSelect.value, 10);
  const teams = collectTeams(numTeams, assignModeSelect.value);
  const tournament = createTournament(teams, numTeams, formatChoiceSelect.value, entryFeeSelect.value);
  render(tournament);
});

resetBtn.addEventListener("click", () => {
  clearTournament(MODE);
  resultSection.hidden = true;
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
