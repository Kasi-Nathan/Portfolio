import React from "react";
import { Container } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import projectData from "../../data/projects.json";
import "./Projects.css";

const projects = projectData.projects;


function Projects() {
  return (
    <main className="projects-page">
      <section
        className="projects-collection"
        aria-labelledby="projects-collection-title"
      >
        <Container>
          <div className="projects-section-heading">
            <div>
              <span className="projects-kicker">Case studies</span>
              <h2 id="projects-collection-title">
                Work with a <span>clear purpose.</span>
              </h2>
            </div>
            <p>
              Each project reflects a different challenge—from intelligent
              planning and prediction to accessible, responsive user interfaces.
            </p>
          </div>

          <div className="project-grid">
            {projects.map((project) => {
              const isFeatured = project.id === "smart-study-calendar";

              return (
              <div
                key={project.id}
                className={`project-card${isFeatured ? " project-card-featured" : ""}`}
              >
                <ProjectCard
                  {...project}
                  featured={isFeatured}
                  imgPath={project.image}
                  description={
                    <>
                      {(project.sections || []).map((section, index) => (
                        <React.Fragment key={`${project.id}-${index}`}>
                          <strong>{section.heading}</strong>
                          <p>{section.text}</p>
                        </React.Fragment>
                      ))}

                      {project.reportLink && (
                        <p>
                          <a
                            href={project.reportLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View project report
                          </a>
                        </p>
                      )}
                    </>
                  }
                />
              </div>
              );
            })}
          </div>
        </Container>
      </section>
    </main>
  );
}

export default Projects;