import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import codeEditor from "../../Assets/Projects/codeEditor.png";
import chatbot from "../../Assets/Projects/Education/chatbot1.png";
import Crypto from "../../Assets/Projects/Crypto/Crypto1.png";
import Bone from "../../Assets/Projects/BoneDisease/bone1.png";
import windowSwap from "../../Assets/Projects/WindowSwap.png";
import mucik from "../../Assets/Projects/mucik.png";
import elder from "../../Assets/Projects/elder.png";
import "./Projects.css";

function Projects() {
  return (
    <main className="projects-page">
      <section className="projects-collection" aria-labelledby="projects-collection-title">
        <Container>
          <div className="projects-section-heading">
            <div><span className="projects-kicker">Case studies</span><h2 id="projects-collection-title">Work with a <span>clear purpose.</span></h2></div>
            <p>Each project reflects a different challenge—from intelligent planning and prediction to accessible, responsive user interfaces.</p>
          </div>
        <Row className="project-grid">
          <Col md={12} className="project-card d-flex justify-content-center">
            <ProjectCard
              imgPath={codeEditor}
              title="Smart Study Calendar"
              priority
              summary="An AI-assisted study planning system for turning weekly goals into focused, adaptive schedules."
              techStack="React + Vite, Tailwind CSS, FastAPI, Gemini API"
              description={
                <>
                  <strong>What I built</strong>
                  <p>
                    I worked on a team project that combines a drag-and-drop weekly calendar, adaptive scheduling, and a focus model to help students plan study blocks around deadlines and workload.
                  </p>
                  <strong>AI feature</strong>
                  <p>
                    The app uses Gemini-powered explanations to make schedule decisions easier to understand, turning recommendations into clear guidance instead of opaque automation.
                  </p>
                  <strong>Result</strong>
                  <p>
                    This became the strongest portfolio project because it connects modern frontend architecture, a FastAPI backend, AI integration, and a real user workflow.
                  </p>
                </>
              }
            />
          </Col>

          <Col md={12} className="project-card d-flex justify-content-center">
            <ProjectCard
              imgPath={Bone}
              title="Bone Disease Prediction"
              priority
              summary="A final-year machine learning project focused on predicting bone disease risk with interpretable modeling."
              techStack="Python, Decision Trees, Machine Learning, Web/System Implementation"
              description={
                <>
                  <strong>What I built</strong>
                  <p>
                    I contributed to model selection, dataset preparation, evaluation, and system implementation for a team-based academic prediction workflow.
                  </p>
                  <strong>Academic context</strong>
                  <p>
                    The project was presented through ICIRIAC 2024 and published in AIP Conference Proceedings, giving the work a stronger research and documentation foundation.
                  </p>
                  <strong>Result</strong>
                  <p>
                    It strengthened my applied machine learning fundamentals and my ability to connect model behavior with a usable project interface.
                  </p>
                  <p>
                    <a href="https://drive.google.com/file/d/1wNdFI8vRc0KPOJK-pO7rxJZNUGinzYwJ/view?usp=drive_link" target="_blank" rel="noreferrer">
                      View project report
                    </a>
                  </p>
                </>
              }
              ghLink="https://github.com/Kasi-Nathan/Bone-Disease-Prediction-using-DecisionTree"
              imageLink="/bonegallery"
            />
          </Col>

          <Col md={12} className="project-card d-flex justify-content-center">
            <ProjectCard
              imgPath={Crypto}
              title="Real Time Cryptocurrency Tracker"
              priority
              summary="A responsive market dashboard for live cryptocurrency price tracking."
              techStack="HTML, CSS, JavaScript, Public APIs"
              description={
                <>
                  <strong>What I built</strong>
                  <p>
                    I integrated public market APIs and built a clear interface for displaying live crypto prices and market changes.
                  </p>
                  <strong>Product focus</strong>
                  <p>
                    The UI prioritizes quick scanning, responsive behavior, and readable data presentation so users can understand updates without extra friction.
                  </p>
                  <strong>Result</strong>
                  <p>
                    The project strengthened my async JavaScript skills and helped me think through real-time data states in the browser.
                  </p>
                  <p>
                    <a href="https://drive.google.com/file/d/1kSalTfYmTTtOF_eXQJ8vpf6X1EyUJWjA/view" target="_blank" rel="noreferrer">
                      View project report
                    </a>
                  </p>
                </>
              }
              imageLink="/cryptogallery"
              ghLink="https://github.com/Kasi-Nathan/Crypto_Currency_tracker_project"
            />
          </Col>

          <Col md={12} className="project-card d-flex justify-content-center">
            <ProjectCard
              imgPath={chatbot}
              title="Educational Chatbot"
              summary="A conversational learning interface for programming resources and guided exploration."
              techStack="React.js, UI Design, Frontend Development"
              description={
                <>
                  <strong>What I built</strong>
                  <p>
                    I created a responsive chat layout with categorized suggestions, a friendly onboarding flow, and organized programming resources.
                  </p>
                  <strong>User journey</strong>
                  <p>
                    The interface focuses on reducing friction for beginners by making resource discovery feel conversational and structured.
                  </p>
                  <strong>Result</strong>
                  <p>
                    The project improved my ability to design approachable technical interfaces and manage component-driven UI states.
                  </p>
                  <p>
                    <a href="https://drive.google.com/file/d/10k7gb0mIBhsFQ9mhWfNoQeo5S7uwR6KB/view?usp=drive_link" target="_blank" rel="noreferrer">
                      View project report
                    </a>
                  </p>
                </>
              }
              imageLink="/gallery"
            />
          </Col>

          <Col md={12} className="project-card d-flex justify-content-center">
            <ProjectCard
              imgPath={windowSwap}
              title="Window Swap Clone"
              secondary
              summary="A UI-focused frontend practice project inspired by a calm immersive browsing experience."
              techStack="React.js, CSS, Responsive UI"
              description={
                <>
                  <strong>What I built</strong>
                  <p>
                    I structured reusable React components for home, explore, and authentication screens while keeping the experience polished and responsive.
                  </p>
                  <strong>Design focus</strong>
                  <p>
                    The challenge was capturing the peaceful feel of the original idea without relying on live video content.
                  </p>
                  <strong>Result</strong>
                  <p>
                    The project strengthened my layout, component organization, and visual pacing skills.
                  </p>
                </>
              }
              ghLink="https://github.com/Kasi-Nathan/Window-swap-clone"
              demoLink="https://kasi-nathan.github.io/Window-swap-clone/"
            />
          </Col>

          <Col md={12} className="project-card d-flex justify-content-center">
            <ProjectCard
              imgPath={mucik}
              title="Music Player"
              secondary
              summary="A React-based music player with a polished playback control experience."
              techStack="React.js, State Management, UI/UX"
              description={
                <>
                  <strong>What I built</strong>
                  <p>
                    I implemented search, playback controls, track progress, and volume interaction in a clean state-driven interface.
                  </p>
                  <strong>Interaction focus</strong>
                  <p>
                    The project emphasized responsive controls and smooth transitions between common music player actions.
                  </p>
                  <strong>Result</strong>
                  <p>
                    It improved my understanding of interactive components and user feedback in frontend applications.
                  </p>
                </>
              }
              ghLink="https://github.com/Kasi-Nathan/rich-functional-music-player"
              demoLink="https://kasi-nathan.github.io/rich-functional-music-player/"
            />
          </Col>

          <Col md={12} className="project-card d-flex justify-content-center">
            <ProjectCard
              imgPath={elder}
              title="Elderly Care Clone"
              secondary
              summary="A frontend practice project focused on accessible, supportive UI design."
              techStack="HTML, CSS, JavaScript, Accessibility"
              description={
                <>
                  <strong>What I built</strong>
                  <p>
                    I built a responsive single-page layout inspired by an elderly care support website, with emphasis on clarity and simple navigation.
                  </p>
                  <strong>Accessibility focus</strong>
                  <p>
                    The interface uses readable structure, clear sections, and straightforward actions for users and caregivers.
                  </p>
                  <strong>Result</strong>
                  <p>
                    The project sharpened my UI fundamentals and attention to inclusive design.
                  </p>
                </>
              }
              demoLink="https://Kasi-Nathan.github.io/elderly-care/"
              ghLink="https://github.com/Kasi-Nathan/elderly-care"
            />
          </Col>
        </Row>
        </Container>
      </section>
    </main>
  );
}

export default Projects;
