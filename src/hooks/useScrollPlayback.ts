import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { useSavedStrip } from "../context/SavedStripContext";
import { PITCHES, CELL_WIDTH, NUM_COLUMNS } from "../utils/constants";

export const useScrollPlayback = (containerRef: React.RefObject<HTMLDivElement | null>,
    suppressNextTick: React.MutableRefObject<boolean>
) => {
    const { isPunched } = useSavedStrip();
    const lastTriggeredTick = useRef<number | null>(null);

    useEffect(() => {
        const synth = new Tone.PolySynth(Tone.Synth).toDestination();

        const onScroll = () => {
            if (!containerRef.current) return;
            if (suppressNextTick.current) {
                suppressNextTick.current = false;
                return;
            }


            const scrollLeft = containerRef.current.scrollLeft;
            const playheadX = scrollLeft + containerRef.current.clientWidth / 2;

            // Global tick center
            const globalTick = Math.floor((playheadX - CELL_WIDTH / 2) / CELL_WIDTH);
            const wrappedTick = globalTick % NUM_COLUMNS;

            // Prevent duplicate triggers
            if (lastTriggeredTick.current === globalTick) return;

            // Trigger only if playhead is near center of tick
            const offset = playheadX % CELL_WIDTH;
            const centerMargin = 0; // px
            const distFromCenter = Math.abs(offset - CELL_WIDTH / 2);
            if (distFromCenter > centerMargin) return;

            lastTriggeredTick.current = globalTick;

            for (let pitch = 0; pitch < isPunched.length; pitch++) {
                if (isPunched[pitch][wrappedTick]) {
                    synth.triggerAttackRelease(PITCHES[pitch], "8n");
                }
            }
        };

        const container = containerRef.current;
        container?.addEventListener("scroll", onScroll);

        // Lock initial tick
        if (container) {
            const centerX = container.scrollLeft + container.clientWidth / 2;
            lastTriggeredTick.current = Math.floor((centerX - CELL_WIDTH / 2) / CELL_WIDTH);
        }

        return () => {
            container?.removeEventListener("scroll", onScroll);
            synth.dispose();
        };
    }, [containerRef, suppressNextTick, isPunched]);
};
