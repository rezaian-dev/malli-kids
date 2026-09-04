const { MongoMemoryServer } = require("mongodb-memory-server");

(async () => {
  const mongod = await MongoMemoryServer.create({
    instance: { dbName: "malli-kids", port: 27017, ip: "127.0.0.1" },
  });
  const uri = mongod.getUri();
  console.log("MONGO_READY " + uri);
  // Keep process alive
  process.stdin.resume();
  process.on("SIGTERM", async () => {
    await mongod.stop();
    process.exit(0);
  });
})().catch((err) => {
  console.error("MONGO_FAILED", err);
  process.exit(1);
});
