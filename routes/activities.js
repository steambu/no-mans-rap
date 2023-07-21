const express = require("express");
const router = express.Router();
const { db, getRapScore } = require("../database.js");

// Add activity
router.post("/", (req, res) => {
  const { name, quantity, unit, rap_earned } = req.body;

  const sql = `
    INSERT INTO activities (name, quantity, unit, rap_earned) 
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [name, quantity, unit, rap_earned], function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);
    res.redirect("/activities");
  });
});

// View activities
router.get("/", (req, res) => {
  db.all("SELECT * FROM activities", [], (err, activities) => {
    if (err) {
      console.error(err.message);
    } else {
      // get rap from the database
      db.get("SELECT rap FROM user WHERE name = 'player'", [], (err, user) => {
        if (err) {
          console.error(err.message);
        } else {
          // pass rap to the view
          res.render("activities", {
            activities: activities,
            rap: user ? user.rap : 0,
          });
        }
      });
    }
  });
});

// Activate activity
router.post("/:id/activate", (req, res) => {
  const { id } = req.params;
  let activityRap;

  db.get("SELECT rap_earned FROM activities WHERE id = ?", id, (err, row) => {
    if (err) {
      console.error("Error getting activity RAP:", err.message);
      res.json({ success: false });
      return;
    }

    if (!row) {
      console.error(`No activity found with id: ${id}`);
      res.json({ success: false });
      return;
    }

    activityRap = row.rap_earned;

    console.log(`Updating user RAP by ${activityRap}`);

    db.run(
      "UPDATE user SET rap = rap + ? WHERE name = ?",
      [activityRap, "player"],
      (err) => {
        if (err) {
          console.error("Error updating user RAP:", err.message);
          res.json({ success: false });
        } else {
          console.log(`User RAP updated successfully.`);

          const sql = `
          UPDATE activities 
          SET activations = activations + 1
          WHERE id = ?
        `;

          db.run(sql, id, function(err) {
            if (err) {
              console.error(
                "Error incrementing activity activations:",
                err.message
              );
              res.json({ success: false });
            } else {
              console.log(`Activity activations updated successfully.`);
              res.json({ success: true });
            }
          });
        }
      }
    );
  });
});

// Get current RAP
router.get("/rap", (req, res) => {
  db.get("SELECT rap FROM user WHERE name = 'player'", [], (err, row) => {
    if (err) {
      console.error(err.message);
    } else {
      res.json({ rap: row ? row.rap : 0 }); // send the current RAP as a JSON response
    }
  });
});

// Delete activity
router.post("/:id/delete", (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM activities 
    WHERE id = ?
  `;

  db.run(sql, id, function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/activities");
  });
});

module.exports = router;
