const { spawnSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const path = require("node:path");

const [, , tool, ...args] = process.argv;

if (!tool) {
  console.error("Usage: node scripts/run-workspace-bin.cjs <tool> [...args]");
  process.exit(1);
}

const isWindows = process.platform === "win32";
const toolCandidates = {
  gradlew: isWindows ? ["gradlew.bat", "gradlew"] : ["gradlew", "./gradlew"],
  mvnw: isWindows ? ["mvnw.cmd", "mvnw"] : ["mvnw", "./mvnw"]
};

const candidates = toolCandidates[tool] ?? [tool];
const executable = candidates.find((candidate) =>
  existsSync(path.resolve(process.cwd(), candidate))
) ?? tool;

const needsShell = isWindows && /\.(bat|cmd)$/i.test(executable);
const result = spawnSync(executable, args, {
  cwd: process.cwd(),
  shell: needsShell,
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
