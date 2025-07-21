import React, { useEffect, useState } from "react";
import monsters from "../data/monsters";
import monstersData from "../data/monsters";
import { apiRequest } from "../utils/api";
import "./Battle.css";
import Toast from "../components/Toast";

function getRandomMonster() {
  return monsters[Math.floor(Math.random() * monsters.length)];
}

function calculateDamage(attacker, defender, ability) {
  const base = attacker.stats.attack - defender.stats.defense / 2;
  return Math.max(1, Math.floor(base));
}

function calculateAbilityEffect(attacker, defender, ability) {
  if (ability.type === "damage") {
    const base =
      attacker.stats.attack + ability.power - defender.stats.defense / 2;
    return { type: "damage", value: Math.max(1, Math.floor(base)) };
  } else if (ability.type === "heal") {
    return { type: "heal", value: ability.power };
  } else if (ability.type === "buff") {
    return { type: "buff", stat: ability.stat, value: ability.power };
  }
  return { type: "none", value: 0 };
}

function Battle() {
  const [collection, setCollection] = useState([]);
  const [playerMonster, setPlayerMonster] = useState(null);
  const [wildMonster, setWildMonster] = useState(null);
  const [playerHP, setPlayerHP] = useState(0);
  const [wildHP, setWildHP] = useState(0);
  const [battleLog, setBattleLog] = useState([]);
  const [turn, setTurn] = useState("player");
  const [battleOver, setBattleOver] = useState(false);
  const [exp, setExp] = useState(0);
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [evolutionMsg, setEvolutionMsg] = useState("");
  const [showEvolution, setShowEvolution] = useState(false);
  const [toast, setToast] = useState("");
  const [playerShake, setPlayerShake] = useState(false);
  const [wildShake, setWildShake] = useState(false);

  const evolveSound = new Audio(
    "https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5e2.mp3"
  );
  const winSound = new Audio(
    "https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5e2.mp3"
  );

  // Fetch collection from backend
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

  const startBattle = (monster, idx) => {
    setPlayerMonster({ ...monster, idx });
    const wild = getRandomMonster();
    setWildMonster(wild);
    setPlayerHP(monster.stats.hp);
    setWildHP(wild.stats.hp);
    setBattleLog([`A wild ${wild.name} appeared!`]);
    setTurn(monster.stats.speed >= wild.stats.speed ? "player" : "wild");
    setBattleOver(false);
    setExp(0);
    setSelectedAbility(monster.abilities[0]);
  };

  const handleAbilityChange = (e) => {
    setSelectedAbility(e.target.value);
  };

  const playerAttack = () => {
    if (!selectedAbility) return;
    const ability = selectedAbility;
    const effect = calculateAbilityEffect(playerMonster, wildMonster, ability);
    let logMsg = "";
    if (effect.type === "damage") {
      let newHP = wildHP - effect.value;
      setBattleLog((log) => [
        ...log,
        `${playerMonster.name} used ${ability.name}! It dealt ${effect.value} damage.`,
      ]);
      setWildShake(true);
      setTimeout(() => setWildShake(false), 400);
      setWildHP(newHP);
      if (newHP <= 0) {
        setBattleLog((log) => [
          ...log,
          `You defeated the wild ${wildMonster.name}!`,
        ]);
        setBattleOver(true);
        setExp(10);
        setToast("You won the battle!");
        winSound.play();
        return;
      }
      setTurn("wild");
    } else if (effect.type === "heal") {
      let healed = Math.min(playerMonster.stats.hp, playerHP + effect.value);
      setBattleLog((log) => [
        ...log,
        `${playerMonster.name} used ${ability.name}! It healed ${effect.value} HP.`,
      ]);
      setPlayerHP(healed);
      setTurn("wild");
    } else if (effect.type === "buff") {
      setBattleLog((log) => [
        ...log,
        `${playerMonster.name} used ${ability.name}! ${effect.stat} increased by ${effect.value}.`,
      ]);
      playerMonster.stats[effect.stat] += effect.value;
      setTurn("wild");
    }
  };

  const wildAttack = () => {
    const ability = wildMonster.abilities[0];
    const effect = calculateAbilityEffect(wildMonster, playerMonster, ability);
    if (effect.type === "damage") {
      let newHP = playerHP - effect.value;
      setBattleLog((log) => [
        ...log,
        `Wild ${wildMonster.name} used ${ability.name}! It dealt ${effect.value} damage.`,
      ]);
      setPlayerShake(true);
      setTimeout(() => setPlayerShake(false), 400);
      setPlayerHP(newHP);
      if (newHP <= 0) {
        setBattleLog((log) => [...log, `Your ${playerMonster.name} fainted!`]);
        setBattleOver(true);
        return;
      }
      setTurn("player");
    } else if (effect.type === "heal") {
      let healed = Math.min(wildMonster.stats.hp, wildHP + effect.value);
      setBattleLog((log) => [
        ...log,
        `Wild ${wildMonster.name} used ${ability.name}! It healed ${effect.value} HP.`,
      ]);
      setWildHP(healed);
      setTurn("player");
    } else if (effect.type === "buff") {
      setBattleLog((log) => [
        ...log,
        `Wild ${wildMonster.name} used ${ability.name}! ${effect.stat} increased by ${effect.value}.`,
      ]);
      wildMonster.stats[effect.stat] += effect.value;
      setTurn("player");
    }
  };

  useEffect(() => {
    if (!battleOver && playerMonster && wildMonster) {
      if (turn === "wild") {
        setTimeout(wildAttack, 1000);
      }
    }
    // eslint-disable-next-line
  }, [turn]);

  // Level up logic with evolution
  function checkLevelUp(monster, expGained) {
    let exp = (monster.exp || 0) + expGained;
    let level = monster.level || 1;
    let stats = { ...monster.stats };
    let evolved = false;
    let evolvedMonster = null;
    while (exp >= level * 20) {
      exp -= level * 20;
      level += 1;
      stats.hp += 5;
      stats.attack += 2;
      stats.defense += 2;
      stats.speed += 1;
    }
    // Evolution check
    if (
      monster.evolvesTo &&
      monster.evolutionLevel &&
      level >= monster.evolutionLevel
    ) {
      const evo = monstersData.find((m) => m.id === monster.evolvesTo);
      if (evo) {
        evolved = true;
        evolvedMonster = {
          ...evo,
          exp,
          level,
        };
      }
    }
    if (evolved && evolvedMonster) {
      setEvolutionMsg(`${monster.name} evolved into ${evolvedMonster.name}!`);
      setShowEvolution(true);
      setToast(`${monster.name} evolved!`);
      evolveSound.play();
      setTimeout(() => setShowEvolution(false), 2500);
      return evolvedMonster;
    }
    return { ...monster, exp, level, stats };
  }

  // Award exp to player's monster after win (update backend)
  useEffect(() => {
    const updateExp = async () => {
      if (battleOver && exp > 0 && playerMonster) {
        try {
          // Find the monster in collection
          const monster = collection.find((m) => m.id === playerMonster.id);
          if (!monster) return;
          // Level up logic with evolution
          const updatedMonster = checkLevelUp(monster, exp);
          // Remove old, add updated
          const newCollection = collection.map((m) =>
            m.id === playerMonster.id ? updatedMonster : m
          );
          setCollection(newCollection);
          // Remove and re-add via API (simulate update)
          await apiRequest(
            `/monsters/collection/${playerMonster.id}`,
            "DELETE"
          );
          await apiRequest("/monsters/collection", "POST", {
            monster: updatedMonster,
          });
          // Update quest progress for win
          await apiRequest("/quests/update", "POST", {
            questId: "win_3",
            increment: 1,
          });
          // If evolution occurred, update quest progress for evolve
          if (evolutionMsg) {
            await apiRequest("/quests/update", "POST", {
              questId: "evolve_1",
              increment: 1,
            });
          }
        } catch (err) {
          setError(err.message);
        }
      }
    };
    updateExp();
    // eslint-disable-next-line
  }, [battleOver, exp]);

  if (loading) return <p>Loading your monsters...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      <h2>Battle!</h2>
      {!playerMonster ? (
        <>
          <p>Select a monster from your collection to battle:</p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {collection.length === 0 && (
              <p>You have no monsters! Catch some first.</p>
            )}
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
                  onClick={() => startBattle(monster, idx)}
                  style={{ marginTop: "0.5rem" }}
                >
                  Battle!
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem" }}>
            <div>
              <h3>Your Monster</h3>
              <img
                src={playerMonster.image}
                alt={playerMonster.name}
                className={`monster-img${playerShake ? " shake" : ""}`}
              />
              <p>
                <strong>{playerMonster.name}</strong>
              </p>
              <div className="hp-bar">
                <div
                  className="hp-bar-inner"
                  style={{
                    width: `${(playerHP / playerMonster.stats.hp) * 100}%`,
                  }}
                ></div>
              </div>
              <p>Level: {playerMonster.level || 1}</p>
              <p>EXP: {playerMonster.exp || 0}</p>
              <p>Abilities:</p>
              <ul>
                {playerMonster.abilities.map((ab, i) => (
                  <li key={i}>{ab}</li>
                ))}
              </ul>
              {turn === "player" && !battleOver && (
                <>
                  <label>Choose ability: </label>
                  <select
                    value={selectedAbility ? selectedAbility.name : ""}
                    onChange={(e) => {
                      const ab = playerMonster.abilities.find(
                        (a) => a.name === e.target.value
                      );
                      setSelectedAbility(ab);
                    }}
                  >
                    {playerMonster.abilities.map((ab, i) => (
                      <option key={i} value={ab.name}>
                        {ab.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="button"
                    onClick={playerAttack}
                    style={{ marginLeft: "1rem" }}
                  >
                    Attack
                  </button>
                </>
              )}
            </div>
            <div>
              <h3>Wild Monster</h3>
              <img
                src={wildMonster.image}
                alt={wildMonster.name}
                className={`monster-img${wildShake ? " shake" : ""}`}
              />
              <p>
                <strong>{wildMonster.name}</strong>
              </p>
              <div className="hp-bar">
                <div
                  className="hp-bar-inner"
                  style={{ width: `${(wildHP / wildMonster.stats.hp) * 100}%` }}
                ></div>
              </div>
              <p>Abilities:</p>
              <ul>
                {wildMonster.abilities.map((ab, i) => (
                  <li key={i}>{ab}</li>
                ))}
              </ul>
            </div>
          </div>
          <div
            style={{
              background: "#f9f9f9",
              border: "1px solid #ccc",
              padding: "1rem",
              marginBottom: "1rem",
              minHeight: 100,
            }}
          >
            <strong>Battle Log:</strong>
            <ul style={{ margin: 0 }}>
              {battleLog.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
          {evolutionMsg && (
            <div className={`evolution-msg${showEvolution ? " show" : ""}`}>
              {evolutionMsg}
            </div>
          )}
          {battleOver && (
            <button className="button" onClick={() => setPlayerMonster(null)}>
              Battle Again
            </button>
          )}
          <Toast message={toast} onClose={() => setToast("")} />
        </>
      )}
    </div>
  );
}

export default Battle;
