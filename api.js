const https = require("https");
const moment = require("moment");
const admin = require("firebase-admin");

const { PRIVATE_KEY, VODS_LANGS } = require("./constants");
const {
  findMatchesForLastXDays,
  findMatchesForFutureXDays,
  mapVodsWithGames
} = require("./utils");
const { owlGetShedule, convertOwlSchedule } = require("./owl");
const { searchGameOnTwitchByLang } = require("./twitch");

moment().format();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: PRIVATE_KEY.replace(/\\n/g, "\n")
  }),
  databaseURL: process.env.FIREBASE_DB_URL
});

const updateMatchesInFirebase = (db, matches) => {
  return new Promise((resolve, reject) => {
    const latestMatches = findMatchesForLastXDays(10, matches);
    const closestMatches = findMatchesForFutureXDays(10, matches);
    const selectedMatches = [...closestMatches, ...latestMatches];
    if (!selectedMatches || selectedMatches.length === 0) {
      resolve();
      return;
    }
    searchGameOnTwitchByLang(VODS_LANGS)
      .then(items => {
        return items.reduce((arr, current) => arr.concat(current), []);
      })
      .then(vods => {
        const processedMatches = mapVodsWithGames(selectedMatches, vods);
        const batch = db.batch();
        processedMatches.forEach(m => {
          const docRef = db.collection("matches").doc(m.id.toString());
          batch.set(docRef, m);
        });
        batch.commit().then(resolve);
      });
  });
};

const updateStagesInFirebase = (db, stages) => {
  return new Promise((resolve, reject) => {
    const lastUpdateTime = `schedulecron ${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString()}`;
    const schedule = {
      year: 2019,
      lastUpdateTime,
      stages: stages
    };
    db.collection("schedule")
      .doc("2019")
      .update(schedule)
      .then(resolve);
  });
};

const updateSchedule = async () => {
  const db = admin.firestore();
  const results = await owlGetShedule();
  const { stages, matches } = convertOwlSchedule(results);
  await updateStagesInFirebase(db, stages);
  await updateMatchesInFirebase(db, matches);
};

module.exports.updateSchedule = updateSchedule;
