import React from "react";
import { Link, useParams } from "react-router-dom";
import projectData from "../../data/projects.json";
import "./ProjectDetail.css";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const project = projectData.projects.find(item => item.id === projectId);

  if (!project) return (
    <main className="project-detail">
      <div className="project-detail__inner">
        <h1 id="project-detail-title" tabIndex={-1}>Project unavailable</h1>
        <Link to="/project">Explore all projects</Link>
      </div>
    </main>
  );

  return (
    <main className="project-detail">
      <article className="project-detail__inner">
        <Link className="project-detail__back" to="/project">← All projects</Link>
        <p className="project-detail__eyebrow">THE CONSTELLATION ARCHIVE / PROJECT</p>
        <h1 id="project-detail-title" tabIndex={-1}>{project.title}</h1>
        <p className="project-detail__summary">{project.summary}</p>
        {project.image && <img className="project-detail__image" src={project.image} alt={`${project.title} project screenshot`} />}
        <ul className="project-detail__tags" aria-label="Technologies used">
          {project.techStack?.split(",").map(tag => tag.trim()).filter(Boolean).map(tag => <li key={tag}>{tag}</li>)}
        </ul>
        <div className="project-detail__story">
          {(project.sections || []).map(section => <section key={section.heading}><h2>{section.heading}</h2><p>{section.text}</p></section>)}
        </div>
        <nav className="project-detail__links" aria-label="Project links">
          {project.ghLink && <a href={project.ghLink} target="_blank" rel="noreferrer">GitHub ↗</a>}
          {project.demoLink && <a href={project.demoLink} target="_blank" rel="noreferrer">Live demo ↗</a>}
          {project.imageLink && <Link to={project.imageLink}>Gallery ↗</Link>}
          {project.reportLink && <a href={project.reportLink} target="_blank" rel="noreferrer">Report ↗</a>}
        </nav>
      </article>
    </main>
  );
}
