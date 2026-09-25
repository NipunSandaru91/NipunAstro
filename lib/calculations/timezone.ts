export type LocalTimeResolution = {
  iso: string;
  milliseconds: number;
  offsetMinutes: number;
  dstActive: boolean;
};

type Parts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function partsAt(ms: number, timezone: string): Parts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const values = Object.fromEntries(
    formatter
      .formatToParts(new Date(ms))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function localAsUtcMs(date: string, time: string): number {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute, second = 0] = time.split(":").map(Number);
  return Date.UTC(year, month - 1, day, hour, minute, second);
}

function partsToUtcMs(parts: Parts): number {
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
}

function sameLocal(a: Parts, b: Parts): boolean {
  return (
    a.year === b.year &&
    a.month === b.month &&
    a.day === b.day &&
    a.hour === b.hour &&
    a.minute === b.minute &&
    a.second === b.second
  );
}

function offsetMinutesAt(ms: number, timezone: string): number {
  const local = partsAt(ms, timezone);
  return Math.round((partsToUtcMs(local) - ms) / 60000);
}

export function resolveHistoricalLocalTime(
  date: string,
  time: string,
  timezone: string,
): LocalTimeResolution {
  const target = partsAt(localAsUtcMs(date, time), "UTC");

  // Collect offsets around the requested local date. This catches normal
  // historical offsets and DST transitions without assuming a fixed offset.
  const offsets = new Set<number>();
  for (const day of [-2, -1, 0, 1, 2]) {
    const probe = localAsUtcMs(date, time) + day * 86400000;
    offsets.add(offsetMinutesAt(probe, timezone));
  }

  const candidates = [...offsets]
    .map((offsetMinutes) => ({
      offsetMinutes,
      milliseconds: localAsUtcMs(date, time) - offsetMinutes * 60000,
    }))
    .filter((candidate) =>
      sameLocal(partsAt(candidate.milliseconds, timezone), target),
    );

  if (candidates.length === 0) {
    throw new Error(`invalid_local_time:${timezone}`);
  }

  if (candidates.length > 1) {
    throw new Error(`ambiguous_local_time:${timezone}`);
  }

  const candidate = candidates[0];
  const january = offsetMinutesAt(
    Date.UTC(target.year, 0, 15, 12),
    timezone,
  );
  const july = offsetMinutesAt(
    Date.UTC(target.year, 6, 15, 12),
    timezone,
  );

  const standardOffset = Math.min(january, july);
  const dstActive =
    standardOffset !== candidate.offsetMinutes &&
    Math.max(january, july) === candidate.offsetMinutes;

  return {
    iso: new Date(candidate.milliseconds).toISOString(),
    milliseconds: candidate.milliseconds,
    offsetMinutes: candidate.offsetMinutes,
    dstActive,
  };
}
