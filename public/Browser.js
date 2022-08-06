const { BrowserWindow } = require('@electron/remote');
const puppeteer = require('puppeteer');

export class Browser {
    constructor() {
        this.browser = puppeteer.launch({ headless: false });
        this.page = this.browser.newPage();
    }
    async login(username, password) {
        (await this.page).goto("https://codeforces.com/enter?back=%2F");
        await this.page.waitForSelector("#handleOrEmail");
        await this.page.type("#handleOrEmail", "username");
        await this.page.type("#password", "password");
    }
}