const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const isDev = require('electron-is-dev');
const puppeteer = require('puppeteer');

const ATCODER = "atcoder";
const CODEFORCES = "codeforces";
const PRACTICE = "practice";
const CODECHEF = "codechef";

require('@electron/remote/main').initialize();

let browser = null;
let page = null;
let website = null;
let contestId = null;
let contestDir = null;
let problemList = [];
let problemDetails = {};
let filesDir = path.join(__dirname, "../files");
async function init() {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
}

let win;
function createWindow() {
    if (!fs.existsSync(filesDir))
        exec(`mkdir ${filesDir}`);
    init();
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            enableRemoteModule: true,
        }
    })
    win.loadURL(isDev ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`
    )
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.handle("start", async (event, id) => {
    let message = "Contest started. All the best!";
    let status = 1;
    if (website == null) {
        message = "Select a platform first!";
        status = 0;
    }
    else {
        contestId = id;
        contestDir = path.join(filesDir, `${website}_${contestId}`);
        let testcases = path.join(contestDir, "testcases.json");
        if (!fs.existsSync(contestDir)) {
            exec(`mkdir ${contestDir}`);
            exec(`echo "{}" > ${testcases}`);
        }
        fs.readFile(testcases, 'utf8', function (err, data) {
            if (err) throw err;
            problemDetails = JSON.parse(data);
        });
        switch (website) {
            case CODEFORCES:
                await page.goto(`https://codeforces.com/contest/${contestId}`);
                let items = await page.$$('.id');
                problemList = [];
                for (let i = 0; i < items.length; i++) {
                    let linkText = await items[i].$('a');
                    let problemId = await linkText.evaluate(el => el.innerText);
                    problemList.push(problemId);
                }
                console.log(problemList);
                break;
            default:
                message = "Invalid platform."
                status = 0;
                break;
        }
    }
    return { status: status, problemList: problemList, message: message };
});

ipcMain.handle("login", async (event, username, password, platform) => {
    let message = "Logged in successfully."
    let status = 1;
    switch (platform) {
        case CODEFORCES:
            (await page).goto("https://codeforces.com/enter?back=%2F");
            await page.waitForSelector("#handleOrEmail");
            await page.type("#handleOrEmail", username);
            await page.type("#password", password);
            await page.click('input[type=submit]');

            try {
                await page.waitForXPath('//*[contains(text(), "Logout")]');
            }
            catch (e) {
                message = "Unable to log in. Either the network is too slow or username/password does not match."
                status = 0;
            }
            break;
        case ATCODER:
            (await page).goto("https://atcoder.jp/login?continue=https%3A%2F%2Fatcoder.jp%2F");
            await page.waitForSelector("#username");
            await page.type("#username", username);
            await page.type("#password", password);
            await page.click("#submit");
            try {
                await page.waitForXPath('//*[contains(text(), "Sign Out")]');
            }
            catch (e) {
                message = "Unable to log in. Either the network is too slow or username/password does not match."
                status = 0;
            }
            break;
        case CODECHEF:
            message = "Unavailable."
            status = 0;
            break;
        case PRACTICE:
            message = "Choose practice session name."
            break;
        default:
            message = "Invalid platform."
            status = 0;
            break;

    }
    if (status) website = platform;
    return { status: status, message: message };
});