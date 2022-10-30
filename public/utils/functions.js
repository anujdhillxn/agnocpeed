const { exec, execSync } = require("child_process");
const puppeteer = require("puppeteer");
const sound = require("sound-play");
const ACCEPTED_VERDICTS = ["AC", "Accepted", "Pretests passed"];
const REJECTED_VERDICTS = [
  "TLE",
  "MLE",
  "WA",
  "RE",
  "Time limit exceeded",
  "Memory limit exceeded",
  "Wrong answer",
  "Runtime error",
];

function getChromiumExecPath() {
  return puppeteer.executablePath().replace("app.asar", "app.asar.unpacked");
}

function areEqual(s1, s2) {
  s1 = s1.replace(/\s+/g, " ").trim();
  s2 = s2.replace(/\s+/g, " ").trim();
  return s1 === s2 ? "AC" : "WA";
}

const getColor = (verdict) => {
  if (verdict === undefined) return "yellow";
  let decision = 0;
  ACCEPTED_VERDICTS.forEach((item) => {
    if (verdict.startsWith(item)) decision = 1;
  });
  REJECTED_VERDICTS.forEach((item) => {
    if (verdict.startsWith(item)) decision = -1;
  });
  if (decision) return decision === 1 ? "lightgreen" : "red";
  return "yellow";
};

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
    console.log(data);
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

const playSound = (filePath) => {
  sound.play(filePath);
};

module.exports = {
  getChromiumExecPath: getChromiumExecPath,
  areEqual: areEqual,
  runCommand: runCommand,
  runCommandSync: runCommandSync,
  getColor: getColor,
  playSound: playSound,
};
