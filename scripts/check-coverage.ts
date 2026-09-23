const directory = Deno.args[0] ?? "coverage";
const command = new Deno.Command(Deno.execPath(), {
  args: ["coverage", directory, "--detailed"],
  stdout: "piped",
  stderr: "piped",
});
const output = await command.output();
const stdout = new TextDecoder().decode(output.stdout);
const stderr = new TextDecoder().decode(output.stderr);

if (!output.success) {
  console.error(stdout);
  console.error(stderr);
  Deno.exit(1);
}

const measurements = [...stdout.matchAll(/cover .*? (\d+(?:\.\d+)?)%/g)].map(
  (match) => Number(match[1]),
);

if (measurements.length === 0) {
  console.error(stdout);
  throw new Error("Unable to determine coverage percentage");
}

const failed = measurements.filter((percentage) => percentage < 100);
console.log(`Measured files: ${measurements.length}`);
console.log(`Minimum line coverage: ${Math.min(...measurements)}%`);

if (failed.length > 0) {
  throw new Error(`Coverage gate failed: ${failed.length} file(s) below 100%`);
}
