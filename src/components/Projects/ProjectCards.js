import React from "react";
import { Link } from "react-router-dom";  // Import Link from react-router-dom
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { CgWebsite } from "react-icons/cg";
import { BsGithub } from "react-icons/bs";

function ProjectCards(props) {
  return (
    <Card className="project-card-view">
      <Card.Img variant="top" src={props.imgPath} alt="card-img" />
      <Card.Body>
        <Card.Title>{props.title}</Card.Title>
        <Card.Text style={{ textAlign: "justify" }}>
          {props.description}
        </Card.Text>

        {/* Conditional rendering for GitHub button */}
        {props.ghLink && (
          <Button variant="primary" href={props.ghLink} target="_blank">
            <BsGithub /> &nbsp;
            {props.isBlog ? "Blog" : "GitHub"}
          </Button>
        )}
        {"\n"}
        {"\n"}

        {/* Conditional rendering for Demo button */}
        {!props.isBlog && props.demoLink && (
          <Button
            variant="primary"
            href={props.demoLink}
            target="_blank"
            style={{ marginLeft: "10px" }}
          >
            <CgWebsite /> &nbsp;
            {"Demo"}
          </Button>
        )}

        {/* New Button to Redirect to Image Page */}
        {props.imageLink && (
          <Link to={props.imageLink}>
            <Button variant="primary" style={{ marginLeft: "10px" }}>
              <CgWebsite /> &nbsp;
              View Image
            </Button>
          </Link>
        )}
      </Card.Body>
    </Card>
  );
}

export default ProjectCards;

