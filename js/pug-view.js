const MODE = "pug";

const emptyStateEl = document.getElementById("empty-state");
const seriesSection = document.getElementById("series-section");
const teamsListEl = document.getElementById("teams-list");
const seriesScoreEl = document.getElementById("series-score");
const seriesFormatLabelEl = document.getElementById("series-format-label");
const gameLogEl = document.getElementById("game-log");
const championBannerEl = document.getElementById("champion-banner");

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

function render(tournament) {
  if (!tournament) {
    emptyStateEl.hidden = false;
    seriesSection.hidden = true;
    return;
  }
  emptyStateEl.hidden = true;
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

  gameLogEl.innerHTML = (tournament.games || [])
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
}

fbSubscribe(MODE, render);
