import { useCallback, useEffect, useState } from "react";
import { PuzzleMap } from "./components/Map/PuzzleMap";
import { GuessMap } from "./components/Map/GuessMap";
import { startRound, submitGuess } from "./services/gameApi";
import { ScoreDisplay } from "./components/Game/ScoreDisplay";
import { useScore } from "./context/ScoreContext";
import "./App.css";

export default function App() {
  const [roundId, setRoundId] = useState(null);
  const [view, setView] = useState(null);
  const [guess, setGuess] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    addPoints,
    resetLayers,
    resetGame,
    currentRound,
    totalRounds,
    isGameOver,
    nextRound,
    score,
  } = useScore();

  const loadRound = useCallback(async () => {
    setIsLoading(true);
    setGuess(null);
    setResult(null);
    setError(null);
    try {
      const data = await startRound();
      setRoundId(data.roundId);
      setView(data.view);
    } catch (e) {
      console.error("Failed to start round:", e);
      setError("Fehler beim Laden der Runde. Bitte erneut versuchen.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRound();
  }, [loadRound]);

  async function confirmGuess() {
    if (!roundId || !guess) {
      console.warn("⚠️ Cannot confirm: missing roundId or guess");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await submitGuess({
        roundId,
        guessLat: guess.lat,
        guessLon: guess.lon,
      });
      console.log("✅ Result:", data);
      setResult(data);
      addPoints(data.score);
    } catch (e) {
      console.error("Failed to submit guess:", e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleNextRound() {
    nextRound();
    resetLayers();
    loadRound();
  }

  function handleRestartGame() {
    resetGame();
    loadRound();
  }

  // ─── Game Over Screen ───────────────────────────────────────────────────────
  if (isGameOver) {
    const getRank = (s) => {
      if (s >= 3500) return { emoji: "🥇", label: "Geographie-Meister" };
      if (s >= 2500) return { emoji: "🥈", label: "Kartograph" };
      if (s >= 1500) return { emoji: "🥉", label: "Orientierungsläufer" };
      return { emoji: "🗺️", label: "" };
    };
    const rank = getRank(score);

    return (
      <div className="gameover-screen">
        <div className="gameover-card">
          <div className="gameover-emoji">{rank.emoji}</div>
          <h1 className="gameover-title">Spiel beendet!</h1>
          <p className="gameover-rank">{rank.label}</p>
          <div className="gameover-score">
            <span className="gameover-score-label">Finalscore</span>
            <span className="gameover-score-value">{score}</span>
            <span className="gameover-score-unit">Punkte</span>
          </div>
          <button
            className="btn-primary gameover-btn"
            onClick={handleRestartGame}
          >
            🔄 Nochmal spielen
          </button>
        </div>
      </div>
    );
  }

  // ─── Hauptspiel ─────────────────────────────────────────────────────────────
  return (
    <div className="app-container">
      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="game-grid">
        {/* Puzzle Map */}
        <div className="map-panel">
          <header className="panel-header">
            <h3>🗺️ Puzzle Map</h3>
            <div className="round-indicator">
              Runde <strong>{currentRound}</strong>
            </div>
            <ScoreDisplay />
            <button
              className="btn-restart"
              onClick={handleRestartGame}
              disabled={isLoading}
              title="Spiel neu starten"
            >
              Neu starten
            </button>
          </header>

          <div className="map-wrapper">
            <PuzzleMap view={view} roundReset={roundId} />
          </div>
        </div>

        {/* Guess Map */}
        <div className="map-panel">
          <header className="panel-header">
            <h3>📍 Guess Map</h3>

            <div className="header-controls">
              <span className="coordinates">
                {guess
                  ? `${guess.lat.toFixed(4)}, ${guess.lon.toFixed(4)}`
                  : "Klicke auf die Karte"}
              </span>

              <button
                className="btn-danger"
                disabled={!guess || isLoading}
                onClick={() => setGuess(null)}
              >
                ✕ Clear
              </button>

              <button
                className="btn-success"
                disabled={!guess || !roundId || isLoading}
                onClick={confirmGuess}
              >
                ✓ Confirm
              </button>
            </div>
          </header>

          {/* Ergebnis-Panel */}
          {result && (
            <div className="result-panel">
              <div className="result-item">
                <strong>📍 Ort:</strong> {result.community}
              </div>
              <div className="result-item">
                <strong>📏 Distanz:</strong> {result.distanceClassName}
              </div>
              <div className="result-item">
                <strong>🎯 Klasse:</strong>{" "}
                <span className={`class-badge class-${result.distanceClass}`}>
                  {result.distanceClass}
                </span>
              </div>
              <div className="result-item score">
                <strong>⭐ Verdient:</strong> +{result.score} Punkte
              </div>

              {/* Nächste Runde */}
              <button
                className="btn-primary next-round-btn"
                onClick={handleNextRound}
                disabled={isLoading}
              >
                {result
                  ? `Nächste Runde (${currentRound + 1}) starten`
                  : "Ergebnis anzeigen"}
              </button>
            </div>
          )}

          <div className={`map-wrapper ${result ? "with-result" : ""}`}>
            <GuessMap
              guess={guess}
              onChange={setGuess}
              result={result}
              roundId={roundId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
