import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import projectData from "../../data/projects.json";
import { useProjectWormhole } from "./ProjectWormhole";
import { ParticlePlanet, ParticleStarfield } from "./ProjectParticles";
import "./ProjectGalaxy.css";

const projects = projectData.projects;

function ProjectImage({ project }) {
  const [failed, setFailed] = useState(false);
  if (!project.image || failed) return <div className="galaxy-image-fallback" role="img" aria-label={`${project.title} preview unavailable`}>Preview unavailable</div>;
  return <img src={project.image} alt={`${project.title} project screenshot`} loading="lazy" onError={() => setFailed(true)} />;
}

export default function Projects() {
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [mobileParticles, setMobileParticles] = useState(() => window.innerWidth < 768);
  const { travelTo, activeProjectId } = useProjectWormhole();
  const selected = projects.find(project => project.id === selectedId);

  useEffect(() => {
    const updateBudget = () => setMobileParticles(window.innerWidth < 768);
    window.addEventListener("resize", updateBudget);
    return () => window.removeEventListener("resize", updateBudget);
  }, []);

  const explore = event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
    event.preventDefault();
    const planet = document.querySelector(`.galaxy-world--selected .galaxy-world__planet`);
    travelTo(selectedId, planet, projects.findIndex(project => project.id === selectedId));
  };

  return <main className={`projects-page project-galaxy${activeProjectId ? " project-galaxy--departing" : ""}`}>
    <div className="galaxy-stars galaxy-stars--near" aria-hidden="true" />
    <div className="galaxy-stars galaxy-stars--far" aria-hidden="true" />
    <ParticleStarfield className="galaxy-stars galaxy-stars--particles" />
    <div className="galaxy-inner">
      <header className="galaxy-heading">
        <p>THE PROJECT GALAXY / COMPLETE ARCHIVE</p>
        <h1 id="galaxy-title" tabIndex={-1}>Explore the <em>universe.</em></h1>
        <span>Select a world to discover the work behind it.</span>
      </header>
      <div className="galaxy-layout">
        <div className="galaxy-map" aria-label="Projects in the galaxy">
          <div className="galaxy-orbit galaxy-orbit--one" aria-hidden="true" />
          <div className="galaxy-orbit galaxy-orbit--two" aria-hidden="true" />
          <div className="galaxy-orbit galaxy-orbit--three" aria-hidden="true" />
          {projects.map((project, index) => <button
            type="button"
            className={`galaxy-world galaxy-world--${index % 8}${selectedId === project.id ? " galaxy-world--selected" : ""}`}
            key={project.id}
            aria-label={`Select ${project.title}`}
            aria-pressed={selectedId === project.id}
            onClick={() => setSelectedId(project.id)}
            onMouseEnter={() => setHoveredId(project.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setHoveredId(project.id)}
            onBlur={() => setHoveredId(null)}
          >
            <span className="galaxy-world__planet" aria-hidden="true"><ParticlePlanet identity={project.id} index={index} mobile={mobileParticles} /></span>
            <span className="galaxy-world__name">{project.title}</span>
            {hoveredId === project.id && <span className="galaxy-world__signal" aria-hidden="true" />}
          </button>)}
        </div>
        <aside className="galaxy-panel" aria-live="polite" aria-label="Selected project">
          {selected ? <div key={selected.id} className="galaxy-panel__content">
            <p className="galaxy-panel__eyebrow">PROJECT DISCOVERED</p>
            <h2>{selected.title}</h2>
            <p className="galaxy-panel__summary">{selected.summary}</p>
            {selected.sections?.[0] && <p className="galaxy-panel__description">{selected.sections[0].text}</p>}
            <ProjectImage project={selected} />
            <ul className="galaxy-panel__tags" aria-label="Technologies used">{selected.techStack?.split(",").map(tag => tag.trim()).filter(Boolean).map(tag => <li key={tag}>{tag}</li>)}</ul>
            <div className="galaxy-panel__links">
              <Link to={`/project/${selected.id}`} onClick={explore}>Explore Project ↗</Link>
              {selected.ghLink && <a href={selected.ghLink} target="_blank" rel="noreferrer">GitHub ↗</a>}
              {selected.demoLink && <a href={selected.demoLink} target="_blank" rel="noreferrer">Live demo ↗</a>}
              {selected.imageLink && <Link to={selected.imageLink}>Gallery ↗</Link>}
              {selected.reportLink && <a href={selected.reportLink} target="_blank" rel="noreferrer">Report ↗</a>}
            </div>
          </div> : <div className="galaxy-panel__empty"><span aria-hidden="true">✧</span><p>Choose a planet to reveal its mission.</p></div>}
        </aside>
      </div>
    </div>
  </main>;
}
