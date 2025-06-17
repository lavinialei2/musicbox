import React, { useEffect, useState } from "react";
import StaffOverlay from "./StaffOverlay";
import { useSavedStrip } from "../context/SavedStripContext";
import {
  PITCHES, NUM_COLUMNS, CELL_WIDTH, CELL_HEIGHT,
  TIME_LINE_EVERY, TOP_PADDING, BOTTOM_PADDING
} from "../utils/constants";

const NUM_ROWS = PITCHES.length;
const totalHeight = NUM_ROWS * CELL_HEIGHT + TOP_PADDING + BOTTOM_PADDING;

type Note = { pitch: number; time: number };

const StripCanvas: React.FC = () => {
  const { savedNotes } = useSavedStrip();
  const [punchedNotes, setPunchedNotes] = useState<Note[]>([]);

  useEffect(() => {
    setPunchedNotes(savedNotes);
  }, [savedNotes]);

  return (
    <div style={{ display: "flex", position: "relative" }}>
      {/* Pitch Labels */}
      <div style={{ display: "flex", flexDirection: "column", marginRight: "8px" }}>
        <div style={{ height: TOP_PADDING }} />
        {PITCHES.map(label => (
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

      {/* Strip Grid and Notes */}
      <div style={{
        position: "relative",
        width: `${NUM_COLUMNS * CELL_WIDTH}px`,
        height: `${totalHeight}px`,
        backgroundColor: "#fdfaf3"
      }}>
        {/* SVG Grid */}
        <svg width={NUM_COLUMNS * CELL_WIDTH} height={totalHeight} style={{
          position: "absolute", top: 0, left: 0, zIndex: 0, pointerEvents: "none"
        }}>
          {/* Horizontal pitch lines */}
          {Array.from({ length: NUM_ROWS }).map((_, row) => {
            const y = TOP_PADDING + row * CELL_HEIGHT + CELL_HEIGHT / 2;
            return (
              <line key={`h-${row}`} x1={0} x2={NUM_COLUMNS * CELL_WIDTH} y1={y} y2={y} stroke="#ddd" strokeWidth={1} />
            );
          })}

          {/* Vertical time lines */}
          {Array.from({ length: Math.floor(NUM_COLUMNS / TIME_LINE_EVERY) }).map((_, i) => {
            const x = (i + 1) * TIME_LINE_EVERY * CELL_WIDTH;
            return (
              <line key={`v-${i}`} x1={x} x2={x} y1={0} y2={totalHeight} stroke="#bbb" strokeWidth={1} />
            );
          })}
        </svg>

        {/* Staff Lines */}
        <StaffOverlay
          width={NUM_COLUMNS * CELL_WIDTH}
          cellHeight={CELL_HEIGHT}
          pitches={PITCHES}
          offsetY={TOP_PADDING}
        />

        {/* Punched Holes */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${NUM_COLUMNS}, ${CELL_WIDTH}px)`,
          gridTemplateRows: `repeat(${NUM_ROWS}, ${CELL_HEIGHT}px)`,
          position: "absolute",
          top: TOP_PADDING,
          left: 0,
          zIndex: 3
        }}>
          {Array.from({ length: NUM_ROWS * NUM_COLUMNS }).map((_, i) => {
            const row = i % NUM_ROWS;
            const col = Math.floor(i / NUM_ROWS);
            const isPunched = punchedNotes.some(n => n.pitch === row && n.time === col);

            return (
              <div key={`${row}-${col}`} style={{
                width: `${CELL_WIDTH}px`,
                height: `${CELL_HEIGHT}px`,
                position: "relative",
                backgroundColor: "transparent"
              }}>
                {isPunched && (
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
