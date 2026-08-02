// Pestaña "Comunidad" del perfil (perfil.html): amigos (buscar, solicitar,
// aceptar/rechazar, lista) y torneos entre jugadores — Fase 2: solo lobbies
// públicos (Duelos/Duos/Pug), sin invitar amigos todavía (eso es Fase 3) y
// sin que el admin los recoja para iniciarlos (Fase 4). Sigue el mismo
// patrón de cada archivo llevando su propia sesión (independiente de
// perfil.js) que ya usan ranking.js/inscripcion.js en este sitio.

const GENERIC_AVATAR_COMMUNITY = "img/icons/icono_app-192.png";

const communitySearchInput = document.getElementById("community-search-input");
const communitySearchResultsEl = document.getElementById("community-search-results");
const communityRequestsListEl = document.getElementById("community-requests-list");
const communityRequestsEmptyEl = document.getElementById("community-requests-empty");
const communityFriendsListEl = document.getElementById("community-friends-list");
const communityFriendsEmptyEl = document.getElementById("community-friends-empty");
const communityFriendsPaginationEl = document.getElementById("community-friends-pagination");
const communityFriendsPrevBtn = document.getElementById("community-friends-prev-btn");
const communityFriendsNextBtn = document.getElementById("community-friends-next-btn");
const communityFriendsPageLabelEl = document.getElementById("community-friends-page-label");

const lobbyModeButtons = document.querySelectorAll(".lobby-mode-btn");
const lobbyCreateForm = document.getElementById("lobby-create-form");
const lobbyBestOfField = document.getElementById("lobby-bestof-field");
const lobbyTeamSizeField = document.getElementById("lobby-teamsize-field");
const lobbyBestOfSelect = document.getElementById("lobby-bestof");
const lobbyTeamSizeSelect = document.getElementById("lobby-teamsize");
const lobbyListEl = document.getElementById("lobby-list");
const lobbyEmptyEl = document.getElementById("lobby-empty");
const lobbyPaginationEl = document.getElementById("lobby-pagination");
const lobbyPrevBtn = document.getElementById("lobby-prev-btn");
const lobbyNextBtn = document.getElementById("lobby-next-btn");
const lobbyPageLabelEl = document.getElementById("lobby-page-label");

const FRIENDS_PAGE_SIZE = 6;
const LOBBY_PAGE_SIZE = 5;
const MODE_LABELS = { duelos: "Duelos", duos: "Duos", pug: "Pug" };

let myUid = null;
let myNickname = "";
let myPhotoURL = "";

let allUsersPublic = [];
let incomingRequests = [];
let sentRequestUids = [];
let friendsList = [];
let friendsPage = 0;

let currentLobbyMode = "duelos";
let lobbiesByMode = { duelos: [], duos: [], pug: [] };
let lobbyPage = 0;

firebase.auth().onAuthStateChanged((user) => {
  myUid = user ? user.uid : null;
  if (!user) {
    myNickname = "";
    myPhotoURL = "";
    renderSearchResults();
    return;
  }
  loadUserProfile(user.uid).then((profile) => {
    myNickname = profile.nickname || user.displayName || "";
    myPhotoURL = profile.customPhotoURL || user.photoURL || "";
    renderSearchResults();
  });
});

/* ---------- Buscar jugadores ---------- */

fbSubscribeUsersPublic((list) => {
  allUsersPublic = list;
  renderSearchResults();
});

function friendshipState(uid) {
  if (friendsList.some((f) => f.uid === uid)) return "friend";
  if (sentRequestUids.includes(uid)) return "sent";
  if (incomingRequests.some((r) => r.fromUid === uid)) return "incoming";
  return "none";
}

function renderSearchResults() {
  if (!communitySearchResultsEl) return;
  const query = (communitySearchInput.value || "").trim().toLowerCase();

  if (!myUid) {
    communitySearchResultsEl.innerHTML = `<p class="section-sub">Inicia sesión para buscar jugadores.</p>`;
    return;
  }
  if (!query) {
    communitySearchResultsEl.innerHTML = "";
    return;
  }

  const results = allUsersPublic
    .filter((u) => u.uid !== myUid)
    .filter((u) => (u.nickname || "").toLowerCase().includes(query))
    .slice(0, 20);

  if (!results.length) {
    communitySearchResultsEl.innerHTML = `<p class="section-sub">Nadie con ese Nickname todavía.</p>`;
    return;
  }

  communitySearchResultsEl.innerHTML = results
    .map((u) => {
      const state = friendshipState(u.uid);
      let actionHtml = `<button type="button" class="btn btn-outline btn-sm" data-send-request="${u.uid}">Enviar solicitud</button>`;
      if (state === "friend") actionHtml = `<span class="community-state-chip">Ya son amigos</span>`;
      else if (state === "sent") actionHtml = `<span class="community-state-chip">Solicitud enviada</span>`;
      else if (state === "incoming") actionHtml = `<span class="community-state-chip">Te envió solicitud</span>`;

      return `
        <div class="community-row">
          <img class="community-avatar" src="${u.photoURL || GENERIC_AVATAR_COMMUNITY}" alt="" />
          <span class="community-row-name">${u.nickname || "Jugador"}</span>
          ${actionHtml}
        </div>
      `;
    })
    .join("");

  communitySearchResultsEl.querySelectorAll("[data-send-request]").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.disabled = true;
      fbSendFriendRequest(myUid, myNickname, myPhotoURL, btn.dataset.sendRequest).then(() => renderSearchResults());
    });
  });
}

if (communitySearchInput) {
  communitySearchInput.addEventListener("input", renderSearchResults);
}

/* ---------- Solicitudes de amistad ---------- */

function watchFriendRequests() {
  if (!myUid) return;
  fbSubscribeFriendRequests(myUid, (list) => {
    incomingRequests = list;
    renderFriendRequests();
    renderSearchResults();
  });
  fbSubscribeSentFriendRequests(myUid, (uids) => {
    sentRequestUids = uids;
    renderSearchResults();
  });
}

function renderFriendRequests() {
  if (!communityRequestsListEl) return;
  if (!incomingRequests.length) {
    communityRequestsListEl.innerHTML = "";
    communityRequestsEmptyEl.hidden = false;
    return;
  }
  communityRequestsEmptyEl.hidden = true;
  communityRequestsListEl.innerHTML = incomingRequests
    .map(
      (r) => `
      <div class="community-row">
        <img class="community-avatar" src="${r.fromPhotoURL || GENERIC_AVATAR_COMMUNITY}" alt="" />
        <span class="community-row-name">${r.fromNickname || "Jugador"}</span>
        <div class="community-row-actions">
          <button type="button" class="btn btn-primary btn-sm" data-accept-request="${r.fromUid}" data-nickname="${r.fromNickname || ""}" data-photourl="${r.fromPhotoURL || ""}">
            <i class="fa-solid fa-check"></i> Aceptar
          </button>
          <button type="button" class="btn btn-outline btn-sm" data-reject-request="${r.fromUid}">
            <i class="fa-solid fa-xmark"></i> Rechazar
          </button>
        </div>
      </div>
    `
    )
    .join("");

  communityRequestsListEl.querySelectorAll("[data-accept-request]").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.disabled = true;
      fbAcceptFriendRequest(myUid, myNickname, myPhotoURL, btn.dataset.acceptRequest, btn.dataset.nickname, btn.dataset.photourl);
    });
  });
  communityRequestsListEl.querySelectorAll("[data-reject-request]").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.disabled = true;
      fbRejectFriendRequest(myUid, btn.dataset.rejectRequest);
    });
  });
}

/* ---------- Lista de amigos ---------- */

function watchFriends() {
  if (!myUid) return;
  fbSubscribeFriends(myUid, (list) => {
    friendsList = list.sort((a, b) => (a.nickname || "").localeCompare(b.nickname || ""));
    friendsPage = 0;
    renderFriendsList();
    renderSearchResults();
  });
}

function renderFriendsList() {
  if (!communityFriendsListEl) return;
  if (!friendsList.length) {
    communityFriendsListEl.innerHTML = "";
    communityFriendsEmptyEl.hidden = false;
    communityFriendsPaginationEl.hidden = true;
    return;
  }
  communityFriendsEmptyEl.hidden = true;

  const totalPages = Math.ceil(friendsList.length / FRIENDS_PAGE_SIZE);
  if (friendsPage >= totalPages) friendsPage = totalPages - 1;
  if (friendsPage < 0) friendsPage = 0;
  const pageStart = friendsPage * FRIENDS_PAGE_SIZE;
  const pageItems = friendsList.slice(pageStart, pageStart + FRIENDS_PAGE_SIZE);

  communityFriendsListEl.innerHTML = pageItems
    .map(
      (f) => `
      <div class="community-row">
        <img class="community-avatar" src="${f.photoURL || GENERIC_AVATAR_COMMUNITY}" alt="" />
        <span class="community-row-name">${f.nickname || "Jugador"}</span>
        <button type="button" class="btn btn-outline btn-sm" data-remove-friend="${f.uid}">Quitar</button>
      </div>
    `
    )
    .join("");

  communityFriendsListEl.querySelectorAll("[data-remove-friend]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!confirm("¿Quitar a este amigo de tu lista?")) return;
      fbRemoveFriend(myUid, btn.dataset.removeFriend);
    });
  });

  communityFriendsPaginationEl.hidden = totalPages <= 1;
  communityFriendsPageLabelEl.textContent = `Página ${friendsPage + 1} de ${totalPages}`;
  communityFriendsPrevBtn.disabled = friendsPage === 0;
  communityFriendsNextBtn.disabled = friendsPage >= totalPages - 1;
}

if (communityFriendsPrevBtn) {
  communityFriendsPrevBtn.addEventListener("click", () => {
    if (friendsPage <= 0) return;
    friendsPage -= 1;
    renderFriendsList();
  });
  communityFriendsNextBtn.addEventListener("click", () => {
    friendsPage += 1;
    renderFriendsList();
  });
}

// Empieza a escuchar solicitudes/amigos en cuanto se conoce el uid (el
// primer onAuthStateChanged de arriba ya corrió antes de que estos
// listeners existan, así que se enganchan también acá).
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    watchFriendRequests();
    watchFriends();
  } else {
    incomingRequests = [];
    sentRequestUids = [];
    friendsList = [];
    renderFriendRequests();
    renderFriendsList();
  }
});

/* ---------- Lobbies: crear y unirse a torneos entre jugadores ---------- */

function teamSizeForMode(mode) {
  if (mode === "duelos") return 1;
  if (mode === "duos") return 2;
  return parseInt(lobbyTeamSizeSelect.value, 10) || 2;
}

function emptySlot() {
  return { uid: "", nickname: "" };
}

function buildEmptyTeams(mode) {
  const size = teamSizeForMode(mode);
  const names = ["Equipo A", "Equipo B"];
  return names.map((name, i) => ({
    id: `team-${i + 1}`,
    name,
    color: i === 0 ? "#9b4dff" : "#ff6ec7",
    players: Array.from({ length: size }, emptySlot),
  }));
}

// Navegar la lista de torneos abiertos (Duelos/Duos/Pug) es un selector
// aparte del que elige la modalidad a la hora de CREAR uno — cada uno con
// su propia clase para no pisarse entre sí.
lobbyModeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    lobbyModeButtons.forEach((b) => b.classList.toggle("is-active", b === btn));
    currentLobbyMode = btn.dataset.lobbyMode;
    lobbyPage = 0;
    renderLobbyList();
  });
});

let currentCreateMode = "duelos";
document.querySelectorAll(".lobby-create-mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".lobby-create-mode-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
    currentCreateMode = btn.dataset.createMode;
    lobbyTeamSizeField.hidden = currentCreateMode !== "pug";
  });
});

if (lobbyCreateForm) {
  lobbyCreateForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!myUid) {
      alert("Inicia sesión para crear un torneo.");
      return;
    }
    const teams = buildEmptyTeams(currentCreateMode);
    teams[0].players[0] = { uid: myUid, nickname: myNickname };

    const lobby = {
      mode: currentCreateMode,
      visibility: "public",
      creatorUid: myUid,
      creatorNickname: myNickname,
      createdAt: Date.now(),
      bestOf: parseInt(lobbyBestOfSelect.value, 10),
      teams,
      status: "open",
    };

    fbCreateLobby(currentCreateMode, lobby).then(() => {
      alert("¡Listo! Tu torneo ya está publicado en la lista, esperando que se unan.");
    });
  });
}

function watchLobbies() {
  ["duelos", "duos", "pug"].forEach((mode) => {
    fbSubscribeLobbies(mode, (list) => {
      lobbiesByMode[mode] = list;
      if (mode === currentLobbyMode) renderLobbyList();
    });
  });
}

function lobbySlotsSummary(lobby) {
  const total = lobby.teams.reduce((sum, t) => sum + t.players.length, 0);
  const filled = lobby.teams.reduce((sum, t) => sum + t.players.filter((p) => p.uid).length, 0);
  return `${filled}/${total}`;
}

function renderLobbyTeamHtml(lobby, teamIdx) {
  const team = lobby.teams[teamIdx];
  const slotsHtml = team.players
    .map((p, slotIdx) => {
      if (p.uid) {
        return `<span class="lobby-slot lobby-slot-filled">${p.nickname}</span>`;
      }
      const canJoin = myUid && lobby.status === "open";
      return canJoin
        ? `<button type="button" class="lobby-slot lobby-slot-open" data-join-lobby="${lobby.id}" data-join-mode="${lobby.mode}" data-join-team="${teamIdx}" data-join-slot="${slotIdx}">
            <i class="fa-solid fa-plus"></i> Unirme
          </button>`
        : `<span class="lobby-slot lobby-slot-open">Cupo libre</span>`;
    })
    .join("");
  return `<div class="lobby-team"><div class="lobby-team-name" style="color:${team.color}">${team.name}</div><div class="lobby-team-slots">${slotsHtml}</div></div>`;
}

function renderLobbyList() {
  if (!lobbyListEl) return;
  const list = lobbiesByMode[currentLobbyMode] || [];

  if (!list.length) {
    lobbyListEl.innerHTML = "";
    lobbyPaginationEl.hidden = true;
    lobbyEmptyEl.hidden = false;
    return;
  }
  lobbyEmptyEl.hidden = true;

  const totalPages = Math.ceil(list.length / LOBBY_PAGE_SIZE);
  if (lobbyPage >= totalPages) lobbyPage = totalPages - 1;
  if (lobbyPage < 0) lobbyPage = 0;
  const pageStart = lobbyPage * LOBBY_PAGE_SIZE;
  const pageItems = list.slice(pageStart, pageStart + LOBBY_PAGE_SIZE);

  lobbyListEl.innerHTML = pageItems
    .map(
      (lobby) => `
      <div class="glass-card lobby-card">
        <div class="lobby-card-header">
          <span class="lobby-card-title"><i class="fa-solid fa-gamepad"></i> ${MODE_LABELS[lobby.mode] || lobby.mode} · Mejor de ${lobby.bestOf}</span>
          <span class="fee-chip">${lobbySlotsSummary(lobby)} cupos</span>
        </div>
        <p class="section-sub" style="margin: 4px 0 12px;">Creado por ${lobby.creatorNickname || "Jugador"}</p>
        <div class="lobby-teams-row">
          ${renderLobbyTeamHtml(lobby, 0)}
          <div class="lobby-vs">VS</div>
          ${renderLobbyTeamHtml(lobby, 1)}
        </div>
      </div>
    `
    )
    .join("");

  lobbyListEl.querySelectorAll("[data-join-lobby]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!myUid) {
        alert("Inicia sesión para unirte.");
        return;
      }
      btn.disabled = true;
      const mode = btn.dataset.joinMode;
      const lobbyId = btn.dataset.joinLobby;
      const teamIdx = btn.dataset.joinTeam;
      const slotIdx = btn.dataset.joinSlot;
      fbClaimLobbySlot(mode, lobbyId, teamIdx, slotIdx, myUid, myNickname)
        .then(() => {
          const lobby = (lobbiesByMode[mode] || []).find((l) => l.id === lobbyId);
          if (!lobby) return;
          const stillOpen = lobby.teams.some((t, ti) =>
            t.players.some((p, si) => !(String(ti) === teamIdx && String(si) === slotIdx) && !p.uid)
          );
          if (!stillOpen) fbUpdateLobbyStatus(mode, lobbyId, "full");
        })
        .catch((err) => {
          console.error("No se pudo unir al torneo", err);
          alert("Ese cupo ya no está disponible.");
          btn.disabled = false;
        });
    });
  });

  lobbyPaginationEl.hidden = totalPages <= 1;
  lobbyPageLabelEl.textContent = `Página ${lobbyPage + 1} de ${totalPages}`;
  lobbyPrevBtn.disabled = lobbyPage === 0;
  lobbyNextBtn.disabled = lobbyPage >= totalPages - 1;
}

if (lobbyPrevBtn) {
  lobbyPrevBtn.addEventListener("click", () => {
    if (lobbyPage <= 0) return;
    lobbyPage -= 1;
    renderLobbyList();
  });
  lobbyNextBtn.addEventListener("click", () => {
    lobbyPage += 1;
    renderLobbyList();
  });
}

watchLobbies();
