import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from "react";

type UnlockedLayers = {
  satellite: boolean;
  topo: boolean;
  osm: boolean;
};

interface ScoreContextType {
  score: number;
  addPoints: (amount: number) => void;
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

  const addPoints = useCallback((amount: number): void => {
    setScore((prev) => prev + amount);
  }, []);

  const deductPoints = useCallback(
    (amount: number): boolean => {
      if (score >= amount) {
        setScore((prev) => prev - amount);
        return true;
      }
      return false;
    },
    [score],
  );

  const resetScore = useCallback(() => {
    setScore(INITIAL_SCORE);
  }, []);

  const canAfford = useCallback(
    (amount: number): boolean => {
      return score >= amount;
    },
    [score],
  );

  const unlockLayer = useCallback((layer: "topo" | "osm"): boolean => {
    console.log("🔓 Unlocking layer:", layer);
    setUnlockedLayers((prev) => ({
      ...prev,
      [layer]: true,
    }));
    return true;
  }, []);

  const resetLayers = useCallback(() => {
    setUnlockedLayers(INITIAL_UNLOCKED);
  }, []);

  const contextValue = useMemo(
    () => ({
      score,
      addPoints,
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
      addPoints,
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
