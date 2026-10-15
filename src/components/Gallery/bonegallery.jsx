import React, { useState } from 'react';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './imagegallery.css';

import img1 from '../../Assets/Projects/BoneDisease/bone1.png';
import img2 from '../../Assets/Projects/BoneDisease/bone2.png';
import img3 from '../../Assets/Projects/BoneDisease/bone3.png';
import img4 from '../../Assets/Projects/BoneDisease/bone4.png';
import img5 from '../../Assets/Projects/BoneDisease/bone5.png';

function BoneGallery() {
  const [selectedImage, setSelectedImage] = useState(null);


  const images = [img1, img2, img3, img4, img5];

  return (
    <>
      <main className="gallery-page container py-5">
          <header className="gallery-page-heading">
            <span className="gallery-page-kicker">Archive / Applied ML</span>
            <h1>Project Screenshots</h1>
          </header>
        <div className="row g-4">
          {images.map((src, index) => (
            <div
              className="col-12 col-sm-10 col-md-6 col-lg-4 mx-auto"
              key={index}
              data-aos="zoom-in-up"
            >
                <button className="gallery-image-trigger" type="button" onClick={() => setSelectedImage(src)} aria-label={`Open bone disease project screenshot ${index + 1}`}>
                  <img src={src} alt={`Bone disease project screenshot ${index + 1}`} className="gallery-image" />
                  <span className="gallery-image-index">FRAME / 0{index + 1}</span>
                </button>
            </div>
          ))}
        </div>
      </main>

      {/* Lightbox Modal */}
      {selectedImage && (
          <div className="lightbox" role="dialog" aria-modal="true" aria-label="Screenshot preview" onClick={() => setSelectedImage(null)}>
            <img src={selectedImage} alt="Enlarged bone disease project screenshot" className="lightbox-img" />
            <button className="close-btn" type="button" aria-label="Close screenshot preview" autoFocus onClick={() => setSelectedImage(null)}>×</button>
        </div>
      )}
    </>
  );
}

export default BoneGallery;
