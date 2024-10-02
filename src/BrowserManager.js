// src/BrowserManager.js
import axios from "axios";
import * as chromeLauncher from 'chrome-launcher';
import puppeteer from 'puppeteer';
// import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import {asyncWait} from './helpers.js';

// const stealth = StealthPlugin();
// stealth.enabledEvasions.delete('chrome.app');
// stealth.enabledEvasions.delete('chrome.csi');
// stealth.enabledEvasions.delete('chrome.loadTimes');
// stealth.enabledEvasions.delete('chrome.runtime');
// stealth.enabledEvasions.delete('iframe.contentWindow');
// stealth.enabledEvasions.delete('media.codecs');
// stealth.enabledEvasions.delete('navigator.hardwareConcurrency');
// stealth.enabledEvasions.delete('navigator.languages');
// stealth.enabledEvasions.delete('navigator.permissions');
// stealth.enabledEvasions.delete('navigator.plugins');
// stealth.enabledEvasions.delete('sourceurl');
// stealth.enabledEvasions.delete('webgl.vendor');
// stealth.enabledEvasions.delete('window.outerdimensions');
// // stealth.enabledEvasions.delete('navigator.webdriver');
// // stealth.enabledEvasions.delete('user-agent-override');
// puppeteerExtra.use(stealth);

/**
 * @typedef {import('chrome-launcher').LaunchedChrome} LaunchedChrome
 * @typedef {import('puppeteer').Browser} PuppeteerBrowser
 */
class BrowserManager {
    constructor() {
        /**
         * @type {LaunchedChrome | null}
         */
        this.chromeInstance = null;

        // /**
        //  // * @type {PuppeteerBrowser | null}
        //  * @type {VanillaPuppeteer["launch"] | null}
        //  */
        this.browser = null;

        this.options = {
            chromeFlags: [
                '--no-sandbox', '--no-default-browser-check',
                '--start-maximized',
                // '--window-size=1920,1080',
                '--disable-infobars',
                '--no-first-run',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-site-isolation-trials',
                '--disable-web-security',
                '--disable-search-engine-choice-screen',

                // New
                '--disable-blink-features=AutomationControlled'
            ],
            ignoreDefaultFlags: true,
            logLevel: 'info',
        };
    }

    async initBidi() {
        try {
            this.browser = await puppeteer.launch({
                browser: 'chrome',
                headless: false,
                protocol: 'webDriverBiDi',
                defaultViewport: null,

                args: this.options.chromeFlags,
                ignoreDefaultArgs: this.options.ignoreDefaultFlags,
            });
        } catch (e) {
            console.error('Error during Puppeteer launch:', e);
            return;
        }

        console.log('\nLaunched Chrome with the BiDi Protocol .\n\n');
    }


    async initChromeLauncher() {
        try {
            this.chromeInstance = await chromeLauncher.launch(this.options);
        } catch (e) {
            console.error('Error during Chrome launch:', e);
        }
        console.log('Browser launched');

        if (!this.chromeInstance.port) {
            console.error('Chrome instance port not found');
            return;
        }
        this.options.port = this.chromeInstance.port;

        const resp = await axios.get(`http://localhost:${this.options.port}/json/version`);
        console.log('Browser Specs:', resp.data);
        const {webSocketDebuggerUrl} = resp.data;
        try {
            this.browser = await puppeteer.connect({
                browserWSEndpoint: webSocketDebuggerUrl,
                defaultViewport: null,
            });
        } catch (e) {
            this.chromeInstance.kill();
            console.error('Error during Puppeteer connect:', e);
            return;
        }

        console.log('\nConnected to Chrome.\n\n');
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
}

export default BrowserManager;