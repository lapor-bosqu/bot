const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = '344645337:AAEDZfgYCoy7Z2RTSjECcnPEmUvx6dODf5U';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {
  polling: true
});

var step = 0;
var reports = [];
var mode = 'none';

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
      console.log('lapor-bosqu-log: ' + JSON.stringify(msg) + ' // ' + step + ' // ' + mode + ' // ' + JSON.stringify(reports)) // DEBUG
      bot.sendMessage(chatId, 'Sori, aku nggak pernah bisa ngertiin kamu maunya apaa...');
    }
    return;
  }

  if (step === 5 && msg.photo) {
    console.log('lapor-bosqu-log: ' + JSON.stringify(msg)); // DEBUG
    bot.downloadFile(msg.photo[0].file_id, 'uploads').then(function(filePath) {
      reports[4] = filePath;
      console.log('lapor-bosqu-log: Screenshot saved: ' + filePath); // DEBUG
    });
  }

  if (mode === 'reportapp') {
    switch (step) {
      case 1:
        step++;
        reports[0] = msg.text;
        bot.sendMessage(chatId, 'Versi apps-nya apa?'); // Q2
        break;
      case 2:
        step++;
        reports[1] = msg.text;
        bot.sendMessage(chatId, 'Kasih judul ya untuk report ini'); // Q3
        break;
      case 3:
        step++;
        reports[2] = msg.text;
        bot.sendMessage(chatId, 'Gimana langkah-langkah terjadi bug-nya (repro)?'); // Q4
        break;
      case 4:
        step++;
        reports[3] = msg.text;
        bot.sendMessage(chatId, 'Minta screenshot layar kamu ya'); // Q5
        break;
      case 5:
        bot.sendMessage(chatId, 'Makasih ya, bug report kamu sudah aku terima:\n' +
          'Platform: ' + reports[0] + '\n' +
          'Versi apps: ' + reports[1] + '\n' +
          'Judul bug report: ' + reports[2] + '\n' +
          'Repro: ' + reports[3] + '\n' +
          'Screenshot: ' + reports[4]); // Summary & End
        saveBugReport();
        bot.sendPhoto(chatId, 'assets/tengkyu-bosqu.jpg');
    }
  }
  else { // mode === 'reportdesktop'
    switch (step) {
      case 1:
        step++;
        reports[0] = msg.text;
        bot.sendMessage(chatId, 'Browser kamu apa?'); // Q2
        break;
      case 2:
        step++;
        reports[1] = msg.text;
        bot.sendMessage(chatId, 'Kasih judul ya untuk report ini'); // Q3
        break;
      case 3:
        step++;
        reports[2] = msg.text;
        bot.sendMessage(chatId, 'Gimana langkah-langkah terjadi bug-nya (repro)?'); // Q4
        break;
      case 4:
        step++;
        reports[3] = msg.text;
        bot.sendMessage(chatId, 'Minta screenshot layar kamu ya'); // Q5
        break;
      case 5:
        bot.sendMessage(chatId, 'Makasih ya, bug report kamu sudah aku terima:\n' +
          'OS: ' + reports[0] + '\n' +
          'Browser: ' + reports[1] + '\n' +
          'Judul bug report: ' + reports[2] + '\n' +
          'Repro: ' + reports[3] + '\n' +
          'Screenshot: ' + reports[4]); // Summary & End
        saveBugReport();
        bot.sendPhoto(chatId, 'assets/tengkyu-bosqu.jpg');
    }
  }
});

function saveBugReport() {
  console.log('lapor-bosqu-log: Save Start'); // DEBUG
  var bugReport = {
    mode: mode,
    platform: reports[0],
    user_agent: reports[1],
    title: reports[2],
    repro: reports[3],
    screenshot: 'TBA'
  };
  fs.appendFile('db/data.json', JSON.stringify(bugReport) + '\n', function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('lapor-bosqu-log: Append new data to db/data.json'); // DEBUG
    step = 0;
    mode = 'none';
    reports = [];
  });
  console.log('lapor-bosqu-log: Save End'); // DEBUG
}
