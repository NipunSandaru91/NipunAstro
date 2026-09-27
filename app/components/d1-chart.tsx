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
        <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-label="D1 Rashi chart">
          <rect x="6" y="6" width="388" height="388" rx="10" fill="#091522" stroke="#405163" strokeWidth="2" />

          {[
            "200,6 294,100 200,200 106,100",
            "6,6 200,6 106,100",
            "6,6 106,100 6,200",
            "6,200 106,100 200,200 106,300",
            "6,394 6,200 106,300",
            "6,394 106,300 200,394",
            "200,394 294,300 200,200 106,300",
            "394,394 200,394 294,300",
            "394,394 394,200 294,300",
            "394,200 294,300 200,200 294,100",
            "394,6 394,200 294,100",
            "394,6 200,6 294,100",
          ].map((points, index) => (
            <polygon
              key={index}
              points={points}
              fill={index === 0 ? "#211b0e" : "#0d1b2b"}
              stroke={index === 0 ? "#d2aa58" : "#405163"}
              strokeWidth="1.5"
            />
          ))}

          {houses.map(({ house, rashiId, planets }, index) => {
            const positions = [
              [200, 72], [98, 52], [48, 148], [72, 200],
              [48, 302], [98, 348], [200, 328], [302, 348],
              [352, 302], [328, 200], [352, 148], [302, 52],
            ];
            const [x, y] = positions[index];
            const isLagna = house === 1;
            return (
              <g key={house}>
                <text x={x} y={y - 17} textAnchor="middle" fill="#b8954f" fontSize="9" fontWeight="700">
                  {house}
                </text>
                <text x={x} y={y - 2} textAnchor="middle" fill="#eee9de" fontSize="13" fontWeight="600">
                  {rashiNames[rashiId - 1] ?? "—"}
                </text>
                <text x={x} y={y + 13} textAnchor="middle" fill={isLagna ? "#e0b65b" : "#9aa6b4"} fontSize="9">
                  {planets.map((p) => grahaName(p, grahaNames)).join(" · ") || "—"}
                </text>
              </g>
            );
          })}

          <text x="200" y="194" textAnchor="middle" fill="#d4cfc4" fontSize="11" fontWeight="600">
            D1
          </text>
          <text x="200" y="211" textAnchor="middle" fill="#778392" fontSize="8">
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
