const { Schema, model } = require("mongoose");

const configSchema = new Schema(
  {
    guildId: {
      type: String,
      required: true,
      unique: true,
    },
    enabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    ephemeral: {
      type: Boolean,
      required: true,
      default: true,
    },
    allowedRoles: {
      type: [String],
      required: false,
      default: [],
    },
    allowedChannels: {
      type: [String],
      required: false,
      default: [],
    },
    adminChannel: {
      type: String,
      required: false,
      default: null,
    },
    spareMessageEnabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    spareMessage: {
      type: String,
      required: false,
      default: "Spare!",
    },
    strikeMessageEnabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    strikeMessage: {
      type: String,
      required: false,
      default: "Strike!",
    },
  },
  {
    timestamps: true,
  }
);

const Config = model("Config", configSchema);

module.exports = Config;
