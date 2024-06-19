define("@scom/scom-scraper", ["require", "exports", "puppeteer"], function (require, exports, puppeteer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Page = exports.Browser = void 0;
    Object.defineProperty(exports, "Page", { enumerable: true, get: function () { return puppeteer_1.Page; } });
    Object.defineProperty(exports, "Browser", { enumerable: true, get: function () { return puppeteer_1.Browser; } });
    class ScraperManager {
        constructor() { }
        async getBrowserAndPage() {
            const browser = await puppeteer_1.default.launch({
                headless: true,
                args: ["--no-sandbox"],
                defaultViewport: {
                    width: 1920,
                    height: 1080
                }
            });
            try {
                const page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
                await page.setJavaScriptEnabled(true);
                return {
                    browser,
                    page
                };
            }
            catch {
                console.log('closing browser');
                await browser.close();
                return null;
            }
        }
    }
    exports.default = ScraperManager;
});
