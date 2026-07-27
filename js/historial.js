const companeroHistoryEl = document.getElementById("companero-history");
const fourvfourHistoryEl = document.getElementById("fourvfour-history");

const FORMAT_LABELS = {
  bracket: "Llaves (semifinales + 3er puesto)",
  roundrobin: "Todos contra todos",
  series: "Serie",
};

function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("es-EC", { dateStyle: "medium", timeStyle: "short" });
}

function renderHistoryList(container, list) {
  if (!list.length) {
    container.innerHTML = `<div class="glass-card empty-hint">Todavía no hay torneos finalizados.</div>`;
    return;
  }

  container.innerHTML = list
    .map((entry) => {
      const entryFee = entry.entryFee || "Gratuito";
      const rows = (entry.teams || [])
        .map(
          (t) => `
            <tr>
              <td>${t.name}</td>
              <td>${(t.players || []).join(", ")}</td>
              <td>${t.result}</td>
              <td>${entryFee}</td>
            </tr>
          `
        )
        .join("");

      return `
        <div class="glass-card history-card" data-history-id="${entry.id}" style="margin-bottom: 20px; position:relative;">
          <button class="share-btn" data-share-id="${entry.id}" title="Compartir">
            <i class="fa-solid fa-share-nodes"></i>
          </button>
          <h2 class="section-title">${FORMAT_LABELS[entry.format] || entry.format}</h2>
          <p class="section-sub">${formatDate(entry.finalizedAt)}</p>
          <div class="neo-surface table-scroll">
            <table class="standings-table">
              <thead><tr><th>Equipo</th><th>Integrantes</th><th>Resultado</th><th>Torneo</th></tr></thead>
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

fbSubscribeHistory("companero", (list) => renderHistoryList(companeroHistoryEl, list));
fbSubscribeHistory("fourvfour", (list) => renderHistoryList(fourvfourHistoryEl, list));
