"use client";

type Graha = Record<string, unknown>;

type D1ChartProps = {
  lagnaRasiId: number;
  grahas: Graha[];
  rashiNames: string[];
  grahaNames: Record<string, string>;
};

function pick(obj: Graha | null | undefined, ...keys: string[]) {
  if (!obj) return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") return obj[key];
  }
  return undefined;
}

function grahaName(graha: Graha, names: Record<string, string>) {
  const code = String(pick(graha, "code", "graha_code") ?? "").toUpperCase();
  return names[code] ?? String(pick(graha, "name", "english_name", "code") ?? "—");
}

export default function D1Chart({
  lagnaRasiId,
  grahas,
  rashiNames,
  grahaNames,
}: D1ChartProps) {
  const houses = Array.from({ length: 12 }, (_, i) => {
    const house = i + 1;
    const rashiId = ((lagnaRasiId - 1 + i) % 12) + 1;
    const planets = grahas.filter(
      (graha) => Number(pick(graha, "rasi_id")) === rashiId,
    );
    return { house, rashiId, planets };
  });

  const positions = [
    [250, 94], [374, 38], [500, 94], [626, 38],
    [752, 94], [878, 38], [878, 250], [878, 406],
    [752, 562], [626, 618], [500, 562], [374, 618],
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-[#34475b] bg-[#081522] p-3 sm:p-5">
      <div className="flex items-center justify-between px-2 pb-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#b8954f]">
            D1 · Rāśi Chart
          </p>
          <p className="mt-1 text-xs text-[#7f8a98]">
            Whole Sign · Lahiri Sidereal
          </p>
        </div>
        <span className="rounded-full border border-[#405163] px-2.5 py-1 text-[9px] text-[#9ba6b2]">
          Calculation layer
        </span>
      </div>

      <div className="mx-auto aspect-square w-full max-w-[620px]">
        <svg
          viewBox="0 0 1000 650"
          className="h-full w-full"
          role="img"
          aria-label="D1 Rashi chart"
        >
          <rect x="20" y="20" width="960" height="610" rx="18" fill="#091522" stroke="#405163" strokeWidth="3" />
          <path
            d="M20 20 L500 325 L980 20 L980 630 L500 325 L20 630 Z"
            fill="none"
            stroke="#6f7d8b"
            strokeWidth="2"
          />
          <path
            d="M20 20 L980 20 M980 20 L980 630 M980 630 L20 630 M20 630 L20 20"
            fill="none"
            stroke="#6f7d8b"
            strokeWidth="2"
          />
          <path d="M20 20 L500 20 L980 20 M20 630 L500 630 L980 630" fill="none" stroke="#273b4d" />
          <path d="M20 20 L980 630 M980 20 L20 630" fill="none" stroke="#273b4d" strokeWidth="2" />

          {houses.map(({ house, rashiId, planets }, index) => {
            const [x, y] = positions[index];
            const isLagna = house === 1;
            return (
              <g key={house}>
                <circle
                  cx={x}
                  cy={y}
                  r="42"
                  fill={isLagna ? "#211b0e" : "#0d1b2b"}
                  stroke={isLagna ? "#d2aa58" : "#34475b"}
                  strokeWidth="2"
                />
                <text x={x} y={y - 20} textAnchor="middle" fill="#b8954f" fontSize="13" fontWeight="700">
                  Bhāva {house}
                </text>
                <text x={x} y={y - 2} textAnchor="middle" fill="#eee9de" fontSize="17" fontWeight="600">
                  {rashiNames[rashiId - 1] ?? "—"}
                </text>
                <text x={x} y={y + 15} textAnchor="middle" fill="#8e9aa8" fontSize="10">
                  {planets.length ? planets.map((p) => grahaName(p, grahaNames)).join(" · ") : "—"}
                </text>
                <text x={x} y={y + 31} textAnchor="middle" fill="#667586" fontSize="9">
                  {planets.length} graha
                </text>
              </g>
            );
          })}

          <polygon
            points="500,255 570,325 500,395 430,325"
            fill="#0d1b2b"
            stroke="#b8954f"
            strokeWidth="2"
          />
          <text x="500" y="317" textAnchor="middle" fill="#d4cfc4" fontSize="12" fontWeight="600">
            D1
          </text>
          <text x="500" y="337" textAnchor="middle" fill="#778392" fontSize="9">
            RĀŚI
          </text>
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {houses.slice(0, 4).map(({ house, rashiId, planets }) => (
          <div key={house} className="rounded-xl border border-[#24384b] bg-[#091522] px-3 py-2">
            <p className="text-[9px] uppercase tracking-[0.12em] text-[#697787]">Bhāva {house}</p>
            <p className="mt-1 text-xs text-[#d4cfc4]">{rashiNames[rashiId - 1]}</p>
            <p className="mt-1 text-[10px] text-[#8e9aa8]">
              {planets.map((p) => grahaName(p, grahaNames)).join(" · ") || "Empty"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
