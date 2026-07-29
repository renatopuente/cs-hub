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

// Only one card can be "active" (a modality picked, Confirmar enabled) at a
// time across the whole bento — picking a radio in any card resets and dims
// every other card, instead of letting several cards be armed at once.
function activateCard(activeCard) {
  signupCards.forEach((card) => {
    const confirmBtn = card.querySelector(".fee-confirm-btn");
    if (card === activeCard) {
      card.classList.remove("fee-card-inactive");
      if (confirmBtn) confirmBtn.disabled = false;
    } else {
      card.classList.add("fee-card-inactive");
      card.querySelectorAll(".fee-modalidad input[type=radio]").forEach((r) => {
        r.checked = false;
      });
      if (confirmBtn) confirmBtn.disabled = true;
    }
  });
}

signupCards.forEach((card) => {
  const tier = card.dataset.tier;
  const radios = card.querySelectorAll(".fee-modalidad input[type=radio]");
  const confirmBtn = card.querySelector(".fee-confirm-btn");
  if (!radios.length || !confirmBtn) return;

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      activateCard(card);
    });
  });

  confirmBtn.addEventListener("click", () => {
    const selected = card.querySelector(".fee-modalidad input[type=radio]:checked");
    if (!selected) return;
    const price = card.querySelector(".fee-price").textContent.trim().replace(/\s+/g, " ");
    const message = `Hola Pulpos 👋, quiero inscribirme al torneo *${tier}* 🏆 en la modalidad *${selected.value}* 🎮, valor *${price}* 💵.\n\nMi Nickname es:`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  });
});
