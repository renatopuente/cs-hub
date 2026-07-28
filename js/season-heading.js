(function () {
  const nameEl = document.getElementById("season-heading-name");
  const datesEl = document.getElementById("season-heading-dates");
  if (!nameEl) return;

  const current = getSeasonInfo(currentSeasonIndex());
  const fmt = (d) => d.toLocaleDateString("es-EC", { day: "numeric", month: "short" });
  nameEl.textContent = current.name;
  datesEl.textContent = `${fmt(current.start)} – ${fmt(current.end)}`;
})();
