// Fuente única de identidad de admins — reemplaza las 3 constantes de UID
// duplicadas que había antes (auth-gate.js, historial.js, player-auth.js).
// Agrega un UID acá una sola vez y automáticamente: (1) esa cuenta puede
// entrar al panel de admin, y (2) su nombre queda como "creado por" en los
// torneos que arme.
//
// Bootstrap para sumar una cuenta nueva: mientras no sepas su UID, entra al
// panel de admin (l1o2t3us.html) con esa cuenta de GitHub — auth-gate.js
// detecta que su UID no está en este mapa y te lo muestra en pantalla para
// que lo agregues acá. Nota aparte: GitHub (auth-gate.js) y Google
// (player-auth.js) son proveedores distintos de Firebase Auth — si esa
// misma persona también va a entrar con Google, vas a necesitar su UID de
// cada proveedor (pueden ser distintos), no solo uno.
const ADMINS = {
  "XxFQBlmtI2ResAdKWAgoGPCDwqO2": "Renato",
  // "<uid-nuevo-admin>": "<nombre>",
};

function isAdminUid(uid) {
  return !!uid && Object.prototype.hasOwnProperty.call(ADMINS, uid);
}

function adminName(uid) {
  return ADMINS[uid] || "Admin";
}
