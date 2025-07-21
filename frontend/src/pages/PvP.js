import React, { useState, useEffect } from "react";
import { apiRequest } from "../utils/api";

function PvP() {
  const [collection, setCollection] = useState([]);
  const [opponent, setOpponent] = useState("");
  const [selectedMonster, setSelectedMonster] = useState("");
  const [challengeMsg, setChallengeMsg] = useState("");
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [acceptMonster, setAcceptMonster] = useState("");
  const [battle, setBattle] = useState(null);
  const [move, setMove] = useState("");
  const [damage, setDamage] = useState(0);
  const [battleMsg, setBattleMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");

  // Fetch user collection and username
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/monsters/collection");
        setCollection(data);
        const user = JSON.parse(localStorage.getItem("currentUser"));
        setUsername(user?.username || "");
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    })();
  }, []);

  // Poll for pending challenges
  useEffect(() => {
    if (!username) return;
    const poll = setInterval(async () => {
      try {
        const res = await apiRequest("/pvp/challenge-list", "POST", {
          username,
        });
        setPendingChallenges(res.challenges || []);
      } catch {}
    }, 3000);
    return () => clearInterval(poll);
  }, [username]);

  // Challenge another user
  const handleChallenge = async (e) => {
    e.preventDefault();
    setChallengeMsg("");
    setError("");
    try {
      const res = await apiRequest("/pvp/challenge", "POST", {
        opponent,
        monsterId: parseInt(selectedMonster),
      });
      setChallengeMsg(res.message);
    } catch (err) {
      setError(err.message);
    }
  };

  // Accept a challenge
  const handleAccept = async (battleId) => {
    setError("");
    try {
      await apiRequest("/pvp/accept", "POST", {
        battleId,
        monsterId: parseInt(acceptMonster),
      });
      setBattleMsg("Battle started!");
      fetchBattle(battleId);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch battle state
  const fetchBattle = async (battleId) => {
    try {
      const res = await apiRequest(`/pvp/battle/${battleId}`);
      setBattle(res);
    } catch (err) {
      setError(err.message);
    }
  };

  // Make a move
  const handleMove = async () => {
    setError("");
    setBattleMsg("");
    try {
      const res = await apiRequest(`/pvp/move/${battle._id}`, "POST", {
        move,
        damage: parseInt(damage),
      });
      setBattle(res.battle);
      setBattleMsg(res.message);
    } catch (err) {
      setError(err.message);
    }
  };

  // UI
  return (
    <div>
      <h2>PvP Battles</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {/* Challenge another user */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h3>Challenge Another User</h3>
        <form onSubmit={handleChallenge}>
          <input
            type="text"
            placeholder="Opponent username"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
          />
          <select
            value={selectedMonster}
            onChange={(e) => setSelectedMonster(e.target.value)}
          >
            <option value="">Select your monster</option>
            {collection.map((m, i) => (
              <option key={i} value={m.id}>
                {m.name} (Lv {m.level || 1})
              </option>
            ))}
          </select>
          <button type="submit" disabled={!opponent || !selectedMonster}>
            Challenge
          </button>
        </form>
        {challengeMsg && <p style={{ color: "green" }}>{challengeMsg}</p>}
      </div>
      {/* Accept challenges */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h3>Pending Challenges</h3>
        {pendingChallenges.length === 0 ? (
          <p>No challenges.</p>
        ) : (
          pendingChallenges.map((ch, i) => (
            <div key={i} style={{ marginBottom: "0.5rem" }}>
              <span>From: {ch.player1}</span>
              <select
                value={acceptMonster}
                onChange={(e) => setAcceptMonster(e.target.value)}
              >
                <option value="">Select your monster</option>
                {collection.map((m, j) => (
                  <option key={j} value={m.id}>
                    {m.name} (Lv {m.level || 1})
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAccept(ch._id)}
                disabled={!acceptMonster}
              >
                Accept
              </button>
            </div>
          ))
        )}
      </div>
      {/* PvP Battle UI */}
      {battle && (
        <div
          style={{
            border: "2px solid #2ecc40",
            padding: "1rem",
            marginTop: "1rem",
          }}
        >
          <h3>PvP Battle</h3>
          <p>
            Player 1: {battle.player1} ({battle.player1Monster.name}) HP:{" "}
            {battle.player1Monster.stats.hp}
          </p>
          <p>
            Player 2: {battle.player2} ({battle.player2Monster.name}) HP:{" "}
            {battle.player2Monster.stats.hp}
          </p>
          <p>
            Turn: {battle.turn === "player1" ? battle.player1 : battle.player2}
          </p>
          <p>Status: {battle.state}</p>
          <div>
            <input
              type="text"
              placeholder="Move name"
              value={move}
              onChange={(e) => setMove(e.target.value)}
            />
            <input
              type="number"
              placeholder="Damage"
              value={damage}
              onChange={(e) => setDamage(e.target.value)}
            />
            <button onClick={handleMove} disabled={battle.state !== "active"}>
              Attack
            </button>
          </div>
          {battleMsg && <p style={{ color: "green" }}>{battleMsg}</p>}
          {battle.state === "finished" && (
            <p style={{ color: "blue" }}>Winner: {battle.winner}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default PvP;
