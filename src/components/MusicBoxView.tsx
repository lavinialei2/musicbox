import React, { useRef } from "react";
import StripCanvas from "./StripCanvas";
import { useScrollPlayback } from "../hooks/useScrollPlayback";
import { CELL_HEIGHT, PITCHES } from "../utils/constants";

const MusicBoxView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useScrollPlayback(containerRef);

  return (
    <div
      ref={containerRef}
      style={{
        border: "2px solid black",
        width: "600px",
        height: `${PITCHES.length * CELL_HEIGHT}px`,
        overflowX: "scroll",
        overflowY: "hidden",
        backgroundColor: "#fffdf6",
        position: "relative",
        scrollBehavior: "smooth"
      }}
    >
      <StripCanvas />
    </div>
  );
};

export default MusicBoxView;