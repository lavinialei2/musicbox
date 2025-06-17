// src/components/MusicBoxView.tsx
import React, { useRef } from "react";
import StripCanvas from "./StripCanvas";
import { useScrollPlayback } from "../hooks/useScrollPlayback";
import {
  CELL_HEIGHT, PITCHES
} from "../utils/constants";

const MusicBoxView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useScrollPlayback(containerRef);

  return (
    <div style={{ position: "relative", width: "600px" }}>
      {/* Scrollable container */}
      <div
        ref={containerRef}
        style={{
          border: "2px solid black",
          width: "600px",
          height: `${PITCHES.length * CELL_HEIGHT + 40}px`,
          overflowX: "scroll",
          overflowY: "hidden",
          backgroundColor: "#fffdf6",
          position: "relative",
          scrollBehavior: "smooth"
        }}
      >
        <StripCanvas />
      </div>

      {/* Fixed playhead line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: "2px",
          height: "100%",
          backgroundColor: "red",
          transform: "translateX(-1px)",
          zIndex: 10
        }}
      />
    </div>
  );
};

export default MusicBoxView;
