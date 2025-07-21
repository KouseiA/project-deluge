const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  monsters: { type: Array, default: [] },
  inventory: { type: Array, default: [] },
  quests: { type: Array, default: [] },
  achievements: { type: Array, default: [] },
});

module.exports = mongoose.model("User", userSchema);
