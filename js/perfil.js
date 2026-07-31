// Perfil de jugador: solo pueden ver/editar su propio Nickname y foto una
// vez logueados con Google. El Nickname se muestra de solo lectura con un
// botón de lápiz para editarlo — máximo 2 cambios por temporada, contador
// que se reinicia solo al empezar la siguiente.

const NICKNAME_CHANGES_PER_SEASON = 2;
const MAX_AVATAR_BYTES = 1 * 1024 * 1024; // 1 MB

const profileLoginRequiredEl = document.getElementById("profile-login-required");
const profileContentEl = document.getElementById("profile-content");
const profileAvatarEl = document.getElementById("profile-avatar");
const profileAvatarEditBtn = document.getElementById("profile-avatar-edit-btn");
const profileAvatarInput = document.getElementById("profile-avatar-input");
const profileAvatarErrorEl = document.getElementById("profile-avatar-error");
const profileGoogleNameEl = document.getElementById("profile-google-name");
const profileNicknameInput = document.getElementById("profile-nickname-input");
const profileNicknameEditBtn = document.getElementById("profile-nickname-edit-btn");
const profileEditHintEl = document.getElementById("profile-edit-hint");
const profileEditHintTextEl = document.getElementById("profile-edit-hint-text");
const profileNicknameActionsEl = document.getElementById("profile-nickname-actions");
const profileSaveBtn = document.getElementById("profile-save-btn");
const profileCancelBtn = document.getElementById("profile-cancel-btn");
const profileSavedHintEl = document.getElementById("profile-saved-hint");
const profileLockedHintEl = document.getElementById("profile-locked-hint");
const profileLockedTextEl = document.getElementById("profile-locked-text");
const profileLogoutBtn = document.getElementById("profile-logout-btn");
const profileWinsChipEl = document.getElementById("profile-wins-chip");
const profileWinsCountEl = document.getElementById("profile-wins-count");

profileEditHintTextEl.textContent = `Puedes cambiar tu Nickname hasta ${NICKNAME_CHANGES_PER_SEASON} veces por temporada.`;

let currentUid = null;
let currentProfile = {};
let isEditingNickname = false;
let savedNicknameValue = "";
let currentDisplayName = "";

/* ---------- Chip de victorias (por temporada) ---------- */

let duelosHistory = [];
let duosHistory = [];
let pugHistory = [];
let rankingResetAt = 0;

// Mismo criterio de resultado ganador que ranking.js.
function isWinningResult(result) {
  return typeof result === "string" && (result.includes("Ganó") || result.includes("Campeón") || /^#1\b/.test(result));
}

// Mismo criterio de "temporada mostrada" que ranking.js: el último día de
// temporada cierra a las 8am, y el primer día de la siguiente todavía
// muestra la anterior (los torneos de ese primer día son Amistoso y no
// cuentan) — así el chip de victorias siempre coincide con lo que se ve
// en la tabla de posiciones.
function displaySeasonIndex() {
  const now = new Date();
  let index = currentSeasonIndex();
  const info = getSeasonInfo(index);
  if (info.start.toDateString() === now.toDateString()) index -= 1;
  return index;
}

function countSeasonWins(nickname) {
  const name = (nickname || "").trim();
  if (!name) return 0;
  const seasonIdx = displaySeasonIndex();
  let wins = 0;
  [...duelosHistory, ...duosHistory, ...pugHistory].forEach((entry) => {
    if (!entry.finalizedAt || entry.finalizedAt <= rankingResetAt) return;
    if (seasonIndexForDate(new Date(entry.finalizedAt)) !== seasonIdx) return;
    (entry.teams || []).forEach((t) => {
      if (!isWinningResult(t.result)) return;
      (t.players || []).forEach((rawName) => {
        if ((rawName || "").trim() === name) wins += 1;
      });
    });
  });
  return wins;
}

function updateWinsChip() {
  if (!currentUid) {
    profileWinsChipEl.hidden = true;
    return;
  }
  const nickname = currentProfile.nickname || currentDisplayName;
  profileWinsCountEl.textContent = countSeasonWins(nickname);
  profileWinsChipEl.hidden = false;
}

fbSubscribeHistory("duelos", (list) => {
  duelosHistory = list;
  updateWinsChip();
});
fbSubscribeHistory("duos", (list) => {
  duosHistory = list;
  updateWinsChip();
});
fbSubscribeHistory("pug", (list) => {
  pugHistory = list;
  updateWinsChip();
});
fbSubscribeRankingReset((ts) => {
  rankingResetAt = ts;
  updateWinsChip();
});

function seasonChangesUsed(profile) {
  return profile.nicknameChangeSeason === currentSeasonIndex() ? profile.nicknameChangeCount || 0 : 0;
}

function applyLockState(profile) {
  const usedThisSeason = seasonChangesUsed(profile);
  const locked = usedThisSeason >= NICKNAME_CHANGES_PER_SEASON;

  if (locked) isEditingNickname = false;
  profileNicknameInput.readOnly = !isEditingNickname;
  profileNicknameEditBtn.hidden = locked;
  profileEditHintEl.hidden = !isEditingNickname;
  profileNicknameActionsEl.hidden = !isEditingNickname;
  profileLockedHintEl.hidden = !locked;
  if (locked) {
    profileLockedTextEl.textContent = `Ya usaste tus ${NICKNAME_CHANGES_PER_SEASON} cambios de Nickname esta temporada. Podrás cambiarlo de nuevo en la próxima.`;
  }
}

function renderAvatar(user, profile) {
  profileAvatarEl.src = profile.customPhotoURL || user.photoURL || "img/icons/icono_app-192.png";
}

firebase.auth().onAuthStateChanged((user) => {
  profileLoginRequiredEl.hidden = !!user;
  profileContentEl.hidden = !user;
  profileLogoutBtn.hidden = !user;
  if (!user) {
    currentUid = null;
    updateWinsChip();
    return;
  }

  currentUid = user.uid;
  currentDisplayName = user.displayName || "";
  profileGoogleNameEl.textContent = user.displayName || user.email || "Jugador";

  loadUserProfile(user.uid).then((profile) => {
    currentProfile = profile;
    savedNicknameValue = profile.nickname || user.displayName || "";
    profileNicknameInput.value = savedNicknameValue;
    renderAvatar(user, profile);
    isEditingNickname = false;
    applyLockState(profile);
    updateWinsChip();
  });
});

profileNicknameEditBtn.addEventListener("click", () => {
  if (seasonChangesUsed(currentProfile) >= NICKNAME_CHANGES_PER_SEASON) return;
  isEditingNickname = true;
  applyLockState(currentProfile);
  profileNicknameInput.focus();
  profileNicknameInput.setSelectionRange(profileNicknameInput.value.length, profileNicknameInput.value.length);
});

profileCancelBtn.addEventListener("click", () => {
  profileNicknameInput.value = savedNicknameValue;
  isEditingNickname = false;
  applyLockState(currentProfile);
});

profileSaveBtn.addEventListener("click", () => {
  if (!currentUid) return;
  const nickname = profileNicknameInput.value.trim();
  if (!nickname) return;

  const nowSeasonIdx = currentSeasonIndex();
  const newCount = seasonChangesUsed(currentProfile) + 1;

  saveUserNickname(currentUid, nickname, { nicknameChangeSeason: nowSeasonIdx, nicknameChangeCount: newCount })
    .then(() => {
      currentProfile = { ...currentProfile, nickname, nicknameChangeSeason: nowSeasonIdx, nicknameChangeCount: newCount };
      savedNicknameValue = nickname;
      isEditingNickname = false;
      applyLockState(currentProfile);
      updateWinsChip();
      profileSavedHintEl.hidden = false;
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

/* ---------- Foto de perfil (JPG/PNG, máx 1MB) ---------- */

profileAvatarEditBtn.addEventListener("click", () => profileAvatarInput.click());

profileAvatarInput.addEventListener("change", () => {
  const file = profileAvatarInput.files[0];
  profileAvatarErrorEl.hidden = true;
  if (!file || !currentUid) return;

  if (!["image/jpeg", "image/png"].includes(file.type)) {
    profileAvatarErrorEl.textContent = "Solo se aceptan imágenes JPG o PNG.";
    profileAvatarErrorEl.hidden = false;
    profileAvatarInput.value = "";
    return;
  }
  if (file.size > MAX_AVATAR_BYTES) {
    profileAvatarErrorEl.textContent = "La imagen pesa más de 1 MB. Comprímela e intenta de nuevo.";
    profileAvatarErrorEl.hidden = false;
    profileAvatarInput.value = "";
    return;
  }

  profileAvatarEditBtn.disabled = true;
  uploadAvatar(currentUid, file)
    .then((url) => saveUserPhoto(currentUid, url).then(() => url))
    .then((url) => {
      currentProfile = { ...currentProfile, customPhotoURL: url };
      profileAvatarEl.src = url;
    })
    .catch((err) => {
      console.error("No se pudo subir la foto de perfil", err);
      profileAvatarErrorEl.textContent = "No se pudo subir la foto. Intenta de nuevo.";
      profileAvatarErrorEl.hidden = false;
    })
    .finally(() => {
      profileAvatarEditBtn.disabled = false;
      profileAvatarInput.value = "";
    });
});
