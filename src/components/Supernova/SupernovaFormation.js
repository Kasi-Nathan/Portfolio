// Shared by the GPU trajectories, haze visibility, and the static fallback.
export const FORMATION = Object.freeze({
  start: 0.735,
  startSpread: 0.035,
  end: 0.94,
  endSpread: 0.045,
  hazeStart: 0.9,
  hazeEnd: 1,
});

export const INTERACTION = Object.freeze({ start: 0.48, full: 0.7, nebulaStrength: 1.35 });

export const SCATTERING = Object.freeze({
  dustRadius: 0.18,
  nebulaRadius: 0.145,
  openingStart: 0.07,
  openingEnd: 0.24,
  swirlStart: 0.08,
  swirlPeak: 0.28,
  swirlEnd: 0.9,
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
