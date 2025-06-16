import React, { useState } from "react";
import StaffOverlay from "./StaffOverlay";

const PITCHES = [
  "C6", "B5", "A5", "G5", "F5", "E5", "D5", "C5",
  "B4", "A4", "G4", "F4", "E4", "D4", "C4"
];

const NUM_ROWS = PITCHES.length;
const NUM_COLUMNS = 32;
const CELL_WIDTH = 30;
const CELL_HEIGHT = 24;
const TIME_LINE_EVERY = 4;
const TOP_PADDING = 20;
const BOTTOM_PADDING = 20;

type Note = { pitch: number; time: number };

const EditStripModal: React.FC = () => {
  const [punchedNotes, setPunchedNotes] = useState<Note[]>([]);

  const toggleNote = (pitch: number, time: number) => {
    const exists = punchedNotes.some(n => n.pitch === pitch && n.time === time);
    if (exists) {
      setPunchedNotes(punchedNotes.filter(n => !(n.pitch === pitch && n.time === time)));
    } else {
      setPunchedNotes([...punchedNotes, { pitch, time }]);
    }
  };

  const totalHeight = NUM_ROWS * CELL_HEIGHT + TOP_PADDING + BOTTOM_PADDING;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>Edit Music Strip</h3>
      <div
        style={{
          display: "flex",
          border: "1px solid #bbb",
          backgroundColor: "#fdfaf3",
          position: "relative"
        }}
      >
        {/* Pitch Labels */}
        <div style={{ display: "flex", flexDirection: "column", marginRight: "8px" }}>
          <div style={{ height: TOP_PADDING }} />
          {PITCHES.map((label) => (
            <div
              key={label}
              style={{
                height: `${CELL_HEIGHT}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "right",
                fontSize: "12px",
                color: "#333",
                paddingRight: "4px"
              }}
            >
              {label}
            </div>
          ))}
          <div style={{ height: BOTTOM_PADDING }} />
        </div>

        {/* Grid container */}
        <div
          style={{
            position: "relative",
            width: `${NUM_COLUMNS * CELL_WIDTH}px`,
            height: `${totalHeight}px`,
            backgroundColor: "#fdfaf3",
            overflow: "visible",
          }}
        >
          {/* Unified SVG grid background: pitch + time lines */}
          <svg
            width={NUM_COLUMNS * CELL_WIDTH}
            height={totalHeight}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 0,
              pointerEvents: "none"
            }}
          >
            {/* Horizontal pitch lines */}
            {Array.from({ length: NUM_ROWS }).map((_, row) => {
              const y = TOP_PADDING + row * CELL_HEIGHT + CELL_HEIGHT / 2;
              return (
                <line
                  key={`h-${row}`}
                  x1={0}
                  x2={NUM_COLUMNS * CELL_WIDTH}
                  y1={y}
                  y2={y}
                  stroke="#ddd"
                  strokeWidth={1}
                />
              );
            })}

            {/* Vertical time lines */}
            {Array.from({ length: Math.floor(NUM_COLUMNS / TIME_LINE_EVERY) }).map((_, i) => {
              const x = (i + 1) * TIME_LINE_EVERY * CELL_WIDTH;
              return (
                <line
                  key={`v-${i}`}
                  x1={x}
                  x2={x}
                  y1={0}
                  y2={totalHeight}
                  stroke="#bbb"
                  strokeWidth={1}
                />
              );
            })}
          </svg>

          {/* Staff lines and clef */}
          <StaffOverlay
            width={NUM_COLUMNS * CELL_WIDTH}
            cellHeight={CELL_HEIGHT}
            pitches={PITCHES}
            offsetY={TOP_PADDING}
          />

          {/* Punch grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${NUM_COLUMNS}, ${CELL_WIDTH}px)`,
              gridTemplateRows: `repeat(${NUM_ROWS}, ${CELL_HEIGHT}px)`,
              position: "absolute",
              top: TOP_PADDING,
              left: 0,
              zIndex: 3
            }}
          >
            {Array.from({ length: NUM_ROWS * NUM_COLUMNS }).map((_, i) => {
              const row = i % NUM_ROWS;
              const col = Math.floor(i / NUM_ROWS);
              const isPunched = punchedNotes.some(n => n.pitch === row && n.time === col);

              return (
                <div
                  key={`${row}-${col}`}
                  onClick={() => toggleNote(row, col)}
                  style={{
                    width: `${CELL_WIDTH}px`,
                    height: `${CELL_HEIGHT}px`,
                    position: "relative",
                    cursor: "pointer",
                    backgroundColor: "transparent"
                  }}
                >
                  {isPunched && (
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "20px",
                        height: "20px",
                        backgroundColor: "black",
                        borderRadius: "50%"
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStripModal;
