const axios = require("axios");

class DiscordOAuthService {
  constructor() {
    this.api = axios.create({
      baseURL: "https://discord.com/api/oauth2",
    });
  }

  token(params) {
    return this.api.post("/token", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  revoke(params) {
    return this.api.post("/token/revoke", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
}

const discordOAuth = new DiscordOAuthService();

module.exports = discordOAuth;
