const { configPath, settingsDir } = require("./constants");
const path = require("path");
const fs = require("fs");
const { getColor, playSound } = require("./functions");

const getStateHandler = () => {
    let state;
    let commHandler;

    const initialize = (initialState, _commHandler) => {
        state = initialState;
        fs.readFile(configPath, "utf8", async function (err, data) {
            if (err) throw err;
            state.config = JSON.parse(data);
        });
        commHandler = _commHandler;
    };

    const get = () => state;

    const set = (key, newVal) => {
        if (state[key] === newVal) {
            return;
        }
        if (key === "submissions") {
            alertNewSubmissionResult(newVal);
        }
        state[key] = newVal;
        commHandler.updateUIState(state);
    };

    const clearTestCases = () => {
        for (
            let i = 0;
            i < state.problemList[state.currentProblem].testCases.length;
            i++
        ) {
            state.problemList[state.currentProblem].testCases[i].result = "";
            state.problemList[state.currentProblem].testCases[i].verdict = "";
            state.problemList[state.currentProblem].testCases[i].comments = "";
        }
        commHandler.updateUIState(state);
    };

    const writeConfig = () => {
        const jsonConfig = JSON.stringify(state.config);
        fs.writeFile(configPath, jsonConfig, function (err) {
            if (err) {
                console.log(err);
            }
        });
    };

    const alertNewSubmissionResult = (newVal) => {
        //TODO: don't alert without submission
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
    };

    const addToLog = (message) => {
        state.log = message + "\n" + state.log;
        commHandler.updateUIState(state);
    };

    const saveLayout = (newLayout) => {
        state.config.layout = newLayout;
        writeConfig(state.config);
    };

    const clearLog = () => {
        state.log = "";
        commHandler.updateUIState(state);
    };

    const changeTestCases = (idx, box, text) => {
        state.problemList[state.currentProblem].testCases[idx][box] = text;
        commHandler.updateUIState(state);
    };

    const addTestCase = () => {
        state.problemList[state.currentProblem].testCases.push({
            input: "",
            output: "",
            result: "",
            verdict: "",
            comments: "",
        });
        commHandler.updateUIState(state);
    };

    const deleteTestCase = (idx) => {
        state.problemList[state.currentProblem].testCases = [
            ...state.problemList[state.currentProblem].testCases.slice(0, idx),
            ...state.problemList[state.currentProblem].testCases.slice(idx + 1),
        ];
        commHandler.updateUIState(state);
    };

    const changeConfig = (key, newVal) => {
        state.config[key] = newVal;
        writeConfig();
        commHandler.updateUIState(state);
    };

    const changeLangConfig = (langId, key, newVal) => {
        state.config.languages[langId][key] = newVal;
        writeConfig();
        commHandler.updateUIState(state);
    };

    const addLang = () => {
        state.config.languages.push({
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
        writeConfig();
        commHandler.updateUIState(state);
    };

    const deleteLang = (idx) => {
        state.config.languages = [
            ...state.config.languages.slice(0, idx),
            ...state.config.languages.slice(idx + 1),
        ];
        writeConfig();
        commHandler.updateUIState(state);
    };

    const setProblem = (idx, testCases) => {
        state.problemList[idx].testCases = testCases;
    };

    const setCurrentProblem = (problemId) => {
        state.currentProblem = problemId;
    };

    const setCurrentLanguage = (langId) => {
        state.currentLanguage = langId;
    };

    return {
        initialize,
        get,
        set,
        clearTestCases,
        addToLog,
        saveLayout,
        clearLog,
        changeTestCases,
        addTestCase,
        deleteTestCase,
        changeConfig,
        changeLangConfig,
        addLang,
        deleteLang,
        setProblem,
        setCurrentProblem,
        setCurrentLanguage,
    };
};

module.exports = {
    getStateHandler,
};
