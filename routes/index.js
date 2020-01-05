var express = require('express');
const cheerio = require('cheerio');
const listArray = require("../public/convertcsv.json");

var router = express.Router();
var $ = require('cheerio');
const puppeteer = require('puppeteer');
const url = 'https://finviz.com/forex_performance.ashx';

let sorted = [];
var minutes = 1,
  the_interval = minutes * 60 * 1000;


router.get('/pair', function (req, res, next) {
  puppet().then((data) => {
    res.json(data);
  }).catch((error) => {
    console.error(error);
  });
});
router.get('/all', function (req, res, next) {
  puppet().then(() => {
    res.json(sorted);
  }).catch((error) => {
    console.error(error);
  });
});
router.get('/', function (req, res) {
  return res.render('index');
});

async function puppet() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox',
      '--disable-setuid-sandbox'
    ],
    headless: false
  });
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
  await page.goto(url);
  console.log("Loading Page.....");
  const html = await page.content();
  let data = scrape(html);
  browser.close();
  return (data);
}

function scrape(html) {
  const $ = cheerio.load(html);
  let newsHeadlines = [];
  let fill = [];
  let obj = [];
  $('.rect').each(function (i, elem) {
    obj[i] = {};
    fill[i] = $(this).text().split('%');
    obj[i]['name'] = fill[i][1];
    obj[i]['value'] = parseFloat(fill[i][0]);
    var temp = JSON.stringify(obj);
    newsHeadlines.push({
      temp
    });
  });
  sorted = obj.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
  console.log("Data collected....");
  var max = getMax(obj, "value");
  var min = getMin(obj, "value");
  var str = max.name.concat(min.name);
  var str2 = min.name.concat(max.name);
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

function getMax(arr, prop) {
  var max;
  for (var i = 0; i < arr.length; i++) {
    if (!max || parseFloat(arr[i][prop]) > parseFloat(max[prop]))
      max = arr[i];
  }
  return max;
}

function getMin(arr, prop) {
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
module.exports = router;