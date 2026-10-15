import React, { useState, useEffect } from "react";
import Preloader from "../src/components/Pre";
import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import About from "./components/About/About";
import Projects from "./components/Projects/Projects";  // Your existing Projects component
import ProjectDetail from "./components/Projects/ProjectDetail";
import { ProjectWormholeProvider } from "./components/Projects/ProjectWormhole";
import { GalaxyTransitionProvider } from "./components/Projects/GalaxyTransition";
import Footer from "./components/Footer";
import Particle from "./components/Particle";
import Motion from "./components/Motion";
import "aos/dist/aos.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import "./style.css";
import "./App.css";
import "./space.css";
import "bootstrap/dist/css/bootstrap.min.css";
import ImageGallery from './components/Gallery/imagegallery.jsx';
import BoneGallery from './components/Gallery/bonegallery.jsx'
import CryptoGallery from './components/Gallery/cryptogallery.jsx'

const SupernovaLab = process.env.NODE_ENV === "development"
  ? React.lazy(() => import("./components/Supernova/SupernovaLab"))
  : null;

function App() {
  const [load, upadateLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      upadateLoad(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <GalaxyTransitionProvider>
      <ProjectWormholeProvider>
      <Particle />
      <Motion />
      <Preloader load={load} />
      <div className="App" id={load ? "no-scroll" : "scroll"}>
        <Navbar />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project" element={<Projects />} />
          <Route path="/project/:projectId" element={<ProjectDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<ImageGallery />} />
          <Route path="/bonegallery" element={<BoneGallery />} />
          <Route path="/cryptogallery" element={<CryptoGallery />} />
          {SupernovaLab && (
            <Route
              path="/supernova-lab"
              element={(
                <React.Suspense fallback={null}>
                  <SupernovaLab />
                </React.Suspense>
              )}
            />
          )}

          <Route path="*" element={<Navigate to="/" />} />
          
        </Routes>
        <Footer />
      </div>
      </ProjectWormholeProvider>
      </GalaxyTransitionProvider>
    </Router>
  );
}

export default App;
