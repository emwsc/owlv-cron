const moment = require("moment");

const timeConverter = unixTimestamp => {
  const a = new Date(unixTimestamp);
  return a;
};

const findMatchesForLastXDays = (daysCount, matches) => {
  const now = moment();
  return matches.filter(match => {
    const startDate = moment(timeConverter(match.startDate))
    const diff = now.diff(startDate, "days");
    return diff <= daysCount && diff >= 0;
  });
};

const findMatchesForFutureXDays = (daysCount, matches) => {
  const now = moment();
  return matches.filter(match => {
    const startDate = moment(timeConverter(match.startDate))
    const diff = Math.abs(now.diff(startDate, "days"));
    return now.isSameOrBefore(startDate) && diff <= daysCount;
  });
};

const filterVideos = (vods, fromDate, toDate, teamOne, teamTwo) => {
  const selectedVideos = vods.filter(video => {
    const date = moment(new Date(video.recorded_at));
    const isFullMatch =
      video.title.includes("Full Match") || video.title.includes("Полный матч");
    const hasTeams =
      video.title.includes(teamOne) && video.title.includes(teamTwo);
    return (
      date.isSameOrAfter(fromDate) &&
      date.isSameOrBefore(toDate) &&
      isFullMatch &&
      hasTeams
    );
  });
  return selectedVideos;
};

const mapVodsWithGames = (matches, vods) => {
  return matches.map(match => {
    const { competitors, startDate } = match;
    const fromDate = moment(timeConverter(startDate)).subtract(1, 'days');
    const toDate = moment(timeConverter(startDate)).add(1, 'days');
    const teamOne = competitors[0].name;
    const teamTwo = competitors[1].name;
    const selectedVideos = filterVideos(
      vods,
      fromDate,
      toDate,
      teamOne,
      teamTwo
    );
    const matchWithVods = { ...match, startDateObj: null, vods: [] };
    if (selectedVideos.length === 0) return matchWithVods;
    matchWithVods.vods = selectedVideos.map(video => ({
      url: video.url,
      id: video._id,
      langCode: video.langCode,
      title: video.title,
      broadcast_id: video.broadcast_id,
      thumbnails: {
        custom: video.thumbnails.medium[0].url,
        generated: video.thumbnails.medium[1].url
      }
    }));
    return matchWithVods;
  });
};

module.exports = {
  findMatchesForFutureXDays,
  findMatchesForLastXDays,
  mapVodsWithGames,
  timeConverter
};
