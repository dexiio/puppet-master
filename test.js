import BrowserManager from './src/BrowserManager.js';
import {asyncWait} from "./src/helpers.js";
import {benchmark} from "./src/benchmark.js";

const manager = new BrowserManager();
// await manager.initBidi();
await manager.initChromeLauncher();

await benchmark(manager);

// await asyncWait(500);
await manager.browser.close();

