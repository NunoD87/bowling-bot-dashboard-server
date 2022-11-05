const express = require("express");
const router = express.Router();

const Config = require("../models/Config.model");
const { HTTPStatus } = require("../enums");
const { createHistory } = require("../utils");

// ------------------- Middleware ------------------- //
const isLoggedIn = require("../middleware/isLoggedIn");
const hasDiscordLinked = require("../middleware/hasDiscordLinked");

router.use(isLoggedIn);
router.use(hasDiscordLinked);

// ------------------ Config Routes ------------------ //

// GET /:guildId - Get a guild's config
router.get("/:guildId", async (req, res) => {
  const { guildId } = req.params;

  if (!guildId)
    return res
      .status(HTTPStatus.BadRequest)
      .json({ message: "GuildId wasn't provided." });

  const config = await Config.findOne({ guildId });

  if (!config)
    return res
      .status(HTTPStatus.NotFound)
      .json({ message: "Config not found." });

  return res.status(HTTPStatus.OK).json(config);
});

// POST /:guildId - Create a guild's config
router.post("/:guildId", async (req, res) => {
  const { guildId } = req.params;
  const { id } = req.user.discord;

  if (!guildId)
    return res
      .status(HTTPStatus.BadRequest)
      .json({ message: "GuildId wasn't provided." });

  const config = await Config.findOne({ guildId });

  const {
    enabled = config?.enabled || false,
    ephemeral = config?.ephemeral || true,
    allowedRoles = config?.allowedRoles || [],
    allowedChannels = config?.allowedChannels || [],
    adminChannel = config?.adminChannel || "",
    spareMessageEnabled = config?.spareMessageEnabled || false,
    spareMessage = strikeMessageEnabled ? config?.spareMessage : "Spare!",
    strikeMessageEnabled = config?.strikeMessageEnabled || false,
    strikeMessage = strikeMessageEnabled ? config?.strikeMessage : "Strike!",
  } = req.body;

  const editedConfig = {
    enabled,
    ephemeral,
    allowedRoles,
    allowedChannels,
    adminChannel,
    spareMessageEnabled,
    spareMessage,
    strikeMessageEnabled,
    strikeMessage,
  };

  createHistory(guildId, id, config, editedConfig);

  const newConfig = await Config.findOneAndUpdate(
    { guildId },
    {
      guildId,
      enabled,
      ephemeral,
      allowedRoles,
      allowedChannels,
      adminChannel,
      spareMessageEnabled,
      spareMessage,
      strikeMessageEnabled,
      strikeMessage,
    },
    { upsert: true, new: true }
  );

  if (!newConfig)
    return res
      .status(HTTPStatus.InternalServerError)
      .json({ message: "Something went wrong." });

  return res.status(HTTPStatus.OK).json(newConfig);
});

// ------------------- Exports ------------------- //
module.exports = router;
