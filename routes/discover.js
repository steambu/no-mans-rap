const express = require("express");
const router = express.Router();

const db = require("../database");

// PLANET MODULE
// Planet page
router.get("/", (req, res) => {
  db.all("SELECT * FROM planets", (err, planets) => {
    if (err) {
      return console.error(err.message);
    }
    db.get("SELECT rap FROM user WHERE name = ?", ["player"], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("discover", { rap: row.rap, planets: planets });
    });
  });
});

// Function to generate a new planet
function generatePlanet() {
  const planetTypes = ["gas giant", "rocky", "ice giant", "dwarf"];
  const planetSizes = [1000, 2000, 3000, 4000]; // in kilometers
  const planetTemperatures = [-200, -100, 0, 100, 200]; // in celsius
  const planetGravities = [0.5, 1, 1.5, 2]; // relative to earth gravity

  const name = `Planet-${Math.floor(Math.random() * 10000)}`; // Just a random name for now, feel free to use a better generator
  const type = planetTypes[Math.floor(Math.random() * planetTypes.length)];
  const size = planetSizes[Math.floor(Math.random() * planetSizes.length)];
  const temperature =
    planetTemperatures[Math.floor(Math.random() * planetTemperatures.length)];
  const gravity =
    planetGravities[Math.floor(Math.random() * planetGravities.length)];

  return { name, type, size, temperature, gravity };
}

// Discover planet
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
              "INSERT INTO planets (name, type, size, temperature, gravity) VALUES (?, ?, ?, ?, ?)",
              [
                newPlanet.name,
                newPlanet.type,
                newPlanet.size,
                newPlanet.temperature,
                newPlanet.gravity,
              ],
              (err) => {
                if (err) {
                  return console.error(err.message);
                }
                res.redirect("/discover");
              }
            );
          }
        }
      );
    }
  });
});

module.exports = router;
