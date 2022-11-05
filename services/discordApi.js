const axios = require("axios");

class DiscordApi {
  constructor() {
    this.api = axios.create({
      baseURL: "https://discord.com/api/v10",
    });
  }

  getMe(access_token) {
    return this.api.get("/users/@me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  }

  getGuilds(access_token) {
    return this.api
      .get("/users/@me/guilds", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .catch(({ response: err }) => {
        return {
          data: {
            message: err.data.message,
            status: err.status,
          },
        };
      });
  }

  async getGuild(access_token, guildId) {
    const { data: guilds } = await this.getGuilds(access_token);

    return guilds.find((g) => g.id === guildId);
  }
}

const discordApi = new DiscordApi();

module.exports = discordApi;
