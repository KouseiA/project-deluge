import React, { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

function Collection() {
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCollection = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/monsters/collection");
      setCollection(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCollection();
    // eslint-disable-next-line
  }, []);

  const handleRelease = async (monsterId) => {
    try {
      await apiRequest(`/monsters/collection/${monsterId}`, "DELETE");
      setCollection(collection.filter((m) => m.id !== monsterId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Your Monster Collection</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : collection.length === 0 ? (
        <p>You haven't caught any monsters yet. Go explore the map!</p>
      ) : (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {collection.map((monster, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                minWidth: 120,
              }}
            >
              <img src={monster.image} alt={monster.name} />
              <h4>{monster.name}</h4>
              <p>Type: {monster.type}</p>
              <p>Level: {monster.level || 1}</p>
              <div>
                <strong>Stats:</strong>
                <ul style={{ margin: 0 }}>
                  <li>HP: {monster.stats.hp}</li>
                  <li>Attack: {monster.stats.attack}</li>
                  <li>Defense: {monster.stats.defense}</li>
                  <li>Speed: {monster.stats.speed}</li>
                </ul>
              </div>
              <div>
                <strong>Abilities:</strong>
                <ul style={{ margin: 0 }}>
                  {monster.abilities.map((ab, i) => (
                    <li key={i}>{ab}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleRelease(monster.id)}
                style={{
                  marginTop: "0.5rem",
                  background: "#f55",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
              >
                Release
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Collection;
