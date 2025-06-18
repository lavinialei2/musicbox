import React, { useEffect, useRef } from "react";
import InfiniteStripCanvas from "./InfiniteStripCanvas";
import "../styles/global.css";
import { useScrollPlayback } from "../hooks/useScrollPlayback";
import {
  CELL_HEIGHT, NUM_ROWS, TOP_PADDING, BOTTOM_PADDING,
  CELL_WIDTH, NUM_COLUMNS
} from "../utils/constants";

const MusicBoxView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stripHeight = NUM_ROWS * CELL_HEIGHT + TOP_PADDING + BOTTOM_PADDING;

  // Hook handles playback
  const suppressNextTick = useRef(false);
  useScrollPlayback(containerRef, suppressNextTick);


  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stripWidth = NUM_COLUMNS * CELL_WIDTH;
    const initialScrollLeft = stripWidth - container.clientWidth / 2 - 2;

    // Align beginning of middle copy with playhead
    container.scrollLeft = initialScrollLeft;

    const handleScrollLoop = () => {
      if (container.scrollLeft <= stripWidth * 0.2) {
        container.scrollLeft += stripWidth;
        suppressNextTick.current = true;
      } else if (container.scrollLeft >= stripWidth * 1.8) {
        container.scrollLeft -= stripWidth;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scrollSpeedFactor = 0.25;
      const delta = e.deltaX < 0 ? 0 : e.deltaX;
      container.scrollLeft += delta * scrollSpeedFactor;
      handleScrollLoop();
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div style={{ position: "relative", width: "600px", height: `${stripHeight}px` }}>
      <div
        ref={containerRef}
        className="scroll-container"
        style={{
          width: "100%",
          height: "100%",
          overflowX: "scroll",
          overflowY: "hidden",
          backgroundColor: "#fffdf6",
          border: "2px solid black",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <InfiniteStripCanvas />
      </div>

      {/* Fixed red playhead line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-1px)",
          width: "2px",
          height: "100%",
          backgroundColor: "red",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default MusicBoxView;
