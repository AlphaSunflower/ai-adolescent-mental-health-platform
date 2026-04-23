const { spawnSync } = require("node:child_process");
const { existsSync, accessSync, constants } = require("node:fs");
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
const localCandidate = candidates.find((candidate) =>
  existsSync(path.resolve(process.cwd(), candidate))
);
const localPath = localCandidate
  ? path.resolve(process.cwd(), localCandidate)
  : null;

let executable;
let spawnArgs = args;
let needsShell = false;

if (localPath) {
  const isBatch = /\.(bat|cmd)$/i.test(localPath);
  if (isWindows && isBatch) {
    executable = localPath;
    needsShell = true;
  } else if (!isWindows) {
    let isExecutable = true;
    try {
      accessSync(localPath, constants.X_OK);
    } catch {
      isExecutable = false;
    }
    if (isExecutable) {
      executable = localPath;
    } else {
      executable = "sh";
      spawnArgs = [localPath, ...args];
    }
  } else {
    executable = localPath;
  }
} else {
  executable = tool;
}

const result = spawnSync(executable, spawnArgs, {
  cwd: process.cwd(),
  shell: needsShell,
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
