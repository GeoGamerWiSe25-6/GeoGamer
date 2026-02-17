import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";

type UnlockedLayers = {
  satellite: boolean;
  topo: boolean;
  osm: boolean;
};

interface ScoreContextType {
  score: number;
  deductPoints: (amount: number) => boolean;
  resetScore: () => void;
  canAfford: (amount: number) => boolean;

  unlockedLayers: UnlockedLayers;
  unlockLayer: (layer: "topo" | "osm") => boolean;
  resetLayers: () => void;
}
const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

const INITIAL_SCORE = 1000;
const INITIAL_UNLOCKED: UnlockedLayers = {
  satellite: true,
  topo: false,
  osm: false,
};

export function ScoreProvider({ children }: { children: ReactNode }) {
  const [score, setScore] = useState(INITIAL_SCORE);
  const [unlockedLayers, setUnlockedLayers] =
    useState<UnlockedLayers>(INITIAL_UNLOCKED);

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

  const unlockLayer = (layer: "topo" | "osm"): boolean => {
    setUnlockedLayers((prev) => ({
      ...prev,
      [layer]: true,
    }));
    return true;
  };

  const resetLayers = () => {
    setUnlockedLayers(INITIAL_UNLOCKED);
  };

  const contextValue = useMemo(
    () => ({
      score,
      deductPoints,
      resetScore,
      canAfford,
      unlockedLayers,
      unlockLayer,
      resetLayers,
    }),
    [
      score,
      unlockedLayers,
      deductPoints,
      resetScore,
      canAfford,
      unlockLayer,
      resetLayers,
    ],
  );

  return (
    <ScoreContext.Provider value={contextValue}>
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
