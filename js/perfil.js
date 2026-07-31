// Perfil de jugador: solo pueden ver/editar su propio Nickname una vez
// logueados con Google. El resto de los datos (foto, nombre de Google) es
// de solo lectura. Una vez guardado por primera vez, el Nickname queda
// bloqueado por 2 temporadas antes de poder cambiarlo de nuevo.

const NICKNAME_LOCK_SEASONS = 2;

const profileLoginRequiredEl = document.getElementById("profile-login-required");
const profileContentEl = document.getElementById("profile-content");
const profileAvatarEl = document.getElementById("profile-avatar");
const profileGoogleNameEl = document.getElementById("profile-google-name");
const profileNicknameInput = document.getElementById("profile-nickname-input");
const profileSaveBtn = document.getElementById("profile-save-btn");
const profileSavedHintEl = document.getElementById("profile-saved-hint");
const profileLockedHintEl = document.getElementById("profile-locked-hint");
const profileLockedTextEl = document.getElementById("profile-locked-text");
const profileLogoutBtn = document.getElementById("profile-logout-btn");

let currentUid = null;

function applyLockState(profile) {
  const updatedAt = profile.updatedAt;
  if (!updatedAt) {
    // Todavía no ha guardado un nickname nunca: libre de escribir.
    profileNicknameInput.readOnly = false;
    profileSaveBtn.hidden = false;
    profileLockedHintEl.hidden = true;
    return;
  }

  const updatedSeasonIdx = seasonIndexForDate(new Date(updatedAt));
  const nowSeasonIdx = currentSeasonIndex();
  const unlockSeasonIdx = updatedSeasonIdx + NICKNAME_LOCK_SEASONS;
  const locked = nowSeasonIdx < unlockSeasonIdx;

  profileNicknameInput.readOnly = locked;
  profileSaveBtn.hidden = locked;
  profileLockedHintEl.hidden = !locked;
  if (locked) {
    profileLockedTextEl.textContent = `Ya cambiaste tu Nickname. Podrás volver a cambiarlo a partir de la temporada ${getSeasonInfo(unlockSeasonIdx).name}.`;
  }
}

firebase.auth().onAuthStateChanged((user) => {
  profileLoginRequiredEl.hidden = !!user;
  profileContentEl.hidden = !user;
  profileLogoutBtn.hidden = !user;
  if (!user) {
    currentUid = null;
    return;
  }

  currentUid = user.uid;
  profileAvatarEl.src = user.photoURL || "img/icons/icono_app-192.png";
  profileGoogleNameEl.textContent = user.displayName || user.email || "Jugador";

  loadUserProfile(user.uid).then((profile) => {
    profileNicknameInput.value = profile.nickname || user.displayName || "";
    applyLockState(profile);
  });
});

profileSaveBtn.addEventListener("click", () => {
  if (!currentUid) return;
  const nickname = profileNicknameInput.value.trim();
  if (!nickname) return;

  saveUserNickname(currentUid, nickname)
    .then(() => {
      profileSavedHintEl.hidden = false;
      applyLockState({ updatedAt: Date.now() });
      setTimeout(() => {
        profileSavedHintEl.hidden = true;
      }, 4000);
    })
    .catch((err) => {
      console.error("No se pudo guardar el nickname", err);
      alert("No se pudo guardar el nickname. Intenta de nuevo.");
    });
});

profileLogoutBtn.addEventListener("click", () => firebase.auth().signOut());
