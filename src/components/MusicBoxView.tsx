import React, { useRef } from "react";
import StripCanvas from "./StripCanvas";
import { useScrollPlayback } from "../hooks/useScrollPlayback";
import {
  CELL_HEIGHT,
  NUM_ROWS,
  TOP_PADDING,
  BOTTOM_PADDING,
} from "../utils/constants";

const MusicBoxView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useScrollPlayback(containerRef);

  const stripHeight = NUM_ROWS * CELL_HEIGHT + TOP_PADDING + BOTTOM_PADDING;

  return (
    <div style={{ position: "relative", width: "600px", height: `${stripHeight}px` }}>
      {/* Scrollable strip container */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          overflowX: "scroll",
          overflowY: "hidden",
          backgroundColor: "#fffdf6",
          border: "2px solid black",
        }}
      >
        <StripCanvas />
      </div>

      {/* Fixed vertical red playhead line */}
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
