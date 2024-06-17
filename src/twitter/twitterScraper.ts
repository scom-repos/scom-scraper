import puppeteer, { Page, Browser } from "puppeteer";
import Parser from "./parser";
import { ITweet, ITwitterAccount, ITwitterConfig } from "src/interface";

export default class TwitterScraper {
    private _config: ITwitterConfig;
    private parser: Parser;
    private _currentTwitterAccount: ITwitterAccount;


    constructor(config: ITwitterConfig) {
        this._config = config;
        if (config.twitterAccounts?.length > 0) {
            this._currentTwitterAccount = config.twitterAccounts[0];
        }
        this.parser = new Parser();
    }

    async scrapTweetsByUsername(username: string): Promise<ITweet[]> {
        let tweets: ITweet[] = [];
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

            await this.login(page);
            await page.waitForNavigation();
            await this.redirect(page, `https://x.com/${username}`);

            let response = null;
            let hasMore = true;
            do {
                response = await page.waitForResponse(res => res.url().indexOf('UserTweets') && res.request().method() === 'GET');
                if(!response.ok) {
                    // await this.logout(page);
                    console.log('Ng ok')
                }
                const responseData = await response.json();
                console.log(responseData);
                const content = this.parser.parseTimelineTweetsV2(responseData);
                tweets = [...tweets, ...content.tweets];
                hasMore = this.hasMoreTweets(responseData);
                if (hasMore) {
                    await page.evaluate(() => {
                        window.scrollTo(0, document.body.scrollHeight);
                    });
                }
            } while (hasMore)
            return tweets;
        }
        catch (e) {
            return [];
        }
    }

    private hasMoreTweets(data: any) {
        const instructions = data.user.result.timeline_v2.timeline.instructions;
        const timelineAddEntries = instructions.filter(v => v.type === "TimelineAddEntries");
        if (timelineAddEntries.length === 0) return false;
        return timelineAddEntries[0].entries?.length > 2;
    }

    private scrap(twitterAccount: ITwitterAccount, browser: Browser, page: Page, username: string): Promise<ITweet[]> {
        return new Promise(async (resolve, reject) => {
            let tweets: ITweet[] = [];
            const tweetSelector = '[data-testid="tweet"]';

            // let timeout;
            // const resetTimeout = () => {
            //     if (timeout)
            //         clearTimeout(timeout);
            //     timeout = setTimeout(async () => {
            //         await this.logout(page);
            //         // await browser.close();
            //         resolve(tweets);
            //     }, 7000)
            // }

            // await this.login(twitterAccount, page);

            // await page.waitForNavigation();

            // console.log('Home page');

            const userTweetsURL = [];

            page.on('response', async res => {
                if (res.url().indexOf('UserTweets') >= 0 && userTweetsURL.indexOf(res.url()) < 0) {
                    console.log('res', res.url(), res.ok);
                    userTweetsURL.push(res.url())
                    try {
                        await page.waitForSelector(tweetSelector, { timeout: 5000 });
                    }
                    catch (e) {
                        console.log('e', e)
                        // clearTimeout(timeout);
                        await this.logout(page);
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
                    // resetTimeout();
                }
            })
            await this.redirect(page, `https://x.com/${username}`);
            console.log("Scraping tweets...");
        })
    }

    private async enterUserName(page: Page, username: string) {
        const usernameSelector = '[name="text"]';
        await page.waitForSelector(usernameSelector);
        await page.type(usernameSelector, username);
        await page.keyboard.press("Enter");
    }

    private async enterPassword(page: Page, password: string) {
        const passwordSelector = '[name="password"]';
        await page.waitForSelector(passwordSelector);
        await page.type(passwordSelector, password);
        await page.keyboard.press("Enter");
    }

    private async enterEmailAddress(page: Page, emailAddress: string) {
        const emailAddressSelector = '[data-testid="ocfEnterTextTextInput"]';
        await page.waitForSelector(emailAddressSelector);
        await page.type(emailAddressSelector, emailAddress);
        await page.keyboard.press("Enter");
    }

    private async login(page: Page): Promise<void> {
        const usernameSelector = '[name="text"]';
        const passwordSelector = '[name="password"]';
        await this.redirect(page, 'https://x.com/i/flow/login');
        await this.enterUserName(page, this._currentTwitterAccount.username)
        await this.enterPassword(page, this._currentTwitterAccount.password)
        const response = await page.waitForResponse("https://api.x.com/1.1/onboarding/task.json");
        if (response.ok && response.request().method() === 'POST') {
            const data = await response.json();
            if (data.subtasks?.length > 0) {
                switch (data.subtasks[0].subtask_id) {
                    case "LoginAcid": {
                        await this.enterEmailAddress(page, this._currentTwitterAccount.emailAddress);
                        break;
                    }
                    case "LoginSuccessSubtask": {
                        return;
                    }
                }
            }
        }
    }

    private async logout(page: Page) {
        const logoutButtonSelector = '[data-testid="confirmationSheetConfirm"]';
        console.log('Logging out...');
        await page.goto('https://x.com/logout');
        await page.waitForSelector(logoutButtonSelector);
        await page.click(logoutButtonSelector);
        await page.waitForNavigation();
        console.log('Logged out.');
    }

    private async redirect(page: Page, url: string) {
        return page.goto(url);
    }

    private useNextTwitterAccount() {

    }

    private sleep(ms: number) {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        })
    }

}

