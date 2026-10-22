import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { scrollToHomeSection } from "./homeSectionNavigation";

function ScrollToTop({ ready = true }) {
  const { pathname, hash } = useLocation();
  const previousLocation = useRef(null);
  useEffect(() => {
    const currentLocation = `${pathname}${hash}`;
    const wasNavigating = previousLocation.current !== null && previousLocation.current !== currentLocation;
    previousLocation.current = currentLocation;
    if (pathname === "/" && hash && !ready) return;
    if (pathname !== "/" || (!hash && !wasNavigating)) {
      window.scrollTo(0, 0);
      return;
    }
    scrollToHomeSection(hash);
  }, [pathname, hash, ready]);
  return null;
}

export default ScrollToTop;
