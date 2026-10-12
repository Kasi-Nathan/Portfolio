import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import projects from "../../data/projects.json";

import codeEditor from "../../Assets/Projects/codeEditor.png";
import chatbot from "../../Assets/Projects/Education/chatbot1.png";
import Crypto from "../../Assets/Projects/Crypto/Crypto1.png";
import Bone from "../../Assets/Projects/BoneDisease/bone1.png";
import windowSwap from "../../Assets/Projects/WindowSwap.png";
import elder from "../../Assets/Projects/elder.png";
import "./Projects.css";

const projectImages = {
  codeEditor,
  chatbot,
  crypto: Crypto,
  bone: Bone,
  windowSwap,
  elder,
};

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

          <Row className="project-grid">
            {projects.map((project) => (
              <Col
                key={project.id}
                md={12}
                className="project-card d-flex justify-content-center"
              >
                <ProjectCard
                  {...project}
                  imgPath={projectImages[project.image]}
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
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </main>
  );
}

export default Projects;