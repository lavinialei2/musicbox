import React from "react";
import MusicBoxView from "./components/MusicBoxView";
import PlaybackControls from "./components/PlaybackControls";
import EditStripModal from "./components/EditStripModal";

const App: React.FC = () => {
  return (
    <div style={{ display: "flex", padding: "2rem", gap: "2rem" }}>
      <MusicBoxView />
      <div>
        <PlaybackControls />
        <EditStripModal />
      </div>
    </div>
  );
};

export default App;
