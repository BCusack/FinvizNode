const {
  getList,
  getPair
} = require("../middleware/puppet");

var express = require('express');
var router = express.Router();
const url = 'https://finviz.com/forex_performance.ashx';

// get pair values
router.get('/pair/day', function (req, res, next) {
  getPair(url + "?v=1").then((data) => {
    res.json(data);
  }).catch((error) => {
    console.error(error);
  });
});
router.get('/pair/week', function (req, res, next) {
  getPair(url + "?v=2").then((data) => {
    res.json(data);
  }).catch((error) => {
    console.error(error);
  });
});
router.get('/pair/YTD', function (req, res, next) {
  getPair(url + "?v=7").then((data) => {
    res.json(data);
  }).catch((error) => {
    console.error(error);
  });
});
router.get('/pair/MTD', function (req, res, next) {
  getPair(url + "?v=8").then((data) => {
    res.json(data);
  }).catch((error) => {
    console.error(error);
  });
});

// get all values
router.get('/all/day', function (req, res, next) {
  getList(url).then((data) => {
    res.json(data);
  }).catch((error) => {
    console.error(error);
  });
});
// index route
router.get('/', function (req, res) {
  return res.render('index');
});
module.exports = router;