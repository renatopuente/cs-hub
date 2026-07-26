// Firebase Realtime Database sync: admin pages write here (after anonymous sign-in),
// public view pages just read. Loaded via the firebase-*-compat.js CDN scripts.

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

// Admin pages call this once on load; it signs in anonymously so writes are allowed
// by the ".write": "auth != null" database rule. View pages never call this.
let fbAuthReady = null;
function fbInitAdmin() {
  fbAuthReady = firebase.auth().signInAnonymously();
  fbAuthReady.catch((err) => console.error("Firebase anonymous sign-in failed", err));
}

// storage.js calls these (if defined) on every save/clear, so every existing
// save/clear call site gets synced to Firebase automatically.
function pushTournamentToFirebase(mode, data) {
  if (!fbAuthReady) return;
  fbAuthReady.then(() => fbDb.ref(`tournaments/${mode}`).set(data)).catch((err) => console.error("Firebase write failed", err));
}

function clearTournamentFromFirebase(mode) {
  if (!fbAuthReady) return;
  fbAuthReady.then(() => fbDb.ref(`tournaments/${mode}`).remove()).catch((err) => console.error("Firebase clear failed", err));
}

// Public view pages call this: no sign-in, read-only, live updates.
function fbSubscribe(mode, onData) {
  fbDb.ref(`tournaments/${mode}`).on("value", (snapshot) => onData(snapshot.val()));
}
