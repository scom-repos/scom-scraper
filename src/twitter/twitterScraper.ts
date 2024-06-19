import puppeteer, { Page, Browser } from "puppeteer";
import Parser from "./parser";
import { ITweet, ITwitterAccount, ITwitterConfig } from "../interface";

export default class TwitterScraper {
    private _config: ITwitterConfig;
    private parser: Parser;
    private _currentTwitterAccount: ITwitterAccount;
    private _currentTwitterAccountIndex: number = -1;


    constructor(config: ITwitterConfig) {
        this._config = config;
        if (config.twitterAccounts?.length > 0) {
            this._currentTwitterAccount = config.twitterAccounts[0];
            this._currentTwitterAccountIndex = 0;
        }
        this.parser = new Parser();
    }

    async scrapTweetsByUsername(username: string, since: number = 0, maxTweets?: number): Promise<ITweet[]> {
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
            const tweets = await this.scrap(browser, page, username, since, maxTweets);
            return tweets;
        }
        catch (e) {
            return [];
        }
        finally {
            console.log('closing browser');
            await browser.close();
        }
    }

    private hasMoreTweets(data: any) {
        const instructions = data.data.user.result.timeline_v2.timeline.instructions;
        const timelineAddEntries = instructions.filter(v => v.type === "TimelineAddEntries");
        console.log('timelineAddEntries', timelineAddEntries)
        if (timelineAddEntries.length === 0) return false;
        return timelineAddEntries[0].entries?.length > 2;
    }

    private async scrap(browser: Browser, page: Page, username: string, since: number = 0, maxTweets?: number): Promise<ITweet[]> {
        let tweets: ITweet[] = [];
        console.log('scrap', this._currentTwitterAccount);
        console.log("Logging in...");
        await this.login(page);
        await page.waitForNavigation();
        console.log("Redirecting to target page...");
        await this.redirect(page, `https://x.com/${username}`);

        let response = null;
        let hasMore = true;
        do {
            try {
                try {
                    response = await page.waitForResponse(res => res.url().indexOf('UserTweets') >= 0 && res.request().method() === 'GET');
                }
                catch(e) {
                    if(tweets.length > 0)
                        return tweets;
                }
                if (!response.ok()) {
                    console.log('Failed', await response.text());
                    await this.logout(page);
                    const accountDepleted = this.useNextTwitterAccount();
                    if (accountDepleted) {
                        console.log('Account depleted.');
                        return [];
                    }
                    console.log('switchig account...', this._currentTwitterAccount)
                    return this.scrap(browser, page, username);
                }

                const responseData = await response.json();
                const content = this.parser.parseTimelineTweetsV2(responseData);
                tweets = [...tweets, ...content.tweets];
                let isTimeValid = true;
                if (since && tweets.length) {
                    const oldestTweet = tweets[tweets.length - 1];
                    isTimeValid = (oldestTweet.timestamp * 1000) > since;
                }
                hasMore = isTimeValid && (!maxTweets || tweets.length < maxTweets) && this.hasMoreTweets(responseData);
                if (hasMore) {
                    console.log("Scrolling down");
                    await this.sleep(2000)
                    await page.evaluate(() => {
                        window.scrollTo(0, document.body.scrollHeight);
                    });
                }
            }
            catch (e) {
                console.log(e);
                await this.logout(page);
                const accountDepleted = this.useNextTwitterAccount();
                if (accountDepleted) {
                    console.log('Account depleted.');
                    return [];
                }
                return this.scrapTweetsByUsername(username);
            }

        } while (hasMore);
        if (maxTweets) {
            tweets = tweets.slice(0, maxTweets);
        }
        if (since) {
            tweets = tweets.filter(v => (v.timestamp * 1000) >= since);
        }
        return tweets;
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

    private useNextTwitterAccount(): boolean {
        const newIndex = this._currentTwitterAccountIndex++;
        if (newIndex >= this._config.twitterAccounts.length) return true;
        this._currentTwitterAccount = this._config.twitterAccounts[newIndex];
        return false;
    }

    private sleep(ms: number) {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        })
    }

}

