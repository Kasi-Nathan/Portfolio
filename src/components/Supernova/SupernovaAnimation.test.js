import { autonomousMotion, createActiveClock, observeSceneVisibility, shouldRenderContinuously } from "./SupernovaAnimation";

test("autonomous motion has a smooth bounded envelope independent of pointer strength", () => {
  expect(autonomousMotion(0.47, false)).toBe(0);
  expect(autonomousMotion(0.48, false)).toBe(0);
  expect(autonomousMotion(0.59, false)).toBeCloseTo(0.5);
  expect(autonomousMotion(0.7, false)).toBe(1);
  expect(autonomousMotion(0.96, false)).toBe(1);
  expect(autonomousMotion(0.72, true)).toBe(0);
});

test("continuous rendering remains active for dust and nebula, but pauses for lifecycle gates", () => {
  expect(shouldRenderContinuously(0.72)).toBe(true);
  expect(shouldRenderContinuously(0.96)).toBe(true);
  expect(shouldRenderContinuously(0.72, { visible: false })).toBe(false);
  expect(shouldRenderContinuously(0.72, { reducedMotion: true })).toBe(false);
  expect(shouldRenderContinuously(0.72, { contextLost: true })).toBe(false);
  expect(shouldRenderContinuously(0.72, { disposed: true })).toBe(false);
  expect(shouldRenderContinuously(0.3)).toBe(false);
});

test("active clock is deterministic, bounded, and pauses hidden elapsed time", () => {
  const clock = createActiveClock();
  clock.setRunning(true, 1000);
  expect(clock.sample(1100)).toBeCloseTo(0.1);
  clock.setRunning(false, 1250);
  expect(clock.sample(10000)).toBeCloseTo(0.2);
  clock.setRunning(true, 10000);
  expect(clock.sample(10100)).toBeCloseTo(0.3);
  clock.setRunning(false, 12000);
  expect(clock.sample(20000)).toBeCloseTo(0.4);
});

test("visibility observer pauses and resumes once, then cleans up", () => {
  const originalObserver = global.IntersectionObserver;
  const originalHidden = Object.getOwnPropertyDescriptor(document, "hidden");
  const observers = [];
  class MockIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
      this.disconnect = jest.fn();
      this.observe = jest.fn();
      observers.push(this);
    }
  }
  Object.defineProperty(global, "IntersectionObserver", { configurable: true, value: MockIntersectionObserver });
  Object.defineProperty(document, "hidden", { configurable: true, value: false });

  try {
    const target = document.createElement("div");
    const changed = jest.fn();
    const visibility = observeSceneVisibility(target, changed);
    expect(visibility.isVisible()).toBe(true);
    expect(observers[0].observe).toHaveBeenCalledWith(target);

    observers[0].callback([{ target, isIntersecting: false }]);
    expect(visibility.isVisible()).toBe(false);
    expect(changed).toHaveBeenLastCalledWith(false);

    observers[0].callback([{ target, isIntersecting: true }]);
    expect(visibility.isVisible()).toBe(true);
    expect(changed).toHaveBeenLastCalledWith(true);

    visibility.dispose();
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1);
    document.dispatchEvent(new Event("visibilitychange"));
    expect(changed).toHaveBeenCalledTimes(2);
  } finally {
    if (originalObserver === undefined) delete global.IntersectionObserver;
    else Object.defineProperty(global, "IntersectionObserver", { configurable: true, value: originalObserver });
    if (originalHidden) Object.defineProperty(document, "hidden", originalHidden);
    else delete document.hidden;
  }
});