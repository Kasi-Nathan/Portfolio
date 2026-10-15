import { particleBudget, pixelRatioCap, shaderProgramsHealthy } from "./SupernovaScene";

// These pure compatibility helpers do not construct WebGL objects.
jest.mock("three", () => ({}));

test("mobile and tablet GPU limits preserve the desktop budget", () => {
  expect(particleBudget(390, 8)).toBe(6200);
  expect(particleBudget(767, 8)).toBe(6200);
  expect(particleBudget(768, 8)).toBe(8500);
  expect(particleBudget(991, 8)).toBe(8500);
  expect(particleBudget(992, 8)).toBe(14000);
  expect(particleBudget(1920, 4)).toBe(8500);
  expect(pixelRatioCap(768)).toBe(1.25);
  expect(pixelRatioCap(991)).toBe(1.25);
  expect(pixelRatioCap(992)).toBe(1.5);
});

test("only a confirmed failed shader link rejects the scene", () => {
  const warning = { getUniforms: jest.fn(), diagnostics: { runnable: true, programLog: "driver warning" } };
  const failed = { getUniforms: jest.fn(), diagnostics: { runnable: false } };
  expect(shaderProgramsHealthy([warning])).toBe(true);
  expect(warning.getUniforms).toHaveBeenCalledTimes(1);
  expect(shaderProgramsHealthy([failed])).toBe(false);
  expect(failed.getUniforms).toHaveBeenCalledTimes(1);
});
