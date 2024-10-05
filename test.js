import {asyncWait} from "./src/helpers.js";
import BrowserManager from "./src/BrowserManager.js";

let manager = new BrowserManager(false);
await manager.initExtension();

// await asyncWait(10000);

// await manager.closeBrowser();