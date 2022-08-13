const puppeteer = require('puppeteer');

module.exports = class Browser {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        this.browser = await puppeteer.launch({ headless: false });
        this.page = await this.browser.newPage();
        this.page.goto("https://google.com");
    }

    async login(username, password) {
        (await this.page).goto("https://codeforces.com/enter?back=%2F");
        await this.page.waitForSelector("#handleOrEmail");
        await this.page.type("#handleOrEmail", "username");
        await this.page.type("#password", "password");
    }
}
