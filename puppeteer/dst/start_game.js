"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
// Test out Init Pos manual / random / regenerate
// Test out logoutCallback on websocket close (and manual logout)
const DOMAIN = 'http://localhost:3000';
async function newBFTT(browser, user, game, isHost = false) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1300, height: 850 });
    await page.goto(DOMAIN + '/login');
    await page.type('#username', user);
    await page.type('#password', user);
    await page.click('#login');
    try {
        if (isHost) {
            await page.waitForSelector('#host-game-label');
            await page.click('#host-game-label');
            await page.waitForSelector('#host-game-input');
            await page.type('#host-game-input', game);
            await page.click('#host-game-submit');
        }
        else {
            await page.waitForSelector('#join-game-input');
            await page.type('#join-game-input', game);
            await page.click('#join-game-submit');
        }
    }
    catch (e) { }
}
(async () => {
    const browser = await puppeteer_1.default.launch({
        headless: false,
        args: ['--window-size=1920,1080', '--auto-open-devtools-for-tabs'],
    });
    (await browser.pages()).forEach((x) => x.close());
    const game = '2';
    await newBFTT(browser, 'a', game, true);
    const users = ['b', 'c', 'd', 'e'];
    for (let x of users) {
        await newBFTT(browser, x, game);
    }
    // await browser.close();
})();
