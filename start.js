const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
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
      bot.sendMessage(chatId, 'Sori, aku nggak pernah bisa ngertiin kamu maunya apaa...');
    }
    return;
  }

  if (mode === 'reportapp') {
    switch (step) {
      case 1:
        step++;
        reports[0] = msg.text;
        bot.sendMessage(chatId, 'Versi apps-nya apa?'); // Q2 // Versi apps-nya
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
        step = 0;
        mode = 'none';
        reports = [];
        bot.sendMessage(chatId, 'Thanx & Summary: xxx1'); // END
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
        step = 0;
        mode = 'none';
        reports = [];
        bot.sendMessage(chatId, 'Thanx & Summary: xxx2'); // END
    }
  }
});

// PUPURU DEBUG
// bot.onText(/\/d/, (msg, match) => {
//   const chatId = msg.chat.id;
//   bot.sendMessage(chatId, 'DEBUG -- step = ' + step + '\n' + JSON.stringify(reports) + '\nmode: ' + mode);
// });
