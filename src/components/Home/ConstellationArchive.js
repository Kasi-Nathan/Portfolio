import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import projectData from "../../data/projects.json";
import { useGalaxyTransition } from "../Projects/GalaxyTransition";
import "./ConstellationArchive.css";

const archiveIds = ["bone-disease-prediction", "educational-chatbot", "window-swap-clone"];
export const archiveProjects = archiveIds.map(id => projectData.projects.find(project => project.id === id)).filter(Boolean);

function ArchiveImage({ project }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="archive-visual">
      <svg className="archive-orbits" viewBox="0 0 800 600" aria-hidden="true" focusable="false">
        <ellipse cx="400" cy="300" rx="340" ry="205" transform="rotate(-22 400 300)" />
        <ellipse cx="400" cy="300" rx="285" ry="242" transform="rotate(25 400 300)" />
        <path d="M112 410 237 181 608 126 710 389 492 493 112 410" />
        <circle cx="237" cy="181" r="4" /><circle cx="608" cy="126" r="3" />
        <circle cx="710" cy="389" r="5" /><circle cx="112" cy="410" r="3" />
      </svg>
      <div className="archive-screenshot">
        {project.image && !failed ? (
          <img src={project.image} alt={`${project.title} project screenshot`} loading="lazy" decoding="async" onError={() => setFailed(true)} />
        ) : (
          <div className="archive-image-fallback" role="img" aria-label={`${project.title} screenshot unavailable`}>
            Preview unavailable
          </div>
        )}
      </div>
      <span className="archive-visual-label" aria-hidden="true">ARCHIVE / {project.id.replaceAll("-", " ")}</span>
    </div>
  );
}

export default function ConstellationArchive() {
  const sectionRef = useRef(null);
  const { travelToGalaxy } = useGalaxyTransition();

  const exploreAll = event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
    event.preventDefault();
    travelToGalaxy();
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    section.classList.add("archive--animate");
    section.querySelectorAll("[data-archive-reveal]").forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="constellation-archive" id="featured-work" aria-labelledby="archive-title">
      <div className="archive-heading" data-archive-reveal>
        <p className="archive-eyebrow">03 / THE CONSTELLATION ARCHIVE</p>
        <h2 id="archive-title">Ideas in <em>orbit.</em></h2>
        <p>Selected software projects, each built around a different question, workflow, or experience.</p>
      </div>
      <div className="archive-objects">
        {archiveProjects.map((project, index) => (
          <article className="archive-object" data-archive-reveal key={project.id} aria-labelledby={`archive-${project.id}`}>
            <ArchiveImage project={project} />
            <div className="archive-copy">
              <span className="archive-index">OBJECT 0{index + 1} / {project.priority ? "FEATURED" : "DISCOVERED"}</span>
              <h3 id={`archive-${project.id}`}>{project.title}</h3>
              <p>{project.summary}</p>
              <ul className="archive-tags" aria-label={`${project.title} technologies`}>
                {project.techStack.split(",").map(tag => tag.trim()).filter(Boolean).map(tag => <li key={tag}>{tag}</li>)}
              </ul>
              <div className="archive-links">
                {project.ghLink && <a href={project.ghLink} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>}
                {project.demoLink && <a href={project.demoLink} target="_blank" rel="noreferrer">Live demo <span aria-hidden="true">↗</span></a>}
                {project.imageLink && <Link to={project.imageLink}>Gallery <span aria-hidden="true">↗</span></Link>}
                {project.reportLink && <a href={project.reportLink} target="_blank" rel="noreferrer">Report <span aria-hidden="true">↗</span></a>}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="archive-footer" data-archive-reveal>
        <span>More objects in the archive</span>
        <Link to="/project" onClick={exploreAll}>Explore all projects <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}
