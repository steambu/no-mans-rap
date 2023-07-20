// Imports
const fs = require("fs");
const path = require("path");
const gaussian = require("gaussian");

// Import JSON Files for Planet Generation
let planetTypes;
try {
  const filePath = path.resolve(__dirname, "../planetData/planetTypes.json");
  const fileContent = fs.readFileSync(filePath, "utf8");
  planetTypes = JSON.parse(fileContent);
} catch (err) {
  console.error("Failed to read or parse planetTypes.json", err.message);
  console.error(
    "The error occurred while reading or parsing this content:",
    fileContent
  );
  throw err;
}

const resources = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../planetData/planetResources.json"))
);
const events = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../planetData/planetEvents.json"))
);

// PLANET GENERATION

// Function to generate a new planet
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Function to get a temperature for a planet type based on normal distribution within its temperature range
function getTemperatureForPlanetType(type) {
  const minTemperature = type.temperatureRange.min;
  const maxTemperature = type.temperatureRange.max;
  const meanTemperature = (minTemperature + maxTemperature) / 2;

  // Create a normal distribution with mean as meanTemperature and variance such that 99.7% of samples will fall within the temperature range (3 standard deviations = range)
  const variance = Math.pow((maxTemperature - minTemperature) / 6, 2);
  const distribution = gaussian(meanTemperature, variance);

  let temperature;
  do {
    temperature = distribution.ppf(Math.random());
  } while (temperature < minTemperature || temperature > maxTemperature);

  return parseFloat(temperature.toFixed(2));
}

// Function to generate a new planet
function generatePlanet() {
  const name = `Planet-${Math.floor(Math.random() * 10000)}`;
  const type = getRandomElement(planetTypes);
  const size = getRandomElement([1000, 2000, 3000, 4000]);
  const temperature = getTemperatureForPlanetType(type); // Use the new function for temperature
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

// Export the function
module.exports = generatePlanet;
