import { mapGraha, mapNodes, NATAL_BODIES } from "../../supabase/functions/jyotisha-calculator/core/planets.ts";

Deno.test("maps all seven classical grahas with stable database ids", () => {
  const expected = [["SURYA",1],["CHANDRA",2],["BUDHA",4],["SHUKRA",6],["MANGALA",3],["GURU",5],["SHANI",7]];
  if (NATAL_BODIES.length !== 7) throw new Error("Expected seven classical bodies");
  NATAL_BODIES.forEach(([code,,id], i) => {
    if (code !== expected[i][0] || id !== expected[i][1]) throw new Error("Graha mapping mismatch");
  });
  const results = NATAL_BODIES.map(([code,,id], i) => mapGraha(code, id, { longitude: i * 30 + 1, longitudeSpeed: i % 2 ? -0.1 : 0.1 }));
  if (results.map(x => x.graha_id).join(",") !== "1,2,4,6,3,5,7") throw new Error("Graha ids mismatch");
  if (!results[1].retrograde || results[0].retrograde) throw new Error("Retrograde mapping mismatch");
});

Deno.test("maps Rahu and Ketu as opposite nodes with opposite speed", () => {
  const [rahu, ketu] = mapNodes({ longitude: 350, latitude: 2, longitudeSpeed: -0.05 });
  if (rahu.graha_id !== 8 || ketu.graha_id !== 9) throw new Error("Node ids mismatch");
  if (ketu.longitude !== 530) throw new Error("Ketu longitude offset mismatch");
  if (ketu.latitude !== -2 || ketu.longitudeSpeed !== 0.05 || ketu.retrograde) throw new Error("Ketu transformation mismatch");
});

Deno.test("rejects invalid graha longitude", () => {
  try { mapGraha("SURYA", 1, { longitude: Number.NaN }); throw new Error("Expected rejection"); }
  catch (e) { if (!(e instanceof Error) || !e.message.includes("missing longitude")) throw e; }
});
