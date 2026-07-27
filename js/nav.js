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
