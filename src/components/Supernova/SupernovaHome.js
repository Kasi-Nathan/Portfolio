import React, { useEffect, useRef, useState } from "react";
import "./SupernovaHome.css";
import { formationHaze } from "./SupernovaFormation";

// Use the first 60% of sticky travel for the cinematic transition, leaving
// the rest for the fully revealed introduction before Projects enters.
export function homepageProgress(top, travel) {
  return Math.min(0.72, Math.max(0, -top / Math.max(1, travel * 0.6)) * 0.72);
}

export function journeyPosition(top, travel) {
  return Math.min(1, Math.max(0, -top / Math.max(1, travel)));
}

function smoothReveal(start, end, progress) {
  const value = Math.min(1, Math.max(0, (progress - start) / (end - start)));
  return value * value * (3 - 2 * value);
}

export function planetFormation(position) {
  return smoothReveal(0.4, 0.57, position) * (1 - smoothReveal(0.8, 0.97, position));
}

export function homepageReveal(position) {
  return smoothReveal(0.48, 0.61, position) * (1 - smoothReveal(0.84, 0.97, position));
}

export function finaleAmount(scroll, openingEnd, contactTop, homeBottom, viewport, maxScroll) {
  const end = Math.min(maxScroll, homeBottom - viewport);
  // If a tiny page has no travel after the opening, preserve the opening.
  if (end <= openingEnd) return 0;
  // Keep the middle sections as dust. Convergence begins only after the
  // measured contact top enters the bottom 15% of the viewport. A linear
  // scroll clock gives trajectories more travel; the shader eases arrivals.
  const start = Math.max(openingEnd, Math.min(contactTop - viewport * 0.85, end - 1));
  return Math.min(1, Math.max(0, (scroll - start) / (end - start)));
}

export function finaleProgress(opening, finale, reduced) {
  if (reduced) return finale > 0 ? 1 : 0.72;
  return finale > 0 ? 0.72 + 0.28 * finale : opening;
}

export function finaleFraming(width) {
  // Fixed destination composition, independent of scroll; never pan the camera.
  return width >= 992 ? [0.12, 0.02] : [0, -0.22];
}

export default function SupernovaHome({ children }) {
  const openingRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const layerRef = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let disposed = false;
    let scene;
    let frame = 0;
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const opening = openingRef.current;
    const home = opening.closest(".portfolio-home");
    const contact = home?.querySelector(".contact-cta-section");
    let unavailable = false;
    let dirty = true;
    let metrics;

    function measure() {
      const scroll = window.scrollY;
      const bounds = opening.getBoundingClientRect();
      metrics = {
        top: bounds.top + scroll,
        travel: Math.max(0, bounds.height - stageRef.current.getBoundingClientRect().height),
        contactTop: contact ? contact.getBoundingClientRect().top + scroll : Infinity,
        homeBottom: home ? home.getBoundingClientRect().bottom + scroll : Infinity,
        viewport: window.innerHeight,
        width: window.innerWidth,
        maxScroll: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
      };
      dirty = false;
    }

    function update() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (dirty) measure();
      const hero = opening.querySelector(".home-intro");
      const focusedHero = hero?.contains(document.activeElement);
      const position = journeyPosition(metrics.top - window.scrollY, metrics.travel);
      const openingProgress = preference?.matches || focusedHero || unavailable ? 0.72 : homepageProgress(
        metrics.top - window.scrollY, metrics.travel
      );
      const finale = contact ? finaleAmount(window.scrollY,
        metrics.top + metrics.travel, metrics.contactTop, metrics.homeBottom,
        metrics.viewport, metrics.maxScroll) : 0;
      const progress = finaleProgress(openingProgress, finale, Boolean(preference?.matches));
      const framing = finaleFraming(metrics.width);
      scene?.setFraming?.(framing[0], framing[1]);
      scene?.setProgress(progress);
      scene?.setPlanetAmount?.(preference?.matches || focusedHero || unavailable ? 1 : planetFormation(position));
      const reveal = preference?.matches || focusedHero || unavailable ? 1 : homepageReveal(position);
      opening.style.setProperty("--hero-reveal", reveal);
      opening.style.setProperty("--hero-offset", `${(1 - reveal) * 24}px`);
      const openingFade = smoothReveal(0.015, 0.15, position);
      opening.style.setProperty("--designation-opacity", 1 - openingFade);
      opening.style.setProperty("--opening-copy-offset", `${-18 * openingFade}px`);
      opening.dataset.openingVisible = String(openingFade < 0.98 && !preference?.matches && !unavailable);
      opening.querySelector(".home-stellar-designation")?.setAttribute("aria-hidden", String(openingFade >= 0.98 || Boolean(preference?.matches) || unavailable));
      const heroInteractive = reveal >= 0.98 || focusedHero || unavailable;
      opening.dataset.heroVisible = reveal > 0 || heroInteractive ? "true" : "false";
      opening.dataset.heroInteractive = String(Boolean(heroInteractive));
      if (hero) {
        hero.toggleAttribute("inert", !heroInteractive);
        hero.setAttribute("aria-hidden", String(!heroInteractive));
      }
      // A static fallback also leaves the reading area as the opening exits.
      layerRef.current.style.setProperty("--nebula-reveal", formationHaze(progress));
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    function invalidate() {
      dirty = true;
      schedule();
    }
    function motionChanged() {
      scene?.setReducedMotion(Boolean(preference?.matches));
      invalidate();
    }
    function sceneStatus(next) {
      if (disposed) return;
      unavailable = next === "unavailable";
      opening.dataset.fallback = String(unavailable);
      setStatus(next);
      invalidate();
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });
    if (preference?.addEventListener) preference.addEventListener("change", motionChanged);
    else preference?.addListener(motionChanged);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(invalidate) : null;
    observer?.observe(opening);
    observer?.observe(stageRef.current);
    if (home) observer?.observe(home);
    if (contact) observer?.observe(contact);
    observer?.observe(document.body);
    home?.addEventListener("load", invalidate, true);
    // Keyboard focus bypasses the cinematic reveal without hiding HTML from
    // assistive technology or moving the user's scroll position programmatically.
    opening.addEventListener("focusin", update);
    opening.addEventListener("focusout", schedule);
    update();

    // Load Three.js only when Home mounts. A pending import cannot mount a
    // renderer after navigation (including StrictMode's effect replay).
    import("./SupernovaScene").then(({ default: createScene }) => {
      if (disposed) return;
      scene = createScene(canvasRef.current, sceneStatus);
      scene?.setReducedMotion(Boolean(preference?.matches));
      update();
    }).catch(() => {
      sceneStatus("unavailable");
    });

    return () => {
      disposed = true;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", invalidate);
      if (preference?.removeEventListener) preference.removeEventListener("change", motionChanged);
      else preference?.removeListener(motionChanged);
      observer?.disconnect();
      home?.removeEventListener("load", invalidate, true);
      opening.removeEventListener("focusin", update);
      opening.removeEventListener("focusout", schedule);
      if (frame) cancelAnimationFrame(frame);
      scene?.dispose();
    };
  }, []);

  return (
    <>
      <div ref={layerRef} className={`home-supernova-layer home-supernova-layer--${status}`} aria-hidden="true">
        <div className="home-supernova-fallback" />
        <canvas ref={canvasRef} />
      </div>
      <div ref={openingRef} className="home-supernova-journey">
      <div ref={stageRef} className="home-supernova-stage">
      <div className="home-stellar-opening">
        <div className="home-stellar-designation">
          <p className="home-stellar-kicker">KASI NATHAN / DIGITAL UNIVERSE</p>
          <h1 className="home-stellar-headline">Every idea begins with a spark.</h1>
          <p className="home-stellar-classification">I build intelligent systems and interactive digital experiences. Step inside my universe.</p>
          <p className="home-stellar-name">CYGNUS-01</p>
        </div>
        <p className="home-stellar-skip">Scroll to ignite the universe <span aria-hidden="true">↓</span></p>
        <a className="home-stellar-a11y-skip" href="#home" onClick={() => {
          const opening = openingRef.current;
          const hero = opening?.querySelector(".home-intro");
          opening.dataset.heroVisible = "true";
          opening.dataset.heroInteractive = "true";
          hero?.removeAttribute("inert");
          hero?.setAttribute("aria-hidden", "false");
          hero?.querySelector("#home-title")?.focus({ preventScroll: true });
        }}>Skip introduction</a>
      </div>
      {children}
      </div>
      </div>
    </>
  );
}
