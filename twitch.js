const https = require("https");

const { TWITCH_OPTIONS } = require("./constants");

const searchGameOnTwitchByLang = langs => {
  const promises = langs.map(lang => {
    return searchGameOnTwitch(lang.code, lang.channelId, 0);
  });
  return Promise.all(promises);
};

const searchGameOnTwitch = (langCode, channelId, offset = 0) => {
  return new Promise((resolve, reject) => {
    const options = { ...TWITCH_OPTIONS };
    options.path = `/kraken/channels/${channelId}/videos?limit=100&offset=${offset}`;
    const req = https.request(options, res => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        body = JSON.parse(body);
        resolve(body.videos.map(v => ({ ...v, langCode })));
      });
    });
    req.on("error", e => {
      resolve({ error: "true" });
    });
    req.end();
  });
};

module.exports = {
  searchGameOnTwitchByLang
};
