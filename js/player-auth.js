// Login de jugadores con Google (v2, primer paso: solo identidad — login,
// sesión persistente, mostrar nombre/foto y poder cerrar sesión). Distinto
// del auth-gate.js del panel de admin: cualquier cuenta de Google puede
// entrar acá, no hay UID fijo ni restricción — es la base para lo que
// venga después (perfil, historial propio, etc).

// La lista de admins vive en js/admin-config.js (ADMINS) — si el UID de
// Google coincide con uno de esos UIDs, lo mandamos directo al panel de
// admin en vez del perfil de jugador. Ojo: GitHub (auth-gate.js) y Google
// son proveedores distintos de Firebase Auth, así que el mismo humano
// puede tener un UID de Google distinto al de GitHub — si eso pasa acá,
// hay que agregar también ese UID de Google al mapa ADMINS.

firebase.auth().onAuthStateChanged((user) => {
  document.querySelectorAll(".player-login-btn").forEach((btn) => {
    btn.hidden = !!user;
  });

  document.querySelectorAll(".player-profile").forEach((el) => {
    el.hidden = !user;
    if (!user) return;
    const avatar = el.querySelector(".player-avatar");
    if (avatar) avatar.src = user.photoURL || "img/icons/icono_app-192.png";
  });

  // Si subió una foto propia en su perfil, reemplaza la de Google en el
  // navbar en cuanto se conoce (después del primer paint con la de Google).
  if (user && typeof loadUserProfile === "function") {
    loadUserProfile(user.uid).then((profile) => {
      if (!profile.customPhotoURL) return;
      document.querySelectorAll(".player-profile .player-avatar").forEach((avatar) => {
        avatar.src = profile.customPhotoURL;
      });
    });
  }
});

document.querySelectorAll(".player-login-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        const isAdmin = result.user && isAdminUid(result.user.uid);
        window.location.href = isAdmin ? "l1o2t3us.html" : "perfil.html";
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
