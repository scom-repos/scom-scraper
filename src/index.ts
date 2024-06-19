import puppeteer, { Page, Browser } from "puppeteer";

export default class ScraperManager {
    constructor() {}

    async getBrowserAndPage() {
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox"],
            defaultViewport: {
                width: 1920,
                height: 1080
            }
        });
        try {
            const page: Page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
            await page.setJavaScriptEnabled(true);
            return {
                browser,
                page
            }
        } catch {
            console.log('closing browser');
            await browser.close();
            return null;
        }
    }
}

export { Browser, Page }