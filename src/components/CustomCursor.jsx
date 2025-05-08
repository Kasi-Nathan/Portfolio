import React, { useEffect, useRef } from "react";
import "./CustomCursor.css";

const CustomCursor = () => {
  const innerRef = useRef(null);
  const outerRef = useRef(null);

  useEffect(() => {
    let requestId;
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const animate = () => {
      currentX += (mouseX - currentX) * 0.15;
      currentY += (mouseY - currentY) * 0.15;

      if (outerRef.current) {
        outerRef.current.style.top = `${currentY}px`;
        outerRef.current.style.left = `${currentX}px`;
      }

      requestId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (innerRef.current) {
        innerRef.current.style.top = `${mouseY}px`;
        innerRef.current.style.left = `${mouseX}px`;
      }
    };

    const addHover = () => {
      innerRef.current?.classList.add("hover");
      outerRef.current?.classList.add("hover");
    };

    const removeHover = () => {
      innerRef.current?.classList.remove("hover");
      outerRef.current?.classList.remove("hover");
    };

    document.addEventListener("mousemove", handleMouseMove);
    requestId = requestAnimationFrame(animate);

    const targets = document.querySelectorAll("a, button, .hover-target");
    targets.forEach((el) => {
      el.addEventListener("mouseenter", addHover);
      el.addEventListener("mouseleave", removeHover);
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestId);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", addHover);
        el.removeEventListener("mouseleave", removeHover);
      });
    };
  }, []);

  return (
    <>
      <div className="cursor-outer" ref={outerRef}></div>
      <div className="cursor-inner" ref={innerRef}></div>
    </>
  );
};

export default CustomCursor;
