const mongoose = require("mongoose");

const monsterSchema = new mongoose.Schema({
  name: String,
  type: String,
  image: String,
  description: String,
  stats: {
    hp: Number,
    attack: Number,
    defense: Number,
    speed: Number,
  },
  abilities: [String],
});

module.exports = mongoose.model("Monster", monsterSchema);
