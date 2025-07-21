const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getInventory,
  addItem,
  removeItem,
  useItem,
} = require("../controllers/inventoryController");

router.get("/", authMiddleware, getInventory);
router.post("/add", authMiddleware, addItem);
router.post("/remove", authMiddleware, removeItem);
router.post("/use", authMiddleware, useItem);

module.exports = router;
