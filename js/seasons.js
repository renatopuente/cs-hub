// Quarterly seasons: every 3 months the season rolls over and historial /
// ranking reset to show only the current season's results going forward
// (old records stay in Firebase, untouched, but stop showing publicly —
// this app has no backend cron job, so seasons are computed purely from
// today's date, deterministically, instead of being stored anywhere).
//
// Season 0 starts Feb 1, 2026. Names cycle through curated city + noun
// combos so they never need to be picked by hand again.

const SEASON_ANCHOR = new Date(2026, 1, 1); // Feb 1, 2026 = season index 0

const SEASON_CITIES = [
  "Kyoto", "Monaco", "Manhattan", "Ibiza",
  "Osaka", "Vienna", "Miami", "Marrakech",
  "Tokyo", "Milano", "Aspen", "Dubai",
  "Nara", "Praga", "Toronto", "Singapur",
  "Sapporo", "Florencia", "Vancouver", "Santorini",
];

const SEASON_NOUNS = [
  "Dinastía", "Aurora", "Cénit", "Prestigio",
  "Elegancia", "Eclipse", "Vanguardia", "Corona",
  "Legado", "Imperio", "Nobleza", "Esplendor",
  "Majestad", "Gloria", "Leyenda", "Fulgor",
];

function seasonIndexForDate(date) {
  const months = (date.getFullYear() - SEASON_ANCHOR.getFullYear()) * 12 + (date.getMonth() - SEASON_ANCHOR.getMonth());
  return Math.floor(months / 3);
}

function seasonStartDate(index) {
  return new Date(SEASON_ANCHOR.getFullYear(), SEASON_ANCHOR.getMonth() + index * 3, 1);
}

function seasonName(index) {
  const wrap = (n, len) => ((n % len) + len) % len;
  const city = SEASON_CITIES[wrap(index, SEASON_CITIES.length)];
  const noun = SEASON_NOUNS[wrap(index, SEASON_NOUNS.length)];
  return `${city} ${noun}`;
}

function currentSeasonIndex() {
  return seasonIndexForDate(new Date());
}

// end is the last calendar day included in the season (inclusive).
function getSeasonInfo(index) {
  const start = seasonStartDate(index);
  const nextStart = seasonStartDate(index + 1);
  const end = new Date(nextStart.getFullYear(), nextStart.getMonth(), nextStart.getDate() - 1);
  return { index, name: seasonName(index), start, end };
}
