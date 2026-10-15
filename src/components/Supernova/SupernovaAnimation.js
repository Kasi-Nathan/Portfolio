import { INTERACTION } from "./SupernovaFormation";

export function autonomousMotion(progress, reducedMotion) {
  if (reducedMotion) return 0;
  const amount = Math.max(0, Math.min(1,
    (progress - INTERACTION.start) / (INTERACTION.full - INTERACTION.start)));
  return amount * amount * (3 - 2 * amount);
}

export function shouldRenderContinuously(progress, state = {}) {
  return !state.reducedMotion && state.visible !== false && !state.disposed && !state.contextLost &&
    autonomousMotion(progress, false) > 0;
}

// Advance only while rendering an active phase. Hidden time never produces a
// large shader-time jump on resume; no particle simulation lives on the CPU.
export function createActiveClock() {
  let running = false;
  let previous = 0;
  let elapsed = 0;
  function sample(now) {
    if (running) elapsed += Math.min(0.1, Math.max(0, (now - previous) / 1000));
    previous = now;
    return elapsed;
  }
  return {
    sample,
    setRunning(next, now) {
      if (running === next) return;
      sample(now);
      running = next;
    },
  };
}

export function observeSceneVisibility(target, changed) {
  let intersects = true;
  let disposed = false;
  let visible = !document.hidden;
  function update() {
    if (disposed) return;
    const next = intersects && !document.hidden;
    if (next !== visible) {
      visible = next;
      changed(next);
    }
  }
  const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target === target) intersects = entry.isIntersecting;
    }
    update();
  });
  observer?.observe(target);
  document.addEventListener("visibilitychange", update);
  return {
    isVisible: () => visible,
    dispose() {
      disposed = true;
      observer?.disconnect();
      document.removeEventListener("visibilitychange", update);
    },
  };
}
