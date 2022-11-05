const express = require("express");
const router = express.Router();

const discordApi = require("../services/discordApi");
const { hashToImage } = require("../utils");

const { HTTPStatus } = require("../enums");
const bitfield = require("discord-bitfield-calculator");

// ------------------- Middleware ------------------- //
const isLoggedIn = require("../middleware/isLoggedIn");
const hasDiscordLinked = require("../middleware/hasDiscordLinked");

router.use(isLoggedIn);
router.use(hasDiscordLinked);

// ------------------ Guild Routes ------------------ //

// GET /all - Get all guilds the user is in and has MANAGE_GUILD permissions
router.get("/all", async (req, res) => {
  const { access_token } = req.user.discord;

  const { data: guilds } = await discordApi.getGuilds(access_token);

  //prettier-ignore
  if (guilds?.status)
    return res
      .status(guilds.status)
      .json({ message: guilds.message });

  const filteredGuilds = guilds
    .reduce((acc, g) => {
      if (bitfield.permissions(g.permissions).includes("MANAGE_GUILD"))
        acc.push({ ...g, icon: hashToImage(g.id, g.icon, true) });

      return acc;
    }, [])
    .sort((a, b) => {
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });

  return res.status(HTTPStatus.OK).json(filteredGuilds);
});

// GET /:guildId - Get a guild by its id
router.get("/:guildId", async (req, res) => {
  const { guildId } = req.params;
  const { access_token } = req.user.discord;

  const guild = await discordApi.getGuild(access_token, guildId);

  if (!guild)
    return res
      .status(HTTPStatus.Unauthorized)
      .json({ message: "Unauthorized." });

  //prettier-ignore
  if (!bitfield.permissions(guild.permissions).includes("MANAGE_GUILD"))
    return res
      .status(HTTPStatus.Forbidden)
      .json({ message: "Forbidden." });

  return res
    .status(HTTPStatus.OK)
    .json({ ...guild, icon: hashToImage(guild.id, guild.icon, true) });
});

module.exports = router;
