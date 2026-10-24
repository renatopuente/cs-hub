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

// Mientras se vinculan las cuentas no se evalúa el cambio de sesión: el
// popup de Google entra con una cuenta que recién tiene acceso cuando
// termina de vincularse, y cerrarla antes cortaría la vinculación.
let linking = false;

firebase.auth().onAuthStateChanged((user) => {
  if (!linking) applyAuthState(user);
});

function applyAuthState(user) {
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
}

function handleAccountExists(err) {
  // En Firebase v10 err.credential llega vacío: la credencial de GitHub
  // pendiente se saca del error con el proveedor.
  pendingCredential = firebase.auth.GithubAuthProvider.credentialFromError(err) || err.credential || null;
  const email = (err.customData && err.customData.email) || err.email;
  if (!pendingCredential || !email) {
    alert("No se pudo iniciar sesión: " + err.message);
    return;
  }

  // La cuenta que ya existe es de Google: es el único otro proveedor del
  // sitio (player-auth.js). No se le pregunta a Firebase cuál es porque,
  // con la protección contra la enumeración de correos,
  // fetchSignInMethodsForEmail devuelve una lista vacía.
  if (!linkAccountPromptEl || !linkAccountBtn || !linkAccountTextEl) {
    alert(`Ya existe una cuenta con ${email} usando Google. Inicia sesión con Google primero para poder vincular GitHub.`);
    return;
  }

  linkAccountTextEl.textContent = `Ya existe una cuenta con ${email} usando Google. Inicia sesión con Google para vincular tu acceso de GitHub a esa misma cuenta.`;
  linkAccountBtn.textContent = "Continuar con Google para vincular";
  linkAccountPromptEl.hidden = false;
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
    const credential = pendingCredential;
    // El único otro proveedor que existe en este sitio es Google
    // (player-auth.js) — GitHub es exclusivo del panel de admin.
    const provider = new firebase.auth.GoogleAuthProvider();
    linking = true;
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => result.user.linkWithCredential(credential))
      .then(() => {
        resetLinkPrompt();
      })
      .catch((err) => {
        console.error(err);
        alert("No se pudo vincular la cuenta: " + err.message);
      })
      .finally(() => {
        linking = false;
        applyAuthState(firebase.auth().currentUser);
      });
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => firebase.auth().signOut());
}
