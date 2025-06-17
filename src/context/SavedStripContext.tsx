import { createContext, useContext, useState, ReactNode } from "react";
import { Note } from "../types/Note";

interface SavedStripContextType {
  savedNotes: Note[];
  setSavedNotes: (notes: Note[]) => void;
}

const SavedStripContext = createContext<SavedStripContextType | undefined>(undefined);

export const SavedStripProvider = ({ children }: { children: ReactNode }) => {
  const [savedNotes, setSavedNotes] = useState<Note[]>([]);

  return (
    <SavedStripContext.Provider value={{ savedNotes, setSavedNotes }}>
      {children}
    </SavedStripContext.Provider>
  );
};

export const useSavedStrip = (): SavedStripContextType => {
  const context = useContext(SavedStripContext);
  if (!context) {
    throw new Error("useSavedStrip must be used within a SavedStripProvider");
  }
  return context;
};