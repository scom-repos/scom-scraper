import puppeteer, { Page, Browser } from "puppeteer";
import { ICookie, ICookieParam, IKeyboardAction, IKeyInput, IPageEvent, IPageLifeCycle } from "./types";

interface IScraperManager {
    init: () => Promise<void>;
    click: (selector: string) => Promise<void>;
    type: (selector: string, value: string, timeout?: number, delay?: number) => Promise<void>;
    goTo: (url: string, timeout?: number, waitUntil?: IPageLifeCycle | IPageLifeCycle[]) => Promise<any>;
    waitForNavigation: (timeout?: number, waitUntil?: IPageLifeCycle | IPageLifeCycle[]) => Promise<any>;
    waitForSelector: (selector: string, timeout?: number) => Promise<any>;
    scrollToBottom: (delay?: number) => Promise<void>;
    waitForRequest: (urlOrPredict: string | ((response: any) => Promise<boolean>)) => Promise<any>;
    waitForResponse: (urlOrPredict: string | ((response: any) => Promise<boolean>)) => Promise<any>;
    removeAllListener: () => void;
    on: (event: IPageEvent, callback: () => Promise<any>) => void;
    getCookies: () => Promise<ICookie[]>;
    setCookies: (...cookies: ICookie[]) => Promise<void>;
    destroy: () => Promise<void>
}

export default class ScraperManager {

    private browser: Browser;
    private page: Page;

    keyboard: ScraperKeyboard;

    constructor() { }

    async init() {
        this.browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox"],
            defaultViewport: {
                width: 1920,
                height: 1080
            }
        });
        this.page = await this.browser.newPage();
        this.keyboard = new ScraperKeyboard(this.page);
    }

    // Mouse interaction
    async click(selector: string) {
        return this.page.click(selector);
    }

    // Keyboard interaction
    async type(selector: string, value: string, timeout: number = 30000, delay: number = 0) {
        await this.waitForSelector(selector, timeout);
        return this.page.type(selector, value, { delay })
    }

    // Page Behavior
    async goTo(url: string, timeout: number = 30000, waitUntil: IPageLifeCycle | IPageLifeCycle[] = 'domcontentloaded') {
        return this.page.goto(url, { timeout, waitUntil });
    }

    async waitForNavigation(timeout: number = 30000, waitUntil: IPageLifeCycle | IPageLifeCycle[] = 'domcontentloaded') {
        return this.page.waitForNavigation({ timeout, waitUntil });
    }

    async waitForSelector(selector: string, timeout: number = 30000) {
        return this.page.waitForSelector(selector, { timeout });
    }

    async scrollToBottom(delay: number = 0) {
        if(delay > 0)   
            await this.sleep(delay);
        await this.page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
    }

    // Page networking
    async waitForRequest(urlOrPredict: string | ((response: any) => boolean)) {
        return this.page.waitForRequest(urlOrPredict)
    }

    async waitForResponse(urlOrPredict: string | ((response: any) => boolean)) {
        return this.page.waitForResponse(urlOrPredict);
    }

    removeAllListeners() {
        return this.page.removeAllListeners();
    }

    on(event: IPageEvent, callback: () => any) {
        return this.page.on(event, callback);
    }

    // Page storage
    async getCookies(): Promise<ICookie[]> {
        return this.page.cookies();
    }

    async setCookies(...cookies: ICookieParam[]) {
        return this.page.setCookie(...cookies);
    }

    // Scraper Manager Lifecycle
    async destroy() {
        await this.page.close();
        await this.browser.close();
    }

    // Deprecated
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

    private async sleep(time: number) {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        })
    }
}

class ScraperKeyboard {
    private page: Page;
    constructor(page: Page) { this.page = page; }

    async up(key: IKeyInput) {
        return this.page.keyboard.up(key)
    }

    async down(key: IKeyInput) {
        return this.page.keyboard.down(key)
    }

    async press(key: IKeyInput, delay: number = 0) {
        return this.page.keyboard.press(key, { delay });
    }

    async type(text: string) {
        return this.page.keyboard.type(text);
    }

    async sendCharacter(char: string) {
        return this.page.keyboard.sendCharacter(char);
    }
}