const {
  getList,
  getPair
} = require("../middleware/puppet");

var express = require('express');
var router = express.Router();
var minutes = 1,
  the_interval = minutes * 60 * 1000;


router.get('/pair', function (req, res, next) {
  getPair().then((data) => {
    res.json(data);
  }).catch((error) => {
    console.error(error);
  });
});
router.get('/all', function (req, res, next) {
  getList().then((data) => {
    res.json(data);
  }).catch((error) => {
    console.error(error);
  });
});
router.get('/', function (req, res) {
  return res.render('index');
});
module.exports = router;