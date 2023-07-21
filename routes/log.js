var express = require("express");
var router = express.Router();
const { db, getRapScore } = require("../database.js");

function getPlanet(query) {
  return new Promise((resolve, reject) => {
    db.get(query, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

router.get("/", async (req, res) => {
  try {
    // Get the RAP score
    let rap = await getRapScore("player");

    // Get the planets with the minimum temperature, maximum temperature, and maximum size
    let coldestPlanet = await getPlanet(
      "SELECT * FROM planets ORDER BY temperature ASC LIMIT 1"
    );

    let hottestPlanet = await getPlanet(
      "SELECT * FROM planets ORDER BY temperature DESC LIMIT 1"
    );

    let biggestPlanet = await getPlanet(
      "SELECT * FROM planets ORDER BY size DESC LIMIT 1"
    );

    // Render the log page
    res.render("log", { coldestPlanet, hottestPlanet, biggestPlanet, rap });
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
