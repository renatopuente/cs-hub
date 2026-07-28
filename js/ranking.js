const podiumGridEl = document.getElementById("podium-grid");
const rankingBodyEl = document.getElementById("ranking-body");
const rankingEmptyEl = document.getElementById("ranking-empty");
const rankingTableEl = document.getElementById("ranking-table");

const PODIUM_ICONS = ["🥇", "🥈", "🥉"];

function isWinningResult(result) {
  return typeof result === "string" && (result.includes("🏆") || /^#1\b/.test(result));
}

let duelosHistory = [];
let duosHistory = [];
let pugHistory = [];

function buildRanking() {
  const stats = {};
  const seasonIdx = currentSeasonIndex();
  const inSeason = (entry) => entry.finalizedAt && seasonIndexForDate(new Date(entry.finalizedAt)) === seasonIdx;

  [...duelosHistory, ...duosHistory, ...pugHistory].filter(inSeason).forEach((entry) => {
    (entry.teams || []).forEach((t) => {
      const won = isWinningResult(t.result);
      (t.players || []).forEach((rawName) => {
        const name = (rawName || "").trim();
        if (!name) return;
        if (!stats[name]) stats[name] = { name, wins: 0, played: 0 };
        stats[name].played += 1;
        if (won) stats[name].wins += 1;
      });
    });
  });

  return Object.values(stats).sort(
    (a, b) => b.wins - a.wins || b.played - a.played || a.name.localeCompare(b.name)
  );
}

function renderRanking() {
  const ranked = buildRanking();

  if (!ranked.length) {
    podiumGridEl.innerHTML = "";
    rankingBodyEl.innerHTML = "";
    rankingTableEl.hidden = true;
    rankingEmptyEl.hidden = false;
    return;
  }
  rankingTableEl.hidden = false;
  rankingEmptyEl.hidden = true;

  podiumGridEl.innerHTML = ranked
    .slice(0, 3)
    .map((r, i) => {
      const rate = r.played ? Math.round((r.wins / r.played) * 100) : 0;
      return `
        <div class="glass-card fee-card">
          <div class="icon">${PODIUM_ICONS[i]}</div>
          <h2>${r.name}</h2>
          <div class="fee-price">${r.wins} <span class="unit">victorias</span></div>
          <p>${r.played} torneos jugados · ${rate}% efectividad</p>
        </div>
      `;
    })
    .join("");

  rankingBodyEl.innerHTML = ranked
    .map((r, i) => {
      const rate = r.played ? Math.round((r.wins / r.played) * 100) : 0;
      const medal = PODIUM_ICONS[i] || "";
      return `
        <tr>
          <td class="rank" data-label="Posición">${medal ? medal + " " : ""}#${i + 1}</td>
          <td data-label="Jugador">${r.name}</td>
          <td data-label="Torneos jugados">${r.played}</td>
          <td data-label="Victorias">${r.wins}</td>
          <td data-label="Efectividad">${rate}%</td>
        </tr>
      `;
    })
    .join("");
}

fbSubscribeHistory("duelos", (list) => {
  duelosHistory = list;
  renderRanking();
});
fbSubscribeHistory("duos", (list) => {
  duosHistory = list;
  renderRanking();
});
fbSubscribeHistory("pug", (list) => {
  pugHistory = list;
  renderRanking();
});
