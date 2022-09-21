const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawnSync, spawn, exec } = require('child_process');
const isDev = require('electron-is-dev');
const puppeteer = require('puppeteer');

const ATCODER = "atcoder";
const CODEFORCES = "codeforces";
const PRACTICE = "practice";
const CODECHEF = "codechef";

require('@electron/remote/main').initialize();

let browser = null;
let page = null;
let website = null;
let contestId = null;
let contestDir = null;
let problemList = [];
let problemDetails = {};
let currentProblem = null;
let submissions = [];
let log = "";
let filesDir = isDev ? path.join(__dirname, "../extraResources/files") : path.join(process.resourcesPath, 'files');
let boilerplate = isDev ? path.join(__dirname, "../extraResources/templates") : path.join(process.resourcesPath, 'templates');
let configPath = isDev ? path.join(__dirname, "../extraResources/config.json") : path.join(process.resourcesPath, 'config.json');
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
    win.webContents.send("getProblemList", problemList)
}

function setSubmissions(newVal) {

    if (newVal == submissions) return;
    submissions = newVal;
    win.webContents.send("getSubmissions", submissions);
}

function setLog(newVal) {

    if (newVal == log) return;
    log = newVal;
    win.webContents.send("getLog", log);
}

function setConfig(newVal) {
    if (newVal == config) return;
    config = newVal;
    win.webContents.send("getConfig", config);
    const jsonConfig = JSON.stringify(config);
    fs.writeFile(configPath, jsonConfig, function (err) {
        if (err) {
            console.log(err);
        }
    });
}

function getChromiumExecPath() {
    return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
}

async function init() {
    browser = await puppeteer.launch({ executablePath: getChromiumExecPath(), headless: true });
    page = await browser.newPage();
}

function sendNotif(type, message) {
    win.webContents.send("notif", { message: message, danger: type });
}

function areEqual(s1, s2) {
    s1.replace(/\n/g, " ");
    s2.replace(/\n/g, " ");
    return s1 === s2 ? "AC" : "WA";
}

function addToLog(message) {
    setLog(message + '\n' + log);
}

function runCommand(command, input = "", timeout = 0, err = (data) => { }, out = (data) => { }, close = (data) => { }) {
    const res = exec(command, { encoding: 'utf8', input: input, timeout: timeout });
    res.stderr.on('data', (data) => {
        err(data);
    })
    res.stdout.on('data', (data) => {
        out(data);
    })
    res.on('close', (code) => {
        close(code);
    })

    //TODO: Handle run Command properly.
}

function createWindow() {
    if (!fs.existsSync(filesDir))
        exec(`mkdir ${filesDir}`);
    init();
    fs.readFile(configPath, 'utf8', function (err, data) {
        if (err) throw err;
        setConfig(JSON.parse(data));
    });
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            enableRemoteModule: true,
        }
    })
    win.loadURL(isDev ? 'http://localhost:3000'
        : `file://${path.join(__dirname, './index.html')}`
    )
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.on("login", async (event, username, password, platform) => {
    switch (platform) {
        case CODEFORCES:

            win.webContents.send("getLoginMessage", "Opening Website...");
            try {
                (await page).goto("https://codeforces.com/enter?back=%2F");
                await page.waitForSelector("#handleOrEmail");
            }
            catch (e) {
                win.webContents.send("getLoginMessage", "Unable to open website. " + e);
                return;
            }

            win.webContents.send("getLoginMessage", "Validating credentials...");
            try {

                await page.type("#handleOrEmail", username);
                await page.type("#password", password);
                await page.click('input[type=submit]');
                await page.waitForXPath('//*[contains(text(), "Logout")]');
                win.webContents.send("getLoginMessage", "Login successful.");
            }
            catch (e) {
                win.webContents.send("getLoginMessage", "Login failed. " + e);
                return;
            }

            break;
        case ATCODER:

            win.webContents.send("getLoginMessage", "Opening Website...");
            try {
                (await page).goto("https://atcoder.jp/login?continue=https%3A%2F%2Fatcoder.jp%2F");
                await page.waitForSelector("#username");
            }
            catch (e) {
                win.webContents.send("getLoginMessage", "Unable to open website. " + e);
                return;
            }

            win.webContents.send("getLoginMessage", "Validating credentials...");
            try {
                await page.type("#username", username);
                await page.type("#password", password);
                await page.click("#submit");
                await page.waitForXPath('//*[contains(text(), "Sign Out")]');
                win.webContents.send("getLoginMessage", "Login successful.");

            }
            catch (e) {
                win.webContents.send("getLoginMessage", "Login failed. " + e);
                return;
            }

            break;
        case CODECHEF:
            win.webContents.send("getLoginMessage", "The support for this platform is not available, yet.");
            return;
        case PRACTICE:
            win.webContents.send("getLoginMessage", "Choose name of practice session.");
            break;
        default:
            win.webContents.send("getLoginMessage", "Invalid platform.");
            return;
    }
    setWebsite(platform);
});

ipcMain.on("start", async (event, id) => {
    fs.readFile(configPath, 'utf8', function (err, data) {
        if (err) throw err;
        setConfig(JSON.parse(data));
    });
    if (website == null) {
        win.webContents.send("getLoginMessage", "Select a platform first!");
        return;
    }
    else {
        contestDir = path.join(filesDir, `${website}_${id}`);
        let testcases = path.join(contestDir, "testcases.json");
        if (!fs.existsSync(contestDir)) {
            runCommand(`mkdir ${contestDir}`);
            runCommand(`echo "{}" > ${testcases}`);
        }
        fs.readFile(testcases, 'utf8', function (err, data) {
            if (err) throw err;
            problemDetails = JSON.parse(data);
        });
        setProblemList([]);
        win.webContents.send("getLoginMessage", "Collecting tasks...");
        try {
            switch (website) {
                case CODEFORCES:
                    await page.goto(`https://codeforces.com/contest/${id}`);
                    var items = await page.$$('.id');
                    for (let i = 0; i < items.length; i++) {
                        let linkText = await items[i].$('a');
                        let problemId = await linkText.evaluate(el => el.innerText);
                        setProblemList([...problemList, problemId]);
                    }
                    break;
                case ATCODER:
                    await page.goto(`https://atcoder.jp/contests/${id}/tasks`);
                    await page.waitForSelector('tbody');
                    const nodeChildren = await page.$eval('tbody', (uiElement) => {
                        return uiElement.children;
                    });
                    for (let i = 0; i < Object.keys(nodeChildren).length; i++) setProblemList([...problemList, String.fromCharCode(i + 65)]);
                    break;
                case PRACTICE:
                    setProblemList(['A', 'B', 'C', 'D']);
                    for (const p in problemList) {
                        setProblemDetails({
                            ...problemDetails,
                            [p]: {
                                testcases: [{
                                    input: "", output: "",
                                    result: "", verdict: "", comments: ""
                                }]
                            }
                        });
                    }
                    break;
                default:
                    win.webContents.send("getLoginMessage", "Invalid platform!");
                    return;
            }
        }
        catch (e) {
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
        runCommand(`cp ${path.join(boilerplate, config.languages[lang].template)} ${fileLoc}`);
    }
    runCommand(`${config.editor} -g --goto ${fileLoc}:44:4`);
    let testCases = [];
    if (!problemDetails.hasOwnProperty(problemName) || problemDetails[problemName]["testCases"].length === 0) {

        try {
            switch (website) {
                case CODEFORCES:
                    await page.goto(`https://codeforces.com/contest/${contestId}/problem/${problemName}`);

                    inputTexts = await page.$$('.input');
                    outputTexts = await page.$$('.output');
                    for (let i = 0; i < inputTexts.length; i++) {
                        let input = await inputTexts[i].$eval('pre', el => el.innerText);
                        let output = await outputTexts[i].$eval('pre', el => el.innerText);
                        testCases.push({ input: input, output: output, result: "", verdict: "", comments: "" });
                    }
                    setProblemDetails({ ...problemDetails, [problemName]: { testCases: testCases } });
                    break;

                case ATCODER:
                    await page.goto(`https://atcoder.jp/contests/${contestId}/tasks/${contestId}_${problemName}`);
                    let count = 0, started = false, index = 0, toInput = true;
                    while (count < 50) {
                        try {
                            let data = await page.$eval(`#pre-sample${count}`, el => el.textContent);
                            console.log(count, data);
                            if (toInput) {
                                testCases.push({
                                    input: "", output: "",
                                    result: "", verdict: "", comments: ""
                                });
                                testCases[index].input = data;
                                toInput = false;
                            }
                            else {
                                testCases[index].output = data;
                                index++;
                                toInput = true;
                            }
                            started = true;
                        }
                        catch (e) {
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

        }
        catch (e) {
            addToLog("Error fetching test cases. Try again. " + e);
            return;
        }
    }
    const statementLoc = path.join(contestDir, `${problemName}.pdf`);
    if (!fs.existsSync(statementLoc)) {
        await page.goto(`https://atcoder.jp/contests/${contestId}/tasks/${contestId}_${problemName}`);
        await page.pdf({ path: statementLoc, format: 'A4' });
    }
    setProblemDetails({ ...problemDetails, [problemName]: { testCases: testCases, problemStatement: statementLoc } });
    setCurrentProblem(problemId);
    addToLog(`Solving problem ${problemName}`);

});

ipcMain.on("compile", async (event, problemId, lang) => {
    let fileLoc = path.join(contestDir, `${problemId}.${lang}`);
    if (!config.languages[lang].compiled) {
        addToLog("No need to compile.");
        sendNotif(0, "No need to compile.");
    }
    else {
        let command = "";
        if (lang === "cpp")
            command = config.languages[lang].compileOptions + ` ${fileLoc} -o ${fileLoc}.exe`
        runCommand(command, "", 0, (data) => { addToLog(data); sendNotif(1, "Compilation failed. Check the log for errors.") }, (data) => { }, (code) => {
            if (code == 0)
                sendNotif(0, "Compiled successfully.");
        });
    }
})

ipcMain.on("run", async (event, problemId, lang) => {
    let fileLoc;
    if (lang === "cpp") {
        fileLoc = path.join(contestDir, `${problemId}.${lang}.exe`);
    }
    else {
        fileLoc = path.join(contestDir, `${problemId}.${lang}`);
    }
    if (!fs.existsSync(fileLoc)) {
        addToLog("Executable not found.");
        return 0;
    }
    else {
        let command = config.languages[lang].runOptions + `${fileLoc}`;
        for (let i = 0; i < problemDetails[problemId].testCases.length; i++) {
            const testCase = problemDetails[problemId].testCases[i].input;
            runCommand(command, testCase, 5, (err) => {
                let newDetails = { ...problemDetails };
                newDetails[problemId].testCases[i].comments = err;
                setProblemDetails(newDetails);
            }, (out) => {
                let newDetails = { ...problemDetails };
                newDetails[problemId].testCases[i].result = out;
                setProblemDetails(newDetails);
            }, (code) => {
                console.log(code);
                sendNotif(0, "Execution Complete");
                let newDetails = { ...problemDetails };
                newDetails[problemId].testCases[i].verdict = code;
                setProblemDetails(newDetails);
            });
        }
    }
})

ipcMain.on("reset", async (event, problemId, lang) => {
    let fileLoc = path.join(contestDir, `${problemId}.${lang}`);
    runCommand(`cp ${path.join(boilerplate, config.languages[lang].template)} ${fileLoc}`);
    sendNotif(0, "File cleared.");
})

ipcMain.on("submit", async (event, problemId, lang) => {
    let fileLoc = path.join(contestDir, `${problemId}.${lang}`);
    switch (website) {
        case CODEFORCES:
            await page.goto(`https://codeforces.com/contest/${contestId}/submit/${problemId}`);
            if (lang === "cpp")
                await page.select('select[name="programTypeId"]', '73');
            else
                await page.select('select[name="programTypeId"]', '70');
            var uploadButton = await page.$("input[type=file]");
            await uploadButton.uploadFile(fileLoc);
            await page.click("input[value=Submit");
            sendNotif(0, "Code submitted.");
            break;
        case ATCODER:
            await page.goto(`https://atcoder.jp/contests/${contestId}/tasks/${contestId}_${problemId}`);
            if (lang === "cpp")
                await page.select('select[name="data.LanguageId"', '4003');
            else
                await page.select('select[name="data.LanguageId"', '4006');
            const [fileChooser] = await Promise.all([
                page.waitForFileChooser(),
                page.click('#btn-open-file'),
            ]);
            await fileChooser.accept([fileLoc]);
            await page.click("#submit");
            sendNotif(0, "Code submitted.");
            break;
        default:
            addToLog("Invalid platform.");
            sendNotif(1, "Unable to submit. Try again.");
    }
});

ipcMain.on("saveLayout", async (event, newLayout) => {
    console.log(newLayout);
    let newConfig = { ...config };
    newConfig.layout = newLayout;
    setConfig(newConfig);
    sendNotif(0, "Layout saved.");
})