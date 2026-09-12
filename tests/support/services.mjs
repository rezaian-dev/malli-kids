import http from "node:http";
import { randomBytes } from "node:crypto";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";

/** Isolated fixtures only: never load .env or call the real SMS provider. */
export async function startTestServices() {
  const mongo = await MongoMemoryServer.create({
    binary: { version: "7.0.24" },
    instance: { ip: "127.0.0.1", dbName: "malli_auth_test" },
  });
  const client = await new MongoClient(mongo.getUri()).connect();
  const secret = randomBytes(24).toString("hex");
  const messages = [];
  const failures = new Set();
  const relay = http.createServer(async (request, response) => {
    response.setHeader("Content-Type", "application/json");
    if (request.headers["x-relay-secret"] !== secret) {
      response.writeHead(401).end(JSON.stringify({ ok: false }));
      return;
    }
    if (request.url === "/messages") {
      response.end(JSON.stringify(messages));
      return;
    }
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString() || "{}");
    if (request.url === "/fail") {
      failures.add(body.phone);
      response.end(JSON.stringify({ ok: true }));
      return;
    }
    if (request.url !== "/sms" || request.method !== "POST") {
      response.writeHead(404).end("{}");
      return;
    }
    if (failures.has(body.phone)) {
      response.end(JSON.stringify({ ok: false }));
      return;
    }
    messages.push({ ...body, at: Date.now() });
    response.end(JSON.stringify({ ok: true }));
  });
  await new Promise((resolve) => relay.listen(0, "127.0.0.1", resolve));
  const relayURL = `http://127.0.0.1:${relay.address().port}`;
  return {
    client,
    db: client.db(),
    messages,
    env: {
      MONGODB_URI: mongo.getUri(),
      BETTER_AUTH_SECRET: randomBytes(48).toString("hex"),
      SMS_RELAY_URL: `${relayURL}/sms`,
      SMS_RELAY_SECRET: secret,
      SMS_API_KEY: "",
      SMS_FROM_NUMBER: "",
      SMS_PATTERN_CODE: "",
      UPSTASH_REDIS_REST_URL: "",
      UPSTASH_REDIS_REST_TOKEN: "",
    },
    async close() {
      await new Promise((resolve) => relay.close(resolve));
      await client.close();
      await mongo.stop();
    },
  };
}
