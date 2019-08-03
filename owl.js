const https = require("https");

/**
 * Download schedule and scores from api.overwatchleague.com
 */
const owlGetShedule = () => {
  return new Promise((resolve, reject) => {
    https.get("https://api.overwatchleague.com/schedule", res => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        body = JSON.parse(body);
        resolve(body);
      });
    });
  });
};

const convertCompetitors = competitors => {
  return competitors.map(competitor => {
    if (!competitor) {
      return {
        id: null,
        secondaryColor: null,
        primaryColor: null,
        name: null,
        logo: null
      };
    }
    return {
      id: competitor.id,
      secondaryColor: "#" + competitor.secondaryColor,
      primaryColor: "#" + competitor.primaryColor,
      name: competitor.name,
      logo: competitor.logo
    };
  });
};

const convertMatches = (matches, stage) => {
  return matches.map(match => {
    const m = {
      startDate: match.startDateTS,
      id: match.id,
      bracket:
        stage.name + " " + match.tournament.type /*match.bracket.stage.title*/,
      scores: match.scores.map(score => {
        return score.value;
      }),
      competitors: convertCompetitors(match.competitors)
    };
    return m;
  });
};

/**
 * Convert OWL schedule to my firebase format
 */
const convertOwlSchedule = results => {
  let matches = [];
  const stages = results.data.stages.map(stage => {
    const s = {
      id: stage.id,
      name: stage.name,
      weeks: stage.weeks.map(week => {
        const weekMatches = convertMatches(week.matches, stage);
        matches = [...matches, ...weekMatches];
        return {
          id: week.id,
          startDate: week.startDate,
          endDate: week.endDate,
          name: week.name,
          matches: weekMatches
        };
      })
    };
    const playoff = stage.matches.filter(m => m.tournament.type === "PLAYOFFS");
    if (playoff && playoff.length > 0) {
      const playOffMatches = convertMatches(playoff, stage);
      const playoffWeek = {
        id: stage.id + "-PLAYOFF",
        startDate: playoff[0].startDateTS,
        endDate: playoff[playoff.length - 1].startDateTS,
        name: "PLAYOFF WEEK",
        matches: playOffMatches
      };
      s.weeks.push(playoffWeek);
      matches = [...matches, ...playOffMatches];
    }
    return s;
  });
  return { stages, matches };
};

module.exports = {
  owlGetShedule,
  convertOwlSchedule
};
