const User = require("../models/User");

const QUESTS = [
  { id: "catch_5", description: "Catch 5 monsters", goal: 5 },
  { id: "win_3", description: "Win 3 battles", goal: 3 },
  { id: "evolve_1", description: "Evolve a monster", goal: 1 },
  { id: "use_3_items", description: "Use 3 items", goal: 3 },
];
const ACHIEVEMENTS = [
  { id: "catch_5", description: "Caught 5 monsters!" },
  { id: "win_3", description: "Won 3 battles!" },
  { id: "evolve_1", description: "Evolved a monster!" },
  { id: "use_3_items", description: "Used 3 items!" },
];

exports.getQuests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      quests: user.quests.length
        ? user.quests
        : QUESTS.map((q) => ({ ...q, progress: 0, completed: false })),
      achievements: user.achievements.length ? user.achievements : [],
    });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.updateQuest = async (req, res) => {
  const { questId, increment } = req.body; // increment = how much to add
  try {
    const user = await User.findById(req.user.id);
    let quests = user.quests.length
      ? user.quests
      : QUESTS.map((q) => ({ ...q, progress: 0, completed: false }));
    const idx = quests.findIndex((q) => q.id === questId);
    if (idx === -1)
      return res.status(404).json({ message: "Quest not found." });
    if (!quests[idx].completed) {
      quests[idx].progress += increment;
      if (quests[idx].progress >= quests[idx].goal) {
        quests[idx].progress = quests[idx].goal;
        quests[idx].completed = true;
        // Add to achievements if not already present
        if (!user.achievements.find((a) => a.id === questId)) {
          user.achievements.push(ACHIEVEMENTS.find((a) => a.id === questId));
        }
      }
    }
    user.quests = quests;
    await user.save();
    res.json({ quests: user.quests, achievements: user.achievements });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.completeAchievement = async (req, res) => {
  const { achievementId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user.achievements.find((a) => a.id === achievementId)) {
      const ach = ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (ach) user.achievements.push(ach);
      await user.save();
    }
    res.json({ achievements: user.achievements });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};
