
const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

// Menu responsivo
if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

// Ano automático no rodapé
const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Informações profissionais
const profile = {
  github: "https://github.com/FSAzevedo9",
  linkedin: "https://www.linkedin.com/in/felipe-azevedo-a436aa2b0/",
  email: "fs9315780@gmail.com"
};

// Configuração dos links
const githubLink = document.querySelector("#github-link");
const linkedinLink = document.querySelector("#linkedin-link");
const emailLink = document.querySelector("#email-link");

if (githubLink) githubLink.href = profile.github;
if (linkedinLink) linkedinLink.href = profile.linkedin;
if (emailLink) emailLink.href = `mailto:${profile.email}`;
