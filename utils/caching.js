const { db } = require("./db");
const { gw2api } = require("./api");
const logger = require("./logger");

const promises = [];
const endpoints = [
  "items",
  "achievements",
  "itemstats",
  "titles",
  "recipes",
  "skins",
  "currencies",
  "skills",
  "specializations",
  "traits",
  "worlds",
  "minis",
  // "pvpAmulets",
];

// async function run() {
//   await Promise.all([
//     saveThing("items"),
//     saveThing("achievements"),
//     saveThing("titles"),
//     // ...
//   ]);
// }
//
// async function saveThing(thing) {
//   const things = await gw2api[thing]().all();
//   await db.collection("gw2." + thing).insertMany(things);
// }

endpoints.forEach(function pushToPromises(endpoint) {
  promises.push(saveToDbFromApi(endpoint));
});

async function saveToDbFromApi(endpoint) {
  const response = await gw2api[endpoint]().all().catch((error) => {
    logger.error(`Error getting all ${endpoint} from API`, error);
    return false;
  });

  if (!response) return;

  await db.collection(`gw2.${endpoint}`).insertMany(response);
}

async function buildDbFromApi() {
  await Promise.all(promises);
  logger.info("Successfully cached API to DB");
}

async function savePvpAmulets() {
  const pvpAmulets = await gw2api.pvp().amulets().all().catch((error) => {
    logger.error("Error getting all pvpAmulets from API", error);
  });

  await db.collection("gw2.pvpAmulets").insertMany(pvpAmulets);
}

module.exports = {
  buildDbFromApi,
};
