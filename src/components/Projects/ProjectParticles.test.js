import React from "react";
import { render, screen } from "@testing-library/react";
import { createPlanetParticles, ParticlePlanet, ParticleStarfield } from "./ProjectParticles";

test("planet particles are deterministic, depth varied, and ringed where requested", () => {
  const first = createPlanetParticles("bone-disease-prediction", 260, true);
  const second = createPlanetParticles("bone-disease-prediction", 260, true);
  expect(first).toEqual(second);
  expect(first.body.length + first.rear.length + first.front.length).toBe(260);
  expect(first.rear.length).toBeGreaterThan(0);
  expect(first.front.length).toBeGreaterThan(0);
  expect(new Set(first.body.map(point => Math.round(point.opacity * 10))).size).toBeGreaterThan(3);
  expect(createPlanetParticles("bone-disease-prediction", 90, false).rear).toHaveLength(0);
});

test("mobile motif uses a smaller budget and stars remain a separate static layer", () => {
  render(<><ParticlePlanet identity="educational-chatbot" index={1} mobile /><ParticleStarfield /></>);
  expect(screen.getByTestId("particle-planet")).toHaveAttribute("data-particle-count", "90");
  expect(screen.getByTestId("particle-starfield")).toHaveAttribute("data-star-count", "76");
});
