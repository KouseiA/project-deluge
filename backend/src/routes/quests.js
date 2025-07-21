const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getQuests,
  updateQuest,
  completeAchievement,
} = require("../controllers/questsController");

router.get("/", authMiddleware, getQuests);
router.post("/update", authMiddleware, updateQuest);
router.post("/complete", authMiddleware, completeAchievement);

module.exports = router;
