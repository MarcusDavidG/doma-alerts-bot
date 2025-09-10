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
  const subs = loadSubscriptions();
  if (!subs[ctx.chat.id]) {
    subs[ctx.chat.id] = [];
    saveSubscriptions(subs);
  }
  ctx.reply(
    "👋 Welcome to *DomaPulse*!\n\n" +
      "Your real-time alert bot for Doma Protocol events.\n\n" +
      "Stay updated on domain registrations, expirations, and transfers.\n\n" +
      "Use /help to see available commands.\n\n" +
      "🌐 [Learn more about Doma Protocol](https://doma.xyz)",
    { parse_mode: "Markdown" }
  );
  console.log(`User chat ID: ${ctx.chat.id}`);
});

bot.help((ctx) =>
  ctx.reply(
    "📖 *DomaPulse Commands:*\n\n" +
      "/start - Welcome message\n" +
      "/help - Show this help menu\n" +
      "/subscribe <domain> - Subscribe to a domain\n" +
      "/unsubscribe <domain> - Unsubscribe from a domain\n" +
      "/list - Show your subscriptions\n" +
      "/status - Bot status + RPC info\n" +
      "/simulate [domain] - Simulate fake events for a domain (default: test.dom)",
    { parse_mode: "Markdown" }
  )
);

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

bot.command("status", async (ctx) => {
  try {
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    const subs = listSubscriptions(ctx.chat.id);
    const count = subs.length;
    ctx.reply(
      `✅ *DomaPulse is running!*\n\n` +
        `🌐 RPC Chain ID: \`${chainId}\`\n` +
        `📌 Active subscriptions: *${count}*`,
      { parse_mode: "Markdown" }
    );
  } catch (err) {
    console.error("Status error:", err);
    ctx.reply("⚠️ Failed to fetch status. Check RPC connection.");
  }
});

bot.command('simulate', (ctx) => {
  const domain = ctx.message.text.split(' ')[1] || 'test.dom';
  const fakeOwner = '0x1234567890abcdef1234567890abcdef12345678';
  const fakeFrom = '0xabcdef1234567890abcdef1234567890abcdef12';
  const fakeTo = '0x7890abcdef1234567890abcdef1234567890abcd';
  const fakeTxHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

  const events = [
    {
      type: 'Registered',
      msg: `📢 *Domain Registered*  \n🔑 Owner: \`${fakeOwner}\`  \n🌐 Domain: ${domain}  \n⛓️ Tx: [View on Explorer](${explorerUrl}/${fakeTxHash})  \n🌐 [View on Doma Marketplace](https://app.doma.xyz/domain/${domain})  \n🔗 app.doma.xyz/domain/${domain}`
    },
    {
      type: 'Expired',
      msg: `⚠️ *Domain Expired*  \n🌐 Domain: ${domain}  \n⛓️ Tx: [View on Explorer](${explorerUrl}/${fakeTxHash})  \n🌐 [View on Doma Marketplace](https://app.doma.xyz/domain/${domain})  \n🔗 app.doma.xyz/domain/${domain}`
    },
    {
      type: 'Transferred',
      msg: `🔄 *Domain Transferred*  \n🌐 Domain: ${domain}  \n👤 From: \`${fakeFrom}\`  \n👤 To: \`${fakeTo}\`  \n⛓️ Tx: [View on Explorer](${explorerUrl}/${fakeTxHash})  \n🌐 [View on Doma Marketplace](https://app.doma.xyz/domain/${domain})  \n🔗 app.doma.xyz/domain/${domain}`
    }
  ];

  let index = 0;
  const sendNext = () => {
    if (index < events.length) {
      ctx.reply(events[index].msg, { parse_mode: "Markdown" });
      index++;
      setTimeout(sendNext, 4000); // 4 seconds delay
    }
  };
  sendNext();
});

const explorerUrl = "https://explorer-testnet.doma.xyz/tx";

function notifySubscribers(domain, message) {
  const subs = loadSubscriptions();
  for (const [chatId, domains] of Object.entries(subs)) {
    if (domains.includes(domain)) {
      bot.telegram.sendMessage(chatId, message, { parse_mode: "Markdown" });
    }
  }
}

domainManager.on('DomainRegistered', async (name, owner, event) => {
  console.log(`🌐 Domain Registered: ${name} by ${owner}`);
  const msg = `📢 *Domain Registered*  \n🔑 Owner: \`${owner}\`  \n🌐 Domain: ${name}  \n⛓️ Tx: [View on Explorer](${explorerUrl}/${event.transactionHash})  \n🌐 [View on Doma Marketplace](https://app.doma.xyz/domain/${name})  \n🔗 app.doma.xyz/domain/${name}`;
  notifySubscribers(name, msg);
});

domainManager.on('DomainExpired', async (name, event) => {
  console.log(`⚠️ Domain Expired: ${name}`);
  const msg = `⚠️ *Domain Expired*  \n🌐 Domain: ${name}  \n⛓️ Tx: [View on Explorer](${explorerUrl}/${event.transactionHash})  \n🌐 [View on Doma Marketplace](https://app.doma.xyz/domain/${name})  \n🔗 app.doma.xyz/domain/${name}`;
  notifySubscribers(name, msg);
});

domainManager.on('DomainTransferred', async (name, from, to, event) => {
  console.log(`🔄 Domain Transferred: ${name} from ${from} → ${to}`);
  const msg = `🔄 *Domain Transferred*  \n🌐 Domain: ${name}  \n👤 From: \`${from}\`  \n👤 To: \`${to}\`  \n⛓️ Tx: [View on Explorer](${explorerUrl}/${event.transactionHash})  \n🌐 [View on Doma Marketplace](https://app.doma.xyz/domain/${name})  \n🔗 app.doma.xyz/domain/${name}`;
  notifySubscribers(name, msg);
});

console.log('✅ Bot is running…');
bot.launch();

// README
// To run the bot:
// 1. Copy .env.example to .env and fill in the values
// 2. Run npm install
// 3. Run npm start
