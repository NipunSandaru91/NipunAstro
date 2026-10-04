import { strict as assert } from "node:assert";
import { dailySkyHandler } from "../../supabase/functions/daily-sky/handler.ts";
import type { DailyInput, DailySky } from "../../lib/daily/sky.ts";
Deno.test("daily sky authenticates before calculation; denial, validation, service failures and success", async () => {
  let calls = 0;
  const calculate = (input: DailyInput): DailySky => {
    calls++;
    return {
      input,
      sunrise: null,
      sunset: null,
      referenceAt: 0,
      sun: 0,
      moon: 0,
      engine: "SWISS_MOSEPH_LAHIRI_DAILY_V1",
    };
  };
  const input = {
    date: "2026-10-04",
    timezone: "Asia/Tokyo",
    latitude: 36,
    longitude: 139,
  };
  const request = (token = "valid", body = JSON.stringify(input)) =>
    new Request("https://test.invalid", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
  const handler = dailySkyHandler(
    async (token) => token === "valid",
    calculate,
  );
  assert.equal(
    (await handler(new Request("https://test.invalid"))).status,
    405,
  );
  assert.equal(
    (await handler(new Request("https://test.invalid", { method: "POST" })))
      .status,
    401,
  );
  assert.equal((await handler(request("invalid"))).status, 401);
  assert.equal(calls, 0);
  assert.equal((await handler(request("valid", "{bad"))).status, 400);
  assert.equal((await handler(request("valid", "{}"))).status, 400);
  const success = await handler(request());
  assert.equal(success.status, 200);
  assert.equal(calls, 1);
  assert.equal(success.headers.get("Cache-Control"), "private, no-store");
  assert.equal(
    (await dailySkyHandler(async () => {
      throw Error("private");
    }, calculate)(request())).status,
    503,
  );
  const failure = await dailySkyHandler(async () => true, () => {
    throw Error("private");
  })(request());
  assert.equal(failure.status, 503);
  assert.equal((await failure.json()).error, "DAILY_SKY_UNAVAILABLE");
});
