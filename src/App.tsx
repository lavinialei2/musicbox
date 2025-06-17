import React, { useState } from "react";
import MusicBoxView from "./components/MusicBoxView";
import PlaybackControls from "./components/PlaybackControls";
import EditStripModal from "./components/EditStripModal";
import { SavedStripProvider } from "./context/SavedStripContext";

const App: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <SavedStripProvider>
      <div style={{ display: "flex", padding: "2rem", gap: "2rem" }}>
        <MusicBoxView />
        <div>
          <PlaybackControls />
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
