import React from "react";
import Card from "react-bootstrap/Card";
import { Container, row, column } from "react-bootstrap";
import { ImPointRight } from "react-icons/im";

function AboutCard() {
  return (
          <Card className="quote-card-view">
            <Card.Body>
              <blockquote className="blockquote mb-0">
                <p style={{ textAlign: "justify" }} className="quote-paragraph">
                  Hi, I am <span className="purple">Kasi Nathan Murugan </span><br/>
                  I am a junior software developer from <span className="purple">Tenkasi, Tamil Nadu, India. </span>
                  {/* <br /> */}
                 
                  {/* <br /> */}
                  I completed my Bachelor's in  Information Technology at <span className="purple"> Sri krishna College of Technology, Coimbatore.</span> Beyond coding,  I enjoy:
                </p>
                <ul>
                  <li className="about-activity" >
                    <p className="lists"><ImPointRight /> Travelling</p>
                  </li>
                  <li className="about-activity" >
                    <p className="lists"><ImPointRight /> Cooking</p>
                  </li>
                  <li className="about-activity" >
                  <p className="lists"><ImPointRight /> Playing Games</p>
                  </li>
                </ul>

                <p style={{ color: "rgb(155 126 172)" }}>
                  "Keep grinding until you make it"{" "}
                </p>
                <footer className="blockquote-footer">Kasi Nathan</footer>
              </blockquote>
            </Card.Body>
          </Card>
  );
}

export default AboutCard;
