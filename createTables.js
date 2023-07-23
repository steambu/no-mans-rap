const { db } = require("./database.js");

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
        console.log("Successfully created User table");

        // Insert the user data
        db.run(
          "INSERT OR IGNORE INTO user (name, rap) VALUES (?, ?)",
          ["player", 1000],
          (err) => {
            if (err) {
              console.log("Error inserting user data", err);
              reject(err);
            } else {
              console.log("Successfully inserted User Data");
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
        console.log("Successfully created Activities table");
        resolve(true);
      }
    });
  });
};

let createPlanetsTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS planets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      size INTEGER NOT NULL,
      temperature REAL NOT NULL,
      gravity REAL NOT NULL,
      perfectness REAL NOT NULL,
      biome TEXT NOT NULL,
      species TEXT NOT NULL,
      age REAL NOT NULL,
      distance REAL NOT NULL,
      orbital_period INTEGER NOT NULL DEFAULT 0,
      discovered_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  return new Promise((resolve, reject) => {
    db.run(query, (err) => {
      if (err) {
        console.log("Error creating planets table", err);
        reject(err);
      } else {
        console.log("Successfully created Planets table");
        resolve(true);
      }
    });
  });
};

let createPlanetResourcesTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS planet_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      planet_id INTEGER,
      resource_name TEXT NOT NULL,
      resource_perfectness INTEGER,
      resource_image_url TEXT NOT NULL,
      FOREIGN KEY (planet_id) REFERENCES planets (id)
    )
  `;

  return new Promise((resolve, reject) => {
    db.run(query, (err) => {
      if (err) {
        console.log("Error creating planet_resources table", err);
        reject(err);
      } else {
        console.log("Successfully created planet_resources table");
        resolve(true);
      }
    });
  });
};

let createPlanetEventsTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS planet_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      planet_id INTEGER,
      event TEXT NOT NULL,
      FOREIGN KEY (planet_id) REFERENCES planets (id)
    )
  `;

  return new Promise((resolve, reject) => {
    db.run(query, (err) => {
      if (err) {
        console.log("Error creating planets table", err);
        reject(err);
      } else {
        console.log("Successfully created Planet Events table");
        resolve(true);
      }
    });
  });
};

module.exports = function() {
  return createUserTable()
    .then(createActivitiesTable)
    .then(createPlanetsTable)
    .then(createPlanetResourcesTable)
    .then(createPlanetEventsTable)
    .catch(console.error);
};
