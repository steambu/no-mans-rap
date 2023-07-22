// Imports
const fs = require("fs");
const path = require("path");
const gaussian = require("gaussian");

// Import JSON Files for Planet Generation
let planetTypes, prefixes, suffixes, biomes, species;
try {
  let filePath = path.resolve(__dirname, "../planetData/planetTypes.json");
  let fileContent = fs.readFileSync(filePath, "utf8");
  planetTypes = JSON.parse(fileContent);

  filePath = path.resolve(__dirname, "../planetData/planetNamePrefixes.json");
  fileContent = fs.readFileSync(filePath, "utf8");
  prefixes = JSON.parse(fileContent);

  filePath = path.resolve(__dirname, "../planetData/planetNameSuffixes.json");
  fileContent = fs.readFileSync(filePath, "utf8");
  suffixes = JSON.parse(fileContent);

  filePath = path.resolve(__dirname, "../planetData/planetBiomes.json");
  fileContent = fs.readFileSync(filePath, "utf8");
  biomes = JSON.parse(fileContent);

  filePath = path.resolve(__dirname, "../planetData/planetSpecies.json");
  fileContent = fs.readFileSync(filePath, "utf8");
  species = JSON.parse(fileContent);
} catch (err) {
  console.error("Failed to read or parse json files", err.message);
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

// Helper function to generate a random number within a given range
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to convert a number to a Roman numeral
function convertToRomanNumeral(num) {
  const romanNumerals = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };

  let roman = "";

  for (let key in romanNumerals) {
    while (num >= romanNumerals[key]) {
      roman += key;
      num -= romanNumerals[key];
    }
  }

  return roman;
}

// Function to generate a random name for a planet
function generatePlanetName() {
  // Start with a base name
  let planetName = getRandomElement(prefixes) + getRandomElement(suffixes);

  // Determine a random 'flavor' to add to the name
  let flavor = getRandomNumber(1, 4);

  switch (flavor) {
    case 1:
      // Add a number suffix
      planetName += " " + getRandomNumber(1, 9999);
      break;
    case 2:
      // Add a Roman numeral suffix
      planetName += " " + convertToRomanNumeral(getRandomNumber(1, 50));
      break;
    case 3:
      // Add a middle name
      let prefixMiddle =
        getRandomElement(prefixes).charAt(0) +
        getRandomElement(prefixes)
          .slice(1)
          .toLowerCase();
      let suffixMiddle =
        getRandomElement(suffixes).charAt(0) +
        getRandomElement(suffixes)
          .slice(1)
          .toLowerCase();

      planetName =
        planetName.charAt(0).toUpperCase() +
        planetName.slice(1, planetName.length / 2).toLowerCase() +
        " " +
        prefixMiddle +
        suffixMiddle +
        " " +
        planetName
          .slice(planetName.length / 2)
          .charAt(0)
          .toUpperCase() +
        planetName.slice(planetName.length / 2 + 1).toLowerCase();
      break;

    case 4:
      // Add a number prefix
      planetName = getRandomNumber(1, 9999) + " " + planetName;
      break;
  }

  return planetName;
}

// Function to get a random biome for a planet
function getRandomBiome() {
  return getRandomElement(biomes);
}

// Function to get a random species for a planet
function getRandomSpecies() {
  return getRandomElement(species);
}

// Function to get a random age for a planet in billions of years
function getRandomAge() {
  return parseFloat((Math.random() * 10).toFixed(2));
}

function getRandomDistance() {
  // The distance from the Earth to the Sun is 1 AU
  // Multiply it by 3 for a more realistic distance
  const maxDistanceInAU = 1 * 3;
  return parseFloat((Math.random() * maxDistanceInAU).toFixed(2));
}

// Function to get a random orbital period in Earth years
function calculateOrbitalPeriod(distanceInAU) {
  // Using Kepler's third law
  const orbitalPeriod = Math.sqrt(Math.pow(distanceInAU, 3));
  return parseFloat(orbitalPeriod.toFixed(2));
}

// Function to generate a new planet
function generatePlanet() {
  const name = generatePlanetName();
  const type = getRandomElement(planetTypes);
  const size = getRandomElement([1000, 2000, 3000, 4000]);
  const temperature = getTemperatureForPlanetType(type); // Use the new function for temperature
  const gravity = getRandomElement([0.5, 1, 1.5, 2]);
  const resource = getRandomElement(resources);
  const event = getRandomElement(events);
  const perfectness =
    type.perfectness + resource.perfectness + event.perfectness;

  // New features
  const biome = getRandomBiome();
  const species = getRandomSpecies();
  const age = getRandomAge();
  const distance = getRandomDistance();
  const orbital_period = calculateOrbitalPeriod(distance);

  return {
    name,
    type: type.name,
    size,
    temperature,
    gravity,
    resource: {
      name: resource.name,
      imageURL: resource.imageURL,
    },
    event: event.name,
    perfectness,
    // New features
    biome,
    species,
    age,
    distance: distance + " AU",
    orbital_period,
  };
}

// Export the function
module.exports = generatePlanet;
