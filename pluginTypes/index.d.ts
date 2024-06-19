/// <amd-module name="@scom/scom-scraper" />
declare module "@scom/scom-scraper" {
    import { Page, Browser } from "puppeteer";
    export default class ScraperManager {
        constructor();
        getBrowserAndPage(): Promise<{
            browser: Browser;
            page: Page;
        }>;
    }
    export { Browser, Page };
}
