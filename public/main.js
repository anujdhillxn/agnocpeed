const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const puppeteer = require('puppeteer');


require('@electron/remote/main').initialize();

async function login() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    (await page).goto("https://codeforces.com/enter?back=%2F");
    await page.waitForSelector("#handleOrEmail");
    await page.type("#handleOrEmail", "username");
    await page.type("#password", "password");
}

let win;
function createWindow() {
    // login();
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