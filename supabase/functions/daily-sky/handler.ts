import {
  type DailyInput,
  type DailySky,
  validateDailyInput,
} from "../../../lib/daily/sky.ts";

export function dailySkyHandler(
  authenticate: (token: string) => Promise<boolean>,
  calculate: (input: DailyInput) => DailySky,
) {
  return async (req: Request) => {
    if (req.method !== "POST") {
      return Response.json({ error: "POST_REQUIRED" }, { status: 405 });
    }
    const token = req.headers.get("Authorization")?.match(/^Bearer (.+)$/)?.[1];
    if (!token) {
      return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    }
    try {
      if (!await authenticate(token)) {
        return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 });
      }
    } catch {
      return Response.json({ error: "AUTH_UNAVAILABLE" }, { status: 503 });
    }
    let input;
    try {
      input = validateDailyInput(await req.json());
    } catch {
      return Response.json({ error: "INVALID_DAILY_INPUT" }, { status: 400 });
    }
    try {
      return Response.json(calculate(input), {
        headers: { "Cache-Control": "private, no-store" },
      });
    } catch {
      return Response.json({ error: "DAILY_SKY_UNAVAILABLE" }, { status: 503 });
    }
  };
}
