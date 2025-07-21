const User = require("../models/User");

exports.getCollection = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.monsters || []);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.addMonster = async (req, res) => {
  try {
    const { monster } = req.body;
    const user = await User.findById(req.user.id);
    user.monsters.push(monster);
    await user.save();
    res.json(user.monsters);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.removeMonster = async (req, res) => {
  try {
    const { monsterId } = req.params;
    const user = await User.findById(req.user.id);
    user.monsters = user.monsters.filter((m) => m.id !== parseInt(monsterId));
    await user.save();
    res.json(user.monsters);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};
