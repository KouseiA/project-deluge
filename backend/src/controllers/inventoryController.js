const User = require("../models/User");

exports.getInventory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.inventory || []);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.addItem = async (req, res) => {
  const { item } = req.body; // { name, effect, ... }
  try {
    const user = await User.findById(req.user.id);
    user.inventory.push(item);
    await user.save();
    res.json(user.inventory);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.removeItem = async (req, res) => {
  const { itemName } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const idx = user.inventory.findIndex((i) => i.name === itemName);
    if (idx === -1) return res.status(404).json({ message: "Item not found." });
    user.inventory.splice(idx, 1);
    await user.save();
    res.json(user.inventory);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.useItem = async (req, res) => {
  const { itemName, monsterId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const itemIdx = user.inventory.findIndex((i) => i.name === itemName);
    if (itemIdx === -1)
      return res.status(404).json({ message: "Item not found." });
    const monster = user.monsters.find((m) => m.id === monsterId);
    if (!monster)
      return res.status(404).json({ message: "Monster not found." });
    // Sample item effects
    if (itemName === "Potion") {
      monster.stats.hp += 20;
    } else if (itemName === "Rare Candy") {
      monster.exp = (monster.exp || 0) + 20;
    } else if (itemName === "Revive") {
      if (monster.stats.hp <= 0) monster.stats.hp = 20;
    }
    user.inventory.splice(itemIdx, 1);
    await user.save();
    res.json({ monsters: user.monsters, inventory: user.inventory });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};
