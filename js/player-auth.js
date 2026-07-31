// Login de jugadores con Google (v2, primer paso: solo identidad — login,
// sesión persistente, mostrar nombre/foto y poder cerrar sesión). Distinto
// del auth-gate.js del panel de admin: cualquier cuenta de Google puede
// entrar acá, no hay UID fijo ni restricción — es la base para lo que
// venga después (perfil, historial propio, etc).

firebase.auth().onAuthStateChanged((user) => {
  document.querySelectorAll(".player-login-btn").forEach((btn) => {
    btn.hidden = !!user;
  });

  document.querySelectorAll(".player-profile").forEach((el) => {
    el.hidden = !user;
    if (!user) return;
    const avatar = el.querySelector(".player-avatar");
    const name = el.querySelector(".player-name");
    if (avatar) avatar.src = user.photoURL || "img/icons/icono_app-192.png";
    if (name) name.textContent = user.displayName || user.email || "Jugador";
  });
});

document.querySelectorAll(".player-login-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(() => {
        window.location.href = "perfil.html";
      })
      .catch((err) => {
        console.error(err);
        alert("No se pudo iniciar sesión: " + err.message);
      });
  });
});

document.querySelectorAll(".player-logout-btn").forEach((btn) => {
  btn.addEventListener("click", () => firebase.auth().signOut());
});
