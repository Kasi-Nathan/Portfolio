import { ambientStarBudget, createAmbientAttributes, createParticleAttributes, particleBudget, pixelRatioCap, shaderProgramsHealthy, travelAmount } from "./SupernovaScene";

// These pure compatibility helpers do not construct WebGL objects.
jest.mock("three", () => ({}));

test("planet density scales by viewport and CPU budget", () => {
  expect(particleBudget(390, 8)).toBe(7200);
  expect(particleBudget(767, 8)).toBe(7200);
  expect(particleBudget(768, 8)).toBe(10000);
  expect(particleBudget(991, 8)).toBe(10000);
  expect(particleBudget(992, 8)).toBe(16000);
  expect(particleBudget(1920, 4)).toBe(10000);
  expect(pixelRatioCap(768)).toBe(1.25);
  expect(pixelRatioCap(991)).toBe(1.25);
  expect(pixelRatioCap(992)).toBe(1.5);
});

test("ambient stars use an independent adaptive budget and travel is reversible", () => {
  expect(ambientStarBudget(390, 8)).toBe(2600);
  expect(ambientStarBudget(820, 8)).toBe(4200);
  expect(ambientStarBudget(1920, 8)).toBe(6800);
  expect(ambientStarBudget(1920, 4)).toBe(4200);
  expect(travelAmount(0)).toBe(0);
  expect(travelAmount(0.18)).toBe(0);
  expect(travelAmount(0.395)).toBeCloseTo(0.5);
  expect(travelAmount(0.61)).toBe(1);
  expect(travelAmount(0.3)).toBeLessThan(travelAmount(0.395));
});

test("ambient points cover the screen while formation points retain separate planet destinations", () => {
  const ambient = createAmbientAttributes(2400);
  const formation = createParticleAttributes(100);
  expect(ambient.coordinates).toHaveLength(7200);
  expect(formation.planetPositions).toHaveLength(400);
  expect(formation.galaxyData).toHaveLength(400);
  expect(formation.starPositions).toHaveLength(300);
  expect(ambient.coordinates).not.toBe(formation.starPositions);
  const xs = Array.from({ length: 2400 }, (_, index) => ambient.coordinates[index * 3]);
  const ys = Array.from({ length: 2400 }, (_, index) => ambient.coordinates[index * 3 + 1]);
  expect(Math.min(...xs)).toBeLessThan(-1);
  expect(Math.max(...xs)).toBeGreaterThan(1);
  expect(Math.min(...ys)).toBeLessThan(-1);
  expect(Math.max(...ys)).toBeGreaterThan(1);
  expect(Array.from({ length: 100 }, (_, index) => formation.planetPositions[index * 4 + 3])
    .filter(band => band > 0)).toHaveLength(40);
});

test("formation particles make wound spiral arms, a bright core, and a dispersed travel target", () => {
  const particles = createParticleAttributes(4000);
  let core = 0;
  let arms = 0;
  let aligned = 0;
  let forward = 0;
  let backward = 0;
  for (let index = 0; index < 4000; index += 1) {
    const kind = particles.galaxyData[index * 4 + 1];
    if (kind === 0) core += 1;
    if (kind === 1) {
      arms += 1;
      const x = particles.starPositions[index * 3];
      const y = particles.starPositions[index * 3 + 1];
      const radius = Math.hypot(x, y);
      const arm = particles.galaxyData[index * 4 + 2];
      const angle = Math.atan2(y, x);
      const offset = Math.atan2(Math.sin(angle - arm * Math.PI / 2 - radius * 0.48),
        Math.cos(angle - arm * Math.PI / 2 - radius * 0.48));
      if (Math.abs(offset) < 0.35) aligned += 1;
    }
    if (particles.starPositions[index * 3 + 2] > 0) forward += 1;
    else backward += 1;
  }
  expect(core).toBeGreaterThan(750);
  expect(arms).toBeGreaterThan(2500);
  expect(aligned / arms).toBeGreaterThan(0.9);
  expect(forward).toBeGreaterThan(1500);
  expect(backward).toBeGreaterThan(1500);
  expect(particles.dustPositions).not.toEqual(particles.starPositions);
});

test("only a confirmed failed shader link rejects the scene", () => {
  const warning = { getUniforms: jest.fn(), diagnostics: { runnable: true, programLog: "driver warning" } };
  const failed = { getUniforms: jest.fn(), diagnostics: { runnable: false } };
  expect(shaderProgramsHealthy([warning])).toBe(true);
  expect(warning.getUniforms).toHaveBeenCalledTimes(1);
  expect(shaderProgramsHealthy([failed])).toBe(false);
  expect(failed.getUniforms).toHaveBeenCalledTimes(1);
});
