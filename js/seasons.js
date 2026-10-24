// Quarterly seasons: every 3 months the season rolls over and historial /
// ranking reset to show only the current season's results going forward
// (old records stay in Firebase, untouched, but stop showing publicly —
// this app has no backend cron job, so seasons are computed purely from
// today's date, deterministically, instead of being stored anywhere).
//
// Season 0 starts Feb 1, 2026. Names cycle through curated city + gem
// combos (in Spanish) so they never need to be picked by hand again.
// Names are only for display: records are matched to a season by date.

// Aligned to standard calendar quarters (Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec)
// — any Jan/Apr/Jul/Oct 1st works as the anchor since it repeats every 3
// months regardless of year.
const SEASON_ANCHOR = new Date(2026, 3, 1); // Apr 1, 2026 = season index 0

const SEASON_CITIES = [
  "Kioto", "Mónaco", "Manhattan", "Ibiza",
  "Osaka", "Viena", "Miami", "Marrakech",
  "Tokio", "Milán", "Aspen", "Dubái",
  "Nara", "Praga", "Toronto", "Singapur",
  "Sapporo", "Florencia", "Vancouver", "Santorini",
];

const SEASON_GEMS = [
  "Zafiro", "Esmeralda", "Amatista", "Topacio",
  "Rubí", "Ópalo", "Granate", "Jade",
  "Ónix", "Diamante", "Perla", "Aguamarina",
  "Citrino", "Peridoto", "Selenita", "Turquesa",
];

function seasonIndexForDate(date) {
  const months = (date.getFullYear() - SEASON_ANCHOR.getFullYear()) * 12 + (date.getMonth() - SEASON_ANCHOR.getMonth());
  return Math.floor(months / 3);
}

function seasonStartDate(index) {
  return new Date(SEASON_ANCHOR.getFullYear(), SEASON_ANCHOR.getMonth() + index * 3, 1);
}

function seasonParts(index) {
  const wrap = (n, len) => ((n % len) + len) % len;
  return { city: SEASON_CITIES[wrap(index, SEASON_CITIES.length)], gem: SEASON_GEMS[wrap(index, SEASON_GEMS.length)] };
}

function seasonName(index) {
  const { city, gem } = seasonParts(index);
  return `${city} ${gem}`;
}

function currentSeasonIndex() {
  return seasonIndexForDate(new Date());
}

// end is the last calendar day included in the season (inclusive).
function getSeasonInfo(index) {
  const start = seasonStartDate(index);
  const nextStart = seasonStartDate(index + 1);
  const end = new Date(nextStart.getFullYear(), nextStart.getMonth(), nextStart.getDate() - 1);
  return { index, name: seasonName(index), ...seasonParts(index), start, end };
}
