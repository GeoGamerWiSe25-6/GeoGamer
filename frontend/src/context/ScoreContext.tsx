import React, { createContext, useContext, useState, ReactNode } from "react";

interface ScoreContextType {
  score: number;
  deductPoints: (amount: number) => boolean;
  resetScore: () => void;
  canAfford: (amount: number) => boolean;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

const INITIAL_SCORE = 1000;

export function ScoreProvider({ children }: { children: ReactNode }) {
  const [score, setScore] = useState(INITIAL_SCORE);

  const deductPoints = (amount: number): boolean => {
    if (score >= amount) {
      setScore((prev) => prev - amount);
      return true;
    }
    return false;
  };

  const resetScore = () => {
    setScore(INITIAL_SCORE);
  };

  const canAfford = (amount: number): boolean => {
    return score >= amount;
  };

  return (
    <ScoreContext.Provider
      value={{ score, deductPoints, resetScore, canAfford }}
    >
      {children}
    </ScoreContext.Provider>
  );
}

export function useScore() {
  const context = useContext(ScoreContext);
  if (!context) {
    throw new Error("useScore must be used within ScoreProvider");
  }
  return context;
}
