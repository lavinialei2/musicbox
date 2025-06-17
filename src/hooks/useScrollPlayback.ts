import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { useSavedStrip } from "../context/SavedStripContext";
import { PITCHES, CELL_WIDTH } from "../utils/constants";

// Converts pitch index to MIDI note using pitch names
function midiFromPitchIndex(index: number): number {
    const pitchToMidi: Record<string, number> = {
        "C4": 60, "D4": 62, "E4": 64, "F4": 65, "G4": 67,
        "A4": 69, "B4": 71, "C5": 72, "D5": 74, "E5": 76,
        "F5": 77, "G5": 79, "A5": 81, "B5": 83, "C6": 84
    };
    return pitchToMidi[PITCHES[index]] ?? 60;
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

            console.log(`ScrollX: ${scrollX}, PlayheadX: ${playheadX}, Current Time Index: ${currentTimeIndex}`);
            console.log("Saved Notes:", savedNotes);

            for (let pitch = 0; pitch < PITCHES.length; pitch++) {
                const id = `${pitch}-${currentTimeIndex}`;
                const isPunched = savedNotes.some(n => n.pitch === pitch && n.time === currentTimeIndex);

                if (isPunched) {
                    console.log(`Note found at pitch ${pitch} (${PITCHES[pitch]}), time ${currentTimeIndex}`);
                }

                if (isPunched && !triggered.current.has(id)) {
                    const midi = midiFromPitchIndex(pitch);
                    console.log(`Playing MIDI note: ${midi}`);
                    synth.current.triggerAttackRelease(midi, "8n");
                    triggered.current.add(id);
                }
            }
        };

        const div = containerRef.current;
        div?.addEventListener("scroll", handleScroll);
        return () => div?.removeEventListener("scroll", handleScroll);
    }, [containerRef, savedNotes]);
};
