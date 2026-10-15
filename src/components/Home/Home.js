import React from "react";
import Home2 from "./Home2";
import "./Home.css";
import SupernovaHome from "../Supernova/SupernovaHome";

function Home() {
  return (
    <main className="portfolio-home">
      <SupernovaHome>
        <section className="home-intro" id="home" aria-labelledby="home-title">
          <div className="home-intro-copy">
            <p className="home-intro-kicker">From CYGNUS-01 · A new orbit</p>
            <h1 id="home-title" tabIndex={-1}>KASI<br /><span>NATHAN.</span></h1>
            <p className="home-intro-subtitle">Developer · Creative Technologist</p>
          </div>
          <span className="home-intro-planet-fallback" aria-hidden="true" />
        </section>
      </SupernovaHome>
      <Home2 />
    </main>
  );
}

export default Home;
