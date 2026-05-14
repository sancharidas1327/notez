const express = require("express");
const router = express.Router();
const { getLeaderboard, getXPHistory, redeemXP } = require("../controllers/xpController");
const { protect } = require("../middleware/authMiddleware");

router.get("/leaderboard", getLeaderboard);
router.get("/history", protect, getXPHistory);
router.post("/redeem", protect, redeemXP);

module.exports = router;
