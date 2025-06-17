import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { useSavedStrip } from "../context/SavedStripContext";

const PITCHES = [
    "C6", "B5", "A5", "G5", "F5", "E5", "D5", "C5",
    "B4", "A4", "G4", "F4", "E4", "D4", "C4"
];

const CELL_WIDTH = 30;
const SCROLL_THRESHOLD = 5; // px to trigger updates

function midiFromPitchIndex(index: number) {
    // C4 is MIDI 60
    return 60 + (PITCHES.length - 1 - index);
}

export const useScrollPlayback = (
    containerRef: React.RefObject<HTMLDivElement | null>
) => {
    const { savedNotes } = useSavedStrip();
    const lastScrollX = useRef(0);
    const triggered = useRef<Set<string>>(new Set());

    useEffect(() => {
        const synth = new Tone.Synth().toDestination();

        const handleScroll = () => {
            if (!containerRef.current) return;
            const scrollX = containerRef.current.scrollLeft;
            const visibleStart = Math.floor(scrollX / CELL_WIDTH);
            const visibleEnd = Math.floor((scrollX + containerRef.current.clientWidth) / CELL_WIDTH);

            // Only process when scroll position changes enough
            if (Math.abs(scrollX - lastScrollX.current) < SCROLL_THRESHOLD) return;
            lastScrollX.current = scrollX;

            // Trigger any notes in range that haven't been played yet
            savedNotes.forEach(({ pitch, time }) => {
                if (time >= visibleStart && time <= visibleEnd) {
                    const id = `${pitch}-${time}`;
                    if (!triggered.current.has(id)) {
                        const midi = midiFromPitchIndex(pitch);
                        synth.triggerAttackRelease(midi, "8n");
                        triggered.current.add(id);
                    }
                }
            });
        };

        const div = containerRef.current;
        if (div) div.addEventListener("scroll", handleScroll);

        return () => {
            if (div) div.removeEventListener("scroll", handleScroll);
        };
    }, [containerRef, savedNotes]);
};