import puppeteer from "puppeteer";
import Parser from "./parser";

interface ITwitterConfig {
    username: string;
    password: string;
    emailAddress: string;
}

interface ITweet {
    conversationId: string;
    id: string;
    hashtags: any[];
    likes: number;
    mentions: any[];
    name: string;
    permanentUrl: string;
    photos: any[];
    replies: number;
    retweets: number;
    text: string;
    thread: any[];
    urls: [];
    userId: string;
    username: string;
    videos: any[];
    isQuoted: boolean;
    isReply: boolean;
    isRetweet: boolean;
    isPin: boolean;
    sensitiveContent: boolean;
    timeParsed: Date;
    timestamp: number;
    html: string;
    views: number;
}

export default class TwitterScraper {
    private _config: ITwitterConfig;
    private parser: Parser;

    constructor(config: ITwitterConfig) {
        this._config = config;
        this.parser = new Parser();
    }

    scrapTweetsByUsername (username: string): Promise<ITweet[]> {
        return new Promise(async (resolve, reject) => {
            let tweets: ITweet[] = [];
            try {
                // Launch the browser and open a new blank page
                const browser = await puppeteer.launch({
                    headless: true,
                    args: ["--no-sandbox"]
                });
                let timeout = setTimeout(async () => {
                    console.log('timeout')
                    await browser.close();
                    resolve(tweets);
                }, 30000)
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
    
                console.log("Entering password")
                await page.type('[name="password"]', this._config.password);
                await page.keyboard.press("Enter");
            
                console.log("Logging in")
                await page.waitForNavigation();
                await page.waitForSelector('[data-testid="tweet"]');
                
                console.log("Home page")
    
                const userTweetsURL = [];
    
                page.on('response', async res => {
                    if(res.url().indexOf('UserTweets') >= 0 && userTweetsURL.indexOf(res.url()) < 0) {
                        userTweetsURL.push(res.url())
                        await page.waitForSelector('[data-testid="tweet"]');
                        if(!res.ok) {
                            console.log(await res.text());
                            resolve(tweets);
                        }
                        const result = await res.json();
                        const content = this.parser.parseTimelineTweetsV2(result);
                        tweets = [...tweets, ...content.tweets];
                        await page.evaluate(() => {
                            window.scrollTo(0, document.body.scrollHeight)
                        });
                        clearTimeout(timeout);
                        timeout = setTimeout(async () => {
                            await browser.close();
                            resolve(tweets);
                        }, 5000)
                    }
                })
                await page.goto(`https://x.com/${username}`);
                console.log("Scraping tweets...");
            }
            catch (e) {
                resolve(tweets);
            }
        })
    }

}

