const { contextBridge, ipcRenderer } = require("electron");
const puppeteer = require('puppeteer');



const API = {
    INITIAL_STATE: {
        submissions: [],
        problemList: [],
        problemDetails: null, //JSON
        currentProblem: null, //number
        serverMessage: "",
        language: 0,
        browserReady: false,
        contestReady: false,
    },
    login: (username, password, platform) => ipcRenderer.invoke("login", username, password, platform),
    start: (id) => ipcRenderer.invoke("start", id)
}

contextBridge.exposeInMainWorld("api", API);