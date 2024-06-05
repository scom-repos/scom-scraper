import TwitterScraper from "./twitter/twitterScraper";

export interface ScraperConfig {
    twitterConfig?: ITwitterConfig;
}

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

export default class ScraperManager {
    private _twitterScraper: TwitterScraper;
    constructor(config: ScraperConfig) {
        this._twitterScraper = new TwitterScraper(config.twitterConfig);
    }

    scrapTweetsByUsername(username: string): Promise<ITweet[]> {
        return this._twitterScraper.scrapTweetsByUsername(username);
    }
}