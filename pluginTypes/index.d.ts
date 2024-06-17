/// <amd-module name="@scom/scom-scraper/interface.ts" />
declare module "@scom/scom-scraper/interface.ts" {
    export interface ITwitterAccount {
        username: string;
        password: string;
        emailAddress: string;
    }
    export interface ITwitterConfig {
        twitterAccounts: ITwitterAccount[];
    }
    export interface ITweet {
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
    export interface IScraperConfig {
        twitterConfig?: ITwitterConfig;
    }
}
/// <amd-module name="@scom/scom-scraper/twitter/parser.ts" />
declare module "@scom/scom-scraper/twitter/parser.ts" {
    export default class Parser {
        htmlToMarkdown(html: string): string;
        reconstructTweetHtml(tweet: any, photos: any, videos: any): any;
        parseVideo(m: any): any;
        parseMediaGroups(media: any): {
            sensitiveContent: any;
            photos: any[];
            videos: any[];
        };
        parseLegacyTweet(user: any, tweet: any): {
            success: boolean;
            err: Error;
            tweet?: undefined;
        } | {
            success: boolean;
            tweet: any;
            err?: undefined;
        };
        parseAndPush(tweets: any, content: any, entryId: any, isConversation?: boolean): void;
        parseTimelineEntryItemContentRaw(content: any, entryId: string, isConversation?: boolean): any;
        parseResult(result: any): {
            success: boolean;
            err: Error;
            tweet?: undefined;
        } | {
            success: boolean;
            tweet: any;
            err?: undefined;
        };
        parseTimelineTweetsV2(timeline: any): {
            tweets: any[];
            next: any;
            previous: any;
        };
        parseRelationshipTimeline(timeline: any): {
            profiles: any[];
            next: any;
            previous: any;
        };
        parseProfile(user: any, isBlueVerified?: boolean): any;
        parseSearchTimelineUsers(timeline: any): {
            tweets: any[];
            next: any;
            previous: any;
        };
        private getAvatarOriginalSizeUrl;
    }
}
/// <amd-module name="@scom/scom-scraper/twitter/twitterScraper.ts" />
declare module "@scom/scom-scraper/twitter/twitterScraper.ts" {
    import { ITweet, ITwitterConfig } from "@scom/scom-scraper/interface.ts";
    export default class TwitterScraper {
        private _config;
        private parser;
        private _currentTwitterAccount;
        private _currentTwitterAccountIndex;
        constructor(config: ITwitterConfig);
        scrapTweetsByUsername(username: string): Promise<ITweet[]>;
        private hasMoreTweets;
        private scrap;
        private enterUserName;
        private enterPassword;
        private enterEmailAddress;
        private login;
        private logout;
        private redirect;
        private useNextTwitterAccount;
        private sleep;
    }
}
/// <amd-module name="@scom/scom-scraper" />
declare module "@scom/scom-scraper" {
    import { IScraperConfig, ITweet, ITwitterConfig } from "@scom/scom-scraper/interface.ts";
    export default class ScraperManager {
        private _twitterScraper;
        constructor(config: IScraperConfig);
        scrapTweetsByUsername(username: string): Promise<ITweet[]>;
    }
    export { ITweet, ITwitterConfig, IScraperConfig };
}
