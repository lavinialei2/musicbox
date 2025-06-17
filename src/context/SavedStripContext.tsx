import React, { createContext, useContext, useState } from "react";
import { NUM_ROWS, NUM_COLUMNS } from "../utils/constants";

type PunchGrid = boolean[][];

interface SavedStripContextType {
    isPunched: PunchGrid;
    setIsPunched: React.Dispatch<React.SetStateAction<PunchGrid>>;
}

const defaultGrid = Array.from({ length: NUM_ROWS }, () =>
    Array.from({ length: NUM_COLUMNS }, () => false)
);

const SavedStripContext = createContext<SavedStripContextType | undefined>(undefined);

export const SavedStripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPunched, setIsPunched] = useState<PunchGrid>(defaultGrid);

    return (
        <SavedStripContext.Provider value={{ isPunched, setIsPunched }}>
            {children}
        </SavedStripContext.Provider>
    );
};

export const useSavedStrip = (): SavedStripContextType => {
    const context = useContext(SavedStripContext);
    if (!context) throw new Error("useSavedStrip must be used within a SavedStripProvider");
    return context;
};