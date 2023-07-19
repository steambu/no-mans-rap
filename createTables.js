const db = require("./database.js");

let createUserTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user (
      name TEXT, 
      rap INT
    )
  `;

  return new Promise((resolve, reject) => {
    db.run(query, (err) => {
      if (err) {
        console.log("Error creating user table", err);
        reject(err);
      } else {
        console.log("Successfully created user table");

        // Insert the user data
        db.run(
          "INSERT OR IGNORE INTO user (name, rap) VALUES (?, ?)",
          ["player", 1000],
          (err) => {
            if (err) {
              console.log("Error inserting user data", err);
              reject(err);
            } else {
              console.log("Successfully inserted user data");
              resolve(true);
            }
          }
        );
      }
    });
  });
};

// Create Activities Table
let createActivitiesTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit TEXT NOT NULL,
      rap_earned INTEGER NOT NULL,
      activations INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  return new Promise((resolve, reject) => {
    db.run(query, (err) => {
      if (err) {
        console.log("Error creating activities table", err);
        reject(err);
      } else {
        console.log("Successfully created activities table");
        resolve(true);
      }
    });
  });
};

// Create Planets Table
let createPlanetsTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS planets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      size INTEGER NOT NULL,
      temperature INTEGER NOT NULL,
      gravity REAL NOT NULL,
      discovered_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  return new Promise((resolve, reject) => {
    db.run(query, (err) => {
      if (err) {
        console.log("Error creating planets table", err);
        reject(err);
      } else {
        console.log("Successfully created planets table");
        resolve(true);
      }
    });
  });
};

module.exports = function() {
  return createUserTable()
    .then(createActivitiesTable)
    .then(createPlanetsTable)
    .catch(console.error);
};
