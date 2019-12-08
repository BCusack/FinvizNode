const request = require('request');
const cheerio = require('cheerio');
let scoreArr = titleArr = [];

var chScraper = function () {
    request('https://www.reddit.com/r/javascript/', (err, res, body) => {
        //Load HTML body into cheerio
        const $ = cheerio.load(body);
        //Scrape karma scores
        $('.score').attr('title', (i, val) => {
            scoreArr.push(val);
        });
        //Scrape post titles
        $('a.title').each((el) => {
            titleArr.push(el.text());
        });
    });
    console.log("score", scoreArr);
    //[12, 134, ...] Scores of top posts of r/movies at time of writing
    console.log(titleArr);
    //["Showoff Saturday...", "Making the globe...", ...]}
}
module.exports = chScraper;