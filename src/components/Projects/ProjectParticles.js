import React, { useId, useMemo } from "react";
import "./ProjectParticles.css";

function randomSource(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function seedFor(identity) {
  let seed = 2166136261;
  for (const character of identity) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619);
  return seed >>> 0;
}

// The intro uses a seeded sphere plus tilted ring bands, with front points
// brighter and rear ring points hidden by the projected disc. This smaller
// SVG motif keeps that geometry without mounting another WebGL renderer.
export function createPlanetParticles(identity, count, ringed) {
  const random = randomSource(seedFor(identity));
  const body = [];
  const rear = [];
  const front = [];
  const ringCount = ringed ? Math.round(count * 0.38) : 0;
  for (let index = 0; index < count - ringCount; index += 1) {
    const latitude = random() * 2 - 1;
    const longitude = random() * Math.PI * 2;
    const horizontal = Math.sqrt(1 - latitude * latitude);
    const depth = Math.sin(longitude) * horizontal;
    body.push({ x: 60 + Math.cos(longitude) * horizontal * 41, y: 60 + latitude * 41,
      r: (0.38 + random() * 0.62) * (0.7 + Math.max(0, depth) * 0.55),
      opacity: 0.18 + (depth + 1) * 0.35, color: index % 7 === 0 ? "light" : index % 3 === 0 ? "mid" : "pale" });
  }
  for (let index = 0; index < ringCount; index += 1) {
    const angle = random() * Math.PI * 2;
    const band = index % 3;
    const radius = 45 + band * 7 + random() * 2.8;
    const x = Math.cos(angle) * radius;
    const y = (Math.sin(angle) * 0.34 + Math.cos(angle) * 0.12) * radius;
    const depth = Math.sin(angle) * 0.58;
    const point = { x: 60 + x, y: 60 + y, r: 0.42 + random() * 0.58,
      opacity: (depth < 0 ? 0.26 : 0.48) + random() * 0.23,
      color: band === 1 ? "pale" : band === 2 ? "mid" : "light" };
    (depth < 0 ? rear : front).push(point);
  }
  return { body, rear, front };
}

function Points({ points }) {
  return points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={point.r} opacity={point.opacity} fill={`var(--particle-${point.color})`} />);
}

export function ParticlePlanet({ identity, index = 0, mobile = false }) {
  const gradientId = useId().replace(/:/g, "");
  const maskId = `${gradientId}-mask`;
  const ringed = index % 3 !== 2;
  const points = useMemo(() => createPlanetParticles(identity, mobile ? 90 : 260, ringed), [identity, mobile, ringed]);
  return <svg className="particle-planet" viewBox="0 0 120 120" aria-hidden="true" focusable="false" data-testid="particle-planet" data-particle-count={points.body.length + points.front.length + points.rear.length}>
    <defs>
      <radialGradient id={gradientId} cx="30%" cy="24%" r="75%"><stop stopColor="var(--particle-light)" stopOpacity=".44" /><stop offset=".5" stopColor="var(--particle-mid)" stopOpacity=".28" /><stop offset="1" stopColor="var(--particle-dark)" stopOpacity=".8" /></radialGradient>
      <mask id={maskId}><rect width="120" height="120" fill="white" /><circle cx="60" cy="60" r="41" fill="black" /></mask>
    </defs>
    <g className="particle-planet__rear" mask={`url(#${maskId})`}><Points points={points.rear} /></g>
    <circle className="particle-planet__body" cx="60" cy="60" r="41" fill={`url(#${gradientId})`} />
    <g className="particle-planet__surface"><Points points={points.body} /></g>
    <g className="particle-planet__front"><Points points={points.front} /></g>
  </svg>;
}

export function ParticleStarfield({ className = "" }) {
  const stars = useMemo(() => {
    const random = randomSource(0x51a7c0de);
    return Array.from({ length: 76 }, (_, index) => ({
      x: random() * 1000, y: random() * 700, r: index % 9 === 0 ? 1.25 : 0.45 + random() * 0.45,
      opacity: 0.22 + random() * 0.55,
    }));
  }, []);
  return <svg className={`particle-starfield ${className}`} viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" data-testid="particle-starfield" data-star-count={stars.length}>
    {stars.map((star, index) => <circle key={index} cx={star.x} cy={star.y} r={star.r} fill={index % 4 === 0 ? "#c6b3ed" : "#b9ddeb"} opacity={star.opacity} />)}
  </svg>;
}
