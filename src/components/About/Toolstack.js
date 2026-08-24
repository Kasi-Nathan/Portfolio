import React from "react";
import { Col, Row } from "react-bootstrap";
import {
  SiVisualstudiocode,
  SiPostman,
  SiVercel,
  SiWindows,
  SiVite
} from "react-icons/si";

function Toolstack() {
  const tools = [[<SiWindows />, "Windows"], [<SiVisualstudiocode />, "VS Code"], [<SiPostman />, "Postman"], [<SiVercel />, "Vercel"], [<SiVite />, "Vite"]];
  return (
    <Row className="about-tech-grid about-tool-grid">
      {tools.map(([icon, name]) => (
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

export default Toolstack;
