const { contextBridge, ipcRenderer } = require("electron");
const puppeteer = require('puppeteer');

const API = {
    login: (username, password, platform) => ipcRenderer.send("login", username, password, platform),
    start: (id) => ipcRenderer.send("start", id),
    change: (problemId, lang) => ipcRenderer.send("change", problemId, lang),
    compile: (problemId, lang) => ipcRenderer.send("compile", problemId, lang),
    run: (problemId, lang) => ipcRenderer.send("run", problemId, lang),
    reset: (problemId, lang) => ipcRenderer.send("reset", problemId, lang),
    submit: (problemId, lang) => ipcRenderer.send("submit", problemId, lang),
    saveLayout: (newLayout) => ipcRenderer.send("saveLayout", newLayout),
    getLoginMessage: (callback) => ipcRenderer.on("getLoginMessage", (event, args) => {
        callback(args);
    }),
    getWebsite: (callback) => ipcRenderer.on("getWebsite", (event, args) => {
        callback(args);
    }),
    getContestId: (callback) => ipcRenderer.on("getContestId", (event, args) => {
        callback(args);
    }),
    getCurrentProblem: (callback) => ipcRenderer.on("getCurrentProblem", (event, args) => {
        callback(args);
    }),
    getProblemList: (callback) => ipcRenderer.on("getProblemList", (event, args) => {
        callback(args);
    }),
    getProblemDetails: (callback) => ipcRenderer.on("getProblemDetails", (event, args) => {
        callback(args);
    }),
    getLog: (callback) => ipcRenderer.on("getLog", (event, args) => {
        callback(args);
    }),
    notif: (callback) => ipcRenderer.on("notif", (event, args) => {
        callback(args);
    }),
    getConfig: (callback) => ipcRenderer.on("getConfig", (event, args) => {
        callback(args);
    }),

}

contextBridge.exposeInMainWorld("api", API);