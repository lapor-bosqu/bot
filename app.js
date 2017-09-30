var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const crypto = require('crypto');

const token = '344645337:AAEDZfgYCoy7Z2RTSjECcnPEmUvx6dODf5U';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {
  polling: true
});

var step = 0;
var newReport = [];
var mode = 'none';
var bugReports = JSON.parse(fs.readFileSync('db/data.json'));
console.log('lapor-bosqu-log: bugReports: ' + JSON.stringify(bugReports)); // DEBUG

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (step === 0 && mode === 'none') {
    if (msg.text.match(/\/reportapp/)) {
      step = 1;
      mode = 'reportapp';
      bot.sendMessage(chatId, 'Kamu pakai Android atau iOS?'); // Q1 // Android or iOS
    }
    else if (msg.text.match(/\/reportdesktop/)) {
      step = 1;
      mode = 'reportdesktop';
      bot.sendMessage(chatId, 'Operating system kamu apa?'); // Q1 // Windows, OSX, or Linux
    }
    else {
      console.log('lapor-bosqu-log: Sori: ' + JSON.stringify(msg) + ' // ' + step + ' // ' + mode + ' // ' + JSON.stringify(newReport)) // DEBUG
      bot.sendMessage(chatId, 'Sori, aku nggak pernah bisa ngertiin kamu maunya apaa...');
    }
    return;
  }

  if (step === 5 && msg.photo) {
    console.log('lapor-bosqu-log: ' + JSON.stringify(msg)); // DEBUG
    bot.downloadFile(msg.photo[0].file_id, 'public/images').then(function(filePath) {
      newReport[4] = filePath;
      console.log('lapor-bosqu-log: Screenshot saved: ' + filePath); // DEBUG
      bot.sendMessage(chatId, 'Makasih ya, bug report kamu sudah aku terima:\n' +
        'Platform/OS: ' + newReport[0] + '\n' +
        'Versi apps/browser: ' + newReport[1] + '\n' +
        'Judul bug report: ' + newReport[2] + '\n' +
        'Repro: ' + newReport[3] + '\n' +
        'Screenshot: ' + newReport[4]); // Summary & End
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
  }
  else { // mode === 'reportdesktop'
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
    screenshot: newReport[4]
  };
  bugReports.push(newBugReport);
  fs.writeFileSync('db/data.json', JSON.stringify(bugReports), function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('lapor-bosqu-log: Append new data to db/data.json'); // DEBUG
    step = 0;
    mode = 'none';
    newReport = [];
  });
  console.log('lapor-bosqu-log: Save End'); // DEBUG
}


app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
