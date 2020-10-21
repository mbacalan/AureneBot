const { Entries, Giveaways, Winners, Keys } = require("../models");
const logger = require("./logger");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/local", ({
  useNewUrlParser: true,
  useUnifiedTopology: true,
}));

const db = mongoose.connection;

db.on("error", () => logger.error("Error connecting to database"));
db.once("open", () => logger.info("Successfully connected to database"));

async function createGiveaway(message, item, duration, endTime) {
  await Giveaways.create({
    userId: message.author.id,
    userName: message.author.username,
    discriminator: message.author.discriminator,
    creationTime: `${message.createdAt}`,
    item: item,
    duration: duration,
    endTime: endTime,
  });

  logger.info(`Created giveaway for ${item}, which will go on for ${duration}.`);
}

async function createEntry(message) {
  await Entries.create({
    userId: message.author.id,
    userName: message.author.username,
    discriminator: message.author.discriminator,
    entryTime: `${message.createdAt}`,
  });
}

async function createWinner(winner, item) {
  await Winners.create({
    userId: winner.userId,
    userName: winner.userName,
    discriminator: winner.discriminator,
    item: item,
  });
}

async function createKey(message, tokenInfo, account, key) {
  await Keys.create({
    discordId: message.author.id,
    keyName: tokenInfo.name ? tokenInfo.name : "",
    accountName: account.name,
    permissions: tokenInfo.permissions,
    key,
  });
}

async function deleteKey(message) {
  const { key } = await Keys.findOne({ discordId: message.author.id });

  if (!key) {
    return message.reply("couldn't find a key you added to delete!");
  }

  try {
    await Keys.deleteOne(key);
    message.reply("your key has been deleted!");
  } catch (error) {
    message.reply("there was an error with removing your key. Please contact my author");
    logger.error("Error while deleting key", error);
  }
}

async function clearGiveawayAndEntries() {
  await Giveaways.collection.deleteMany({});
  await Entries.collection.deleteMany({});
}

module.exports = {
  createGiveaway,
  createEntry,
  createWinner,
  createKey,
  deleteKey,
  clearGiveawayAndEntries,
};
