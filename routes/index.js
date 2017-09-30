var express = require('express');
var router = express.Router();

const fs = require('fs');
var bugReports = JSON.parse(fs.readFileSync('db/data.json'));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/reports', function (req, res) {
  res.json(bugReports);
})

module.exports = router;
