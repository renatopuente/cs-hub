// Aviso de conexión en las vistas en vivo (duelos-view, duos-view, pug-view):
// si se corta la conexión con Firebase, los datos en pantalla pueden estar
// viejos, así que se esconde "En vivo" y aparece "Reconectando…" hasta que
// vuelva. Al cargar se da un margen para la primera conexión, para que el
// aviso no parpadee. Va después de js/firebase-sync.js.
(function () {
  const badge = document.getElementById("connection-badge");
  if (!badge || typeof fbSubscribeConnection !== "function") return;

  const GRACE_MS = 4000;
  let everConnected = false;

  const show = (offline) => {
    badge.hidden = !offline;
    document.documentElement.classList.toggle("is-offline", offline);
  };

  // Si en el margen de la carga nunca se conectó, también avisa.
  const grace = setTimeout(() => {
    if (!everConnected) show(true);
  }, GRACE_MS);

  fbSubscribeConnection((connected) => {
    if (connected) {
      everConnected = true;
      clearTimeout(grace);
      show(false);
    } else if (everConnected) {
      show(true);
    }
  });
})();
