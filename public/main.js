const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const isDev = require("electron-is-dev");
const puppeteer = require("puppeteer");
const {
  getChromiumExecPath,
  runCommandSync,
  runCommand,
  areEqual,
  getColor,
  playSound,
} = require("./utils/functions");
const {
  CODEFORCES,
  ATCODER,
  PRACTICE,
  CODECHEF,
  INITIAL_STATE,
} = require("./utils/constants");

require("@electron/remote/main").initialize();

let state = INITIAL_STATE;
let browser = null,
  mainPage = null,
  submissionPage = null,
  standingsPage = null;

let contestDir = null;
let filesDir = isDev
  ? path.join(__dirname, "../extraResources/files")
  : path.join(process.resourcesPath, "extraResources/files");
let settingsDir = isDev
  ? path.join(__dirname, "../extraResources/settings")
  : path.join(process.resourcesPath, "extraResources/settings");
let configPath = path.join(settingsDir, "config.json");
let submittedOnce = false;
let win;

function setState(key, newVal) {
  if (state[key] === newVal) return;
  if (key === "submissions" && submittedOnce) {
    if (
      state.submissions.length < newVal.length ||
      (state.submissions.length === newVal.length &&
        newVal.length > 0 &&
        getColor(state.submissions[0].verdict) === "yellow")
    ) {
      if (getColor(newVal[0].verdict) === "lightgreen")
        playSound(path.join(settingsDir, "win.mp3"));
      else if (getColor(newVal[0].verdict) === "red")
        playSound(path.join(settingsDir, "lose.mp3"));
    }
  }
  state[key] = newVal;
  win.webContents.send("getState", state);
  if (key === "config") {
    const jsonConfig = JSON.stringify(state.config);
    fs.writeFile(configPath, jsonConfig, function (err) {
      if (err) {
        console.log(err);
      }
    });
  }
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
  if (!fs.existsSync(filesDir)) runCommandSync(`mkdir ${filesDir}`);
  browser = await puppeteer.launch({
    executablePath: getChromiumExecPath(),
    headless: true,
  });
  fs.readFile(configPath, "utf8", async function (err, data) {
    if (err) throw err;
    setState("config", JSON.parse(data));
    mainPage = await browser.newPage();
    submissionPage = await browser.newPage();
    standingsPage = await browser.newPage();
    getFutureContests();
  });
}
const sendNotif = (type, message) => {
  win.webContents.send("notif", { message: message, danger: type });
};

const getFutureContests = async () => {
  if (state.contestId === null) {
    const futureContests = [];
    await submissionPage.goto("https://codeforces.com/contests");
    await submissionPage.waitForSelector(".datatable");
    let tableContainer = await submissionPage.$(".datatable");
    let table = await tableContainer.$("tbody");
    let rows = await table.$$("tr");
    for (let i = 1; i < rows.length; i++) {
      const cells = await rows[i].$$("td");
      const data = [];
      for (const cell of cells) {
        const val = await cell.evaluate((val) => val.innerText);
        data.push(val);
      }
      futureContests.push({
        id: await rows[i].evaluate((row) => row.getAttribute("data-contestid")),
        name: data[0],
        startTime: data[2],
        platform: CODEFORCES,
      });
    }
    await standingsPage.goto("https://atcoder.jp/");
    tableContainer = await standingsPage.waitForSelector(
      "#contest-table-upcoming"
    );
    table = await tableContainer.$("tbody");
    rows = await table.$$("tr");
    for (let i = 0; i < rows.length; i++) {
      const cells = await rows[i].$$("td");
      const data = [];
      for (const cell of cells) {
        const val = await cell.evaluate((val) => val.innerText);
        data.push(val);
      }
      const link = await cells[1].$("a");
      futureContests.push({
        id: await link.evaluate((node) => {
          const data = node.getAttribute("href").split("/");
          return data[data.length - 1];
        }),
        name: await link.evaluate((node) => node.innerText),
        startTime: data[0],
        platform: ATCODER,
      });
    }
    setState("futureContests", futureContests);
  }
};

const clearTestCases = () => {
  let newProblemList = [...state.problemList];
  for (
    let i = 0;
    i < state.problemList[state.currentProblem].testCases.length;
    i++
  ) {
    state.problemList[state.currentProblem].testCases[i].result = "";
    state.problemList[state.currentProblem].testCases[i].verdict = "";
  }
  setState("problemList", newProblemList);
};

function addToLog(message) {
  setState("log", message + "\n" + state.log);
}

const createWindow = () => {
  init();
};

const closeWindow = () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
};

const login = async (event, username, password, platform) => {
  switch (platform) {
    case CODEFORCES:
      win.webContents.send("getLoginMessage", "Opening Website...");
      try {
        await mainPage.goto("https://codeforces.com/enter?back=%2F");
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
  setState("website", platform);
};

const start = async (event, id) => {
  fs.readFile(configPath, "utf8", function (err, data) {
    if (err) throw err;
    setState("config", JSON.parse(data));
  });
  if (state.website == null) {
    win.webContents.send("getLoginMessage", "Select a platform first!");
    return;
  } else {
    contestDir = path.join(filesDir, `${state.website}_${id}`);
    let testcases = path.join(contestDir, "testcases.json");
    if (!fs.existsSync(contestDir)) {
      runCommandSync(`mkdir ${contestDir}`);
      runCommandSync(`echo "{}" > ${testcases}`);
    }
    // fs.readFile(testcases, "utf8", function (err, data) {
    //   if (err) throw err;
    //   problemDetails = JSON.parse(data);
    // });
    setState("problemList", []);
    let newProblemList = [];
    win.webContents.send("getLoginMessage", "Collecting tasks...");
    try {
      switch (state.website) {
        case CODEFORCES:
          await mainPage.goto(`https://codeforces.com/contest/${id}`);
          var items = await mainPage.$$(".id");
          for (let i = 0; i < items.length; i++) {
            let linkText = await items[i].$("a");
            let problemId = await linkText.evaluate((el) => el.innerText);
            newProblemList.push({ id: problemId, testCases: [] });
          }
          break;
        case ATCODER:
          await mainPage.goto(`https://atcoder.jp/contests/${id}/tasks`);
          await mainPage.waitForSelector("tbody");
          const nodeChildren = await mainPage.$eval("tbody", (uiElement) => {
            return uiElement.children;
          });
          for (let i = 0; i < Object.keys(nodeChildren).length; i++)
            newProblemList.push({
              id: String.fromCharCode(i + 65),
              testCases: [],
            });
          break;
        case PRACTICE:
          newProblemList = [
            {
              id: "A",
              testCases: [],
            },
            {
              id: "B",
              testCases: [],
            },
            {
              id: "C",
              testCases: [],
            },
            {
              id: "D",
              testCases: [],
            },
          ];
          break;
        default:
          win.webContents.send("getLoginMessage", "Invalid platform!");
          return;
      }
    } catch (e) {
      win.webContents.send("getLoginMessage", "Error. Try again. " + e);
      return;
    }

    setState("problemList", newProblemList);
  }
  setState("contestId", id);
  change(undefined, 0, 0);
  if (state.website !== PRACTICE) {
    setInterval(() => {
      updateSubmissions();
    }, 5000);
    setInterval(() => {
      updateStandings();
    }, 5000);
  }
};

const change = async (event, problemId, langId) => {
  const problemName = state.problemList[problemId].id;
  const lang = state.config.languages[langId];
  let fileLoc = path.join(contestDir, `${problemName}.${lang.extension}`);
  if (!fs.existsSync(fileLoc)) {
    fs.readFile(
      `${path.join(settingsDir, lang.template)}`,
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
  if (state.problemList[problemId].testCases.length === 0) {
    let testCases = [];
    try {
      switch (state.website) {
        case CODEFORCES:
          await mainPage.goto(
            `https://codeforces.com/contest/${state.contestId}/problem/${problemName}`
          );
          if (!fs.existsSync(statementLoc)) {
            await mainPage.pdf({ path: statementLoc });
          }

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
          await mainPage.goto(
            `https://atcoder.jp/contests/${state.contestId}/tasks/${state.contestId}_${problemName}`
          );
          if (!fs.existsSync(statementLoc)) {
            await mainPage.pdf({ path: statementLoc });
          }
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
    let newProblemList = [...state.problemList];
    newProblemList[problemId].testCases = testCases;
    newProblemList[problemId].statement = statementLoc;
    setState("problemList", newProblemList);
  }
  setState("currentProblem", problemId);
  setState("currentLanguage", langId);
  addToLog(`Solving problem ${problemName} in ${lang.name}`);
  runCommand(`${state.config.editor} ${fileLoc}`);
};

const compile = async (event) => {
  const problemId = state.problemList[state.currentProblem].id;
  const lang = state.config.languages[state.currentLanguage];
  let fileLoc = path.join(contestDir, `${problemId}.${lang.extension}`);
  if (!lang.compiled) {
    addToLog("No need to compile.");
    sendNotif(0, "No need to compile.");
  } else {
    let command = "";
    if (lang.extension === "cpp")
      command = `${lang.compiler} ${lang.compileOptions} ${fileLoc} -o ${fileLoc}.exe`;
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
};

const run = async (event) => {
  const problemId = state.problemList[state.currentProblem].id;
  const lang = state.config.languages[state.currentLanguage];
  let fileLoc;
  if (lang.extension === "cpp") {
    fileLoc = path.join(contestDir, `${problemId}.${lang.extension}.exe`);
  } else {
    fileLoc = path.join(contestDir, `${problemId}.${lang.extension}`);
  }
  if (!fs.existsSync(fileLoc)) {
    addToLog("Executable not found.");
    return 0;
  } else {
    let command = `${lang.interpreter} ${fileLoc} ${lang.runOptions}`;
    console.log(command);
    clearTestCases();
    for (
      let i = 0;
      i < state.problemList[state.currentProblem].testCases.length;
      i++
    ) {
      const testCase =
        state.problemList[state.currentProblem].testCases[i].input;
      runCommand(
        command,
        testCase,
        5000,
        (err) => {
          let newProblemList = [...state.problemList];
          newProblemList[state.currentProblem].testCases[i].comments += err;
          setState("problemList", newProblemList);
        },
        (out) => {
          let newProblemList = [...state.problemList];
          newProblemList[state.currentProblem].testCases[i].result += out;
          setState("problemList", newProblemList);
        },
        (code, signal) => {
          let newProblemList = [...state.problemList];
          if (signal !== null) {
            newProblemList[state.currentProblem].testCases[i].verdict = "TLE";
          } else {
            newProblemList[state.currentProblem].testCases[i].verdict =
              areEqual(
                newProblemList[state.currentProblem].testCases[i].output,
                newProblemList[state.currentProblem].testCases[i].result
              );
          }
          setState("problemList", newProblemList);
        }
      );
    }
  }
};

const reset = async (event) => {
  const problemId = state.problemList[state.currentProblem].id;
  const lang = state.config.languages[state.currentLanguage];
  let fileLoc = path.join(contestDir, `${problemId}.${lang.extension}`);
  fs.readFile(
    `${path.join(settingsDir, lang.template)}`,
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
  sendNotif(0, "File cleared.");
  //Wont work in windows
};

const submit = async (event) => {
  const problemId = state.problemList[state.currentProblem].id;
  const lang = state.config.languages[state.currentLanguage];
  let fileLoc = path.join(contestDir, `${problemId}.${lang.extension}`);
  switch (state.website) {
    case CODEFORCES:
      await mainPage.goto(
        `https://codeforces.com/contest/${state.contestId}/submit/${problemId}`
      );
      await mainPage.select('select[name="programTypeId"]', lang.idCodeforces);
      var uploadButton = await mainPage.$("input[type=file]");
      await uploadButton.uploadFile(fileLoc);
      await mainPage.click("input[value=Submit");
      sendNotif(0, "Code submitted.");
      submittedOnce = true;
      break;
    case ATCODER:
      await mainPage.goto(
        `https://atcoder.jp/contests/${state.contestId}/tasks/${state.contestId}_${problemId}`
      );
      await mainPage.select('select[name="data.LanguageId"', lang.idAtcoder);
      const [fileChooser] = await Promise.all([
        mainPage.waitForFileChooser(),
        mainPage.click("#btn-open-file"),
      ]);
      await fileChooser.accept([fileLoc]);
      await mainPage.click("#submit");
      sendNotif(0, "Code submitted.");
      submittedOnce = true;
      break;
    default:
      addToLog("Invalid platform.");
      sendNotif(1, "Unable to submit. Try again.");
  }
};

const saveLayout = async (event, newLayout) => {
  let newConfig = { ...state.config };
  newConfig.layout = newLayout;
  setState("config", newConfig);
};

const clearLog = async (event) => {
  setState("log", "");
};

const changeTestCases = async (event, idx, box, text) => {
  let newProblemList = [...state.problemList];
  newProblemList[state.currentProblem].testCases[idx][box] = text;
  setState("problemList", newProblemList);
};

const changeConfig = (event, key, newVal) => {
  let newConfig = { ...state.config };
  newConfig[key] = newVal;
  setState("config", newConfig);
};

const changeLangConfig = (event, langId, key, newVal) => {
  let newConfig = { ...state.config };
  newConfig.languages[langId][key] = newVal;
  setState("config", newConfig);
};

const addNewLanguage = (event) => {
  console.log("Hi");
  let newConfig = { ...state.config };
  newConfig.languages.push({
    name: "Display name",
    extension: "",
    template: "Should be placed in extraResources/settings",
    compiled: 0,
    compiler: "",
    interpreter: "",
    compileOptions: "",
    runOptions: "",
    idAtcoder:
      "Inspect the select tag on dropdown while submitting on atcoder and find out the one needed",
    idCodeforces:
      "Inspect the select tag on dropdown while submitting on codeforces and find out the one needed",
  });
  setState("config", newConfig);
};

const addNewTestCase = async (event) => {
  let newProblemList = [...state.problemList];
  newProblemList[state.currentProblem].testCases.push({
    input: "",
    output: "",
    result: "",
    verdict: "",
    comments: "",
  });
  setState("problemList", newProblemList);
};

const deleteTestCase = async (event, idx) => {
  let newProblemList = [...state.problemList];
  newProblemList[state.currentProblem].testCases = [
    ...newProblemList[state.currentProblem].testCases.slice(0, idx),
    ...newProblemList[state.currentProblem].testCases.slice(idx + 1),
  ];
  setState("problemList", newProblemList);
};

const deleteLanguage = async (event, idx) => {
  let newConfig = { ...state.config };
  newConfig.languages = [
    ...newConfig.languages.slice(0, idx),
    ...newConfig.languages.slice(idx + 1),
  ];
  setState("config", newConfig);
};

const updateSubmissions = async () => {
  if (state.website && state.contestId && state.currentProblem !== null) {
    const newSubmissions = [];
    switch (state.website) {
      case CODEFORCES:
        await submissionPage.goto(
          `https://codeforces.com/contest/${state.contestId}/my`
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
          `https://atcoder.jp/contests/${state.contestId}/submissions/me`
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
    setState("submissions", newSubmissions);
  }
};

const updateStandings = async () => {
  if (state.website && state.contestId && state.problemList) {
    let newStandings = {};
    newStandings.solve = {};
    switch (state.website) {
      case CODEFORCES:
        await standingsPage.goto(
          `https://codeforces.com/contest/${state.contestId}/standings/friends/true`
        );
        await standingsPage.waitForSelector(`.standingsStatisticsRow`);
        const solveRow = await standingsPage.$(".standingsStatisticsRow");
        const counts = await solveRow.$$("td");
        for (let i = 0; i < state.problemList.length; i++) {
          newStandings.solve[state.problemList[i].id] = await counts[
            i + 4
          ].evaluate((val) => val.innerText);
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
          `https://atcoder.jp/contests/${state.contestId}/standings`
        );
        await standingsPage.waitForSelector("#standings-tbody");
        const table = await standingsPage.$("#standings-tbody");
        const solves = await table.$(".standings-statistics");
        const cells = await solves.$$("td");
        for (let i = 1; i < cells.length; i++) {
          newStandings.solve[state.problemList[i - 1].id] = await cells[
            i
          ].evaluate((val) => val.innerText);
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
    setState("standings", newStandings);
  }
};

app.on("ready", createWindow);
app.on("window-all-closed", closeWindow);
app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on("login", login);
ipcMain.on("start", start);
ipcMain.on("change", change);
ipcMain.on("compile", compile);
ipcMain.on("run", run);
ipcMain.on("reset", reset);
ipcMain.on("submit", submit);
ipcMain.on("saveLayout", saveLayout);
ipcMain.on("clearLog", clearLog);
ipcMain.on("changeTestCases", changeTestCases);
ipcMain.on("addNewTestCase", addNewTestCase);
ipcMain.on("deleteTestCase", deleteTestCase);
ipcMain.on("changeConfig", changeConfig);
ipcMain.on("changeLangConfig", changeLangConfig);
ipcMain.on("addNewLanguage", addNewLanguage);
ipcMain.on("deleteLanguage", deleteLanguage);
