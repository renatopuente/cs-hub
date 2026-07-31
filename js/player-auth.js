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

function goAfterLogin(user) {
  const isAdmin = user && isAdminUid(user.uid);
  window.location.href = isAdmin ? "l1o2t3us.html" : "perfil.html";
}

// Si el correo de Google ya tiene cuenta con otro proveedor (típico:
// alguien que ya entró al panel de admin con GitHub usando el mismo
// correo), Firebase bloquea el login por defecto. Se ofrece iniciar
// sesión primero con ese otro proveedor y vincular ambas cuentas bajo
// el mismo UID — mismo mecanismo que auth-gate.js del lado de GitHub.
function handleAccountExists(err) {
  const pendingCredential = err.credential;
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
      const providerLabel = providerId === "github.com" ? "GitHub" : providerId || "otro proveedor";
      const proceed = confirm(
        `Ya existe una cuenta con ${email} usando ${providerLabel}. ¿Iniciar sesión con ${providerLabel} para vincular tu acceso de Google a esa misma cuenta?`
      );
      if (!proceed) return;

      const otherProvider = providerId === "github.com" ? new firebase.auth.GithubAuthProvider() : new firebase.auth.GoogleAuthProvider();
      firebase
        .auth()
        .signInWithPopup(otherProvider)
        .then((signInResult) => signInResult.user.linkWithCredential(pendingCredential))
        .then((linkResult) => goAfterLogin(linkResult.user))
        .catch((err2) => {
          console.error(err2);
          alert("No se pudo vincular la cuenta: " + err2.message);
        });
    });
}

document.querySelectorAll(".player-login-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => goAfterLogin(result.user))
      .catch((err) => {
        if (err.code === "auth/account-exists-with-different-credential") {
          handleAccountExists(err);
          return;
        }
        console.error(err);
        alert("No se pudo iniciar sesión: " + err.message);
      });
  });
});

document.querySelectorAll(".player-logout-btn").forEach((btn) => {
  btn.addEventListener("click", () => firebase.auth().signOut());
});
