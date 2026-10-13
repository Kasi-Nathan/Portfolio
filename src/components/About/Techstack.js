import React from "react";
import { Col, Row } from "react-bootstrap";
import {
  DiJavascript1,
  DiReact,
  DiNodejs,
  DiMongodb,
  DiPython,
  DiGit,
  DiJava,
  DiMysql,
} from "react-icons/di";
import {
  SiNextdotjs,
  SiPostgresql,
  SiTypescript,
  SiCsharp,
} from "react-icons/si";
import skills from "../../data/skills.json";

const technologyIcons = {
  javascript: DiJavascript1,
  typescript: SiTypescript,
  nodejs: DiNodejs,
  react: DiReact,
  mysql: DiMysql,
  mongodb: DiMongodb,
  nextjs: SiNextdotjs,
  git: DiGit,
  csharp: SiCsharp,
  postgresql: SiPostgresql,
  python: DiPython,
  java: DiJava,
};

function Techstack() {
  return (
    <Row className="about-tech-grid">
      {skills.technologies.map((technology) => {
        const Icon = technologyIcons[technology.icon];

        return (
          <Col xs={6} sm={4} md={3} lg={2} key={technology.id}>
            <div className="about-tech-card hover-target" tabIndex="0">
              <span className="about-tech-icon" aria-hidden="true">
                {Icon ? <Icon /> : <span>◇</span>}
              </span>
              <h3>{technology.name}</h3>
              <span className="about-tech-accent" aria-hidden="true" />
            </div>
          </Col>
        );
      })}
    </Row>
  );
}

export default Techstack;