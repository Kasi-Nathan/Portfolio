import React from "react";
import { AiOutlineCode, AiOutlineExperiment, AiOutlineBulb } from "react-icons/ai";

const interests = [
  { icon: <AiOutlineCode />, title: "Modern web development", text: "Clear, responsive interfaces built around real user needs." },
  { icon: <AiOutlineExperiment />, title: "AI and applied ML", text: "Intelligent features that support decisions and useful workflows." },
  { icon: <AiOutlineBulb />, title: "Product thinking", text: "Thoughtful systems where implementation and experience reinforce each other." },
];

function AboutCard() {
  return (
    <div className="about-story-body">
      <p>
        I’m <strong>Kasi Nathan Murugan</strong>, a Master’s student in Philosophy &amp; Computer Science at the University of Bayreuth, with a B.Tech in Information Technology. My interests span web development, AI-assisted systems, machine learning, and user-centered software.
      </p>
      <p>
        I enjoy building practical tools with clear interfaces and thoughtful interactions—especially projects that pair strong technical implementation with a meaningful user experience.
      </p>
      <div className="about-interest-list">
        {interests.map((interest) => (
          <article className="about-interest" key={interest.title}>
            <span aria-hidden="true">{interest.icon}</span>
            <div><h3>{interest.title}</h3><p>{interest.text}</p></div>
          </article>
        ))}
      </div>
      <p className="about-personal-note">Away from the screen, I enjoy travelling, cooking, and following ideas into unfamiliar territory.</p>
    </div>
  );
}

export default AboutCard;
