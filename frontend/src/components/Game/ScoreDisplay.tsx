import { useScore } from "../../context/ScoreContext";
import "./ScoreDisplay.css";

export function ScoreDisplay() {
  const { score } = useScore();

  return (
    <div className="score-display">
      <div className="score-icon">⭐</div>
      <div className="score-content">
        <div className="score-label">Punkte</div>
        <div className="score-value">{score}</div>
      </div>
    </div>
  );
}
