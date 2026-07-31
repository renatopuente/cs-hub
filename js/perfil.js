// Perfil de jugador: solo pueden ver/editar su propio Nickname una vez
// logueados con Google. El resto de los datos (foto, nombre de Google) es
// de solo lectura, tal cual viene de la cuenta.

const profileLoginRequiredEl = document.getElementById("profile-login-required");
const profileContentEl = document.getElementById("profile-content");
const profileAvatarEl = document.getElementById("profile-avatar");
const profileGoogleNameEl = document.getElementById("profile-google-name");
const profileNicknameInput = document.getElementById("profile-nickname-input");
const profileSaveBtn = document.getElementById("profile-save-btn");
const profileSavedHintEl = document.getElementById("profile-saved-hint");

let currentUid = null;

firebase.auth().onAuthStateChanged((user) => {
  profileLoginRequiredEl.hidden = !!user;
  profileContentEl.hidden = !user;
  if (!user) {
    currentUid = null;
    return;
  }

  currentUid = user.uid;
  profileAvatarEl.src = user.photoURL || "img/icons/icono_app-192.png";
  profileGoogleNameEl.textContent = user.displayName || user.email || "Jugador";

  loadUserProfile(user.uid).then((profile) => {
    profileNicknameInput.value = profile.nickname || user.displayName || "";
  });
});

profileSaveBtn.addEventListener("click", () => {
  if (!currentUid) return;
  const nickname = profileNicknameInput.value.trim();
  if (!nickname) return;

  saveUserNickname(currentUid, nickname)
    .then(() => {
      profileSavedHintEl.hidden = false;
      setTimeout(() => {
        profileSavedHintEl.hidden = true;
      }, 2500);
    })
    .catch((err) => {
      console.error("No se pudo guardar el nickname", err);
      alert("No se pudo guardar el nickname. Intenta de nuevo.");
    });
});
