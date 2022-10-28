const { exec, execSync } = require("child_process");
const puppeteer = require("puppeteer");

function getChromiumExecPath() {
  return puppeteer.executablePath().replace("app.asar", "app.asar.unpacked");
}

function areEqual(s1, s2) {
  s1 = s1.replace(/\s+/g, " ").trim();
  s2 = s2.replace(/\s+/g, " ").trim();
  return s1 === s2 ? "AC" : "WA";
}

function runCommand(
  command,
  input = "",
  timeout = 0,
  err = (data) => {},
  out = (data) => {},
  close = (code, signal) => {}
) {
  const res = exec(command, {
    encoding: "utf8",
    timeout: timeout,
    killSignal: "SIGINT",
  });
  res.stdin.write(input);
  res.stdin.end();
  res.stderr.on("data", (data) => {
    err(data);
  });
  res.stdout.on("data", (data) => {
    out(data);
  });
  res.on("close", (code, signal) => {
    close(code, signal);
  });
  //TODO: Handle run Command properly.
}

function runCommandSync(command) {
  execSync(command);
}

module.exports = {
  getChromiumExecPath: getChromiumExecPath,
  areEqual: areEqual,
  runCommand: runCommand,
  runCommandSync: runCommandSync,
};
