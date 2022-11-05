const HTTPStatus = {
  OK: 200,
  Created: 201,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  InternalServerError: 500,
};

const DiscordGrantType = {
  AuthorizationCode: "authorization_code",
  RefreshToken: "refresh_token",
};

const ConfigKeys = {
  ephemeral: "Ephemeral messages",
  allowedRoles: "Allowed roles",
  allowedChannels: "Allowed channels",
  adminChannel: "Admin channel",
  spareMessageEnabled: "Spare message enabled",
  spareMessage: "Spare message",
  strikeMessageEnabled: "Strike message enabled",
  strikeMessage: "Strike message",
};

module.exports = {
  HTTPStatus,
  DiscordGrantType,
  ConfigKeys,
};
