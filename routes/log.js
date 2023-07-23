var express = require("express");
var router = express.Router();
const { db, getRapScore } = require("../database.js");

// Helper function to get a planet based on the provided SQL query
function getPlanet(query) {
  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else if (rows.length === 0) {
        reject(new Error("No planet found for the provided query."));
      } else {
        // Format the planet data similar to how you did it in the discovery page
        let planet = {
          id: rows[0].id,
          name: rows[0].name,
          type: rows[0].type,
          size: rows[0].size,
          temperature: rows[0].temperature,
          gravity: rows[0].gravity,
          perfectness: rows[0].perfectness,
          biome: rows[0].biome,
          species: rows[0].species,
          age: rows[0].age,
          distance: rows[0].distance,
          orbital_period: rows[0].orbital_period,
          resources: [],
          event: rows[0].event,
        };
        rows.forEach((row) => {
          // Add the resource to the planet
          planet.resources.push({
            name: row.resource_name,
            imageURL: row.resource_image_url,
          });
        });
        resolve(planet);
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
        planet_resources.resource_image_url AS resource_image_url, 
        planet_events.event AS event
       FROM 
        planets 
       LEFT JOIN 
        planet_resources ON planets.id = planet_resources.planet_id
       LEFT JOIN 
        planet_events ON planets.id = planet_events.planet_id
       WHERE 
        planets.id = (
            SELECT 
              id 
            FROM 
              planets 
            ORDER BY 
              temperature ASC 
            LIMIT 1
        )`
    );

    let hottestPlanet = await getPlanet(
      `SELECT 
        planets.*, 
        planet_resources.resource_name AS resource, 
        planet_resources.resource_image_url AS resource_image_url, 
        planet_events.event AS event
       FROM 
        planets 
       LEFT JOIN 
        planet_resources ON planets.id = planet_resources.planet_id
       LEFT JOIN 
        planet_events ON planets.id = planet_events.planet_id
       WHERE 
        planets.id = (
            SELECT 
              id 
            FROM 
              planets 
            ORDER BY 
              temperature DESC 
            LIMIT 1
        )`
    );

    let biggestPlanet = await getPlanet(
      `SELECT 
        planets.*, 
        planet_resources.resource_name AS resource, 
        planet_resources.resource_image_url AS resource_image_url, 
        planet_events.event AS event 
       FROM 
        planets 
       LEFT JOIN 
        planet_resources ON planets.id = planet_resources.planet_id
       LEFT JOIN 
        planet_events ON planets.id = planet_events.planet_id
       WHERE 
        planets.id = (
            SELECT 
              id 
            FROM 
              planets 
            ORDER BY 
              size DESC 
            LIMIT 1
        )`
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
