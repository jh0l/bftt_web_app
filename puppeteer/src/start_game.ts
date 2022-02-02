import puppeteer, {Browser, Page} from 'puppeteer';

// Test out Init Pos manual / random / regenerate
// Test out logoutCallback on websocket close (and manual logout)

const DOMAIN = 'http://localhost:3000';

async function newBFTT(
    browser: Browser,
    user: string,
    game: string,
    isHost: boolean = false
) {
    const page = await browser.newPage();
    await page.setViewport({width: 1300, height: 850});
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
        } else {
            await page.waitForSelector('#join-game-input');
            await page.type('#join-game-input', game);
            await page.click('#join-game-submit');
        }
    } catch (e) {}
    return page;
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=1920,1080', '--auto-open-devtools-for-tabs'],
    });
    (await browser.pages()).forEach((x) => x.close());
    const game = '1';
    const pages: Page[] = [];
    pages.push(await newBFTT(browser, 'a', game, true));
    const users = ['b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'];
    for (let x of users.slice(0, 6)) {
        pages.push(await newBFTT(browser, x, game));
    }
    pages[0]?.bringToFront();
})();
