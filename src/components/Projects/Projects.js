import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import Particle from "../Particle";
import chatbot from "../../Assets/Projects/Education/chatbot1.png";
import Crypto from "../../Assets/Projects/Crypto/Crypto1.png";
import Bone from "../../Assets/Projects/BoneDisease/bone1.png";
import windowSwap from "../../Assets/Projects/WindowSwap.png";
import suicide from "../../Assets/Projects/suicide.png";
import mucik from "../../Assets/Projects/mucik.png";
import elder from "../../Assets/Projects/elder.png";
import { Link } from "react-router-dom";

function Projects() {
  return (
    <Container fluid className="project-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
         <strong className="purple"> &lt;Projects&gt; </strong>
        </h1>
        <p style={{ color: "white" }}>
        </p>
        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          <Col md={12} className="project-card d-flex justify-content-center">

            <ProjectCard
              imgPath={windowSwap}
              isBlog={false}
              title="Window Swap Clone"
              description={
                <>
                  <strong>📌 Description:</strong>
                  <p>
                    A front-end redesign of the popular Window Swap app, built using React.js. The project focused on creating a calm and visually engaging interface inspired by the original platform, where users explore different window views from around the world.
                  </p>

                  <strong>⚙️ Challenges:</strong>
                  <p>
                    One of the main challenges was designing a layout that captures the peaceful atmosphere of the original app without using actual video content. It was also important to make the UI responsive and intuitive across different screen sizes.
                  </p>

                  <strong>✅ Solution:</strong>
                  <p>
                    Using React.js, I designed a clean and minimal interface with soft colors and smooth transitions. I created components for the home page, login, signup, and explore sections, making sure the user flow felt natural and relaxing. Instead of video content, I used static placeholders to simulate the experience. The focus was on delivering a smooth and aesthetic design that reflects the mood of the original app.
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
              isBlog={false}
              title="Music Player"
              description={
                <>
                  <strong>📌 Description:</strong>
                  <p>
                    A feature-rich music player built with React.js, offering a seamless user experience for listening to music. The app includes functionalities like search, play, pause, next, previous, volume control, and track progress. It’s currently in development to integrate backend features for storing and managing playlists and user data.
                  </p>

                  <strong>⚙️ Challenges:</strong>
                  <p>
                    The challenge was to design a smooth and interactive UI that feels responsive across devices while incorporating essential music control features. Another challenge was ensuring the audio controls were intuitive and easy to use while handling multiple audio tracks efficiently.
                  </p>

                  <strong>✅ Solution:</strong>
                  <p>
                    Using React.js, I built a clean, interactive interface with components for search, track controls (play, pause, next, previous), and volume adjustments. I focused on keeping the layout intuitive and user-friendly. The app currently supports all essential music controls, and I used state management to handle track progress and transitions. The next step is to integrate backend functionality to allow users to store playlists, manage tracks, and save preferences.
                  </p>
                </>
              }
              ghLink="https://github.com/Kasi-Nathan/rich-functional-music-player"
              demoLink="https://kasi-nathan.github.io/rich-functional-music-player/"
            />
          </Col>

          <Col md={12} className="project-card d-flex justify-content-center">
            <ProjectCard
              imgPath={Bone}
              isBlog={false}
              title="Bone Disease Prediction"
              description={
                <>
                  <strong>📌 Description:</strong>
                  <p>
                    A team-based machine learning solution developed to predict bone diseases using a simple sample dataset. The model utilizes the C4.5 algorithm, a decision tree-based technique, to classify the likelihood of a bone disease based on input features such as age, medical history, and symptoms. The app currently performs predictions based on a pre-trained model and is designed to offer insights into potential risks of bone-related conditions. This project was successfully presented and published in the ICIRIAC conference proceedings ([DOI: 10.1063/5.0247680](https://doi.org/10.1063/5.0247680)).
                  </p>

                  <strong>⚙️ Challenges:</strong>
                  <p>
                    One of the main challenges was ensuring the accuracy of the model with a limited dataset, which required careful feature selection and preprocessing. Additionally, optimizing the C4.5 algorithm for better predictive performance while avoiding overfitting was crucial for the model's generalization across different test cases.
                  </p>

                  <strong>✅ Solution:</strong>
                  <p>
                    Our team applied the C4.5 algorithm, fine-tuning hyperparameters and ensuring efficient feature engineering to improve prediction accuracy. The model outperformed regression-based models in terms of prediction accuracy.
                  </p>
                  <p><Link to="https://drive.google.com/file/d/1wNdFI8vRc0KPOJK-pO7rxJZNUGinzYwJ/view?usp=drive_link">Click here</Link> to see project report </p>
                </>
              }

              ghLink="https://github.com/Kasi-Nathan/Bone-Disease-Prediction-using-DecisionTree"
              imageLink="/bonegallery"
            />
          </Col>

          <Col md={12} className="project-card d-flex justify-content-center">
            <ProjectCard
              imgPath={chatbot}
              isBlog={false}
              title="Chatbot for education"

              description={
                <>
                  <strong>📌 Description:</strong>
                  <p>
                    A front-end chatbot interface designed with React.js to help users discover learning resources for different programming languages and engage in basic, casual conversations. The aim was to create an educational tool that feels both helpful and approachable.
                  </p>

                  <strong>⚙️ Challenges:</strong>
                  <p>
                    Designing a chat interface that balances clarity, friendliness, and ease of use was a key challenge. It also needed to present programming resources in an organized way without overwhelming the user.
                  </p>

                  <strong>✅ Solution:</strong>
                  <p>
                    Using React.js, I built a responsive and interactive layout with separate components for the chat window, user input, and suggested links. The interface includes features like language selection, a friendly welcome screen, and categorized programming resources. The clean design and simple flow make it easy for users to explore learning paths and interact naturally with the chatbot.
                  </p>
                  
                  <p><Link to="https://drive.google.com/file/d/10k7gb0mIBhsFQ9mhWfNoQeo5S7uwR6KB/view?usp=drive_link">Click here</Link> to see project report </p>
                </>
              }

              imageLink="/gallery"
            />
          </Col>

          <Col md={12} className="project-card d-flex justify-content-center">
            <ProjectCard
              imgPath={Crypto}
              isBlog={false}
              title="Real Time Crypto Currency Tracker"
              description={
                <>
                  <strong>📌 Description:</strong>
                  <p>
                    A real-time cryptocurrency tracker built using HTML, CSS, and JavaScript. The app allows users to view live market prices of various cryptocurrencies, providing them with instant updates to stay informed about the latest market trends.
                  </p>

                  <strong>⚙️ Challenges:</strong>
                  <p>
                    The biggest challenge was ensuring real-time data updates without causing delays or performance issues. I also needed to design an interface that presents data clearly and concisely, allowing users to quickly understand the price trends.
                  </p>

                  <strong>✅ Solution:</strong>
                  <p>
                    Using JavaScript and integrating with public APIs, I developed a responsive interface that fetches and displays live cryptocurrency prices. The design focuses on clarity and simplicity, with elements like price charts and real-time updates being the key focus. I used asynchronous requests to ensure smooth and timely data fetching, providing users with accurate and up-to-date information.
                  </p>
                  <p><Link to="https://drive.google.com/file/d/1kSalTfYmTTtOF_eXQJ8vpf6X1EyUJWjA/view">Click here</Link> to see project report </p>
                </>
              }

              imageLink="/cryptogallery"
              ghLink="https://github.com/Kasi-Nathan/Crypto_Currency_tracker_project"


            />
          </Col>

          <Col md={12} className="project-card d-flex justify-content-center">
            <ProjectCard
              imgPath={elder}
              isBlog={false}
              title="Elderly Care (Pudhiya Padhai foundation- Clone)"
              description={
                <>
                  <strong>📌 Description:</strong>
                  <p>
                    An elderly care support website clone of the Pudhiya Padhai Foundation, designed using HTML, CSS, and JavaScript. The platform serves as an informational and supportive space, aimed at families seeking care solutions for senior citizens. It emphasizes user-friendly UI/UX design tailored to elderly users and their caregivers, functioning entirely on the front end without any backend integration.
                  </p>

                  <strong>⚙️ Challenges:</strong>
                  <p>
                    The main challenge was designing a clean and accessible user interface suitable for older users. This included thoughtful use of font sizes, color contrasts, and simple navigation structures. Organizing static content like services, mission statements, and contact information into an intuitive and responsive layout also required careful planning.
                  </p>

                  <strong>✅ Solution:</strong>
                  <p>
                    Using semantic HTML for structure and CSS for responsive, clean styling, I built a single-page website that prioritizes clarity and usability. JavaScript was implemented for smooth scrolling, interactive buttons, and form validation. Accessibility best practices were followed throughout the design, making the site readable, easy to navigate, and device-friendly. The result is a user-centric UI that effectively communicates the goals and offerings of the original Pudhiya Padhai Foundation website.
                  </p>
                </>

              }
              demoLink="https://Kasi-Nathan.github.io/elderly-care/"
              ghLink="https://github.com/Kasi-Nathan/elderly-care"




            />
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default Projects;
