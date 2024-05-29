const path = require("path");
const isDev = require("electron-is-dev");
console.log(isDev, __dirname);
const filesDir = isDev
    ? path.join(__dirname, "../extraResources/files")
    : path.join(process.resourcesPath, "extraResources/files");
const settingsDir = isDev
    ? path.join(__dirname, "../extraResources/settings")
    : path.join(process.resourcesPath, "extraResources/settings");
const configPath = path.join(settingsDir, "config.json");

module.exports = {
    ATCODER: "atcoder",
    CODEFORCES: "codeforces",
    CODECHEF: "codechef",
    PRACTICE: "practice",
    INITIAL_STATE: {
        website: null,
        contestId: null,
        problemList: [],
        currentProblem: null,
        currentLanguage: 0,
        submissions: [],
        standings: null,
        log: "",
        config: null,
        futureContests: [],
        submittedOnce: false,
    },
    filesDir,
    settingsDir,
    configPath,
};
