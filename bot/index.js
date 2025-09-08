const { Telegraf } = require('telegraf');
const { ethers } = require('ethers');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const provider = new ethers.JsonRpcProvider(process.env.DOMA_RPC_URL);

bot.start((ctx) => {
  ctx.reply('Welcome to Doma Alerts Bot!');
  console.log(`User chat ID: ${ctx.chat.id}`);
});

provider.on('block', async (blockNumber) => {
  const chatId = process.env.TEST_CHAT_ID;
  await bot.telegram.sendMessage(chatId, `New block mined: ${blockNumber}`);
});

console.log('✅ Bot is running…');
bot.launch();

// README
// To run the bot:
// 1. Copy .env.example to .env and fill in the values
// 2. Run npm install
// 3. Run npm start
