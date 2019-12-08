var express = require('express');
var router = express.Router();
var fs = require('fs');
var $ = require('cheerio');
const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: 'out.csv',
  header: [{
      id: 'name',
      title: 'Name'
    },
    {
      id: 'value',
      title: 'Value'
    }
  ]
});
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
  const url = 'https://finviz.com/forex_performance.ashx';
  let obj = [];
  let fill = [];
  puppet(url, obj, fill);

  var minutes = 2,
    the_interval = minutes * 60 * 1000;
  setInterval(function () {
    let newDate = new Date(Date.now());

    console.log("I am doing my", minutes, "minutes check at :", newDate);
    // do your stuff here
    puppet(url, obj, fill);
  }, the_interval);

});


module.exports = router;

function puppet(url, obj, fill) {
  puppeteer
    .launch({
      headless: true
    })
    .then(function (browser) {
      console.log("Loading Browser.....");
      return browser.newPage();
    })
    .then(function (page) {
      page.setRequestInterception(true);
      page.on('request', (req) => {
        if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
          req.abort();
        } else {
          req.continue();
        }
      });

      return page.goto(url)
        .then(function () {

          console.log("Loading Page.....");
          return page.content();
        });
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
  var obj2 = {
    "pair1": str,
    "pair2": str2
  };
  csvWriter
    .writeRecords(obj2)
    .then(() => console.log('The CSV file was written successfully'));


  fs.writeFile('temp.json', temp, function (err, obj) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully Written to: temp.js");
    }
  });
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