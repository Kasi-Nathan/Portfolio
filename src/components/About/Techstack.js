import React from "react";
import { Col, Row } from "react-bootstrap";
// import { SiCsharp } from "react-icons/cg";
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
  SiCsharp
} from "react-icons/si";

function Techstack() {
  const technologies = [
    [<DiJavascript1 />, "JavaScript"], [<SiTypescript />, "TypeScript"],
    [<DiNodejs />, "Node.js"], [<DiReact />, "React"], [<DiMysql />, "MySQL"],
    [<DiMongodb />, "MongoDB"], [<SiNextdotjs />, "Next.js"], [<DiGit />, "Git"],
    [<SiCsharp />, "C#"], [<SiPostgresql />, "PostgreSQL"], [<DiPython />, "Python"], [<DiJava />, "Java"],
  ];
  return (
    <Row className="about-tech-grid">
      {technologies.map(([icon, name]) => (
        <Col xs={6} sm={4} md={3} lg={2} key={name}>
          <div className="about-tech-card hover-target" tabIndex="0">
            <span className="about-tech-icon">{icon}</span>
            <h3>{name}</h3>
            <span className="about-tech-accent" aria-hidden="true" />
          </div>
        </Col>
      ))}
    </Row>
  );
}

export default Techstack;
