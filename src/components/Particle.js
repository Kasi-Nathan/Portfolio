import React from "react";
import { useLocation } from "react-router-dom";
import "./Particle.css";
export default function Particle() {
  const { pathname } = useLocation();
  return <div className={`space-background${pathname === "/" ? " space-background--supernova" : ""}`} aria-hidden="true"><div className="space-nebula" /><div className="space-stars space-stars-far" /><div className="space-stars space-stars-near" /></div>;
}
