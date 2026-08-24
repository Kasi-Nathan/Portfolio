import React, { useEffect, useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { CgGitFork } from "react-icons/cg";
import {
  AiFillStar,
  AiOutlineHome,
  AiOutlineFundProjectionScreen,
  AiOutlineUser,
} from "react-icons/ai";

import { CgFileDocument } from "react-icons/cg";



function NavBar() {
  const [expand, updateExpanded] = useState(false);
  const [navColour, updateNavbar] = useState(false);

  useEffect(() => {
    function scrollHandler() {
      updateNavbar(window.scrollY >= 20);
    }

    window.addEventListener("scroll", scrollHandler);
    scrollHandler();

    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  return (
    <Navbar
      expanded={expand}
      fixed="top"
      expand="md"
      className={navColour ? "sticky" : "navbar"}
    >
      <Container>
      <Navbar.Brand href="/" aria-label="Go to home" className="d-flex align-items-center">
  <div className="logo">
    <svg width="120" height="50" viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="100" fill="transparent"/>
      <g transform="translate(20,20)">
        <polygon points="20,0 40,10 40,30 20,40 0,30 0,10" fill="none" stroke="rgb(218, 100, 254)" stroke-width="2"/>
        <circle cx="20" cy="20" r="3" fill="rgb(218, 100, 254)" />
        <line x1="20" y1="0" x2="20" y2="17" stroke="rgb(218, 100, 254)" stroke-width="1.5" />
        <line x1="20" y1="23" x2="20" y2="40" stroke="rgb(218, 100, 254)" stroke-width="1.5" />
      </g>
      <text x="80" y="55" font-family="Poppins, Segoe UI, sans-serif" font-weight="600"
            font-size="48" fill="rgb(218, 100, 254)">KN</text>
    </svg>
  </div>
</Navbar.Brand>

        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          onClick={() => {
            updateExpanded(expand ? false : "expanded");
          }}
        >
          <span></span>
          <span></span>
          <span></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto" defaultActiveKey="#home">
            <Nav.Item data-aos="fade-down" data-aos-duration="1500" data-aos-delay="100">
              <Nav.Link as={Link} to="/" onClick={() => updateExpanded(false)}>
                <AiOutlineHome style={{ marginBottom: "2px" }} /> Home
              </Nav.Link>
            </Nav.Item>

            <Nav.Item data-aos="fade-down" data-aos-duration="1500" data-aos-delay="200">
              <Nav.Link
                as={Link}
                to="/about"
                onClick={() => updateExpanded(false)}
              >
                <AiOutlineUser style={{ marginBottom: "2px" }} /> About
              </Nav.Link>
            </Nav.Item>

            <Nav.Item data-aos="fade-down" data-aos-duration="1500" data-aos-delay="300">
              <Nav.Link
                as={Link}
                to="/project"
                onClick={() => updateExpanded(false)}
              >
                <AiOutlineFundProjectionScreen
                  style={{ marginBottom: "2px" }}
                />{" "}
                Projects
              </Nav.Link>
            </Nav.Item>

            <Nav.Item data-aos="fade-down" data-aos-duration="1500" data-aos-delay="400">
              <Nav.Link
                as={Link}
                to="/resume"
                onClick={() => updateExpanded(false)}
              >
                <CgFileDocument style={{ marginBottom: "2px" }} /> Resume
              </Nav.Link>
            </Nav.Item>

        

            <Nav.Item className="fork-btn">
              <Button
                href="https://github.com/Kasi-Nathan"
                target="_blank"
                rel="noreferrer"
                aria-label="Open Kasi Nathan's GitHub profile"
                className="fork-btn-inner"
              >
                <CgGitFork style={{ fontSize: "1.2em" }} />{" "}
                <AiFillStar style={{ fontSize: "1.1em" }} />
              </Button>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
