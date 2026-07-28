const duelosHistoryEl = document.getElementById("duelos-history");
const duosHistoryEl = document.getElementById("duos-history");
const pugHistoryEl = document.getElementById("pug-history");

const FORMAT_LABELS = {
  bracket: "Llaves (semifinales + 3er puesto)",
  roundrobin: "Todos contra todos",
  series: "Serie",
};

const FORMAT_ICONS = {
  bracket: "fa-solid fa-sitemap",
  roundrobin: "fa-solid fa-people-group",
  series: "fa-solid fa-trophy",
};

function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("es-EC", { dateStyle: "medium", timeStyle: "short" });
}

function isWinningResult(result) {
  return typeof result === "string" && (result.includes("🏆") || /^#1\b/.test(result));
}

// Delete button only ever renders for Renato's own signed-in session (e.g.
// left over from visiting admin.html earlier in the same browser) — this
// page itself requires no login. The DB rule enforces this UID regardless.
const ADMIN_UID = "NlLYYKa6lQXRIk2m2PlpXYkGk1e2";
let isAdmin = false;
let lastDuelosList = [];
let lastDuosList = [];
let lastPugList = [];

firebase.auth().onAuthStateChanged((user) => {
  isAdmin = !!user && user.uid === ADMIN_UID;
  renderHistoryList(duelosHistoryEl, lastDuelosList, "duelos");
  renderHistoryList(duosHistoryEl, lastDuosList, "duos");
  renderHistoryList(pugHistoryEl, lastPugList, "pug");
});

function renderHistoryList(container, list, mode) {
  if (!list.length) {
    container.innerHTML = `<div class="glass-card empty-hint">Todavía no hay torneos finalizados.</div>`;
    return;
  }

  container.innerHTML = list
    .map((entry) => {
      const entryFee = entry.entryFee || "Gratuito";
      const rowParts = [];
      (entry.teams || []).forEach((t, i) => {
        if (i > 0) {
          rowParts.push(`<tr class="vs-row"><td colspan="3"><span class="vs-badge">VS</span></td></tr>`);
        }
        const winnerClass = isWinningResult(t.result) ? " winner-row" : "";
        rowParts.push(`
          <tr class="${winnerClass.trim()}">
            <td data-label="Equipo">${t.name}</td>
            <td data-label="Integrantes">${(t.players || []).join(", ")}</td>
            <td data-label="Resultado">${t.result}</td>
          </tr>
        `);
      });
      const rows = rowParts.join("");

      const deleteBtnHtml = isAdmin
        ? `<button class="share-btn delete-btn" data-delete-id="${entry.id}" title="Eliminar del historial"><i class="fa-solid fa-trash"></i></button>`
        : "";

      return `
        <div class="glass-card history-card" data-history-id="${entry.id}" style="margin-bottom: 20px; position:relative;">
          <div class="history-card-banner"></div>
          ${deleteBtnHtml}
          <button class="share-btn" data-share-id="${entry.id}" title="Compartir">
            <i class="fa-solid fa-share-nodes"></i>
          </button>
          <h2 class="section-title"><i class="${FORMAT_ICONS[entry.format] || "fa-solid fa-gamepad"}"></i> ${FORMAT_LABELS[entry.format] || entry.format}</h2>
          <p class="section-sub">
            <i class="fa-regular fa-calendar"></i> ${formatDate(entry.finalizedAt)}
            <span class="fee-chip"><i class="fa-solid fa-ticket"></i> ${entryFee}</span>
          </p>
          <div class="neo-surface table-scroll">
            <table class="standings-table history-table">
              <thead>
                <tr>
                  <th><i class="fa-solid fa-shield-halved"></i> Equipo</th>
                  <th><i class="fa-solid fa-user-group"></i> Integrantes</th>
                  <th><i class="fa-solid fa-medal"></i> Resultado</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      `;
    })
    .join("");

  container.querySelectorAll("[data-share-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".history-card");
      shareHistoryCard(card);
    });
  });

  container.querySelectorAll("[data-delete-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm("¿Eliminar este torneo del historial? Esta acción no se puede deshacer.")) {
        deleteHistoryEntry(mode, btn.dataset.deleteId);
      }
    });
  });
}

async function shareHistoryCard(cardEl) {
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
    alert("No se pudo generar la captura de este torneo.");
    return;
  }

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], "torneo-el-octagono.png", { type: "image/png" });
    const shareUrl = `${location.origin}/historial.html`;
    const shareText = "Resultado de mi torneo en El Octágono 🐙";

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
    link.download = "torneo-el-octagono.png";
    link.click();
    URL.revokeObjectURL(link.href);
  }, "image/png");
}

fbSubscribeHistory("duelos", (list) => {
  lastDuelosList = list;
  renderHistoryList(duelosHistoryEl, list, "duelos");
});
fbSubscribeHistory("duos", (list) => {
  lastDuosList = list;
  renderHistoryList(duosHistoryEl, list, "duos");
});
fbSubscribeHistory("pug", (list) => {
  lastPugList = list;
  renderHistoryList(pugHistoryEl, list, "pug");
});
