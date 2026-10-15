import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGalaxyTransition } from "./GalaxyTransition";
import { ParticlePlanet, ParticleStarfield } from "./ProjectParticles";
import "./ProjectWormhole.css";

const WormholeContext = createContext({ travelTo: () => false, activeProjectId: null });

export function useProjectWormhole() {
  return useContext(WormholeContext);
}

export function ProjectWormholeProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isTransitioning } = useGalaxyTransition();
  const [transition, setTransition] = useState(null);
  const pending = useRef(null);
  const timers = useRef([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  const cancel = useCallback(() => {
    clearTimers();
    pending.current = null;
    setTransition(null);
  }, [clearTimers]);

  useEffect(() => {
    window.addEventListener("popstate", cancel);
    return () => window.removeEventListener("popstate", cancel);
  }, [cancel]);
  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    const current = pending.current;
    if (!current) return;
    if (location.pathname === current.destination) {
      if (!current.navigated) return;
      window.scrollTo(0, 0);
      const frame = window.requestAnimationFrame(() => {
        document.getElementById("project-detail-title")?.focus({ preventScroll: true });
      });
      return () => window.cancelAnimationFrame(frame);
    }
    if (current.navigated || location.pathname !== current.source) cancel();
    return undefined;
  }, [location.pathname, cancel]);

  const travelTo = useCallback((projectId, visual, planetIndex = 0) => {
    if (pending.current || isTransitioning || !projectId) return false;
    const destination = `/project/${projectId}`;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const bounds = visual?.getBoundingClientRect();
    const x = bounds ? bounds.left + bounds.width / 2 : window.innerWidth / 2;
    const y = bounds ? bounds.top + bounds.height / 2 : window.innerHeight / 2;
    const world = visual?.closest(".galaxy-world");
    const colors = world ? window.getComputedStyle(world) : null;
    const light = colors?.getPropertyValue("--light").trim() || "#b7dded";
    const mid = colors?.getPropertyValue("--mid").trim() || "#5375a6";
    const dark = colors?.getPropertyValue("--dark").trim() || "#192647";
    pending.current = { destination, source: location.pathname, navigated: false };
    if (reduced) {
      pending.current.navigated = true;
      navigate(destination);
      timers.current.push(setTimeout(cancel, 80));
      return true;
    }
    setTransition({ projectId, planetIndex, phase: "start", x, y, size: bounds?.width || 100, light, mid, dark });
    timers.current.push(setTimeout(() => setTransition(previous => previous && { ...previous, phase: "gather" }), 16));
    timers.current.push(setTimeout(() => setTransition(previous => previous && { ...previous, phase: "expand" }), 130));
    timers.current.push(setTimeout(() => {
      if (!pending.current) return;
      pending.current.navigated = true;
      navigate(destination);
      setTransition(previous => previous && { ...previous, phase: "reveal" });
    }, 550));
    timers.current.push(setTimeout(cancel, 1080));
    return true;
  }, [cancel, isTransitioning, location.pathname, navigate]);

  return (
    <WormholeContext.Provider value={{ travelTo, activeProjectId: transition?.projectId || null }}>
      {children}
      {transition && (
        <div className={`project-wormhole project-wormhole--${transition.phase}`} style={{ "--portal-x": `${transition.x}px`, "--portal-y": `${transition.y}px`, "--planet-size": `${transition.size}px`, "--planet-light": transition.light, "--planet-mid": transition.mid, "--planet-dark": transition.dark }} aria-hidden="true" data-testid="project-wormhole">
          <div className="project-wormhole__portal"><ParticlePlanet identity={transition.projectId} index={transition.planetIndex} mobile={window.innerWidth < 768} /></div>
          <div className="project-wormhole__atmosphere" />
          <ParticleStarfield className="project-wormhole__stars" />
        </div>
      )}
    </WormholeContext.Provider>
  );
}
