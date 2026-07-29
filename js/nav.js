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

// Home: clicking the hero banner scrolls down to the season marquee.
const heroBannerScroll = document.getElementById("hero-banner-scroll");
const seasonMarqueeEl = document.getElementById("season-marquee");
if (heroBannerScroll && seasonMarqueeEl) {
  heroBannerScroll.addEventListener("click", () => {
    seasonMarqueeEl.scrollIntoView({ behavior: "smooth" });
  });
}

// Inscripción: clicking any fee card scrolls down to the payment info.
const paymentInfoEl = document.getElementById("payment-info");
if (paymentInfoEl) {
  document.querySelectorAll(".fee-card-link").forEach((card) => {
    card.addEventListener("click", () => {
      paymentInfoEl.scrollIntoView({ behavior: "smooth" });
    });
  });
}
