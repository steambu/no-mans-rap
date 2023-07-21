// Imports
const sqlite3 = require("sqlite3").verbose();

// Connect to the database
let db = new sqlite3.Database("./myDatabase.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the myDatabase database.");
});

// Function to get the RAP score of a user
let getRapScore = (name) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT rap FROM user WHERE name = ?", [name], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.rap : null);
      }
    });
  });
};

// Export database and getRapScore function
module.exports = { db, getRapScore };
