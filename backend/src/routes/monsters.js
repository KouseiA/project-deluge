const express = require("express");
const router = express.Router();
const {
  getCollection,
  addMonster,
  removeMonster,
} = require("../controllers/monsterController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/collection", authMiddleware, getCollection);
router.post("/collection", authMiddleware, addMonster);
router.delete("/collection/:monsterId", authMiddleware, removeMonster);

module.exports = router;
