import React, { useEffect, useState } from "react";
import StaffOverlay from "./StaffOverlay";
import { useSavedStrip } from "../context/SavedStripContext";
import {
  PITCHES, NUM_ROWS, NUM_COLUMNS, CELL_WIDTH, CELL_HEIGHT,
  TIME_LINE_EVERY, TOP_PADDING, BOTTOM_PADDING
} from "../utils/constants";

type EditStripModalProps = { onClose: () => void };

const EditStripModal: React.FC<EditStripModalProps> = ({ onClose }) => {
  const { isPunched, setIsPunched } = useSavedStrip();
  const [localGrid, setLocalGrid] = useState<boolean[][]>([]);

  useEffect(() => {
    // Deep copy grid
    setLocalGrid(isPunched.map(row => [...row]));
  }, [isPunched]);

  const toggleNote = (pitch: number, time: number) => {
    const newGrid = localGrid.map(row => [...row]);
    newGrid[pitch][time] = !newGrid[pitch][time];
    setLocalGrid(newGrid);
  };

  const handleSaveAndClose = () => {
    setIsPunched(localGrid);
    onClose();
  };

  const totalHeight = NUM_ROWS * CELL_HEIGHT + TOP_PADDING + BOTTOM_PADDING;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "#fffdf6",
        padding: "1.5rem",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        maxHeight: "90vh",
        overflow: "auto",
        border: "1px solid #ccc"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem"
        }}>
          <h3 style={{ margin: 0 }}>Edit Music Strip</h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={onClose}>Close</button>
            <button onClick={handleSaveAndClose} style={{ fontWeight: "bold" }}>
              Save and Close
            </button>
          </div>
        </div>

        {/* Pitch grid and canvas, same as before */}
        <div style={{ display: "flex", position: "relative" }}>
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

          <div style={{
            position: "relative",
            width: `${NUM_COLUMNS * CELL_WIDTH}px`,
            height: `${totalHeight}px`,
            backgroundColor: "#fdfaf3"
          }}>
            <svg width={NUM_COLUMNS * CELL_WIDTH} height={totalHeight} style={{
              position: "absolute", top: 0, left: 0, zIndex: 0, pointerEvents: "none"
            }}>
              {Array.from({ length: NUM_ROWS }).map((_, row) => {
                const y = TOP_PADDING + row * CELL_HEIGHT + CELL_HEIGHT / 2;
                return (
                  <line key={`h-${row}`} x1={0} x2={NUM_COLUMNS * CELL_WIDTH} y1={y} y2={y} stroke="#ddd" strokeWidth={1} />
                );
              })}
              {Array.from({ length: Math.floor(NUM_COLUMNS / TIME_LINE_EVERY) }).map((_, i) => {
                const x = (i + 1) * TIME_LINE_EVERY * CELL_WIDTH;
                return (
                  <line key={`v-${i}`} x1={x} x2={x} y1={0} y2={totalHeight} stroke="#bbb" strokeWidth={1} />
                );
              })}
            </svg>

            <StaffOverlay
              width={NUM_COLUMNS * CELL_WIDTH}
              cellHeight={CELL_HEIGHT}
              pitches={PITCHES}
              offsetY={TOP_PADDING}
            />

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
                const pitch = i % NUM_ROWS;
                const time = Math.floor(i / NUM_ROWS);
                const punched = localGrid[pitch]?.[time] ?? false;

                return (
                  <div key={`${pitch}-${time}`} onClick={() => toggleNote(pitch, time)} style={{
                    width: `${CELL_WIDTH}px`,
                    height: `${CELL_HEIGHT}px`,
                    position: "relative",
                    cursor: "pointer",
                    backgroundColor: "transparent"
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
      </div>
    </div>
  );
};

export default EditStripModal;
