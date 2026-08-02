// Home: chip de estado en la esquina de cada mode-card (Duelos/Duos/Pug),
// leyendo en vivo tournaments/{mode}. Solo una etiqueta a la vez — "en
// curso" siempre se revisa antes que "programado", así que tiene prioridad
// si alguna vez hubiera más de un torneo por modalidad.

const MODE_STATUS_FIVE_MIN_MS = 5 * 60 * 1000;

function updateModeStatusChip(mode, tournament) {
  const el = document.getElementById(`mode-status-${mode}`);
  if (!el) return;

  const now = Date.now();
  const isStaleFinalized = tournament && tournament.finalizedAt && now - tournament.finalizedAt > MODE_STATUS_FIVE_MIN_MS;
  const active = !tournament || isStaleFinalized || tournament.finalizedAt ? null : tournament;

  if (!active) {
    el.hidden = true;
    return;
  }

  const isLive = active.teams && (!active.scheduledAt || active.started);
  const isScheduled = active.scheduledAt && !active.started;

  if (isLive) {
    el.hidden = false;
    el.className = "mode-card-status-chip status-live";
    el.textContent = "1 en curso";
  } else if (isScheduled) {
    el.hidden = false;
    el.className = "mode-card-status-chip status-scheduled";
    el.textContent = "1 programado";
  } else {
    el.hidden = true;
  }
}

["duelos", "duos", "pug"].forEach((mode) => {
  if (typeof fbSubscribe === "function") {
    fbSubscribe(mode, (tournament) => updateModeStatusChip(mode, tournament));
  }
});
