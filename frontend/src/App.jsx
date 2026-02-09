import { useEffect, useState, useCallback } from "react";
import { PuzzleMap } from "./components/Map/PuzzleMap";
import { GuessMap } from "./components/Map/GuessMap";
import { startRound, submitGuess } from "./services/gameApi";
import "./App.css";

export default function App() {
  const [roundId, setRoundId] = useState(null);
  const [view, setView] = useState(null);
  const [guess, setGuess] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNewRound = useCallback(async () => {
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
    loadNewRound();
  }, [loadNewRound]);

  async function confirmGuess() {
    if (!roundId || !guess) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await submitGuess({
        roundId,
        guessLat: guess.lat,
        guessLon: guess.lon,
      });
      setResult(data);
    } catch (e) {
      console.error("Failed to submit guess:", e);
      setError("Fehler beim Absenden. Bitte erneut versuchen.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-container">
      {/* Error Banner */}
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
            <button
              className="btn-primary"
              onClick={loadNewRound}
              disabled={isLoading}
            >
              {isLoading ? "Lädt..." : "🔄 Neue Runde"}
            </button>
          </header>

          <div className="map-wrapper">
            <PuzzleMap view={view} />
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

          {/* Panel */}
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
                <strong>⭐ Score:</strong> {result.score}
              </div>
            </div>
          )}

          <div className={`map-wrapper ${result ? "with-result" : ""}`}>
            <GuessMap guess={guess} onChange={setGuess} result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
