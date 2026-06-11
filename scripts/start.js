const { spawn } = require("child_process");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const isWindows = process.platform === "win32";

const launch = (cwd, npmArgs) => {
  const command = isWindows ? process.env.ComSpec || "cmd.exe" : "npm";
  const args = isWindows ? ["/c", "npm", ...npmArgs] : npmArgs;

  return spawn(command, args, {
    cwd,
    stdio: "inherit"
  });
};

const processes = [
  launch(path.join(rootDir, "backend"), ["start"]),
  launch(path.join(rootDir, "frontend"), ["run", "dev"])
];

let shuttingDown = false;

const shutdown = (code = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of processes) {
    child.kill();
  }

  process.exit(code);
};

for (const child of processes) {
  child.on("error", (error) => {
    if (!shuttingDown) {
      console.error(error);
      shutdown(1);
    }
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      shutdown(code);
    }
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));