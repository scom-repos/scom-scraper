import puppeteer, { Page, Browser } from "puppeteer";
import Parser from "./parser";
import { ITweet, ITwitterAccount, ITwitterConfig } from "src/interface";

export default class TwitterScraper {
    private _config: ITwitterConfig;
    private parser: Parser;

    constructor(config: ITwitterConfig) {
        this._config = config;
        console.log('twitterScraper config', config);
        this.parser = new Parser();
    }

    scrapTweetsByUsername(username: string): Promise<ITweet[]> {
        return new Promise(async (resolve, reject) => {
            try {
                // Launch the browser and open a new blank page
                const browser = await puppeteer.launch({
                    headless: false,
                    args: ["--no-sandbox"],
                    defaultViewport: {
                        width: 1920,
                        height: 1080
                    }
                });

                const page: Page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
                await page.setJavaScriptEnabled(true);

                const twitterAccounts = this._config.twitterAccounts;
                if (!twitterAccounts || (twitterAccounts && twitterAccounts.length === 0)) {
                    resolve([]);
                }
                let tweets = [];
                for (const twitterAccount of twitterAccounts) {
                    try {
                        tweets = await this.scrap(twitterAccount, browser, page, username);
                        break;
                    }
                    catch (e) {
                        console.log(e);
                        console.log('trying second account');
                    }
                }
                resolve(tweets);
            }
            catch (e) {
                resolve([]);
            }
        });
    }

    private scrap(twitterAccount: ITwitterAccount, browser: Browser, page: Page, username: string): Promise<ITweet[]> {
        return new Promise(async (resolve, reject) => {
            let tweets: ITweet[] = [];
            const tweetSelector = '[data-testid="tweet"]';

            let timeout;
            const resetTimeout = () => {
                if (timeout)
                    clearTimeout(timeout);
                timeout = setTimeout(async () => {
                    await this.logout(page);
                    await browser.close();
                    resolve(tweets);
                }, 7000)
            }

            await this.login(twitterAccount, page);

            await page.waitForNavigation();

            console.log('Home page');

            const userTweetsURL = [];

            page.on('response', async res => {
                if (res.url().indexOf('UserTweets') >= 0 && userTweetsURL.indexOf(res.url()) < 0) {
                    userTweetsURL.push(res.url())
                    try {
                        await page.waitForSelector(tweetSelector, { timeout: 5000 });
                    }
                    catch(e) {
                        console.log('e', e)
                        clearTimeout(timeout);
                        await this.logout(page);
                        await page.waitForNavigation();
                        reject()
                    }
                    if (!res.ok) {
                        console.log('Error', await res.text());
                        resolve(tweets);
                    }
                    const result = await res.json();
                    const content = this.parser.parseTimelineTweetsV2(result);
                    tweets = [...tweets, ...content.tweets];
                    await page.evaluate(() => {
                        window.scrollTo(0, document.body.scrollHeight)
                    });
                    resetTimeout();
                }
            })
            await this.redirect(page, `https://x.com/${username}`);
            console.log("Scraping tweets...");
        })
    }

    private async login(twitterAccount: ITwitterAccount, page: Page): Promise<void> {
        const usernameSelector = '[name="text"]';
        const passwordSelector = '[name="password"]';

        // Go to login page
        await this.redirect(page, 'https://x.com/i/flow/login');

        // Enter username
        await page.waitForSelector(usernameSelector);
        await page.type(usernameSelector, twitterAccount.username);
        await page.keyboard.press("Enter");

        // Enter password
        await page.waitForSelector(passwordSelector);
        await page.type(passwordSelector, twitterAccount.password);
        await page.keyboard.press("Enter");
    }

    private async logout(page: Page) {
        const logoutButtonSelector = '[data-testid="confirmationSheetConfirm"]';
        await page.goto('https://x.com/logout');
        await page.waitForSelector(logoutButtonSelector);
        await page.click(logoutButtonSelector);
    }

    private async redirect(page: Page, url: string) {
        return page.goto(url);
    }

}

