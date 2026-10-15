import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AOS from "aos";

// One policy for every route; CSS handles preference changes immediately.
export default function Motion() {
  const { pathname } = useLocation();
  useEffect(() => {
    AOS.init({ duration: 450, offset: 40, easing: "ease-out", once: true });
  }, []);
  useEffect(() => { AOS.refreshHard(); }, [pathname]);
  return null;
}
