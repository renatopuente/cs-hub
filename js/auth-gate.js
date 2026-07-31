// Gates admin pages behind a real Firebase-verified GitHub login.
// La lista de UIDs autorizados vive en js/admin-config.js (ADMINS) — la
// regla de escritura de la base de datos debe reflejar esa misma lista
// (ver Firebase Realtime Database rules), así que agregar un admin acá
// sin actualizar las reglas del lado del servidor no alcanza para que
// pueda escribir datos de torneos.

const loginGateEl = document.getElementById("login-gate");
const protectedContentEl = document.getElementById("protected-content");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const uidHintEl = document.getElementById("uid-hint");

const bootstrapMode = Object.keys(ADMINS).length === 0;

firebase.auth().onAuthStateChanged((user) => {
  const authorized = !!user && (bootstrapMode || isAdminUid(user.uid));

  loginGateEl.hidden = authorized;
  protectedContentEl.hidden = !authorized;
  if (logoutBtn) logoutBtn.hidden = !user;

  if (user && !authorized) {
    alert("Esta cuenta de GitHub no tiene acceso a este panel.");
    firebase.auth().signOut();
    return;
  }

  if (user && bootstrapMode && uidHintEl) {
    uidHintEl.hidden = false;
    uidHintEl.textContent = `Bootstrap: tu UID es ${user.uid}. Agrégalo al mapa ADMINS en js/admin-config.js.`;
  }
});

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const provider = new firebase.auth.GithubAuthProvider();
    firebase.auth().signInWithPopup(provider).catch((err) => {
      console.error(err);
      alert("No se pudo iniciar sesión: " + err.message);
    });
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => firebase.auth().signOut());
}
