// Shared team-building logic: team-name pool, shuffling, and roster assignment.

// Perfil de invitado: para que admin/superadmin llenen cupos vacíos cuando
// no hay suficientes jugadores inscritos (esta página ya está detrás de
// auth-gate.js, así que solo ellos llegan a este formulario). Cualquier
// nombre "Invitado N" queda excluido del ranking — ver buildRanking() en
// js/ranking.js, que filtra por este mismo prefijo.
const GUEST_NAME_PREFIX = "Invitado";
const GUEST_SLOTS = 5;

function guestOptionsHtml() {
  let html = "";
  for (let i = 1; i <= GUEST_SLOTS; i++) {
    html += `<option value="${GUEST_NAME_PREFIX} ${i}">${GUEST_NAME_PREFIX} ${i}</option>`;
  }
  return html;
}

const COLOR_POOL = [
  { name: "Alfa Team", hex: "#ff7a1a" },
  { name: "Bravo Team", hex: "#ff5a5a" },
  { name: "Charlie Team", hex: "#4d9dff" },
  { name: "Delta Team", hex: "#35e0b0" },
  { name: "Echo Team", hex: "#b07bff" },
  { name: "Fox Team", hex: "#4de3e0" },
  { name: "Omega Team", hex: "#8e44ec" },
  { name: "Lambda Team", hex: "#ff4fa3" },
  { name: "Gamma Team", hex: "#ffd23f" },
  { name: "Zeta Team", hex: "#f5a623" },
  { name: "Sigma Team", hex: "#5b7cfa" },
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickColors(count) {
  return shuffle(COLOR_POOL).slice(0, count);
}

function normalizeName(n) {
  return n.trim().toLowerCase();
}

// Business rule: Renato and Narkill always land on the same team, silently.
// Applied automatically after every roster assignment (random or manual), in both modes.
const PINNED_PAIR = ["renato", "narkill"];

function enforcePinnedPair(teams) {
  const findTeamWith = (name) => teams.find((t) => t.players.some((p) => normalizeName(p) === name));
  const teamA = findTeamWith(PINNED_PAIR[0]);
  const teamB = findTeamWith(PINNED_PAIR[1]);
  if (!teamA || !teamB || teamA === teamB) return;

  const narkillIdx = teamB.players.findIndex((p) => normalizeName(p) === PINNED_PAIR[1]);
  const victimIdx = teamA.players.findIndex((p) => normalizeName(p) !== PINNED_PAIR[0]);
  if (victimIdx === -1) return;

  const narkillName = teamB.players[narkillIdx];
  const victimName = teamA.players[victimIdx];
  teamA.players[victimIdx] = narkillName;
  teamB.players[narkillIdx] = victimName;
}

function makeEmptyTeams(numTeams) {
  const colors = pickColors(numTeams);
  const teams = [];
  for (let t = 0; t < numTeams; t++) {
    teams.push({ id: `team-${t + 1}`, name: colors[t].name, color: colors[t].hex, players: [] });
  }
  return teams;
}

// Random assignment: flat player list -> shuffled into even teams.
function buildTeams(playerNames, numTeams, teamSize) {
  const players = shuffle(playerNames.map((p) => p.trim()).filter(Boolean));
  const teams = makeEmptyTeams(numTeams);

  let cursor = 0;
  for (const team of teams) {
    while (team.players.length < teamSize && cursor < players.length) {
      team.players.push(players[cursor]);
      cursor++;
    }
  }

  enforcePinnedPair(teams);
  return teams;
}

// Manual assignment: caller already decided who goes on which team.
function buildTeamsManual(playerGroups) {
  const colors = pickColors(playerGroups.length);
  const teams = playerGroups.map((group, i) => ({
    id: `team-${i + 1}`,
    name: colors[i].name,
    color: colors[i].hex,
    players: group.map((p) => p.trim()).filter(Boolean),
  }));

  enforcePinnedPair(teams);
  return teams;
}
