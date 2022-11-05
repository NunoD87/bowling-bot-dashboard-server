const { Schema, model } = require("mongoose");

const historySchema = new Schema(
  {
    guildId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    actions: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const History = model("History", historySchema);

module.exports = History;
