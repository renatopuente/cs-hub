const WHATSAPP_NUMBER = "593998880675";

// On mobile, a link from the home page's fee-cards (e.g. inscripcion.html#plan-elite)
// should land on its matching card centered in the viewport, not just scrolled
// to the top edge like a plain anchor jump.
if (location.hash && window.matchMedia("(max-width: 768px)").matches) {
  const target = document.getElementById(location.hash.slice(1));
  if (target) {
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
}

const signupCards = document.querySelectorAll(".fee-signup-card");

// Solo un jugador logueado puede inscribirse: sin sesión, elegir una
// modalidad muestra un aviso para iniciar sesión en vez del campo Nickname,
// y Confirmar se mantiene deshabilitado. Con sesión, el Nickname no se
// escribe a mano — viene por defecto del que guardó en su perfil (o su
// nombre de Google si todavía no lo configuró) y el campo es de solo lectura.
let isPlayerLoggedIn = false;
let playerNickname = "";

firebase.auth().onAuthStateChanged((user) => {
  isPlayerLoggedIn = !!user;
  playerNickname = "";

  if (user) {
    loadUserProfile(user.uid).then((profile) => {
      playerNickname = profile.nickname || user.displayName || "";
      signupCards.forEach(updateConfirmState);
    });
  }

  signupCards.forEach(updateConfirmState);
});

function updateConfirmState(card) {
  const selected = card.querySelector(".fee-modalidad input[type=radio]:checked");
  const loginPrompt = card.querySelector(".fee-login-prompt");
  const nicknameField = card.querySelector(".fee-nickname-field");
  const nicknameInput = card.querySelector(".fee-nickname-input");
  const confirmBtn = card.querySelector(".fee-confirm-btn");
  if (!confirmBtn) return;

  if (loginPrompt) loginPrompt.hidden = !(selected && !isPlayerLoggedIn);
  if (nicknameField) nicknameField.hidden = !(selected && isPlayerLoggedIn);

  if (nicknameInput && selected && isPlayerLoggedIn) {
    nicknameInput.textContent = playerNickname;
    nicknameInput.dataset.nickname = playerNickname;
  }

  const hasNickname = !!(nicknameInput && nicknameInput.dataset.nickname && nicknameInput.dataset.nickname.trim().length > 0);
  confirmBtn.disabled = !(selected && isPlayerLoggedIn && hasNickname);
}

// Only one card can be "active" (a modality picked, Confirmar enabled) at a
// time across the whole bento — picking a radio in any card resets and dims
// every other card, instead of letting several cards be armed at once.
function activateCard(activeCard) {
  signupCards.forEach((card) => {
    if (card === activeCard) {
      card.classList.remove("fee-card-inactive");
    } else {
      card.classList.add("fee-card-inactive");
      card.querySelectorAll(".fee-modalidad input[type=radio]").forEach((r) => {
        r.checked = false;
      });
      const nicknameInput = card.querySelector(".fee-nickname-input");
      if (nicknameInput) {
        nicknameInput.textContent = "";
        nicknameInput.dataset.nickname = "";
      }
    }
    updateConfirmState(card);
  });
}

signupCards.forEach((card) => {
  const tier = card.dataset.tier;
  const radios = card.querySelectorAll(".fee-modalidad input[type=radio]");
  const nicknameInput = card.querySelector(".fee-nickname-input");
  const confirmBtn = card.querySelector(".fee-confirm-btn");
  if (!radios.length || !confirmBtn) return;

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      activateCard(card);
    });
  });

  confirmBtn.addEventListener("click", () => {
    const selected = card.querySelector(".fee-modalidad input[type=radio]:checked");
    const nickname = nicknameInput && nicknameInput.dataset.nickname;
    if (!selected || !nickname || !nickname.trim()) return;
    const price = card.querySelector(".fee-price").textContent.trim().replace(/\s+/g, " ");

    if (typeof submitSolicitud === "function") {
      submitSolicitud({
        name: nickname,
        tier,
        modalidad: selected.value,
        price,
        requestedAt: Date.now(),
        status: "solicitado",
      });
    }

    const message = `Hola Pulpos 👋, quiero inscribirme al torneo *${tier}* 🏆 en la modalidad *${selected.value}* 🎮, valor *${price}* 💵.\n\nMi Nickname es: *${nickname}*`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  });
});
