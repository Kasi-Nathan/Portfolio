import * as THREE from "three";
import createDustPointer from "./DustPointer";
import { FORMATION, INTERACTION, SCATTERING, SUPERNOVA_PHASES, formationHaze, particleInteraction } from "./SupernovaFormation";
import { autonomousMotion, createActiveClock, observeSceneVisibility, shouldRenderContinuously } from "./SupernovaAnimation";

export { SUPERNOVA_PHASES };

export const SUPERNOVA_THRESHOLDS = Object.freeze({
  star: 0.17,
  supernova: 0.43,
  nebula: 0.78,
});

export function particleBudget(width, hardwareThreads = 8) {
  return width < 768 ? 7200 : width <= 991 || hardwareThreads <= 4 ? 10000 : 16000;
}

export function pixelRatioCap(width) {
  return width <= 991 ? 1.25 : 1.5;
}

export function ambientStarBudget(width, hardwareThreads = 8) {
  return width < 768 ? 2600 : width <= 991 || hardwareThreads <= 4 ? 4200 : 6800;
}

export function travelAmount(progress) {
  const value = Math.max(0, Math.min(1, (progress - 0.18) / 0.43));
  return value * value * (3 - 2 * value);
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

export function createParticleAttributes(count) {
  const random = createRandom(0x51a7c0de);
  const planetRandom = createRandom(0x0c19a5e7);
  const starPositions = new Float32Array(count * 3);
  const dustPositions = new Float32Array(count * 3);
  const nebulaPositions = new Float32Array(count * 3);
  const planetPositions = new Float32Array(count * 4);
  const galaxyData = new Float32Array(count * 4);
  const turbulence = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const nebulaLobes = [
    { x: -6.5, y: 1.5, z: -5, width: 4.4, height: 2.5, depth: 3.7, tilt: -0.24 },
    { x: 2.1, y: -1.4, z: 1.5, width: 5.2, height: 3.1, depth: 4.3, tilt: 0.34 },
    { x: 8, y: 2.2, z: -4, width: 3.2, height: 1.9, depth: 3.1, tilt: -0.5 },
  ];

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    // Four wound arms surround a dense stellar bulge. A small diffuse cohort
    // softens the arm boundaries while narrow under-filled lanes retain shape.
    const cohort = random();
    const kind = cohort < 0.22 ? 0 : cohort < 0.9 ? 1 : 2;
    const arm = index % 4;
    const radius = kind === 0 ? Math.sqrt(random()) * 2.4
      : kind === 1 ? 1.2 + Math.pow(random(), 0.8) * 11.2
        : Math.sqrt(random()) * 12.4;
    const armSpread = kind === 1 ? randomNormal(random) * (0.09 + radius * 0.006) : 0;
    const angle = kind === 1
      ? arm * Math.PI * 0.5 + radius * 0.48 + armSpread
      : random() * Math.PI * 2;
    const lane = kind === 1 && radius > 3.2 && Math.abs(armSpread) < 0.035 ? 0.28 : 1;
    starPositions[offset] = Math.cos(angle) * radius;
    starPositions[offset + 1] = Math.sin(angle) * radius;
    starPositions[offset + 2] = randomNormal(random) * (kind === 0 ? 0.9 : 0.16 + radius * 0.03);
    galaxyData[index * 4] = radius / 12.4;
    galaxyData[index * 4 + 1] = kind;
    galaxyData[index * 4 + 2] = arm;
    galaxyData[index * 4 + 3] = lane;
    const dustAngle = angle + randomNormal(random) * 0.24;
    const dustRadius = 6 + Math.sqrt(random()) * 17;
    dustPositions[offset] = Math.cos(dustAngle) * dustRadius;
    dustPositions[offset + 1] = Math.sin(dustAngle) * dustRadius * 0.58;
    dustPositions[offset + 2] = -6 - random() * 22;
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

    const planetOffset = index * 4;
    const ringClass = index % 10;
    if (ringClass < 4) {
      const ringAngle = planetRandom() * Math.PI * 2;
      const band = ringClass === 0 ? 1 : ringClass === 3 ? 3 : 2;
      const ringRadius = band === 1 ? 1.27 + planetRandom() * 0.13
        : band === 2 ? 1.52 + planetRandom() * 0.17 : 1.82 + planetRandom() * 0.2;
      planetPositions[planetOffset] = Math.cos(ringAngle) * ringRadius;
      planetPositions[planetOffset + 1] = (Math.sin(ringAngle) * 0.34 + Math.cos(ringAngle) * 0.12) * ringRadius;
      planetPositions[planetOffset + 2] = Math.sin(ringAngle) * ringRadius * 0.58;
      planetPositions[planetOffset + 3] = band;
    } else {
      const latitude = planetRandom() * 2 - 1;
      const longitude = planetRandom() * Math.PI * 2;
      const horizontal = Math.sqrt(1 - latitude * latitude);
      planetPositions[planetOffset] = Math.cos(longitude) * horizontal;
      planetPositions[planetOffset + 1] = latitude;
      planetPositions[planetOffset + 2] = Math.sin(longitude) * horizontal;
    }

    sizes[index] = 1.1 + random() * 3.8;
    seeds[index] = random();
  }

  return { starPositions, dustPositions, nebulaPositions, planetPositions, galaxyData, turbulence, sizes, seeds };
}

const particleVertexShader = `
  attribute vec3 aDustPosition;
  attribute vec3 aNebulaPosition;
  attribute vec4 aPlanetPosition;
  attribute vec4 aGalaxyData;
  attribute vec3 aTurbulence;
  attribute float aPointSize;
  attribute float aSeed;

  uniform float uProgress;
  uniform float uPlanetAmount;
  uniform vec2 uPlanetCenter;
  uniform float uPlanetRadius;
  uniform vec2 uGalaxyScale;
  uniform float uPixelRatio;
  uniform vec3 uNebulaScale;
  uniform vec2 uNebulaCenter;
  uniform vec3 uPointer;
  uniform vec2 uPointerVelocity;
  uniform float uInteraction;
  uniform float uViewportAspect;
  uniform float uMotionTime;
  uniform float uMotionAmount;
  uniform vec2 uMotionProfile;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vHaloStrength;

  void main() {
    float loosen = smoothstep(0.12, 0.36, uProgress);
    float settle = smoothstep(0.25 + aSeed * 0.035, 0.59, uProgress);
    float nebulaArrival = smoothstep(${FORMATION.start} + aSeed * ${FORMATION.startSpread}, ${FORMATION.end} + aSeed * ${FORMATION.endSpread}, uProgress);
    float radius = length(position.xy);
    float turn = uMotionTime * (0.013 / (1.0 + radius * 0.12)) * uMotionProfile.x;
    vec2 orbit = mat2(cos(turn), -sin(turn), sin(turn), cos(turn)) * position.xy;
    vec3 galaxyPosition = vec3(orbit.x * uGalaxyScale.x,
      orbit.y * 0.62 * uGalaxyScale.y - position.z * 0.78 - 3.5,
      orbit.y * 0.78 + position.z * 0.62);
    vec3 separation = vec3(cos(aTurbulence.x), sin(aTurbulence.x),
      sin(aTurbulence.y)) * (1.4 + 3.8 * aSeed) * loosen * (1.0 - settle);
    vec3 particlePosition = mix(galaxyPosition + separation, aDustPosition, settle);
    particlePosition.xy += vec2(sin(uMotionTime * 0.17 + aTurbulence.x),
      cos(uMotionTime * 0.14 + aTurbulence.y)) * 0.16 * (1.0 - uPlanetAmount);

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
      vec2 bend = vec2(-travel.y, travel.x) * (0.07 + aSeed * 0.09);
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

    // Most dust gathers into the planet; a small seed cohort remains in the
    // surrounding field. Its positions stay deterministic as scroll reverses.
    float planetBlend = uPlanetAmount * smoothstep(0.08, 0.18, aSeed);
    vec3 planetLocal = aPlanetPosition.xyz;
    if (aPlanetPosition.w > 0.5) {
      float ringY = (aPlanetPosition.y - aPlanetPosition.x * 0.12) / 0.34;
      float ringRadius = length(vec2(aPlanetPosition.x, ringY));
      float orbit = atan(ringY, aPlanetPosition.x)
        + uMotionTime * (0.018 + aPlanetPosition.w * 0.004) * uMotionProfile.x;
      planetLocal = vec3(cos(orbit) * ringRadius,
        (sin(orbit) * 0.34 + cos(orbit) * 0.12) * ringRadius,
        sin(orbit) * ringRadius * 0.58);
    } else {
      float turn = uMotionTime * 0.045 * uMotionProfile.x;
      planetLocal.xz = vec2(
        aPlanetPosition.x * cos(turn) - aPlanetPosition.z * sin(turn),
        aPlanetPosition.x * sin(turn) + aPlanetPosition.z * cos(turn));
    }
    vec3 planetPosition = vec3(
      uPlanetCenter.x * 38.0 / projectionMatrix[0][0],
      uPlanetCenter.y * 38.0 / projectionMatrix[1][1], -38.0
    ) + planetLocal * uPlanetRadius;
    viewPosition.xyz = mix(viewPosition.xyz, planetPosition, planetBlend);

    // Work in projected, aspect-correct coordinates so interaction follows
    // the canvas and camera view offset, including the finale's framing.
    // Apply only a temporary view-space offset after deterministic positions.
    // Fade in during dispersal, then retain a subtle response after arrival.
    // Pointer state itself survives every scroll phase, including reversal.
    float interaction = uInteraction * uPointer.z;
    interaction *= mix(1.0, ${INTERACTION.nebulaStrength}, nebulaArrival);
    if (interaction > 0.0 && dot(uPointerVelocity, uPointerVelocity) > 0.000001) {
      vec4 projected = projectionMatrix * viewPosition;
      vec2 delta = (projected.xy / projected.w - uPointer.xy) * vec2(uViewportAspect, 1.0);
      float distanceToPointer = length(delta);
      float scatterRadius = mix(${SCATTERING.dustRadius}, ${SCATTERING.nebulaRadius}, nebulaArrival);
      float influence = 1.0 - smoothstep(scatterRadius * ${SCATTERING.openingStart}, scatterRadius, distanceToPointer);
      float depthResponse = mix(1.0, 0.72, smoothstep(42.0, 70.0, -viewPosition.z));
      // Cursor velocity is in NDC per second. Scale x for circular screen-space
      // influence, then cap fast strokes without changing their direction.
      vec2 motion = uPointerVelocity * vec2(uViewportAspect, 1.0);
      motion *= min(1.0, 3.0 / max(length(motion), 0.0001));
      float variation = 0.55 + aSeed * 0.65;
      float sideways = sin(aTurbulence.x * 2.7 + aSeed * 6.28318) * 0.3;
      vec2 disturbance = motion + vec2(-motion.y, motion.x) * sideways;
      vec2 offsetNdc = disturbance * influence * interaction * depthResponse * variation * 0.035;
      offsetNdc.x /= uViewportAspect;
      viewPosition.xy += offsetNdc * (-viewPosition.z) / vec2(projectionMatrix[0][0], projectionMatrix[1][1]);
    }
    gl_Position = projectionMatrix * viewPosition;
    float depthScale = clamp(38.0 / max(12.0, -viewPosition.z), 0.62, 1.75);
    float galaxyPointScale = aGalaxyData.y < 0.5 ? 1.4 + aSeed * 0.55 : 0.8 + aSeed * 0.65;
    float pointScale = mix(galaxyPointScale, mix(0.8, 1.5, aSeed), settle);
    float nebulaDepth = clamp((aNebulaPosition.z + 12.0) / 24.0, 0.0, 1.0);
    pointScale = mix(pointScale, mix(1.05, 1.65, aSeed) * mix(0.8, 1.22, nebulaDepth), nebulaArrival);
    float limb = 1.0 - abs(planetLocal.z);
    float planetPointScale = aPlanetPosition.w > 0.5
      ? 1.25 + aSeed * 0.65 : 1.65 + aSeed * 0.65 + smoothstep(0.65, 0.95, limb) * 0.32;
    pointScale = mix(pointScale, planetPointScale, planetBlend);
    gl_PointSize = clamp(aPointSize * pointScale * uPixelRatio * depthScale, 1.0, 14.0);

    vec3 dustColor = mix(vec3(0.42, 0.76, 0.96), vec3(0.75, 0.64, 0.98), aSeed);
    vec3 armColor = aGalaxyData.z < 0.5 ? vec3(0.43, 0.81, 1.0)
      : aGalaxyData.z < 1.5 ? vec3(0.56, 0.57, 0.98)
        : aGalaxyData.z < 2.5 ? vec3(0.91, 0.46, 0.78) : vec3(0.64, 0.88, 1.0);
    armColor = mix(armColor, vec3(0.9, 0.94, 1.0), aSeed * 0.22);
    vec3 coreColor = mix(vec3(1.0, 0.72, 0.38), vec3(1.0, 0.96, 0.83),
      1.0 - smoothstep(0.0, 0.19, aGalaxyData.x));
    vec3 galaxyColor = aGalaxyData.y < 0.5 ? coreColor
      : aGalaxyData.y < 1.5 ? mix(coreColor, armColor, smoothstep(0.08, 0.3, aGalaxyData.x))
        : mix(vec3(0.48, 0.57, 0.78), armColor, 0.36);
    float cyanBias = clamp(0.18 + 0.24 * sin(aNebulaPosition.x * 0.26 + aNebulaPosition.y * 0.43)
      + 0.2 * smoothstep(1.5, 6.5, abs(aNebulaPosition.y)), 0.0, 0.68);
    float brightKnot = smoothstep(0.72, 0.98, aSeed) * mix(0.45, 1.0, nebulaDepth);
    vec3 nebulaColor = mix(vec3(0.48, 0.16, 0.92), vec3(0.16, 0.83, 1.0), smoothstep(0.12, 0.6, cyanBias));
    nebulaColor = mix(nebulaColor, vec3(0.94, 0.22, 0.72), smoothstep(2.0, 11.0, aNebulaPosition.x) * brightKnot * 0.48);
    nebulaColor *= 1.0 + brightKnot * 0.65;
    vColor = mix(mix(galaxyColor, dustColor, settle), nebulaColor, nebulaArrival);
    vec3 planetColor = aPlanetPosition.w > 0.5
      ? (aPlanetPosition.w < 1.5 ? vec3(0.55, 0.81, 0.91)
        : aPlanetPosition.w < 2.5 ? vec3(0.68, 0.62, 0.88) : vec3(0.4, 0.7, 0.83)) * (0.82 + aSeed * 0.3)
      : mix(vec3(0.23, 0.53, 0.7), vec3(0.76, 0.72, 0.94),
        smoothstep(-0.85, 0.85, planetLocal.y))
        * (0.82 + 0.18 * sin(planetLocal.y * 13.0 + aSeed * 2.0));
    planetColor = mix(planetColor, vec3(0.58, 0.86, 0.94),
      (1.0 - step(0.5, aPlanetPosition.w)) * smoothstep(0.68, 0.96, limb) * 0.25);
    vColor = mix(vColor, planetColor, planetBlend);

    float edgeWeight = smoothstep(0.34, 0.83, length(aDustPosition.xy / vec2(22.0, 12.5)));
    float dustOpacity = mix(0.48, 0.78, aSeed) * mix(0.52, 1.0, edgeWeight);
    dustOpacity *= clamp(depthScale, 0.74, 1.0);
    float nebulaOpacity = mix(0.4, 0.73, aSeed) * mix(0.7, 1.08, nebulaDepth) + brightKnot * 0.18;
    float galaxyOpacity = aGalaxyData.y < 0.5 ? 0.74
      : aGalaxyData.y < 1.5 ? 0.76 * aGalaxyData.w : 0.22;
    galaxyOpacity *= mix(1.08, 0.78, aGalaxyData.x);
    vOpacity = mix(galaxyOpacity, dustOpacity, settle);
    vOpacity = mix(vOpacity, nebulaOpacity, nebulaArrival);
    // The rear arc disappears behind the projected disc. The front arc stays
    // bright, while the back of the spherical body contributes only a trace.
    float behindDisc = (1.0 - step(0.0, planetLocal.z))
      * (1.0 - smoothstep(0.94, 1.04, length(planetLocal.xy)));
    float planetOpacity = aPlanetPosition.w > 0.5
      ? mix(0.42, 0.9, smoothstep(-0.4, 0.4, planetLocal.z)) * (1.0 - behindDisc * 0.97)
      : mix(0.03, 0.92, smoothstep(-0.24, 0.48, planetLocal.z));
    vOpacity = mix(vOpacity, planetOpacity, planetBlend);
    vOpacity *= 1.0 + breathing * 0.055 * nebulaArrival * uMotionAmount * uMotionProfile.y;
    vHaloStrength = 0.46;
    vHaloStrength = mix(vHaloStrength, 0.72, nebulaArrival);
    vHaloStrength = mix(vHaloStrength, 0.52, planetBlend);
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

export function createAmbientAttributes(count) {
  const random = createRandom(0xa81e57a9);
  const coordinates = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    coordinates[offset] = (random() * 2 - 1) * 1.18;
    coordinates[offset + 1] = (random() * 2 - 1) * 1.18;
    coordinates[offset + 2] = random();
    seeds[index] = random();
    sizes[index] = 0.8 + Math.pow(random(), 3) * 2.7;
  }
  return { coordinates, seeds, sizes };
}

const ambientVertexShader = `
  attribute float aSeed;
  attribute float aPointSize;
  uniform float uTravel;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uIntensity;
  varying vec3 vColor;
  varying float vOpacity;
  varying float vHaloStrength;
  varying float vStreak;
  varying vec2 vTravelDirection;

  void main() {
    // Each point occupies a real camera-space depth. Scrolling advances it
    // toward the viewer; modulo wraps it without changing its identity.
    float depth = 16.0 + mod(position.z * 86.0 - uTravel * 64.0 * (0.75 + aSeed * 0.4) + 86.0, 86.0);
    vec2 drift = vec2(sin(uTime * 0.035 + aSeed * 17.0),
      cos(uTime * 0.028 + aSeed * 23.0)) * 0.006;
    vec2 ndc = position.xy + drift;
    vec3 viewPosition = vec3(ndc * depth / vec2(projectionMatrix[0][0], projectionMatrix[1][1]), -depth);
    gl_Position = projectionMatrix * vec4(viewPosition, 1.0);
    float proximity = clamp(38.0 / depth, 0.38, 1.8);
    float travelPhase = smoothstep(0.02, 0.22, uTravel) * (1.0 - smoothstep(0.78, 1.0, uTravel));
    vStreak = travelPhase * smoothstep(0.8, 1.7, proximity) * 0.65;
    vTravelDirection = normalize(vec2(position.x * projectionMatrix[1][1] / projectionMatrix[0][0], position.y) + vec2(0.0001));
    gl_PointSize = clamp(aPointSize * proximity * uPixelRatio * (1.0 + vStreak * 1.4), 1.0, 9.0);
    vColor = mix(vec3(0.64, 0.83, 1.0), vec3(0.95, 0.98, 1.0), aSeed);
    vColor = mix(vColor, vec3(0.72, 0.63, 0.96), smoothstep(0.78, 1.0, aSeed) * 0.55);
    vOpacity = uIntensity * (0.32 + aSeed * 0.55) * (0.85 + 0.15 * sin(uTime * (0.3 + aSeed) + aSeed * 30.0));
    vHaloStrength = 0.42;
  }
`;

const ambientFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  varying float vHaloStrength;
  varying float vStreak;
  varying vec2 vTravelDirection;
  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float along = dot(point, vTravelDirection);
    float across = dot(point, vec2(-vTravelDirection.y, vTravelDirection.x));
    float radius = length(vec2(along * (1.0 - vStreak * 0.55), across));
    float halo = exp(-radius * radius * 24.0);
    float core = exp(-radius * radius * 100.0);
    gl_FragColor = vec4(vColor * (0.9 + core * 0.75),
      min(1.0, (halo * vHaloStrength + core * 0.55) * vOpacity));
  }
`;

const coronaVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
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

function createSupernovaScene(canvas, onStatus) {
  let renderer;
  let animationFrame = 0;
  let renderFrame = 0;
  let disposed = false;
  let contextLost = false;
  let reducedMotion = false;
  let currentProgress = 0;
  let planetAmount = 0;
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

  const { starPositions, dustPositions, nebulaPositions, planetPositions, galaxyData, turbulence, sizes, seeds } = createParticleAttributes(particleCount);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  geometry.setAttribute("aDustPosition", new THREE.BufferAttribute(dustPositions, 3));
  geometry.setAttribute("aNebulaPosition", new THREE.BufferAttribute(nebulaPositions, 3));
  geometry.setAttribute("aPlanetPosition", new THREE.BufferAttribute(planetPositions, 4));
  geometry.setAttribute("aGalaxyData", new THREE.BufferAttribute(galaxyData, 4));
  geometry.setAttribute("aTurbulence", new THREE.BufferAttribute(turbulence, 3));
  geometry.setAttribute("aPointSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const particleUniforms = {
    uProgress: { value: 0 },
    uPlanetAmount: { value: 0 },
    uPlanetCenter: { value: new THREE.Vector2(0.46, -0.04) },
    uPlanetRadius: { value: 5.4 },
    uGalaxyScale: { value: new THREE.Vector2(1.5, 1.1) },
    uPixelRatio: { value: 1 },
    uNebulaScale: { value: new THREE.Vector3(1, 1, 1) },
    uNebulaCenter: { value: new THREE.Vector2(0, 0) },
    uPointer: { value: new THREE.Vector3(0, 0, 0) },
    uPointerVelocity: { value: new THREE.Vector2(0, 0) },
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
  particles.renderOrder = 2;
  scene.add(particles);

  const ambientCount = ambientStarBudget(window.innerWidth, navigator.hardwareConcurrency || 8);
  const ambientData = createAmbientAttributes(ambientCount);
  const ambientGeometry = new THREE.BufferGeometry();
  ambientGeometry.setAttribute("position", new THREE.BufferAttribute(ambientData.coordinates, 3));
  ambientGeometry.setAttribute("aSeed", new THREE.BufferAttribute(ambientData.seeds, 1));
  ambientGeometry.setAttribute("aPointSize", new THREE.BufferAttribute(ambientData.sizes, 1));
  const ambientUniforms = {
    uTravel: { value: 0 },
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uIntensity: { value: 1 },
  };
  const ambientMaterial = new THREE.ShaderMaterial({
    uniforms: ambientUniforms,
    vertexShader: ambientVertexShader,
    fragmentShader: ambientFragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const ambientStars = new THREE.Points(ambientGeometry, ambientMaterial);
  ambientStars.frustumCulled = false;
  ambientStars.renderOrder = -1;
  scene.add(ambientStars);

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

  function disposeSceneResources() {
    geometry.dispose();
    particleMaterial.dispose();
    ambientGeometry.dispose();
    ambientMaterial.dispose();
    nebulaGeometry.dispose();
    nebulaMaterial.dispose();
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
    ambientUniforms.uTravel.value = reducedMotion ? 0 : travelAmount(progress);
    ambientUniforms.uIntensity.value = 1 - smoothPhase(0.62, 0.88, progress) * 0.62;
    nebulaUniforms.uVisibility.value = formationHaze(progress);
  }

  function render() {
    if (disposed || contextLost || !isSceneVisible()) return;
    const now = performance.now();
    pointer?.step(Math.max(0, (now - lastRenderTime) / 1000));
    lastRenderTime = now;
    if (pointer) {
      particleUniforms.uPointer.value.set(pointer.value.x, pointer.value.y, pointer.value.strength);
      particleUniforms.uPointerVelocity.value.set(pointer.value.velocityX, pointer.value.velocityY);
    }
    updateUniforms();
    const time = reducedMotion ? 0 : animationClock.sample(now);
    particleUniforms.uMotionTime.value = time;
    ambientUniforms.uTime.value = time;
    nebulaUniforms.uTime.value = time;

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
    // The camera and ambient stars stay fixed; only destinations are framed.
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
    particleUniforms.uPlanetCenter.value.set(width < 768 ? 0 : 0.45, width < 768 ? -0.28 : -0.04);
    particleUniforms.uPlanetRadius.value = width < 768 ? 3.4 : width <= 991 ? 4.2 : 5.4;
    particleUniforms.uGalaxyScale.value.set(width < 768 ? 1.1 : width <= 991 ? 1.25 : 1.5,
      width < 768 ? 0.85 : 1.1);
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
    particleUniforms.uPixelRatio.value = pixelRatio;
    ambientUniforms.uPixelRatio.value = pixelRatio;
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
    setPlanetAmount(amount) {
      if (disposed) return;
      planetAmount = THREE.MathUtils.clamp(amount, 0, 1);
      particleUniforms.uPlanetAmount.value = reducedMotion ? 1 : planetAmount;
      scheduleRender();
    },
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
      particleUniforms.uPlanetAmount.value = reducedMotion ? 1 : planetAmount;
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
