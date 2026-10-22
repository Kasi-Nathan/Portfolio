export const HOME_SECTIONS = Object.freeze({
  home: "",
  about: "#about",
  projects: "#featured-work",
});

export function scrollToHomeSection(hash) {
  const targetId = hash === HOME_SECTIONS.about ? "about"
    : hash === HOME_SECTIONS.projects ? "featured-work" : null;
  const target = targetId ? document.getElementById(targetId) : null;
  if (targetId && !target) return false;

  const headerHeight = document.querySelector(".navbar")?.getBoundingClientRect().height || 80;
  const top = target
    ? Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerHeight - 12)
    : 0;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
  return true;
}

export function visibleHomeSection() {
  const about = document.getElementById("about");
  const projects = document.getElementById("featured-work");
  if (!about || !projects) return "home";
  const headerHeight = document.querySelector(".navbar")?.getBoundingClientRect().height || 80;
  const marker = headerHeight + Math.min(window.innerHeight * 0.25, 180);
  const contact = document.querySelector(".contact-cta-section");
  if (contact && contact.getBoundingClientRect().top <= marker) return null;
  if (projects.getBoundingClientRect().top <= marker) return "projects";
  if (about.getBoundingClientRect().top <= marker) return "about";
  return "home";
}
