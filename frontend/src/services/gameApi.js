const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "APIError";
  }
}

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new APIError(
      error.error || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
    );
  }

  return response.json();
}

export async function startRound() {
  return fetchJSON(`${API_BASE}/api/start`);
}

export async function submitGuess({ roundId, guessLat, guessLon }) {
  return fetchJSON(`${API_BASE}/api/guess`, {
    method: "POST",
    body: JSON.stringify({ roundId, guessLat, guessLon }),
  });
}
