import createDustPointer, { pointerCoordinates } from "./DustPointer";
import { formationArrival, particleInteraction } from "./SupernovaFormation";

let originalMatchMedia;
let capability;
let canvas;
let pointer;
let wake;

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
  capability = { matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() };
  window.matchMedia = jest.fn(() => capability);
  canvas = document.createElement("canvas");
  canvas.getBoundingClientRect = () => ({ left: 100, top: 50, right: 900, bottom: 450, width: 800, height: 400 });
  wake = jest.fn();
  pointer = createDustPointer(canvas, wake);
  pointer.setEnabled(true);
});

afterEach(() => {
  pointer.dispose();
  window.matchMedia = originalMatchMedia;
  jest.restoreAllMocks();
});

function move(x, y, type = "mouse") {
  const event = new Event("pointermove", { cancelable: true });
  Object.assign(event, { clientX: x, clientY: y, pointerType: type });
  window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
}

function settle() {
  for (let i = 0; i < 180; i += 1) pointer.step(1 / 60);
}

test("screen proximity maps consistently at every depth and canvas aspect", () => {
  const output = { x: 0, y: 0 };
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const bounds = { left: 30, top: 60, width, height, right: 30 + width, bottom: 60 + height };
    const halfFovTangent = Math.tan(Math.PI / 8);
    // Points on the same camera ray must share a cursor hit regardless of z.
    for (const depth of [44, 52, 65]) {
      // Analytic perspective projection (45-degree FOV), without WebGL or a
      // renderer. Identical rays at different depths must hit the same pixels.
      const projected = {
        x: (depth * 0.1) / (depth * halfFovTangent * width / height),
        y: (depth * -0.08) / (depth * halfFovTangent),
      };
      const x = bounds.left + (projected.x + 1) * width / 2;
      const y = bounds.top + (1 - projected.y) * height / 2;
      expect(pointerCoordinates(x, y, bounds, output)).toBe(true);
      expect(output.x).toBeCloseTo(projected.x);
      expect(output.y).toBeCloseTo(projected.y);
    }
    expect(pointerCoordinates(bounds.left, bounds.top, bounds, output)).toBe(true);
    expect(output).toEqual({ x: -1, y: 1 });
    expect(pointerCoordinates(bounds.right, bounds.bottom, bounds, output)).toBe(true);
    expect(output).toEqual({ x: 1, y: -1 });
    expect(pointerCoordinates(bounds.right + 1, bounds.bottom, bounds, output)).toBe(false);
  }
});

test("maps canvas-local pixels to NDC and smooths movement without an idle render loop", () => {
  move(700, 150);
  expect(pointer.value).toEqual({ x: 0.5, y: 0.5, strength: 0 });
  expect(pointer.needsFrame()).toBe(true);
  pointer.step(1 / 60);
  expect(pointer.value.strength).toBeGreaterThan(0);
  expect(pointer.value.strength).toBeLessThan(1);
  settle();
  expect(pointer.needsFrame()).toBe(false);
  move(300, 350);
  pointer.step(1 / 60);
  expect(pointer.value.x).toBeGreaterThan(-0.5);
  expect(pointer.value.x).toBeLessThan(0.5);
  settle();
  expect(pointer.value).toEqual({ x: -0.5, y: -0.5, strength: 1 });
  expect(pointer.needsFrame()).toBe(false);
});

test("viewport exit decays influence, but moving between HTML controls does not", () => {
  move(500, 250);
  settle();
  const betweenControls = new Event("pointerout");
  Object.assign(betweenControls, { relatedTarget: document.createElement("button") });
  window.dispatchEvent(betweenControls);
  expect(pointer.needsFrame()).toBe(false);
  window.dispatchEvent(new Event("pointerout"));
  pointer.step(1 / 60);
  expect(pointer.value.strength).toBeGreaterThan(0);
  expect(pointer.value.strength).toBeLessThan(1);
  settle();
  expect(pointer.value.strength).toBe(0);
  expect(pointer.needsFrame()).toBe(false);
});

test("reduced-motion/lifecycle disable clears interaction immediately and ignores subsequent input", () => {
  move(500, 250);
  settle();
  pointer.setEnabled(false);
  wake.mockClear();
  move(700, 150);
  expect(wake).not.toHaveBeenCalled();
  expect(pointer.value.strength).toBe(0);
  expect(pointer.needsFrame()).toBe(false);
  pointer.setEnabled(true);
  move(700, 150);
  expect(pointer.needsFrame()).toBe(true);
});

test("a stationary pointer survives the handoff, completed nebula and reverse scroll", () => {
  move(700, 150);
  settle();
  const position = { ...pointer.value };
  for (const progress of [0.48, 0.55, 0.7, 0.72, 0.9, 1, 0.9, 0.72, 0.55]) {
    pointer.step(1 / 60);
    expect(pointer.value).toEqual(position);
    const strength = pointer.value.strength * particleInteraction(progress, formationArrival(progress, 0.5));
    if (progress > 0.48) expect(strength).toBeGreaterThan(0);
    else expect(strength).toBe(0);
  }
  expect(pointer.needsFrame()).toBe(false);
});

test("touch and coarse pointers never start hover interaction; capability loss and blur clear it", () => {
  move(500, 250, "touch");
  capability.matches = false;
  move(500, 250);
  expect(wake).not.toHaveBeenCalled();
  capability.matches = true;
  move(500, 250);
  settle();
  capability.matches = false;
  capability.addEventListener.mock.calls[0][1]();
  settle();
  expect(pointer.value.strength).toBe(0);
  capability.matches = true;
  move(500, 250);
  settle();
  window.dispatchEvent(new Event("blur"));
  settle();
  expect(pointer.value.strength).toBe(0);
});

test("out-of-canvas positions clear influence and disposal removes every listener", () => {
  move(500, 250);
  settle();
  move(950, 250);
  settle();
  expect(pointer.value.strength).toBe(0);
  const remove = jest.spyOn(window, "removeEventListener");
  pointer.dispose();
  expect(remove.mock.calls.map(([name]) => name)).toEqual(["pointermove", "pointerout", "blur"]);
  expect(capability.removeEventListener).toHaveBeenCalledWith("change", capability.addEventListener.mock.calls[0][1]);
  wake.mockClear();
  move(500, 250);
  expect(wake).not.toHaveBeenCalled();
  expect(pointer.needsFrame()).toBe(false);
});
