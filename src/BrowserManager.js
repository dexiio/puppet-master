const axios = require("axios");
const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require('puppeteer-extra');

puppeteer.use(StealthPlugin());


class BrowserManager {
    constructor() {
        this.chromeInstance = null;
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    static async asyncWait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async init() {
        this.chromeLauncher = await import("chrome-launcher");

        const opts = {
            chromeFlags: [
                '--no-sandbox',
                '--no-default-browser-check',
                '--start-maximized',
                '--disable-infobars',
                '--no-first-run',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-site-isolation-trials',
                '--disable-web-security',
                '--disable-search-engine-choice-screen',
            ],
            ignoreDefaultFlags: true
        };

        this.chromeInstance = await this.chromeLauncher.launch(opts);
        await BrowserManager.asyncWait(5000);
        console.log('Browser launched');

        // let response;
        // try {
        //     response = await axios.get(`http://localhost:${this.chromeInstance.port}/json/version`);
        // } catch (error) {
        //     console.log("Error getting the debugging websocket", error);
        //     return;
        // }
        //
        // const browserWSEndpoint = response.data.webSocketDebuggerUrl;
        // await BrowserManager.asyncWait(500);

        // this.browser = await chromium.connectOverCDP(browserWSEndpoint);
        this.browser = await puppeteer.connect({
            browserWSEndpoint: `ws://localhost:${this.chromeInstance.port}`
        });

        await BrowserManager.asyncWait(500);
        console.log('Connected');

        this.page = await this.browser.newPage();

        console.log("--- DONE ---");
    }
}

(async () => {
    const manager = new BrowserManager();
    await manager.init();

    await manager.page.goto("https://www.browserscan.net/bot-detection")
})();
