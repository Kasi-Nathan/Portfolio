// Shared by the GPU trajectories, haze visibility, and the static fallback.
export const FORMATION = Object.freeze({
  start: 0.735,
  startSpread: 0.035,
  end: 0.94,
  endSpread: 0.045,
  hazeStart: 0.9,
  hazeEnd: 1,
});

export const SUPERNOVA_PHASES = Object.freeze({
  stable: Object.freeze({ start: 0, end: 0.14 }),
  instability: Object.freeze({ start: 0.08, end: 0.23 }),
  collapse: Object.freeze({ start: 0.17, end: 0.315 }),
  ignition: Object.freeze({ start: 0.275, end: 0.455 }),
  ejecta: Object.freeze({ start: 0.265, end: 0.52 }),
  dispersal: Object.freeze({ start: 0.42, end: 0.7 }),
  dust: Object.freeze({ start: 0.58, end: 0.86 }),
  nebula: Object.freeze({ start: FORMATION.start, end: 1 }),
});

export const INTERACTION = Object.freeze({ start: 0.48, full: 0.7, nebulaStrength: 1.35 });

export const SCATTERING = Object.freeze({
  dustRadius: 0.22,
  nebulaRadius: 0.17,
  openingStart: 0.35,
  openingEnd: 0.24,
  swirlStart: 0.12,
  swirlPeak: 0.38,
  swirlEnd: 0.88,
});

function smooth(start, end, value) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

export function formationArrival(progress, seed) {
  return smooth(FORMATION.start + seed * FORMATION.startSpread,
    FORMATION.end + seed * FORMATION.endSpread, progress);
}

export function formationHaze(progress) {
  return smooth(FORMATION.hazeStart, FORMATION.hazeEnd, progress);
}

export function particleInteraction(progress, arrival = 0) {
  return smooth(INTERACTION.start, INTERACTION.full, progress) *
    (1 - (1 - INTERACTION.nebulaStrength) * arrival);
}

export function scatteringRadius(arrival = 0) {
  return SCATTERING.dustRadius + (SCATTERING.nebulaRadius - SCATTERING.dustRadius) *
    Math.max(0, Math.min(1, arrival));
}

export function scatteringInfluence(distance, arrival = 0) {
  const radius = scatteringRadius(arrival);
  return 1 - smooth(radius * SCATTERING.openingStart, radius, distance);
}

export function scatteringSwirl(distance, arrival = 0) {
  const radius = scatteringRadius(arrival);
  return smooth(radius * SCATTERING.swirlStart, radius * SCATTERING.swirlPeak, distance) *
    (1 - smooth(radius * SCATTERING.swirlPeak, radius * SCATTERING.swirlEnd, distance));
}
