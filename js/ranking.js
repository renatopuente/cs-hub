const podiumGridEl = document.getElementById("podium-grid");
const rankingBodyEl = document.getElementById("ranking-body");
const rankingEmptyEl = document.getElementById("ranking-empty");
const rankingTableEl = document.getElementById("ranking-table");

const PODIUM_ICONS = [
  '<i class="fa-solid fa-trophy icon-gold"></i>',
  '<i class="fa-solid fa-medal icon-silver"></i>',
  '<i class="fa-solid fa-medal icon-bronze"></i>',
];

// Matches both current plain-text results and any legacy record still
// carrying the old 🏆 prefix — no Firebase migration needed.
function isWinningResult(result) {
  return typeof result === "string" && (result.includes("Ganó") || result.includes("Campeón") || /^#1\b/.test(result));
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

  const currentSeasonName = getSeasonInfo(currentSeasonIndex()).name;

  podiumGridEl.innerHTML = ranked
    .slice(0, 3)
    .map((r, i) => {
      const rate = r.played ? Math.round((r.wins / r.played) * 100) : 0;
      return `
        <div class="glass-card podium-card" data-podium-id="${i}">
          <div class="podium-card-banner"></div>
          <button class="share-btn" data-share-id="${i}" title="Compartir">
            <i class="fa-solid fa-share-nodes"></i>
          </button>
          <div class="icon">${PODIUM_ICONS[i]}</div>
          <span class="podium-rank">#${i + 1}</span>
          <h2>${r.name}</h2>
          <p class="section-sub podium-season"><i class="fa-solid fa-calendar"></i> ${currentSeasonName}</p>
          <div class="fee-price">${r.wins} <span class="unit">victorias</span></div>
          <p>${r.played} torneos jugados · ${rate}% efectividad</p>
        </div>
      `;
    })
    .join("");

  podiumGridEl.querySelectorAll("[data-share-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".podium-card");
      sharePodiumCard(card);
    });
  });

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

async function sharePodiumCard(cardEl) {
  if (typeof html2canvas === "undefined") {
    alert("No se pudo cargar el generador de capturas. Intenta de nuevo en un momento.");
    return;
  }

  let canvas;
  try {
    canvas = await html2canvas(cardEl, {
      backgroundColor: "#0b0910",
      scale: 2,
      ignoreElements: (el) => el.classList && el.classList.contains("share-btn"),
    });
  } catch (err) {
    console.error("No se pudo generar la captura", err);
    alert("No se pudo generar la captura de este puesto.");
    return;
  }

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], "ranking-el-octagono.png", { type: "image/png" });
    const shareUrl = `${location.origin}/ranking.html`;
    const shareText = "Mi puesto en la tabla de posiciones de El Octágono 🐙";

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "El Octágono", text: shareText, url: shareUrl });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return; // user cancelled, don't fall through
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: "El Octágono", text: shareText, url: shareUrl });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }

    // Desktop / unsupported browsers: download the image so it can be shared manually.
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ranking-el-octagono.png";
    link.click();
    URL.revokeObjectURL(link.href);
  }, "image/png");
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
