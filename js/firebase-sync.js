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
