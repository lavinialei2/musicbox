import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { useSavedStrip } from "../context/SavedStripContext";
import { PITCHES, CELL_WIDTH } from "../utils/constants";

const pitchToMidi: Record<string, number> = {
    "C4": 60, "D4": 62, "E4": 64, "F4": 65, "G4": 67,
    "A4": 69, "B4": 71, "C5": 72, "D5": 74, "E5": 76,
    "F5": 77, "G5": 79, "A5": 81, "B5": 83, "C6": 84
};

export const useScrollPlayback = (containerRef: React.RefObject<HTMLDivElement | null>) => {
    const { isPunched } = useSavedStrip();
    const triggered = useRef<Set<string>>(new Set());
    const synth = useRef<Tone.Synth | null>(null);

    useEffect(() => {
        synth.current = new Tone.Synth().toDestination();
        console.log("Synth initialized");
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current || !synth.current) {
                console.warn("No container or synth available");
                return;
            }

            const scrollX = containerRef.current.scrollLeft;
            const playheadX = containerRef.current.clientWidth / 2;
            const absolutePlayheadX = scrollX + playheadX;
            const currentTimeIndex = Math.floor(absolutePlayheadX / CELL_WIDTH);

            console.log("== Scroll Event ==");
            console.log("ScrollX:", scrollX, "PlayheadX:", playheadX);
            console.log("AbsolutePlayheadX:", absolutePlayheadX, "CurrentTimeIndex:", currentTimeIndex);

            isPunched.forEach((row, pitchIndex) => {
                const pitchName = PITCHES[pitchIndex];
                const valueAtTime = row?.[currentTimeIndex];

                console.log(`Checking pitch ${pitchName} (index ${pitchIndex}), time ${currentTimeIndex}:`, valueAtTime);

                if (valueAtTime) {
                    const id = `${pitchIndex}-${currentTimeIndex}`;
                    if (!triggered.current.has(id)) {
                        const midi = pitchToMidi[pitchName] ?? 60;
                        console.log(`🎵 Triggering note: ${pitchName} (MIDI ${midi}) at time ${currentTimeIndex}`);
                        if (synth.current) synth.current.triggerAttackRelease(midi, "8n");
                        triggered.current.add(id);
                    }
                }
            });
        };

        const div = containerRef.current;
        if (div) {
            console.log("Adding scroll listener");
            div.addEventListener("scroll", handleScroll);
        }
        return () => {
            if (div) {
                console.log("Removing scroll listener");
                div.removeEventListener("scroll", handleScroll);
            }
        };
    }, [isPunched, containerRef]);

};
