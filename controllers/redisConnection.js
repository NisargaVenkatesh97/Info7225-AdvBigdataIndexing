let { createClient } = require("redis");
let client = "";

const redisConnection = async () => {
    client = createClient();
    client.on("error", (err) => console.log("Redis Client Error", err));
    await client.connect();
    return client;
  };

module.exports = { redisConnection }