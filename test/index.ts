import ScraperManager from "../src";
import config from "./data/config";
(async() => {
    const scraperManager = new ScraperManager({
        twitterConfig: {
            username: config.TWITTER_USERNAME,
            password: config.TWITTER_PASSWORD,
            emailAddress: config.TWITTER_EMAIL_ADDRESS
        }
    });
    const tweets = await scraperManager.scrapTweetsByUsername('openswapdex');
    console.log(tweets);
})();