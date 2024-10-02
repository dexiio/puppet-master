import {asyncWait} from "./helpers.js";

/**
 * @param {BrowserManager} manager
 */
export async function benchmark(manager) {
    console.log("\n------------------- Starting benchmark -------------------\n");
    try {
        // await demoDexi(manager);
        // await botSannySoft(manager);
        // await rebrowserBotDetector(manager);
        await browserScan(manager);
        // await creepJS(manager);
    } catch (e) {
        console.error('Error during benchmark:', e);
    }
}

/**
 * @param {BrowserManager} manager
 */
async function demoDexi(manager) {
    let page = await manager.openURL('https://demo.dexi.io/');

    const header = await page.evaluate(() => document.querySelector('h1').textContent);
    if (header !== 'Dexi Demo Sites') {
        throw new Error('demo.dexi.io not loaded correctly');
    }

    console.log('Dexi Demo Sites loaded correctly!\n');
}

/**
 * @param {BrowserManager} manager
 */
async function botSannySoft(manager) {
    let page = await manager.openURL('https://bot.sannysoft.com/');
}

/**
 * @param {BrowserManager} manager
 */
async function rebrowserBotDetector(manager) {
    let page = await manager.openURL('https://bot-detector.rebrowser.net/\n');
}
/**
 * @param {BrowserManager} manager
 */
async function browserScan(manager) {
    let page = await manager.openURL('https://www.browserscan.net/bot-detection');

    const colorMap = await page.evaluate(() => {
        const texts = [' Webdriver ', 'User-Agent', 'CDP', 'Navigator'];
        const badColor = 'rgb(251, 81, 56)';
        const colorMap = {};
        const elements = [...document.querySelectorAll('ul > li > div')];

        texts.forEach(text => {
            const element = elements.find(el => el.textContent === text);
            const color = element ? window.getComputedStyle(element).color : null;
            colorMap[text.replace('-','').trim()] = color === badColor;
            // colorMap[text] = color;
        });

        return colorMap;
    });

    console.log('BrowserScan:', colorMap, '\n');
}

/**
 * @param {BrowserManager} manager
 */
async function creepJS(manager) {
    let page = await manager.openURL('https://abrahamjuliot.github.io/creepjs/');
}