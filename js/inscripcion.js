const WHATSAPP_NUMBER = "593998880675";

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
    const message = `Hola Pulpos 👋, quiero inscribirme al torneo *${tier}* 🏆 en la modalidad *${selected.value}* 🎮.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  });
});
