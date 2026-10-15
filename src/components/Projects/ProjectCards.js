import React, { useState } from "react";
import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { CgWebsite } from "react-icons/cg";
import { BsGithub } from "react-icons/bs";

function ProjectCards(props) {
  const [imageFailed, setImageFailed] = useState(false);
  const cardClassName = [
    "project-card-view",
    props.priority ? "project-card-priority" : "",
    props.secondary ? "project-card-secondary" : "",
    props.featured ? "project-card-featured-view" : "",
  ].filter(Boolean).join(" ");

  return (
    <Card className={cardClassName}>
      <div className="project-image-wrap">
        {props.imgPath && !imageFailed ? (
          <Card.Img
            variant="top"
            src={props.imgPath}
            alt={`${props.title} project screenshot`}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className="project-image-fallback"
            role="img"
            aria-label={`${props.title} preview unavailable`}
          >
            <CgWebsite aria-hidden="true" />
            <span>Preview unavailable</span>
          </div>
        )}
        {props.featured && <span className="project-featured-label">Featured project</span>}
      </div>
      <Card.Body>
        <Card.Title>{props.title}</Card.Title>
        {props.summary && <p className="project-summary">{props.summary}</p>}
        {props.techStack && (
          <div className="project-meta-block">
            <span className="project-meta-label">Tech Stack</span>
            <ul className="project-tech-list" aria-label="Technologies used">
              {props.techStack.split(",").map((technology) => technology.trim()).filter(Boolean).map((technology) => (
                <li key={technology}>{technology}</li>
              ))}
            </ul>
          </div>
        )}
        <details className="project-details">
          <summary>Read case study</summary>
          <Card.Text className="project-description-block">
            {props.description}
          </Card.Text>
        </details>

        <div className="project-actions">
          {props.ghLink && (
            <Button variant="primary" href={props.ghLink} target="_blank" rel="noreferrer" aria-label={`Open ${props.title} ${props.isBlog ? "blog" : "GitHub repository"}`}>
              <BsGithub /> &nbsp;
              {props.isBlog ? "Blog" : "GitHub"}
            </Button>
          )}

          {!props.isBlog && props.demoLink && (
            <Button variant="primary" href={props.demoLink} target="_blank" rel="noreferrer" aria-label={`Open ${props.title} live demo`}>
              <CgWebsite /> &nbsp;
              Live Demo
            </Button>
          )}

          {props.imageLink && (
            <Button as={Link} to={props.imageLink} variant="primary" aria-label={`Open ${props.title} gallery`}>
              <CgWebsite /> &nbsp;
              View Gallery
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProjectCards;

