import React, { useState } from "react";
import StaffOverlay from "./StaffOverlay";
import { PITCHES, NUM_ROWS, NUM_COLUMNS, CELL_WIDTH, CELL_HEIGHT, TIME_LINE_EVERY, TOP_PADDING, BOTTOM_PADDING } from "../utils/constants";
import { useSavedStrip } from "../context/SavedStripContext";


type Note = { pitch: number; time: number };
type Props = {
  onClose: () => void;
};

const EditStripModal: React.FC<Props> = ({ onClose }) => {
  const { savedNotes, setSavedNotes } = useSavedStrip();
  const [punchedNotes, setPunchedNotes] = useState<Note[]>(() => [...savedNotes]);



  const toggleNote = (pitch: number, time: number) => {
    const exists = punchedNotes.some(n => n.pitch === pitch && n.time === time);
    if (exists) {
      setPunchedNotes(punchedNotes.filter(n => !(n.pitch === pitch && n.time === time)));
    } else {
      setPunchedNotes([...punchedNotes, { pitch, time }]);
    }
  };

  const handleSaveAndClose = () => {
    setSavedNotes(punchedNotes);
    onClose();
  };

  const totalHeight = NUM_ROWS * CELL_HEIGHT + TOP_PADDING + BOTTOM_PADDING;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Edit Music Strip</h3>
          <button onClick={onClose}>Close</button>
          <button onClick={handleSaveAndClose} style={{ fontSize: "14px" }}>
            Save and Close
          </button>
        </div>
        <div style={{ marginTop: "2rem" }}>
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
      </div>
    </div>
  );
};

// Modal styles
const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "1rem",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  maxHeight: "90vh",
  overflowY: "auto"
};

export default EditStripModal;
