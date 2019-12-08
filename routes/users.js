var express = require('express');
var router = express.Router();
var data = require('../public/data/temp.json')
/* GET users listing. */
router.get('/', function (req, res, next) {
  var values = data;
  res.status(200).send(values);
});

module.exports = router;
