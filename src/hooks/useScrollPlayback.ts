import { useEffect } from "react";
import * as Tone from "tone";
import { useSavedStrip } from "../context/SavedStripContext";
import { PITCHES } from "../utils/constants";

export const useScrollPlayback = (containerRef: React.RefObject<HTMLDivElement | null>) => {
    const { isPunched } = useSavedStrip();

    useEffect(() => {
        const synth = new Tone.Synth().toDestination();
        const tickDuration = Tone.Time("8n").toSeconds();

        const scheduledEvents: number[] = [];

        // Clear all existing events
        const clearScheduled = () => {
            scheduledEvents.forEach(id => Tone.Transport.clear(id));
            scheduledEvents.length = 0;
        };

        // Schedule events based on punched grid
        const scheduleGrid = () => {
            clearScheduled();

            for (let pitch = 0; pitch < isPunched.length; pitch++) {
                for (let time = 0; time < isPunched[pitch].length; time++) {
                    if (isPunched[pitch][time]) {
                        const noteTime = time * tickDuration;
                        const note = PITCHES[pitch];

                        const id = Tone.Transport.schedule((t) => {
                            synth.triggerAttackRelease(note, "8n", t);
                        }, noteTime);

                        scheduledEvents.push(id);
                    }
                }
            }
        };

        scheduleGrid();
        Tone.Transport.start("+0.1");

        // Sync scroll position to transport position
        const onScroll = () => {
            if (!containerRef.current) return;

            const scrollLeft = containerRef.current.scrollLeft;
            const pixelsPerTick = containerRef.current.scrollWidth / isPunched[0].length;
            const tickPosition = scrollLeft / pixelsPerTick;
            const timePosition = tickPosition * tickDuration;

            Tone.Transport.seconds = timePosition;
        };

        const container = containerRef.current;
        container?.addEventListener("scroll", onScroll);

        return () => {
            clearScheduled();
            container?.removeEventListener("scroll", onScroll);
            Tone.Transport.stop();
        };
    }, [containerRef, isPunched]);
};
