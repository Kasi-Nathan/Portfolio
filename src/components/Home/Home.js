import React from "react";
import { Container, Row, Col } from "react-bootstrap";
// import homeLogo from "../../Assets/home-main.svg";
import Particle from "../Particle";
import Home2 from "./Home2";
import { useEffect } from "react";
import Type from "./Type";
import Aos from "aos";

function Home() {

  useEffect(() => {
    Aos.init({
      duration: 800,
      easing: 'ease-in-out-cubic',
      offset: 80, // lower offset = less "falling"
      // once: true, 
    });
  }, []);

  return (
    <section>
      <Container fluid className="home-section" id="home">
        <Particle />
        <Container className="home-content">
          <Row>
            <Col md={12} className="home-header">

              <section className="landing-page-container1" id="home">
                <div className="blob"></div>

                <div className="text-content">
                  <article id="hello-friend" data-aos="fade"
                    data-aos-duration="800"
                    data-aos-delay="0">
                    <span className="jello">G</span >
                    <span className="jello">r</span >
                    <span className="jello">e</span >
                    <span className="jello">e</span >
                    <span className="jello">t</span >
                    <span className="jello">i</span >
                    <span className="jello">n</span >
                    <span className="jello">g</span >
                    <span className="jello">s</span >
                    <span className="jello">(</span >
                    <span className="jello">
                      <span className="wave" role="img" aria-labelledby="wave">
                        👋🏻
                      </span></span >
                    <span className="jello">)</span >
                    <span className="jello">;</span >
                    &nbsp;
                    <span className="jello">I</span >
                    <span className="jello">'</span >
                    <span className="jello">m</span >
                  </article>
                  <article id="name" data-aos="zoom-in"
                    data-aos-duration="800"
                    data-aos-delay="300">
                    <span className="jello">K</span >
                    <span className="jello">a</span >
                    <span className="jello">s</span >
                    <span className="jello">i</span >

                    &nbsp;
                    <span className="jello">N</span >
                    <span className="jello">a</span >
                    <span className="jello">t</span >
                    <span className="jello">h</span >
                    <span className="jello">a</span >
                    <span className="jello">n</span >

                    &nbsp;
                    <span className="jello">M</span >
                    <span className="jello">u</span >
                    <span className="jello">r</span >
                    <span className="jello">u</span >
                    <span className="jello">g</span >
                    <span className="jello">a</span >
                    <span className="jello">n</span >
                    <span className="jello">.</span >
                  </article>

                  <article id="work" data-aos="fade"
                    data-aos-duration="800"
                    data-aos-delay="400">
                    <div>
                      <span className="jello">I</span >
                    </div>

                    <div>
                      <span className="jello">c</span >
                      <span className="jello">o</span >
                      <span className="jello">d</span >
                      <span className="jello">e</span >

                    </div>


                    <div>
                      <span className="jello">w</span >
                      <span className="jello">h</span >
                      <span className="jello">a</span >
                      <span className="jello">t</span >
                    </div>

                    <div>
                      <span className="jello">y</span >
                      <span className="jello">o</span >
                      <span className="jello">u</span >
                    </div>

                    <div>
                      <span className="jello">I</span >
                      <span className="jello">m</span >
                      <span className="jello">a</span >
                      <span className="jello">g</span >
                      <span className="jello">i</span >
                      <span className="jello">n</span >
                      <span className="jello">e</span >
                    </div>
                  </article>


                </div>

              </section>

              <div style={{ padding: 50, textAlign: "left" }}>
                {/* <Type /> */}
              </div>
            </Col>

            {/* <Col md={4} style={{ paddingBottom: 20 }}>
              <img
                src={homeLogo}
                alt="home pic"
                className="img-fluid"
                style={{ maxHeight: "450px" }}
              />
            </Col> */}
          </Row>
        </Container>
      </Container>
      <Home2 />
    </section>
  );
}

export default Home;
