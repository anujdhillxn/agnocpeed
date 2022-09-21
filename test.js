const puppeteer = require('puppeteer');
const username = "bhartiyamemebot.backup";
const password = "anuj@000";
async function go() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto("https://instagram.com")
    await page.waitForSelector('input[name=username]');
    await page.type('input[name=username]', username);
    await page.type('input[name=password]', password);
    await page.click('button[type=submit]');
    try {
        await page.waitForXPath('//*[contains(text(), "Not now")]');
        const [saveInfoButton] = await page.$x("//button[contains(., 'Not now')]");
        await saveInfoButton.click();
    }
    catch (e) {
        console.log(e);
    }
    try {
        await page.waitForXPath('//*[contains(text(), "Not Now")]');
        const [turnNotifButton] = await page.$x("//button[contains(., 'Not Now')]");
        await turnNotifButton.click();
    }
    catch (e) {
        console.log(e);
    }
    await page.waitForSelector('svg[aria-label="New post"]');
    await page.click('svg[aria-label="New post"]');
    await page.waitForXPath("//button[contains(., 'Select From Computer')]");
    const [fileButton] = await page.$x("//button[contains(., 'Select From Computer')]");
    const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        fileButton.click(),
    ]);
    await fileChooser.accept(["/home/anuj/agnocpeed/DeletedIMG.png"]);
    // await page.waitForXPath('//*[contains(text(), "Next")]');
    // const [nextButton1] = await page.$x("//button[contains(., 'Next')]");
    // await nextButton1.click();
    // await page.waitForXPath('//*[contains(text(), "Next")]');
    // const [nextButton2] = await page.$x("//button[contains(., 'Next')]");
    // await nextButton2.click();
    // await page.waitForSelector("textarea[aria-label='Write a caption...'");
    // await page.type("textarea[aria-label='Write a caption...'", "Testing puppeteer.")
    // await page.waitForXPath('//*[contains(text(), "Share")]');
    // const [shareButton] = await page.$x("//button[contains(., 'Share')]");
    // await shareButton.click();
}

go();