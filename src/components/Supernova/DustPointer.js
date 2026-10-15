// CSS pixels and canvas bounds map to NDC independently of DPR and world depth.
export function pointerCoordinates(clientX, clientY, bounds, output) {
  if (!bounds.width || !bounds.height || clientX < bounds.left || clientX > bounds.right ||
      clientY < bounds.top || clientY > bounds.bottom) return false;
  output.x = (clientX - bounds.left) / bounds.width * 2 - 1;
  output.y = 1 - (clientY - bounds.top) / bounds.height * 2;
  return true;
}

// A single smoothed pointer shared by all GPU particles. No React updates or
// particle buffers are involved; the scene owns the requestAnimationFrame loop.
export default function createDustPointer(canvas, wake) {
  const capability = window.matchMedia?.("(hover: hover) and (pointer: fine)");
  const value = { x: 0, y: 0, strength: 0 };
  let enabled = false;
  let disposed = false;
  let positioned = false;
  let targetX = 0;
  let targetY = 0;
  let targetStrength = 0;
  const coordinates = { x: 0, y: 0 };

  function clear() {
    if (!targetStrength) return;
    targetStrength = 0;
    wake();
  }

  function move(event) {
    if (disposed || !enabled || !capability?.matches || event.pointerType !== "mouse") return;
    const bounds = canvas.getBoundingClientRect();
    if (!pointerCoordinates(event.clientX, event.clientY, bounds, coordinates)) {
      clear();
      return;
    }
    targetX = coordinates.x;
    targetY = coordinates.y;
    if (!positioned || value.strength === 0) {
      value.x = targetX;
      value.y = targetY;
      positioned = true;
    }
    targetStrength = 1;
    wake();
  }

  function leave(event) {
    if (!event.relatedTarget) clear();
  }

  function capabilityChanged() {
    if (!capability.matches) clear();
  }

  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerout", leave, { passive: true });
  window.addEventListener("blur", clear);
  if (capability?.addEventListener) capability.addEventListener("change", capabilityChanged);
  else capability?.addListener(capabilityChanged);

  return {
    value,
    clear,
    setEnabled(next) {
      enabled = next && !disposed;
      if (!enabled) {
        value.strength = targetStrength = 0;
        positioned = false;
      }
    },
    needsFrame() {
      return enabled && (Math.abs(value.strength - targetStrength) > 0.001 ||
        (targetStrength > 0 && (Math.abs(value.x - targetX) + Math.abs(value.y - targetY) > 0.0001)));
    },
    step(seconds) {
      const follow = 1 - Math.exp(-Math.min(seconds, 0.05) * 24);
      const fade = 1 - Math.exp(-Math.min(seconds, 0.05) * (targetStrength ? 12 : 7));
      value.x += (targetX - value.x) * follow;
      value.y += (targetY - value.y) * follow;
      value.strength += (targetStrength - value.strength) * fade;
      if (Math.abs(value.strength - targetStrength) <= 0.001) value.strength = targetStrength;
      if (Math.abs(value.x - targetX) + Math.abs(value.y - targetY) <= 0.0001) {
        value.x = targetX;
        value.y = targetY;
      }
    },
    dispose() {
      disposed = true;
      enabled = false;
      value.strength = targetStrength = 0;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", clear);
      if (capability?.removeEventListener) capability.removeEventListener("change", capabilityChanged);
      else capability?.removeListener(capabilityChanged);
    },
  };
}
