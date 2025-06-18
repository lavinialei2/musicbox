import React from "react";
import { useSavedStrip } from "../context/SavedStripContext";
import {
  PITCHES, NUM_ROWS, NUM_COLUMNS,
  CELL_WIDTH, CELL_HEIGHT,
  TIME_LINE_EVERY, TOP_PADDING, BOTTOM_PADDING
} from "../utils/constants";
import StaffOverlay from "./StaffOverlay";

const InfiniteStripCanvas: React.FC = () => {
  const { isPunched } = useSavedStrip();
  const stripWidth = NUM_COLUMNS * CELL_WIDTH;
  const stripHeight = NUM_ROWS * CELL_HEIGHT + TOP_PADDING + BOTTOM_PADDING;

  return (
    <div style={{ display: "flex", position: "relative", width: `${stripWidth * 3}px` }}>
      {[0, 1, 2].map(loopIndex => (
        <div key={loopIndex} style={{ width: `${stripWidth}px`, position: "relative" }}>
          <svg width={stripWidth} height={stripHeight} style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}>
            {Array.from({ length: NUM_ROWS }).map((_, row) => {
              const y = TOP_PADDING + row * CELL_HEIGHT + CELL_HEIGHT / 2;
              return <line key={`h-${row}`} x1={0} x2={stripWidth} y1={y} y2={y} stroke="#ddd" />;
            })}
            {Array.from({ length: Math.floor(NUM_COLUMNS / TIME_LINE_EVERY) }).map((_, i) => {
              const x = (i + 1) * TIME_LINE_EVERY * CELL_WIDTH;
              return <line key={`v-${i}`} x1={x} x2={x} y1={0} y2={stripHeight} stroke="#bbb" />;
            })}
          </svg>

          <StaffOverlay
            width={stripWidth}
            cellHeight={CELL_HEIGHT}
            pitches={PITCHES}
            offsetY={TOP_PADDING}
          />

          <div style={{
            position: "absolute",
            top: TOP_PADDING,
            left: 0,
            zIndex: 3,
            display: "grid",
            gridTemplateColumns: `repeat(${NUM_COLUMNS}, ${CELL_WIDTH}px)`,
            gridTemplateRows: `repeat(${NUM_ROWS}, ${CELL_HEIGHT}px)`
          }}>
            {Array.from({ length: NUM_ROWS * NUM_COLUMNS }).map((_, i) => {
              const time = i % NUM_COLUMNS;
              const pitch = Math.floor(i / NUM_COLUMNS);
              const punched = isPunched[pitch]?.[time];

              return (
                <div key={`${loopIndex}-${pitch}-${time}`} style={{
                  width: `${CELL_WIDTH}px`,
                  height: `${CELL_HEIGHT}px`,
                  position: "relative"
                }}>
                  {punched && (
                    <div style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "20px",
                      height: "20px",
                      backgroundColor: "black",
                      borderRadius: "50%"
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InfiniteStripCanvas;
