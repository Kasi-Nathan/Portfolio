import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Particle from "../Particle";
import pdf from "../../Assets/../Assets/CV.pdf";
import { AiOutlineDownload } from "react-icons/ai";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function ResumeNew() {
  const [width, setWidth] = useState(1200);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  return (
    <div>
      <Container fluid className="resume-section">
        <Particle />
        <Row className="justify-content-center">
          <Col md={8} className="resume-intro">
            <h1 className="project-heading">
              <strong className="purple">Resume</strong>
            </h1>
            <p className="resume-note">
              Download a PDF copy or view the latest version below.
            </p>
            <Button variant="primary" href={pdf} target="_blank" rel="noreferrer" className="resume-download-btn" aria-label="Download resume PDF">
              <AiOutlineDownload />
              &nbsp;Download Resume
            </Button>
          </Col>
        </Row>

        <Row className="resume">
          <Col md={10} className="resume-preview-card">
            <Document file={pdf} onLoadError={() => setPdfError(true)} className="d-flex justify-content-center">
              <Page pageNumber={1} scale={width > 786 ? 1.4 : 0.6} />
            </Document>
            {pdfError && (
              <p className="resume-fallback">
                The preview could not be loaded right now. Please download the CV to view it directly.
              </p>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ResumeNew;
