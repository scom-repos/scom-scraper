"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
class ScraperManager {
    constructor() { }
    async init() {
        this.browser = await puppeteer_1.default.launch({
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
    async click(selector) {
        return this.page.click(selector);
    }
    // Keyboard interaction
    async type(selector, value, timeout = 30000, delay = 0) {
        await this.waitForSelector(selector, timeout);
        return this.page.type(selector, value, { delay });
    }
    // Page Behavior
    async goto(url, timeout = 30000, waitUntil = 'domcontentloaded') {
        return this.page.goto(url, { timeout, waitUntil });
    }
    async waitForNavigation(timeout = 30000, waitUntil = 'domcontentloaded') {
        return this.page.waitForNavigation({ timeout, waitUntil });
    }
    async waitForSelector(selector, timeout = 30000) {
        return this.page.waitForSelector(selector, { timeout });
    }
    async scrollToBottom(delay = 0) {
        if (delay > 0)
            await this.sleep(delay);
        await this.page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
    }
    // Page networking
    async waitForRequest(urlOrPredict) {
        return this.page.waitForRequest(urlOrPredict);
    }
    async waitForResponse(urlOrPredict) {
        return this.page.waitForResponse(urlOrPredict);
    }
    removeAllListeners(eventType) {
        return this.page.removeAllListeners(eventType);
    }
    on(event, callback) {
        return this.page.on(event, callback);
    }
    // Page storage
    async getCookies() {
        return this.page.cookies();
    }
    async setCookie(...cookies) {
        return this.page.setCookie(...cookies);
    }
    // Scraper Manager Lifecycle
    async destroy() {
        await this.page.close();
        await this.browser.close();
    }
    // Deprecated
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
        catch (_a) {
            console.log('closing browser');
            await browser.close();
            return null;
        }
    }
    async sleep(time) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }
}
exports.default = ScraperManager;
class ScraperKeyboard {
    constructor(page) { this.page = page; }
    async up(key) {
        return this.page.keyboard.up(key);
    }
    async down(key) {
        return this.page.keyboard.down(key);
    }
    async press(key, delay = 0) {
        return this.page.keyboard.press(key, { delay });
    }
    async type(text) {
        return this.page.keyboard.type(text);
    }
    async sendCharacter(char) {
        return this.page.keyboard.sendCharacter(char);
    }
}
