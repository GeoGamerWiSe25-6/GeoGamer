import { UNLOCK_COSTS } from "../../constants/config";
import "./UnlockDialog.css";

interface UnlockDialogProps {
  layer: "topo" | "osm";
  currentScore: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const LAYER_NAMES = {
  topo: "Topographische Karte",
  osm: "OSM Straßenkarte",
};

const LAYER_ICONS = {
  topo: "🗻",
  osm: "🗺️",
};

export function UnlockDialog({
  layer,
  currentScore,
  onConfirm,
  onCancel,
}: UnlockDialogProps) {
  const cost = UNLOCK_COSTS[layer];
  const canAfford = currentScore >= cost;
  const layerName = LAYER_NAMES[layer];
  const icon = LAYER_ICONS[layer];

  return (
    <div className="unlock-dialog-overlay" onClick={onCancel}>
      <div className="unlock-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="unlock-dialog-header">
          <div className="unlock-icon">{icon}</div>
          <h3>Tipp freischalten?</h3>
        </div>

        <div className="unlock-dialog-body">
          <p className="unlock-layer-name">{layerName}</p>

          <div className="unlock-cost">
            <span className="unlock-cost-label">Kosten:</span>
            <span className="unlock-cost-value">-{cost} Punkte</span>
          </div>

          <div className="unlock-balance">
            <span>Aktuell:</span>
            <span className="balance-current">{currentScore} Punkte</span>
          </div>

          <div className="unlock-balance">
            <span>Danach:</span>
            <span
              className={`balance-after ${!canAfford ? "insufficient" : ""}`}
            >
              {canAfford ? currentScore - cost : "Nicht genug"} Punkte
            </span>
          </div>

          {!canAfford && (
            <div className="unlock-warning">⚠️ Du hast nicht genug Punkte!</div>
          )}
        </div>

        <div className="unlock-dialog-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Abbrechen
          </button>
          <button
            className="btn-confirm"
            onClick={onConfirm}
            disabled={!canAfford}
          >
            {canAfford ? "Freischalten" : "Zu wenig Punkte"}
          </button>
        </div>
      </div>
    </div>
  );
}
