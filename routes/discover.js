// Imports
const express = require("express");
const router = express.Router();
const db = require("../database.js");
const fs = require("fs");
const path = require("path");

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

        res.render("discover", { rap: row.rap, planets: planets });
      }
    );
  });
});

// Import JSON Files for Planet Generation
const planetTypes = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../planetData/planetTypes.json"))
);
const resources = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../planetData/planetResources.json"))
);
const events = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../planetData/planetEvents.json"))
);

// PLANET GENERATION
const gaussian = require("gaussian"); // You will need to install this package

// Function to generate a new planet
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Create a normal distribution with mean 0 and variance 50
const distribution = gaussian(0, 2500); // 2500 is the square of the standard deviation

function getRandomNormalDistTemp(min, max) {
  let result;
  do {
    result = distribution.ppf(Math.random()); // percent point function (inverse of cdf)
  } while (result < min || result > max);
  return parseFloat(result.toFixed(2));
}

function generatePlanet() {
  const name = `Planet-${Math.floor(Math.random() * 10000)}`;
  const type = getRandomElement(planetTypes);
  const size = getRandomElement([1000, 2000, 3000, 4000]);
  const temperature = getRandomNormalDistTemp(-200, 200); // Use the new function for temperature
  const gravity = getRandomElement([0.5, 1, 1.5, 2]);
  const resource = getRandomElement(resources);
  const event = getRandomElement(events);
  const perfectness =
    type.perfectness + resource.perfectness + event.perfectness;

  return {
    name,
    type: type.name,
    size,
    temperature,
    gravity,
    resource: resource.name,
    event: event.name,
    perfectness,
  };
}

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
            const newPlanet = generatePlanet();
            db.run(
              "INSERT INTO planets (name, type, size, temperature, gravity, perfectness) VALUES (?, ?, ?, ?, ?, ?)",
              [
                newPlanet.name,
                newPlanet.type,
                newPlanet.size,
                newPlanet.temperature,
                newPlanet.gravity,
                newPlanet.perfectness,
              ],
              function(err) {
                if (err) {
                  return console.error(err.message);
                }

                const planetId = this.lastID;

                // insert planet's resource
                db.run(
                  "INSERT INTO planet_resources (planet_id, resource) VALUES (?, ?)",
                  [planetId, newPlanet.resource],
                  function(err) {
                    if (err) {
                      return console.error(err.message);
                    }

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
