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
