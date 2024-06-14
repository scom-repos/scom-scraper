import { IScraperConfig, ITweet, ITwitterConfig } from "./interface";
import TwitterScraper from "./twitter/twitterScraper";

export default class ScraperManager {
    private _twitterScraper: TwitterScraper;

    constructor(config: IScraperConfig) {
        this._twitterScraper = new TwitterScraper(config.twitterConfig);
    }

    scrapTweetsByUsername(username: string): Promise<ITweet[]> {
        return this._twitterScraper.scrapTweetsByUsername(username);
    }
}