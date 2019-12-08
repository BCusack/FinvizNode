const puppeteer = require('puppeteer');
const $ = require('cheerio');
const fs = require('fs');

var scraper = function () {
    const url = 'https://finviz.com/forex_performance.ashx';
    let obj = [];
    let fill = [];
    puppeteer
        .launch()
        .then(function (browser) {
            return browser.newPage();
        })
        .then(async function (page) {
            console.log("loading Page....");
            await page.setViewport({
                width: 1920,
                height: 1080
            });
            await page.setRequestInterception(true);
            // page.setJavaScriptEnabled(false);
            page.on('request', (req) => {
                if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
                    req.abort();
                } else {
                    req.continue();
                }
            });
            await page.goto(url);
            await page.content();
            return;
        })
        .then(function (html) {
            console.log("Begin Scraping....");

            scrape(html, obj, fill);

        })
        .catch(function (err) {
            //handle error
            console.log(err);

        });
}


module.exports = scraper;

function scrape(html, obj, fill) {
    $('.rect', html).each(function (i, elem) {
        console.log($(this).text());
        obj[i] = {};
        fill[i] = $(this).text().split('%');
        obj[i]['name'] = fill[i][1];
        obj[i]['value'] = fill[i][0];
    });
    console.log("Saving to file....");
    var temp = JSON.stringify(obj);
    fs.writeFile('temp.json', temp, function (err, data) {
        if (err)
            console.log(err);
        console.log("Successfully Written to File.");
    });
}