import React, {
  PointerEvent,
  WheelEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Tone from "tone";
import "./styles/global.css";

type Grid = boolean[][];
type AppMode = "edit" | "play";
type LoopMode = "regular" | "mobius";

const NOTE_NAMES = ["C", "D", "E", "F", "G", "A", "B"];
const buildPitchRange = (lowPitch: string, highPitch: string) => {
  const noteToValue = (pitch: string) => {
    const note = pitch[0];
    const octave = Number(pitch.slice(1));
    return octave * NOTE_NAMES.length + NOTE_NAMES.indexOf(note);
  };
  const pitches: string[] = [];
  const lowValue = noteToValue(lowPitch);
  const highValue = noteToValue(highPitch);

  for (let value = highValue; value >= lowValue; value -= 1) {
    const octave = Math.floor(value / NOTE_NAMES.length);
    const note = NOTE_NAMES[value % NOTE_NAMES.length];
    pitches.push(`${note}${octave}`);
  }

  return pitches;
};

const PITCHES = buildPitchRange("B3", "B5");
const ROWS = PITCHES.length;
const CELL_WIDTH = 32;
const CELL_HEIGHT = 28;
const COLUMNS_PER_MEASURE = 16;
const MEASURE_OPTIONS = [4, 6, 8];
const DEFAULT_MEASURE_COUNT = 4;
const STAFF_TOP_ROWS = 2;
const STAFF_BOTTOM_ROWS = 2;
const STRIP_HEIGHT = (ROWS + STAFF_TOP_ROWS + STAFF_BOTTOM_ROWS) * CELL_HEIGHT;
const RENDER_START_COPY = -2;
const RENDER_COPIES = 7;
const STAFF_LINE_PITCHES = ["F5", "D5", "B4", "G4", "E4"];
const CLEF_ANCHOR_PITCH = "G4";
const STAFF_LINE_SET = new Set(STAFF_LINE_PITCHES);

const emptyGrid = (columns: number): Grid =>
  Array.from({ length: ROWS }, () => Array.from({ length: columns }, () => false));

const copyGrid = (grid: Grid): Grid => grid.map((row) => [...row]);

const resizeGrid = (grid: Grid, columns: number): Grid =>
  Array.from({ length: ROWS }, (_, rowIndex) =>
    Array.from({ length: columns }, (_, columnIndex) =>
      Boolean(grid[rowIndex]?.[columnIndex])
    )
  );

const positiveModulo = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

const noteRow = (note: string) => PITCHES.indexOf(note);

const pitchRowY = (row: number) =>
  (STAFF_TOP_ROWS + row) * CELL_HEIGHT + CELL_HEIGHT / 2;

const visualRowForPitch = (pitch: string, inverted: boolean) => {
  const row = noteRow(pitch);
  if (row < 0) {
    return null;
  }

  return inverted ? ROWS - 1 - row : row;
};

const makeStarterStrip = (columns: number): Grid => {
  const grid = emptyGrid(columns);
  const notes: Array<[number, string]> = [
    [0, "E4"],
    [0, "B4"],
    [3, "D5"],
    [5, "G4"],
    [5, "B4"],
    [8, "C5"],
    [11, "G4"],
    [11, "D5"],
    [14, "C5"],
    [16, "E4"],
    [16, "B4"],
    [19, "A4"],
    [21, "G4"],
    [21, "B4"],
    [24, "A4"],
    [27, "E5"],
    [30, "D5"],
    [32, "F4"],
    [32, "C5"],
    [35, "D5"],
    [37, "A4"],
    [37, "E5"],
    [40, "D5"],
    [43, "F4"],
    [43, "C5"],
    [46, "B4"],
    [48, "E4"],
    [48, "A4"],
    [51, "B4"],
    [53, "G4"],
    [53, "C5"],
    [56, "D5"],
    [59, "B4"],
    [62, "E4"],
    [62, "E5"],
  ];

  notes.forEach(([column, note]) => {
    const row = noteRow(note);
    if (row >= 0 && column < columns) {
      grid[row][column] = true;
    }
  });

  return grid;
};

const rowsForColumn = (grid: Grid, column: number) =>
  grid.reduce<number[]>((rows, row, rowIndex) => {
    if (row[column]) {
      rows.push(rowIndex);
    }
    return rows;
  }, []);

function App() {
  const [measureCount, setMeasureCount] = useState(DEFAULT_MEASURE_COUNT);
  const [grid, setGrid] = useState<Grid>(() =>
    makeStarterStrip(DEFAULT_MEASURE_COUNT * COLUMNS_PER_MEASURE)
  );
  const [mode, setMode] = useState<AppMode>("edit");
  const [loopMode, setLoopMode] = useState<LoopMode>("mobius");
  const [isCranking, setIsCranking] = useState(false);
  const [tempo, setTempo] = useState(88);
  const [activeTick, setActiveTick] = useState<number | null>(null);
  const [crankPosition, setCrankPosition] = useState(0);
  const [paintValue, setPaintValue] = useState<boolean | null>(null);

  const crankPositionRef = useRef(0);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const lastPlayedTick = useRef<number | null>(null);
  const columns = measureCount * COLUMNS_PER_MEASURE;
  const stripWidth = columns * CELL_WIDTH;
  const renderPeriod = loopMode === "mobius" ? stripWidth * 2 : stripWidth;
  const renderOffset = positiveModulo(crankPosition, renderPeriod);
  const stripRunX = RENDER_START_COPY * stripWidth - renderOffset;

  const activeColumn =
    activeTick === null ? null : positiveModulo(activeTick, columns);

  const ensureSynth = useCallback(async () => {
    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }

    if (!synthRef.current) {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: {
          attack: 0.006,
          decay: 0.12,
          sustain: 0.18,
          release: 0.5,
        },
      }).toDestination();
      synth.volume.value = -8;
      synthRef.current = synth;
    }
  }, []);

  const playTick = useCallback(
    async (tick: number) => {
      if (lastPlayedTick.current === tick) {
        return;
      }

      lastPlayedTick.current = tick;
      setActiveTick(tick);

      const column = positiveModulo(tick, columns);
      const pass = Math.floor(tick / columns);
      const inverted = loopMode === "mobius" && positiveModulo(pass, 2) === 1;
      const rows = rowsForColumn(grid, column);

      if (rows.length === 0) {
        return;
      }

      await ensureSynth();
      const notes = rows.map((row) => PITCHES[inverted ? ROWS - 1 - row : row]);
      synthRef.current?.triggerAttackRelease(notes, "8n");
    },
    [columns, ensureSynth, grid, loopMode]
  );

  const setCrankFromDelta = useCallback(
    (delta: number) => {
      const nextPosition = crankPositionRef.current + delta;
      crankPositionRef.current = nextPosition;
      setCrankPosition(nextPosition);
      void playTick(Math.floor(nextPosition / CELL_WIDTH));
    },
    [playTick]
  );

  useEffect(() => {
    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!isCranking || mode !== "play") {
      return;
    }

    let frame = 0;
    let previousTime = performance.now();

    const animate = (time: number) => {
      const seconds = (time - previousTime) / 1000;
      previousTime = time;
      setCrankFromDelta((tempo / 60) * CELL_WIDTH * seconds);
      frame = requestAnimationFrame(animate);
    };

    void ensureSynth();
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [ensureSynth, isCranking, mode, setCrankFromDelta, tempo]);

  useEffect(() => {
    const clearPaint = () => setPaintValue(null);
    window.addEventListener("pointerup", clearPaint);
    return () => window.removeEventListener("pointerup", clearPaint);
  }, []);

  const toggleCell = (row: number, column: number, value?: boolean) => {
    setGrid((current) => {
      const next = copyGrid(current);
      next[row][column] = value ?? !next[row][column];
      return next;
    });
  };

  const handleCellPointerDown = (
    event: PointerEvent<HTMLButtonElement>,
    row: number,
    column: number
  ) => {
    event.preventDefault();
    const nextValue = !grid[row][column];
    setPaintValue(nextValue);
    toggleCell(row, column, nextValue);
  };

  const handleCellPointerEnter = (row: number, column: number) => {
    if (paintValue === null) {
      return;
    }
    toggleCell(row, column, paintValue);
  };

  const handleMeasureCountChange = (nextMeasureCount: number) => {
    const nextColumns = nextMeasureCount * COLUMNS_PER_MEASURE;
    setMeasureCount(nextMeasureCount);
    setGrid((current) => resizeGrid(current, nextColumns));
    crankPositionRef.current = 0;
    lastPlayedTick.current = null;
    setCrankPosition(0);
    setActiveTick(null);
  };

  const applyFold = (axis: "pitch" | "time" | "both") => {
    setGrid((current) => {
      const next = copyGrid(current);

      current.forEach((row, rowIndex) => {
        row.forEach((punched, columnIndex) => {
          if (!punched) {
            return;
          }

          if (axis === "pitch" || axis === "both") {
            next[ROWS - 1 - rowIndex][columnIndex] = true;
          }

          if (axis === "time" || axis === "both") {
            next[rowIndex][columns - 1 - columnIndex] = true;
          }

          if (axis === "both") {
            next[ROWS - 1 - rowIndex][columns - 1 - columnIndex] = true;
          }
        });
      });

      return next;
    });
  };

  const punchedCount = useMemo(
    () => grid.reduce((total, row) => total + row.filter(Boolean).length, 0),
    [grid]
  );

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (mode !== "play") {
      return;
    }

    event.preventDefault();
    void ensureSynth();
    setCrankFromDelta(event.deltaY * 0.7 + event.deltaX);
  };

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Music box controls">
        <div>
          <h1>Mobius Music Box</h1>
          <p>B3-B5 paper strip player</p>
        </div>

        <div className="toolbar">
          <div className="segmented-control" aria-label="Mode">
            <button
              className={mode === "edit" ? "active" : ""}
              onClick={() => {
                setMode("edit");
                setIsCranking(false);
              }}
            >
              Edit
            </button>
            <button
              className={mode === "play" ? "active" : ""}
              onClick={() => setMode("play")}
            >
              Play
            </button>
          </div>

          <div className="segmented-control" aria-label="Loop type">
            <button
              className={loopMode === "regular" ? "active" : ""}
              onClick={() => setLoopMode("regular")}
            >
              Loop
            </button>
            <button
              className={loopMode === "mobius" ? "active" : ""}
              onClick={() => setLoopMode("mobius")}
            >
              Mobius
            </button>
          </div>
        </div>
      </section>

      <section className="workspace" data-mode={mode}>
        <aside className="side-panel" aria-label="Strip tools">
          <div className="panel-group">
            <span className="panel-label">Strip</span>
            <button onClick={() => setGrid(makeStarterStrip(columns))}>Starter</button>
            <button onClick={() => setGrid(emptyGrid(columns))}>Clear</button>
          </div>

          <div className="panel-group">
            <span className="panel-label">Fold</span>
            <button onClick={() => applyFold("pitch")}>Pitch</button>
            <button onClick={() => applyFold("time")}>Time</button>
            <button onClick={() => applyFold("both")}>Both</button>
          </div>

          <div className="panel-group">
            <span className="panel-label">Crank</span>
            <button
              className={isCranking ? "primary active" : "primary"}
              onClick={() => {
                if (mode !== "play") {
                  setMode("play");
                }
                void ensureSynth();
                setIsCranking((value) => !value);
              }}
            >
              {isCranking ? "Stop" : "Start"}
            </button>
            <label className="tempo-control">
              <span>{tempo} bpm</span>
              <input
                type="range"
                min="48"
                max="144"
                value={tempo}
                onChange={(event) => setTempo(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="panel-group paper-length">
            <span className="panel-label">Paper</span>
            <div className="segmented-control length-control" aria-label="Paper length">
              {MEASURE_OPTIONS.map((option) => (
                <button
                  key={option}
                  className={measureCount === option ? "active" : ""}
                  onClick={() => handleMeasureCountChange(option)}
                >
                  {option}m
                </button>
              ))}
            </div>
          </div>

          <dl className="stats">
            <div>
              <dt>holes</dt>
              <dd>{punchedCount}</dd>
            </div>
            <div>
              <dt>columns</dt>
              <dd>{columns}</dd>
            </div>
          </dl>
        </aside>

        <div className="stage">
          {mode === "edit" ? (
            <div className="editor-wrap">
              <PitchLabels />
              <Strip
                grid={grid}
                editable
                activeColumn={null}
                inverted={false}
                columns={columns}
                onCellPointerDown={handleCellPointerDown}
                onCellPointerEnter={handleCellPointerEnter}
              />
            </div>
          ) : (
            <div className="player-frame">
              <div className="music-box">
                <div className="roller" />
                <div className="slot">
                  <div
                    className="scroll-strip"
                    style={{ height: STRIP_HEIGHT }}
                    onWheel={handleWheel}
                  >
                    <div
                      className="strip-run"
                      style={{
                        minHeight: STRIP_HEIGHT,
                        transform: `translateX(${stripRunX}px)`,
                        width: RENDER_COPIES * stripWidth,
                      }}
                    >
                      {Array.from({ length: RENDER_COPIES }).map((_, index) => {
                        const logicalCopy = RENDER_START_COPY + index;
                        const inverted =
                          loopMode === "mobius" &&
                          positiveModulo(logicalCopy, 2) === 1;
                        return (
                          <Strip
                            key={index}
                            grid={grid}
                            editable={false}
                            activeColumn={activeColumn}
                            inverted={inverted}
                            columns={columns}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="playhead" aria-hidden="true" />
                </div>
                <div className="roller lower" />
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

type StripProps = {
  grid: Grid;
  editable: boolean;
  activeColumn: number | null;
  inverted: boolean;
  columns: number;
  onCellPointerDown?: (
    event: PointerEvent<HTMLButtonElement>,
    row: number,
    column: number
  ) => void;
  onCellPointerEnter?: (row: number, column: number) => void;
};

function Strip({
  grid,
  editable,
  activeColumn,
  inverted,
  columns,
  onCellPointerDown,
  onCellPointerEnter,
}: StripProps) {
  return (
    <div
      className={`paper-strip ${inverted ? "is-inverted" : ""}`}
      style={{
        width: columns * CELL_WIDTH,
        height: STRIP_HEIGHT,
        gridTemplateColumns: `repeat(${columns}, ${CELL_WIDTH}px)`,
        gridTemplateRows: `repeat(${
          ROWS + STAFF_TOP_ROWS + STAFF_BOTTOM_ROWS
        }, ${CELL_HEIGHT}px)`,
      }}
    >
      <svg
        className="score-lines"
        width={columns * CELL_WIDTH}
        height={STRIP_HEIGHT}
        aria-hidden="true"
      >
        {PITCHES.map((pitch, rowIndex) => {
          const visualRow = inverted ? ROWS - 1 - rowIndex : rowIndex;
          const y = pitchRowY(visualRow);
          return (
            <line
              key={pitch}
              className={
                STAFF_LINE_SET.has(pitch) ? "pitch-line staff-line" : "pitch-line"
              }
              x1={0}
              x2={columns * CELL_WIDTH}
              y1={y}
              y2={y}
            />
          );
        })}
        {Array.from({ length: columns / COLUMNS_PER_MEASURE + 1 }).map(
          (_, index) => (
            <line
              key={index}
              className="measure-line"
              x1={index * COLUMNS_PER_MEASURE * CELL_WIDTH}
              x2={index * COLUMNS_PER_MEASURE * CELL_WIDTH}
              y1={0}
              y2={STRIP_HEIGHT}
            />
          )
        )}
      </svg>
      <div
        className="clef"
        aria-hidden="true"
        style={{
          top: pitchRowY(visualRowForPitch(CLEF_ANCHOR_PITCH, inverted) ?? 0),
        }}
      >
        {"\uD834\uDD1E"}
      </div>
      {grid.map((row, rowIndex) =>
        row.map((punched, columnIndex) => {
          const visualRow = inverted ? ROWS - 1 - rowIndex : rowIndex;
          const active = activeColumn === columnIndex;
          return (
            <button
              key={`${rowIndex}-${columnIndex}`}
              className={`strip-cell ${punched ? "punched" : ""} ${
                active ? "active-column" : ""
              }`}
              style={{
                gridColumn: columnIndex + 1,
                gridRow: visualRow + STAFF_TOP_ROWS + 1,
              }}
              aria-label={`${PITCHES[rowIndex]} column ${columnIndex + 1}`}
              disabled={!editable}
              onPointerDown={(event) =>
                onCellPointerDown?.(event, rowIndex, columnIndex)
              }
              onPointerEnter={() => onCellPointerEnter?.(rowIndex, columnIndex)}
            >
              <span />
            </button>
          );
        })
      )}
    </div>
  );
}

function PitchLabels() {
  return (
    <div
      className="pitch-labels"
      style={{
        gridTemplateRows: `repeat(${
          ROWS + STAFF_TOP_ROWS + STAFF_BOTTOM_ROWS
        }, ${CELL_HEIGHT}px)`,
      }}
    >
      {Array.from({ length: STAFF_TOP_ROWS }).map((_, index) => (
        <span key={`top-${index}`} />
      ))}
      {PITCHES.map((pitch) => (
        <span key={pitch}>{pitch}</span>
      ))}
      {Array.from({ length: STAFF_BOTTOM_ROWS }).map((_, index) => (
        <span key={`bottom-${index}`} />
      ))}
    </div>
  );
}

export default App;
