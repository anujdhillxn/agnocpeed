const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { exec, execSync } = require("child_process");
const isDev = require("electron-is-dev");
const puppeteer = require("puppeteer");

const ATCODER = "atcoder";
const CODEFORCES = "codeforces";
const PRACTICE = "practice";
const CODECHEF = "codechef";

require("@electron/remote/main").initialize();

let browser = null;
let mainPage = null;
let submissionPage = null;
let standingsPage = null;
let website = null;
let contestId = null;
let contestDir = null;
let problemList = [];
let problemDetails = {};
let currentProblem = null;
let submissions = [];
let standings = null;
let log = "";
let filesDir = isDev
  ? path.join(__dirname, "../extraResources/files")
  : path.join(process.resourcesPath, "extraResources/files");
let boilerplate = isDev
  ? path.join(__dirname, "../extraResources/settings")
  : path.join(process.resourcesPath, "extraResources/settings");
let configPath = path.join(boilerplate, "config.json");
let config = null;

let win;

function setWebsite(newVal) {
  if (newVal == website) return;
  website = newVal;
  win.webContents.send("getWebsite", website);
}

function setContestId(newVal) {
  if (newVal == contestId) return;
  contestId = newVal;
  win.webContents.send("getContestId", contestId);
}

function setCurrentProblem(newVal) {
  if (newVal == currentProblem) return;
  currentProblem = newVal;
  win.webContents.send("getCurrentProblem", currentProblem);
}

function setProblemDetails(newVal) {
  if (newVal == problemDetails) return;
  problemDetails = newVal;
  win.webContents.send("getProblemDetails", problemDetails);
}

function setProblemList(newVal) {
  if (newVal == problemList) return;
  problemList = newVal;
  win.webContents.send("getProblemList", problemList);
}

function setSubmissions(newVal) {
  if (newVal == submissions) return;
  submissions = newVal;
  win.webContents.send("getSubmissions", submissions);
}

function setStandings(newVal) {
  if (newVal == standings) return;
  standings = newVal;
  win.webContents.send("getStandings", standings);
}

function setLog(newVal) {
  if (newVal == log) return;
  log = newVal;
  win.webContents.send("getLog", log);
}

function setConfig(newVal) {
  if (newVal === config) return;
  config = newVal;
  win.webContents.send("getConfig", config);
  const jsonConfig = JSON.stringify(config);
  fs.writeFile(configPath, jsonConfig, function (err) {
    if (err) {
      console.log(err);
    }
  });
}

async function updateSubmissions() {
  if (website && contestId) {
    const newSubmissions = [];
    switch (website) {
      case CODEFORCES:
        await submissionPage.goto(
          `https://codeforces.com/contest/${contestId}/my`
        );
        const submissionTables = await submissionPage.$$(
          ".status-frame-datatable"
        );
        for (const table of submissionTables) {
          const rows = await table.$$("tr");
          for (let i = 1; i < rows.length; i++) {
            const cells = await rows[i].$$("td");
            const data = [];
            for (const cell of cells) {
              const val = await cell.evaluate((val) => val.innerText);
              data.push(val);
            }
            newSubmissions.push({
              problemId: data[3],
              time: data[1],
              verdict: data[5],
            });
          }
        }
        break;
      case ATCODER:
        await submissionPage.goto(
          `https://atcoder.jp/contests/${contestId}/submissions/me`
        );
        const table = await submissionPage.$("tbody");
        const rows = await table.$$("tr");
        for (let i = 0; i < rows.length; i++) {
          const cells = await rows[i].$$("td");
          const data = [];
          for (const cell of cells) {
            const val = await cell.evaluate((val) => val.innerText);
            data.push(val);
          }
          newSubmissions.push({
            problemId: data[1],
            time: data[0],
            verdict: data[6],
          });
        }
    }
    setSubmissions(newSubmissions);
  }
}

async function updateStandings() {
  if (website && contestId && problemList) {
    let newStandings = {};
    newStandings.solve = {};
    switch (website) {
      case CODEFORCES:
        await standingsPage.goto(
          `https://codeforces.com/contest/${contestId}/standings/friends/true`
        );
        await standingsPage.waitForSelector(`.standingsStatisticsRow`);
        const solveRow = await standingsPage.$(".standingsStatisticsRow");
        const counts = await solveRow.$$("td");
        for (let i = 0; i < problemList.length; i++) {
          newStandings.solve[problemList[i]] = await counts[i + 4].evaluate(
            (val) => val.innerText
          );
        }
        try {
          const myRow = await standingsPage.$(".highlighted-row");
          const myRank = await myRow.$$("td");
          newStandings.rank = await myRank[0].evaluate((val) => val.innerText);
        } catch (e) {
          newStandings.rank = "Cannot find you";
        }
        break;
      case ATCODER:
        await standingsPage.goto(
          `https://atcoder.jp/contests/${contestId}/standings`
        );
        await standingsPage.waitForSelector("#standings-tbody");
        const table = await standingsPage.$("#standings-tbody");
        const solves = await table.$(".standings-statistics");
        const cells = await solves.$$("td");
        for (let i = 1; i < cells.length; i++) {
          newStandings.solve[problemList[i - 1]] = await cells[i].evaluate(
            (val) => val.innerText
          );
        }
        try {
          const me = await table.$(".info");
          const rank = await me.$$("td");
          newStandings.rank = await rank[0].evaluate((val) => val.innerText);
        } catch (e) {
          newStandings.rank = "Cannot find you";
        }
        break;
    }
    setStandings(newStandings);
  }
}

function getChromiumExecPath() {
  return puppeteer.executablePath().replace("app.asar", "app.asar.unpacked");
}

async function init() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });
  await win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "./index.html")}`
  );
  if (!fs.existsSync(filesDir)) exec(`mkdir ${filesDir}`);
  browser = await puppeteer.launch({
    executablePath: getChromiumExecPath(),
    headless: true,
  });
  mainPage = await browser.newPage();
  submissionPage = await browser.newPage();
  standingsPage = await browser.newPage();
  fs.readFile(configPath, "utf8", function (err, data) {
    if (err) throw err;
    setConfig(JSON.parse(data));
  });
  setInterval(() => {
    updateSubmissions();
  }, 5000);
  setInterval(() => {
    updateStandings();
  }, 5000);
}

function sendNotif(type, message) {
  win.webContents.send("notif", { message: message, danger: type });
}

function areEqual(s1, s2) {
  s1 = s1.replace(/\s+/g, " ").trim();
  s2 = s2.replace(/\s+/g, " ").trim();
  console.log("x" + s1 + "x");
  console.log("x" + s2 + "x");
  return s1 === s2 ? "AC" : "WA";
}

function addToLog(message) {
  setLog(message + "\n" + log);
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
  const resp = execSync(command);
}

function clearTestCases(problemId) {
  let newDetails = { ...problemDetails };
  for (let i = 0; i < problemDetails[problemId].testCases.length; i++) {
    newDetails[problemId].testCases[i].result = "";
    newDetails[problemId].testCases[i].verdict = "";
  }
  setProblemDetails(newDetails);
}

function createWindow() {
  init();
}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on("login", async (event, username, password, platform) => {
  switch (platform) {
    case CODEFORCES:
      win.webContents.send("getLoginMessage", "Opening Website...");
      try {
        (await mainPage).goto("https://codeforces.com/enter?back=%2F");
        await mainPage.waitForSelector("#handleOrEmail");
      } catch (e) {
        win.webContents.send("getLoginMessage", "Unable to open website. " + e);
        return;
      }

      win.webContents.send("getLoginMessage", "Validating credentials...");
      try {
        await mainPage.type("#handleOrEmail", username);
        await mainPage.type("#password", password);
        await mainPage.click("input[type=submit]");
        await mainPage.waitForXPath('//*[contains(text(), "Logout")]');
        win.webContents.send("getLoginMessage", "Login successful.");
      } catch (e) {
        win.webContents.send("getLoginMessage", "Login failed. " + e);
        return;
      }

      break;
    case ATCODER:
      win.webContents.send("getLoginMessage", "Opening Website...");
      try {
        (await mainPage).goto(
          "https://atcoder.jp/login?continue=https%3A%2F%2Fatcoder.jp%2F"
        );
        await mainPage.waitForSelector("#username");
      } catch (e) {
        win.webContents.send("getLoginMessage", "Unable to open website. " + e);
        return;
      }

      win.webContents.send("getLoginMessage", "Validating credentials...");
      try {
        await mainPage.type("#username", username);
        await mainPage.type("#password", password);
        await mainPage.click("#submit");
        await mainPage.waitForXPath('//*[contains(text(), "Sign Out")]');
        win.webContents.send("getLoginMessage", "Login successful.");
      } catch (e) {
        win.webContents.send("getLoginMessage", "Login failed. " + e);
        return;
      }

      break;
    case CODECHEF:
      win.webContents.send(
        "getLoginMessage",
        "The support for this platform is not available, yet."
      );
      return;
    case PRACTICE:
      win.webContents.send(
        "getLoginMessage",
        "Choose name of practice session."
      );
      break;
    default:
      win.webContents.send("getLoginMessage", "Invalid platform.");
      return;
  }
  setWebsite(platform);
});

ipcMain.on("start", async (event, id) => {
  fs.readFile(configPath, "utf8", function (err, data) {
    if (err) throw err;
    setConfig(JSON.parse(data));
  });
  if (website == null) {
    win.webContents.send("getLoginMessage", "Select a platform first!");
    return;
  } else {
    contestDir = path.join(filesDir, `${website}_${id}`);
    let testcases = path.join(contestDir, "testcases.json");
    if (!fs.existsSync(contestDir)) {
      runCommandSync(`mkdir ${contestDir}`);
      runCommandSync(`echo "{}" > ${testcases}`);
    }
    fs.readFile(testcases, "utf8", function (err, data) {
      if (err) throw err;
      problemDetails = JSON.parse(data);
    });
    setProblemList([]);
    win.webContents.send("getLoginMessage", "Collecting tasks...");
    try {
      switch (website) {
        case CODEFORCES:
          await mainPage.goto(`https://codeforces.com/contest/${id}`);
          var items = await mainPage.$$(".id");
          for (let i = 0; i < items.length; i++) {
            let linkText = await items[i].$("a");
            let problemId = await linkText.evaluate((el) => el.innerText);
            setProblemList([...problemList, problemId]);
          }
          break;
        case ATCODER:
          await mainPage.goto(`https://atcoder.jp/contests/${id}/tasks`);
          await mainPage.waitForSelector("tbody");
          const nodeChildren = await mainPage.$eval("tbody", (uiElement) => {
            return uiElement.children;
          });
          for (let i = 0; i < Object.keys(nodeChildren).length; i++)
            setProblemList([...problemList, String.fromCharCode(i + 65)]);
          break;
        case PRACTICE:
          setProblemList(["A", "B", "C", "D"]);
          for (const p in problemList) {
            setProblemDetails({
              ...problemDetails,
              [p]: {
                testcases: [
                  {
                    input: "",
                    output: "",
                    result: "",
                    verdict: "",
                    comments: "",
                  },
                ],
              },
            });
          }
          break;
        default:
          win.webContents.send("getLoginMessage", "Invalid platform!");
          return;
      }
    } catch (e) {
      win.webContents.send("getLoginMessage", "Error. Try again. " + e);
      return;
    }
  }
  setContestId(id);
});

ipcMain.on("change", async (event, problemId, lang) => {
  const problemName = problemList[problemId];
  let fileLoc = path.join(contestDir, `${problemName}.${lang}`);
  if (!fs.existsSync(fileLoc)) {
    fs.readFile(
      `${path.join(boilerplate, config.languages[lang].template)}`,
      { encoding: "utf-8" },
      function (err, data) {
        if (!err) {
          fs.writeFile(`${fileLoc}`, data, function (err) {
            if (err) {
              return console.log(err);
            }
          });
        } else {
          console.log(err);
        }
      }
    );
  }

  const statementLoc = path.join(contestDir, `${problemName}.pdf`);
  runCommand(`${config.editor} -g --goto ${fileLoc}:44:4`);
  if (
    !problemDetails.hasOwnProperty(problemName) ||
    problemDetails[problemName]["testCases"].length === 0
  ) {
    let testCases = [];
    try {
      switch (website) {
        case CODEFORCES:
          if (!fs.existsSync(statementLoc)) {
            await mainPage.goto(
              `https://codeforces.com/contest/${contestId}/problem/${problemName}`
            );
            await mainPage.pdf({ path: statementLoc });
          }
          await mainPage.goto(
            `https://codeforces.com/contest/${contestId}/problem/${problemName}`
          );

          inputTexts = await mainPage.$$(".input");
          outputTexts = await mainPage.$$(".output");
          for (let i = 0; i < inputTexts.length; i++) {
            let input = await inputTexts[i].$eval("pre", (el) => el.innerText);
            let output = await outputTexts[i].$eval(
              "pre",
              (el) => el.innerText
            );
            testCases.push({
              input: input,
              output: output,
              result: "",
              verdict: "",
              comments: "",
            });
          }
          break;

        case ATCODER:
          if (!fs.existsSync(statementLoc)) {
            await mainPage.goto(
              `https://atcoder.jp/contests/${contestId}/tasks/${contestId}_${problemName}`
            );
            await mainPage.pdf({ path: statementLoc });
          }
          await mainPage.goto(
            `https://atcoder.jp/contests/${contestId}/tasks/${contestId}_${problemName}`
          );
          let count = 0,
            started = false,
            index = 0,
            toInput = true;
          while (count < 50) {
            try {
              let data = await mainPage.$eval(
                `#pre-sample${count}`,
                (el) => el.textContent
              );
              console.log(count, data);
              if (toInput) {
                testCases.push({
                  input: "",
                  output: "",
                  result: "",
                  verdict: "",
                  comments: "",
                });
                testCases[index].input = data;
                toInput = false;
              } else {
                testCases[index].output = data;
                index++;
                toInput = true;
              }
              started = true;
            } catch (e) {
              console.log(e);
              if (started) break;
            }
            count++;
          }
          testCases = [...testCases.slice(testCases.length / 2)];

          break;
        default:
          break;
      }
    } catch (e) {
      addToLog("Error fetching test cases. Try again. " + e);
      return;
    }
    setProblemDetails({
      ...problemDetails,
      [problemName]: { ...problemDetails[problemName], testCases: testCases },
    });
  }
  setProblemDetails({
    ...problemDetails,
    [problemName]: { ...problemDetails[problemName], statement: statementLoc },
  });
  setCurrentProblem(problemId);
  addToLog(`Solving problem ${problemName}`);
});

ipcMain.on("compile", async (event, problemId, lang) => {
  let fileLoc = path.join(contestDir, `${problemId}.${lang}`);
  if (!config.languages[lang].compiled) {
    addToLog("No need to compile.");
    sendNotif(0, "No need to compile.");
  } else {
    let command = "";
    if (lang === "cpp")
      command =
        "g++" +
        config.languages[lang].compileOptions +
        ` ${fileLoc} -o ${fileLoc}.exe`;
    runCommand(
      command,
      "",
      0,
      (data) => {
        addToLog(data);
        sendNotif(1, "Compilation failed. Check the log for errors.");
      },
      (data) => {},
      (code) => {
        if (code == 0) sendNotif(0, "Compiled successfully.");
      }
    );
  }
});

ipcMain.on("run", async (event, problemId, lang) => {
  let fileLoc;
  if (lang === "cpp") {
    fileLoc = path.join(contestDir, `${problemId}.${lang}.exe`);
  } else {
    fileLoc = path.join(contestDir, `${problemId}.${lang}`);
  }
  if (!fs.existsSync(fileLoc)) {
    addToLog("Executable not found.");
    return 0;
  } else {
    let command = config.languages[lang].runOptions + `${fileLoc}`;
    console.log(command);
    clearTestCases(problemId);
    for (let i = 0; i < problemDetails[problemId].testCases.length; i++) {
      const testCase = problemDetails[problemId].testCases[i].input;
      runCommand(
        command,
        testCase,
        5000,
        (err) => {
          let newDetails = { ...problemDetails };
          newDetails[problemId].testCases[i].comments += err;
          setProblemDetails(newDetails);
        },
        (out) => {
          let newDetails = { ...problemDetails };
          newDetails[problemId].testCases[i].result += out;
          setProblemDetails(newDetails);
        },
        (code, signal) => {
          let newDetails = { ...problemDetails };
          if (signal !== null) {
            newDetails[problemId].testCases[i].verdict = "TLE";
          } else {
            newDetails[problemId].testCases[i].verdict = areEqual(
              newDetails[problemId].testCases[i].output,
              newDetails[problemId].testCases[i].result
            );
          }
          setProblemDetails(newDetails);
        }
      );
    }
  }
});

ipcMain.on("reset", async (event, problemId, lang) => {
  let fileLoc = path.join(contestDir, `${problemId}.${lang}`);
  runCommand(
    `cp ${path.join(boilerplate, config.languages[lang].template)} ${fileLoc}`
  );
  sendNotif(0, "File cleared.");
});

ipcMain.on("submit", async (event, problemId, lang) => {
  let fileLoc = path.join(contestDir, `${problemId}.${lang}`);
  switch (website) {
    case CODEFORCES:
      await mainPage.goto(
        `https://codeforces.com/contest/${contestId}/submit/${problemId}`
      );
      await mainPage.select(
        'select[name="programTypeId"]',
        config.languages[lang].idCodeforces
      );
      var uploadButton = await mainPage.$("input[type=file]");
      await uploadButton.uploadFile(fileLoc);
      await mainPage.click("input[value=Submit");
      sendNotif(0, "Code submitted.");
      break;
    case ATCODER:
      await mainPage.goto(
        `https://atcoder.jp/contests/${contestId}/tasks/${contestId}_${problemId}`
      );
      await mainPage.select(
        'select[name="data.LanguageId"',
        config.languages[lang].idAtcoder
      );
      const [fileChooser] = await Promise.all([
        mainPage.waitForFileChooser(),
        mainPage.click("#btn-open-file"),
      ]);
      await fileChooser.accept([fileLoc]);
      await mainPage.click("#submit");
      sendNotif(0, "Code submitted.");
      break;
    default:
      addToLog("Invalid platform.");
      sendNotif(1, "Unable to submit. Try again.");
  }
});

ipcMain.on("saveLayout", async (event, newLayout) => {
  let newConfig = { ...config };
  newConfig.layout = newLayout;
  setConfig(newConfig);
  sendNotif(0, "Layout saved.");
});

ipcMain.on("clearLog", async (event) => {
  setLog("");
});

ipcMain.on("changeTestCases", async (event, problemId, idx, box, text) => {
  let newDetails = { ...problemDetails };
  newDetails[problemId].testCases[idx][box] = text;
  setProblemDetails(newDetails);
});

ipcMain.on("addNewTestCase", async (event, problemId) => {
  let newDetails = { ...problemDetails };
  newDetails[problemId].testCases.push({
    input: "",
    output: "",
    result: "",
    verdict: "",
    comments: "",
  });
  setProblemDetails(newDetails);
});
