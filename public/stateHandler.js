const { configPath, settingsDir } = require("./constants");
const path = require("path");
const fs = require("fs");
const { getColor, playSound } = require("./functions");

const getStateHandler = () => {
    let state;
    let commHandler;

    const initialize = (initialState, _commHandler) => {
        state = initialState;
        state.config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        commHandler = _commHandler;
        commHandler.updateUIState(state);
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

    const clearTestCases = (problemIdx) => {
        for (
            let i = 0;
            i < state.problemList[problemIdx].testCases.length;
            i++
        ) {
            state.problemList[problemIdx].testCases[i].result = "";
            state.problemList[problemIdx].testCases[i].verdict = "";
            state.problemList[problemIdx].testCases[i].comments = "";
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

    const changeTestCases = (problemIdx, idx, box, text) => {
        state.problemList[problemIdx].testCases[idx][box] = text;
        commHandler.updateUIState(state);
    };

    const addTestCase = (problemIdx, testCaseToAdd) => {
        const testCase = testCaseToAdd
            ? testCaseToAdd
            : {
                  input: "",
                  output: "",
                  result: "",
                  verdict: "",
                  comments: "",
              };
        state.problemList[problemIdx].testCases.push(testCase);
        commHandler.updateUIState(state);
    };

    const deleteTestCase = (problemIdx, idx) => {
        state.problemList[problemIdx].testCases = [
            ...state.problemList[problemIdx].testCases.slice(0, idx),
            ...state.problemList[problemIdx].testCases.slice(idx + 1),
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
            name: "C++",
            extension: "",
            template:
                "https://raw.githubusercontent.com/anujdhillxn/CompetitiveProgramming_Boilerplate/master/template.cpp",
            compileCommand:
                "g++ {contestDir}\\{problemId}.cpp -o {contestDir}\\{problemId}.exe",
            runCommand: "{contestDir}\\{problemId}.exe",
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
    };
};

module.exports = {
    getStateHandler,
};
