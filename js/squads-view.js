// Public (read-only) view for Duos: series, bracket (any power-of-2 team
// count), or round-robin. MODE is set in a small inline <script> in
// duos-view.html before this file loads.

const emptyStateEl = document.getElementById("empty-state");
const resultSection = document.getElementById("result-section");
const teamsListEl = document.getElementById("teams-list");
const matchesTitleEl = document.getElementById("matches-title");
const matchesSubEl = document.getElementById("matches-sub");
const matchesViewEl = document.getElementById("matches-view");
const championBannerEl = document.getElementById("champion-banner");

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
      return `<div class="game-row"><span class="game-label">Juego ${g.number}</span><span style="color:${t.color}">${t.name}</span></div>`;
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

function render(tournament) {
  if (!tournament) {
    emptyStateEl.hidden = false;
    resultSection.hidden = true;
    return;
  }
  emptyStateEl.hidden = true;
  resultSection.hidden = false;

  teamsListEl.innerHTML = tournament.teams.map(renderTeamChip).join("");

  if (tournament.format === "bracket") renderBracket(tournament);
  else if (tournament.format === "series") renderSeries(tournament);
  else if (tournament.format === "roundrobin") renderRoundRobin(tournament);
}

fbSubscribe(MODE, render);
