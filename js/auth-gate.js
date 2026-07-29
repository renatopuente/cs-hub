// Gates admin pages behind a real Firebase-verified GitHub login.
// Locked to Renato's account — the DB write rule mirrors this UID too
// (see the Firebase Realtime Database rules), so even someone who
// signs in with a different GitHub account can't write tournament data.
const ADMIN_UID = "NlLYYKa6lQXRIk2m2PlpXYkGk1e2";

const loginGateEl = document.getElementById("login-gate");
const protectedContentEl = document.getElementById("protected-content");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const uidHintEl = document.getElementById("uid-hint");

firebase.auth().onAuthStateChanged((user) => {
  const authorized = !!user && (ADMIN_UID === "" || user.uid === ADMIN_UID);

  loginGateEl.hidden = authorized;
  protectedContentEl.hidden = !authorized;
  if (logoutBtn) logoutBtn.hidden = !user;

  if (user && !authorized) {
    alert("Esta cuenta de GitHub no tiene acceso a este panel.");
    firebase.auth().signOut();
    return;
  }

  if (user && ADMIN_UID === "" && uidHintEl) {
    uidHintEl.hidden = false;
    uidHintEl.textContent = `Bootstrap: tu UID es ${user.uid}. Pásaselo a Claude para bloquear el acceso solo a tu cuenta.`;
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
