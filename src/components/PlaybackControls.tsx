import React, { useState, useEffect } from "react";

type Props = {
  containerRef: React.RefObject<HTMLDivElement | null>;
};

const PlaybackControls: React.FC<Props> = ({ containerRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying || !containerRef.current) return;

    const speed = 0.6; // pixels per frame
    let animationFrame: number;

    const animate = () => {
      if (!containerRef.current) return;
      containerRef.current.scrollLeft += speed;
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, containerRef]);

  return (
    <div style={{ marginTop: "1rem" }}>
      <button onClick={() => setIsPlaying(prev => !prev)}>
        {isPlaying ? "Stop" : "Play"}
      </button>
    </div>
  );
};

export default PlaybackControls;
