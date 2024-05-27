const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const {
    PRACTICE,
    CODEFORCES,
    ATCODER,
    CODECHEF,
    filesDir,
    settingsDir,
} = require("./constants");
const { getChromiumExecPath, runCommandSync } = require("./functions");

const getBrowserHandler = () => {
    let browser;
    let standingsStartedUpdating = false;
    let commHandler;
    let stateHandler;

    const initialize = (_commHandler, _stateHandler) => {
        commHandler = _commHandler;
        stateHandler = _stateHandler;
    };

    const login = async (platform) => {
        if (browser) await browser.close();
        if (platform === PRACTICE) {
            commHandler.setLoginMessage("Choose name of practice session.");
            stateHandler.set("website", platform);
            return;
        }
        browser = await puppeteer.launch({
            executablePath: getChromiumExecPath(),
            headless: false,
        });
        const [mainPage] = await browser.pages();
        switch (platform) {
            case CODEFORCES:
                await mainPage.goto("https://codeforces.com/enter?back=%2F");
                commHandler.setLoginMessage(
                    "Enter contest ID after you have logged in. You can choose to not login as well."
                );
                break;
            case ATCODER:
                await mainPage.goto(
                    "https://atcoder.jp/login?continue=https%3A%2F%2Fatcoder.jp%2F"
                );
                commHandler.setLoginMessage(
                    "Enter contest ID after you have logged in. You can choose to not login as well."
                );
                break;
            case CODECHEF:
                commHandler.setLoginMessage(
                    "The support for this platform is not available, yet."
                );
                return;
            default:
                commHandler.setLoginMessage("Invalid platform.");
                return;
        }
        stateHandler.set("website", platform);
    };

    const startContest = async (id) => {
        const { website } = stateHandler.get();
        const [page] = await browser.pages();
        if (website == null) {
            commHandler.setLoginMessage("Select a platform first!");
            return;
        } else {
            if (website !== PRACTICE) {
                const cookies = await page.cookies();
                console.log(cookies);
                await browser.close();
                browser = await puppeteer.launch({
                    executablePath: getChromiumExecPath(),
                    headless: true,
                });
                await browser.newPage();
                await browser.newPage();
                const [mainPage, submissionPage, standingsPage] =
                    await browser.pages();
                await mainPage.setCookie(...cookies);
                await submissionPage.setCookie(...cookies);
                await standingsPage.setCookie(...cookies);
                if (!standingsStartedUpdating) {
                    setInterval(() => {
                        updateSubmissions();
                    }, 5000);
                    setInterval(() => {
                        updateStandings();
                    }, 5000);
                    standingsStartedUpdating = true;
                }
            }
            const contestDir = path.join(filesDir, `${website}_${id}`);
            let testcases = path.join(contestDir, "testcases.json");
            if (!fs.existsSync(contestDir)) {
                runCommandSync(`mkdir ${contestDir}`);
                runCommandSync(`echo "{}" > ${testcases}`);
            }
            // fs.readFile(testcases, "utf8", function (err, data) {
            //   if (err) throw err;
            //   problemDetails = JSON.parse(data);
            // });
            let newProblemList = [];
            commHandler.setLoginMessage("Collecting tasks...");
            try {
                const [mainPage, ,] = await browser.pages();
                switch (website) {
                    case CODEFORCES:
                        await mainPage.goto(
                            `https://codeforces.com/contest/${id}`
                        );
                        var items = await mainPage.$$(".id");
                        for (let i = 0; i < items.length; i++) {
                            let linkText = await items[i].$("a");
                            let problemId = await linkText.evaluate(
                                (el) => el.innerText
                            );
                            newProblemList.push({
                                id: problemId,
                                testCases: [],
                            });
                        }
                        break;
                    case ATCODER:
                        await mainPage.goto(
                            `https://atcoder.jp/contests/${id}/tasks`
                        );
                        await mainPage.waitForSelector("tbody");
                        const nodeChildren = await mainPage.$eval(
                            "tbody",
                            (uiElement) => {
                                return uiElement.children;
                            }
                        );
                        for (
                            let i = 0;
                            i < Object.keys(nodeChildren).length;
                            i++
                        )
                            newProblemList.push({
                                id: String.fromCharCode(i + 65),
                                testCases: [],
                            });
                        break;
                    case PRACTICE:
                        newProblemList = [
                            {
                                id: "A",
                                testCases: [],
                            },
                            {
                                id: "B",
                                testCases: [],
                            },
                            {
                                id: "C",
                                testCases: [],
                            },
                            {
                                id: "D",
                                testCases: [],
                            },
                        ];
                        break;
                    default:
                        commHandler.setLoginMessage("Invalid platform!");
                        return;
                }
            } catch (e) {
                commHandler.setLoginMessage("Error. Try again. " + e);
                return;
            }

            stateHandler.set("problemList", newProblemList);
        }
        stateHandler.set("contestId", id);
        change(0, 0);
    };

    const submit = async () => {
        const {
            problemList,
            currentLanguage,
            currentProblem,
            website,
            config,
            contestId,
        } = stateHandler.get();
        const problemId = problemList[currentProblem].id;
        const lang = config.languages[currentLanguage];
        const contestDir = path.join(filesDir, `${website}_${contestId}`);
        const [mainPage, ,] = await browser.pages();
        let fileLoc = path.join(contestDir, `${problemId}.${lang.extension}`);
        switch (website) {
            case CODEFORCES:
                await mainPage.goto(
                    `https://codeforces.com/contest/${contestId}/submit/${problemId}`
                );
                await mainPage.select(
                    'select[name="programTypeId"]',
                    lang.idCodeforces
                );
                var uploadButton = await mainPage.$("input[type=file]");
                await uploadButton.uploadFile(fileLoc);
                await mainPage.click("input[value=Submit");
                commHandler.sendNotif(0, "Code submitted.");
                break;
            case ATCODER:
                await mainPage.goto(
                    `https://atcoder.jp/contests/${contestId}/tasks/${contestId}_${problemId}`
                );
                await mainPage.select(
                    'select[name="data.LanguageId"',
                    lang.idAtcoder
                );
                const [fileChooser] = await Promise.all([
                    mainPage.waitForFileChooser(),
                    mainPage.click("#btn-open-file"),
                ]);
                await fileChooser.accept([fileLoc]);
                await mainPage.click("#submit");
                commHandler.sendNotif(0, "Code submitted.");
                break;
            default:
                stateHandler.addToLog("Invalid platform.");
                commHandler.sendNotif(1, "Unable to submit. Try again.");
        }
    };

    const updateSubmissions = async () => {
        const { website, contestId, problemList } = stateHandler.get();
        const [, submissionPage] = await browser.pages();
        if (website && contestId && problemList) {
            const newSubmissions = [];
            switch (website) {
                case CODEFORCES:
                    await submissionPage.goto(
                        `https://codeforces.com/contest/${contestId}/my`
                    );
                    const submissionTables = await submissionPage.$$(
                        ".status-frame-datatable"
                    );
                    for (const table of submissionTables) {
                        const rows = await table.$$("tr");
                        for (let i = 1; i < rows.length; i++) {
                            const cells = await rows[i].$$("td");
                            const data = [];
                            for (const cell of cells) {
                                const val = await cell.evaluate(
                                    (val) => val.innerText
                                );
                                data.push(val);
                            }
                            newSubmissions.push({
                                problemId: data[3],
                                time: data[1],
                                verdict: data[5],
                            });
                        }
                    }
                    break;
                case ATCODER:
                    await submissionPage.goto(
                        `https://atcoder.jp/contests/${contestId}/submissions/me`
                    );
                    const table = await submissionPage.$("tbody");
                    const rows = await table.$$("tr");
                    for (let i = 0; i < rows.length; i++) {
                        const cells = await rows[i].$$("td");
                        const data = [];
                        for (const cell of cells) {
                            const val = await cell.evaluate(
                                (val) => val.innerText
                            );
                            data.push(val);
                        }
                        newSubmissions.push({
                            problemId: data[1],
                            time: data[0],
                            verdict: data[6],
                        });
                    }
                    break;
                default:
                    break;
            }
            stateHandler.set("submissions", newSubmissions);
        }
    };

    const updateStandings = async () => {
        const { website, contestId, problemList } = stateHandler.get();
        const [, , standingsPage] = await browser.pages();
        if (website && contestId && problemList) {
            let newStandings = {};
            newStandings.solve = {};
            switch (website) {
                case CODEFORCES:
                    await standingsPage.goto(
                        `https://codeforces.com/contest/${contestId}/standings/friends/true`
                    );
                    await standingsPage.waitForSelector(
                        `.standingsStatisticsRow`
                    );
                    const solveRow = await standingsPage.$(
                        ".standingsStatisticsRow"
                    );
                    const counts = await solveRow.$$("td");
                    for (let i = 0; i < problemList.length; i++) {
                        newStandings.solve[problemList[i].id] = await counts[
                            i + 4
                        ].evaluate((val) => val.innerText);
                    }
                    try {
                        const myRow = await standingsPage.$(".highlighted-row");
                        const myRank = await myRow.$$("td");
                        newStandings.rank = await myRank[0].evaluate(
                            (val) => val.innerText
                        );
                    } catch (e) {
                        newStandings.rank = "Cannot find you";
                    }
                    break;
                case ATCODER:
                    await standingsPage.goto(
                        `https://atcoder.jp/contests/${contestId}/standings`
                    );
                    await standingsPage.waitForSelector("#standings-tbody");
                    const table = await standingsPage.$("#standings-tbody");
                    const solves = await table.$(".standings-statistics");
                    const cells = await solves.$$("td");
                    for (let i = 1; i < cells.length; i++) {
                        newStandings.solve[problemList[i - 1].id] = await cells[
                            i
                        ].evaluate((val) => val.innerText);
                    }
                    try {
                        const me = await table.$(".info");
                        const rank = await me.$$("td");
                        newStandings.rank = await rank[0].evaluate(
                            (val) => val.innerText
                        );
                    } catch (e) {
                        newStandings.rank = "Cannot find you";
                    }
                    break;
                default:
                    break;
            }
            stateHandler.set("standings", newStandings);
        }
    };

    const change = async (problemId, langId) => {
        const { problemList, config, contestId, website } = stateHandler.get();
        const problemName = problemList[problemId].id;
        const lang = config.languages[langId];
        stateHandler.setCurrentProblem(problemId);
        stateHandler.setCurrentLanguage(langId);
        const contestDir = path.join(filesDir, `${website}_${contestId}`);
        const [mainPage, ,] = await browser.pages();
        let fileLoc = path.join(contestDir, `${problemName}.${lang.extension}`);
        if (!fs.existsSync(fileLoc)) {
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
        }

        if (problemList[problemId].testCases.length === 0) {
            let testCases = [];
            try {
                switch (website) {
                    case CODEFORCES:
                        await mainPage.goto(
                            `https://codeforces.com/contest/${contestId}/problem/${problemName}`
                        );

                        const inputTexts = await mainPage.$$(".input");
                        const outputTexts = await mainPage.$$(".output");
                        for (let i = 0; i < inputTexts.length; i++) {
                            let input = await inputTexts[i].$eval(
                                "pre",
                                (el) => el.innerText
                            );
                            let output = await outputTexts[i].$eval(
                                "pre",
                                (el) => el.innerText
                            );
                            testCases.push({
                                input: input,
                                output: output,
                                result: "",
                                verdict: "",
                                comments: "",
                            });
                        }
                        break;

                    case ATCODER:
                        await mainPage.goto(
                            `https://atcoder.jp/contests/${contestId}/tasks/${contestId}_${problemName}`
                        );
                        let count = 0,
                            started = false,
                            index = 0,
                            toInput = true;
                        while (count < 50) {
                            try {
                                let data = await mainPage.$eval(
                                    `#pre-sample${count}`,
                                    (el) => el.textContent
                                );
                                if (toInput) {
                                    testCases.push({
                                        input: "",
                                        output: "",
                                        result: "",
                                        verdict: "",
                                        comments: "",
                                    });
                                    testCases[index].input = data;
                                    toInput = false;
                                } else {
                                    testCases[index].output = data;
                                    index++;
                                    toInput = true;
                                }
                                started = true;
                            } catch (e) {
                                if (started) break;
                            }
                            count++;
                        }
                        testCases = [...testCases.slice(testCases.length / 2)];

                        break;
                    default:
                        break;
                }
            } catch (e) {
                stateHandler.addToLog(
                    "Error fetching test cases. Try again. " + e
                );
                return;
            }
            stateHandler.setProblem(problemId, testCases);
        }
        stateHandler.addToLog(`Solving problem ${problemName} in ${lang.name}`);
        runCommandSync(`${config.editor} ${fileLoc}`);
    };

    const getFutureContests = async () => {
        const contestFetcher = await puppeteer.launch({
            executablePath: getChromiumExecPath(),
            headless: true,
        });
        const page = await contestFetcher.newPage();
        const futureContests = [];
        await page.goto("https://codeforces.com/contests");

        let tableContainer = await page.waitForSelector(".datatable");
        let table = await tableContainer.$("tbody");
        let rows = await table.$$("tr");
        for (let i = 1; i < rows.length; i++) {
            const cells = await rows[i].$$("td");
            const data = [];
            for (const cell of cells) {
                const val = await cell.evaluate((val) => val.innerText);
                data.push(val);
            }
            futureContests.push({
                id: await rows[i].evaluate((row) =>
                    row.getAttribute("data-contestid")
                ),
                name: data[0],
                startTime: data[2],
                platform: CODEFORCES,
            });
            stateHandler.set("futureContests", futureContests);
        }
        await page.goto("https://atcoder.jp/");
        tableContainer = await page.waitForSelector("#contest-table-upcoming");
        table = await tableContainer.$("tbody");
        rows = await table.$$("tr");
        for (let i = 0; i < rows.length; i++) {
            const cells = await rows[i].$$("td");
            const data = [];
            for (const cell of cells) {
                const val = await cell.evaluate((val) => val.innerText);
                data.push(val);
            }
            const link = await cells[1].$("a");
            futureContests.push({
                id: await link.evaluate((node) => {
                    const data = node.getAttribute("href").split("/");
                    return data[data.length - 1];
                }),
                name: await link.evaluate((node) => node.innerText),
                startTime: data[0],
                platform: ATCODER,
            });
            stateHandler.set("futureContests", [...futureContests]);
        }
        await contestFetcher.close();
    };

    return {
        initialize,
        login,
        startContest,
        submit,
        change,
        getFutureContests,
    };
};

module.exports = {
    getBrowserHandler,
};