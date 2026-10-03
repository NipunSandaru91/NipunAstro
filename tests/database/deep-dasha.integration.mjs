import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { generateDeepVimshottari } from "../../supabase/functions/jyotisha-calculator/core/deep-dasha.ts";
import assert from "node:assert/strict";

// Minimal existing schema contract, not a claimed full production restore.
const db = new PGlite();
await db.exec(`
create role anon; create role authenticated; create role service_role bypassrls;
create schema jyotisha; create schema auth;
create function auth.uid() returns uuid language sql stable as
 $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema auth,jyotisha to authenticated,service_role,anon;
create table jyotisha.calculation_runs(id uuid primary key,owner_user_id uuid,deleted_at timestamptz,status text,utc_timestamp timestamptz);
create table jyotisha.graha_positions(calculation_id uuid,graha_id smallint,longitude_sidereal double precision);
create table jyotisha.grahas(id smallint primary key);
insert into jyotisha.grahas select generate_series(1,9);
grant select,update on jyotisha.calculation_runs to service_role;
grant select on jyotisha.calculation_runs to authenticated;
grant select on jyotisha.graha_positions to service_role;
insert into jyotisha.calculation_runs values
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011',null,'CALCULATED','1991-04-06T08:42:00Z');
insert into jyotisha.graha_positions values ('00000000-0000-0000-0000-000000000001',2,252.348067345032);
`);
await db.exec(
  readFileSync(
    new URL(
      "../../supabase/migrations/20261003163837_deep_vimshottari_v2.sql",
      import.meta.url,
    ),
    "utf8",
  ),
);
const query =
  `select path,parent_path,level,sequence_order,graha_id,start_at,end_at,duration_ms,calculation_version from jyotisha.deep_vimshottari_rows_v2($1::timestamptz,$2::double precision,$3::integer,$4::integer)`;
// Compare independently implemented SQL and TypeScript for every returned row.
for (
  const input of [
    {
      birth_at: "9999-01-01T00:00:00.123Z",
      moon_longitude_sidereal: 200,
      md_count: 1,
      depth: 3,
    },
    {
      birth_at: "1991-04-06T08:42:00.000Z",
      moon_longitude_sidereal: 252.348067345032,
      md_count: 4,
      depth: 5,
    },
    {
      birth_at: "2000-01-01T00:00:00.000Z",
      moon_longitude_sidereal: 0,
      md_count: 9,
      depth: 5,
    },
    {
      birth_at: "1900-01-01T00:00:00.000Z",
      moon_longitude_sidereal: -360,
      md_count: 18,
      depth: 2,
    },
    {
      birth_at: "2026-10-03T12:34:56.789Z",
      moon_longitude_sidereal: 359.9999999999999,
      md_count: 9,
      depth: 3,
    },
  ]
) {
  const expected = generateDeepVimshottari(input);
  const { rows } = await db.query(query, [
    input.birth_at,
    input.moon_longitude_sidereal,
    input.md_count,
    input.depth,
  ]);
  const exact = await db.query(
    `select bool_and(extract(epoch from start_at)*1000=trunc(extract(epoch from start_at)*1000) and extract(epoch from end_at)*1000=trunc(extract(epoch from end_at)*1000)) as ok from jyotisha.deep_vimshottari_rows_v2($1::timestamptz,$2::double precision,$3::integer,$4::integer)`,
    [
      input.birth_at,
      input.moon_longitude_sidereal,
      input.md_count,
      input.depth,
    ],
  );
  assert.equal(exact.rows[0].ok, true);
  const actual = rows.map((r) => ({
    ...r,
    start_at: r.start_at.toISOString(),
    end_at: r.end_at.toISOString(),
    duration_ms: Number(r.duration_ms),
  }));
  assert.deepEqual(actual, expected);
  console.log(`SQL/TS exact parity: ${rows.length} rows, depth ${input.depth}`);
}
for (
  const params of [
    ["2000-01-01", 0, 0, 3],
    ["2000-01-01", 0, 19, 3],
    ["2000-01-01", 0, 9, 6],
    ["2000-01-01", 361, 9, 3],
    ["2000-01-01", -361, 9, 3],
    ["2000-01-01", "NaN", 9, 3],
    ["2000-01-01", "Infinity", 9, 3],
    [null, 0, 9, 3],
    ["2000-01-01", null, 9, 3],
    ["2000-01-01", 0, null, 3],
    ["2000-01-01", 0, 9, null],
    ["infinity", 0, 9, 3],
    ["2000-01-01T00:00:00.000001Z", 0, 9, 3],
  ]
) {
  await assert.rejects(db.query(query, params));
}
console.log("Invalid inputs rejected");
const id = "00000000-0000-0000-0000-000000000001";
await db.exec("set role service_role");
await db.query("select jyotisha.generate_deep_vimshottari_v2($1,1,5)", [id]);
console.log("Materialization complete");
const first =
  (await db.query("select * from jyotisha.deep_dasha_periods_v2 order by path"))
    .rows;
await db.query("select jyotisha.generate_deep_vimshottari_v2($1,1,5)", [id]);
assert.deepEqual(
  (await db.query("select * from jyotisha.deep_dasha_periods_v2 order by path"))
    .rows,
  first,
);
await assert.rejects(
  db.query("select jyotisha.generate_deep_vimshottari_v2($1,0,5)", [id]),
);
assert.equal(
  (await db.query("select count(*)::int n from jyotisha.deep_dasha_periods_v2"))
    .rows[0].n,
  first.length,
);
await db.exec(
  `reset role; set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-000000000011'`,
);
assert.equal(
  (await db.query("select count(*)::int n from jyotisha.deep_dasha_periods_v2"))
    .rows[0].n,
  first.length,
);
await assert.rejects(
  db.query("select jyotisha.generate_deep_vimshottari_v2($1,1,5)", [id]),
);
await assert.rejects(db.query("delete from jyotisha.deep_dasha_periods_v2"));
await db.exec(
  `set request.jwt.claim.sub='00000000-0000-0000-0000-000000000012'`,
);
assert.equal(
  (await db.query("select count(*)::int n from jyotisha.deep_dasha_periods_v2"))
    .rows[0].n,
  0,
);
await db.exec(
  `reset role; update jyotisha.calculation_runs set deleted_at=now(); set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-000000000011'`,
);
assert.equal(
  (await db.query("select count(*)::int n from jyotisha.deep_dasha_periods_v2"))
    .rows[0].n,
  0,
);
await db.exec("reset role; set role service_role");
await assert.rejects(
  db.query("select jyotisha.generate_deep_vimshottari_v2($1,1,5)", [id]),
);
await db.exec(
  `reset role; update jyotisha.calculation_runs set deleted_at=null,status='PENDING'; set role service_role`,
);
await assert.rejects(
  db.query("select jyotisha.generate_deep_vimshottari_v2($1,1,5)", [id]),
);
await db.exec(
  `reset role; update jyotisha.calculation_runs set status='CALCULATED'; delete from jyotisha.graha_positions; set role service_role`,
);
await assert.rejects(
  db.query("select jyotisha.generate_deep_vimshottari_v2($1,1,5)", [id]),
);
assert.equal(
  (await db.query("select count(*)::int n from jyotisha.deep_dasha_periods_v2"))
    .rows[0].n,
  first.length,
);
await assert.rejects(
  db.query("select jyotisha.generate_deep_vimshottari_v2($1,1,5)", [
    "00000000-0000-0000-0000-000000000099",
  ]),
);
await db.exec("reset role; set role anon");
await assert.rejects(db.query("select * from jyotisha.deep_dasha_periods_v2"));
await assert.rejects(
  db.query("select jyotisha.generate_deep_vimshottari_v2($1,1,5)", [id]),
);
await db.close();
console.log(
  "PASS: validation, atomic regeneration, idempotence, owner isolation, deleted charts, anonymous and write denial",
);
