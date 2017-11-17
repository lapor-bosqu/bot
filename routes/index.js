var express = require('express');
var JiraClient = require('jira-connector');
const crypto = require('crypto');
const fs = require('fs');
let _ = require('lodash')
const TelegramBot = require('node-telegram-bot-api');
var Datastore = require('nedb');  

var router = express.Router();

// DB
var reportsDB = new Datastore({ filename: 'db/reports.db', autoload: true });  

const token = '344645337:AAEDZfgYCoy7Z2RTSjECcnPEmUvx6dODf5U';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {
  polling: true
});


// console.log('lapor-bosqu-log: bugReports: ' + JSON.stringify(bugReports)); // DEBUG
let hostURL = 'http://udin.us:3000'

// id chat
let groupId = '-294843717' // anggaplah grup SHG
let personId = '73953756' // anggaplah reporter id Telegram

var jira = new JiraClient( {
  host: 'lapor-bosqu.atlassian.net',
  basic_auth: {
      username: 'admin',
      password: 'laporbosqu'
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

router.get('/reports', function(req, res) {

  reportsDB.find({}, (err, reports) => {
    console.log('reports : ', reports)
    res.json(reports)
  })
})

router.get('/report/:id', function(req, res) {
  reportsDB.findOne({
    id: req.params.id
  }, (err, report) => {
    if(report) {
      res.json(report)
    } else {
      res.json({})
    }
  })
})

// jira.issue.getIssue({
//   issueId: 'BAB-14'
// }, function(error, issue) {
//   if(error){
//     console.log('error : ', error)
//   }

//   console.log('issue : ', issue)
// })

router.get('/report/:id/convert-to-jira', function(req, res){
  reportsDB.findOne({
    id: req.params.id
  }, (err, report) => {
    if(report) {
      jira.issue.createIssue({
        fields: {
          issuetype: {
            id: "10004"
          },
          project: {
            id: "10000"
          },
          summary: report.title || "ini bug dari lapor bosqu"
        } 
      }, function(err, newIssue) {
        if(err) {
          console.log('err : ', err, err.errors)
        } else {
          console.log('new issue : ', newIssue)
          res.json({
            success: true,
            message: 'success convert to jira ',
            newIssue: newIssue
          })     
        }
      })
      
    } else {
      res.json({
        success: false,
        message: 'not found report with id : ' + req.params.id
      })
    }
  })
})

router.post('/validate', function(req, res) {

})

router.post('/report', function(req, res) {
  let resultResponse = {
    success: false,
    message: 'error',
    report: null
  }
  var image = req.body.base64Image

  if(image == undefined) {
    resultResponse.message = 'please attach an image'
    res.json(resultResponse)
  }

  var data = image.replace(/^data:image\/\w+;base64,/, '');

  console.log('data image : ', data);

  var random_id = crypto.randomBytes(8);
  let fileName = random_id.toString('hex') + '.png'

  let pathScreeshot = 'public/images/' + fileName

  fs.writeFile(pathScreeshot, data, {
    encoding: 'base64'
  }, function(err) {
    //Finished
    console.log('err : ', err);

    reportsDB.insert({
      id: random_id.toString('hex'),
      platform: req.body.platform || '-',
      userAgent: req.body.user_agent || '-',
      title: req.body.title || '-',
      reporter: req.body.reporter || 'anon',
      repro: req.body.repro || '-',
      screenshot: fileName,
      createdAt: Date.now(),
      status: req.body.status || 'received',
      saverity: req.body.saverity || 'medium',
      osVersion: req.body.osVersion || '-',
      appVersion: req.body.appVersion || '-',
      browserVersion: req.body.browserVersion || '-',
      deviceType: req.body.deviceType || '-',
      deviceManufacturer: req.body.deviceManufacturer || '-',
      deviceId: req.body.deviceId || '-',
      userId: req.body.userId || '-1',
      screenReferer: req.body.screenReferer || '-'
    }, (err, report) => {
      if(err) {
        resultResponse.message = "error when trying to save report : " + err
        res.json(resultResponse)
      }

      console.log('req.body.title inserted', report)
      resultResponse.success = true
      resultResponse.message = 'success save report'
      resultResponse.report = report
      res.json(resultResponse)
    })

    bot.sendMessage(groupId, `Hallo squad DTB yang keceh abis, ada yg lapor nih bos qu.
    Katanya ada bug di https://bukalapak.com/products :
     icon Kategori nya salah, ini dia SS bos qu : ${hostURL}/images/${fileName}`).then(() => {

    }).catch(err => {
      console.log('error when trying to sent : ', err)
    })
    console.log('executed');
  });
})


module.exports = router;
