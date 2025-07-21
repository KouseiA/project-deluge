const mongoose = require("mongoose");

const pvpBattleSchema = new mongoose.Schema({
  player1: { type: String, required: true }, // username
  player2: { type: String, required: true }, // username
  player1Monster: { type: Object, required: true },
  player2Monster: { type: Object, required: true },
  state: { type: String, default: "pending" }, // pending, active, finished
  turn: { type: String }, // 'player1' or 'player2'
  moves: { type: Array, default: [] }, // { by: username, move: string, damage: number, ... }
  winner: { type: String }, // username
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PvPBattle", pvpBattleSchema);
