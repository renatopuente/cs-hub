// Thin localStorage wrapper for tournament state, one slot per mode.

const STORAGE_KEYS = {
  duelos: "cshub_duelos_v1",
  duos: "cshub_duos_v1",
  pug: "cshub_pug_v1",
};

function loadTournament(mode) {
  const raw = localStorage.getItem(STORAGE_KEYS[mode]);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveTournament(mode, data) {
  localStorage.setItem(STORAGE_KEYS[mode], JSON.stringify(data));
  if (typeof pushTournamentToFirebase === "function") pushTournamentToFirebase(mode, data);
}

function clearTournament(mode) {
  localStorage.removeItem(STORAGE_KEYS[mode]);
  if (typeof clearTournamentFromFirebase === "function") clearTournamentFromFirebase(mode);
}
