const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const isDev = require("electron-is-dev");
const { runCommandSync } = require("./functions");
const { filesDir, INITIAL_STATE } = require("./constants");
const { getStateHandler } = require("./stateHandler");
const { getCommHandler } = require("./commHandler");
const { getOsHandler } = require("./osHandler");
const { getBrowserHandler } = require("./browserHandler");
const stateHandler = getStateHandler();
const commHandler = getCommHandler();
const osHandler = getOsHandler();
const browserHandler = getBrowserHandler();

require("@electron/remote/main").initialize();

async function init() {
    const win = new BrowserWindow({
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
    commHandler.initialize(win);
    stateHandler.initialize(INITIAL_STATE, commHandler);
    browserHandler.initialize(commHandler, stateHandler);
    osHandler.initialize(commHandler, stateHandler);
    browserHandler.getFutureContests();
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

const clearCookies = () => {};

app.on("ready", createWindow);
app.on("window-all-closed", closeWindow);
app.on("activate", function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on("clearCookies", clearCookies);
ipcMain.on("login", (event, platform) => {
    browserHandler.login(platform);
});
ipcMain.on("start", (event, id) => {
    browserHandler.startContest(id);
});
ipcMain.on("change", (event, problemId, langId) => {
    browserHandler.change(problemId, langId);
});
ipcMain.on("compile", (event) => {
    osHandler.compile();
});
ipcMain.on("run", (event) => {
    osHandler.run();
});
ipcMain.on("reset", (event) => {
    osHandler.reset();
});
ipcMain.on("submit", (event) => {
    browserHandler.submit();
});
ipcMain.on("saveLayout", (event, newLayout) => {
    stateHandler.saveLayout(newLayout);
});
ipcMain.on("clearLog", (event) => {
    stateHandler.clearLog();
});
ipcMain.on("changeTestCases", (event, idx, box, text) => {
    stateHandler.changeTestCases(idx, box, text);
});
ipcMain.on("addNewTestCase", (event) => {
    stateHandler.addTestCase();
});
ipcMain.on("deleteTestCase", (event, idx) => {
    stateHandler.deleteTestCase();
});
ipcMain.on("changeConfig", (event, key, newVal) => {
    stateHandler.changeConfig(key, newVal);
});
ipcMain.on("changeLangConfig", (event, langId, key, newVal) => {
    stateHandler.changeLangConfig(langId, key, newVal);
});
ipcMain.on("addNewLanguage", (event) => {
    stateHandler.addLang();
});
ipcMain.on("deleteLanguage", (event, idx) => {
    stateHandler.deleteLang(idx);
});
