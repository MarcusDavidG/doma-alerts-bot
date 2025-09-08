const { Telegraf } = require('telegraf');
const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const provider = new ethers.JsonRpcProvider(process.env.DOMA_RPC_URL);

const DOMAIN_MANAGER_ADDRESS = "0xF6A92E0f8bEa4174297B0219d9d47fEe335f84f8";
const DOMAIN_MANAGER_ABI = [
  "event DomainRegistered(string name, address owner)",
  "event DomainExpired(string name)",
  "event DomainTransferred(string name, address from, address to)"
];

const domainManager = new ethers.Contract(DOMAIN_MANAGER_ADDRESS, DOMAIN_MANAGER_ABI, provider);

const SUBSCRIPTIONS_FILE = './subscriptions.json';

function loadSubscriptions() {
  try {
    const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

function saveSubscriptions(subs) {
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2));
}

function addSubscription(chatId, domain) {
  const subs = loadSubscriptions();
  if (!subs[chatId]) subs[chatId] = [];
  if (!subs[chatId].includes(domain)) subs[chatId].push(domain);
  saveSubscriptions(subs);
}

function removeSubscription(chatId, domain) {
  const subs = loadSubscriptions();
  if (!subs[chatId]) return;
  subs[chatId] = subs[chatId].filter(d => d !== domain);
  saveSubscriptions(subs);
}

function listSubscriptions(chatId) {
  const subs = loadSubscriptions();
  return subs[chatId] || [];
}

bot.start((ctx) => {
  ctx.reply(
    "👋 Welcome to *DomaPulse*!\n\n" +
    "Use /subscribe <domain> to get alerts\n" +
    "Use /unsubscribe <domain> to stop alerts\n" +
    "Use /list to see your subscriptions",
    { parse_mode: "Markdown" }
  );
  console.log(`User chat ID: ${ctx.chat.id}`);
});

bot.command('subscribe', (ctx) => {
  const domain = ctx.message.text.split(' ')[1];
  if (!domain) return ctx.reply('❌ Please provide a domain. Example: /subscribe example.dom');
  addSubscription(ctx.chat.id, domain);
  ctx.reply(`✅ Subscribed to *${domain}*`, { parse_mode: "Markdown" });
});

bot.command('unsubscribe', (ctx) => {
  const domain = ctx.message.text.split(' ')[1];
  if (!domain) return ctx.reply('❌ Please provide a domain. Example: /unsubscribe example.dom');
  removeSubscription(ctx.chat.id, domain);
  ctx.reply(`🚪 Unsubscribed from *${domain}*`, { parse_mode: "Markdown" });
});

bot.command('list', (ctx) => {
  const subs = listSubscriptions(ctx.chat.id);
  if (subs.length === 0) return ctx.reply('📭 You have no subscriptions yet.');
  ctx.reply('📌 Your subscriptions:\n' + subs.map(d => `• ${d}`).join('\n'));
});

provider.on('block', async (blockNumber) => {
  const chatId = process.env.TEST_CHAT_ID;
  await bot.telegram.sendMessage(chatId, `New block mined: ${blockNumber}`);
});

function notifySubscribers(domain, message) {
  const subs = loadSubscriptions();
  for (const [chatId, domains] of Object.entries(subs)) {
    if (domains.includes(domain)) {
      bot.telegram.sendMessage(chatId, message, { parse_mode: "Markdown" });
    }
  }
}

domainManager.on('DomainRegistered', async (name, owner) => {
  console.log(`🌐 Domain Registered: ${name} by ${owner}`);
  notifySubscribers(name, `🌐 *${name}* was just registered by \`${owner}\``);
});

domainManager.on('DomainExpired', async (name) => {
  console.log(`⚠️ Domain Expired: ${name}`);
  notifySubscribers(name, `⚠️ *${name}* has expired!`);
});

domainManager.on('DomainTransferred', async (name, from, to) => {
  console.log(`🔄 Domain Transferred: ${name} from ${from} → ${to}`);
  notifySubscribers(name, `🔄 *${name}* transferred\nFrom: \`${from}\`\nTo: \`${to}\``);
});

console.log('✅ Bot is running…');
bot.launch();

// README
// To run the bot:
// 1. Copy .env.example to .env and fill in the values
// 2. Run npm install
// 3. Run npm start
