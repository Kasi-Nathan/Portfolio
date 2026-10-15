import React, { useEffect, useRef, useState } from "react";
import createSupernovaScene, { SUPERNOVA_THRESHOLDS } from "./SupernovaScene";
import "./SupernovaLab.css";

const stages = [
  { key: "star", title: "CYGNUS-01", designation: "Blue luminous variable // observation active" },
  { key: "supernova", title: "SUPERNOVA", designation: "A stellar event in progress" },
  { key: "cosmic-dust", title: "COSMIC DUST", designation: "The field becomes a world" },
  { key: "nebula", title: "NEBULA", designation: "Matter, gathered into color" },
];

function stageIndexAt(progress) {
  if (progress < SUPERNOVA_THRESHOLDS.star) return 0;
  if (progress < SUPERNOVA_THRESHOLDS.supernova) return 1;
  if (progress < SUPERNOVA_THRESHOLDS.nebula) return 2;
  return 3;
}

function revealProgress(start, end, progress) {
  const value = Math.min(1, Math.max(0, (progress - start) / (end - start)));
  return value * value * (3 - 2 * value);
}

function SupernovaLab() {
  const pageRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const [sceneStatus, setSceneStatus] = useState("loading");
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const page = pageRef.current;
    const canvas = canvasRef.current;
    if (!page || !canvas) return undefined;

    let scene;
    try {
      scene = createSupernovaScene(canvas, setSceneStatus);
    } catch (error) {
      setSceneStatus("unavailable");
      return undefined;
    }

    if (!scene) return undefined;
    sceneRef.current = scene;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    scene.setReducedMotion(motionPreference.matches);

    let scrollFrame = 0;
    function updateProgress() {
      scrollFrame = 0;
      const pageTop = window.scrollY + page.getBoundingClientRect().top;
      const scrollDistance = Math.max(1, page.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, (window.scrollY - pageTop) / scrollDistance));
      const eventReveal = revealProgress(0.29, 0.36, progress);
      const dustReveal = revealProgress(0.45, 0.56, progress);

      scene.setProgress(progress);
      page.style.setProperty("--supernova-event-reveal", eventReveal);
      page.style.setProperty("--supernova-event-offset", `${(1 - eventReveal) * 24}px`);
      page.style.setProperty("--supernova-dust-reveal", dustReveal);
      page.style.setProperty("--supernova-dust-offset", `${(1 - dustReveal) * 24}px`);
      setActiveStage((current) => {
        const next = stageIndexAt(progress);
        return current === next ? current : next;
      });
    }

    function scheduleProgress() {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress);
    }

    function onMotionPreferenceChange(event) {
      scene.setReducedMotion(event.matches);
      scheduleProgress();
    }

    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleProgress, { passive: true });
    if (motionPreference.addEventListener) {
      motionPreference.addEventListener("change", onMotionPreferenceChange);
    } else {
      motionPreference.addListener(onMotionPreferenceChange);
    }
    updateProgress();

    return () => {
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", scheduleProgress);
      if (motionPreference.removeEventListener) {
        motionPreference.removeEventListener("change", onMotionPreferenceChange);
      } else {
        motionPreference.removeListener(onMotionPreferenceChange);
      }
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  const currentStage = stages[activeStage];
  const fallbackVisible = sceneStatus === "unavailable" || sceneStatus === "lost";

  return (
    <main
      ref={pageRef}
      className={`supernova-lab supernova-lab--${sceneStatus}`}
      data-stage={currentStage.key}
      aria-label="Supernova animation laboratory"
    >
      <div className="supernova-scene-layer" aria-hidden="true">
        <canvas ref={canvasRef} className="supernova-scene-canvas" />
        <div className="supernova-static-fallback">
          <span className="supernova-static-star" />
        </div>
      </div>

      {fallbackVisible && (
        <p className="supernova-fallback-note" role="status">
          WebGL is unavailable. A static starfield is shown instead.
        </p>
      )}

      <div className="supernova-lab-content">
        <section className="supernova-stage supernova-stage-star" aria-labelledby="supernova-title">
          <div className="supernova-intro">
            <p className="supernova-kicker">Stellar observation // 01</p>
            <h1 id="supernova-title"><span>CYGNUS</span><b>-01</b></h1>
            <p className="supernova-classification">Luminous variable / pre-supernova candidate</p>
            <p className="supernova-stage-readout" aria-live="polite" aria-atomic="true">
              {currentStage.title} <span aria-hidden="true">/</span> {currentStage.designation}
            </p>
          </div>
        </section>

        <section className="supernova-stage supernova-stage-explosion" aria-labelledby="supernova-event-title">
          <div className="supernova-copy-panel">
            <p className="supernova-kicker">Stellar observation // 02</p>
            <h2 id="supernova-event-title">A star, becoming something else.</h2>
            <p>
              A quiet point of light reaches its limit. Energy breaks outward,
              carrying the first traces of a new structure into the dark.
            </p>
          </div>
        </section>

        <section className="supernova-stage supernova-stage-dust" aria-labelledby="supernova-dust-title">
          <div className="supernova-dust-content">
            <div className="supernova-copy-panel">
              <p className="supernova-kicker">Stellar observation // 03</p>
              <h2 id="supernova-dust-title">COSMIC DUST</h2>
              <p>
                The scattered field settles into a quiet backdrop. This HTML
                content remains readable and independent of the canvas.
              </p>
            </div>
            <div className="supernova-placeholder-grid">
              <article className="supernova-placeholder-card">
                <span>01 / Signal</span>
                <h3>Origins</h3>
                <p>Every lasting system begins as a small, clear signal.</p>
              </article>
              <article className="supernova-placeholder-card">
                <span>02 / Structure</span>
                <h3>Connections</h3>
                <p>Ideas find shape when separate elements begin to relate.</p>
              </article>
              <article className="supernova-placeholder-card">
                <span>03 / Continuum</span>
                <h3>Possibility</h3>
                <p>What remains in motion can become something entirely new.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="supernova-stage supernova-stage-nebula" aria-labelledby="supernova-nebula-title">
          <div className="supernova-copy-panel supernova-nebula-panel">
            <p className="supernova-kicker">Stellar observation // 04</p>
            <h2 id="supernova-nebula-title">A new constellation.</h2>
            <p>
              At the edge of the journey, the fragments gather again: not back
              into a star, but into a field with its own gravity and color.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default SupernovaLab;
