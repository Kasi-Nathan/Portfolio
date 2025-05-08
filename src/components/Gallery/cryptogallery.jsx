import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './imagegallery.css';

import img1 from '../../Assets/Projects/Crypto/Crypto1.png';
import img2 from '../../Assets/Projects/Crypto/Crypto2.png';
import img3 from '../../Assets/Projects/Crypto/Crypto3.png';
import img4 from '../../Assets/Projects/Crypto/Crypto4.png';
import img5 from '../../Assets/Projects/Crypto/Crypto5.png';

function CryptoGallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const images = [img1, img2, img3, img4, img5];

  return (
    <>
      <div className="container py-5">
        <h2 className="text-center mb-5 fw-bold" style={{color:'rgb(218, 100, 254)', paddingTop:'30px'}}>Project Screenshots</h2>
        <div className="row g-4">
          {images.map((src, index) => (
            <div
              className="col-12 col-sm-10 col-md-6 col-lg-4 mx-auto"
              key={index}
              data-aos="zoom-in-up"
            >
              <img
                src={src}
                alt={`screenshot-${index}`}
                className="img-fluid rounded shadow gallery-image"
                onClick={() => setSelectedImage(src)}
                style={{ cursor: 'pointer' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Zoomed" className="lightbox-img" />
          <button className="close-btn" onClick={() => setSelectedImage(null)}>×</button>
        </div>
      )}
    </>
  );
}

export default CryptoGallery;
