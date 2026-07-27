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
      const rows = (entry.teams || [])
        .map(
          (t) => `
            <tr>
              <td>${t.name}</td>
              <td>${(t.players || []).join(", ")}</td>
              <td>${t.result}</td>
            </tr>
          `
        )
        .join("");

      return `
        <div class="glass-card" style="margin-bottom: 20px;">
          <h2 class="section-title">${FORMAT_LABELS[entry.format] || entry.format}</h2>
          <p class="section-sub">${formatDate(entry.finalizedAt)}</p>
          <div class="neo-surface">
            <table class="standings-table">
              <thead><tr><th>Equipo</th><th>Integrantes</th><th>Resultado</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      `;
    })
    .join("");
}

fbSubscribeHistory("companero", (list) => renderHistoryList(companeroHistoryEl, list));
fbSubscribeHistory("fourvfour", (list) => renderHistoryList(fourvfourHistoryEl, list));
