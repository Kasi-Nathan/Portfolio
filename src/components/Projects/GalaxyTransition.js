import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ParticlePlanet, ParticleStarfield } from "./ProjectParticles";
import "./GalaxyTransition.css";

const GalaxyContext = createContext({ travelToGalaxy: () => false, isTransitioning: false });
export const useGalaxyTransition = () => useContext(GalaxyContext);

export function GalaxyTransitionProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState(null);
  const pending = useRef(false);
  const timers = useRef([]);
  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    pending.current = false;
    setPhase(null);
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", clear);
    return () => window.removeEventListener("popstate", clear);
  }, [clear]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (!pending.current || location.pathname !== "/project") return;
    window.scrollTo(0, 0);
    const frame = window.requestAnimationFrame(() => document.getElementById("galaxy-title")?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname]);

  const travelToGalaxy = useCallback(() => {
    if (pending.current) return false;
    pending.current = true;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      navigate("/project");
      timers.current.push(setTimeout(clear, 50));
      return true;
    }
    setPhase("start");
    timers.current.push(setTimeout(() => setPhase("contract"), 16));
    timers.current.push(setTimeout(() => setPhase("flight"), 170));
    timers.current.push(setTimeout(() => {
      if (!pending.current) return;
      navigate("/project");
      setPhase("reveal");
    }, 580));
    timers.current.push(setTimeout(clear, 1080));
    return true;
  }, [clear, navigate]);

  return <GalaxyContext.Provider value={{ travelToGalaxy, isTransitioning: phase !== null || pending.current }}>
    {children}
    {phase && <div className={`galaxy-travel galaxy-travel--${phase}`} aria-hidden="true" data-testid="galaxy-travel"><span className="galaxy-travel__core" /><span className="galaxy-travel__cluster"><ParticlePlanet identity="galaxy-entry" mobile={window.innerWidth < 768} /></span><ParticleStarfield className="galaxy-travel__stars" /></div>}
  </GalaxyContext.Provider>;
}
