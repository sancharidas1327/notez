const mongoose = require("mongoose");

const xpTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true }, // positive = earned, negative = spent
    type: {
      type: String,
      enum: [
        "daily_login",
        "upload_note",
        "note_liked",
        "note_downloaded",
        "chat_help",
        "special_event",
        "redeem_premium",
        "redeem_gift_card",
      ],
      required: true,
    },
    note: { type: mongoose.Schema.Types.ObjectId, ref: "Note" }, // optional reference
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("XPTransaction", xpTransactionSchema);
