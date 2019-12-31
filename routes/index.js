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

const pup = puppeteer.launch({
  args: ['--no-sandbox',
    '--disable-setuid-sandbox'
  ],
  headless: true
});

router.get('/pair', function (req, res, next) {
  puppet().then((data) => {
    res.json(data);
  }).catch((error) => {
    //handle your error
  });
});
router.get('/all', function (req, res, next) {
  puppet().then(() => {
    res.json(sorted);
  }).catch((error) => {
    //handle your error
  });
});
router.get('/', function (req, res) {
  return res.render('index');
});



const puppet = function () {


  return new Promise((resolve, reject) => {
    pup
      .then(browser => {
        browser.createIncognitoBrowserContext();
        return browser.newPage();
      })
      .then(async function (page) {
        try {
          page.setRequestInterception(true);
          page.on('request', (req) => {
            if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
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
        return page.content();
      })
      .then(html => {
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
      }).then(() => {
        return resolve(obj2);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

function scrape(html, obj, fill) {
  $('.rect', html).each(function (i, elem) {
    // console.log($(this).text());
    obj[i] = {};
    fill[i] = $(this).text().split('%');
    obj[i]['name'] = fill[i][1];
    obj[i]['value'] = parseFloat(fill[i][0]);
  });
  console.log("Saving to file....");
  var temp = JSON.stringify(obj);
  var max = getMax(obj, "value");
  var min = getMin(obj, "value");
  var str = max.name.concat(min.name);
  var str2 = min.name.concat(max.name);
  const obj2 = [{

    pair: str
  }, {

    pair: str2
  }];
  console.log(obj2);
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