const User = require("../models/User");
const XPTransaction = require("../models/XPTransaction");

// XP thresholds per level (level = floor(xp/100) + 1, simple formula)
const getLevel = (xp) => Math.floor(xp / 100) + 1;

// Internal helper — use this from other controllers
const awardXP = async (userId, amount, type, noteId = null, description = "") => {
  const user = await User.findById(userId);
  if (!user) return;

  user.xp += amount;
  user.level = getLevel(user.xp);
  await user.save();

  await XPTransaction.create({
    user: userId,
    amount,
    type,
    note: noteId || undefined,
    description,
  });

  return { newXP: user.xp, newLevel: user.level };
};

// GET /api/xp/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ xp: -1 })
      .limit(20)
      .select("name avatar xp level college badges");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/xp/history  (auth required)
const getXPHistory = async (req, res) => {
  try {
    const history = await XPTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("note", "title");
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/xp/redeem  (auth required)
// Body: { type: "premium" | "gift_card", cost }
const redeemXP = async (req, res) => {
  try {
    const { type } = req.body;
    const costs = { premium: 500, gift_card: 300 };
    const cost = costs[type];

    if (!cost) return res.status(400).json({ message: "Invalid redemption type" });

    const user = await User.findById(req.user._id);
    if (user.xp < cost)
      return res.status(400).json({ message: "Not enough XP" });

    const xpType = type === "premium" ? "redeem_premium" : "redeem_gift_card";
    await awardXP(user._id, -cost, xpType, null, `Redeemed ${type}`);

    if (type === "premium") {
      const exp = new Date();
      exp.setMonth(exp.getMonth() + 1);
      user.plan = "premium";
      user.premiumExpiresAt = exp;
      await user.save();
    }

    res.json({ message: `Redeemed ${type} successfully`, remainingXP: user.xp - cost });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { awardXP, getLeaderboard, getXPHistory, redeemXP };
