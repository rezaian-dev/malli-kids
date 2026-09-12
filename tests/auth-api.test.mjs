import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomInt } from "node:crypto";
import { MongoClient } from "mongodb";

const env = JSON.parse(await readFile(process.env.TEST_ENV_FILE, "utf8"));
const base = env.BETTER_AUTH_URL;
assert.equal(
  new URL(base).hostname,
  "127.0.0.1",
  "Tests must never target a deployed site",
);
assert.match(env.MONGODB_URI, /^mongodb:\/\/127\.0\.0\.1:/);
assert.equal(new URL(env.SMS_RELAY_URL).hostname, "127.0.0.1");
const mongo = await new MongoClient(env.MONGODB_URI).connect();
const db = mongo.db();
after(() => mongo.close());
const prefix = String(randomInt(10000, 99999));
let sequence = 0;
const number = () => `0909${prefix}${String(++sequence).padStart(2, "0")}`;
const password = "Regression8!Secure";
const revisedPassword = "Changed9!Secure";
const name = "کاربر آزمایشی";
const asFa = (v) => v.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

async function api(path, body, cookie = "") {
  const response = await fetch(`${base}/api/auth${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      Origin: base,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(120_000),
  });
  const json = await response.json();
  return {
    status: response.status,
    json,
    cookie: response.headers
      .getSetCookie()
      .map((v) => v.split(";")[0])
      .join("; "),
  };
}
async function messages() {
  return (
    await fetch(env.SMS_RELAY_URL.replace(/\/sms$/, "/messages"), {
      headers: { "x-relay-secret": env.SMS_RELAY_SECRET },
    })
  ).json();
}
async function codeFor(phone) {
  return (await messages()).filter((item) => item.phone === phone).at(-1)?.code;
}
async function issue(phone) {
  const result = await api("/phone-number/send-otp", { phoneNumber: phone });
  assert.equal(result.status, 200, JSON.stringify(result.json));
  return codeFor(phone);
}
async function register(phone = number()) {
  const code = await issue(phone);
  const email = `qa-${phone}@example.test`;
  const result = await api("/sign-up/email", {
    name,
    email,
    password,
    phoneNumber: phone,
    code,
  });
  assert.equal(result.status, 200, JSON.stringify(result.json));
  return { phone, email, ...result };
}

test("direct signup cannot omit or fake mobile ownership", async () => {
  const email = `missing-${prefix}@example.test`;
  let result = await api("/sign-up/email", { name, email, password });
  assert.equal(result.status, 400);
  result = await api("/sign-up/email", {
    name,
    email,
    password,
    phoneNumber: "abc",
    code: "12345",
    phoneNumberVerified: true,
  });
  assert.equal(result.status, 400);
  result = await api("/sign-up/email", {
    name,
    email,
    password,
    phoneNumber: number(),
    phoneNumberVerified: true,
  });
  assert.equal(result.status, 400);
  assert.equal(await db.collection("user").findOne({ email }), null);
});

test("Iranian/Persian phone and OTP normalize; verified phone is persisted, secrets are not", async () => {
  const phone = number();
  const input = asFa(`+98 ${phone.slice(1, 4)} ${phone.slice(4)}`);
  const sent = await api("/phone-number/send-otp", { phoneNumber: input });
  assert.equal(sent.status, 200, JSON.stringify(sent.json));
  const code = await codeFor(phone);
  assert.match(code, /^\d{5}$/);
  const email = `NORMALIZED-${prefix}@example.test`;
  const result = await api("/sign-up/email", {
    name,
    email,
    password,
    phoneNumber: input,
    code: asFa(code),
  });
  assert.equal(result.status, 200, JSON.stringify(result.json));
  assert.equal(result.json.user.phoneNumber, phone);
  assert.equal(result.json.user.phoneNumberVerified, true);
  const user = await db
    .collection("user")
    .findOne({ email: email.toLowerCase() });
  assert.equal(user.phoneNumber, phone);
  assert.equal(user.phoneNumberVerified, true);
  assert.equal(user.password, undefined);
  assert.equal(user.code, undefined);
  assert.ok(result.cookie);
});

test("SMS reset changes password, revokes sessions, rejects weak passwords and code replay", async () => {
  const account = await register();
  const request = await api("/phone-number/request-password-reset", {
    phoneNumber: account.phone,
  });
  assert.equal(request.status, 200);
  const code = await codeFor(account.phone);
  assert.match(code, /^\d{5}$/);
  assert.notEqual(code, password);
  const weak = await api("/phone-number/reset-password", {
    phoneNumber: account.phone,
    otp: code,
    newPassword: "weak",
  });
  assert.equal(weak.status, 400);
  const reset = await api("/phone-number/reset-password", {
    phoneNumber: account.phone,
    otp: asFa(code),
    newPassword: revisedPassword,
  });
  assert.equal(reset.status, 200, JSON.stringify(reset.json));
  const old = await api("/sign-in/email", { email: account.email, password });
  assert.equal(old.status, 401);
  const updated = await api("/sign-in/email", {
    email: account.email,
    password: revisedPassword,
  });
  assert.equal(updated.status, 200);
  const session = await api(
    "/get-session?disableCookieCache=true",
    null,
    account.cookie,
  );
  assert.equal(session.json, null);
  const replay = await api("/phone-number/reset-password", {
    phoneNumber: account.phone,
    otp: code,
    newPassword: password,
  });
  assert.notEqual(replay.status, 200);
});

test("unknown/contact-only numbers get generic acknowledgement without an SMS", async () => {
  const phone = number();
  const before = (await messages()).length;
  await db
    .collection("profiles")
    .insertOne({ userId: "legacy-contact-only", phone });
  const result = await api("/phone-number/request-password-reset", {
    phoneNumber: phone,
  });
  assert.equal(result.status, 200);
  assert.deepEqual(result.json, { status: true });
  assert.equal((await messages()).length, before);
});

test("server cooldown protects both OTP and reset public routes", async () => {
  const account = await register();
  const again = await api("/phone-number/send-otp", {
    phoneNumber: account.phone,
  });
  assert.equal(again.status, 429);
  await api("/phone-number/request-password-reset", {
    phoneNumber: account.phone,
  });
  const resetAgain = await api("/phone-number/request-password-reset", {
    phoneNumber: account.phone,
  });
  assert.equal(resetAgain.status, 429);
});

test("wrong code, expiry and attempt exhaustion cannot create a session", async () => {
  const phone = number();
  const code = await issue(phone);
  const wrong = code === "00000" ? "11111" : "00000";
  for (let i = 0; i < 5; i++) {
    const result = await api("/phone-number/verify", {
      phoneNumber: phone,
      code: wrong,
    });
    assert.notEqual(result.status, 200);
    assert.equal(result.cookie, "");
  }
  const exhausted = await api("/phone-number/verify", {
    phoneNumber: phone,
    code,
  });
  assert.notEqual(exhausted.status, 200);
  const expiredPhone = number();
  const expiredCode = await issue(expiredPhone);
  await db
    .collection("verification")
    .updateMany(
      { identifier: expiredPhone },
      { $set: { expiresAt: new Date(Date.now() - 60_000) } },
    );
  const expired = await api("/phone-number/verify", {
    phoneNumber: expiredPhone,
    code: expiredCode,
  });
  assert.notEqual(expired.status, 200);
});

test("a code cannot reset another number or cross from login to password reset", async () => {
  const account = await register();
  const otherPhone = number();
  const loginCode = await issue(otherPhone);
  for (const phoneNumber of [account.phone, otherPhone]) {
    const result = await api("/phone-number/reset-password", {
      phoneNumber,
      otp: loginCode,
      newPassword: revisedPassword,
    });
    assert.notEqual(result.status, 200);
  }
});

test("duplicate phone and concurrent OTP consumption cannot create two accounts", async () => {
  const phone = number();
  const code = await issue(phone);
  const results = await Promise.all(
    [1, 2].map((n) =>
      api("/sign-up/email", {
        name,
        password,
        email: `race-${phone}-${n}@example.test`,
        phoneNumber: phone,
        code,
      }),
    ),
  );
  assert.equal(results.filter((r) => r.status === 200).length, 1);
  assert.equal(
    await db.collection("user").countDocuments({ phoneNumber: phone }),
    1,
  );
  const duplicate = await api("/sign-up/email", {
    name,
    password,
    email: `duplicate-${phone}@example.test`,
    phoneNumber: phone,
    code,
  });
  assert.equal(duplicate.status, 400);
});

test("legacy users can link a number only with its OTP; plain update cannot unlink recovery", async () => {
  const account = await register();
  const user = await db.collection("user").findOne({ email: account.email });
  await db
    .collection("user")
    .updateOne(
      { _id: user._id },
      { $unset: { phoneNumber: "", phoneNumberVerified: "" } },
    );
  const login = await api("/sign-in/email", { email: account.email, password });
  assert.equal(login.status, 200);
  const phone = number();
  const code = await issue(phone);
  const linked = await api(
    "/phone-number/verify",
    { phoneNumber: phone, code, updatePhoneNumber: true, disableSession: true },
    login.cookie,
  );
  assert.equal(linked.status, 200, JSON.stringify(linked.json));
  assert.equal(linked.json.user.id, account.json.user.id);
  assert.equal(linked.json.user.phoneNumberVerified, true);
  const bypass = await api("/update-user", { phoneNumber: null }, login.cookie);
  assert.equal(bypass.status, 400);
  const stored = await db.collection("user").findOne({ _id: user._id });
  assert.equal(stored.phoneNumber, phone);
});

test("SMS provider business failure is not reported as delivery success", async () => {
  const phone = number();
  await fetch(env.SMS_RELAY_URL.replace(/\/sms$/, "/fail"), {
    method: "POST",
    headers: {
      "x-relay-secret": env.SMS_RELAY_SECRET,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone }),
  });
  const result = await api("/phone-number/send-otp", { phoneNumber: phone });
  assert.equal(result.status, 502, JSON.stringify(result.json));
  assert.equal(result.json.code, "SMS_DELIVERY_FAILED");
});

test("server actions enforce required mobile, password confirmation and authenticated phone changes", async () => {
  async function action(name, values) {
    return (
      await fetch(`${base}/__actions/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
    ).json();
  }
  const missing = await action("requestSignUpOtpAction", {
    name,
    email: `action-${prefix}@example.test`,
    password,
    phone: "",
  });
  assert.equal(missing.ok, false);
  assert.equal(missing.field, "phone");
  const account = await register();
  await api("/phone-number/request-password-reset", {
    phoneNumber: account.phone,
  });
  const code = await codeFor(account.phone);
  const mismatch = await action("resetPasswordAction", {
    phone: account.phone,
    code,
    password: revisedPassword,
    confirmPassword: password,
  });
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.field, "confirmPassword");
  const reset = await action("resetPasswordAction", {
    phone: account.phone,
    code,
    password: revisedPassword,
    confirmPassword: revisedPassword,
  });
  assert.equal(reset.ok, true);
  const unauthenticated = await action("requestRecoveryPhoneAction", {
    phone: number(),
  });
  assert.equal(unauthenticated.ok, false);
});
