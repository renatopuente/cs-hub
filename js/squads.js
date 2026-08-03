// Admin logic for Duos (equipos de 2 jugadores): 2 to 8 teams. 2 teams is
// always a straight series; odd counts are always round-robin; even counts
// (4/6/8) let the admin choose round-robin or a classic bracket — bracket
// is only offered for 4 and 8 since those are clean powers of 2 (no byes).
// The page sets MODE and TEAM_SIZE in a small inline <script> before this
// file loads (see duos.html).

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
  const realOptions = inscritosNicknames.map((n) => `<option value="${n}">${n}</option>`).join("");
  return `${realOptions}<optgroup label="Invitado (no rankea)">${guestOptionsHtml()}</optgroup>`;
}

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
            <select data-team="${t}" name="team-${t}-player-${p}" required>
              <option value="" disabled selected>Selecciona un jugador inscrito</option>
              ${playerSelectOptionsHtml()}
            </select>
            <input type="text" class="guest-tag-input" placeholder="Nombre del invitado (opcional)" maxlength="30" hidden />
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
        <select name="player-${i}" required>
          <option value="" disabled selected>Selecciona un jugador inscrito</option>
          ${playerSelectOptionsHtml()}
        </select>
        <input type="text" class="guest-tag-input" placeholder="Nombre del invitado (opcional)" maxlength="30" hidden />
      `;
      playerInputsEl.appendChild(wrap);
    }
  }
  bindGuestTagToggles(playerInputsEl);
}

function collectTeams(numTeams, assignMode) {
  if (assignMode === "manual") {
    const groups = [];
    for (let t = 0; t < numTeams; t++) {
      groups.push(
        Array.from(playerInputsEl.querySelectorAll(`select[data-team="${t}"]`)).map(resolvePlayerName)
      );
    }
    return buildTeamsManual(groups);
  }
  const names = Array.from(playerInputsEl.querySelectorAll("select")).map(resolvePlayerName);
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

function isPowerOfTwo(n) {
  return n >= 2 && (n & (n - 1)) === 0;
}

// Rounds is an array of arrays of matches: rounds[0] is the first round,
// rounds[rounds.length - 1] is the final (always exactly 1 match). Empty
// strings (not null) for "not decided yet" — Firebase Realtime Database
// silently strips null/empty-array values, which would delete these whole
// nested match objects and crash the public view on a fresh tournament.
function buildBracketRounds(teams) {
  const rounds = [];
  const firstRound = [];
  for (let i = 0; i < teams.length; i += 2) {
    firstRound.push({ a: teams[i].id, b: teams[i + 1].id, winner: "" });
  }
  rounds.push(firstRound);

  while (rounds[rounds.length - 1].length > 1) {
    const prevCount = rounds[rounds.length - 1].length;
    const next = [];
    for (let i = 0; i < prevCount / 2; i++) next.push({ a: "", b: "", winner: "" });
    rounds.push(next);
  }
  return rounds;
}

function createTournament(teams, numTeams, formatChoice, entryFee) {
  let tournament;

  if (numTeams === 2) {
    tournament = { format: "series", teams, bestOf: 3, winsNeeded: 2, games: [], winner: "" };
  } else if (isPowerOfTwo(numTeams) && formatChoice === "bracket") {
    tournament = { format: "bracket", teams, matches: buildBracketRounds(teams) };
  } else {
    // Odd counts (3/5/7), or even counts (4/6/8) with "todos contra todos" chosen.
    tournament = { format: "roundrobin", teams, matches: buildRoundRobinMatches(teams) };
  }

  tournament.tournamentId = generateTournamentId("DUO");
  tournament.createdBy = currentAdminName();
  tournament.entryFee = entryFee;
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

/* ---------- Bracket format (any power-of-2 team count: 2, 4, 8) ---------- */

// How many rounds "from the end" a round is decides its label — the final
// is always the last round regardless of how many rounds came before it.
function roundLabel(totalRounds, roundIdx) {
  const fromEnd = totalRounds - roundIdx;
  if (fromEnd === 1) return "Final";
  if (fromEnd === 2) return "Semifinales";
  if (fromEnd === 3) return "Cuartos de final";
  return `Ronda ${roundIdx + 1}`;
}

function setBracketWinner(tournament, roundIdx, matchIdx, teamId) {
  tournament.matches[roundIdx][matchIdx].winner = teamId;

  // Propagate winners forward through every later round. A corrected result
  // can invalidate an already-decided later match if a team no longer
  // belongs in that matchup — clear it for a re-pick, cascading forward.
  for (let r = roundIdx; r < tournament.matches.length - 1; r++) {
    const round = tournament.matches[r];
    const nextRound = tournament.matches[r + 1];
    for (let i = 0; i < round.length; i++) {
      const nextMatch = nextRound[Math.floor(i / 2)];
      const slot = i % 2 === 0 ? "a" : "b";
      const newVal = round[i].winner || "";
      if (nextMatch[slot] !== newVal) {
        nextMatch[slot] = newVal;
        if (nextMatch.winner && nextMatch.winner !== nextMatch.a && nextMatch.winner !== nextMatch.b) {
          nextMatch.winner = "";
        }
      }
    }
  }

  saveTournament(MODE, tournament);
  render(tournament);
}

function renderMatchSlot(team, dataAttrs, isWinner, isDecided, clickable) {
  if (!team) {
    return `<div class="match-slot disabled"><span class="name">Por definir</span></div>`;
  }
  const classes = ["match-slot"];
  if (isDecided) classes.push(isWinner ? "winner" : "loser");
  if (!clickable) classes.push("disabled");
  return `
    <div class="${classes.join(" ")}" ${dataAttrs} data-team="${team.id}">
      <span class="name">${team.name}</span>
      ${isWinner ? '<span class="win-star">&#9733;</span>' : ""}
    </div>
  `;
}

function renderBracketMatch(tournament, roundIdx, matchIdx, title) {
  const match = tournament.matches[roundIdx][matchIdx];
  const teamA = match.a ? teamById(tournament, match.a) : null;
  const teamB = match.b ? teamById(tournament, match.b) : null;
  const decided = !!match.winner;
  const clickable = !!(teamA && teamB); // stays clickable after deciding, to allow corrections
  const dataAttrs = `data-round="${roundIdx}" data-match="${matchIdx}"`;

  return `
    <div class="match-title">${title}</div>
    <div class="match">
      ${renderMatchSlot(teamA, dataAttrs, match.winner === match.a, decided, clickable)}
      <div class="match-divider"></div>
      ${renderMatchSlot(teamB, dataAttrs, match.winner === match.b, decided, clickable)}
    </div>
  `;
}

function renderBracket(tournament) {
  matchesTitleEl.textContent = "Llaves";
  matchesSubEl.textContent = "Haz clic en el equipo ganador de cada partido. Puedes volver a hacer clic para corregir.";

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

  matchesViewEl.querySelectorAll(".match-slot[data-round]").forEach((slot) => {
    slot.addEventListener("click", () => {
      if (slot.classList.contains("disabled")) return;
      setBracketWinner(tournament, parseInt(slot.dataset.round, 10), parseInt(slot.dataset.match, 10), slot.dataset.team);
    });
  });

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

/* ---------- Series format (2 teams) ---------- */

// Firebase RTDB borra los arrays vacíos al guardar, así que un torneo
// recién cargado (tras recargar la página) puede llegar sin la clave
// "games" del todo — no solo con un array vacío.
function winsFor(tournament, teamId) {
  return (tournament.games || []).filter((g) => g.winner === teamId).length;
}

function recomputeSeriesWinner(tournament) {
  const [teamA, teamB] = tournament.teams;
  if (winsFor(tournament, teamA.id) >= tournament.winsNeeded) tournament.winner = teamA.id;
  else if (winsFor(tournament, teamB.id) >= tournament.winsNeeded) tournament.winner = teamB.id;
  else tournament.winner = "";
}

function recordGame(tournament, teamId) {
  if (tournament.winner) return;
  tournament.games = tournament.games || [];
  tournament.games.push({ number: tournament.games.length + 1, winner: teamId });
  recomputeSeriesWinner(tournament);
  saveTournament(MODE, tournament);
  render(tournament);
}

function removeGame(tournament, gameNumber) {
  tournament.games = (tournament.games || []).filter((g) => g.number !== gameNumber);
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
        <button class="btn btn-ghost" data-win="draw">Empate</button>
      </div>
    `;

  const logHtml = (tournament.games || [])
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
        <div class="name"><i class="fa-solid fa-trophy"></i> ${champion.name}</div>
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
      const dataAttrs = `data-match-id="${m.id}"`;
      return `
        <div>
          <div class="match-title">${teamA.name} vs ${teamB.name}</div>
          <div class="match">
            ${renderMatchSlot(teamA, dataAttrs, m.winner === m.a, decided, true)}
            <div class="match-divider"></div>
            ${renderMatchSlot(teamB, dataAttrs, m.winner === m.b, decided, true)}
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

  matchesViewEl.querySelectorAll(".match-slot[data-match-id]").forEach((slot) => {
    slot.addEventListener("click", () => {
      if (slot.classList.contains("disabled")) return;
      setRoundRobinWinner(tournament, slot.dataset.matchId, slot.dataset.team);
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

/* ---------- Finalize / archive to historial ---------- */

// No 3rd-place decider at any bracket size — semifinal (or earlier) losers
// just share "eliminado en <ronda>", same as everyone else who didn't reach
// the final.
function bracketResultFor(tournament, teamId) {
  const rounds = tournament.matches;
  const totalRounds = rounds.length;
  const finalMatch = rounds[totalRounds - 1][0];
  if (finalMatch.winner === teamId) return "Campeón";
  if (finalMatch.winner && (finalMatch.a === teamId || finalMatch.b === teamId)) return "2do puesto";
  for (let r = totalRounds - 2; r >= 0; r--) {
    const match = rounds[r].find((mtch) => mtch.a === teamId || mtch.b === teamId);
    if (match && match.winner && match.winner !== teamId) {
      return `Eliminado en ${roundLabel(totalRounds, r).toLowerCase()}`;
    }
  }
  return "Sin definir";
}

function bracketPlacementRank(tournament, teamId) {
  const rounds = tournament.matches;
  const totalRounds = rounds.length;
  const finalMatch = rounds[totalRounds - 1][0];
  if (finalMatch.winner === teamId) return 1;
  if (finalMatch.winner && (finalMatch.a === teamId || finalMatch.b === teamId)) return 2;
  for (let r = totalRounds - 2; r >= 0; r--) {
    const match = rounds[r].find((mtch) => mtch.a === teamId || mtch.b === teamId);
    if (match && match.winner && match.winner !== teamId) {
      return 100 - r; // eliminated in a later round ranks better (lower number)
    }
  }
  return 999;
}

function computeFinalResults(tournament) {
  if (tournament.format === "series") {
    const [teamA, teamB] = tournament.teams;
    const scoreA = (tournament.games || []).filter((g) => g.winner === teamA.id).length;
    const scoreB = (tournament.games || []).filter((g) => g.winner === teamB.id).length;
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
    tournamentId: tournament.tournamentId,
    createdBy: tournament.createdBy,
    finalizedAt: Date.now(),
    format: tournament.format,
    entryFee: tournament.entryFee || "Gratuito",
    teams: computeFinalResults(tournament),
  };
  archiveTournament(MODE, record);
  // No se borra el nodo en vivo al instante: se marca finalizado y se
  // mantiene 30 minutos para que la vista pública muestre "Torneo
  // finalizado" con el resultado congelado. El próximo "Crear torneo"
  // sobrescribe este nodo igual, así que no hace falta limpiarlo aquí.
  saveTournament(MODE, { ...tournament, finalizedAt: Date.now() });
  currentTournament = null;
  resultSection.hidden = true;
  setupSection.hidden = false;
  updateScheduleUI();
  refreshPlayerInputs();
}

/* ---------- Shared render dispatch ---------- */

function render(tournament) {
  currentTournament = tournament;
  setupSection.hidden = true;
  resultSection.hidden = false;
  updateScheduleUI();
  startTournamentBtn.hidden = !(tournament.scheduledAt && !tournament.started);

  if (tournamentMetaEl) {
    tournamentMetaEl.innerHTML = tournament.tournamentId
      ? `<i class="fa-solid fa-hashtag"></i> ${tournament.tournamentId} <span class="tournament-meta-sep">·</span> creado por ${tournament.createdBy || "Admin"}`
      : "";
  }

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
  const showFormatChoice = numTeams > 2 && numTeams % 2 === 0;
  formatChoiceField.hidden = !showFormatChoice;

  if (showFormatChoice) {
    formatChoiceSelect.innerHTML = isPowerOfTwo(numTeams)
      ? `<option value="bracket" selected>Llaves clásicas</option><option value="roundrobin">Todos contra todos</option>`
      : `<option value="roundrobin" selected>Todos contra todos</option>`;
  }

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
  currentTournament = null;
  resultSection.hidden = true;
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
    resultSection.hidden = true;
    setupSection.hidden = false;
    refreshPlayerInputs();
  }
});

/* ---------- Torneos armados entre jugadores (Comunidad → Fase 4) ---------- */
// Los lobbies de Duos siempre son de 2 equipos, así que se arman con el
// mismo branch "series" que ya usa createTournament — igual que un Duos
// 1v1 creado a mano, la serie queda fija en mejor de 3 sin importar lo
// que haya elegido el jugador al crear el lobby.

const playerLobbiesSection = document.getElementById("player-lobbies-section");
const playerLobbiesListEl = document.getElementById("player-lobbies-list");

function renderPlayerLobbies(list) {
  if (!playerLobbiesSection) return;
  const requested = (list || []).filter((l) => l.status === "requested");

  if (!requested.length) {
    playerLobbiesSection.hidden = true;
    playerLobbiesListEl.innerHTML = "";
    return;
  }

  playerLobbiesSection.hidden = false;
  playerLobbiesListEl.innerHTML = requested
    .map(
      (lobby) => `
      <div class="glass-card" style="margin-bottom: 12px;">
        <p style="margin:0 0 8px; font-weight:700;">Mejor de 3 · creado por ${lobby.creatorNickname || "Jugador"}</p>
        <p class="section-sub" style="margin:0 0 12px;">${lobby.teams.map((t) => t.players.map((p) => p.nickname).join(" & ")).join(" vs ")}</p>
        <button type="button" class="btn btn-primary btn-sm" data-start-lobby="${lobby.id}">
          <i class="fa-solid fa-play"></i> Iniciar este torneo
        </button>
      </div>
    `
    )
    .join("");

  playerLobbiesListEl.querySelectorAll("[data-start-lobby]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lobby = requested.find((l) => l.id === btn.dataset.startLobby);
      if (!lobby) return;
      if (currentTournament && currentTournament.teams && !currentTournament.finalizedAt) {
        alert("Ya tienes un torneo en curso. Finalízalo antes de iniciar este.");
        return;
      }
      const teams = lobby.teams.map((t) => ({ id: t.id, name: t.name, color: t.color, players: t.players.map((p) => p.nickname) }));
      const tournament = createTournament(teams, 2, "series", "Gratuito");
      fbUpdateLobbyStatus(MODE, lobby.id, "converted");
      render(tournament);
    });
  });
}

if (typeof fbSubscribeLobbies === "function") {
  fbSubscribeLobbies(MODE, renderPlayerLobbies);
}

(function init() {
  fbLoadOnce(MODE, (existing) => {
    if (existing && existing.finalizedAt) {
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
