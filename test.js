import BrowserManager from './src/BrowserManager.js';
import {asyncWait} from "./src/helpers.js";
import {benchmark} from "./src/benchmark.js";

const manager = new BrowserManager(true);
// await manager.initPuppeteer(false);
await manager.initPuppeteerWithChromeLauncher();

await benchmark(manager);

// await asyncWait(2000);
await manager.browser.close();

