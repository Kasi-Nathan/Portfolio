import React, { useEffect } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import pdf from "../../Assets/CV.pdf";
import codeEditor from "../../Assets/Projects/codeEditor.png";
import Bone from "../../Assets/Projects/BoneDisease/bone1.png";
import Crypto from "../../Assets/Projects/Crypto/Crypto1.png";
import Aos from "aos";
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

const featuredProjects = [
  {
    title: "Smart Study Calendar",
    image: codeEditor,
    summary: "AI-assisted planning with adaptive scheduling, Gemini explanations, and a drag-and-drop weekly calendar.",
    stack: "React + Vite, Tailwind, FastAPI, Gemini",
  },
  {
    title: "Bone Disease Prediction",
    image: Bone,
    summary: "Final-year machine learning project for interpretable bone disease risk prediction.",
    stack: "Python, Machine Learning, Decision Trees",
  },
  {
    title: "Cryptocurrency Tracker",
    image: Crypto,
    summary: "Responsive live-market dashboard for clear cryptocurrency price tracking.",
    stack: "HTML, CSS, JavaScript, APIs",
  },
];

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
  useEffect(() => {
    const isSmallScreen = window.innerWidth < 768;

    Aos.init({
      duration: 700,
      offset: isSmallScreen ? 100 : 300,
      easing: "ease-out",
    });
  }, []);

  return (
    <Container fluid className="home-about-section">
      <Container>
        <section className="featured-work-section" id="featured-work" aria-labelledby="featured-work-heading">
          <div className="home-section-heading">
            <div>
              <span className="home-section-kicker">Selected work</span>
              <h2 id="featured-work-heading">Projects with a <span>clear purpose.</span></h2>
            </div>
            <p>A selection of products spanning AI-assisted planning, applied machine learning, and real-time interfaces.</p>
          </div>
          <Row className="featured-work-grid">
            {featuredProjects.map((project, index) => (
              <Col md={index === 0 ? 8 : 4} className="featured-work-col" key={project.title}>
                <article className={`featured-work-card ${index === 0 ? "featured-work-card-primary" : ""}`}>
                  <div className="featured-work-image"><img src={project.image} alt={`${project.title} preview`} /></div>
                  <div className="featured-work-body">
                    <span className="featured-work-number">0{index + 1}</span>
                    <h2>{project.title}</h2>
                    <p>{project.summary}</p>
                    <span className="featured-work-stack">{project.stack}</span>
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
            <Button href={pdf} target="_blank" rel="noreferrer" variant="primary" aria-label="Download resume PDF">
              <CgFileDocument /> Download Resume
            </Button>
          </div>
        </section>
      </Container>
    </Container>
  );
}

export default Home2;
