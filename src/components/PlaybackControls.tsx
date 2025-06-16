import React from "react";

const PlaybackControls: React.FC = () => {
  return (
    <button onClick={() => alert("Play/Pause toggled!")}>
      ▶️ Play / Pause
    </button>
  );
};

export default PlaybackControls;
