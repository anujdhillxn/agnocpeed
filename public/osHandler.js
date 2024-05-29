const { filesDir, settingsDir } = require("./constants");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const { areEqual } = require("./functions");

const getOsHandler = () => {
    let commHandler;
    let stateHandler;
    const initialize = (_commHandler, _stateHandler) => {
        commHandler = _commHandler;
        stateHandler = _stateHandler;
    };

    const runCommand = (
        command,
        input = "",
        timeout = 0,
        err = (data) => {},
        out = (data) => {},
        close = (code, signal) => {}
    ) => {
        const res = exec(command, {
            encoding: "utf8",
            timeout: timeout,
            killSignal: "SIGINT",
        });
        res.stdin.write(input);
        res.stdin.end();
        res.stderr.on("data", (data) => {
            stateHandler.addToLog(data);
            err(data);
        });
        res.stdout.on("data", (data) => {
            stateHandler.addToLog(data);
            out(data);
        });
        res.on("close", (code, signal) => {
            close(code, signal);
        });
        //TODO: Handle run Command properly.
    };

    const compile = () => {
        const {
            problemList,
            config,
            website,
            contestId,
            currentProblem,
            currentLanguage,
        } = stateHandler.get();
        const contestDir = path.join(filesDir, `${website}_${contestId}`);
        const problemId = problemList[currentProblem].id;
        const lang = config.languages[currentLanguage];
        let fileLoc = path.join(contestDir, `${problemId}.${lang.extension}`);
        if (!lang.compiled) {
            stateHandler.addToLog("No need to compile.");
            commHandler.sendNotif(0, "No need to compile.");
        } else {
            let command = "";
            if (lang.extension === "cpp")
                command = `${lang.compiler} ${lang.compileOptions} ${fileLoc} -o ${fileLoc}.exe`;
            runCommand(
                command,
                "",
                0,
                (data) => {
                    commHandler.sendNotif(
                        1,
                        "Compilation failed. Check the log for errors."
                    );
                },
                (data) => {},
                (code) => {
                    if (code === 0)
                        commHandler.sendNotif(0, "Compiled successfully.");
                }
            );
        }
    };

    const run = () => {
        const {
            problemList,
            config,
            contestId,
            website,
            currentLanguage,
            currentProblem,
        } = stateHandler.get();
        const problemId = problemList[currentProblem].id;
        const lang = config.languages[currentLanguage];
        const contestDir = path.join(filesDir, `${website}_${contestId}`);
        let fileLoc;
        if (lang.extension === "cpp") {
            fileLoc = path.join(
                contestDir,
                `${problemId}.${lang.extension}.exe`
            );
        } else {
            fileLoc = path.join(contestDir, `${problemId}.${lang.extension}`);
        }
        if (!fs.existsSync(fileLoc)) {
            stateHandler.addToLog("Executable not found.");
            return 0;
        } else {
            let command = `${lang.interpreter} ${fileLoc} ${lang.runOptions}`;
            stateHandler.clearTestCases();

            for (
                let i = 0;
                i < problemList[currentProblem].testCases.length;
                i++
            ) {
                // eslint-disable-next-line no-loop-func
                const errHandler = (err) => {
                    let newProblemList = [...problemList];
                    newProblemList[currentProblem].testCases[i].comments += err;
                    stateHandler.set("problemList", newProblemList);
                };

                // eslint-disable-next-line no-loop-func
                const outHandler = (out) => {
                    let newProblemList = [...problemList];
                    newProblemList[currentProblem].testCases[i].result += out;
                    stateHandler.set("problemList", newProblemList);
                };

                // eslint-disable-next-line no-loop-func
                const close = (code, signal) => {
                    let newProblemList = [...problemList];
                    if (signal !== null) {
                        newProblemList[currentProblem].testCases[i].verdict =
                            "TLE";
                        newProblemList[currentProblem].testCases[i].comments =
                            "Time Limit Exceeded.";
                    } else {
                        newProblemList[currentProblem].testCases[i].verdict =
                            areEqual(
                                newProblemList[currentProblem].testCases[i]
                                    .output,
                                newProblemList[currentProblem].testCases[i]
                                    .result
                            );
                    }
                    stateHandler.set("problemList", newProblemList);
                };

                const testCase = problemList[currentProblem].testCases[i].input;
                runCommand(
                    command,
                    testCase,
                    Number(config.timeLimit) * 1000,
                    errHandler,
                    outHandler,
                    close
                );
            }
        }
    };

    const reset = () => {
        const {
            problemList,
            config,
            website,
            contestId,
            currentLanguage,
            currentProblem,
        } = stateHandler.get();
        const problemId = problemList[currentProblem].id;
        const lang = config.languages[currentLanguage];
        const contestDir = path.join(filesDir, `${website}_${contestId}`);
        let fileLoc = path.join(contestDir, `${problemId}.${lang.extension}`);
        fs.readFile(
            `${path.join(settingsDir, lang.template)}`,
            { encoding: "utf-8" },
            function (err, data) {
                if (!err) {
                    fs.writeFile(`${fileLoc}`, data, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                    });
                } else {
                    console.log(err);
                }
            }
        );
        commHandler.sendNotif(0, "File cleared.");
        //Wont work in windows
    };

    return {
        initialize,
        compile,
        run,
        reset,
    };
};

module.exports = {
    getOsHandler,
};
