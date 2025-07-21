import React, { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";
import Toast from "../components/Toast";

function Quests() {
  const [quests, setQuests] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (quests.some((q) => q.completed)) {
      setToast("Quest completed!");
    }
  }, [quests]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("/quests");
      setQuests(res.quests);
      setAchievements(res.achievements);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 16 }}>
      <h2>Quests & Achievements</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h3>Quests</h3>
      {quests.length === 0 ? (
        <p>No quests.</p>
      ) : (
        <ul>
          {quests.map((q, idx) => (
            <li key={idx} style={{ marginBottom: "1rem" }}>
              <strong>{q.description}</strong>
              <div
                style={{
                  width: 200,
                  background: "#eee",
                  borderRadius: 4,
                  margin: "0.5rem 0",
                }}
              >
                <div
                  style={{
                    width: `${(q.progress / q.goal) * 100}%`,
                    background: q.completed ? "#2ecc40" : "#3498db",
                    height: 12,
                    borderRadius: 4,
                  }}
                ></div>
              </div>
              <span>
                {q.progress} / {q.goal}{" "}
                {q.completed && (
                  <span style={{ color: "#2ecc40", marginLeft: 8 }}>
                    Completed!
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      <h3>Achievements</h3>
      {achievements.length === 0 ? (
        <p>No achievements yet.</p>
      ) : (
        <ul>
          {achievements.map((a, idx) => (
            <li key={idx} style={{ color: "#2ecc40", fontWeight: "bold" }}>
              {a.description}
            </li>
          ))}
        </ul>
      )}
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

export default Quests;
