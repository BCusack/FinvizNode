const cheerio = require('cheerio');
const listArray = require("../public/convertcsv.json");
// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
var $ = require('cheerio');
puppeteer.use(AdblockerPlugin());

var minutes = 1,
    the_interval = minutes * 60 * 1000;

// launch puppeteer
async function puppet(url) {
    const browser = await launchHelper();
    const page = await browser.newPage();
    try {
        await page.goto(url);
    } catch (error) {
        console.error(error);
    }
    console.log("Loading Page.....");
    const html = await page.content();
    let data = scrape(html);
    browser.close();
    return (data);
}

async function launchHelper() {
    try {
        return await puppeteer.launch({
            args: ['--no-sandbox',
                '--disable-setuid-sandbox'
            ],
            headless: true
        }).then(console.log("launching"));
    } catch (error) {
        console.error(error);
    }
}
exports.getList = getList;
exports.getPair = getPair;



function scrape(html) {

    const $ = cheerio.load(html);
    let fill = [];
    let obj = [{
        name: String,
        value: Number
    }];
    let sorted = [];
    $('.rect').each(function (i, elem) {
        obj[i] = {};
        fill[i] = $(this).text().split('%');
        obj[i]['name'] = fill[i][1];
        obj[i]['value'] = parseFloat(fill[i][0]);
    });
    console.log("Data collected....");
    return sorted = obj.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));


}

async function getPair(url) {
    let ls = await puppet(url);
    let max = await getMax(ls, "value");
    let min = await getMin(ls, "value");
    let str = max.name.concat(min.name);
    let str2 = min.name.concat(max.name);
    if (checkPair(str)) {
        return obj2 = [{
            pair: str,
            direction: 1,
            range: (parseFloat(max.value) - parseFloat(min.value))
        }];
    } else {
        return obj2 = [{
            pair: str2,
            direction: 0,
            range: (parseFloat(max.value) - parseFloat(min.value))
        }];
    }

}

function getList(url) {
    let list = puppet(url)
    return (list);
}

async function getMax(arr, prop) {
    let max;
    for (var i = 0; i < arr.length; i++) {
        if (!max || parseFloat(arr[i][prop]) > parseFloat(max[prop]))
            max = arr[i];
    }
    return max;
}

async function getMin(arr, prop) {
    var min;

    for (var i = 0; i < arr.length; i++) {
        if (!min || parseFloat(arr[i][prop]) < parseFloat(min[prop]))
            min = arr[i];
    }
    return min;
}

function checkPair(pair) {
    const list = listArray;
    const found = list.find(element => element === pair);
    if (found !== undefined) {
        return true;
    } else {
        return false;
    }
}