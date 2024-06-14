import ScraperManager from "../src";
import config from "./data/config";
(async() => {
    const scraperManager = new ScraperManager(config);
    const tweets = await scraperManager.scrapTweetsByUsername('openswapdex');
    console.log(`Total tweets scraped: ${tweets.length}`);
})();