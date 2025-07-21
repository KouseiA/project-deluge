import React, { useState, useEffect } from "react";
import monsters from "../data/monsters";
import { apiRequest } from "../utils/api";
import Toast from "../components/Toast";

function getRandomMonster() {
  return monsters[Math.floor(Math.random() * monsters.length)];
}

function Map() {
  const [encountered, setEncountered] = useState(null);
  const [caught, setCaught] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const catchSound = new Audio(
    "https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5e2.mp3"
  );

  useEffect(() => {
    setEncountered(getRandomMonster());
    setCaught(false);
    setError("");
  }, []);

  const handleCatch = async () => {
    setLoading(true);
    setError("");
    try {
      await apiRequest("/monsters/collection", "POST", {
        monster: encountered,
      });
      setCaught(true);
      // Update quest progress
      await apiRequest("/quests/update", "POST", {
        questId: "catch_5",
        increment: 1,
      });
      setToast(`You caught ${encountered.name}!`);
      catchSound.play();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleNewEncounter = () => {
    setEncountered(getRandomMonster());
    setCaught(false);
    setError("");
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 16 }}>
      <h2>Explore the Map</h2>
      {encountered && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            margin: "1rem 0",
            display: "inline-block",
          }}
        >
          <img src={encountered.image} alt={encountered.name} />
          <h3>{encountered.name}</h3>
          <p>Type: {encountered.type}</p>
          <p>{encountered.description}</p>
          <div>
            <strong>Stats:</strong>
            <ul style={{ margin: 0 }}>
              <li>HP: {encountered.stats.hp}</li>
              <li>Attack: {encountered.stats.attack}</li>
              <li>Defense: {encountered.stats.defense}</li>
              <li>Speed: {encountered.stats.speed}</li>
            </ul>
          </div>
          <div>
            <strong>Abilities:</strong>
            <ul style={{ margin: 0 }}>
              {encountered.abilities.map((ab, i) => (
                <li key={i}>{ab}</li>
              ))}
            </ul>
          </div>
          {!caught ? (
            <button onClick={handleCatch} disabled={loading}>
              {loading ? "Catching..." : "Catch"}
            </button>
          ) : (
            <>
              <p>You caught {encountered.name}!</p>
              <button onClick={handleNewEncounter}>Find another monster</button>
            </>
          )}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      )}
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

export default Map;
