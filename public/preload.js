const { contextBridge, ipcRenderer } = require("electron");

const API = {
    clearCookies: () => ipcRenderer.send("clearCookies"),
    login: (username, password, platform) =>
        ipcRenderer.send("login", username, password, platform),
    start: (id) => ipcRenderer.send("start", id),
    change: (problemId, lang) => ipcRenderer.send("change", problemId, lang),
    compile: (problemIdx, langIdx) =>
        ipcRenderer.send("compile", problemIdx, langIdx),
    run: (problemIdx, langIdx) => ipcRenderer.send("run", problemIdx, langIdx),
    reset: (problemIdx, langIdx) =>
        ipcRenderer.send("reset", problemIdx, langIdx),
    submit: (problemIdx, langIdx) =>
        ipcRenderer.send("submit", problemIdx, langIdx),
    changeTestCases: (problemIdx, idx, box, text) =>
        ipcRenderer.send("changeTestCases", problemIdx, idx, box, text),
    addNewTestCase: (problemIdx) =>
        ipcRenderer.send("addNewTestCase", problemIdx),
    deleteTestCase: (problemIdx, idx) =>
        ipcRenderer.send("deleteTestCase", problemIdx, idx),
    saveLayout: (newLayout) => ipcRenderer.send("saveLayout", newLayout),
    clearLog: () => ipcRenderer.send("clearLog"),
    changeConfig: (key, newVal) =>
        ipcRenderer.send("changeConfig", key, newVal),
    changeLangConfig: (langId, key, newVal) =>
        ipcRenderer.send("changeLangConfig", langId, key, newVal),
    screencastInteract: (data) => ipcRenderer.send("screencastInteract", data),
    notif: (callback) =>
        ipcRenderer.on("notif", (event, args) => {
            callback(args);
        }),
    addNewLanguage: () => ipcRenderer.send("addNewLanguage"),
    deleteLanguage: (idx) => ipcRenderer.send("deleteLanguage", idx),
    getLoginMessage: (callback) =>
        ipcRenderer.on("getLoginMessage", (event, args) => {
            callback(args);
        }),
    getState: (callback) =>
        ipcRenderer.on("getState", (event, args) => {
            callback(args);
        }),
    getScreencast: (callback) =>
        ipcRenderer.on("getScreencast", (event, args) => {
            callback(args);
        }),
};

contextBridge.exposeInMainWorld("api", API);
