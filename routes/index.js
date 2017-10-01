var express = require('express');
var router = express.Router();

const crypto = require('crypto');
const fs = require('fs');
let _ = require('lodash')

const TelegramBot = require('node-telegram-bot-api');

const token = '344645337:AAEDZfgYCoy7Z2RTSjECcnPEmUvx6dODf5U';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {
  polling: true
});

var step = 0;
var newReport = [];
var mode = 'none';
var bugReports = JSON.parse(fs.readFileSync('db/data.json'));
// console.log('lapor-bosqu-log: bugReports: ' + JSON.stringify(bugReports)); // DEBUG
let hostURL = 'http://128.199.102.9:3000'

// id chat
let groupId = '-294843717' // anggaplah grup DTB
let personId = '73953756' // anggaplah reporter id Telegram

bot.on('message', (msg) => {
  console.log('isi msg kalo dari grup : ', msg);
  const chatId = msg.chat.id;

  if (msg.chat.type == 'group') {
    let regexPattern = /benar/gi
    if (msg.text.match(regexPattern)) {
      bot.sendMessage(personId, ` Yeay! Laporan bug kamu memang benar adannya!
        sebagai ucapan terimakasih
        squad DTB kasih kamu 99 highfive!

        Mantab Jiwa BosQu!!!`)
      bot.sendMessage(groupId, `Siap Bos Qu!,
        udah aku kirim ya 99 highfive nya ke @dikyarga`)
    }
  } else if (step === 0 && mode === 'none') {
    if (msg.text.match(/app/gi)) {
      step = 1;
      mode = 'reportapp';
      console.log('chatId +++++++++++++++++++++++++++++++++++++ ', chatId);
      bot.sendMessage(chatId, 'Kamu pakai Android atau iOS?'); // Q1 // Android or iOS
    } else if (msg.text.match(/web/gi)) {
      step = 1;
      mode = 'reportdesktop';
      bot.sendMessage(chatId, 'Operating system kamu apa?'); // Q1 // Windows, OSX, or Linux
    } else {
      console.log('lapor-bosqu-log: Sori: ' + JSON.stringify(msg) + ' // ' + step + ' // ' + mode + ' // ' + JSON.stringify(newReport)) // DEBUG
      bot.sendMessage(chatId, 'Sori, aku nggak pernah bisa ngertiin kamu maunya apaa... Bos Qu');
    }
    return;
  }

  if (step === 5 && msg.photo) {
    console.log('lapor-bosqu-log +++++++: ' + JSON.stringify(msg)); // DEBUG
    bot.downloadFile(msg.photo[0].file_id, 'public/images').then(function(filePath) {
      newReport[4] = filePath;
      console.log('lapor-bosqu-log: Screenshot saved: ' + filePath); // DEBUG
      bot.sendMessage(chatId, 'Makasih ya, bug report kamu sudah aku terima:\n' +
        'Platform/OS: ' + newReport[0] + '\n' +
        'Versi apps/browser: ' + newReport[1] + '\n' +
        'Judul bug report: ' + newReport[2] + '\n' +
        'Repro: ' + newReport[3] + '\n' +
        'Screenshot: ' + newReport[4].replace('public/images', '')); // Summary & End
      saveBugReport();
      bot.sendPhoto(chatId, 'assets/tengkyu-bosqu.jpg');
    });
  }

  if (mode === 'reportapp') {
    switch (step) {
      case 1:
        step++;
        newReport[0] = msg.text;
        bot.sendMessage(chatId, 'Versi apps-nya apa?'); // Q2
        break;
      case 2:
        step++;
        newReport[1] = msg.text;
        bot.sendMessage(chatId, 'Kasih judul ya untuk report ini'); // Q3
        break;
      case 3:
        step++;
        newReport[2] = msg.text;
        bot.sendMessage(chatId, 'Gimana langkah-langkah terjadi bug-nya (repro)?'); // Q4
        break;
      case 4:
        step++;
        newReport[3] = msg.text;
        bot.sendMessage(chatId, 'Minta screenshot layar kamu ya'); // Q5
        break;
    }
  } else { // mode === 'reportdesktop'
    switch (step) {
      case 1:
        step++;
        newReport[0] = msg.text;
        bot.sendMessage(chatId, 'Browser kamu apa?'); // Q2
        break;
      case 2:
        step++;
        newReport[1] = msg.text;
        bot.sendMessage(chatId, 'Kasih judul ya untuk report ini'); // Q3
        break;
      case 3:
        step++;
        newReport[2] = msg.text;
        bot.sendMessage(chatId, 'Gimana langkah-langkah terjadi bug-nya (repro)?'); // Q4
        break;
      case 4:
        step++;
        newReport[3] = msg.text;
        bot.sendMessage(chatId, 'Minta screenshot layar kamu ya'); // Q5
        break;
    }
  }
});

function saveBugReport() {
  console.log('lapor-bosqu-log: Save Start'); // DEBUG
  var random_id = crypto.randomBytes(8);
  var newBugReport = {
    id: random_id.toString('hex'),
    mode: mode,
    platform: newReport[0],
    user_agent: newReport[1],
    title: newReport[2],
    repro: newReport[3],
    screenshot: newReport[4].replace('public/images', '')
  };

  bugReports.push(newBugReport);

  console.log('bugReports : ', bugReports);
  fs.writeFileSync('db/data.json', JSON.stringify(bugReports), 'utf-8', function(err) {
    if (err) {
      console.log(err);
    }
    console.log('lapor-bosqu-log: Append new data to db/data.json'); // DEBUG
    step = 0;
    mode = 'none';
    newReport = [];
    console.log('lapor-bosqu-log: Save End'); // DEBUG

  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

router.get('/reports', function(req, res) {
  let bugReports = JSON.parse(fs.readFileSync('db/data.json'));

  res.json(bugReports);
})

router.get('/report/:id', function(req, res) {
  let bugReports = JSON.parse(fs.readFileSync('db/data.json'));
  let report = _.find(bugReports, {
    'id': req.params.id
  })
  res.json(report)
})

router.post('/validate', function(req, res) {
  let bugReports = JSON.parse(fs.readFileSync('db/data.json'));
  let report = _.find(bugReports, {
    'id': req.params.id
  })
})

router.post('/report', function(req, res) {
  var image = req.body.b64Image

  var data = image.replace(/^data:image\/\w+;base64,/, '');

  // console.log('data : ', data);

  var random_id = crypto.randomBytes(8);
  let fileName = random_id.toString('hex') + '.png'

  let pathScreeshot = 'public/images/' + fileName

  fs.writeFile(pathScreeshot, data, {
    encoding: 'base64'
  }, function(err) {
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

    bot.sendMessage(personId, 'Bug report kamu sudah aku terima ya Bos Qu :\n' +
      'Platform : ' + req.body.platform + '\n' +
      'Versi apps/browser: ' + req.body.user_agent + '\n' +
      'Judul bug report: ' + req.body.title + '\n' +
      'Repro: ' + req.body.repro + '\n' +
      'Screenshot: ' + fileName).then(() => {
      console.log('excuted');
      // console.log('bugReports : ', bugReports);
      fs.writeFileSync('db/data.json', JSON.stringify(bugReports), 'utf-8', function(err) {
        if (err) {
          console.log('err when saved : ', err);
        }
      });

      console.log('saved ?');

      bot.sendMessage(groupId, `Hallo squad DTB yang keceh abis, ada yg lapor nih bos qu.
        Katanya ada bug di https://bukalapak.com/products :
         icon Kategori nya salah, ini dia SS bos qu : ${hostURL}/images/${fileName}`).then(() => {

      })

      res.json({
        success: true
      })

    }).catch(err => {
      bot.sendMessage(personId, err)
    })
    console.log('executed');
  });


})

module.exports = router;
