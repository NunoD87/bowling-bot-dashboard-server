const express = require("express");
const router = express.Router();

const History = require("../models/History.model");
const User = require("../models/User.model");
const { HTTPStatus } = require("../enums");

// ------------------- Middleware ------------------- //
const isLoggedIn = require("../middleware/isLoggedIn");
const hasDiscordLinked = require("../middleware/hasDiscordLinked");

router.use(isLoggedIn);
router.use(hasDiscordLinked);

// ------------------ History Routes ------------------ //

// GET /:guildId - Get a guild's history
router.get("/:guildId", async (req, res) => {
  const { guildId } = req.params;

  if (!guildId)
    return res
      .status(HTTPStatus.BadRequest)
      .json({ message: "GuildId wasn't provided." });

  const history = await History.find({ guildId });
  const users = await User.find();

  console.log(history);

  if (history.length === 0)
    return res
      .status(HTTPStatus.NotFound)
      .json({ message: "History not found." });

  history.forEach((h) => {
    const user = users.find((u) => u.discord.id === h.userId);
    if (user) h.username = user.discord.username;
  });

  history.sort((a, b) => b.createdAt - a.createdAt);

  return res.status(HTTPStatus.OK).json(history);
});

// ------------------ Export ------------------ //
module.exports = router;
