import {asyncWait} from "./helpers.js";

/**
 * @param {BrowserManager} manager
 */
export async function benchmark(manager) {
    console.log("\n------------------- Starting benchmark -------------------\n");
    try {
        await demoDexi(manager);
        await rebrowser(manager);
        await browserScan(manager);
        await creepJS(manager);
        // await botSannySoft(manager);
    } catch (e) {
        console.error('Error during benchmark:', e);
    }

    console.log("\n------------------- Benchmark finished -------------------\n");
}

/**
 * @param {BrowserManager} manager
 */
async function demoDexi(manager) {
    let page = await manager.openURL('https://demo.dexi.io/');

    await page.waitForSelector('h1');

    const header = await page.evaluate(() => document.querySelector('h1').textContent);
    if (header !== 'Dexi Demo Sites') {
        throw new Error('Webpage not loaded correctly!');
    }

    // console.log('Dexi Demo Site loaded correctly!\n');
}

/**
 * @param {BrowserManager} manager
 * @param {string} url
 * @param {Function} evaluateFn
 * @param {string} logPrefix
 */
async function detectBots(manager, url, evaluateFn, logPrefix) {
    let page = await manager.openURL(url);

    const testResults = await page.evaluate(evaluateFn);

    Object.keys(testResults).forEach(key => {
        if (testResults[key]) {
            console.log(`[${logPrefix}] ${key} detected`);
        }
    });
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
async function rebrowser(manager) {
    const url = 'https://bot-detector.rebrowser.net/';

    const evaluateFn = () => {
        const testResults = {};
        document.querySelectorAll('tbody > tr > td > span').forEach(elm => {
            const text = elm.textContent.trim();
            if (text.includes('🔴')) {
                testResults[text.replace('🔴', '').trim()] = true;
            } else if (text.includes('🟢') || text.includes('⚪️')) {
                testResults[text.replace(/[🟢⚪️]/g, '').trim()] = false;
            }
        });
        return testResults;
    };

    await detectBots(manager, url, evaluateFn, 'Rebrowser');
}

/**
 * @param {BrowserManager} manager
 */
async function browserScan(manager) {
    const url = 'https://www.browserscan.net/bot-detection';

    const evaluateFn = () => {
        const texts = [' Webdriver ', 'User-Agent', 'CDP', 'Navigator'];
        const badColor = 'rgb(251, 81, 56)';
        const testResults = {};
        const elms = [...document.querySelectorAll('ul > li > div')];

        texts.forEach(text => {
            const element = elms.find(el => el.textContent === text);
            const color = element ? window.getComputedStyle(element).color : null;
            testResults[text.replace('-', '').trim()] = color === badColor;
        });

        return testResults;
    };

    await detectBots(manager, url, evaluateFn, 'BrowserScan');
}


/**
 * @param {BrowserManager} manager
 */
async function creepJS(manager) {
    let page = await manager.openURL('https://abrahamjuliot.github.io/creepjs/');

    await page.waitForSelector('div.visitor-info div.col-six > div > span.unblurred');
    await asyncWait(3000);

    let results = await page.evaluate(() => {
        return [...document.querySelectorAll('div.visitor-info div.col-six > div')].map(elm => elm.innerText);
    });

    results.push(await page.evaluate(() => {
        return [...document.querySelectorAll('span.time')].find(elm => elm.innerText.startsWith('crowd-blending score')).innerText;
    }));

    const filterList = ['trust score', 'lies', 'trash', 'errors', 'crowd-blending score'];
    results = results.filter(elmText => filterList.some(prefix => elmText.startsWith(prefix)));

    results.forEach(result => {
        console.log(`[CreepJS] ${result}`);
    });
}