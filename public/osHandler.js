const { filesDir } = require("./constants");
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
        const command = lang.compileCommand
            .replace(/{problemId}/g, problemId)
            .replace(/{contestDir}/g, contestDir);
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
        const command = lang.runCommand
            .replace(/{problemId}/g, problemId)
            .replace(/{contestDir}/g, contestDir);
        stateHandler.clearTestCases();

        for (let i = 0; i < problemList[currentProblem].testCases.length; i++) {
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
                    newProblemList[currentProblem].testCases[i].verdict = "TLE";
                    newProblemList[currentProblem].testCases[i].comments =
                        "Time Limit Exceeded.";
                } else {
                    newProblemList[currentProblem].testCases[i].verdict =
                        areEqual(
                            newProblemList[currentProblem].testCases[i].output,
                            newProblemList[currentProblem].testCases[i].result
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
        fs.readFile(lang.template, { encoding: "utf-8" }, function (err, data) {
            if (!err) {
                fs.writeFile(`${fileLoc}`, data, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });
            } else {
                console.log(err);
            }
        });
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
