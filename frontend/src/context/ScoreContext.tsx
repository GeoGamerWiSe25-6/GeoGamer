import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
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

  // Runden
  currentRound: number;
  totalRounds: number;
  isGameOver: boolean;
  nextRound: () => void;
  resetGame: () => void;

  // Zoom-Penalty
  registerZoomIn: (zoomLevel: number) => void;
  zoomPenalty: number;

  // Layer
  unlockedLayers: UnlockedLayers;
  unlockLayer: (layer: "topo" | "osm") => boolean;
  resetLayers: () => void;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

const INITIAL_SCORE = 1000;
const ZOOM_PENALTY = 25;

const INITIAL_UNLOCKED: UnlockedLayers = {
  satellite: true,
  topo: false,
  osm: false,
};

export function ScoreProvider({ children }: { children: ReactNode }) {
  const [score, setScore] = useState(INITIAL_SCORE);
  const [currentRound, setCurrentRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [unlockedLayers, setUnlockedLayers] =
    useState<UnlockedLayers>(INITIAL_UNLOCKED);
  const [penalizedZoomLevels, setPenalizedZoomLevels] = useState<Set<number>>(
    new Set(),
  );
  // compiler beschwert sich sonst weil penalizedZoomLevels nicht explizit aufgerufen wird
  console.log(penalizedZoomLevels.size);
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
    (amount: number): boolean => score >= amount,
    [score],
  );

  // Zoom-Penalty: jedes neue Zoom-Level ab 3 kostet einmalig 25 Punkte pro Runde
  const registerZoomIn = useCallback((zoomLevel: number): void => {
    if (zoomLevel < 3) return;
    setPenalizedZoomLevels((prev) => {
      if (prev.has(zoomLevel)) return prev;
      setScore((s) => Math.max(0, s - ZOOM_PENALTY));
      const next = new Set(prev);
      next.add(zoomLevel);
      return next;
    });
  }, []);

  // kein Gameover
  const nextRound = useCallback(() => {
    setCurrentRound((prev) => prev + 1);
    setUnlockedLayers(INITIAL_UNLOCKED);
    setPenalizedZoomLevels(new Set());
  }, []);

  const resetGame = useCallback(() => {
    setScore(INITIAL_SCORE);
    setCurrentRound(1);
    setIsGameOver(false);
    setUnlockedLayers(INITIAL_UNLOCKED);
    setPenalizedZoomLevels(new Set());
  }, []);

  const unlockLayer = useCallback((layer: "topo" | "osm"): boolean => {
    console.log("🔓 Unlocking layer:", layer);
    setUnlockedLayers((prev) => ({ ...prev, [layer]: true }));
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
      currentRound,
      totalRounds: Infinity, // oder null/undefined und im UI speziell behandeln
      isGameOver,
      nextRound,
      resetGame,
      registerZoomIn,
      zoomPenalty: ZOOM_PENALTY,
      unlockedLayers,
      unlockLayer,
      resetLayers,
    }),
    [
      score,
      addPoints,
      deductPoints,
      resetScore,
      canAfford,
      currentRound,
      isGameOver,
      nextRound,
      resetGame,
      registerZoomIn,
      unlockedLayers,
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
