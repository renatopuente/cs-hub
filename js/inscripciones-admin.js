// Dashboard admin de inscripciones: separa las solicitudes en dos tablas
// (solicitando vs inscritos) según el campo "status" de cada registro.

const solicitandoBodyEl = document.getElementById("solicitando-body");
const solicitandoEmptyEl = document.getElementById("solicitando-empty");
const inscritosBodyEl = document.getElementById("inscritos-body");
const inscritosEmptyEl = document.getElementById("inscritos-empty");

function torneoLabel(item) {
  return `${item.tier || "?"} · ${item.modalidad || "?"}`;
}

function renderRow(item, kind) {
  const actionBtn =
    kind === "solicitando"
      ? `<button class="btn btn-primary btn-sm" data-mark-inscrito="${item.id}"><i class="fa-solid fa-check"></i> Marcar inscrito</button>`
      : "";
  return `
    <tr>
      <td data-label="Nickname">${item.name || "?"}</td>
      <td data-label="Torneo">${torneoLabel(item)}</td>
      <td data-label="Precio">${item.price || "?"}</td>
      <td data-label="" style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
        ${actionBtn}
        <button class="btn btn-danger btn-sm" data-delete="${item.id}" title="Eliminar"><i class="fa-solid fa-xmark"></i></button>
      </td>
    </tr>
  `;
}

function wireRowButtons(container) {
  container.querySelectorAll("[data-mark-inscrito]").forEach((btn) => {
    btn.addEventListener("click", () => markSolicitudInscrito(btn.dataset.markInscrito));
  });
  container.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm("¿Eliminar esta solicitud?")) deleteSolicitud(btn.dataset.delete);
    });
  });
}

function render(list) {
  const solicitando = list.filter((item) => item.status !== "inscrito");
  const inscritos = list.filter((item) => item.status === "inscrito");

  solicitandoBodyEl.innerHTML = solicitando.map((item) => renderRow(item, "solicitando")).join("");
  solicitandoEmptyEl.hidden = solicitando.length > 0;
  wireRowButtons(solicitandoBodyEl);

  inscritosBodyEl.innerHTML = inscritos.map((item) => renderRow(item, "inscritos")).join("");
  inscritosEmptyEl.hidden = inscritos.length > 0;
  wireRowButtons(inscritosBodyEl);
}

fbSubscribeSolicitudes(render);
