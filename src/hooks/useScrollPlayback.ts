import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { useSavedStrip } from "../context/SavedStripContext";
import {
    PITCHES,
    CELL_WIDTH,
} from "../utils/constants";

function midiFromPitchIndex(index: number) {
    // C4 is MIDI 60
    return 60 + (PITCHES.length - 1 - index);
}

export const useScrollPlayback = (containerRef: React.RefObject<HTMLDivElement | null>) => {
    const { savedNotes } = useSavedStrip();
    const triggered = useRef<Set<string>>(new Set());
    const synth = useRef<Tone.Synth | null>(null);

    useEffect(() => {
        synth.current = new Tone.Synth().toDestination();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current || !synth.current) return;

            const scrollX = containerRef.current.scrollLeft;
            const playheadX = containerRef.current.clientWidth / 2;
            const absolutePlayheadX = scrollX + playheadX;
            const currentTimeIndex = Math.floor(absolutePlayheadX / CELL_WIDTH);

            savedNotes.forEach(({ pitch, time }) => {
                const id = `${pitch}-${time}`;
                if (time === currentTimeIndex && !triggered.current.has(id)) {
                    const midi = midiFromPitchIndex(pitch);
                    if (synth.current) {
                        synth.current.triggerAttackRelease(midi, "8n");
                    }
                    triggered.current.add(id);
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
