import { scrollToHomeSection, visibleHomeSection } from "./homeSectionNavigation";

const rect = (top, height = 0) => ({ top, height });

beforeEach(() => {
  document.body.innerHTML = '<nav class="navbar"></nav><section id="about"></section><section id="featured-work"></section><section class="contact-cta-section"></section>';
  document.querySelector(".navbar").getBoundingClientRect = () => rect(0, 72);
  window.scrollTo = jest.fn();
  window.matchMedia = jest.fn().mockReturnValue({ matches: false });
  Object.defineProperty(window, "scrollY", { configurable: true, value: 400 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
});

afterEach(() => { document.body.innerHTML = ""; });

test("section navigation accounts for the fixed header and reduced motion", () => {
  document.getElementById("about").getBoundingClientRect = () => rect(520);
  expect(scrollToHomeSection("#about")).toBe(true);
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 836, behavior: "smooth" });
  window.matchMedia.mockReturnValue({ matches: true });
  expect(scrollToHomeSection("#about")).toBe(true);
  expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 836, behavior: "auto" });
  expect(scrollToHomeSection("")).toBe(true);
  expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: "auto" });
});

test("active section follows viewport position and clears for Contact", () => {
  const about = document.getElementById("about");
  const projects = document.getElementById("featured-work");
  const contact = document.querySelector(".contact-cta-section");
  about.getBoundingClientRect = () => rect(600);
  projects.getBoundingClientRect = () => rect(1200);
  contact.getBoundingClientRect = () => rect(1800);
  expect(visibleHomeSection()).toBe("home");
  about.getBoundingClientRect = () => rect(100);
  expect(visibleHomeSection()).toBe("about");
  projects.getBoundingClientRect = () => rect(100);
  expect(visibleHomeSection()).toBe("projects");
  contact.getBoundingClientRect = () => rect(100);
  expect(visibleHomeSection()).toBeNull();
});
