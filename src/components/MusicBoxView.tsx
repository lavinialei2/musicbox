import React from "react";
import StripCanvas from "./StripCanvas";

const MusicBoxView: React.FC = () => {
  return (
    <div style={{ border: "2px solid black", width: "600px", height: "300px", overflowX: "scroll" }}>
      <StripCanvas />
    </div>
  );
};

export default MusicBoxView;
