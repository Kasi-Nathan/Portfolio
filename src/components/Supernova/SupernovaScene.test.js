import { ambientStarBudget, cameraAim, cameraJourney, createAmbientAttributes, createGalaxyRibbonAttributes, createParticleAttributes, particleBudget, pixelRatioCap, shaderProgramsHealthy, travelAmount } from "./SupernovaScene";

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
  expect(travelAmount(0.29)).toBe(0);
  expect(travelAmount(0.4325)).toBeCloseTo(0.5);
  expect(travelAmount(0.575)).toBe(1);
  expect(travelAmount(0.36)).toBeLessThan(travelAmount(0.4325));
});

test("camera follows a bounded forward path with smooth departure, arrival, and exact reverse", () => {
  const checkpoints = [0, 0.105, 0.18, 0.3, 0.45, 0.6, 0.645, 0.72];
  const forward = checkpoints.map(progress => cameraJourney(progress));
  expect(forward[0]).toEqual({ x: 0, y: 0, z: 38 });
  expect(forward[1]).toEqual(forward[0]);
  expect(forward[6].z).toBeCloseTo(-95);
  expect(forward[7].z).toBeCloseTo(-95);
  expect(forward[6].x).toBeCloseTo(0);
  expect(forward[6].y).toBeCloseTo(0);
  for (let index = 2; index < forward.length; index += 1) {
    expect(forward[index].z).toBeLessThanOrEqual(forward[index - 1].z);
  }
  expect(checkpoints.slice().reverse().map(progress => cameraJourney(progress))).toEqual(forward.slice().reverse());
  const reusable = { x: 0, y: 0, z: 0 };
  expect(cameraJourney(0.45, reusable)).toBe(reusable);
});

test("approach enters an outer arm obliquely and rejoins the travel corridor", () => {
  expect(cameraAim(0)).toEqual({ x: 0, y: 0 });
  expect(cameraJourney(0.27).x).toBeLessThan(-9);
  expect(cameraJourney(0.27).y).toBeLessThan(-5);
  expect(cameraAim(0.27).x).toBeGreaterThan(3);
  expect(cameraAim(0.27).y).toBeGreaterThan(1);
  expect(cameraAim(0.47)).toEqual({ x: 0, y: 0 });
  expect(cameraAim(0.645)).toEqual({ x: 0, y: 0 });
  expect(cameraJourney(0.47).z).toBeLessThan(cameraJourney(0.27).z);
  const checkpoints = [0.1, 0.16, 0.22, 0.27, 0.34, 0.4, 0.47];
  expect(checkpoints.slice().reverse().map(progress => cameraJourney(progress)))
    .toEqual(checkpoints.map(progress => cameraJourney(progress)).reverse());
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

test("continuous arm ribbons keep four spirals on multiple physical depth layers", () => {
  const ribbons = createGalaxyRibbonAttributes(12, 3);
  expect(ribbons.positions).toHaveLength(4 * 3 * 12 * 6 * 3);
  expect(ribbons.coordinates).toHaveLength(4 * 3 * 12 * 6 * 2);
  expect(new Set(ribbons.armIds)).toEqual(new Set([0, 1, 2, 3]));
  const layerSize = 4 * 12 * 6 * 3;
  expect(ribbons.positions[layerSize + 2]).toBeGreaterThan(ribbons.positions[2]);
  expect(ribbons.positions[layerSize * 2 + 2]).toBeGreaterThan(ribbons.positions[layerSize + 2]);
  expect(createGalaxyRibbonAttributes(12, 2).positions.length).toBeLessThan(ribbons.positions.length);
});

test("formation particles make wound spiral arms, a bright core, and a dispersed travel target", () => {
  const particles = createParticleAttributes(4000);
  let core = 0;
  let arms = 0;
  let luminousLayers = 0;
  let dustLanes = 0;
  let innerCore = 0;
  let aligned = 0;
  let forward = 0;
  let backward = 0;
  let thickArms = 0;
  for (let index = 0; index < 4000; index += 1) {
    const kind = particles.galaxyData[index * 4 + 1];
    if (kind === 0) {
      core += 1;
      if (Math.hypot(particles.starPositions[index * 3], particles.starPositions[index * 3 + 1]) < 1) innerCore += 1;
    }
    if (kind === 3) luminousLayers += 1;
    if (kind === 1) {
      arms += 1;
      if (particles.galaxyData[index * 4 + 3] < 0.2) dustLanes += 1;
      const x = particles.starPositions[index * 3];
      const y = particles.starPositions[index * 3 + 1];
      const radius = Math.hypot(x, y);
      const arm = particles.galaxyData[index * 4 + 2];
      const angle = Math.atan2(y, x);
      const offset = Math.atan2(Math.sin(angle - arm * Math.PI / 2 - radius * 0.48),
        Math.cos(angle - arm * Math.PI / 2 - radius * 0.48));
      if (Math.abs(offset) < 0.35) aligned += 1;
      if (Math.abs(particles.starPositions[index * 3 + 2]) > 2) thickArms += 1;
    }
    if (particles.starPositions[index * 3 + 2] > 0) forward += 1;
    else backward += 1;
  }
  expect(core).toBeGreaterThan(750);
  expect(innerCore).toBeGreaterThan(100);
  expect(arms).toBeGreaterThan(2500);
  expect(luminousLayers).toBeGreaterThan(80);
  expect(dustLanes).toBeGreaterThan(100);
  expect(aligned / arms).toBeGreaterThan(0.9);
  expect(thickArms).toBeGreaterThan(100);
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
