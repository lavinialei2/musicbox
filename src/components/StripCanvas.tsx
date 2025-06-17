import React from "react";
import { useSavedStrip } from "../context/SavedStripContext";
import {
  PITCHES, NUM_ROWS, NUM_COLUMNS,
  CELL_WIDTH, CELL_HEIGHT,
  TIME_LINE_EVERY, TOP_PADDING, BOTTOM_PADDING
} from "../utils/constants";
import StaffOverlay from "./StaffOverlay";

const StripCanvas: React.FC = () => {
  const { isPunched } = useSavedStrip();

  const totalHeight = NUM_ROWS * CELL_HEIGHT + TOP_PADDING + BOTTOM_PADDING;
  const totalWidth = NUM_COLUMNS * CELL_WIDTH;

  return (
    <div style={{ display: "flex", position: "relative" }}>
      {/* Pitch labels */}
      <div style={{ display: "flex", flexDirection: "column", marginRight: "8px" }}>
        <div style={{ height: TOP_PADDING }} />
        {PITCHES.map((label) => (
          <div key={label} style={{
            height: `${CELL_HEIGHT}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "right",
            fontSize: "12px",
            color: "#333",
            paddingRight: "4px"
          }}>
            {label}
          </div>
        ))}
        <div style={{ height: BOTTOM_PADDING }} />
      </div>

      {/* Grid and notes */}
      <div style={{
        position: "relative",
        width: `${totalWidth}px`,
        height: `${totalHeight}px`,
        backgroundColor: "#fdfaf3"
      }}>
        {/* Grid lines */}
        <svg width={totalWidth} height={totalHeight} style={{
          position: "absolute", top: 0, left: 0, zIndex: 0, pointerEvents: "none"
        }}>
          {Array.from({ length: NUM_ROWS }).map((_, row) => {
            const y = TOP_PADDING + row * CELL_HEIGHT + CELL_HEIGHT / 2;
            return (
              <line key={`h-${row}`} x1={0} x2={totalWidth} y1={y} y2={y} stroke="#ddd" strokeWidth={1} />
            );
          })}
          {Array.from({ length: Math.floor(NUM_COLUMNS / TIME_LINE_EVERY) }).map((_, i) => {
            const x = (i + 1) * TIME_LINE_EVERY * CELL_WIDTH;
            return (
              <line key={`v-${i}`} x1={x} x2={x} y1={0} y2={totalHeight} stroke="#bbb" strokeWidth={1} />
            );
          })}
        </svg>

        {/* Staff lines */}
        <StaffOverlay
          width={totalWidth}
          cellHeight={CELL_HEIGHT}
          pitches={PITCHES}
          offsetY={TOP_PADDING}
        />

        {/* Punched holes */}
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
            const pitch = i % NUM_ROWS;
            const time = Math.floor(i / NUM_ROWS);
            const punched = isPunched[pitch]?.[time];

            return (
              <div key={`${pitch}-${time}`} style={{
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
    </div>
  );
};

export default StripCanvas;
