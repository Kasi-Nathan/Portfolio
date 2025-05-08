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
  SiRedis,
  SiFirebase,
  SiNextdotjs,
  SiSolidity,
  SiPostgresql,
  SiTypescript,
  SiCsharp
} from "react-icons/si";

function Techstack() {
  return (
    <Row style={{ justifyContent: "center", paddingBottom: "50px" }}>
     
      <Col xs={4} md={2} className="tech-icons">
        <DiJavascript1 />
        <span className="tooltip">Javascript</span>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiTypescript />
        <span className="tooltip">TypeScript</span>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <DiNodejs />
        <span className="tooltip">Node.js</span>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <DiReact />
        <span className="tooltip">React.js</span>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <DiMysql />
        <span className="tooltip">MySQL</span>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <DiMongodb />
        <span className="tooltip">Mongodb</span>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiNextdotjs />
        <span className="tooltip">Next.js</span>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <DiGit /> <span className="tooltip">Git</span>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiCsharp/>  <span className="tooltip">C#</span>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiPostgresql /> <span className="tooltip">PostgreSQL</span>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <DiPython />
        <span className="tooltip">Python</span>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <DiJava />
        <span className="tooltip">JAVA</span>
      </Col>
    </Row>
  );
}

export default Techstack;
