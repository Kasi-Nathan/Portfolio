import * as THREE from "three";
import createDustPointer from "./DustPointer";
import { FORMATION, INTERACTION, SCATTERING, formationHaze, particleInteraction } from "./SupernovaFormation";
import { autonomousMotion, createActiveClock, observeSceneVisibility, shouldRenderContinuously } from "./SupernovaAnimation";

export const SUPERNOVA_THRESHOLDS = Object.freeze({
  star: 0.17,
  supernova: 0.43,
  nebula: 0.78,
});

// These ranges intentionally overlap. Every visual state is derived from scroll
// progress, so the complete sequence can be scrubbed in either direction.
export const SUPERNOVA_PHASES = Object.freeze({
  stable: Object.freeze({ start: 0, end: 0.14 }),
  instability: Object.freeze({ start: 0.08, end: 0.23 }),
  collapse: Object.freeze({ start: 0.17, end: 0.315 }),
  ignition: Object.freeze({ start: 0.275, end: 0.455 }),
  ejecta: Object.freeze({ start: 0.265, end: 0.52 }),
  dispersal: Object.freeze({ start: 0.42, end: 0.7 }),
  dust: Object.freeze({ start: 0.58, end: 0.86 }),
  nebula: Object.freeze({ start: FORMATION.start, end: 1 }),
});

export function particleBudget(width, hardwareThreads = 8) {
  return width < 768 ? 6200 : width <= 991 || hardwareThreads <= 4 ? 8500 : 14000;
}

export function pixelRatioCap(width) {
  return width <= 991 ? 1.25 : 1.5;
}

export function shaderProgramsHealthy(programs = []) {
  for (const program of programs) {
    // getUniforms triggers Three.js' deferred link-status diagnostics.
    program.getUniforms();
    if (program.diagnostics?.runnable === false) return false;
  }
  return true;
}

function createRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomNormal(random) {
  const first = Math.max(random(), 0.0001);
  const second = random();
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(Math.PI * 2 * second);
}

function smoothPhase(start, end, progress) {
  const value = THREE.MathUtils.clamp((progress - start) / Math.max(0.0001, end - start), 0, 1);
  return value * value * (3 - 2 * value);
}

function createParticleAttributes(count) {
  const random = createRandom(0x51a7c0de);
  const starPositions = new Float32Array(count * 3);
  const dustPositions = new Float32Array(count * 3);
  const nebulaPositions = new Float32Array(count * 3);
  const ejectaPositions = new Float32Array(count * 3);
  const ejectaData = new Float32Array(count * 4);
  const turbulence = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const filamentAngles = [0.12, 1.53, 2.58, 4.08, 5.3];
  const filamentReach = [1.13, 0.84, 1.22, 0.78, 1.04];
  const nebulaLobes = [
    { x: -6.5, y: 1.5, z: -5, width: 4.4, height: 2.5, depth: 3.7, tilt: -0.24 },
    { x: 2.1, y: -1.4, z: 1.5, width: 5.2, height: 3.1, depth: 4.3, tilt: 0.34 },
    { x: 8, y: 2.2, z: -4, width: 3.2, height: 1.9, depth: 3.1, tilt: -0.5 },
  ];

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const directionY = random() * 2 - 1;
    const directionAngle = random() * Math.PI * 2;
    const directionRadius = Math.sqrt(1 - directionY * directionY);
    const starRadius = Math.cbrt(random()) * 0.78;
    const dustAngle = random() * Math.PI * 2;
    const dustBand = Math.floor(random() * 3);
    const dustRadius = random() < 0.78
      ? 0.52 + Math.sqrt(random()) * 0.46
      : 0.12 + Math.sqrt(random()) * 0.62;

    const directionX = Math.cos(directionAngle) * directionRadius;
    const directionZ = Math.sin(directionAngle) * directionRadius;
    const ejectaClass = random() < 0.18 ? 0 : random() < 0.59 ? 1 : 2;
    const filament = Math.floor(random() * 5);
    const filamentAngle = random() < 0.78
      ? filamentAngles[filament] + randomNormal(random) * 0.36
      : directionAngle;
    const launchSpeed = (ejectaClass === 0 ? 1.3 : ejectaClass === 1 ? 0.76 : 1.05) * (0.82 + random() * 0.43);
    const launchDistance = (7 + Math.pow(random(), 0.65) * 12) * launchSpeed * filamentReach[filament];
    const depth = ejectaClass === 0
      ? 0.35 + random() * 0.5
      : (random() * 2 - 1) * 0.52;

    starPositions[offset] = directionX * starRadius;
    starPositions[offset + 1] = directionY * starRadius;
    starPositions[offset + 2] = directionZ * starRadius;

    dustPositions[offset + 2] = -6 - dustBand * 6 - random() * 3.5;

    ejectaPositions[offset] = Math.cos(filamentAngle) * launchDistance + directionX * 2.1;
    ejectaPositions[offset + 1] = Math.sin(filamentAngle) * launchDistance * 0.72 + directionY * 2.5;
    ejectaPositions[offset + 2] = depth * launchDistance + directionZ * 1.8;
    // Retain each plume's azimuth as it recedes instead of crossing the core
    // toward an unrelated dust destination. No new random samples or identities.
    const dustDirection = Math.atan2(ejectaPositions[offset + 1] / 0.72, ejectaPositions[offset])
      + (dustAngle - Math.PI) * 0.12;
    dustPositions[offset] = Math.cos(dustDirection) * dustRadius * 22;
    dustPositions[offset + 1] = Math.sin(dustDirection) * dustRadius * 12.5;
    ejectaData[index * 4] = (ejectaClass === 0 ? 0 : ejectaClass === 1 ? 0.028 : 0.012) + random() * 0.045;
    ejectaData[index * 4 + 1] = launchSpeed;
    ejectaData[index * 4 + 2] = ejectaClass;
    ejectaData[index * 4 + 3] = filament / 5;
    turbulence[offset] = random() * Math.PI * 2;
    turbulence[offset + 1] = random() * Math.PI * 2;
    turbulence[offset + 2] = 0.35 + random() * 0.9;

    const cloudChoice = random();
    const lobe = nebulaLobes[cloudChoice < 0.46 ? 0 : cloudChoice < 0.83 ? 1 : 2];
    const cloudKind = random();
    const spread = cloudKind < 0.14 ? 0.34 : cloudKind > 0.88 ? 1.65 : 1;
    const along = Math.max(-2.4, Math.min(2.4, randomNormal(random))) * lobe.width * spread;
    const across = Math.max(-2.4, Math.min(2.4, randomNormal(random))) * lobe.height * spread;
    const cosine = Math.cos(lobe.tilt);
    const sine = Math.sin(lobe.tilt);
    let cloudX = lobe.x + along * cosine - across * sine;
    let cloudY = lobe.y + along * sine + across * cosine + Math.sin(along * 0.45) * 0.75;
    let cloudZ = lobe.z + randomNormal(random) * lobe.depth * spread + Math.sin(cloudX * 0.35) * 1.2;

    if (random() < 0.16) {
      const filamentProgress = random();
      const upperFilament = random() < 0.55;
      cloudX = (upperFilament ? -11 : -5) + filamentProgress * (upperFilament ? 20 : 18);
      cloudY = (upperFilament ? 3.3 - filamentProgress * 4.5 : -3.2 + filamentProgress * 5.3)
        + Math.sin(filamentProgress * Math.PI * 2.2) * 1.15 + randomNormal(random) * 0.55;
      cloudZ = (upperFilament ? -4 : 2) + filamentProgress * 2.5 + randomNormal(random) * 1.8;
    }

    const laneY = -0.4 + Math.sin(cloudX * 0.48) * 0.75;
    if (cloudX > -5 && cloudX < 10 && Math.abs(cloudY - laneY) < 0.85 && random() < 0.84) {
      cloudY += (cloudY > laneY ? 1 : -1) * (0.85 + random() * 0.8);
    }
    nebulaPositions[offset] = cloudX;
    nebulaPositions[offset + 1] = cloudY;
    nebulaPositions[offset + 2] = cloudZ;

    sizes[index] = 1.1 + random() * 3.8;
    seeds[index] = random();
  }

  return { starPositions, dustPositions, nebulaPositions, ejectaPositions, ejectaData, turbulence, sizes, seeds };
}

const particleVertexShader = `
  attribute vec3 aDustPosition;
  attribute vec3 aNebulaPosition;
  attribute vec3 aEjectaPosition;
  attribute vec4 aEjectaData;
  attribute vec3 aTurbulence;
  attribute float aPointSize;
  attribute float aSeed;

  uniform float uProgress;
  uniform float uPixelRatio;
  uniform vec3 uSourceScale;
  uniform float uSourceY;
  uniform vec3 uNebulaScale;
  uniform vec2 uNebulaCenter;
  uniform vec3 uPointer;
  uniform float uInteraction;
  uniform float uViewportAspect;
  uniform float uMotionTime;
  uniform float uMotionAmount;
  uniform vec2 uMotionProfile;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vHaloStrength;

  void main() {
    float launchStart = 0.265 + aEjectaData.x;
    float launch = smoothstep(launchStart, launchStart + 0.115 / aEjectaData.y, uProgress);
    float ejecta = smoothstep(0.265, 0.36, uProgress);
    float tracer = (1.0 - step(0.5, aEjectaData.z)) * smoothstep(0.55, 0.8, aSeed);
    float surge = smoothstep(0.3, 0.41, uProgress) * (1.0 - smoothstep(0.47, 0.58, uProgress));
    float retreat = smoothstep(0.41, 0.69, uProgress);
    float settle = smoothstep(0.48 + tracer * 0.045, 0.7, uProgress);
    float nebulaArrival = smoothstep(${FORMATION.start} + aSeed * ${FORMATION.startSpread}, ${FORMATION.end} + aSeed * ${FORMATION.endSpread}, uProgress);
    float ignition = exp(-pow((uProgress - 0.295) * 42.0, 2.0));
    float burst = launch * (1.0 - settle);

    vec3 source = position * uSourceScale + vec3(0.0, uSourceY, 0.0);
    vec3 particlePosition = mix(source, aEjectaPosition, launch);
    vec3 path = normalize(aEjectaPosition + vec3(0.001));
    vec3 swirl = vec3(-path.y, path.x, 0.25 * sin(aTurbulence.x));
    float filamentWave = sin(launch * 8.0 + aTurbulence.x + aEjectaData.w * 6.28318);
    particlePosition += swirl * filamentWave * aTurbulence.z * burst * 1.45;
    particlePosition.z += sin(launch * 5.0 + aTurbulence.y) * aTurbulence.z * burst * 1.15;
    particlePosition += path * surge * burst * (aEjectaData.z < 0.5 ? 5.5 : 2.0) * aTurbulence.z;
    // Keep approaching shards in front of the near plane without a hard clamp.
    particlePosition.z /= 1.0 + abs(particlePosition.z) / 40.0;
    particlePosition = mix(particlePosition, aDustPosition, settle);
    particlePosition.z -= retreat * (1.0 - settle) * (2.0 + aSeed * 3.0);

    float drift = sin(uProgress * 5.0 + aSeed * 6.28318) * 0.055;
    particlePosition += normalize(particlePosition + vec3(0.001)) * drift * (1.0 - burst);

    vec4 viewPosition = modelViewMatrix * vec4(particlePosition, 1.0);
    if (nebulaArrival > 0.0) {
      vec4 destination = modelViewMatrix * vec4(aNebulaPosition * uNebulaScale, 1.0);
      destination.z = min(destination.z, -18.0);
      vec4 projectedDestination = projectionMatrix * destination;
      vec2 targetNdc = projectedDestination.xy / projectedDestination.w + uNebulaCenter;
      // Compress only outer outliers into a soft screen boundary. Unlike a
      // hard clamp, this does not pile particles into straight edge lines.
      vec2 excess = max(abs(targetNdc) - vec2(0.8), vec2(0.0));
      targetNdc = sign(targetNdc) * (min(abs(targetNdc), vec2(0.8)) + (1.0 - exp(-excess / 0.14)) * 0.14);
      destination.xy = targetNdc * (-destination.z) / vec2(projectionMatrix[0][0], projectionMatrix[1][1]);
      vec2 travel = destination.xy - viewPosition.xy;
      vec2 bend = vec2(-travel.y, travel.x) * (0.07 + aEjectaData.w * 0.09);
      viewPosition = mix(viewPosition, destination, nebulaArrival);
      viewPosition.xy += bend * sin(nebulaArrival * 3.14159265);
    }
    // Bounded local movement, after the scroll path and before pointer hit
    // testing. Different seeds/frequencies avoid a rigid or synchronized cloud.
    float flowTime = uMotionTime * uMotionProfile.x;
    float phase = aTurbulence.x + aSeed * 6.283185;
    float slowFlow = flowTime * (0.16 + aSeed * 0.13);
    float crossFlow = flowTime * (0.11 + aTurbulence.z * 0.09);
    vec3 dustFlow = vec3(
      sin(slowFlow + phase) * 0.36 + cos(crossFlow * 1.37 + aTurbulence.y) * 0.13,
      cos(slowFlow * 0.83 + aTurbulence.y) * 0.28 + sin(crossFlow + phase) * 0.12,
      sin(crossFlow * 0.71 + phase) * 0.18
    );
    // Flow mainly along the established curved lanes, with very little
    // cross-lane movement so bright knots and dark channels remain coherent.
    float laneSlope = 0.36 * cos(aNebulaPosition.x * 0.48);
    vec2 tangent = normalize(vec2(1.0, laneSlope));
    float circulation = sin(slowFlow * 0.68 + phase) * 0.24;
    float breathing = sin(crossFlow * 0.53 + aTurbulence.y);
    vec3 cloudFlow = vec3(tangent * circulation + vec2(-tangent.y, tangent.x) * breathing * 0.035,
      cos(crossFlow + phase) * 0.08);
    viewPosition.xyz += mix(dustFlow, cloudFlow, nebulaArrival) * uMotionAmount * uMotionProfile.y;

    // Work in projected, aspect-correct coordinates so interaction follows
    // the canvas and camera view offset, including the finale's framing.
    // Apply only a temporary view-space offset after deterministic positions.
    // Fade in during dispersal, then retain a subtle response after arrival.
    // Pointer state itself survives every scroll phase, including reversal.
    float interaction = uInteraction * uPointer.z;
    interaction *= mix(1.0, ${INTERACTION.nebulaStrength}, nebulaArrival);
    if (interaction > 0.0) {
      vec4 projected = projectionMatrix * viewPosition;
      vec2 delta = (projected.xy / projected.w - uPointer.xy) * vec2(uViewportAspect, 1.0);
      float distanceToPointer = length(delta);
      vec2 outward = distanceToPointer > 0.0001 ? delta / distanceToPointer : vec2(cos(aTurbulence.x), sin(aTurbulence.x));
      // Keep the active area local. Nebula particles use a tighter opening,
      // with a seeded tangential band around the radial push.
      float scatterRadius = mix(${SCATTERING.dustRadius}, ${SCATTERING.nebulaRadius}, nebulaArrival);
      float influence = 1.0 - smoothstep(scatterRadius * ${SCATTERING.openingStart}, scatterRadius, distanceToPointer);
      float swirlBand = smoothstep(scatterRadius * ${SCATTERING.swirlStart}, scatterRadius * ${SCATTERING.swirlPeak}, distanceToPointer)
        * (1.0 - smoothstep(scatterRadius * ${SCATTERING.swirlPeak}, scatterRadius * ${SCATTERING.swirlEnd}, distanceToPointer));
      float depthResponse = mix(1.0, 0.72, smoothstep(42.0, 70.0, -viewPosition.z));
      float handedness = aSeed < 0.5 ? -1.0 : 1.0;
      float flowPhase = sin(uMotionTime * (0.65 + aSeed * 0.5) + aTurbulence.y);
      vec2 tangent = vec2(-outward.y, outward.x) * handedness;
      float swirlAmount = mix(0.1, 0.18, nebulaArrival) * (0.78 + flowPhase * 0.22);
      vec2 disturbance = outward * influence + tangent * swirlBand * swirlAmount;
      float organicScale = 0.82 + aSeed * 0.36;
      float pushDistance = mix(0.095, 0.155, nebulaArrival);
      vec2 offsetNdc = disturbance * interaction * depthResponse * organicScale * pushDistance;
      offsetNdc.x /= uViewportAspect;
      viewPosition.xy += offsetNdc * (-viewPosition.z) / vec2(projectionMatrix[0][0], projectionMatrix[1][1]);
    }
    gl_Position = projectionMatrix * viewPosition;
    float fragmentScale = aEjectaData.z < 0.5 ? 2.1 : aEjectaData.z < 1.5 ? 1.42 : 0.78;
    float depthScale = clamp(38.0 / max(12.0, -viewPosition.z), 0.62, 1.75);
    float pointScale = mix(1.0, fragmentScale * (1.0 + surge * 0.2), ejecta * (1.0 - settle));
    pointScale = mix(pointScale, 0.9 + tracer * 0.5, settle) + ignition * 1.1;
    float nebulaDepth = clamp((aNebulaPosition.z + 12.0) / 24.0, 0.0, 1.0);
    pointScale = mix(pointScale, mix(1.05, 1.65, aSeed) * mix(0.8, 1.22, nebulaDepth), nebulaArrival);
    gl_PointSize = clamp(aPointSize * pointScale * uPixelRatio * depthScale, 1.0, 14.0);

    vec3 starColor = mix(vec3(0.47, 0.78, 1.0), vec3(0.92, 0.96, 1.0), aSeed * 0.62);
    vec3 shardColor = mix(vec3(0.69, 0.89, 1.0), vec3(0.97, 0.97, 1.0), aSeed);
    vec3 denseColor = mix(vec3(0.26, 0.72, 1.0), vec3(0.5, 0.48, 0.95), aSeed);
    vec3 fineColor = mix(vec3(0.44, 0.37, 0.85), vec3(0.83, 0.39, 0.77), aSeed * 0.6);
    vec3 ejectaColor = aEjectaData.z < 0.5 ? shardColor : aEjectaData.z < 1.5 ? denseColor : fineColor;
    vec3 dustColor = mix(vec3(0.35, 0.75, 1.0), vec3(0.72, 0.61, 1.0), aSeed);
    float cyanBias = clamp(0.18 + 0.24 * sin(aNebulaPosition.x * 0.26 + aNebulaPosition.y * 0.43)
      + 0.2 * smoothstep(1.5, 6.5, abs(aNebulaPosition.y)), 0.0, 0.68);
    float brightKnot = smoothstep(0.72, 0.98, aSeed) * mix(0.45, 1.0, nebulaDepth);
    vec3 nebulaColor = mix(vec3(0.48, 0.16, 0.92), vec3(0.16, 0.83, 1.0), smoothstep(0.12, 0.6, cyanBias));
    nebulaColor = mix(nebulaColor, vec3(0.94, 0.22, 0.72), smoothstep(2.0, 11.0, aNebulaPosition.x) * brightKnot * 0.48);
    nebulaColor *= 1.0 + brightKnot * 0.65;
    vec3 color = mix(starColor, ejectaColor, ejecta);
    color = mix(color, dustColor, settle);
    vColor = mix(color, nebulaColor, nebulaArrival);

    float starOpacity = 0.68 + ignition * 0.22;
    float ejectaOpacity = aEjectaData.z < 0.5 ? 0.98 : aEjectaData.z < 1.5 ? 0.82 : 0.46;
    ejectaOpacity *= mix(0.72, 1.1, clamp((depthScale - 0.62) / 1.13, 0.0, 1.0));
    float edgeWeight = smoothstep(0.34, 0.83, length(aDustPosition.xy / vec2(22.0, 12.5)));
    float dustOpacity = (mix(0.34, 0.58, aSeed) + tracer * 0.16) * mix(0.3, 1.0, edgeWeight);
    dustOpacity *= clamp(depthScale, 0.68, 1.0);
    float nebulaOpacity = mix(0.4, 0.73, aSeed) * mix(0.7, 1.08, nebulaDepth) + brightKnot * 0.18;
    vOpacity = mix(starOpacity, ejectaOpacity, ejecta);
    vOpacity = mix(vOpacity, dustOpacity, settle);
    vOpacity = mix(vOpacity, nebulaOpacity, nebulaArrival);
    vOpacity *= smoothstep(0.265, 0.3, uProgress);
    vOpacity *= 1.0 + breathing * 0.055 * nebulaArrival * uMotionAmount * uMotionProfile.y;
    vHaloStrength = mix(0.46, 0.66, ejecta * (1.0 - settle));
    vHaloStrength = mix(vHaloStrength, 0.72, nebulaArrival);
  }
`;

const particleFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  varying float vHaloStrength;

  void main() {
    float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
    float halo = exp(-distanceFromCenter * distanceFromCenter * 24.0);
    float core = exp(-distanceFromCenter * distanceFromCenter * 100.0);
    float alpha = min(1.0, (halo * vHaloStrength + core * 0.55) * vOpacity);
    // Apply the radial falloff once: multiplying RGB by it again erased wings.
    gl_FragColor = vec4(vColor * (0.9 + core * 0.75), alpha);
  }
`;

const coronaVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const coronaFragmentShader = `
  uniform float uProgress;
  varying vec2 vUv;

  float hash21(vec2 point) {
    point = fract(point * vec2(123.34, 456.21));
    point += dot(point, point + 45.32);
    return fract(point.x * point.y);
  }

  float valueNoise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);
    float a = hash21(cell);
    float b = hash21(cell + vec2(1.0, 0.0));
    float c = hash21(cell + vec2(0.0, 1.0));
    float d = hash21(cell + vec2(1.0, 1.0));
    return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
  }

  void main() {
    vec2 point = (vUv - vec2(0.5)) * 2.0;
    float radius = length(point);
    float angle = atan(point.y, point.x);
    float instability = smoothstep(0.08, 0.23, uProgress);
    float ignition = exp(-pow((uProgress - 0.295) * 42.0, 2.0));
    float starVisibility = 1.0 - smoothstep(0.275, 0.37, uProgress);
    float visibility = max(starVisibility, ignition * 0.5);
    float slowTime = uProgress * 0.4;

    // atan jumps from -PI to PI on the left axis. Sample the circular
    // direction instead so the corona has no horizontal noise seam.
    vec2 direction = vec2(cos(angle), sin(angle));
    float angularNoise = valueNoise(direction * 1.55 + vec2(4.0, slowTime));
    angularNoise += valueNoise(direction * 3.7 + vec2(-8.0, slowTime * 0.73)) * 0.45;
    float unevenRadius = radius / mix(0.9, 1.1, angularNoise / 1.45);
    // The stellar disc reaches roughly radius 0.42 in this plane. Keep the
    // brightest corona just outside it so the surface can retain its detail.
    float innerHalo = exp(-pow((unevenRadius - 0.44) * 12.0, 2.0));
    float middleHalo = exp(-pow((unevenRadius - 0.59) * 5.0, 2.0));
    float outerHalo = exp(-unevenRadius * 2.7) * (1.0 - smoothstep(0.42, 1.0, unevenRadius));

    float rayA = pow(max(0.0, sin(angle * 7.0 + angularNoise * 4.4)), 10.0);
    float rayB = pow(max(0.0, sin(angle * 13.0 - angularNoise * 5.2)), 18.0);
    float rays = (rayA * 0.62 + rayB * 0.38) * exp(-max(0.0, radius - 0.42) * 4.7);
    rays *= smoothstep(0.38, 0.5, radius) * (0.72 + instability * 0.42);

    float coreBloom = exp(-radius * radius * 18.0);
    float edgeFade = 1.0 - smoothstep(0.84, 1.0, radius);
    vec3 cyan = vec3(0.22, 0.66, 1.0);
    vec3 ice = vec3(0.78, 0.92, 1.0);
    vec3 color = mix(cyan, ice, clamp(innerHalo * 0.8 + coreBloom * 0.2, 0.0, 1.0));
    float luminance = innerHalo * 0.82 + middleHalo * 0.3 + outerHalo * 0.3 + rays * 0.32 + coreBloom * 0.04;
    float alpha = clamp(luminance * visibility * edgeFade * (0.9 + instability * 0.08 + ignition * 0.3), 0.0, 1.0);
    gl_FragColor = vec4(color * (0.74 + innerHalo * 0.3 + ignition * 0.16), alpha);
  }
`;

const shockwaveFragmentShader = `
  uniform float uProgress;
  varying vec2 vUv;

  void main() {
    vec2 point = (vUv - vec2(0.5)) * 2.0;
    float angle = atan(point.y, point.x);
    float radius = length(point * vec2(1.0, 1.08));
    float travel = smoothstep(0.275, 0.435, uProgress);
    float waveRadius = mix(0.045, 0.92, travel);
    float irregularity = sin(angle * 7.0 + 0.8) * 0.012 + sin(angle * 13.0 - 1.4) * 0.007;
    float width = mix(0.028, 0.012, travel);
    float ring = exp(-pow((radius - waveRadius - irregularity) / width, 2.0));
    float waveEnvelope = smoothstep(0.274, 0.299, uProgress) * (1.0 - smoothstep(0.385, 0.455, uProgress));
    float ignition = exp(-pow((uProgress - 0.295) * 43.0, 2.0));
    float coreFlash = exp(-radius * radius * 42.0) * ignition;
    float softFlash = exp(-radius * radius * 8.0) * ignition * 0.18;
    float alpha = clamp(ring * waveEnvelope * 0.43 + coreFlash * 0.84 + softFlash, 0.0, 0.94);
    vec3 color = mix(vec3(0.35, 0.75, 1.0), vec3(0.92, 0.97, 1.0), clamp(coreFlash + ring * 0.62, 0.0, 1.0));
    gl_FragColor = vec4(color, alpha);
  }
`;

const nebulaFragmentShader = `
  uniform float uVisibility;
  uniform float uTime;
  uniform float uFineDetail;
  varying vec2 vUv;

  float hash21(vec2 point) {
    point = fract(point * vec2(127.1, 311.7));
    point += dot(point, point + 19.19);
    return fract(point.x * point.y);
  }

  float valueNoise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);
    return mix(
      mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), local.x),
      mix(hash21(cell + vec2(0.0, 1.0)), hash21(cell + vec2(1.0, 1.0)), local.x),
      local.y
    );
  }

  void main() {
    vec2 point = (vUv - vec2(0.5)) * 2.0;
    float visibility = uVisibility;
    vec2 warp = vec2(
      valueNoise(point * 3.4 + vec2(uTime * 0.008, 1.7)),
      valueNoise(point * 3.9 + vec2(7.1, -uTime * 0.007))
    ) - 0.5;
    vec2 cloudPoint = point + warp * 0.16;
    vec2 first = (cloudPoint - vec2(-0.38, 0.15)) * vec2(2.45, 3.6);
    vec2 second = (cloudPoint - vec2(0.12, -0.14)) * vec2(2.1, 3.3);
    vec2 third = (cloudPoint - vec2(0.48, 0.22)) * vec2(3.25, 4.4);
    float lobes = exp(-dot(first, first)) * 0.82
      + exp(-dot(second, second)) * 0.67
      + exp(-dot(third, third)) * 0.42;
    float detail = valueNoise(cloudPoint * 8.2 + vec2(3.4, 6.8));
    float fine = 0.5;
    if (uFineDetail > 0.5) {
      fine = valueNoise(cloudPoint * 15.0 + vec2(11.2, 2.1));
    }
    float filamentA = exp(-pow((cloudPoint.y - (0.12 - cloudPoint.x * 0.32 + sin(cloudPoint.x * 7.0) * 0.07)) * 10.0, 2.0));
    float filamentB = exp(-pow((cloudPoint.y - (-0.3 + cloudPoint.x * 0.38 + sin(cloudPoint.x * 5.2) * 0.08)) * 12.0, 2.0));
    float strands = (filamentA * 0.28 + filamentB * 0.21) * lobes;
    float lane = exp(-pow((cloudPoint.y - (-0.04 + sin(cloudPoint.x * 5.0) * 0.065)) * 14.0, 2.0));
    lane *= 1.0 - smoothstep(0.52, 0.82, abs(cloudPoint.x));
    float outerFade = 1.0 - smoothstep(0.72, 1.0, length(point * vec2(1.03, 1.16)));
    float density = max(0.0, lobes * (0.48 + detail * 0.62 + fine * 0.16) + strands);
    density *= (1.0 - lane * 0.92) * outerFade;

    float cyanEdge = clamp(0.18 + 0.28 * sin(cloudPoint.x * 5.1 + cloudPoint.y * 4.2)
      + 0.23 * smoothstep(0.08, 0.55, abs(cloudPoint.y)), 0.0, 0.66);
    float filaments = clamp((filamentA + filamentB * 0.8) * detail, 0.0, 1.0);
    float knots = smoothstep(0.52, 0.85, detail) * smoothstep(0.35, 0.75, lobes);
    vec3 color = mix(vec3(0.48, 0.14, 0.86), vec3(0.12, 0.66, 1.0), cyanEdge);
    color = mix(color, vec3(0.16, 0.9, 1.0), filaments * 0.8);
    color = mix(color, vec3(0.92, 0.18, 0.65), smoothstep(0.18, 0.65, cloudPoint.x) * knots * 0.55);
    // Selective emission lifts knots and strands; the dust lane and radial
    // boundary still attenuate every layer, including the brightest regions.
    float emission = 0.95 + filaments * 0.75 + knots * 0.9;
    float alpha = clamp(density * visibility * (0.76 + knots * 0.18 + filaments * 0.12), 0.0, 0.88);
    gl_FragColor = vec4(color * emission, alpha);
  }
`;

const starVertexShader = `
  varying vec3 vObjectPosition;
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vObjectPosition = position;
    vViewNormal = normalize(normalMatrix * normal);
    vViewPosition = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const starFragmentShader = `
  uniform float uProgress;
  varying vec3 vObjectPosition;
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;

  float hash31(vec3 point) {
    point = fract(point * 0.1031);
    point += dot(point, point.yzx + 33.33);
    return fract((point.x + point.y) * point.z);
  }

  float valueNoise(vec3 point) {
    vec3 cell = floor(point);
    vec3 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);
    return mix(
      mix(mix(hash31(cell), hash31(cell + vec3(1.0, 0.0, 0.0)), local.x),
          mix(hash31(cell + vec3(0.0, 1.0, 0.0)), hash31(cell + vec3(1.0, 1.0, 0.0)), local.x), local.y),
      mix(mix(hash31(cell + vec3(0.0, 0.0, 1.0)), hash31(cell + vec3(1.0, 0.0, 1.0)), local.x),
          mix(hash31(cell + vec3(0.0, 1.0, 1.0)), hash31(cell + vec3(1.0, 1.0, 1.0)), local.x), local.y),
      local.z
    );
  }

  float fbm(vec3 point) {
    float value = 0.0;
    value += valueNoise(point) * 0.57;
    point = point * 2.03 + vec3(7.1, 3.4, 5.8);
    value += valueNoise(point) * 0.28;
    point = point * 2.01 + vec3(2.6, 8.2, 1.9);
    value += valueNoise(point) * 0.15;
    return value;
  }

  void main() {
    float instability = smoothstep(0.08, 0.23, uProgress);
    float ignition = exp(-pow((uProgress - 0.295) * 42.0, 2.0));
    float visibility = max(1.0 - smoothstep(0.275, 0.355, uProgress), ignition * 0.46);
    float facing = clamp(dot(normalize(vViewNormal), normalize(-vViewPosition)), 0.0, 1.0);
    float limb = 0.48 + 0.52 * pow(facing, 0.62);

    vec3 samplePoint = normalize(vObjectPosition) * 3.1;
    float rotation = uProgress * 0.7;
    mat2 spin = mat2(cos(rotation), -sin(rotation), sin(rotation), cos(rotation));
    samplePoint.xz = spin * samplePoint.xz;
    samplePoint += sin(samplePoint.yzx * 5.0 + uProgress * 42.0) * instability * 0.075;
    float convection = fbm(samplePoint * 1.15 + vec3(0.0, uProgress * 0.4, 0.0));
    float granulation = fbm(samplePoint * 3.85 - vec3(uProgress * 0.65, 0.0, 0.0));
    float cells = smoothstep(0.32, 0.66, convection);
    float grains = smoothstep(0.33, 0.67, granulation);
    float temperature = clamp(0.48 + (cells - 0.5) * 0.65 + (grains - 0.5) * 0.22, 0.0, 1.0);
    vec3 coolBlue = vec3(0.38, 0.66, 0.87);
    vec3 paleBlue = vec3(0.78, 0.9, 0.98);
    vec3 color = mix(coolBlue, paleBlue, temperature);
    color *= limb * mix(0.89, 1.07, grains);
    color *= 1.0 + instability * (0.055 * sin(uProgress * 135.0 + convection * 8.0) + 0.035 * cells);
    color += vec3(0.08, 0.16, 0.24) * instability * cells * 0.2;
    color += vec3(0.2, 0.26, 0.29) * ignition * (0.3 + facing * 0.4);

    float alpha = visibility * smoothstep(0.02, 0.16, facing);
    gl_FragColor = vec4(color, alpha);
  }
`;

function createSupernovaScene(canvas, onStatus) {
  let renderer;
  let animationFrame = 0;
  let renderFrame = 0;
  let disposed = false;
  let contextLost = false;
  let reducedMotion = false;
  let currentProgress = 0;
  let starBaseScale = 3.8;
  let coronaBaseScale = 9.1;
  let resizeObserver;
  let framingX = 0;
  let framingY = 0;
  let viewportWidth = 1;
  let viewportHeight = 1;
  let pointer;
  let sceneVisibility;
  const animationClock = createActiveClock();
  const coarsePointer = window.matchMedia?.("(any-pointer: coarse)");
  let lastRenderTime = performance.now();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 140);
  camera.position.set(0, 0, 38);

  const particleCount = particleBudget(window.innerWidth, navigator.hardwareConcurrency || 8);

  const { starPositions, dustPositions, nebulaPositions, ejectaPositions, ejectaData, turbulence, sizes, seeds } = createParticleAttributes(particleCount);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  geometry.setAttribute("aDustPosition", new THREE.BufferAttribute(dustPositions, 3));
  geometry.setAttribute("aNebulaPosition", new THREE.BufferAttribute(nebulaPositions, 3));
  geometry.setAttribute("aEjectaPosition", new THREE.BufferAttribute(ejectaPositions, 3));
  geometry.setAttribute("aEjectaData", new THREE.BufferAttribute(ejectaData, 4));
  geometry.setAttribute("aTurbulence", new THREE.BufferAttribute(turbulence, 3));
  geometry.setAttribute("aPointSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const particleUniforms = {
    uProgress: { value: 0 },
    uPixelRatio: { value: 1 },
    uSourceScale: { value: new THREE.Vector3(1, 1, 1) },
    uSourceY: { value: 0 },
    uNebulaScale: { value: new THREE.Vector3(1, 1, 1) },
    uNebulaCenter: { value: new THREE.Vector2(0, 0) },
    uPointer: { value: new THREE.Vector3(0, 0, 0) },
    uInteraction: { value: 0 },
    uViewportAspect: { value: 1 },
    uMotionTime: { value: 0 },
    uMotionAmount: { value: 0 },
    uMotionProfile: { value: new THREE.Vector2(1, 1) },
  };
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: particleUniforms,
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(geometry, particleMaterial);
  particles.frustumCulled = false;
  particles.renderOrder = 1;
  scene.add(particles);

  const nebulaUniforms = {
    uVisibility: { value: 0 },
    uTime: { value: 0 },
    uFineDetail: { value: 1 },
  };
  const nebulaGeometry = new THREE.PlaneGeometry(34, 21);
  const nebulaMaterial = new THREE.ShaderMaterial({
    uniforms: nebulaUniforms,
    vertexShader: coronaVertexShader,
    fragmentShader: nebulaFragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
  nebula.position.z = -2.2;
  nebula.renderOrder = 0;
  scene.add(nebula);

  const coronaUniforms = {
    uProgress: { value: 0 },
  };
  const coronaGeometry = new THREE.PlaneGeometry(2, 2);
  const coronaMaterial = new THREE.ShaderMaterial({
    uniforms: coronaUniforms,
    vertexShader: coronaVertexShader,
    fragmentShader: coronaFragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
  corona.position.z = -0.8;
  corona.renderOrder = 2;
  scene.add(corona);

  const starUniforms = {
    uProgress: { value: 0 },
  };
  const starGeometry = new THREE.SphereGeometry(1, 48, 32);
  const starMaterial = new THREE.ShaderMaterial({
    uniforms: starUniforms,
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const star = new THREE.Mesh(starGeometry, starMaterial);
  star.renderOrder = 3;
  scene.add(star);

  const shockwaveUniforms = { uProgress: { value: 0 } };
  const shockwaveGeometry = new THREE.PlaneGeometry(2, 2);
  const shockwaveMaterial = new THREE.ShaderMaterial({
    uniforms: shockwaveUniforms,
    vertexShader: coronaVertexShader,
    fragmentShader: shockwaveFragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
  shockwave.position.z = 0.8;
  shockwave.renderOrder = 4;
  scene.add(shockwave);

  function disposeSceneResources() {
    geometry.dispose();
    particleMaterial.dispose();
    nebulaGeometry.dispose();
    nebulaMaterial.dispose();
    coronaGeometry.dispose();
    coronaMaterial.dispose();
    starGeometry.dispose();
    starMaterial.dispose();
    shockwaveGeometry.dispose();
    shockwaveMaterial.dispose();
  }

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Three.js compiles programs lazily. Force each scene material's program
    // once, then reject only a confirmed link failure, not driver warnings.
    renderer.compile(scene, camera);
    if (!shaderProgramsHealthy(renderer.info.programs)) {
      throw new Error("Supernova shader program failed to link");
    }
  } catch (error) {
    disposeSceneResources();
    renderer?.dispose();
    onStatus("unavailable");
    return null;
  }

  function updateUniforms() {
    let progress = currentProgress;
    if (reducedMotion) {
      if (currentProgress < 0.22) progress = 0;
      else if (currentProgress < SUPERNOVA_THRESHOLDS.nebula) progress = 0.72;
      else progress = 1;
    }
    particleUniforms.uProgress.value = progress;
    particleUniforms.uInteraction.value = reducedMotion ? 0 : particleInteraction(progress);
    particleUniforms.uMotionAmount.value = autonomousMotion(progress, reducedMotion);
    coronaUniforms.uProgress.value = progress;
    starUniforms.uProgress.value = progress;
    shockwaveUniforms.uProgress.value = progress;
    nebulaUniforms.uVisibility.value = formationHaze(progress);
  }

  function render() {
    if (disposed || contextLost || !isSceneVisible()) return;
    const now = performance.now();
    pointer?.step(Math.max(0, (now - lastRenderTime) / 1000));
    lastRenderTime = now;
    if (pointer) particleUniforms.uPointer.value.set(pointer.value.x, pointer.value.y, pointer.value.strength);
    updateUniforms();
    const time = reducedMotion ? 0 : animationClock.sample(now);
    particleUniforms.uMotionTime.value = time;
    nebulaUniforms.uTime.value = time;

    const progress = particleUniforms.uProgress.value;
    const instability = smoothPhase(SUPERNOVA_PHASES.instability.start, SUPERNOVA_PHASES.instability.end, progress);
    const collapseIn = smoothPhase(SUPERNOVA_PHASES.collapse.start, 0.255, progress);
    const collapseOut = 1 - smoothPhase(0.255, SUPERNOVA_PHASES.collapse.end, progress);
    const collapse = collapseIn * collapseOut;
    const ignition = Math.exp(-Math.pow((progress - 0.295) * 42, 2));
    const pulse = reducedMotion ? 0 : Math.sin(progress * 85) * (0.012 + instability * 0.008);
    const stellarScale = starBaseScale * (1 + pulse - collapse * 0.1 + ignition * 0.18);
    const haloScale = coronaBaseScale * (1 + pulse * 0.6 + instability * 0.04 - collapse * 0.07 + ignition * 0.22);
    star.scale.setScalar(stellarScale);
    const sourceRadius = stellarScale * 0.93 / 0.78;
    particleUniforms.uSourceScale.value.set(sourceRadius / particles.scale.x, sourceRadius, sourceRadius);
    corona.scale.set(haloScale, haloScale, 1);
    shockwave.visible = progress > 0.265 && progress < 0.455;
    nebula.visible = nebulaUniforms.uVisibility.value > 0;
    renderer.render(scene, camera);
  }

  function stopAnimation() {
    animationClock.setRunning(false, performance.now());
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  }

  function needsAnimation() {
    return shouldRenderContinuously(currentProgress, {
      reducedMotion,
      visible: isSceneVisible(),
      disposed,
      contextLost,
    });
  }

  function isSceneVisible() {
    return !document.hidden && (sceneVisibility?.isVisible() ?? true);
  }

  function animate() {
    animationFrame = 0;
    if (!needsAnimation()) {
      animationClock.setRunning(false, performance.now());
      return;
    }
    render();
    startAnimation();
  }

  function startAnimation() {
    if (!animationFrame && needsAnimation()) {
      animationClock.setRunning(true, performance.now());
      if (renderFrame) cancelAnimationFrame(renderFrame);
      renderFrame = 0;
      animationFrame = requestAnimationFrame(animate);
    }
  }

  function scheduleRender() {
    if (renderFrame || disposed || contextLost || animationFrame || !isSceneVisible()) return;
    renderFrame = requestAnimationFrame(() => {
      renderFrame = 0;
      render();
    });
  }

  function updateFraming() {
    // Place destinations and haze in their final composition from the outset.
    // The camera, opening star, and unassembled dust never translate.
    particleUniforms.uNebulaCenter.value.set(framingX * 2, -framingY * 2);
    const halfHeight = (camera.position.z - nebula.position.z) * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    nebula.position.x = framingX * 2 * halfHeight * viewportWidth / viewportHeight;
    nebula.position.y = -framingY * 2 * halfHeight;
  }

  function resize() {
    if (disposed || contextLost) return;
    const width = Math.max(1, canvas.clientWidth || window.innerWidth);
    const height = Math.max(1, canvas.clientHeight || window.innerHeight);
    viewportWidth = width;
    viewportHeight = height;
    const aspect = width / height;
    particleUniforms.uViewportAspect.value = aspect;
    pointer?.clear();
    const isSmallScreen = width < 768;
    const gentleMotion = width <= 991 || coarsePointer?.matches;
    particleUniforms.uMotionProfile.value.set(gentleMotion ? 0.65 : 1, gentleMotion ? 0.55 : 1);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, pixelRatioCap(width));

    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    updateFraming();
    particles.scale.x = Math.min(1, Math.max(0.3, aspect * 0.75));
    const cloudWidth = isSmallScreen ? 1.18 : 1.32;
    particleUniforms.uNebulaScale.value.set(cloudWidth, 1.28, 1.15);
    nebula.scale.set(particles.scale.x * cloudWidth, 1.28, 1);
    nebulaUniforms.uFineDetail.value = width <= 991 ? 0 : 1;
    // Size the projected sphere against the shorter viewport dimension.
    const halfFovTangent = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const projectedRadius = halfFovTangent * (isSmallScreen ? 0.42 : 0.34) * Math.min(1, aspect);
    starBaseScale = camera.position.z * projectedRadius / Math.sqrt(1 + projectedRadius * projectedRadius);
    coronaBaseScale = starBaseScale * 2.4;
    star.position.y = -camera.position.z * halfFovTangent * 0.22;
    particleUniforms.uSourceY.value = star.position.y;
    corona.position.y = star.position.y;
    shockwave.position.y = star.position.y;
    shockwave.scale.setScalar(isSmallScreen ? starBaseScale * 3.5 : starBaseScale * 4.2);
    particleUniforms.uPixelRatio.value = pixelRatio;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    scheduleRender();
  }

  function onContextLost(event) {
    event.preventDefault();
    contextLost = true;
    pointer?.setEnabled(false);
    stopAnimation();
    if (renderFrame) cancelAnimationFrame(renderFrame);
    renderFrame = 0;
    onStatus("lost");
  }

  function onContextRestored() {
    if (disposed) return;
    contextLost = false;
    syncPointerAvailability();
    renderer.resetState();
    onStatus("ready");
    resize();
    startAnimation();
    scheduleRender();
  }

  function onVisibilityChange(visible) {
    if (!visible) {
      pointer?.setEnabled(false);
      stopAnimation();
      if (renderFrame) cancelAnimationFrame(renderFrame);
      renderFrame = 0;
    } else {
      syncPointerAvailability();
      startAnimation();
      scheduleRender();
    }
  }

  function onResize() {
    resize();
  }

  function syncPointerAvailability() {
    // Availability is a device/lifecycle concern. Scroll phases only weight
    // the shader offset, so they never erase a stationary pointer's position.
    pointer?.setEnabled(!disposed && !reducedMotion && !contextLost && isSceneVisible());
  }

  canvas.addEventListener("webglcontextlost", onContextLost, false);
  canvas.addEventListener("webglcontextrestored", onContextRestored, false);
  window.addEventListener("resize", onResize, { passive: true });
  // Observe the occupied page, not just its fixed canvas, so leaving the
  // homepage/lab's visible area also pauses drawing and the active clock.
  sceneVisibility = observeSceneVisibility(canvas.closest(".portfolio-home") || canvas.closest(".supernova-lab") || canvas, onVisibilityChange);
  if (coarsePointer?.addEventListener) coarsePointer.addEventListener("change", onResize);
  else coarsePointer?.addListener(onResize);
  pointer = createDustPointer(canvas, () => {
    // Track the opening pointer without rendering an invisible disturbance.
    if (currentProgress <= INTERACTION.start) return;
    startAnimation();
    scheduleRender();
  });
  syncPointerAvailability();

  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
  }

  resize();
  onStatus("ready");
  startAnimation();

  return {
    setFraming(x, y) {
      if (disposed || (x === framingX && y === framingY)) return;
      framingX = x;
      framingY = y;
      updateFraming();
      scheduleRender();
    },
    setProgress(progress) {
      currentProgress = THREE.MathUtils.clamp(progress, 0, 1);
      updateUniforms();
      if (needsAnimation()) startAnimation();
      else stopAnimation();
      scheduleRender();
    },
    setReducedMotion(value) {
      reducedMotion = value;
      syncPointerAvailability();
      if (reducedMotion) {
        stopAnimation();
        updateUniforms();
        scheduleRender();
      } else {
        updateUniforms();
        startAnimation();
        scheduleRender();
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      pointer.dispose();
      stopAnimation();
      if (renderFrame) cancelAnimationFrame(renderFrame);
      resizeObserver?.disconnect();
      sceneVisibility.dispose();
      if (coarsePointer?.removeEventListener) coarsePointer.removeEventListener("change", onResize);
      else coarsePointer?.removeListener(onResize);
      canvas.removeEventListener("webglcontextlost", onContextLost, false);
      canvas.removeEventListener("webglcontextrestored", onContextRestored, false);
      window.removeEventListener("resize", onResize);
      disposeSceneResources();
      renderer.dispose();
    },
  };
}

export default createSupernovaScene;
