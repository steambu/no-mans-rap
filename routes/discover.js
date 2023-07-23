// Imports
const express = require("express");
const router = express.Router();
const { db, getRapScore } = require("../database.js");
const planetGenerator = require("./planetGenerator"); // hypothetical module for generating planets

router.get("/", (req, res) => {
  db.get("SELECT rap FROM user WHERE name = ?", ["player"], (err, row) => {
    if (err) {
      return console.error(err.message);
    }

    db.all(
      `
      SELECT 
        planets.*, 
        planet_resources.resource_name, 
        planet_resources.resource_image_url, 
        planet_events.event 
      FROM 
        planets 
      LEFT JOIN 
        planet_resources ON planets.id = planet_resources.planet_id
      LEFT JOIN 
        planet_events ON planets.id = planet_events.planet_id
    `,
      [],
      (err, rows) => {
        if (err) {
          return console.error(err.message);
        }

        // BEGIN - New block of code replacing the original processing.
        let planets = [];

        rows.forEach((row) => {
          // Find the planet in the planets array
          let planet = planets.find((planet) => planet.id === row.id);

          // If the planet does not exist, create it
          // If the planet does not exist, create it
          if (!planet) {
            planet = {
              id: row.id,
              name: row.name,
              type: row.type,
              size: row.size,
              temperature: row.temperature,
              gravity: row.gravity,
              age: row.age,
              biome: row.biome,
              species: row.species,
              perfectness: row.perfectness,
              distance: row.distance,
              orbital_period: row.orbital_period,
              resources: [],
              event: row.event,
            };
            planets.push(planet);
          }

          // Add the resource to the planet
          planet.resources.push({
            name: row.resource_name,
            imageURL: row.resource_image_url,
          });
        });
        // END - New block of code.

        res.render("discover", { rap: row.rap, planets: planets });
      }
    );
  });
});

// Discover Planet and add to database
router.post("/", (req, res) => {
  db.get("SELECT rap FROM user WHERE name = ?", ["player"], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if (row.rap < 100) {
      res.redirect("/discover");
    } else {
      const cost = 100; // Cost of discovery in RAP
      db.run(
        "UPDATE user SET rap = rap - ? WHERE name = ? AND rap >= ?",
        [cost, "player", cost],
        function(err) {
          if (err) {
            return console.error(err.message);
          }
          if (this.changes === 0) {
            res.redirect("/discover");
          } else {
            const newPlanet = planetGenerator();

            db.run(
              "INSERT INTO planets (name, type, size, temperature, gravity, perfectness, biome, species, age, distance, orbital_period) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              [
                newPlanet.name,
                newPlanet.type,
                newPlanet.size,
                newPlanet.temperature,
                newPlanet.gravity,
                newPlanet.perfectness,
                newPlanet.biome,
                newPlanet.species,
                newPlanet.age,
                newPlanet.distance,
                newPlanet.orbital_period,
              ],
              function(err) {
                if (err) {
                  return console.error(err.message);
                }

                const planetId = this.lastID;

                // insert all of planet's resources
                newPlanet.resources.forEach((resource) => {
                  db.run(
                    "INSERT INTO planet_resources (planet_id, resource_name, resource_image_url) VALUES (?, ?, ?)",
                    [planetId, resource.name, resource.imageURL],
                    function(err) {
                      if (err) {
                        return console.error(err.message);
                      }
                    }
                  );
                });

                // insert planet's event
                db.run(
                  "INSERT INTO planet_events (planet_id, event) VALUES (?, ?)",
                  [planetId, newPlanet.event],
                  function(err) {
                    if (err) {
                      return console.error(err.message);
                    }

                    res.redirect("/discover");
                  }
                );
              }
            );
          }
        }
      );
    }
  });
});

// DEBUG: Delete Planet
router.post("/deletePlanet", (req, res) => {
  db.run(
    `
    DELETE FROM planets 
    WHERE id = (SELECT MAX(id) FROM planets)
    `,
    [],
    (err) => {
      if (err) {
        return console.error(err.message);
      }

      db.run(
        `
        DELETE FROM planet_resources 
        WHERE planet_id NOT IN (SELECT id FROM planets)
        `,
        [],
        (err) => {
          if (err) {
            return console.error(err.message);
          }

          db.run(
            `
            DELETE FROM planet_events 
            WHERE planet_id NOT IN (SELECT id FROM planets)
            `,
            [],
            (err) => {
              if (err) {
                return console.error(err.message);
              }

              res.redirect("/discover");
            }
          );
        }
      );
    }
  );
});

module.exports = router;
