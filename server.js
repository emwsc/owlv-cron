const express = require("express");
const api = require("./api");
const app = express();

app.get("/api/v1/update_schedule", (req, res) => {
  api.updateSchedule().then(
    () => {
      res.status(200).send({
        code: "ok"
      });
    },
    error => {
      debugger;
      res.status(500).send({
        code: "NOT OK",
        message: error.message
      });
    }
  );
});

app.get("/", (req, res) => {
  res.status(200).send("goto https://owlv-cron.glitch.me/api/v1/update_schedule");
});

const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
