var express = require('express');
var router = express.Router();

const crypto = require('crypto');
const fs = require('fs');
let _ = require('lodash')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/reports', function (req, res) {
  let bugReports = JSON.parse(fs.readFileSync('db/data.json'));

  res.json(bugReports);
})

router.get('/report/:id', function (req, res) {
  let bugReports = JSON.parse(fs.readFileSync('db/data.json'));
  let report = _.find(bugReports, {'id' : req.params.id})
  res.json(report)
})

router.post('/report', function(req, res) {
  var image =  req.body.b64Image

  var data = image.replace(/^data:image\/\w+;base64,/, '');

  console.log('data : ', data);

  var random_id = crypto.randomBytes(8);
  let fileName = random_id.toString('hex') + '.png'

  let pathScreeshot = 'public/images/' + fileName

  fs.writeFile(pathScreeshot, data, {encoding: 'base64'}, function(err){
    //Finished
    console.log('err : ', err);

    var bugReports = JSON.parse(fs.readFileSync('db/data.json'));
    bugReports.push({
      id: random_id.toString('hex'),
      mode: req.body.mode,
      platform: req.body.platform,
      user_agent: req.body.user_agent,
      title: req.body.title,
      repro: req.body.repro,
      screenshot: fileName
    })

    console.log('bugReports : ', bugReports);
    fs.writeFileSync('db/data.json', JSON.stringify(bugReports), 'utf-8',function(err) {
      if (err) {
        console.log(err);
      }
      res.json({
        success: true
      })
    });


  });


})

module.exports = router;
