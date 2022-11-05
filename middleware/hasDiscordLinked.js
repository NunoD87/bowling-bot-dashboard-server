const { HTTPStatus } = require("../enums");

function hasDiscordLinked(req, res, next) {
  const { user } = req;

  if (!user?.discord?.access_token)
    return res
      .status(HTTPStatus.Unauthorized)
      .json({ message: "You must be logged in with Discord." });

  next();
}

module.exports = hasDiscordLinked;
