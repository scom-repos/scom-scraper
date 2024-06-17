"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twitterScraper_1 = __importDefault(require("./twitter/twitterScraper"));
class ScraperManager {
    constructor(config) {
        this._twitterScraper = new twitterScraper_1.default(config.twitterConfig);
    }
    scrapTweetsByUsername(username) {
        return this._twitterScraper.scrapTweetsByUsername(username);
    }
}
exports.default = ScraperManager;
