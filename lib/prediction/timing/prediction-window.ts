export type PredictionWindowType =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY";

export type PredictionWindowSample = {
  local_date: string;
  local_time: string;
  key: string;
};

export type PredictionWindowPlan = {
  type: PredictionWindowType;
  anchor_date: string;
  start_date: string;
  end_date: string;
  label: string;
  samples: PredictionWindowSample[];
  transit_graha_ids: readonly number[];
  query_utc_start: string;
  query_utc_end: string;
};

const ALL_GRAHAS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const MONTHLY_GRAHAS = [1, 3, 4, 5, 6, 7, 8, 9] as const;
const YEARLY_GRAHAS = [5, 7, 8, 9] as const;

function dateParts(date: string) {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error("INVALID_ANCHOR_DATE");
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new Error("INVALID_ANCHOR_DATE");
  }
  return { year, month, day };
}

function isoDate(year: number, month: number, day: number) {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function addDays(date: string, days: number) {
  const { year, month, day } = dateParts(date);
  const value = new Date(Date.UTC(year, month - 1, day + days));
  return isoDate(
    value.getUTCFullYear(),
    value.getUTCMonth() + 1,
    value.getUTCDate(),
  );
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function sample(local_date: string, local_time: string): PredictionWindowSample {
  return {
    local_date,
    local_time,
    key: local_date + "T" + local_time,
  };
}

function broadUtcBounds(startDate: string, endDate: string) {
  const start = dateParts(startDate);
  const end = dateParts(endDate);
  const startMs = Date.UTC(start.year, start.month - 1, start.day) - 2 * 86400000;
  const endMs =
    Date.UTC(end.year, end.month - 1, end.day + 1) + 2 * 86400000;
  return {
    query_utc_start: new Date(startMs).toISOString(),
    query_utc_end: new Date(endMs).toISOString(),
  };
}

export function parsePredictionWindowType(
  value: string | null | undefined,
): PredictionWindowType {
  return value === "WEEKLY" || value === "MONTHLY" || value === "YEARLY"
    ? value
    : "DAILY";
}

export function buildPredictionWindowPlan(
  type: PredictionWindowType,
  anchorDate: string,
): PredictionWindowPlan {
  const { year, month } = dateParts(anchorDate);

  let startDate = anchorDate;
  let endDate = anchorDate;
  let samples: PredictionWindowSample[] = [];
  let transitGrahaIds: readonly number[] = ALL_GRAHAS;
  let label = anchorDate;

  if (type === "DAILY") {
    samples = ["06:00", "12:00", "18:00", "23:00"].map((time) =>
      sample(anchorDate, time),
    );
    label = anchorDate;
  } else if (type === "WEEKLY") {
    endDate = addDays(anchorDate, 6);
    samples = Array.from({ length: 7 }, (_, index) =>
      sample(addDays(anchorDate, index), "12:00"),
    );
    label = startDate + " → " + endDate;
  } else if (type === "MONTHLY") {
    startDate = isoDate(year, month, 1);
    const lastDay = daysInMonth(year, month);
    endDate = isoDate(year, month, lastDay);
    for (let day = 1; day <= lastDay; day += 2) {
      samples.push(sample(isoDate(year, month, day), "12:00"));
    }
    if (samples[samples.length - 1]?.local_date !== endDate) {
      samples.push(sample(endDate, "12:00"));
    }
    transitGrahaIds = MONTHLY_GRAHAS;
    label = String(year) + "-" + String(month).padStart(2, "0");
  } else {
    startDate = isoDate(year, 1, 1);
    endDate = isoDate(year, 12, 31);
    samples = Array.from({ length: 12 }, (_, index) =>
      sample(isoDate(year, index + 1, 15), "12:00"),
    );
    transitGrahaIds = YEARLY_GRAHAS;
    label = String(year);
  }

  return {
    type,
    anchor_date: anchorDate,
    start_date: startDate,
    end_date: endDate,
    label,
    samples,
    transit_graha_ids: transitGrahaIds,
    ...broadUtcBounds(startDate, endDate),
  };
}

export function utcTimestampToLocalSampleKey(
  timestamp: string,
  timezone: string,
) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return (
    values.year +
    "-" +
    values.month +
    "-" +
    values.day +
    "T" +
    values.hour +
    ":" +
    values.minute
  );
}

export function localDateInTimezone(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return values.year + "-" + values.month + "-" + values.day;
}
