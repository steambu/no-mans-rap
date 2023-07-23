var express = require("express");
var router = express.Router();
const { db, getRapScore } = require("../database.js");

// Helper function to get a planet based on the provided SQL query
function getPlanet(query) {
  return new Promise((resolve, reject) => {
    db.get(query, (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        reject(new Error("No planet found for the provided query."));
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

    let coldestPlanet = await getPlanet(
      `SELECT 
        planets.*, 
        planet_resources.resource_name AS resource, 
        planet_events.event AS event 
       FROM 
        planets 
       LEFT JOIN 
        planet_resources ON planets.id = planet_resources.planet_id
       LEFT JOIN 
        planet_events ON planets.id = planet_events.planet_id
       ORDER BY 
        temperature ASC LIMIT 1`
    );
    let hottestPlanet = await getPlanet(
      `SELECT 
        planets.*, 
        planet_resources.resource_name AS resource, 
        planet_events.event AS event 
       FROM 
        planets 
       LEFT JOIN 
        planet_resources ON planets.id = planet_resources.planet_id
       LEFT JOIN 
        planet_events ON planets.id = planet_events.planet_id
       ORDER BY 
        temperature DESC LIMIT 1`
    );
    let biggestPlanet = await getPlanet(
      `SELECT 
        planets.*, 
        planet_resources.resource_name AS resource, 
        planet_events.event AS event 
       FROM 
        planets 
       LEFT JOIN 
        planet_resources ON planets.id = planet_resources.planet_id
       LEFT JOIN 
        planet_events ON planets.id = planet_events.planet_id
       ORDER BY 
        size DESC LIMIT 1`
    );

    // Include the RAP score in the data sent to the render function
    res.render("log", { coldestPlanet, hottestPlanet, biggestPlanet, rap });
  } catch (error) {
    console.error(error.message);
    res.status(500).render("error", {
      message: "There was an error retrieving planet data.",
    });
  }
});

module.exports = router;
