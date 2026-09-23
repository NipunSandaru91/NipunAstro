const directory = Deno.args[0] ?? "coverage";

async function runCoverage(args: string[]) {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["coverage", directory, ...args],
    stdout: "piped",
    stderr: "piped",
  });
  return await command.output();
}

const lcov = await runCoverage(["--lcov"]);
const lcovOutput = new TextDecoder().decode(lcov.stdout);
const lcovError = new TextDecoder().decode(lcov.stderr);

if (!lcov.success) {
  console.error(lcovOutput);
  console.error(lcovError);
  Deno.exit(1);
}

type LcovFile = {
  file: string;
  linesFound: number;
  linesHit: number;
  functionsFound: number;
  functionsHit: number;
  branchesFound: number;
  branchesHit: number;
  uncoveredBranches: string[];
};

const records: LcovFile[] = [];
let current: LcovFile | null = null;

for (const line of lcovOutput.split("\n")) {
  if (line.startsWith("SF:")) {
    current = {
      file: line.slice(3),
      linesFound: 0,
      linesHit: 0,
      functionsFound: 0,
      functionsHit: 0,
      branchesFound: 0,
      branchesHit: 0,
      uncoveredBranches: [],
    };
    records.push(current);
    continue;
  }

  if (!current) continue;

  if (line.startsWith("LF:")) current.linesFound = Number(line.slice(3));
  if (line.startsWith("LH:")) current.linesHit = Number(line.slice(3));
  if (line.startsWith("FNF:")) current.functionsFound = Number(line.slice(4));
  if (line.startsWith("FNH:")) current.functionsHit = Number(line.slice(4));
  if (line.startsWith("BRF:")) current.branchesFound = Number(line.slice(4));
  if (line.startsWith("BRH:")) current.branchesHit = Number(line.slice(4));

  if (line.startsWith("BRDA:")) {
    const [, lineNumber, block, branch, taken] = line.split(",");
    if (taken === "0" || taken === "-") {
      current.uncoveredBranches.push(`${lineNumber}:${block}:${branch}`);
    }
  }
}

if (records.length === 0) {
  console.error(lcovOutput);
  throw new Error("Unable to determine coverage records");
}

const failures: string[] = [];

for (const record of records) {
  const lineCoverage = record.linesFound === 0 ? 100 : 100 * record.linesHit / record.linesFound;
  const functionCoverage = record.functionsFound === 0 ? 100 : 100 * record.functionsHit / record.functionsFound;
  const branchCoverage = record.branchesFound === 0 ? 100 : 100 * record.branchesHit / record.branchesFound;

  console.log(
    `${record.file}: line ${lineCoverage.toFixed(1)}%, branch ${branchCoverage.toFixed(1)}%, function ${functionCoverage.toFixed(1)}%`,
  );

  if (record.uncoveredBranches.length > 0) {
    for (const branch of record.uncoveredBranches) {
      console.log(`UNCOVERED BRANCH ${record.file}:${branch}`);
    }
  }

  if (lineCoverage < 100 || branchCoverage < 100 || functionCoverage < 100) {
    failures.push(
      `${record.file}: line=${lineCoverage.toFixed(1)} branch=${branchCoverage.toFixed(1)} function=${functionCoverage.toFixed(1)}`,
    );
  }
}

if (failures.length > 0) {
  throw new Error(`Coverage gate failed: ${failures.join("; ")}`);
}

console.log("Coverage gate: 100% lines, branches, and functions.");
