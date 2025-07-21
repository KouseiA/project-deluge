const PvPBattle = require("../models/PvPBattle");
const User = require("../models/User");

// Challenge another user to a PvP battle
exports.challengeUser = async (req, res) => {
  const { opponent, monsterId } = req.body;
  const challenger = req.user.id;
  try {
    const challengerUser = await User.findById(challenger);
    const opponentUser = await User.findOne({ username: opponent });
    if (!opponentUser)
      return res.status(404).json({ message: "Opponent not found." });
    const player1Monster = challengerUser.monsters.find(
      (m) => m.id === monsterId
    );
    if (!player1Monster)
      return res.status(400).json({ message: "Monster not found." });
    const battle = new PvPBattle({
      player1: challengerUser.username,
      player2: opponentUser.username,
      player1Monster,
      player2Monster: {},
      state: "pending",
      turn: "player1",
      moves: [],
    });
    await battle.save();
    res.json({ battleId: battle._id, message: "Challenge sent." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// Accept a challenge and start the battle
exports.acceptChallenge = async (req, res) => {
  const { battleId, monsterId } = req.body;
  const userId = req.user.id;
  try {
    const battle = await PvPBattle.findById(battleId);
    if (!battle || battle.state !== "pending")
      return res.status(400).json({ message: "Invalid battle." });
    const user = await User.findById(userId);
    const player2Monster = user.monsters.find((m) => m.id === monsterId);
    if (!player2Monster)
      return res.status(400).json({ message: "Monster not found." });
    battle.player2Monster = player2Monster;
    battle.state = "active";
    await battle.save();
    res.json({ message: "Challenge accepted. Battle started." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// Get the current state of the PvP battle
exports.getBattleState = async (req, res) => {
  try {
    const battle = await PvPBattle.findById(req.params.battleId);
    if (!battle) return res.status(404).json({ message: "Battle not found." });
    res.json(battle);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// Make a move in the PvP battle
exports.makeMove = async (req, res) => {
  const { move, damage } = req.body;
  const username = req.user.username;
  try {
    const battle = await PvPBattle.findById(req.params.battleId);
    if (!battle || battle.state !== "active")
      return res.status(400).json({ message: "Invalid battle." });
    // Determine whose turn
    const isPlayer1 = battle.player1 === username;
    const isPlayer2 = battle.player2 === username;
    if (
      (battle.turn === "player1" && !isPlayer1) ||
      (battle.turn === "player2" && !isPlayer2)
    ) {
      return res.status(400).json({ message: "Not your turn." });
    }
    // Apply damage
    if (isPlayer1) {
      battle.player2Monster.stats.hp -= damage;
      if (battle.player2Monster.stats.hp <= 0) {
        battle.state = "finished";
        battle.winner = battle.player1;
      } else {
        battle.turn = "player2";
      }
    } else {
      battle.player1Monster.stats.hp -= damage;
      if (battle.player1Monster.stats.hp <= 0) {
        battle.state = "finished";
        battle.winner = battle.player2;
      } else {
        battle.turn = "player1";
      }
    }
    battle.moves.push({ by: username, move, damage });
    await battle.save();
    res.json({ message: "Move processed.", battle });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.getChallengeList = async (req, res) => {
  const { username } = req.body;
  try {
    const challenges = await PvPBattle.find({
      player2: username,
      state: "pending",
    });
    res.json({ challenges });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};
