const { ConfigKeys } = require("../enums");
const History = require("../models/History.model");

function hashToImage(id, hash, guild = false) {
  if (hash === null) return null;

  const baseUrl = guild
    ? "https://cdn.discordapp.com/icons/"
    : "https://cdn.discordapp.com/avatars/";

  return hash.startsWith("a_")
    ? `${baseUrl}${id}/${hash}.gif`
    : `${baseUrl}${id}/${hash}.webp`;
}

function createHistory(guildId, userId, config, newConfig) {
  let actions = [];

  for (const k in config) {
    if (k === "toString") continue;
    if (!newConfig[k]) continue;
    if (config[k] !== newConfig[k]) actions.push(k);
  }

  if (actions.length === 0) return;

  const history = History.create({
    guildId,
    userId,
    actions,
  });

  return history;
}

module.exports = {
  hashToImage,
  createHistory,
};
