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

    const addTestCase = (testCaseToAdd) => {
        const testCase = testCaseToAdd
            ? testCaseToAdd
            : {
                  input: "",
                  output: "",
                  result: "",
                  verdict: "",
                  comments: "",
              };
        state.problemList[state.currentProblem].testCases.push(testCase);
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

    const setCurrentProblem = (problemId) => {
        state.currentProblem = problemId;
        commHandler.updateUIState(state);
    };

    const setCurrentLanguage = (langId) => {
        state.currentLanguage = langId;
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
        setCurrentProblem,
        setCurrentLanguage,
    };
};

module.exports = {
    getStateHandler,
};
