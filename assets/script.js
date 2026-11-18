const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

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

document.querySelector("#year").textContent = new Date().getFullYear();

// Personalize these links before publishing.
const profile = {
  github: "https://github.com/FSAzevedo9",
  linkedin: "https://www.linkedin.com/in/felipe-azevedo-a436aa2b0",
  email: "fs9315780@gmail.com"
};

document.querySelector("#github-link").href = profile.github;
document.querySelector("#linkedin-link").href = profile.linkedin;
document.querySelector("#email-link").href = `mailto:${profile.email}`;
