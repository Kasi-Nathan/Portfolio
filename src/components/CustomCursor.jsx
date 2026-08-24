import React, { useEffect, useRef } from "react";
import "./CustomCursor.css";

const CustomCursor = () => {
  const innerRef = useRef(null);
  const outerRef = useRef(null);

  useEffect(() => {
    let requestId = null;
    let pointerX = 0;
    let pointerY = 0;

    const renderCursor = () => {
      const position = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;

      if (innerRef.current && outerRef.current) {
        innerRef.current.style.transform = position;
        outerRef.current.style.transform = position;
        innerRef.current.classList.add("visible");
        outerRef.current.classList.add("visible");
      }

      requestId = null;
    };

    const handleMouseMove = (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (requestId === null) requestId = requestAnimationFrame(renderCursor);
    };

    const addHover = () => {
      innerRef.current?.classList.add("hover");
      outerRef.current?.classList.add("hover");
    };

    const removeHover = () => {
      innerRef.current?.classList.remove("hover");
      outerRef.current?.classList.remove("hover");
    };

    const handlePointerOver = (event) => {
      if (event.target.closest("a, button, .hover-target")) addHover();
    };

    const handlePointerOut = (event) => {
      const interactive = event.target.closest("a, button, .hover-target");
      if (interactive && !interactive.contains(event.relatedTarget)) removeHover();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handlePointerOver);
    document.addEventListener("mouseout", handlePointerOut);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handlePointerOver);
      document.removeEventListener("mouseout", handlePointerOut);
      if (requestId !== null) cancelAnimationFrame(requestId);
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
