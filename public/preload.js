const { contextBridge } = require("electron");
const API = {
    hi: "hi"
}

contextBridge.exposeInMainWorld("api", API);