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
// y Confirmar se mantiene deshabilitado.
let isPlayerLoggedIn = false;
firebase.auth().onAuthStateChanged((user) => {
  isPlayerLoggedIn = !!user;
  signupCards.forEach(updateConfirmState);
});

// El campo Nickname aparece en cuanto se elige una modalidad Y hay sesión
// iniciada, y Confirmar solo se habilita cuando ADEMÁS hay al menos 1
// caracter escrito ahí.
function updateConfirmState(card) {
  const selected = card.querySelector(".fee-modalidad input[type=radio]:checked");
  const loginPrompt = card.querySelector(".fee-login-prompt");
  const nicknameField = card.querySelector(".fee-nickname-field");
  const nicknameInput = card.querySelector(".fee-nickname-input");
  const confirmBtn = card.querySelector(".fee-confirm-btn");
  if (!confirmBtn) return;

  if (loginPrompt) loginPrompt.hidden = !(selected && !isPlayerLoggedIn);
  if (nicknameField) nicknameField.hidden = !(selected && isPlayerLoggedIn);

  const hasNickname = !!(nicknameInput && nicknameInput.value.trim().length > 0);
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
      if (nicknameInput) nicknameInput.value = "";
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

  if (nicknameInput) {
    nicknameInput.addEventListener("input", () => updateConfirmState(card));
  }

  confirmBtn.addEventListener("click", () => {
    const selected = card.querySelector(".fee-modalidad input[type=radio]:checked");
    if (!selected || !nicknameInput || !nicknameInput.value.trim()) return;
    const nickname = nicknameInput.value.trim();
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
