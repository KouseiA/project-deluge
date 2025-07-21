const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  challengeUser,
  acceptChallenge,
  getBattleState,
  makeMove,
  getChallengeList,
} = require("../controllers/pvpController");

router.post("/challenge", authMiddleware, challengeUser);
router.post("/accept", authMiddleware, acceptChallenge);
router.get("/battle/:battleId", authMiddleware, getBattleState);
router.post("/move/:battleId", authMiddleware, makeMove);
router.post("/challenge-list", authMiddleware, getChallengeList);

module.exports = router;
