import React, { useEffect } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AiOutlineArrowRight, AiOutlineDownload } from "react-icons/ai";
import Particle from "../Particle";
import Home2 from "./Home2";
import portrait from "../../Assets/me.png";
import pdf from "../../Assets/CV.pdf";
import Aos from "aos";
import "./Home.css";

function Home() {
  useEffect(() => {
    Aos.init({ duration: 700, easing: "ease-out-cubic", offset: 60, once: true });
  }, []);

  return (
    <main className="portfolio-home">
      <section className="home-hero" id="home" aria-labelledby="home-title">
        <Particle />
        <div className="home-hero-glow home-hero-glow-one" />
        <div className="home-hero-glow home-hero-glow-two" />
        <Container className="home-hero-container">
          <Row className="align-items-center home-hero-row">
            <Col lg={7} className="home-hero-copy" data-aos="fade-up">
              <div className="home-eyebrow">
                <span className="home-status-dot" aria-hidden="true" />
                Computer Science + Philosophy student
              </div>
              <h1 id="home-title">
                I build thoughtful digital products where
                <span> code meets intelligence.</span>
              </h1>
              <p className="home-hero-lead">
                I’m Kasi Nathan Murugan, a software developer focused on clean frontend experiences, AI-assisted workflows, and practical machine learning.
              </p>
              <div className="home-hero-actions">
                <Button as={Link} to="/project" className="home-primary-action">
                  Explore my work <AiOutlineArrowRight />
                </Button>
                <Button href={pdf} target="_blank" rel="noreferrer" className="home-secondary-action">
                  <AiOutlineDownload /> Resume
                </Button>
              </div>
              <div className="home-capabilities" aria-label="Core capabilities">
                <span>Frontend development</span>
                <span>AI integration</span>
                <span>Applied ML</span>
              </div>
            </Col>
            <Col lg={5} className="home-portrait-col" data-aos="fade-left" data-aos-delay="150">
              <div className="home-portrait-frame">
                <div className="home-portrait-ring" />
                <img src={portrait} alt="Kasi Nathan Murugan" />
                <div className="home-portrait-card home-portrait-card-top">
                  <span>Focus</span>
                  Human-centered software
                </div>
                <div className="home-portrait-card home-portrait-card-bottom">
                  <span>Based in</span>
                  Germany
                </div>
              </div>
            </Col>
          </Row>
        </Container>
        <a className="home-scroll-cue" href="#featured-work" aria-label="Scroll to featured work">
          <span /> Scroll to explore
        </a>
      </section>
      <Home2 />
    </main>
  );
}

export default Home;
