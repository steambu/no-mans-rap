// Imports
const sqlite3 = require("sqlite3").verbose();

// Connect to the database
let db = new sqlite3.Database("./myDatabase.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the myDatabase database.");
});

// Export database
module.exports = db;
