import React, { useState, useRef } from "react";
import MusicBoxView from "./components/MusicBoxView";
import PlaybackControls from "./components/PlaybackControls";
import EditStripModal from "./components/EditStripModal";
import { SavedStripProvider } from "./context/SavedStripContext";

const App: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <SavedStripProvider>
      <div style={{ display: "flex", padding: "2rem", gap: "2rem" }}>
        <MusicBoxView containerRef={containerRef} />
        <div>
          <PlaybackControls containerRef={containerRef} />
          <button onClick={() => setIsEditing(true)}>Edit Music Strip</button>
        </div>
        {isEditing && (
          <EditStripModal onClose={() => setIsEditing(false)} />
        )}
      </div>
    </SavedStripProvider>
  );
};

export default App;
