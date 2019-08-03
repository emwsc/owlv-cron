const PRIVATE_KEY =
  "-----BEGIN PRIVATE KEY-----\n" +
  process.env.PRIVATE_KEY +
  "-----END PRIVATE KEY-----\n";

const TWITCH_OPTIONS = {
  host: "api.twitch.tv",
  port: 443,
  method: "GET",
  headers: {
    "Client-ID": process.env.TWITCH_KEY,
    Accept: "application/vnd.twitchtv.v5+json"
  }
};

const VODS_LANGS = [
  {
    code: "EN",
    channelId: 137512364
  },
  {
    code: "RU",
    channelId: 138601808
  }
];

module.exports = {
  PRIVATE_KEY,
  TWITCH_OPTIONS,
  VODS_LANGS
};
