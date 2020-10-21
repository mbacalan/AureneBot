const apiClient = require("gw2api-client");
const redis = require("redis");
const cacheRedis = require("gw2api-client/src/cache/redis.js");

const redisClient = redis.createClient(process.env.REDIS_URL);
const gw2api = apiClient();

gw2api.cacheStorage(
  cacheRedis({
    redis: redisClient,
  })
);

async function getLeadingGuilds(account) {
  const guilds = await Promise.all(
    account.guild_leader.map(async (guild) => {
      return await gw2api.guild().get(guild)
        .then(result => `${result.name} [${result.tag}]`);
    })
  );

  return guilds.join("\n");
}

module.exports = {
  gw2api,
  getLeadingGuilds,
  redisClient,
};
