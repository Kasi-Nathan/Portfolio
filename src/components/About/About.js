import React from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AiOutlineArrowRight, AiOutlineDownload } from "react-icons/ai";

import Techstack from "./Techstack";
import Aboutcard from "./AboutCard";
import laptopImg from "../../Assets/tech.jpg";
import settings from "../../data/settings.json";
import education from "../../data/education";
import Toolstack from "./Toolstack";
import "./About.css";

function About() {

  return (
    <main className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <Container>
          <Row className="align-items-center about-hero-row">
            <Col lg={7} data-aos="fade-up">
              <span className="about-kicker">More than a developer</span>
              <h1 id="about-title">Curious by nature.<br /><span>Practical by design.</span></h1>
              <p className="about-hero-lead">
                I bring together computer science, philosophy, and product thinking to build software that is technically sound and genuinely useful.
              </p>
              <div className="about-hero-actions">
                <Button as={Link} to="/project" className="about-primary-action">
                  See what I build <AiOutlineArrowRight />
                </Button>
                <Button href={settings.resumeUrl} target="_blank" rel="noreferrer" className="about-secondary-action">
                  <AiOutlineDownload /> Resume
                </Button>
              </div>
            </Col>
            <Col lg={5} className="about-hero-aside" data-aos="fade-left" data-aos-delay="120">
              <div className="about-education-card">
                <span className="about-card-label">Currently</span>
                <h2>{education.masters.degree}</h2>
                <p>{education.masters.institution}</p>
                <div className="about-card-divider" />
                <span className="about-card-label">Foundation</span>
                <h3>{education.bachelors.degree}</h3>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="about-story-section" aria-labelledby="about-story-title">
        <Container>
          <Row className="align-items-stretch">
            <Col lg={7} className="about-story-copy" data-aos="fade-up">
              <span className="about-kicker">My perspective</span>
              <h2 id="about-story-title">Technology should feel clear, considered, and <span>human.</span></h2>
              <Aboutcard />
            </Col>
            <Col lg={5} className="about-visual-col" data-aos="fade-up" data-aos-delay="100">
              <div className="about-visual">
                <img src={laptopImg} alt="Immersive technology concept" />
                <div className="about-visual-overlay">
                  <span>What drives me</span>
                  Turning complex ideas into approachable experiences.
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="about-stack-section" aria-labelledby="skills-title">
        <Container>
          <div className="about-section-heading">
            <div>
              <span className="about-kicker">Technical toolkit</span>
              <h2 id="skills-title">Tools I use to turn ideas into <span>working products.</span></h2>
            </div>
            <p>A practical stack spanning modern frontend development, backend systems, databases, and applied programming.</p>
          </div>
          <Techstack />

          <div className="about-tools-heading">
            <span className="about-kicker">Workflow</span>
            <h2>My everyday tools</h2>
          </div>
          <Toolstack />
        </Container>
      </section>
    </main>
  );
}

export default About;
