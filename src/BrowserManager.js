import axios from "axios";
import * as chromeLauncher from 'chrome-launcher';
import {asyncWait} from './helpers.js';
import WebSocket from 'ws';
import path from 'path';

async function getPuppeteerInstance(useRebrowser = false) {
    if (useRebrowser) {
        return await import('rebrowser-puppeteer');
    } else {
        return await import('puppeteer');
    }
}

/**
 * @typedef {import('chrome-launcher').LaunchedChrome} LaunchedChrome
 * @typedef {import('puppeteer').Browser} PuppeteerBrowser
 */
class BrowserManager {
    constructor(useRebrowser) {
        this.useRebrowser = useRebrowser;
        if (this.useRebrowser) {
            console.log('Using Rebrowser Puppeteer');
        }

        /**
         * @type {import('puppeteer')}
         */
        this.puppeteer = null
        /**
         * @type {boolean}
         */
        this.isInitialized = false;

        /**
         * @type {LaunchedChrome | null}
         */
        this.chromeInstance = null;

        /**
         * @type {PuppeteerBrowser | null}
         */
        this.browser = null;

        this.options = {
            chromeFlags: [
                '--no-sandbox',
                '--no-default-browser-check',
                '--start-maximized',
                '--disable-infobars',
                '--no-first-run',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-site-isolation-trials',
                '--disable-search-engine-choice-screen',
                '--disable-blink-features=AutomationControlled',
                '--use-mock-keychain',
            ],
            ignoreDefaultFlags: true,
            logLevel: 'info',
        };
    }

    async init() {
        if (this.isInitialized) {
            console.error('BrowserManager is already initialized');
            return;
        }
        this.puppeteer = await getPuppeteerInstance(this.useRebrowser);
    }

    async initExtension() {
        await this.init();

        const pathToExtension = path.join(process.cwd(), 'src/puppet-master-extension');
        console.log(`Loading extension at: ${pathToExtension}`);
        // this.browser = await this.puppeteer.launch({
        //     headless: false,
        //     defaultViewport: null,
        //     args: [
        //         `--disable-extensions-except=${pathToExtension}`,
        //         `--load-extension=${pathToExtension}`,
        //     ],
        // });

        try {
            this.options.chromeFlags.push(`--load-extension=${pathToExtension}`);
            // this.options.chromeFlags.push(`--disable-extensions-except=${pathToExtension}`);
            // this.options.chromeFlags.push('--remote-debugging-port=0');
            // this.options.port=0;
            // this.options.startingUrl = 'https://www.browserscan.net/bot-detection';

            // this.chromeInstance = await chromeLauncher.launch(this.options);
            this.chromeInstance =  await chromeLauncher.launch(this.options);
            // await asyncWait(3000);
        } catch (e) {
            console.error('Error during Chrome launch:', e);
        }

        console.log("Chrome instance launched");


        // const ws = new WebSocket('ws://localhost:8080');
        // ws.onopen = (event) => {
        //     ws.send('alert("Hello from WebSocket!");');
        // };
    }

    async initPuppeteer(useBiDiProtocol) {
        await this.init();

        try {
            this.browser = await this.puppeteer.launch({
                headless: false,
                defaultViewport: null,
                protocol: useBiDiProtocol ? 'webDriverBiDi' : 'cdp',
                args: this.options.chromeFlags,
                ignoreDefaultArgs: this.options.ignoreDefaultFlags,
            });
            this.isInitialized = true;
        } catch (e) {
            console.error('Error during Puppeteer launch:', e);
        }

        console.log('\nConnected to puppeteer chrome instance.\n\n');
    }

    async initPuppeteerWithChromeLauncher() {
        await this.init();

        try {
            this.chromeInstance = await chromeLauncher.launch(this.options);
        } catch (e) {
            console.error('Error during Chrome launch:', e);
        }

        if (!this.chromeInstance.port) {
            console.error('Chrome instance port not found');
            return;
        }
        this.options.port = this.chromeInstance.port;

        const resp = await axios.get(`http://localhost:${this.options.port}/json/version`);
        console.log('Browser Specs:', resp.data);
        const {webSocketDebuggerUrl} = resp.data;
        try {
            this.browser = await this.puppeteer.connect({
                browserWSEndpoint: webSocketDebuggerUrl,
                defaultViewport: null,
            });
            this.isInitialized = true;
        } catch (e) {
            this.chromeInstance.kill();
            console.error('Error during Puppeteer connect:', e);
        }

        console.log('\nConnected to chrome-launcher chrome instance.\n\n');
    }

    /**
     * @param {string} url
     * @returns {Promise<import('puppeteer').Page>}
     */
    async openURL(url) {
        let page = await this.browser.newPage();
        await page.goto(url);

        await asyncWait(500);

        return page;
    }

    async closeBrowser() {
        await this.browser.close();
        if (this.chromeInstance) {
            this.chromeInstance.kill();
        }
        this.browser = null;
        this.chromeInstance = null;
        this.isInitialized = false;
    }
}

export default BrowserManager;