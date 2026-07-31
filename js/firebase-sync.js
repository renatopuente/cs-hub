// Firebase Realtime Database sync: admin pages write here (once signed in via
// the GitHub login gate, see auth-gate.js), public view pages just read.
// Loaded via the firebase-*-compat.js CDN scripts.

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDl_usWJ17M7hL9myfgyQe9PBLHN1JXXzQ",
  authDomain: "cs-hub-6e388.firebaseapp.com",
  databaseURL: "https://cs-hub-6e388-default-rtdb.firebaseio.com",
  projectId: "cs-hub-6e388",
  storageBucket: "cs-hub-6e388.firebasestorage.app",
  messagingSenderId: "581590258522",
  appId: "1:581590258522:web:513089b6a6d941c7961963",
};

firebase.initializeApp(FIREBASE_CONFIG);
const fbDb = firebase.database();

// storage.js calls these (if defined) on every save/clear, so every existing
// save/clear call site gets synced to Firebase automatically. By the time a
// user can trigger these (the admin UI is hidden behind the login gate until
// authenticated), a signed-in GitHub session already exists.
function pushTournamentToFirebase(mode, data) {
  fbDb.ref(`tournaments/${mode}`).set(data).catch((err) => console.error("Firebase write failed", err));
}

function clearTournamentFromFirebase(mode) {
  fbDb.ref(`tournaments/${mode}`).remove().catch((err) => console.error("Firebase clear failed", err));
}

// Public view pages call this: no sign-in, read-only, live updates.
function fbSubscribe(mode, onData) {
  fbDb.ref(`tournaments/${mode}`).on("value", (snapshot) => onData(snapshot.val()));
}

// Admin pages call this once on load, to check Firebase (the real source of
// truth) for an already-in-progress tournament — localStorage is only a
// per-browser cache and won't know about tournaments started elsewhere.
function fbLoadOnce(mode, onData) {
  fbDb
    .ref(`tournaments/${mode}`)
    .once("value")
    .then((snapshot) => onData(snapshot.val()))
    .catch((err) => {
      console.error("Firebase load failed", err);
      onData(null);
    });
}

// "Finalizar torneo" archives a snapshot of results under historial/{mode},
// admin-only viewing (historial.html sits behind the same login gate).
function archiveTournament(mode, record) {
  return fbDb.ref(`historial/${mode}`).push(record);
}

// Admin-only cleanup: the DB write rule restricts this to Renato's UID,
// so this silently fails for anyone else even if the button is somehow
// visible to them.
function deleteHistoryEntry(mode, id) {
  return fbDb.ref(`historial/${mode}/${id}`).remove();
}

function fbSubscribeHistory(mode, onData) {
  fbDb.ref(`historial/${mode}`).on("value", (snapshot) => {
    const val = snapshot.val() || {};
    const list = Object.keys(val)
      .map((key) => ({ id: key, ...val[key] }))
      .sort((a, b) => (b.finalizedAt || 0) - (a.finalizedAt || 0));
    onData(list);
  });
}

// "Reiniciar marcadores" (l1o2t3us.html) doesn't delete any historial — that
// stays permanent by design. It just stores a cutoff timestamp; the ranking
// page ignores any result finalized at or before it, zeroing the scoreboard
// without touching the archived results.
function resetRankingScores() {
  return fbDb.ref("meta/rankingResetAt").set(Date.now());
}

function fbSubscribeRankingReset(onData) {
  fbDb.ref("meta/rankingResetAt").on("value", (snapshot) => onData(snapshot.val() || 0));
}

// Solicitudes de inscripción (inscripcion.html, público, sin login): cada
// jugador que confirma con su Nickname crea un registro acá. El dashboard de
// admin (inscripciones.html) los separa en "solicitando" vs "inscritos"
// según el campo status, y las vistas en vivo los usan para ir revelando
// nombres bajo cada equipo en el countdown a medida que se confirman.
function submitSolicitud(record) {
  return fbDb.ref("solicitudes").push(record).catch((err) => console.error("No se pudo enviar la solicitud", err));
}

function fbSubscribeSolicitudes(onData) {
  fbDb.ref("solicitudes").on("value", (snapshot) => {
    const val = snapshot.val() || {};
    const list = Object.keys(val)
      .map((key) => ({ id: key, ...val[key] }))
      .sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0));
    onData(list);
  });
}

function markSolicitudInscrito(id) {
  return fbDb.ref(`solicitudes/${id}`).update({ status: "inscrito", confirmedAt: Date.now() });
}

function deleteSolicitud(id) {
  return fbDb.ref(`solicitudes/${id}`).remove();
}

// Perfil de jugador (perfil.html): cada quien solo puede leer/escribir su
// propio nodo users/{uid} — la regla de Firebase debe restringirlo a
// auth.uid === $uid.
function loadUserProfile(uid) {
  return fbDb
    .ref(`users/${uid}`)
    .once("value")
    .then((snapshot) => snapshot.val() || {});
}

function saveUserNickname(uid, nickname, extra) {
  return fbDb.ref(`users/${uid}`).update(Object.assign({ nickname, updatedAt: Date.now() }, extra || {}));
}

// Foto de perfil propia (JPG/PNG, máx 1MB): sube el archivo a Firebase
// Storage bajo avatars/{uid}.{ext} y devuelve la URL de descarga. Requiere
// que la página haya cargado firebase-storage-compat.js — si no, falla
// con un error claro en vez de un TypeError críptico.
function uploadAvatar(uid, file) {
  if (typeof firebase.storage !== "function") {
    return Promise.reject(new Error("Firebase Storage no está disponible en esta página."));
  }
  const ext = file.type === "image/png" ? "png" : "jpg";
  const ref = firebase.storage().ref(`avatars/${uid}.${ext}`);
  return ref.put(file, { contentType: file.type }).then((snapshot) => snapshot.ref.getDownloadURL());
}

function saveUserPhoto(uid, photoURL) {
  return fbDb.ref(`users/${uid}`).update({ customPhotoURL: photoURL });
}
