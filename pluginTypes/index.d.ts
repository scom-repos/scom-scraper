/// <amd-module name="@scom/scom-scraper" />
declare module "@scom/scom-scraper" {
    import { Page, Browser } from "puppeteer";
    import { ICookie, ICookieParam, IKeyInput, IPageEvent, IPageLifeCycle } from "./types";
    export default class ScraperManager {
        private browser;
        private page;
        keyboard: ScraperKeyboard;
        constructor();
        init(): Promise<void>;
        click(selector: string): Promise<void>;
        type(selector: string, value: string, timeout?: number, delay?: number): Promise<void>;
        goTo(url: string, timeout?: number, waitUntil?: IPageLifeCycle | IPageLifeCycle[]): Promise<import("puppeteer").HTTPResponse>;
        waitForNavigation(timeout?: number, waitUntil?: IPageLifeCycle | IPageLifeCycle[]): Promise<import("puppeteer").HTTPResponse>;
        waitForSelector(selector: string, timeout?: number): Promise<import("puppeteer").ElementHandle<Element>>;
        scrollToBottom(delay?: number): Promise<void>;
        waitForRequest(urlOrPredict: string | ((response: any) => boolean)): Promise<import("puppeteer").HTTPRequest>;
        waitForResponse(urlOrPredict: string | ((response: any) => boolean)): Promise<import("puppeteer").HTTPResponse>;
        removeAllListeners(): Page;
        on(event: IPageEvent, callback: () => any): Page;
        getCookies(): Promise<ICookie[]>;
        setCookies(...cookies: ICookieParam[]): Promise<void>;
        destroy(): Promise<void>;
        getBrowserAndPage(): Promise<{
            browser: Browser;
            page: Page;
        }>;
        private sleep;
    }
    class ScraperKeyboard {
        private page;
        constructor(page: Page);
        up(key: IKeyInput): Promise<void>;
        down(key: IKeyInput): Promise<void>;
        press(key: IKeyInput, delay?: number): Promise<void>;
        type(text: string): Promise<void>;
        sendCharacter(char: string): Promise<void>;
    }
}
