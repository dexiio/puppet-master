import {asyncWait} from "./src/helpers.js";
import BrowserManager from "./src/BrowserManager.js";
import {benchmark} from "./src/benchmark.js";

let manager = new BrowserManager(true);
await manager.initPuppeteerWithChromeLauncher();
// await manager.initPuppeteer();

await asyncWait(1000);

await benchmark(manager);

// await asyncWait(10000);

await manager.closeBrowser();