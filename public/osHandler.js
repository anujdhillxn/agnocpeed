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

    const compile = (problemIdx, languageIdx) => {
        const { problemList, config, website, contestId } = stateHandler.get();
        const contestDir = path.join(filesDir, `${website}_${contestId}`);
        const problemId = problemList[problemIdx].id;
        const lang = config.languages[languageIdx];
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

    const run = (problemIdx, languageIdx) => {
        const { problemList, config, contestId, website } = stateHandler.get();
        const problemId = problemList[problemIdx].id;
        const lang = config.languages[languageIdx];
        const contestDir = path.join(filesDir, `${website}_${contestId}`);
        const command = lang.runCommand
            .replace(/{problemId}/g, problemId)
            .replace(/{contestDir}/g, contestDir);
        stateHandler.clearTestCases(problemIdx);

        for (let i = 0; i < problemList[problemIdx].testCases.length; i++) {
            // eslint-disable-next-line no-loop-func
            const errHandler = (err) => {
                let newProblemList = [...problemList];
                newProblemList[problemIdx].testCases[i].comments += err;
                stateHandler.set("problemList", newProblemList);
            };

            // eslint-disable-next-line no-loop-func
            const outHandler = (out) => {
                let newProblemList = [...problemList];
                newProblemList[problemIdx].testCases[i].result += out;
                stateHandler.set("problemList", newProblemList);
            };

            // eslint-disable-next-line no-loop-func
            const close = (code, signal) => {
                let newProblemList = [...problemList];
                if (signal !== null) {
                    newProblemList[problemIdx].testCases[i].verdict = "TLE";
                    newProblemList[problemIdx].testCases[i].comments =
                        "Time Limit Exceeded.";
                } else {
                    newProblemList[problemIdx].testCases[i].verdict = areEqual(
                        newProblemList[problemIdx].testCases[i].output,
                        newProblemList[problemIdx].testCases[i].result
                    );
                }
                stateHandler.set("problemList", newProblemList);
            };

            const testCase = problemList[problemIdx].testCases[i].input;
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

    const reset = (problemIdx, languageIdx) => {
        const { problemList, config, website, contestId } = stateHandler.get();
        const problemId = problemList[problemIdx].id;
        const lang = config.languages[languageIdx];
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
