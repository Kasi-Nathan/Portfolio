import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import myImg from "../../Assets/me.png";
import Tilt from "react-parallax-tilt";
import { useEffect } from "react";
import Aos from "aos";
import {
  AiFillGithub,
  AiOutlineTwitter,
  AiFillInstagram,
} from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";



function Home2() {

  useEffect(() => {
    const isSmallScreen = window.innerWidth < 768;
  
    Aos.init({
      duration: 700,
      offset: isSmallScreen ? 100 : 300,
      easing: "ease-out",
      // Optional: animates only once
    });
  }, []);
  return (
    <Container fluid className="home-about-section" id="about">
      <Container>
        <Row>
          <Col md={8} className="home-about-description" data-aos="fade-up"
            data-aos-offset="0"  // starts farther from viewport
            data-aos-duration="400"  // fast duration
            data-aos-easing="ease-out">
            <h1 className="intro">
               <span className="purple" > &lt;My Journey&gt; </span> 
            </h1>
            <p className="home-about-body">
              <span >I fell in love with programming when I first started learning Python. Since then, I’ve come a long way in exploring the world of software development.</span>
              <br />
              <br />I'm comfortable working with languages like
              <i>
                <b className="purple"> Java, Javascript and Python. </b>
              </i>
              <br />
              <br />
              My interests lie in building innovative &nbsp;
              <i>
                <b className="purple">Web Technologies and Products </b> especially in areas that{" "}
                <b className="purple">
                combine web development with AI.
                </b>
              </i>
              <br />
              <br />
              I enjoy experimenting and trying out new tools to expand my skillset.  <b className="purple">Node.js</b> and
              <i>
                <b className="purple">
                  {" "}
                  Modern Javascript Library and Frameworks
                </b>
              </i>
              &nbsp; like
              <i>
                <b className="purple"> React.js.</b> as well as 
                <b className="purple"> TypeScript</b> for building more robust applications.
              </i>
            </p>
          </Col>
          <Col md={4} className="myAvtar" data-aos="fade-up"
            data-aos-offset="0"  // starts farther from viewport
            data-aos-duration="400"  // fast duration
            data-aos-easing="ease-out">
            <Tilt>
              <img src={myImg} className="img-fluid avatar" alt="avatar" />
            </Tilt>
          </Col>
        </Row>
        <Row>
          <Col md={12} className="home-about-social" data-aos="fade-up"
            data-aos-offset="0"  // starts farther from viewport
            data-aos-duration="400"  // fast duration
            data-aos-easing="ease-out">
            <h1>FIND ME ON</h1>
            <p>
              Feel free to <span className="purple">connect </span>with me
            </p>
            <ul className="home-about-social-links">
              <li className="social-icons">
                <a
                  href="https://github.com/Kasi-Nathan/"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour  home-social-icons"
                >
                  <AiFillGithub />
                </a>
              </li>
              <li className="social-icons">
                <a
                  href="https://x.com/Kasi_Nathan_?t=59aMyqB-VY40svXM11qffQ&s=09"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour  home-social-icons"
                >
                  <AiOutlineTwitter />
                </a>
              </li>
              <li className="social-icons">
                <a
                  href="https://www.linkedin.com/in/kasinathan/"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour  home-social-icons"
                >
                  <FaLinkedinIn />
                </a>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
export default Home2;
