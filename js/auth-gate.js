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
const linkAccountPromptEl = document.getElementById("link-account-prompt");
const linkAccountTextEl = document.getElementById("link-account-text");
const linkAccountBtn = document.getElementById("link-account-btn");

const bootstrapMode = Object.keys(ADMINS).length === 0;

// Si alguien ya tiene cuenta en el sitio con Google (por ejemplo, como
// jugador) y su GitHub usa el mismo correo, Firebase bloquea el login de
// GitHub por defecto (un email = un solo proveedor, salvo que se
// vinculen). Guardamos la credencial de GitHub pendiente y le pedimos
// entrar primero con el proveedor que ya tiene, para linkear ambas bajo
// el mismo UID.
let pendingCredential = null;

function resetLinkPrompt() {
  pendingCredential = null;
  if (linkAccountPromptEl) linkAccountPromptEl.hidden = true;
}

firebase.auth().onAuthStateChanged((user) => {
  const authorized = !!user && (bootstrapMode || isAdminUid(user.uid));

  loginGateEl.hidden = authorized;
  protectedContentEl.hidden = !authorized;
  if (logoutBtn) logoutBtn.hidden = !user;

  if (user && !authorized) {
    // El UID va en la alerta (no solo en bootstrap) para que, tras
    // vincular una cuenta nueva, se pueda copiar y pasarlo antes de que
    // la sesión se cierre.
    alert(`Esta cuenta no tiene acceso a este panel. Tu UID es ${user.uid} — pásaselo a quien administre ADMINS en js/admin-config.js.`);
    firebase.auth().signOut();
    return;
  }

  if (user) resetLinkPrompt();

  if (user && bootstrapMode && uidHintEl) {
    uidHintEl.hidden = false;
    uidHintEl.textContent = `Bootstrap: tu UID es ${user.uid}. Agrégalo al mapa ADMINS en js/admin-config.js.`;
  }
});

function handleAccountExists(err) {
  pendingCredential = err.credential;
  const email = (err.customData && err.customData.email) || err.email;
  if (!email) {
    alert("No se pudo iniciar sesión: " + err.message);
    return;
  }

  firebase
    .auth()
    .fetchSignInMethodsForEmail(email)
    .then((methods) => {
      const providerId = methods[0] || "";
      const providerLabel = providerId === "google.com" ? "Google" : providerId || "otro proveedor";

      if (!linkAccountPromptEl || !linkAccountBtn || !linkAccountTextEl) {
        alert(`Ya existe una cuenta con ${email} usando ${providerLabel}. Inicia sesión con ese proveedor primero para poder vincular GitHub.`);
        return;
      }

      linkAccountTextEl.textContent = `Ya existe una cuenta con ${email} usando ${providerLabel}. Inicia sesión con ${providerLabel} para vincular tu acceso de GitHub a esa misma cuenta.`;
      linkAccountBtn.textContent = `Continuar con ${providerLabel} para vincular`;
      linkAccountPromptEl.hidden = false;
    });
}

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    resetLinkPrompt();
    const provider = new firebase.auth.GithubAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .catch((err) => {
        if (err.code === "auth/account-exists-with-different-credential") {
          handleAccountExists(err);
          return;
        }
        console.error(err);
        alert("No se pudo iniciar sesión: " + err.message);
      });
  });
}

if (linkAccountBtn) {
  linkAccountBtn.addEventListener("click", () => {
    if (!pendingCredential) return;
    // El único otro proveedor que existe en este sitio es Google
    // (player-auth.js) — GitHub es exclusivo del panel de admin.
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => result.user.linkWithCredential(pendingCredential))
      .then(() => {
        resetLinkPrompt();
      })
      .catch((err) => {
        console.error(err);
        alert("No se pudo vincular la cuenta: " + err.message);
      });
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => firebase.auth().signOut());
}
