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

document.querySelectorAll(".fee-signup-card").forEach((card) => {
  const tier = card.dataset.tier;
  const radios = card.querySelectorAll(".fee-modalidad input[type=radio]");
  const confirmBtn = card.querySelector(".fee-confirm-btn");
  if (!radios.length || !confirmBtn) return;

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      confirmBtn.disabled = false;
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
