import { FORMATION, INTERACTION, SCATTERING, formationArrival, formationHaze, particleInteraction, scatteringInfluence, scatteringRadius, scatteringSwirl } from "./SupernovaFormation";
import { finaleAmount, finaleProgress } from "./SupernovaHome";

test("interaction fades in after ignition and stays continuous through dust and nebula boundaries", () => {
  for (const progress of [0, 0.17, 0.295, 0.455, INTERACTION.start]) {
    expect(particleInteraction(progress)).toBe(0);
  }
  expect(particleInteraction(0.55)).toBeGreaterThan(0);
  expect(particleInteraction(0.65)).toBeGreaterThan(particleInteraction(0.55));
  for (const seed of [0, 0.5, 1]) {
    const strength = p => particleInteraction(p, formationArrival(p, seed));
    for (const boundary of [0.58, 0.7, 0.72, FORMATION.start, 0.9, 1]) {
      expect(strength(boundary)).toBeGreaterThan(0);
      expect(Math.abs(strength(boundary - 0.00001) - strength(boundary + 0.00001))).toBeLessThan(0.001);
    }
    expect(strength(0.72)).toBe(1);
    expect(strength(1)).toBeCloseTo(INTERACTION.nebulaStrength);
    expect(strength(1)).toBeGreaterThan(strength(0.72));
    const phases = [0.48, 0.55, 0.7, 0.72, 0.8, 0.95, 1];
    expect([...phases].reverse().map(strength)).toEqual(phases.map(strength).reverse());
  }
});

test("pointer scattering is localized, smoothly falls off, and tightens in the nebula", () => {
  const middleRadius = scatteringRadius(0);
  const nebulaRadius = scatteringRadius(1);
  expect(nebulaRadius).toBeLessThan(middleRadius);
  expect(middleRadius).toBe(SCATTERING.dustRadius);
  expect(nebulaRadius).toBe(SCATTERING.nebulaRadius);

  const distances = [0, middleRadius * 0.25, middleRadius * 0.55, middleRadius, middleRadius * 1.5];
  const influences = distances.map((distance) => scatteringInfluence(distance, 0));
  expect(influences[0]).toBe(1);
  expect(influences[1]).toBe(1);
  expect(influences[2]).toBeGreaterThan(influences[3]);
  expect(influences[3]).toBe(0);
  expect(influences[4]).toBe(0);

  expect(scatteringSwirl(0, 1)).toBe(0);
  expect(scatteringSwirl(nebulaRadius * 0.5, 1)).toBeGreaterThan(0);
  expect(scatteringSwirl(nebulaRadius, 1)).toBe(0);
});

test("dust stays unassembled before contact and arrivals stagger before haze", () => {
  for (const seed of [0, 0.25, 0.5, 0.75, 1]) {
    expect(formationArrival(0.72, seed)).toBe(0);
    expect(formationArrival(FORMATION.hazeStart, seed)).toBeGreaterThan(0.65);
    expect(formationArrival(1, seed)).toBe(1);
  }
  expect(formationArrival(0.8, 0)).toBeGreaterThan(formationArrival(0.8, 1));
  expect(formationHaze(0.89)).toBe(0);
  expect(formationHaze(0.9)).toBe(0);
  expect(formationHaze(0.95)).toBeCloseTo(0.5);
  expect(formationHaze(1)).toBe(1);
});

test("measured contact travel reveals particles first and reverses without history", () => {
  const progress = scroll => finaleProgress(0.72, finaleAmount(scroll, 800, 4000, 4800, 800, 4100), false);
  const forward = [3320, 3500, 3660, 3850, 4000].map(scroll => [
    formationArrival(progress(scroll), 0.5), formationHaze(progress(scroll)),
  ]);
  expect(forward[0]).toEqual([0, 0]);
  expect(forward[1][0]).toBeGreaterThan(0);
  expect(forward[2][0]).toBeGreaterThan(forward[1][0]);
  expect(forward[2][1]).toBe(0);
  expect(forward[4]).toEqual([1, 1]);
  expect([4000, 3850, 3660, 3500, 3320].map(scroll => [
    formationArrival(progress(scroll), 0.5), formationHaze(progress(scroll)),
  ])).toEqual([...forward].reverse());
});
