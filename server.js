// Import libraries
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Import routes
const activitiesRoutes = require("./routes/activities");
const discoverRoutes = require("./routes/discover");
const logRoutes = require("./routes/log"); // Add this line

// Use routes
app.use("/activities", activitiesRoutes);
app.use("/discover", discoverRoutes);
app.use("/log", logRoutes); // Add this line

// HOME PAGE
// Import your database
const { db } = require("./database.js");

// HOME PAGE
app.get("/", (req, res) => {
  db.get("SELECT rap FROM user WHERE name = ?", ["player"], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("index", { rap: row.rap });
  });
});

// Start server
app.listen(3000, () => {
  console.log("Server started on port 3000");

  // Initialize your database after the server starts
  const dbInit = require("./createTables");
  dbInit()
    .then(() => console.log("Database initialized."))
    .catch((err) => console.error("Database initialization failed:", err));
});
