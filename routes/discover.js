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
        planet_resources.resource, 
        planet_events.event 
      FROM 
        planets 
      LEFT JOIN 
        planet_resources ON planets.id = planet_resources.planet_id
      LEFT JOIN 
        planet_events ON planets.id = planet_events.planet_id
    `,
      [],
      (err, planets) => {
        if (err) {
          return console.error(err.message);
        }

        planets.forEach((planet) => {
          console.log("Before parsing: ", planet.resource);
          planet.resource = JSON.parse(planet.resource);
        });

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
            console.log(newPlanet);

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

                // insert planet's resource
                db.run(
                  "INSERT INTO planet_resources (planet_id, resource) VALUES (?, ?)",
                  [planetId, JSON.stringify(newPlanet.resource)], // Convert the resource object to a JSON string before inserting
                  function(err) {
                    if (err) {
                      return console.error(err.message);
                    }

                    // insert planet's event
                    console.log("Before insertion: ", newPlanet.resource);

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
