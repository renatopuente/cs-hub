// Custom banner art per season, keyed by the exact season name (handles
// any spelling quirks in the filename itself, e.g. "manhatan.webp").
// Seasons without art here fall back to a plain large text heading.
const SEASON_BANNERS = {
  "Monaco Emerald": "monaco.webp",
  "Manhattan Amethyst": "manhatan.webp",
};

(function () {
  const nameEl = document.getElementById("season-heading-name");
  const datesEl = document.getElementById("season-heading-dates");
  const bannerEl = document.getElementById("season-banner-img");
  if (!nameEl && !datesEl && !bannerEl) return;

  const current = getSeasonInfo(currentSeasonIndex());
  const fmt = (d) => d.toLocaleDateString("es-EC", { day: "numeric", month: "short" });
  if (datesEl) datesEl.textContent = `${fmt(current.start)} – ${fmt(current.end)}`;

  const bannerFile = SEASON_BANNERS[current.name];
  if (bannerFile && bannerEl) {
    bannerEl.src = `img/${bannerFile}`;
    bannerEl.alt = `Temporada actual: ${current.name}`;
    bannerEl.hidden = false;
  } else if (nameEl) {
    nameEl.textContent = current.name;
    nameEl.hidden = false;
  }
})();
