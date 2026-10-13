import React from "react";
import { Col, Row } from "react-bootstrap";
import {
  SiVisualstudiocode,
  SiPostman,
  SiVercel,
  SiWindows,
  SiVite,
} from "react-icons/si";
import skills from "../../data/skills.json";

const toolIcons = {
  windows: SiWindows,
  vscode: SiVisualstudiocode,
  postman: SiPostman,
  vercel: SiVercel,
  vite: SiVite,
};

function Toolstack() {
  return (
    <Row className="about-tech-grid about-tool-grid">
      {skills.tools.map((tool) => {
        const Icon = toolIcons[tool.icon];

        return (
          <Col xs={6} sm={4} md={3} lg={2} key={tool.id}>
            <div className="about-tech-card hover-target" tabIndex="0">
              <span className="about-tech-icon" aria-hidden="true">
                {Icon ? <Icon /> : <span>◇</span>}
              </span>
              <h3>{tool.name}</h3>
              <span className="about-tech-accent" aria-hidden="true" />
            </div>
          </Col>
        );
      })}
    </Row>
  );
}

export default Toolstack;