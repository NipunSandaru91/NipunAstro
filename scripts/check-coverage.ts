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

const match = stdout.match(/total\s+\|\s+(\d+(?:\.\d+)?)%/i);
if (!match) {
  console.error(stdout);
  throw new Error("Unable to determine coverage percentage");
}

const percentage = Number(match[1]);
console.log(`Measured line coverage: ${percentage}%`);
if (percentage < 100) {
  throw new Error(`Coverage gate failed: expected 100%, got ${percentage}%`);
}
