"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const parser_1 = __importDefault(require("./parser"));
class TwitterScraper {
    constructor(config) {
        this._config = config;
        this.parser = new parser_1.default();
    }
    scrapTweetsByUsername(username) {
        return new Promise(async (resolve, reject) => {
            let tweets = [];
            try {
                // Launch the browser and open a new blank page
                const browser = await puppeteer_1.default.launch({
                    headless: true,
                    args: ["--no-sandbox"]
                });
                let timeout = setTimeout(async () => {
                    console.log('timeout');
                    await browser.close();
                    resolve(tweets);
                }, 30000);
                const page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
                // Navigate the page to a URL
                await page.setJavaScriptEnabled(true);
                await page.goto('https://x.com/home');
                // Set screen size
                await page.setViewport({ width: 2560, height: 1440 });
                const loginButtonSelector = "[data-testid='loginButton']";
                await page.waitForSelector(loginButtonSelector, { visible: true });
                await page.click(loginButtonSelector);
                await page.waitForSelector('[name="text"]');
                console.log("Entering username");
                await page.type('[name="text"]', this._config.username);
                await page.keyboard.press("Enter");
                await page.waitForSelector('[name="password"]');
                console.log("Entering password");
                await page.type('[name="password"]', this._config.password);
                await page.keyboard.press("Enter");
                console.log("Logging in");
                await page.waitForNavigation();
                await page.waitForSelector('[data-testid="tweet"]');
                console.log("Home page");
                const userTweetsURL = [];
                page.on('response', async (res) => {
                    if (res.url().indexOf('UserTweets') >= 0 && userTweetsURL.indexOf(res.url()) < 0) {
                        userTweetsURL.push(res.url());
                        await page.waitForSelector('[data-testid="tweet"]');
                        if (!res.ok) {
                            console.log(await res.text());
                            resolve(tweets);
                        }
                        const result = await res.json();
                        const content = this.parser.parseTimelineTweetsV2(result);
                        tweets = [...tweets, ...content.tweets];
                        await page.evaluate(() => {
                            window.scrollTo(0, document.body.scrollHeight);
                        });
                        clearTimeout(timeout);
                        timeout = setTimeout(async () => {
                            await browser.close();
                            resolve(tweets);
                        }, 5000);
                    }
                });
                await page.goto(`https://x.com/${username}`);
                console.log("Scraping tweets...");
            }
            catch (e) {
                resolve(tweets);
            }
        });
    }
}
exports.default = TwitterScraper;
