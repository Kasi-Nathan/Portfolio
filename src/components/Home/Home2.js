import React from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import settings from "../../data/settings.json";
import projectData from "../../data/projects.json";
import {
  AiFillGithub,
  AiOutlineCode,
  AiOutlineArrowRight,
  AiOutlineExperiment,
  AiOutlineMail,
} from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";
import { CgFileDocument } from "react-icons/cg";
import { BsStars } from "react-icons/bs";

const projects = projectData.projects;
const featuredProjects = projects.filter((project) => project.priority);

const buildFocusAreas = [
  {
    title: "AI-assisted Web Apps",
    icon: <BsStars />,
    text: "I build practical tools that use AI to explain, recommend, and guide decisions inside real user workflows.",
  },
  {
    title: "User-focused Interfaces",
    icon: <AiOutlineCode />,
    text: "I care about clear screens, readable actions, responsive layouts, and interactions that feel natural to use.",
  },
  {
    title: "Machine Learning Projects",
    icon: <AiOutlineExperiment />,
    text: "I work on applied ML projects where models, data, and web systems come together in understandable ways.",
  },
];

function Home2() {

  return (
    <Container fluid className="home-about-section">
      <Container>
        <section className="featured-work-section" id="featured-work" aria-labelledby="featured-work-heading">
          <div className="home-section-heading">
            <div>
              <span className="home-section-kicker">Selected work</span>
              <h2 id="featured-work-heading">Projects with a <span>clear purpose.</span></h2>
            </div>
            <p>A selection of products spanning AI-assisted planning, applied machine learning, and full-stack product development.</p>
          </div>
          <Row className="featured-work-grid">
            {featuredProjects.map((project, index) => (
              <Col md={index === 0 ? 8 : 4} className="featured-work-col" key={project.id}>
                <article className={`featured-work-card ${index === 0 ? "featured-work-card-primary" : ""}`}>
                  {project.image && (
                    <div className="featured-work-image"><img src={project.image} alt={`${project.title} preview`} /></div>
                  )}
                  <div className="featured-work-body">
                    <span className="featured-work-number">0{index + 1}</span>
                    <h2>{project.title}</h2>
                    <p>{project.summary}</p>
                    <span className="featured-work-stack">{project.techStack}</span>
                  </div>
                </article>
              </Col>
            ))}
          </Row>
          <Button as={Link} to="/project" className="featured-work-btn" aria-label="View all portfolio projects">
            View all projects <AiOutlineArrowRight />
          </Button>
        </section>

        <section
          className="home-quick-about"
          aria-labelledby="quick-about-heading"
          data-aos="fade-up"
          data-aos-offset="0"
          data-aos-duration="400"
          data-aos-easing="ease-out"
        >
          <span className="home-section-kicker">How I work</span>
          <h2 id="quick-about-heading" className="home-centered-heading">From an idea to a <span>useful experience.</span></h2>
          <p className="home-build-intro">
            I combine frontend development, AI-assisted workflows, and applied machine learning to create practical software with clear user journeys.
          </p>
          <Row className="home-build-grid">
            {buildFocusAreas.map((area) => (
              <Col md={4} className="home-build-col" key={area.title}>
                <article className="home-build-card">
                  <span className="home-build-icon" aria-hidden="true">{area.icon}</span>
                  <h2>{area.title}</h2>
                  <p>{area.text}</p>
                </article>
              </Col>
            ))}
          </Row>
        </section>

        <section className="contact-cta-section" aria-labelledby="contact-cta-heading">
          <span className="home-section-kicker">Start a conversation</span>
          <h2 id="contact-cta-heading">Have an idea worth building?</h2>
          <p>
            Interested in working together, discussing a project, or sharing an opportunity? I'm open to working student roles, web development projects, and AI-assisted software ideas.
          </p>
          <div className="contact-cta-actions">
            <Button href="mailto:kasinathanm0203@gmail.com" variant="primary" aria-label="Email Kasi Nathan Murugan">
              <AiOutlineMail /> Email
            </Button>
            <Button href="https://www.linkedin.com/in/kasinathan/" target="_blank" rel="noreferrer" variant="primary" aria-label="Open LinkedIn profile">
              <FaLinkedinIn /> LinkedIn
            </Button>
            <Button href="https://github.com/Kasi-Nathan/" target="_blank" rel="noreferrer" variant="primary" aria-label="Open GitHub profile">
              <AiFillGithub /> GitHub
            </Button>
            <Button href={settings.resumeUrl} target="_blank" rel="noreferrer" variant="primary" aria-label="Download resume PDF">
              <CgFileDocument /> Download Resume
            </Button>
          </div>
        </section>
      </Container>
    </Container>
  );
}

export default Home2;
