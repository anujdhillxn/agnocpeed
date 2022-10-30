const { contextBridge, ipcRenderer } = require("electron");
const puppeteer = require("puppeteer");

const API = {
  login: (username, password, platform) =>
    ipcRenderer.send("login", username, password, platform),
  start: (id) => ipcRenderer.send("start", id),
  change: (problemId, lang) => ipcRenderer.send("change", problemId, lang),
  compile: () => ipcRenderer.send("compile"),
  run: () => ipcRenderer.send("run"),
  reset: () => ipcRenderer.send("reset"),
  submit: () => ipcRenderer.send("submit"),
  changeTestCases: (idx, box, text) =>
    ipcRenderer.send("changeTestCases", idx, box, text),
  addNewTestCase: () => ipcRenderer.send("addNewTestCase"),
  deleteTestCase: (idx) => ipcRenderer.send("deleteTestCase", idx),
  saveLayout: (newLayout) => ipcRenderer.send("saveLayout", newLayout),
  clearLog: () => ipcRenderer.send("clearLog"),
  changeConfig: (key, newVal) => ipcRenderer.send("changeConfig", key, newVal),
  changeLangConfig: (langId, key, newVal) =>
    ipcRenderer.send("changeLangConfig", langId, key, newVal),
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
};

contextBridge.exposeInMainWorld("api", API);
