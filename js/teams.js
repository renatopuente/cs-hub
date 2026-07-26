// Shared team-building logic: color names, shuffling, and roster assignment.

const COLOR_POOL = [
  { name: "Alfa Team", hex: "#ff7a1a" },
  { name: "Bravo Team", hex: "#ff5a5a" },
  { name: "Charlie Team", hex: "#4d9dff" },
  { name: "Delta Team", hex: "#35e0b0" },
  { name: "Echo Team", hex: "#b07bff" },
  { name: "Fox Team", hex: "#4de3e0" },
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
// Applied automatically inside every roster shuffle for both game modes.
const PINNED_PAIR = ["renato", "narkill"];

function buildTeams(playerNames, numTeams, teamSize) {
  const players = playerNames.map((p) => p.trim()).filter(Boolean);
  const normalized = players.map(normalizeName);

  const pinnedIndexes = PINNED_PAIR.map((p) => normalized.indexOf(p));
  const hasPinnedPair = pinnedIndexes.every((i) => i !== -1);

  let pinnedPlayers = [];
  let remaining = players;

  if (hasPinnedPair) {
    pinnedPlayers = pinnedIndexes.map((i) => players[i]);
    remaining = players.filter((_, i) => !pinnedIndexes.includes(i));
  }

  const shuffledRemaining = shuffle(remaining);
  const colors = pickColors(numTeams);
  const teams = [];

  for (let t = 0; t < numTeams; t++) {
    teams.push({
      id: `team-${t + 1}`,
      name: colors[t].name,
      color: colors[t].hex,
      players: [],
    });
  }

  // Seat the pinned pair into the first team's slots first (silent, no prompt).
  if (hasPinnedPair) {
    teams[0].players.push(...pinnedPlayers.slice(0, teamSize));
  }

  let cursor = 0;
  for (const team of teams) {
    while (team.players.length < teamSize && cursor < shuffledRemaining.length) {
      team.players.push(shuffledRemaining[cursor]);
      cursor++;
    }
  }

  return teams;
}
