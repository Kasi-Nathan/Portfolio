import React from "react";
import { Button, Container } from "react-bootstrap";
import settings from "../../data/settings.json";
import {
  AiFillGithub,
  AiOutlineMail,
} from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";
import { CgFileDocument } from "react-icons/cg";
import BeyondStars from "./BeyondStars";
import ConstellationArchive from "./ConstellationArchive";

function Home2() {

  return (
    <Container fluid className="home-about-section">
      <Container>
        <BeyondStars />

        <ConstellationArchive />

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
