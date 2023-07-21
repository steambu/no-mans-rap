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
app.get("/", (req, res) => {
  res.render("index", { rap: res.locals.rap });
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
