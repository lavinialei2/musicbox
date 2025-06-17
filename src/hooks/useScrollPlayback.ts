import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { useSavedStrip } from "../context/SavedStripContext";
import { PITCHES, CELL_WIDTH } from "../utils/constants";

export const useScrollPlayback = (containerRef: React.RefObject<HTMLDivElement | null>) => {
    const { isPunched } = useSavedStrip();
    const lastTriggeredTimeRef = useRef<number | null>(null);

    useEffect(() => {
        const synth = new Tone.PolySynth(Tone.Synth).toDestination();

        const onScroll = () => {
            if (!containerRef.current) return;

            const scrollLeft = containerRef.current.scrollLeft;
            const playheadX = scrollLeft + containerRef.current.clientWidth / 2;
            const currentTimeIndex = Math.floor(playheadX / CELL_WIDTH) - 1;

            if (lastTriggeredTimeRef.current === currentTimeIndex) return;

            for (let pitch = 0; pitch < isPunched.length; pitch++) {
                if (isPunched[pitch][currentTimeIndex]) {
                    synth.triggerAttackRelease(PITCHES[pitch], "8n");
                }
            }

            lastTriggeredTimeRef.current = currentTimeIndex;
        };

        const container = containerRef.current;
        container?.addEventListener("scroll", onScroll);

        return () => {
            container?.removeEventListener("scroll", onScroll);
            synth.dispose(); // clean up
        };
    }, [containerRef, isPunched]);

};
