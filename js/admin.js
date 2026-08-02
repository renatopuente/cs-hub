// Reiniciar marcadores es una acción destructiva y global (afecta el
// ranking de todos, no un torneo puntual) — reservada al superadmin.
firebase.auth().onAuthStateChanged((user) => {
  const section = document.getElementById("reset-scores-section");
  if (section) section.hidden = !(user && isSuperAdminUid(user.uid));
});

document.getElementById("reset-scores-btn")?.addEventListener("click", () => {
  const confirmed = confirm(
    "¿Reiniciar los marcadores? El ranking y la efectividad de todos los jugadores vuelven a cero desde ahora mismo. El historial de torneos NO se borra. Esta acción no se puede deshacer."
  );
  if (!confirmed) return;

  resetRankingScores()
    .then(() => alert("Marcadores reiniciados."))
    .catch((err) => {
      console.error("No se pudo reiniciar el ranking", err);
      alert("No se pudo reiniciar el ranking. Intenta de nuevo.");
    });
});
