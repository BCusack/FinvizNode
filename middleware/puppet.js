const cheerio = require('cheerio');
const listArray = require("../public/convertcsv.json");
const puppeteer = require('puppeteer');
var $ = require('cheerio');

const url = 'https://finviz.com/forex_performance.ashx';

// launch puppeteer
async function puppet() {
    const browser = await launchHelper();
    const page = await browser.newPage();
    try {
        page.setRequestInterception(true);
        page.setViewport({
            width: 1920,
            height: 1080
        });
        page.on('request', (req) => {
            if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image' || req.resourceType() == 'media') {
                req.abort();
            } else {
                req.continue();
            }
        });
    } catch (err) {
        console.log(err);
    }
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
exports.getList = getList;
exports.getPair = getPair;

async function launchHelper() {
    return await puppeteer.launch({
        args: ['--no-sandbox',
            '--disable-setuid-sandbox'
        ],
        headless: true
    });
}

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

async function getPair() {
    let ls = await puppet();
    let max = await getMax(ls, "value");
    let min = await getMin(ls, "value");
    let str = max.name.concat(min.name);
    let str2 = min.name.concat(max.name);
    if (checkPair(str)) {
        return obj2 = [{
            pair: str,
            direction: 1
        }];
    } else {
        return obj2 = [{
            pair: str2,
            direction: 0
        }];
    }

}

function getList() {
    let list = puppet()
    return (list);
}

async function getMax(arr, prop) {
    var max;
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