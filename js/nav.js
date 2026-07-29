const hamburgerBtn = document.getElementById("hamburger-btn");
const mobileMenu = document.getElementById("mobile-menu");

if (hamburgerBtn && mobileMenu) {
  hamburgerBtn.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    hamburgerBtn.setAttribute("aria-expanded", String(isOpen));
    hamburgerBtn.querySelector("i").className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      hamburgerBtn.setAttribute("aria-expanded", "false");
      hamburgerBtn.querySelector("i").className = "fa-solid fa-bars";
    });
  });
}

// Desktop nav dropdowns (Torneos / Historial): click to toggle, click
// outside or select a link to close, only one open at a time.
const navDropdowns = document.querySelectorAll(".nav-dropdown");
navDropdowns.forEach((dropdown) => {
  const toggle = dropdown.querySelector(".nav-dropdown-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !dropdown.classList.contains("open");

    navDropdowns.forEach((other) => {
      other.classList.remove("open");
      other.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
    });

    if (willOpen) {
      dropdown.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
    }
  });
});

document.addEventListener("click", () => {
  navDropdowns.forEach((dropdown) => {
    dropdown.classList.remove("open");
    dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
  });
});

// Mobile menu groups (Torneos / Resultados): tap to expand, only one open
// at a time, so the menu doesn't stay fully unfolded and too long.
const mobileGroupToggles = document.querySelectorAll(".mobile-menu-group-toggle");
mobileGroupToggles.forEach((toggle) => {
  const submenu = toggle.nextElementSibling;
  if (!submenu) return;

  toggle.addEventListener("click", () => {
    const willOpen = toggle.getAttribute("aria-expanded") !== "true";

    mobileGroupToggles.forEach((otherToggle) => {
      otherToggle.setAttribute("aria-expanded", "false");
      if (otherToggle.nextElementSibling) otherToggle.nextElementSibling.hidden = true;
    });

    if (willOpen) {
      toggle.setAttribute("aria-expanded", "true");
      submenu.hidden = false;
    }
  });
});

// Home: FAQ accordion — each question toggles independently.
const faqToggles = document.querySelectorAll(".faq-toggle");
faqToggles.forEach((toggle) => {
  const panel = document.getElementById(toggle.dataset.target);
  if (!panel) return;

  toggle.addEventListener("click", () => {
    const alreadyOpen = toggle.getAttribute("aria-expanded") === "true";

    faqToggles.forEach((otherToggle) => {
      otherToggle.setAttribute("aria-expanded", "false");
      const otherPanel = document.getElementById(otherToggle.dataset.target);
      if (otherPanel) otherPanel.hidden = true;
    });

    if (!alreadyOpen) {
      toggle.setAttribute("aria-expanded", "true");
      panel.hidden = false;
    }
  });
});

// Home: fee-card flip — the rotate icon and the Leer más / Volver links
// all just toggle the flip state of their own card.
document.querySelectorAll(".fee-card-flip-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    trigger.closest(".flip-card")?.classList.toggle("is-flipped");
  });
});

// PWA install chip (mobile only, styling handles that): stays hidden
// until the browser confirms installability via beforeinstallprompt,
// and never appears at all once already running as the installed app.
const installChip = document.getElementById("install-chip");
if (installChip) {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

  if (!isStandalone) {
    let deferredInstallPrompt = null;

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      installChip.hidden = false;
    });

    installChip.addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installChip.hidden = true;
    });
  }
}

// "Salir" en el menú hamburguesa: solo visible cuando la app corre instalada
// como PWA standalone. window.close() solo funciona en ventanas abiertas por
// script, así que en una PWA lanzada desde el ícono del sistema esto puede
// no cerrar la app (limitación de la plataforma, no hay API estándar para
// forzar el cierre de una PWA instalada).
const exitAppBtn = document.getElementById("exit-app-btn");
if (exitAppBtn) {
  const isStandaloneApp =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

  if (isStandaloneApp) {
    exitAppBtn.hidden = false;
    exitAppBtn.addEventListener("click", () => {
      window.close();
    });
  }
}

// Home: clicking the hero banner scrolls down to the season marquee.
const heroBannerScroll = document.getElementById("hero-banner-scroll");
const seasonMarqueeEl = document.getElementById("season-marquee");
if (heroBannerScroll && seasonMarqueeEl) {
  heroBannerScroll.addEventListener("click", () => {
    seasonMarqueeEl.scrollIntoView({ behavior: "smooth" });
  });
}
